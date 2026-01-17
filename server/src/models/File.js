import { Schema, model } from "mongoose";

const FileSchema = new Schema({
    ownerType: {type: String, enum: ['product', 'user', 'vendor']},
    ownerId: {type: Schema.Types.ObjectId, ref: 'User'},
    url: {type: String, required: true},
    mime: {type: String},
    size: {type: Number}
})

export default model("File", FileSchema);