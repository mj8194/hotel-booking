import { createClerkClient } from '@clerk/backend';
import User from '../models/User.js';

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export const protect = async (req, res, next) => {
    try {
        const { userId: clerkId } = req.auth;
        if (!clerkId) return res.status(401).json({ success: false, message: "Authentication required" });

        let user = await User.findOne({ clerkId });
        if (!user) {
            const clerkUser = await clerkClient.users.getUser(clerkId);
            const email = clerkUser.emailAddresses?.[0]?.emailAddress;

            user = await User.findOneAndUpdate(
                { email },
                { 
                    clerkId, 
                    username: clerkUser.username || clerkUser.firstName || "User", 
                    image: clerkUser.imageUrl,
                    role: "user" // default
                },
                { upsert: true, new: true }
            );
        }

        req.user = user;
        req.userId = user._id;
        next();
    } catch (err) {
        console.error("Auth Error:", err);
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};

export const adminProtect = async (req, res, next) => {
    const authorized = ['hotelOwner','hotelier','admin'].includes(req.user?.role);
    if (!authorized) return res.status(403).json({ success: false, message: "Access denied. Owner status required." });
    next();
};