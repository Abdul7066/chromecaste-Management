import mongoose from "mongoose";

const chromecastSchema = new mongoose.Schema({
  mac: { type: String, required: true, unique: true },
  tags: {
    type: { type: String, default: "CC" },
    RN: { type: String, required: true }, // Room Number
  },
  url: { type: String, default: "hdmi://1" },
});

export default mongoose.model("Chromecast", chromecastSchema);
