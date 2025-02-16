const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("./middleware/verifyToken.js");
const cookieParser = require("cookie-parser");

const app = express();
const appointRoute = require("./routes/Appoint.js");
const adminRoute = require("./routes/Admin.js");

const corsOption = {
  origin: "http://localhost:3000",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => {
  return res.json({ mess: "Healthy", status: 200 });
});
app.use("/api/appoint", verifyToken, appointRoute);
app.use("/api/admin", verifyToken, adminRoute);

const prisma = new PrismaClient();

// Start server and create default user
const startServer = async () => {
  await prisma.$connect();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
