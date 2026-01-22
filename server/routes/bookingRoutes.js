import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    checkAvailabilityAPI,
    createBooking,
    getUserBookings,
    getBookingDetails,
    cancelBooking,
    getHotelBookings,
    stripePayment,
    verifyManualPayment,
    stripeWebhook
} from "../controllers/bookingController.js";


const router = express.Router();

router.post("/check-availability", checkAvailabilityAPI);
router.post("/book", protect, createBooking);
router.get("/user-bookings", protect, getUserBookings);
router.get("/details/:bookingId", protect, getBookingDetails);

// Cancellation Route
router.patch("/cancel/:bookingId", protect, cancelBooking);

router.post("/stripe-payment", protect, stripePayment);
router.post("/verify-payment", protect, verifyManualPayment);
router.post("/stripe-webhook", express.raw({ type: 'application/json' }), stripeWebhook);
router.get("/hotel-records", protect, getHotelBookings);

export default router;