const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const orderSchema = require("./model/orderSchema");
const enrollSchema = require("./model/enrollSchema");
const axios = require("axios");
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

    const existingRecord = await enrollSchema.findOne({
      userId: userId,
      "course.courseId": products[0].courseId,
    });

    if (existingRecord) {
      return res.status(409).json({ mess: "You already taken this course" });
    }
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.title,
          images: [product.imageUrl],
        },
        unit_amount: product.price * 100,
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
      courseId: products[0].courseId,
      name,
      email,
      paymentStatus: "Unpaid",
    });

    return res.status(200).send(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
});

app.get("/payment/success", async (req, res) => {
  try {
    const { userId } = req.query;
    const orderInfo = await orderSchema.findOne({
      userId,
      paymentStatus: "Unpaid",
    });

    if (!orderInfo) {
      return res.status(404).json({ mess: "Not found unpaid order" });
    }

    const sessionDetail = await stripe.checkout.sessions.retrieve(
      orderInfo.sessionId
    );

    if (sessionDetail.payment_status === "paid") {
      const order = await orderSchema.findOne({
        userId: orderInfo.userId,
        paymentStatus: "Unpaid",
      });

      if (order) {
        order.paymentStatus = sessionDetail.payment_status;
        await order.save();
      }

      const course = await axios.get(
        `${process.env.COURSE_SERVICE_URL}/get/${orderInfo.courseId}`
      );
      console.log(course);

      const newRecord = await enrollSchema.create({
        userId,
        course: course.data,
      });

      const paymentIntent = await stripe.paymentIntents.retrieve(
        sessionDetail.payment_intent
      );

      const charge = await stripe.charges.retrieve(paymentIntent.latest_charge);
      return res.status(200).json(charge);
    }
    return res.status(200).send();
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json(error);
  }
});

app.delete("/payment/cancel", async (req, res) => {
  try {
    const { userId } = req.query;
    const orders = await orderSchema.find({
      userId,
      paymentStatus: "Unpaid",
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No unpaid orders found" });
    }

    // Delete all unpaid orders
    const result = await orderSchema.deleteMany({
      userId,
      paymentStatus: "Unpaid",
    });

    if (result.deletedCount === 0) {
      return res.status(500).json({ message: "Failed to delete orders" });
    }

    return res.status(200).json({ message: "Order successfully canceled" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/payment/receipt", async (req, res) => {
  try {
    const { userId } = req.query;

    const records = await orderSchema.find({
      userId,
    });

    if (records.length === 0) {
      return res.status(404).send();
    }

    const sessionIds = records.map((record) => {
      return record.sessionId;
    });

    const paymentIntents = await Promise.all(
      sessionIds.map(async (sessionId) => {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        return session.payment_intent
          ? await stripe.paymentIntents.retrieve(session.payment_intent)
          : null;
      })
    );

    const latestCharges = await Promise.all(
      paymentIntents.map(async (paymentIntent) => {
        if (!paymentIntent.latest_charge) return null;

        return await stripe.charges.retrieve(paymentIntent.latest_charge);
      })
    );

    const receipt_urls = latestCharges.map((latestCharge) => {
      return latestCharge.receipt_url;
    });

    return res.status(200).json(receipt_urls);
  } catch (error) {
    return res.status(500).json(error);
    console.error(error);
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Payment service listen on port ${process.env.PORT}`);
});
