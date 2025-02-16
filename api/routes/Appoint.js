const express = require("express");
const router = express.Router();
const prisma = require("../helper/prisma");
axios = require("axios");

async function getUserId(userId) {
  try {
    const res = await axios.get(
      `${process.env.AUTH_SERVICE_URL}/user/${userId}`
    );
    if (res && res.data.status === 200) {
      return res.data;
    } else if (res && res.data.status === 404) {
      return res.data;
    }
  } catch (error) {
    return error;
  }
}

router.get("/test/:userId", async (req, res) => {
  try {
    const result = await getUserId(req.params.userId);

    if (result && result.status === 200) {
      const { user } = result;
      return res.status(200).json({ userId: user.id });
    } else if (result && result.status === 404) {
      return res.status(404).json({ mess: "Not found" });
    }
  } catch (error) {
    return res.status(500).json({ mess: "Internal server error" });
  }
});

router.post("/create", async (req, res) => {
  try {
    const record = await prisma.appointment.create({
      data: {
        userId: req.body.userId,
        date: req.body.date,
        time: req.body.selectedTime,
        location: req.body.location,
        coach: req.body.coach,
        notes: req.body.note,
        course: req.body.course,
        status: "waiting",
      },
    });
    return res.status(201).json(record);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ mess: "Internal server error" });
  }
});

router.delete("/delete", async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: {
        id: parseInt(req.query.appointmentId),
        userId: req.query.userId,
      },
    });
    return res.status(200).json({ mess: "Deleted" });
  } catch (error) {
    return res.status(500).json({ mess: "Internal server error" });
  }
});

router.get("/appointments", async (req, res) => {
  try {
    const userId = req.query.userId;
    const appointmentId = req.query.appointmentId
      ? parseInt(req.query.appointmentId)
      : null;

    if (!userId) {
      return res.status(400).json({ mess: "userId is required" });
    }

    let record;
    if (appointmentId) {
      // Fetch a single appointment
      record = await prisma.appointment.findUnique({
        where: { id: appointmentId, userId },
      });
    } else {
      // Fetch all appointments for the user
      record = await prisma.appointment.findMany({ where: { userId } });
    }

    if (record) {
      return res.status(200).json(record);
    }

    return res.status(404).json({ mess: "Not found" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ mess: "Internal server error" });
  }
});

router.put("/update", async (req, res) => {
  try {
    const record = await prisma.appointment.update({
      where: {
        id: parseInt(req.query.appointmentId),
        userId: req.query.userId,
      },
      data: {
        course: req.body.course,
        date: req.body.date,
        time: req.body.time,
        location: req.body.location,
        coach: req.body.coach,
        notes: req.body.notes,
      },
    });
    return res.status(200).json(record);
  } catch (error) {
    return res.status(500).json({ mess: "Internal server error" });
  }
});

module.exports = router;
