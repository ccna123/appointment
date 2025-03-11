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

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const labConfigs = {
  1: {
    name: "lab-1",
    s3Key: "lab1.yaml",
    check: async (namespace) => {
      const { stdout } = await execAsync(
        `kubectl get pods -n ${namespace} -l type=lab -o json`
      );
      const pods = JSON.parse(stdout);
      return pods.items.every((pod) => pod.status.phase === "Running");
    },
  },
};

// Function to fetch manifest from S3
const fetchManifestFromS3 = async (s3Key) => {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: s3Key,
  });
  try {
    const response = await s3Client.send(command);
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () =>
          resolve(Buffer.concat(chunks).toString("utf-8"))
        );
      });
    return await streamToString(response.Body);
  } catch (error) {
    throw new Error(`Failed to fetch manifest from S3: ${error.message}`);
  }
};

app.post("/playground/start", async (req, res) => {
  const { labId } = req.body;
  const lab = labConfigs[parseInt(labId)];
  if (!lab) return res.status(400).send("Invalid lab ID");

  const instanceId = Math.random().toString(36).substring(2, 15);
  const namespace = `${lab.name.toLowerCase().replace(" ", "-")}-${instanceId}`;

  try {
    console.log(`Creating namespace ${namespace}`);
    const { stdout: nsStdout, stderr: nsStderr } = await execAsync(
      `kubectl create namespace ${namespace}`
    );
    console.log("Namespace stdout:", nsStdout);
    if (nsStderr) console.error("Namespace stderr:", nsStderr);
    console.log(`Namespace ${namespace} created`);

    // Fetch and apply lab manifest from S3
    const labManifestTemplate = await fetchManifestFromS3(lab.s3Key);
    const labManifest = labManifestTemplate.replace(/NAMESPACE/g, namespace);
    console.log("Lab manifest content:", labManifest);

    const tmpDir = path.join(__dirname, "tmp");
    await fs.mkdir(tmpDir, { recursive: true });
    const labTempFile = path.join(tmpDir, `lab-manifest-${instanceId}.yaml`);
    await fs.writeFile(labTempFile, labManifest);
    console.log(`Wrote manifest to ${labTempFile}`);

    const { stdout: labStdout, stderr: labStderr } = await execAsync(
      `kubectl apply -f ${labTempFile}`
    );
    console.log("Lab manifest stdout:", labStdout || "empty");
    console.log("Lab manifest stderr:", labStderr || "none");

    await fs.unlink(labTempFile);
    console.log(`Cleaned up ${labTempFile}`);

    if (!labStdout && labStderr) {
      throw new Error(`Lab manifest application failed: ${labStderr}`);
    }
    if (
      !labStdout ||
      (!labStdout.includes("created") && !labStdout.includes("configured"))
    ) {
      throw new Error(
        "Lab manifest applied but no resources were created or modified"
      );
    }
    console.log("Lab manifest applied successfully");

    // Generate kubeconfig for the lab namespace
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
    user: lab-terminal-user
  name: lab-context
current-context: lab-context
kind: Config
preferences: {}
users:
- name: lab-terminal-user
  user:
    token: ${process.env.SA_TOKEN || ""}
    `;
    const kubeconfigFile = path.join(tmpDir, `kubeconfig-${instanceId}`);
    await fs.writeFile(kubeconfigFile, kubeconfig);
    console.log(`Wrote kubeconfig to ${kubeconfigFile}`);

    // Get the terminal pod name using the label selector from the Deployment
    const labelSelector = `app=playground-instance-service`; // Match Helm values
    const { stdout: podStdout } = await execAsync(
      `kubectl get pods -n default -l ${labelSelector} -o jsonpath='{.items[0].metadata.name}'`
    );
    const terminalPodName = podStdout.trim().replace(/'/g, ""); // Remove any surrounding quotes
    if (!terminalPodName) {
      throw new Error(
        "No terminal pod found with the specified label selector"
      );
    }
    console.log(`Found terminal pod: ${terminalPodName}`);

    // Copy kubeconfig to the terminal pod
    await execAsync(
      `kubectl cp ${kubeconfigFile} ${terminalPodName}:/root/.kube/config -n default`
    );
    await fs.unlink(kubeconfigFile);
    console.log(`Copied kubeconfig to ${terminalPodName} in default namespace`);

    const serviceUrl = `${process.env.SERVICE_URL || "http://localhost"}:7681`;
    console.log(`Lab started successfully: ${serviceUrl}`);
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
