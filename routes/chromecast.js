import express from "express";
import Chromecast from "../models/Chromecast.js";
import { authenticateUser } from "./qr.js";

const router = express.Router();

// Get all Chromecasts (Admin)
router.get("/", authenticateUser, async (req, res) => {
  try {
    const chromecasts = await Chromecast.find();
    res.json(chromecasts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch devices" });
  }
});

// Add Chromecast (Admin)
router.post("/", authenticateUser, async (req, res) => {
  try {
    const { mac, tags, url } = req.body;
    const chromecast = new Chromecast({ mac, tags, url });
    await chromecast.save();
    res.json(chromecast);
  } catch (error) {
    res.status(500).json({ error: "Failed to add device" });
  }
});

// Delete Chromecast (Admin)
router.delete("/:mac", authenticateUser, async (req, res) => {
  try {
    await Chromecast.deleteOne({ mac: req.params.mac });
    res.json({ message: "Device deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete device" });
  }
});

// Get Chromecast for user's room (Guest)
router.get("/my-chromecast", authenticateUser, async (req, res) => {
  try {
    const device = await Chromecast.findOne({ "tags.RN": req.user.room });
    if (!device) {
      return res
        .status(404)
        .json({ error: "No Chromecast found for your room" });
    }
    res.json(device);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch device" });
  }
});

export default router;
