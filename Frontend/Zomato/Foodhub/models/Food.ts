import mongoose, { Schema, Model, Document } from "mongoose";

export interface FoodDocument extends Document {
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  image: string;
}

const FoodSchema = new Schema<FoodDocument>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    rating: { type: Number, required: true, default: 0 },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

const Food: Model<FoodDocument> =
  (mongoose.models.Food as Model<FoodDocument>) ||
  mongoose.model<FoodDocument>("Food", FoodSchema);

export default Food;


