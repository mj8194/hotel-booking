import Message from "../models/Message.js";

export const createMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message stored successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Message save error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
