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
import messageRouter from "./routes/messageRoutes.js"; // Add this

// 1. Strict Environment Check
// Newer Clerk SDKs require both Secret and Publishable keys for full functionality
const REQUIRED_ENV = ["CLERK_SECRET_KEY", "CLERK_PUBLISHABLE_KEY", "MONGODB_URI"];
REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ CRITICAL ERROR: ${key} is missing in .env`);
  }
});

// Connect Database and Cloudinary
connectDB();
connectCloudinary();

const app = express();

// --- Middleware Configuration ---

// Enable CORS with credentials for Clerk session cookies
app.use(cors({ 
  origin: process.env.CLIENT_URL || "http://localhost:5173", 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Add this explicitly 
}));

/** * IMPORTANT: The Clerk Webhook must come BEFORE express.json() 
 * It needs the raw body to verify the Svix signature.
 */
app.post("/api/clerk", express.raw({ type: "application/json" }), clerkWebhooks);

// Standard JSON parsing for all other routes
app.use(express.json());

/**
 * Clerk Middleware
 * This populates req.auth with session data for every request.
 */
app.use(clerkMiddleware());

// --- Routes ---
app.use("/api/messages", messageRouter); // Add this line
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);
// Health check and root route
app.get("/", (req, res) => res.send("Sthivra API is running correctly"));

// --- Error Handling ---

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "API Route not found" });
});

// Global internal error handler
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
  console.log(`📡 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  
  if (process.env.CLERK_SECRET_KEY) {
    console.log("✅ Clerk authentication middleware is active");
  }
});