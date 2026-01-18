import { Schema, model } from "mongoose";

const VendorSchema = new Schema({
    userId: {type:Schema.Types.ObjectId, ref: "User", required: true, unique: true},
    companyName: {type: String, required: true},
    description: {type: String},
    verified: {type: Boolean, default: false}
});

export default model("Vendor", VendorSchema);