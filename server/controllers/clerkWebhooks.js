import User from "../models/User.js";
import { Webhook } from "svix";

const clerkWebhooks = async (req, res) => {
  try {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env");
    }

    // 1. Get the headers from Svix
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ success: false, message: "Error occured -- no svix headers" });
    }

    // 2. Get the raw body as a string
    const payload = req.body.toString();
    const wh = new Webhook(WEBHOOK_SECRET);

    let evt;

    // 3. Verify the payload with the headers
    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Error verifying webhook:", err.message);
      return res.status(400).json({ success: false, message: "Verification failed" });
    }

    // 4. Extract data and type from the verified event
    const { data, type } = evt;

    // 5. Handle the webhook events
    switch (type) {
      case "user.created": {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address,
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        await User.create(userData);
        console.log(`User ${data.id} created`);
        break;
      }

      case "user.updated": {
        const userData = {
          email: data.email_addresses?.[0]?.email_address,
          username: `${data.first_name || ""} ${data.last_name || ""}`.trim(),
          image: data.image_url,
        };
        // Use _id because that's where we stored the Clerk ID during creation
        await User.findByIdAndUpdate(data.id, userData);
        console.log(`User ${data.id} updated`);
        break;
      }

      case "user.deleted": {
        // Use _id to match the record
        await User.findByIdAndDelete(data.id);
        console.log(`User ${data.id} deleted`);
        break;
      }

      default:
        console.log(`Unhandled webhook type: ${type}`);
        break;
    }

    // Always respond with a 200/json to Clerk
    res.status(200).json({ success: true, message: "Webhook processed" });

  } catch (error) {
    console.log("Webhook Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export default clerkWebhooks;