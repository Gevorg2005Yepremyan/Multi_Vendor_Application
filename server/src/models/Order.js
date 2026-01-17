import { Schema, model } from "mongoose";

const OrderItemSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true, unique: true},
    title: {type: String, required: true},
    unitPrice: {type: Number, default: 0},
    quantity: {type: Number, default: 0},
}, {_id: false})

const OrderSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User", required: true, index: true},
    storeId: {type: Schema.Types.ObjectId, ref: "Store", required: true, index: true},
    items: [OrderItemSchema],
    totalAmount: {type: Number, required: true},
    currency: {type: String, enum:['AMD','RUB','USD','EUR','JPY','CAD','CNH','AUD','NZD','ARS'], default: "AMD"},
    status: {type: String, enum:['pending','paid','shipped','cancelled'], default:'pending'}
})

export default model("Order", OrderSchema);
export const OrderItem = model("OrderItem", OrderItemSchema);