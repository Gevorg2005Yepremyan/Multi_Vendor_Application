import { Schema, model } from "mongoose";

const InventorySchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true},
    quantity: {type: Number, min: 0},
    reserved: {type: Number, min: 0}
})

export default model("Inventory", InventorySchema);