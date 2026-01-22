import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    roomType: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    images: [{ type: String }],
    amenities: [{ type: String }],
    isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);
export default Room;
