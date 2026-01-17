import express from "express";
import { protect, adminProtect } from "../middleware/authMiddleware.js";
import {
  checkAvailabilityAPI,
  createBooking,
  getUserBookings,
  getHotelBookings,
  cancelBooking,
  getBookingDetails
} from "../controllers/bookingController.js";

const router = express.Router();

/**
 * PUBLIC ROUTES
 * No authentication required to check if a room is free
 */
router.post("/check-availability", checkAvailabilityAPI);

/**
 * USER PROTECTED ROUTES
 * Requires 'protect' middleware to populate req.userId
 */

// Create a new reservation
router.post("/book", protect, createBooking); 

// Get all bookings for the logged-in user
router.get("/user-bookings", protect, getUserBookings);

// Get specific details for a single booking
router.get("/details/:bookingId", protect, getBookingDetails);

// Cancel a booking (using PATCH as we are only updating the status field)
router.patch("/cancel/:bookingId", protect, cancelBooking);

/**
 * ADMIN / HOTELIER ROUTES
 * Requires both authentication and specialized role permissions
 */

// View all bookings related to the hotel owned by the user
router.get("/hotel-records", protect, adminProtect, getHotelBookings);
export default router;