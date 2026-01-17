import { createClerkClient } from '@clerk/backend';
import { getAuth } from '@clerk/express';
import User from '../models/User.js';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const protect = async (req, res, next) => {
  try {
    const { userId: clerkId } = getAuth(req);
    if (!clerkId) return res.status(401).json({ success: false, message: "Not authenticated" });

    let user = await User.findOne({ clerkId });

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkId);
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) return res.status(400).json({ success: false, message: "Email required" });

      user = await User.findOne({ email });
      if (user) {
        user.clerkId = clerkId;
        await user.save();
      } else {
        user = await User.create({
          clerkId: clerkUser.id,
          username: clerkUser.username || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User",
          email,
          image: clerkUser.imageUrl || clerkUser.profileImageUrl || "",
          role: "user",
        });
      }
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Authentication Error" });
  }
};

export const adminProtect = async (req, res, next) => {
  // Check for all possible owner roles
  const allowedRoles = ['admin', 'hotelier', 'hotelOwner'];
  
  if (req.user && allowedRoles.includes(req.user.role)) {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied. Your role: ${req.user?.role}. Required: hotelOwner` 
    });
  }
};