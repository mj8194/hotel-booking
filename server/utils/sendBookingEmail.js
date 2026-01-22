import transporter from "../configs/mailer.js";

export const sendBookingConfirmationEmail = async (user, booking) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: "Booking Confirmed – Payment Successful",
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>Booking Confirmed</h2>
        <p>Hello ${user.username},</p>
        <p>Your payment has been successfully received.</p>
        <h3>Booking Details</h3>
        <ul>
          <li><b>Hotel:</b> ${booking.hotel.name}</li>
          <li><b>Room:</b> ${booking.room.roomType}</li>
          <li><b>Check-in:</b> ${new Date(booking.checkInDate).toDateString()}</li>
          <li><b>Check-out:</b> ${new Date(booking.checkOutDate).toDateString()}</li>
          <li><b>Total Paid:</b> $${booking.totalPrice}</li>
        </ul>
        <p>Thank you for booking with us.</p>
      </div>
    `,
  });
};

export const sendRefundInitiatedEmail = async (user, booking) => {
  await transporter.sendMail({
    from: process.env.SENDER_EMAIL,
    to: user.email,
    subject: "Refund Initiated – Reservation Cancelled",
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #d32f2f;">Refund Processed</h2>
        <p>Hello ${user.username},</p>
        <p>Your reservation at <b>${booking.hotel.name}</b> has been successfully cancelled.</p>
        <p>A refund of <b>$${booking.totalPrice}</b> has been initiated to your original payment method.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px;">
          <p style="margin: 0;"><b>Booking Ref:</b> ${booking.bookingReference || booking._id}</p>
          <p style="margin: 0;"><b>Status:</b> ${booking.paymentStatus}</p>
        </div>
        <p>Please allow <b>5-10 business days</b> for the funds to appear in your account.</p>
        <p>If you have any questions, feel free to contact our support team.</p>
      </div>
    `,
  });
};