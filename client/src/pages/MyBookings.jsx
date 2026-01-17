import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '@clerk/clerk-react';
import { toast } from 'react-hot-toast';

const MyBookings = () => {
    const { api, currency, navigate } = useAppContext();
    const { getToken } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchUserBookings = async () => {
        try {
            const token = await getToken();
            const { data } = await api.get('/api/bookings/user-bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) setBookings(data.bookings);
        } catch (error) {
            toast.error("Failed to load bookings");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const token = await getToken();
            const { data } = await api.patch(`/api/bookings/cancel/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                toast.success("Booking successfully cancelled");
                fetchUserBookings();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Cancellation failed");
        }
    };

    useEffect(() => {
        fetchUserBookings();
    }, []);

    if (loading) return (
        <div className='flex flex-col items-center justify-center min-h-[60vh] gap-4'>
            <div className='w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin'></div>
            <p className='font-outfit text-gray-400 animate-pulse'>Fetching your trips...</p>
        </div>
    );

    return (
        <div className='max-w-6xl mx-auto py-24 px-6 md:px-10 font-outfit'>
            <div className='mb-12'>
                <h1 className='text-4xl font-semibold text-blue-950 mb-2'>My Reservations</h1>
                <p className='text-gray-500'>Manage your upcoming stays and experiences.</p>
            </div>

            {bookings.length === 0 ? (
                <div className='text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200'>
                    <p className='text-gray-400 text-lg'>No trips found.</p>
                    <button onClick={() => navigate('/')} className='mt-4 text-primary font-medium hover:underline'>Find a hotel →</button>
                </div>
            ) : (
                <div className='grid gap-8'>
                    {bookings.map((booking) => (
                        <div key={booking._id} className='group bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col lg:flex-row'>
                            
                            <div className='relative w-full lg:w-72 h-48 lg:h-auto overflow-hidden'>
                                <img src={booking.room?.images[0]} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700' alt="Hotel" />
                                <div className='absolute top-4 left-4'>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase shadow-lg ${booking.status === 'Cancelled' ? 'bg-red-500 text-white' : 'bg-white text-blue-950'}`}>
                                        {booking.status}
                                    </span>
                                </div>
                            </div>

                            <div className='flex-1 p-8 flex flex-col justify-between'>
                                <div>
                                    <div className='flex justify-between items-start mb-2'>
                                        <h2 className='text-2xl font-bold text-blue-950'>{booking.hotel?.name}</h2>
                                        <div className='text-right'>
                                            <p className='text-xs text-gray-400 uppercase tracking-tighter'>Total Price</p>
                                            <p className='text-2xl font-black text-primary'>{currency}{booking.totalPrice}</p>
                                            
                                            {/* ONLY SHOW IF OFFER WAS APPLIED IN DB */}
                                            {booking.offerApplied && (
                                                <p className='text-[10px] text-green-600 font-bold mt-1 uppercase tracking-widest'>
                                                    ✨ Offer Applied
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <p className='text-gray-500 flex items-center gap-1 mb-6'>
                                        <span className='w-2 h-2 rounded-full bg-primary/40'></span>
                                        {booking.room?.roomType}
                                    </p>

                                    <div className='grid grid-cols-2 gap-4 py-4 border-y border-gray-50'>
                                        <div>
                                            <p className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>Check-In</p>
                                            <p className='font-medium text-gray-700'>{new Date(booking.checkInDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                        <div>
                                            <p className='text-[10px] text-gray-400 uppercase font-bold tracking-widest'>Check-Out</p>
                                            <p className='font-medium text-gray-700'>{new Date(booking.checkOutDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className='mt-8 flex flex-wrap items-center justify-between gap-4'>
                                    <div className='flex items-center gap-2'>
                                        <div className={`w-3 h-3 rounded-full ${booking.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-amber-400 animate-pulse'}`}></div>
                                        <p className='text-sm font-medium text-gray-600'>Payment: {booking.paymentStatus}</p>
                                    </div>

                                    <div className='flex gap-3'>
                                        {booking.status !== 'Cancelled' && (
                                            <>
                                                <button onClick={() => handleCancel(booking._id)} className='px-6 py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm font-medium hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all'>
                                                    Cancel Trip
                                                </button>
                                                {booking.paymentStatus !== 'Paid' && (
                                                    <button onClick={() => navigate(`/payment/${booking._id}`)} className='px-8 py-2.5 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-700 hover:shadow-primary/40 transition-all'>
                                                        Pay Now
                                                    </button>
                                                )}
                                            </>
                                        )}
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