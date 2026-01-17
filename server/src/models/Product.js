import { Schema, model } from "mongoose";

const ProductSchema = new Schema({
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    sku: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    currency: {type: String, enum:['AMD','RUB','USD','EUR','JPY','CAD','CNH','AUD','NZD','ARS'], default: 'AMD'},
    images: [{ type: String }],
    isActive: { type: Boolean, default: true }
});
ProductSchema.index({ storeId: 1, sku: 1 }, { unique: true });

export default model("Product", ProductSchema);