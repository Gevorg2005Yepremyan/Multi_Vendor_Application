import { Schema, model } from "mongoose";

const RoleSchema = new Schema({
    name: {type: String, required: true, unique: true, enum:["vendor","user","customer","admin"], default: "user"}
}, {timestamps: false});

export default model("Role", RoleSchema);