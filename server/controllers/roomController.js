import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

// Create Room




export async function createRoom(req, res) {
  try {
    // USE req.userId (set by your protect middleware)
    const hotel = await Hotel.findOne({ owner: req.userId });
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "No hotel found. Please register a hotel first.",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required",
      });
    }

    const uploadedImages = [];
    // Upload images to Cloudinary
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "hotel_rooms",
      });
      uploadedImages.push(result.secure_url);
    }

    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];

    const room = await Room.create({
      hotel: hotel._id,
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      amenities,
      images: uploadedImages,
    });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      room,
    });
  } catch (err) {
    console.error("Create Room Error:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Room creation failed",
    });
  }
}

// ... rest of your controller functions remain the same


// Get all rooms (for public view)
// Get all rooms (for public view)
export const getRooms = async (req, res) => {
  try {
    // FIX: Populate 'address' and 'city' so the frontend can display them
    const rooms = await Room.find({})
      .populate("hotel", "name location address city"); 
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get rooms for the logged-in hotel owner
export async function getOwnerRooms(req, res) {
  try {
    const hotel = await Hotel.findOne({ owner: req.userId });
    if (!hotel) return res.status(404).json({ success: false, message: "No hotel found" });

    const rooms = await Room.find({ hotel: hotel._id }).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Toggle room availability
export async function toggleRoomAvailability(req, res) {
  try {
    const { roomId } = req.params;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Optional: check ownership before toggling
    const hotel = await Hotel.findOne({ _id: room.hotel, owner: req.userId });
    if (!hotel) return res.status(403).json({ success: false, message: "Not authorized to update this room" });

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.json({ success: true, message: "Availability updated", isAvailable: room.isAvailable });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

// Check availability for booking
export const checkAvailabilityAPI = async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    // Placeholder logic: expand later to check against actual bookings
    res.json({ success: true, available: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
