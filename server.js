import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import chromecastRoutes from "./routes/chromecast.js";
import sessionRoutes from "./routes/session.js";
import qrRoutes from "./routes/qr.js";

dotenv.config();
const app = express();

app.use(express.json());
const allowedOrigins = [
  "*",
  "https://68dff84ca63bfd072d5dbf0b--chromecaste.netlify.app",
  "https://chromecaste.netlify.app", // your production Netlify domain
  "http://localhost:3000" // for local testing
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // if you are using cookies or auth headers
  })
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use("/api/auth", authRoutes);
app.use("/api/chromecasts", chromecastRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api", qrRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
