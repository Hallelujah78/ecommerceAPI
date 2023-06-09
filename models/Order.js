const mongoose = require("mongoose");

const SingleOrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: { type: mongoose.Schema.ObjectId, required: true, ref: "Product" },
});

const OrderSchema = new mongoose.Schema(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: { type: Number, required: true },
    subtotal: { type: Number, required: true },

    total: { type: Number, required: true },

    orderItems: [SingleOrderItemSchema],

    status: {
      type: String,
      enum: ["failed", "pending", "paid", "delivered", "cancelled"],
      default: "pending",
    },

    user: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    clientSecret: { type: String, required: true },
    paymentId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
