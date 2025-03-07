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

app.get("/playground", (req, res) => {
  exec("kubectl get services -o json", (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(`Error: ${error.message}`);
    }
    if (stderr) {
      return res.status(500).send(`Stderr: ${stderr}`);
    }

    const services = JSON.parse(stdout);

    const playgroundService = services.items
      .filter((service) =>
        service.metadata.name.includes("playground-instance")
      )
      .map((service) => {
        // Return the service URL (adjust as necessary for your service type)
        const serviceUrl = `${process.env.SERVICE_URL}:7681`;
        return { serviceUrl: serviceUrl, name: service.metadata.name };
      });

    res.json(playgroundService);
  });
});

app.listen("4030", () => {
  console.log("Playground service listen on port 4030");
});
