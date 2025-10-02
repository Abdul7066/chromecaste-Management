import express from "express";
import Session from "../models/Session.js";
import Chromecast from "../models/Chromecast.js";
import { authenticateUser } from "./qr.js";

const router = express.Router();

// Start Session
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { mac } = req.body;
    const { user } = req;
    const device = await Chromecast.findOne({ mac, "tags.RN": user.room });
    if (!device) {
      return res
        .status(404)
        .json({ error: "Device not found or not authorized" });
    }
    const session = new Session({
      userId: user.userId,
      room: user.room,
      chromecastMac: mac,
    });
    await session.save();
    res.json(session);
  } catch (error) {
    console.error("Start Session Error:", error);
    res.status(500).json({ error: "Failed to start session" });
  }
});

// End Session
router.delete("/", authenticateUser, async (req, res) => {
  try {
    await Session.updateOne(
      { userId: req.user.userId, room: req.user.room, active: true },
      { active: false }
    );
    res.json({ message: "Session ended" });
  } catch (error) {
    console.error("End Session Error:", error);
    res.status(500).json({ error: "Failed to end session" });
  }
});

// Get All Sessions (Admin)
router.get("/", authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    const sessions = await Session.find();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

export default router;
