import express from "express";
import {
  createRoom,
  getRooms,
  getOwnerRooms,
  toggleRoomAvailability,
  checkAvailabilityAPI,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public
router.get("/", getRooms);

// Owner
router.get("/owner", protect, getOwnerRooms);

// CREATE ROOM (FIXED)
router.post(
  "/",
  protect,
  upload.array("images", 4),
  (err, req, res, next) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }
    next();
  },
  createRoom
);

router.patch("/:roomId/toggle", protect, toggleRoomAvailability);
router.post("/check", checkAvailabilityAPI);

export default router;
