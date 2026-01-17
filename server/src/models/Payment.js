import { Schema, model } from "mongoose";

const PaymentSchema = new Schema({
    orderId: {type: Schema.Types.ObjectId, ref: "Order", required: true, index: true},
    amount: {type: Number, required: true},
    method: {type: String, enum:['stripe', 'paypal', 'balance'], default: 'balance'},
    providerData: {type: Schema.Types.Mixed},
    paymentStatus: {type: String, enum: ['pending', 'succeeded', 'failure'], default: 'pending'}
})

export default model('Payment', PaymentSchema);