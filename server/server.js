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

// ===== ENV CHECK =====
const REQUIRED_ENV = [
  "CLERK_SECRET_KEY",
  "CLERK_PUBLISHABLE_KEY",
  "MONGODB_URI",
  "CLERK_WEBHOOK_SECRET"
];

REQUIRED_ENV.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ CRITICAL ERROR: ${key} is missing`);
  }
});

// ===== INIT SERVICES (safe for serverless) =====
connectDB();
connectCloudinary();

const app = express();

// ===== CORS CONFIG =====
const allowedOrigins = [
  "http://localhost:5173",
  "https://sthivra.vercel.app",
  "https://sthivra-frontend.vercel.app"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, webhooks
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        "http://localhost:5173",
        "https://sthivra.vercel.app"
      ];
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Explicit preflight handling

// ===== CLERK WEBHOOK (RAW BODY REQUIRED) =====
app.post(
  "/api/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhooks
);

// ===== BODY PARSER =====
app.use(express.json());

// ===== CLERK AUTH =====
app.use(clerkMiddleware());

// ===== ROUTES =====
app.use("/api/messages", messageRouter);
app.use("/api/user", userRouter);
app.use("/api/hotels", hotelRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/bookings", bookingRouter);

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.send("Sthivra API is running correctly");
});

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route not found"
  });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.url}:`, err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ✅ IMPORTANT FOR VERCEL
export default app;
