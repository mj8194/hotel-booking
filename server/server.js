import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware } from "@clerk/express";
import clerkWebhooks from "./controllers/clerkWebhooks.js";

import userRouter from "./routes/userRoutes.js";
import hotelRouter from "./routes/hotelRoutes.js";
import roomRouter from "./routes/roomRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import messageRouter from "./routes/messageRoutes.js";

// Strict Environment Check for Vercel stability
const REQUIRED_ENV = ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY", "MONGODB_URI", "CLERK_WEBHOOK_SECRET"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ CRITICAL ERROR: ${key} is missing in .env`);
  }
});

connectDB();
connectCloudinary();

const app = express();

// Enable CORS
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] 
}));

/** * VERCEL WEBHOOK HANDLING:
 * The Clerk Webhook must use express.raw to verify the Svix signature.
 * It MUST be placed before app.use(express.json()).
 */
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Standard JSON parsing for all other routes
app.use(express.json());

// Clerk Middleware
app.use(clerkMiddleware());

// Routes
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

app.get("/", (req, res) => res.send("Sthivra API is running correctly"));

// Error Handling
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);
  res.status(statusCode).json({ 
    success: false, 
    message: err.message || "Internal Server Error" 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});