const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const appointRoute = require("./routes/Appoint.js");
const userRoute = require("./routes/User.js");
const adminRoute = require("./routes/Admin.js");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.set("Content-Type", "text/plain");
  res.status(200).send("Server Healthy");
});
app.use("/appoint", appointRoute);
app.use("/user", userRoute);
app.use("/admin", adminRoute);

app.listen(4000, () => {
  console.log("Listening port 4000");
});
