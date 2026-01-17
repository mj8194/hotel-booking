import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,           // Clerk user id
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      lowercase: true,
      required: true, // enforce email
      unique: true,
    },
    image: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["user", "hotelOwner"],
      default: "user",
    },
    recentSearchedCities: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true,
    collection: 'users'
  }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User; // ✅ export default
