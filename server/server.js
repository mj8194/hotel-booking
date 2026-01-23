import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import bookingRouter from "./routes/bookingRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import clerkWebhooks from "./controllers/clerkWebhooks.js"; // Clerk webhook
import { stripeWebhook } from "./controllers/bookingController.js";

const app = express();

// Connect DB and Cloudinary
connectDB();
connectCloudinary();

// ---------------------- CORS ----------------------
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "https://sthivra.vercel.app" // Production frontend
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ---------------------- Webhooks ----------------------
// Stripe webhook (raw body)
app.post(
  "/api/bookings/stripe-webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhook
);

// Clerk webhook (raw body)
app.post(
  "/api/clerk-webhook",
  bodyParser.raw({ type: "application/json" }),
  clerkWebhooks
);

// ---------------------- Body parsers ----------------------
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ---------------------- Clerk Middleware ----------------------
app.use(clerkMiddleware());

// ---------------------- API Routes ----------------------
app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/messages", messageRouter);

// ---------------------- Global Error Handler ----------------------
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

// ---------------------- Start Server ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
