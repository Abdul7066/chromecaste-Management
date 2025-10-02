import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Chromecast from "../models/Chromecast.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/qr-login", async (req, res) => {
  const { token, room, mac } = req.body;
  try {
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.role !== "guest") {
        return res.status(403).json({ error: "Invalid role for QR login" });
      }
      // Validate room exists
      const device = await Chromecast.findOne({ "tags.RN": payload.roomId });
      if (!device) {
        return res.status(404).json({ error: "Room not found" });
      }
      // Generate session token
      const sessionToken = jwt.sign(
        {
          userId: payload.userId,
          roomId: payload.roomId,
          role: "guest",
          room: payload.roomId,
          username: payload.username,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token: sessionToken });
    } else if (room && mac) {
      const device = await Chromecast.findOne({ mac, "tags.RN": room });
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      const sessionToken = jwt.sign(
        {
          userId: `guest-${room}`,
          roomId: room,
          role: "guest",
          room,
          username: `Guest-${room}`,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      res.json({ token: sessionToken });
    } else {
      res.status(400).json({ error: "Invalid input" });
    }
  } catch (error) {
    console.error("QR Login Error:", error);
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, role: user.role, room: user.assignedRoom, username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );
    res.json({ token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/register-admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existing = await User.findOne({ username });
    if (existing)
      return res.status(400).json({ error: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const admin = await User.create({
      username,
      password: hashed,
      role: "admin",
    });

    res.status(201).json({ message: "Admin created", admin });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
