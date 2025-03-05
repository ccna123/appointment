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

app.post("/playground/container/spawn", (req, res) => {
  const containerName = `playground-${Date.now()}`;
  const port = Math.floor(30000 + Math.random() * 1000); // Dynamic port allocation

  // Run a container (e.g., Jupyter Notebook, Code Server)
  const command = `docker run --name ${containerName} -d -p ${port}:7681 alpine:latest sh -c "apk add --no-cache ttyd && ttyd --writable --client-option cursorBlink=true --client-option fontSize=18 -p 7681 sh"`;

  exec(command, (error, stdout) => {
    if (error) {
      console.error("Error spawning container:", error);
      return res.status(500).json({ error: "Failed to start container" });
    }

    // Generate a URL for the container
    const containerUrl = `${process.env.CONTAINER_URL}:${port}`;
    res.json({ url: containerUrl, containerName: containerName });
  });
});

app.delete("/playground/container/delete", async (req, res) => {
  exec(`docker rm -f ${req.body.containerName}`, (error, stdout) => {
    if (error) {
      console.error("Error deleting container:", error);
      return res.status(500).json({ error: "Failed to delete container" });
    }
  });
  res.json({ message: "Container deleted successfully" });
});
app.listen("4030", () => {
  console.log("Playground service listen on port 4030");
});
