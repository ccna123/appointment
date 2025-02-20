const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  userId: { type: String, required: true },
  sessionId: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  products: [
    {
      courseId: { type: String, required: true },
      id: { type: Number, required: true },
      paymentStatus: { type: Boolean, required: true },
      userId: { type: String, required: true },
      course: [
        {
          enrolled: { type: Number, required: true },
          image: { type: String, required: false },
          imageUrl: { type: String, required: false },
          length: { type: Number, required: true },
          price: { type: Number, required: true },
          title: { type: String, required: true },
        },
      ],
    },
  ],
});
module.exports = mongoose.model("Order", orderSchema);
