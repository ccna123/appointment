const express = require("express")
const router  = express.Router()
const prisma = require("../helper/prisma")

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

module.exports = router