const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    paymentStatus: { type: String, required: true },
  },
  { collection: "orders" }
);
module.exports = mongoose.model("Order", orderSchema);
