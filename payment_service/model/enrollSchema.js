const mongoose = require("mongoose");

const enrollSchema = mongoose.Schema({
  userId: { type: String, required: true },
  course: {
    courseId: { type: String, required: false },
    enrolled: { type: Number, required: true },
    image: { type: String, required: false },
    imageUrl: { type: String, required: false },
    length: { type: Number, required: true },
    price: { type: Number, required: true },
    title: { type: String, required: true },
    paymentStatus: { type: String, required: true },
  },
});
module.exports = mongoose.model("Enroll", enrollSchema);
