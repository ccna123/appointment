const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
require("dotenv").config();

const corsOption = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

const app = express();
app.use(cors(corsOption));
app.use(express.json());

app.get("/pods", (req, res) => {
  exec("kubectl get pods -o json", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${error.message}`);
    }
    if (stderr) {
      return res.status(500).send(`Stderr: ${stderr}`);
    }
    const pods = JSON.parse(stdout);
    const alpinePods = pods.items
      .filter((pod) => pod.metadata.name.includes("alpine"))
      .map((pod) => pod.metadata.name);

    res.json(alpinePods);
  });
});

app.listen("4030", () => {
  console.log("Playground service listen on port 4030");
});
