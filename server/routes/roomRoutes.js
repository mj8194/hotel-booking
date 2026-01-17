import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createRoom,
  getRooms,
  getOwnerRooms,
  toggleRoomAvailability
} from "../controllers/roomController.js";

const roomRouter = express.Router();

// Route to create a room
roomRouter.post("/", protect, upload.array("images", 4), createRoom);

// Route to get all rooms (Public)
roomRouter.get("/", getRooms);

// Route to get rooms for a specific owner
roomRouter.get("/owner", protect, getOwnerRooms);

// FIXED: Changed to .patch and updated path to match frontend: /api/rooms/:roomId/availability
roomRouter.patch("/:roomId/availability", protect, toggleRoomAvailability);

export default roomRouter;