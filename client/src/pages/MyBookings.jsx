import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useSearchParams } from "react-router-dom";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

const MyBookings = () => {
  const { api, currency, isSignedIn, isLoaded, interceptorReady, toast } = useAppContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/bookings/user-bookings");
      if (data.success) setBookings(data.bookings);
    } catch (error) {
      console.error("Fetch Bookings Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      const { data } = await api.patch(`/api/bookings/cancel/${bookingId}`);
      if (data.success) {
        toast.success("Booking cancelled successfully");
        fetchUserBookings();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !interceptorReady) return;

    const success = searchParams.get("success");
    const bookingId = searchParams.get("bookingId");

    if (success === "true" && bookingId) {
      const verifyPayment = async () => {
        try {
          setLoading(true);
          const { data } = await api.post("/api/bookings/verify-payment", { bookingId });
          if (data.success) {
            toast.success("Payment Verified!");
            setSearchParams({});
          }
        } catch (e) {
          console.error("Verification Error:", e);
          toast.error("Payment verification failed");
        } finally {
          fetchUserBookings();
        }
      };
      verifyPayment();
    } else {
      fetchUserBookings();
    }
  }, [isLoaded, isSignedIn, interceptorReady, searchParams]);

  if (!isLoaded || !interceptorReady || loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-24 px-6 font-outfit">
      <h1 className="text-4xl font-semibold mb-12 text-center text-blue-900">My Reservations</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 rounded-3xl shadow-md">
          <p className="text-gray-400 text-lg">No bookings found.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {bookings.map((booking, index) => (
            <div
              key={booking._id}
              className={`relative bg-white rounded-3xl shadow-md overflow-hidden transform transition-all duration-500 
                         hover:-translate-y-1 hover:shadow-xl
                         opacity-0 translate-y-8 animate-fadeIn`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              {booking.offerApplied && (
                <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 text-xs font-bold rounded-full z-10">
                  OFFER
                </span>
              )}

              <img
                src={booking.room?.images?.[0] || "https://via.placeholder.com/400x300"}
                className="w-full h-56 object-cover"
                alt="room"
              />
              <div className="p-6 flex flex-col justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-blue-950">{booking.hotel?.name}</h2>
                  <p className="text-gray-600 text-lg">{booking.room?.roomType}</p>
                  <div className="mt-2 flex gap-4 text-sm text-gray-500">
                    <p><span className="font-medium">In:</span> {formatDate(booking.checkInDate)}</p>
                    <p><span className="font-medium">Out:</span> {formatDate(booking.checkOutDate)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <p className="font-bold text-blue-600 text-xl">{currency}{booking.totalPrice}</p>
                  <div className="flex items-center gap-2">
                    {/* Pay Now Button */}
                    {booking.paymentStatus === "Unpaid" && booking.status !== "Cancelled" && (
                      <button
                        onClick={() => {
                          api.post("/api/bookings/stripe-payment", { bookingId: booking._id })
                             .then(res => window.location.href = res.data.url)
                             .catch(() => toast.error("Could not initiate payment"));
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Pay Now
                      </button>
                    )}

                    {/* Cancel Button */}
                    {booking.status !== "Cancelled" && (
                       <button
                       onClick={() => handleCancelBooking(booking._id)}
                       className="px-4 py-2 bg-red-50 text-red-600 text-sm border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                     >
                       Cancel
                     </button>
                    )}

                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'Cancelled'
                          ? 'bg-red-100 text-red-700'
                          : booking.paymentStatus === 'Paid'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
{booking.paymentStatus === 'Refunded' ? 'Refunded' : (booking.status === 'Cancelled' ? 'Cancelled' : booking.paymentStatus)}                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;