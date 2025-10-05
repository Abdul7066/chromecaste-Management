import express from "express";
import QRCode from "qrcode";
import jwt from "jsonwebtoken";

const router = express.Router();

// Middleware to ensure user is authenticated
export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // Attach user data to request
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// Generate QR for a room with user-specific token
router.get("/room/:roomId", authenticateUser, async (req, res) => {
  try {
    const { roomId } = req.params;
    const { user } = req;
    const baseUrl = "https://chromecaste-management.onrender.com/login"; // Changed to HTTP

    // Generate a token specific to this user and room
    const tokenPayload = {
      userId: user.userId || `guest-${roomId}`,
      roomId,
      role: "guest", // Force guest role for QR login
      username: user.username || `Guest-${roomId}`,
      room: roomId, // For GuestView
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1-hour expiration
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET);

    // Create URL with token
    const url = `${baseUrl}?roomId=${roomId}&token=${encodeURIComponent(
      token
    )}`;
    const qrCode = await QRCode.toDataURL(url);

    res.json({ room: roomId, url, qrCode, token });
  } catch (err) {
    console.error("QR Generation Error:", err);
    res.status(500).json({ error: "Failed to generate QR" });
  }
});

export default router;
