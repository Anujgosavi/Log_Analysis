import mongoose, { Schema, Model, Document } from "mongoose";

interface OrderItem {
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  quantity: number;
}

export interface OrderDocument extends Document {
  items: OrderItem[];
  total: number;
  status: "pending" | "confirmed" | "delivered";
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const OrderSchema = new Schema<OrderDocument>(
  {
    items: { type: [OrderItemSchema], required: true },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "delivered"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Order: Model<OrderDocument> =
  (mongoose.models.Order as Model<OrderDocument>) ||
  mongoose.model<OrderDocument>("Order", OrderSchema);

export default Order;


