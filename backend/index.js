const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const verifyToken = require("./middleware/verifyToken.js")

const app = express();
const appointRoute = require("./routes/Appoint.js");
const userRoute = require("./routes/User.js");
const adminRoute = require("./routes/Admin.js");
app.use(cors());
app.use(express.json());

app.get("/health", verifyToken, (req, res) => {
  return res.json({ mess: "Healthy", status: 200 });
});
app.use("/appoint", appointRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

const prisma = new PrismaClient();

async function createDefaultUser() {
  const defaultEmail = "admin@abc.com"; // Use a unique email for your default user
  const defaultUser = await prisma.user.findUnique({
    where: { email: defaultEmail },
  });

  if (!defaultUser) {
    await prisma.user.create({
      data: {
        userName: "admin",
        email: defaultEmail,
        password: "123", // Ensure to hash passwords in a real app
        role: "admin",
      },
    });
    console.log("admin created");
  } else {
    console.log("admin already exists");
  }
}

// Start server and create default user
const startServer = async () => {
  await prisma.$connect();
  await createDefaultUser();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((e) => {
  console.error(e);
  process.exit(1);
});
