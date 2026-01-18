import { Schema, model } from "mongoose";

const ReviewSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: "Product", index: true},
    userId: {type:Schema.Types.ObjectId, ref: "User", required: true, unique: true},
    rating: {type: Number, min: 0, max: 5},
    title: {type: String, required: true},
    description: {type: String}
});

export default model("Review", ReviewSchema);