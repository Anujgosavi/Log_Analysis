import mongoose, { Schema, models, model } from "mongoose";

const OrderSchema = new Schema(
  {
    customerName: { type: String, required: true },
    items: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
      },
    ],
    totalAmount: { type: Number, required: true },
    address: { type: String, required: true },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

// ✅ Use mongoose.models to prevent overwrite errors in dev
const Order1 = models.Order1 || model("Order1", OrderSchema);

export default Order1;
