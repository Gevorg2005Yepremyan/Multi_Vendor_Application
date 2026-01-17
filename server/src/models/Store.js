import { Schema, model } from "mongoose";

const StoreSchema = new Schema({
    vendorId: {type: Schema.Types.ObjectId, ref: "Vendor", required: true, unique: true},
    name: {type: String, required: true},
    slug: {type:String, required: true},
    description: {type: String},
})

export default model("Store", StoreSchema);