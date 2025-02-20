const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const orderSchema = require("./model/orderSchema");
const enrollSchema = require("./model/enrollSchema");

const app = express();

const corsOption = {
  origin: "http://localhost:3000",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOption));

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected successfully 🚀"))
  .catch((err) => console.error("MongoDB connection error:", err));
mongoose.connection.on("connected", () => {
  console.log("Mongoose connection established");
});

mongoose.connection.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose connection disconnected");
});

app.post("/payment/checkout", async (req, res) => {
  try {
    const { products, userId, name, email } = req.body;

    const existingRecord = await orderSchema.findOne({
      userId: userId,
    });

    if (existingRecord) {
      return res.status(409).send();
    }

    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.course.title,
          images: [product.course.imageUrl],
        },
        unit_amount: product.course.price * 100,
      },
      quantity: 1,
    }));
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: "http://localhost:3000/payment/success",
      cancel_url: "http://localhost:3000/payment/cancel",
    });

    await orderSchema.create({
      userId,
      sessionId: session.id,
      name,
      email,
      paymentStatus: "Unpaid",
    });
    return res.status(200).send(session);
  } catch (error) {
    console.log(error);
  }
});

app.get("/payment/detail/", async (req, res) => {
  try {
    const { userId } = req.query;
    const orderInfo = await orderSchema.findOne({
      userId,
    });

    if (!orderInfo) {
      return res.status(404).json({ mess: "Not found order" });
    }

    const sessionDetail = await stripe.checkout.sessions.retrieve(
      orderInfo.sessionId
    );

    if (sessionDetail.payment_status === "paid") {
      const order = await orderSchema.findOne({
        userId: orderInfo.userId,
      });

      if (order) {
        order.paymentStatus = sessionDetail.payment_status;
        await order.save();
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(
        sessionDetail.payment_intent
      );

      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      return res.status(200).json(charge);
    }
    return res.status(200).send();
  } catch (error) {
    console.error("Error fetching payment intent:", error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Payment service listen on port ${process.env.PORT}`);
});
