import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";

import bookingRouter from "./routes/bookingRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

import { stripeWebhook } from "./controllers/bookingController.js"; // <-- add this

const app = express();
connectDB();
connectCloudinary();

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));

// Stripe Webhook (raw body) MUST come before express.json
app.post(
  "/api/bookings/stripe-webhook",
  express.raw({ type: "application/json" }), 
  stripeWebhook
);

// Body parsers for normal routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Clerk auth middleware
app.use(clerkMiddleware());

// API routes
app.use("/api/user", userRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/messages", messageRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;