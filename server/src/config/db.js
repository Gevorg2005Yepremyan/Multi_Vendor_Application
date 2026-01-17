import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGO_URL);
    console.log("Mongo Connected!");
  } catch (err) {
    console.error("Mongo connection error: " + err);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log("Mongo Disconnected!");
  } catch (err) {
    console.error("Mongo disconnect error: " + err);
  }
};
