const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");
axios = require("axios");

router.get("/get", async (req, res) => {
  try {
    const records = await prisma.appointment.findMany();
    const user_subs = records.map((record) => record.userId).join(",");

    const user_info = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/user/info`,
      {
        params: {
          user_sub: user_subs,
        },
      }
    );

    const response = records.map((record) => {
      const user = user_info.data.find((user) => user.sub === record.userId);
      return { ...record, userName: user ? user.name : "" };
    });

    return res.status(200).send(response);
  } catch (error) {
    console.error(error);
  }
});

router.put("/update/status", async (req, res) => {
  try {
    const record = await prisma.appointment.update({
      where: {
        id: req.body.appointId,
        userId: req.body.userId,
      },
      data: {
        status: "confirmed",
      },
    });
    return res.status(200).send(record);
  } catch (error) {
    console.log(error);
  }
});

router.post("/search", async (req, res) => {
  try {
    const { keyword } = req.body;
    const record = await prisma.appointment.findMany({
      where: {
        OR: [
          { location: { contains: keyword } },
          { coach: { contains: keyword } },
          { date: { contains: keyword } },
          { time: { contains: keyword } },
          { status: { contains: keyword } },
        ],
      },
    });
    return res.status(200).send(record);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
