const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const { promisify } = require("util");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();
const fs = require("fs").promises;
const path = require("path");

const execAsync = promisify(exec);
const corsOption = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

const app = express();
app.use(cors(corsOption));
app.use(express.json());

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Lab configurations (just IDs and S3 keys)
const labConfigs = {
  1: { name: "lab-1", s3Key: "lab-1.yaml" },
  2: { name: "lab-2", s3Key: "lab-2.yaml" },
  3: { name: "lab-3", s3Key: "lab-3.yaml" },
  // Add all 10 labs
};

// Fetch YAML from S3
const fetchManifestFromS3 = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  });
  const response = await s3Client.send(command);
  return new Promise((resolve, reject) => {
    const chunks = [];
    response.Body.on("data", (chunk) => chunks.push(chunk));
    response.Body.on("error", reject);
    response.Body.on("end", () =>
      resolve(Buffer.concat(chunks).toString("utf-8"))
    );
  });
};

app.post("/playground/start", async (req, res) => {
  const { labId } = req.body;
  const lab = labConfigs[parseInt(labId)];
  if (!lab) return res.status(400).send("Invalid lab ID");

  const instanceId = Math.random().toString(36).substring(2, 15);
  const namespace = `${lab.name}-${instanceId}`;

  try {
    // Create namespace
    await execAsync(`kubectl create namespace ${namespace}`);
    console.log(`Namespace ${namespace} created`);

    // Fetch and customize YAML
    const yamlTemplate = await fetchManifestFromS3(lab.s3Key);
    const yamlContent = yamlTemplate.replace(/NAMESPACE/g, namespace);
    const tmpDir = path.join(__dirname, "tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    const yamlFile = path.join(tmpDir, `${lab.name}-${instanceId}.yaml`);
    await fs.writeFile(yamlFile, yamlContent);

    // Apply YAML
    await execAsync(`kubectl apply -f ${yamlFile}`);
    await fs.unlink(yamlFile);
    console.log(`Lab ${lab.name} deployed to ${namespace}`);

    // Get Service Account token
    const { stdout: tokenStdout } = await execAsync(
      `kubectl get secret -n ${namespace} -o jsonpath='{.items[?(@.metadata.annotations.kubernetes\\.io/service-account\\.name=="lab-user")].data.token}' | base64 -d`
    );
    const saToken = tokenStdout.trim();
    if (!saToken) throw new Error("Failed to retrieve SA token");

    // Generate and copy kubeconfig
    const kubeconfig = `
apiVersion: v1
clusters:
- cluster:
    server: ${process.env.K8S_SERVER || "https://kubernetes.default.svc"}
    certificate-authority-data: ${process.env.K8S_CA_DATA || ""}
  name: lab-cluster
contexts:
- context:
    cluster: lab-cluster
    namespace: ${namespace}
    user: lab-user
  name: lab-context
current-context: lab-context
kind: Config
users:
- name: lab-user
  user:
    token: ${saToken}
    `;
    const kubeconfigFile = path.join(tmpDir, `kubeconfig-${instanceId}`);
    await fs.writeFile(kubeconfigFile, kubeconfig);

    const labelSelector = `app=playground-instance-service`;
    const { stdout: podStdout } = await execAsync(
      `kubectl get pods -n default -l ${labelSelector} -o jsonpath='{.items[0].metadata.name}'`
    );
    const terminalPodName = podStdout.trim().replace(/'/g, "");
    if (!terminalPodName) throw new Error("No terminal pod found");
    await execAsync(
      `kubectl cp ${kubeconfigFile} ${terminalPodName}:/root/.kube/config -n default`
    );
    await fs.unlink(kubeconfigFile);
    console.log(`Kubeconfig copied to ${terminalPodName}`);

    const serviceUrl = `${
      process.env.TTYD_SERVICE_URL || "http://localhost"
    }:7681`;
    res.json({ instanceId, serviceUrl, namespace });
  } catch (error) {
    console.error("Error starting lab:", error);
    try {
      await execAsync(`kubectl delete namespace ${namespace} --timeout=10s`);
      console.log(`Cleanup: Namespace ${namespace} deleted`);
    } catch (cleanupError) {
      console.error("Cleanup failed:", cleanupError);
    }
    res.status(500).send(`Error starting lab: ${error.message}`);
  }
});

app.listen(4030, () => {
  console.log("Playground service listening on port 4030");
});
