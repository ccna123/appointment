const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("./middleware/verifyToken.js")

const app = express();
const appointRoute = require("./routes/Appoint.js");
const userRoute = require("./routes/User.js");
const adminRoute = require("./routes/Admin.js");
const authRoute = require("./routes/Auth.js");
const cookieParser = require("cookie-parser");

const corsOption = {
  origin: 'http://localhost:3000',
  credentials: true,
}
app.use(cors(corsOption));
app.use(express.json());
app.use(cookieParser())

app.get("/health", (req, res) => {
  return res.json({ mess: "Healthy", status: 200 });
});
app.use("/appoint", verifyToken, appointRoute);
app.use("/user", verifyToken, userRoute);
app.use("/admin", verifyToken, adminRoute);
app.use("/auth", authRoute);

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
