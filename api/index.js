const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
// const verifyToken = require("./middleware/verifyToken.js");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const app = express();
// const appointRoute = require("./routes/Appoint.js");
// const adminRoute = require("./routes/Admin.js");
const enrollRoute = require("./routes/Enroll.js");

const corsOption = {
  origin: "http://localhost:3000",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected successfully 🚀"))
  .catch((err) => console.error("MongoDB connection error:", err));
mongoose.connection.on("connected", () => {
  console.log("Mongoose connection established");
});

app.get("/api/health", (req, res) => {
  return res.json({ mess: "Healthy", status: 200 });
});
// app.use("/api/appoint", verifyToken, appointRoute);
// app.use("/api/admin", verifyToken, adminRoute);
app.use("/api/course", enrollRoute);

const prisma = new PrismaClient();

// Start server and create default user
const startServer = async () => {
  // await prisma.$connect();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
