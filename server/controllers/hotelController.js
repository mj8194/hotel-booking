import Hotel from "../models/Hotel.js";
import User from "../models/User.js";

// CREATE HOTEL
export async function createHotel(req, res) {
  try {
    const { name, address, city, contact, pricePerNight } = req.body;

    // This ID is set by your protect middleware
    const ownerId = req.userId;

    if (!ownerId) {
      return res.status(401).json({ success: false, message: "Not authenticated" });
    }

    // Validate input
    if (!name || !address || !city || !contact || !pricePerNight) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Check if user already owns a hotel
    const existingHotel = await Hotel.findOne({ owner: ownerId });
    if (existingHotel) {
      return res.status(400).json({ success: false, message: "You have already registered a hotel" });
    }

    // Create hotel
    const hotel = await Hotel.create({
      name,
      address,
      city,
      contact,
      pricePerNight: Number(pricePerNight),
      owner: ownerId,
    });

    // Update user role to hotelOwner
    await User.findByIdAndUpdate(ownerId, { role: "hotelOwner" });

    console.log("✅ Hotel saved successfully:", hotel._id);

    return res.status(201).json({
      success: true,
      message: "Hotel registered successfully",
      hotel,
    });
  } catch (error) {
    console.error("❌ Create hotel error:", error.message);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

// GET ALL HOTELS
export async function getHotels(req, res) {
  try {
    const hotels = await Hotel.find()
      .populate("owner", "email role")
      .sort({ createdAt: -1 });

    return res.json({ success: true, hotels });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch hotels" });
  }
}