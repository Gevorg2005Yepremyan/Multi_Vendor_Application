import { Schema, model } from "mongoose";

const ActivitySchema = new Schema({
    type: {type: String, required: true},
    payload: {type: Schema.Types.Mixed},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
})

export default model("Activity", ActivitySchema)