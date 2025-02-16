// testConnection.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Attempt to connect to the database
    await prisma.$connect();
    console.log("Connection to database successful.");

    // Perform a simple database query (e.g., find all users)
    const users = await prisma.user.findMany();
    console.log("Users:", users);
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    // Close the database connection
    await prisma.$disconnect();
    console.log("Disconnected from database.");
  }
}

testConnection();
