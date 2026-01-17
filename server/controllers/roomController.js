import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";
import { v2 as cloudinary } from "cloudinary";

export async function createRoom(req, res) {
  try {
    const hotel = await Hotel.findOne({ owner: req.userId });
    if (!hotel) return res.status(404).json({ success: false, message: "No hotel found" });

    let images = [];
    if (req.files && req.files.length > 0) {
      images = await Promise.all(
        req.files.map(file => cloudinary.uploader.upload(file.path).then(r => r.secure_url))
      );
    }

    const amenities = req.body.amenities ? JSON.parse(req.body.amenities) : [];

    const room = await Room.create({
      hotel: hotel._id,
      roomType: req.body.roomType,
      pricePerNight: Number(req.body.pricePerNight),
      amenities: amenities,
      images,
    });

    res.json({ success: true, message: "Room created successfully", room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getOwnerRooms(req, res) {
  try {
    const hotel = await Hotel.findOne({ owner: req.userId });
    if (!hotel) return res.status(404).json({ success: false, message: "No hotel found" });

    const rooms = await Room.find({ hotel: hotel._id }).sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function toggleRoomAvailability(req, res) {
  try {
    const { roomId } = req.params;
    const room = await Room.findById(roomId);

    if (!room) return res.status(404).json({ success: false, message: "Room not found" });

    room.isAvailable = !room.isAvailable;
    await room.save();

    res.json({ success: true, message: "Availability updated", isAvailable: room.isAvailable });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getRooms(req, res) {
  try {
    const rooms = await Room.find({ isAvailable: true }).populate("hotel").sort({ createdAt: -1 });
    res.json({ success: true, rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}