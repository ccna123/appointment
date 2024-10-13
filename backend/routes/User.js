const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");

router.post("/login", async (req, res) => {
  try {
    const record = await prisma.user.findFirst({
      where: {
        email: req.body.email,
        password: req.body.password,
      },
    });
    if (record) {
      return res.json({ mess: "Logged in", user: record, status: 200 });
    } else {
      return res.json({ mess: "Invalid credentials", status: 401 });
    }
  } catch (error) {
    console.log(error);
  }
});
router.post("/signup", async (req, res) => {
  try {
    const record = await prisma.user.findFirst({
      where: {
        email: req.body.email,
      },
    });
    if (record) {
      return res.json({
        mess: "User already exists",
        user: record,
        status: 409,
      });
    }

    const newUser = await prisma.user.create({
      data: {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
      },
    });

    return res.status(201).json({
      mess: "User registered successfully",
      user: newUser,
      status: 201,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      mess: "Internal server error",
      status: 500,
    });
  }
});

module.exports = router;
