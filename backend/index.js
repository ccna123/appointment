const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { graphqlHTTP } = require("express-graphql");

const app = express();
const prisma = new PrismaClient();
require("dotenv").config();
app.use(cors());
app.use(express.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: require("./graphql/schema"),
    graphiql: process.env.NODE_ENV === "development",
    context: {
      prisma,
    },
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/login", async (req, res) => {
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

app.post("/make_appoint", async (req, res) => {
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

app.get("/get_appoint", async (req, res) => {
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

app.get("/get_all_appointments", async (req, res) => {
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

app.delete("/delete_appoint", async (req, res) => {
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

app.get("/get_single_appointment", async (req, res) => {
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

app.put("/update_single_appointment", async (req, res) => {
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

//update status

app.put("/update_status", async (req, res) => {
  try {
    const record = await prisma.appointment.update({
      where: {
        id: req.body.itemId,
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

app.listen(4000, () => {
  console.log("Listening port 4000");
});
