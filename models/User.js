// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["admin", "guest"], default: "guest" },
  assignedRoom: { type: String }, // Guests only
}, { timestamps: true });

export default mongoose.model("User", UserSchema);
