import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Contact() {
  const { api, toast } = useAppContext();

  // State Management
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  // Input Handler
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sending data to backend: /api/messages/contact
      const { data } = await api.post("/api/messages/contact", form);

      if (data.success) {
        setSubmitted(true);
        toast.success("Message sent successfully!");
        
        // Reset form fields
        setForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });

        // Hide success message and show form again after 4 seconds
        setTimeout(() => setSubmitted(false), 4000);
      }
    } catch (error) {
      console.error("Contact Form Error:", error);
      toast.error(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center px-4 md:px-10 py-20">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
        
        {/* --- LEFT CONTENT SECTION --- */}
        <div>
          <span className="inline-block text-sm font-medium text-indigo-600 bg-indigo-100 px-4 py-1 rounded-full mb-5">
            Contact Support
          </span>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            We’re Here <br /> When Things Go Sideways
          </h1>

          <p className="mt-6 text-gray-500 max-w-md">
            Booking issues, payment confusion, hotel questions.  
            Send a message and a human will actually read it.
          </p>

          <div className="mt-10 space-y-4">
            <p className="text-gray-500 flex items-center gap-3">
              <span className="font-bold text-gray-900">Email:</span>
              <span className="text-indigo-600 font-medium">support@hotelbooking.com</span>
            </p>
            <p className="text-gray-500 flex items-center gap-3">
              <span className="font-bold text-gray-900">Hours:</span>
              <span>24/7 Priority Support</span>
            </p>
          </div>
        </div>

        {/* --- RIGHT FORM SECTION --- */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-10 border border-gray-100 min-h-125 flex flex-col justify-center">
          
          {/* Success Overlay */}
          {submitted && (
            <div className="absolute inset-0 bg-white rounded-3xl z-10 flex flex-col items-center justify-center text-center animate-fade px-6">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Message Received!</h3>
              <p className="text-gray-500 mt-2">
                Thank you for reaching out. We'll get back to you via email within 24 hours.
              </p>
            </div>
          )}

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className={`space-y-6 transition-opacity duration-300 ${submitted ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <div className="grid md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder=" "
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="peer w-full border border-gray-200 rounded-xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all pointer-events-none">
                  Full Name
                </label>
              </div>

              {/* Email Address */}
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder=" "
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="peer w-full border border-gray-200 rounded-xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all pointer-events-none">
                  Email Address
                </label>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Phone Number */}
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  placeholder=" "
                  value={form.phone}
                  onChange={handleChange}
                  className="peer w-full border border-gray-200 rounded-xl px-4 pt-6 pb-2 focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
                />
                <label className="absolute left-4 top-2 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all pointer-events-none">
                  Phone (Optional)
                </label>
              </div>

              {/* Subject Dropdown */}
              <div className="relative">
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-4 focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-700 appearance-none"
                >
                  <option value="" disabled>Select Subject</option>
                  <option value="Booking Issue">Booking Issue</option>
                  <option value="Refund / Cancellation">Refund / Cancellation</option>
                  <option value="Payment Problem">Payment Problem</option>
                  <option value="Hotel Inquiry">Hotel Inquiry</option>
                  <option value="General Question">General Question</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="relative">
              <textarea
                name="message"
                rows="4"
                placeholder=" "
                value={form.message}
                onChange={handleChange}
                required
                className="peer w-full border border-gray-200 rounded-xl px-4 pt-6 pb-2 resize-none focus:ring-2 focus:ring-indigo-500 outline-none bg-transparent"
              />
              <label className="absolute left-4 top-2 text-xs text-gray-400 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-focus:top-2 peer-focus:text-xs transition-all pointer-events-none">
                Tell us what's happening...
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-4 rounded-full font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                "Send Message →"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Embedded CSS for Animations */}
      <style>
        {`
          .animate-fade {
            animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}
      </style>
    </div>
  );
}