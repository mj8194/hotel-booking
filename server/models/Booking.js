import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
    checkInDate: { type: Date, required: true },
    checkOutDate: { type: Date, required: true },
    guests: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number, required: true },
    // --- NEW FIELDS ---
    offerApplied: { type: Boolean, default: false },
    appliedDiscount: { type: Number, default: 0 }, 
    // ------------------
    status: { 
        type: String, 
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'], 
        default: 'Confirmed' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Unpaid', 'Paid', 'Refunded'], 
        default: 'Unpaid' 
    },
    bookingReference: { 
        type: String, 
        unique: true,
        default: () => `BK-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    }
}, { timestamps: true });

const Booking = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
export default Booking;