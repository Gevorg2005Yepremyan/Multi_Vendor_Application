import { Schema, model } from "mongoose";

const UserSchema = new Schema({
    name: {type: String, required: true},
    surname: {type: String, required: true},
    age: {type: Number, required: true},
    email: {type: String, required: true, unique: true, index: true},
    username: {type: String, required: true, unique: true},
    password: {type: String, required: true, minLength: [8, "Your password is too short"]},
    role: {type: Schema.Types.ObjectId, ref: "Role"},
    isActive: {type: Boolean, default: false},
    tokenVersion: {type: Number, default: 0},
    resetPasswordToken: {type: String, default: null},
    resetPasswordExpires: {type: Date, default: null},
    profile: {
        phone: String,
        avatarUrl: String,
        bio: String
    }
});


export default model("User", UserSchema);