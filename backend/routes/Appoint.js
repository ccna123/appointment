const express = require("express")
const router = express.Router()
const prisma = require("../helper/prisma");

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
    return res.status(201).send(record);
  } catch (error) {
    console.log(error);
  }
});

router.delete("/delete", async (req, res) => {
  try {
    await prisma.appointment.delete({
      where: {
        id: parseInt(req.query.id),
        userId: req.query.userId,
      },
    });
    return res.status(200).json({ mess: "Deleted" });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getSingleAppoint", async (req, res) => {
  try {
    const record = await prisma.appointment.findUnique({
      where: {
        id: parseInt(req.query.id),
        userId: req.query.userId,
      },
    });
    if (record) {
      return res.status(200).send(record);
    }
    return res.status(404).json({ mess: "Not found " });
  } catch (error) {
    console.log(error);
  }
});

router.get("/getAllAppoint", async (req, res) => {
  try {
    const record = await prisma.appointment.findMany({
      where: {
        userId: req.query.userId,
      },
    });
    if (record) {
      return res.status(200).send(record);
    }
    return res.status(404).json({ mess: "Not found " });
  } catch (error) {
    console.log(error);
  }
});

router.put("/update", async (req, res) => {
  try {
    const record = await prisma.appointment.update({
      where: {
        id: parseInt(req.query.id),
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
    return res.status(200).send(record);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router