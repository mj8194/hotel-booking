import Booking from "../models/Booking.js";
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";
import User from "../models/User.js";
import Stripe from "stripe";
import { sendBookingConfirmationEmail, sendRefundInitiatedEmail } from "../utils/sendBookingEmail.js";
// Check if room is occupied
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const isRoomOccupied = async (roomId, checkIn, checkOut) => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const overlapping = await Booking.find({
        room: roomId,
        status: { $ne: "Cancelled" },
        $and: [
            { checkInDate: { $lt: end } },
            { checkOutDate: { $gt: start } },
        ],
    });
    return overlapping.length > 0;
};
// PUBLIC: Check room availability
export const checkAvailabilityAPI = async (req,res) => {
    try {
        const { room, checkInDate, checkOutDate } = req.body;
        if (!room || !checkInDate || !checkOutDate) return res.status(400).json({ success: false, message: "Missing required fields" });
        const occupied = await isRoomOccupied(room, checkInDate, checkOutDate);
        res.json({ success: true, isAvailable: !occupied });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// Create Booking
export const createBooking = async (req,res) => {
    try {
        const { room, checkInDate, checkOutDate, guests, appliedDiscount=0 } = req.body;
        const roomData = await Room.findById(room).populate("hotel");
        if (!roomData) return res.status(404).json({ success:false, message:"Room not found" });

        if(await isRoomOccupied(room,checkInDate,checkOutDate)) return res.status(400).json({ success:false, message:"Room already booked" });

        const nights = Math.ceil((new Date(checkOutDate)-new Date(checkInDate))/(1000*60*60*24)) || 1;
        let pricePerNight = roomData.pricePerNight;
        if(appliedDiscount>0) pricePerNight = Math.round(pricePerNight*(1-appliedDiscount/100));

        const booking = await Booking.create({
            user: req.userId,
            room: roomData._id,
            hotel: roomData.hotel._id,
            guests,
            checkInDate,
            checkOutDate,
            totalPrice: pricePerNight*nights,
            offerApplied: appliedDiscount>0,
            appliedDiscount,
            status:"Confirmed",
            paymentStatus:"Unpaid"
        });

        res.status(201).json({ success:true, booking, message:"Booking created" });
    } catch(err){ res.status(500).json({ success:false, message: err.message }); }
};

// Get user bookings
export const getUserBookings = async (req,res) => {
    try{
        const bookings = await Booking.find({ user:req.userId }).populate("room hotel").sort({createdAt:-1});
        res.json({ success:true, bookings });
    } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};

// Get single booking details
export const getBookingDetails = async (req,res) => {
    try{
        const booking = await Booking.findOne({_id:req.params.bookingId, user:req.userId}).populate("room hotel");
        if(!booking) return res.status(404).json({success:false,message:"Booking not found"});
        res.json({success:true, booking});
    } catch(err){ res.status(500).json({success:false,message:err.message}); }
};

// Cancel booking
// ... existing imports ...



// ... keep all other existing controller functions (stripePayment, verifyManualPayment, etc.) ...

// Hotel owner dashboard
export const getHotelBookings = async (req,res) => {
    try{
        const { range="all" } = req.query;
        const hotels = await Hotel.find({ owner:req.userId });
        if(!hotels || hotels.length===0) return res.status(404).json({ success:false, message:"No hotel found." });
        const hotelIds = hotels.map(h=>h._id);

        let dateQuery = { hotel: { $in: hotelIds } };
        if(range!=="all"){
            const startDate = new Date(); startDate.setHours(0,0,0,0);
            if(range==="7days") startDate.setDate(startDate.getDate()-7);
            if(range==="30days") startDate.setDate(startDate.getDate()-30);
            dateQuery.createdAt = { $gte: startDate };
        }

        const bookings = await Booking.find(dateQuery).populate("room","roomType").populate("user","username email").sort({createdAt:-1});
        const totalCount = bookings.length;
        const confirmedCount = bookings.filter(b=>b.status!=="Cancelled").length;
        const cancelledCount = totalCount-confirmedCount;
        const totalRevenue = bookings.filter(b=>b.status!=="Cancelled").reduce((acc,curr)=>acc+curr.totalPrice,0);
        const confirmedRate = totalCount>0?((confirmedCount/totalCount)*100).toFixed(1):0;
        const cancelledRate = totalCount>0?((cancelledCount/totalCount)*100).toFixed(1):0;

        res.json({ success:true, dashboardData:{ bookings, totalBookings:totalCount, totalRevenue, stats:{confirmedRate,cancelledRate} } });
    } catch(err){ res.status(500).json({ success:false, message:err.message }); }
};
export const cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.userId }).populate("user room hotel");
        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
        if (booking.status === "Cancelled") return res.status(400).json({ success: false, message: "Already cancelled" });

        const wasPaid = booking.paymentStatus === "Paid";

        if (wasPaid && booking.stripePaymentIntentId) {
            try {
                await stripe.refunds.create({ payment_intent: booking.stripePaymentIntentId });
                booking.paymentStatus = "Refunded";
            } catch (refundError) {
                console.error("Refund error:", refundError.message);
                booking.paymentStatus = "Refund Initiated";
            }
        }

        booking.status = "Cancelled";
        await booking.save();

        if (wasPaid) await sendRefundInitiatedEmail(booking.user, booking);

        res.json({ success: true, message: "Booking cancelled successfully", booking });
    } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
// Stripe payment
export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate("room hotel");

        if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [{
                price_data: {
                    currency: "usd",
                    product_data: { name: `${booking.hotel?.name} - ${booking.room?.roomType}` },
                    unit_amount: Math.round(booking.totalPrice * 100), // Stripe uses cents
                },
                quantity: 1
            }],
            mode: "payment",
            success_url: `${req.get('origin')}/my-bookings?success=true&bookingId=${bookingId}`,
            cancel_url: `${req.get('origin')}/my-bookings?canceled=true`,
            metadata: { bookingId: booking._id.toString() }
        });

        res.json({ success: true, url: session.url });
    } catch (err) {
        console.error("Stripe Session Error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};
export const verifyManualPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate("user")
      .populate("room hotel");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.paymentStatus !== "Paid") {
      booking.paymentStatus = "Paid";
      await booking.save();

      await sendBookingConfirmationEmail(booking.user, booking);
    }

    res.json({ success: true, message: "Payment verified successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stripe webhook for automatic payment verification
export const stripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const bookingId = session.metadata.bookingId;
        const booking = await Booking.findById(bookingId).populate("user room hotel");

        if (booking && booking.paymentStatus !== "Paid") {
            booking.paymentStatus = "Paid";
            booking.stripePaymentIntentId = session.payment_intent;
            await booking.save();
            await sendBookingConfirmationEmail(booking.user, booking);
        }
    }
    res.json({ received: true });
};