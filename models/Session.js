import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  room: { type: String, required: true },
  chromecastMac: { type: String, required: true },
  startedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true },
});

export default mongoose.model("Session", sessionSchema);
