import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    // 1. Get headers for verification
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ success: false, message: "No svix headers" });
    }

    // 2. Verify Payload
    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt;

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Verification failed:", err.message);
      return res.status(400).json({ success: false, message: "Verification failed" });
    }

    const { data, type } = evt;

    // 3. Handle Events based on your Schema
    switch (type) {
      case "user.created": {
        const userData = {
          clerkId: data.id,
          email: data.email_addresses?.[0]?.email_address,
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        await User.create(userData);
        console.log(`✅ User ${data.id} created in DB`);
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        // Use { clerkId: data.id } to find the right user
        await User.findOneAndUpdate({ clerkId: data.id }, userData);
        console.log(`🔄 User ${data.id} updated in DB`);
        break;
      }

      case "user.deleted": {
        // Match the clerkId field for deletion
        await User.findOneAndDelete({ clerkId: data.id });
        console.log(`🗑️ User ${data.id} deleted from DB`);
        break;
      }

      default:
        break;
    }

    return res.status(200).json({ success: true, message: "Processed" });

  } catch (error) {
    console.error("Webhook Error:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;