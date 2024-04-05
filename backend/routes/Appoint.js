const express = require("express")
const router = express.Router()

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
  
  router.get("/get_appoint", async (req, res) => {
    try {
      const record = await prisma.appointment.findMany({
        where: {
          userId: parseInt(req.query.userId),
        },
        include: {
          user: true,
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
  
  router.get("/all", async (req, res) => {
    try {
      const records = await prisma.appointment.findMany({
        include: {
          user: true,
        },
      });
      if (records) {
        return res.status(200).send(records);
      }
      return res.status(404).json({ mess: "Not found " });
    } catch (error) {
      console.log(error);
    }
  });
  
  router.delete("/delete", async (req, res) => {
    try {
      const record = await prisma.appointment.delete({
        where: {
          id: parseInt(req.query.id),
          userId: parseInt(req.query.userId),
        },
      });
      return res.status(200).json({ mess: "Deleted" });
    } catch (error) {
      console.log(error);
    }
  });
  
  router.get("/get_single_appointment", async (req, res) => {
    try {
      const record = await prisma.appointment.findUnique({
        where: {
          id: parseInt(req.query.id),
          userId: parseInt(req.query.userId),
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
          userId: parseInt(req.query.userId),
        },
        data: {
          course: req.body.course,
          date: req.body.date,
          time: req.body.time,
          location: req.body.location,
          coach: req.body.coach,
          notes: req.body.note,
        },
      });
      return res.status(200).send(record);
    } catch (error) {
      console.log(error);
    }
  });

  module.exports = router