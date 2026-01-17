import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import transporter from "../configs/nodemailer.js";

/**
 * HELPER: Logic to detect if a room is already booked.
 */
const isRoomOccupied = async (roomId, checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const overlappingBookings = await Booking.find({
        room: roomId,
        status: { $ne: 'Cancelled' },
        $and: [
            { checkInDate: { $lt: end } },
            { checkOutDate: { $gt: start } }
        ]
    });
    return overlappingBookings.length > 0;
};

/**
 * API: Public availability check
 */
export async function checkAvailabilityAPI(req, res) {
    try {
        const { room, checkInDate, checkOutDate } = req.body;

        if (!room || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: "Missing required dates or room ID" });
        }

        const occupied = await isRoomOccupied(room, checkInDate, checkOutDate);
        return res.json({ success: true, isAvailable: !occupied });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * API: Create a new booking
 */
/**
 * API: Create a new booking (Updated to handle discounts)
 */
export async function createBooking(req, res) {
    try {
        const { room, checkInDate, checkOutDate, guests, appliedDiscount } = req.body;

        if (!room || !checkInDate || !checkOutDate || !guests) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const roomData = await Room.findById(room).populate({ path: 'hotel', model: Hotel });
        if (!roomData) return res.status(404).json({ success: false, message: "Room not found" });

        const occupied = await isRoomOccupied(room, checkInDate, checkOutDate);
        if (occupied) return res.status(400).json({ success: false, message: "Room is already booked" });

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const nights = Math.ceil(Math.abs(checkOut - checkIn) / (1000 * 60 * 60 * 24)) || 1;
        
        let finalPricePerNight = roomData.pricePerNight;
        let isDiscounted = false;

        // Only apply if appliedDiscount is a valid number greater than 0
        if (appliedDiscount && Number(appliedDiscount) > 0) {
            finalPricePerNight = Math.round(roomData.pricePerNight * (1 - appliedDiscount / 100));
            isDiscounted = true;
        }

        const totalPrice = finalPricePerNight * nights;

        const booking = await Booking.create({
            user: req.userId,
            room: roomData._id,
            hotel: roomData.hotel._id,
            guests,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            totalPrice,
            offerApplied: isDiscounted, // Saved to DB
            appliedDiscount: isDiscounted ? appliedDiscount : 0,
            status: 'Confirmed',
            paymentStatus: 'Unpaid'
        });

        return res.status(201).json({ success: true, booking, message: "Booking confirmed successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

/**
 * API: Fetch bookings for the logged-in user
 */
export async function getUserBookings(req, res) {
    try {
        const bookings = await Booking.find({ user: req.userId })
            .populate({ path: 'room', model: Room })
            .populate({ path: 'hotel', model: Hotel })
            .sort({ createdAt: -1 });

        return res.json({ success: true, bookings });
    } catch (error) {
        console.error("Fetch User Bookings Error:", error);
        return res.status(500).json({ success: false, message: "Error fetching bookings" });
    }
}

/**
 * API: Get specific details for one booking
 */
export async function getBookingDetails(req, res) {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findOne({ _id: bookingId, user: req.userId })
            .populate({ path: 'room', model: Room })
            .populate({ path: 'hotel', model: Hotel });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }
        return res.json({ success: true, booking });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * API: Cancel a booking
 */
export async function cancelBooking(req, res) {
    try {
        const { bookingId } = req.params;
        const booking = await Booking.findOne({ _id: bookingId, user: req.userId });

        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found or unauthorized" });
        }

        booking.status = 'Cancelled';
        await booking.save();

        return res.json({ success: true, message: "Booking successfully cancelled" });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
}

/**
 * API: Admin/Hotelier view of all bookings + Dashboard Stats
 */
export async function getHotelBookings(req, res) {
    try {
        const { range = 'all' } = req.query;
        const hotel = await Hotel.findOne({ owner: req.userId });
        
        if (!hotel) return res.status(404).json({ success: false, message: "No hotel found." });

        let dateQuery = { hotel: hotel._id };

        if (range !== 'all') {
            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);

            if (range === '7days') {
                startDate.setDate(startDate.getDate() - 7);
            } else if (range === '30days') {
                startDate.setDate(startDate.getDate() - 30);
            }
            dateQuery.createdAt = { $gte: startDate };
        }

        const bookings = await Booking.find(dateQuery)
            .populate({ path: 'room', model: Room, select: 'roomType' })
            .populate({ path: 'user', model: User, select: 'username email' })
            .sort({ createdAt: -1 });

        // Calculate Stats Logic
        const totalCount = bookings.length;
        const confirmedCount = bookings.filter(b => b.status !== 'Cancelled').length;
        const cancelledCount = totalCount - confirmedCount;

        const confirmedRate = totalCount > 0 ? ((confirmedCount / totalCount) * 100).toFixed(1) : 0;
        const cancelledRate = totalCount > 0 ? ((cancelledCount / totalCount) * 100).toFixed(1) : 0;

        const totalRevenue = bookings
            .filter(b => b.status !== 'Cancelled')
            .reduce((acc, curr) => acc + curr.totalPrice, 0);

        return res.json({ 
            success: true, 
            dashboardData: {
                bookings,
                totalBookings: totalCount,
                totalRevenue,
                stats: { confirmedRate, cancelledRate }
            }
        });
    } catch (error) {
        console.error("Dashboard Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
export const stripePayment = async (req, res)=>{
    try{
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId);
        const roomData = await Room.findById(booking.room).popuplate('hotel');
        const totalPrice = booking.totalPrice;
        const { origin } = req.headers;
        
    }
    catch (error){

    }
}