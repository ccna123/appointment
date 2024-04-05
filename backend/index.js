const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { graphqlHTTP } = require("express-graphql");
require("dotenv").config();

const app = express();
const prisma = new PrismaClient();
const appointRoute = require('./routes/Appoint.js')
const userRoute = require('./routes/User.js')
app.use(cors());
app.use(express.json());
app.use("/appoint", appointRoute)
app.use("/user", userRoute)

// app.use(
//   "/graphql",
//   graphqlHTTP({
//     schema: require("./graphql/schema"),
//     graphiql: process.env.NODE_ENV === "development",
//     context: {
//       prisma,
//     },
//   })
// );



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
