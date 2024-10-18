const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");

router.post("/login", async (req, res) => {
  try {

    const user = await prisma.user.findUnique({
      where: {
        id: req.body.userId
      }
    })
    if (!user) {
      await prisma.user.create({
        data: {
          id: req.body.userId,
          userName: req.body.userName,
          role: req.body.userRole,
        },
      });
      return res.status(200).json({
        message: "Success"
      })
    }
    return res.status(200).json({
      message: "User already exists"
    })
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
