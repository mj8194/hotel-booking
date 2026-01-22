import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { assets, facilityIcons, roomCommonData } from '../assets/assets';
import StarRating from '../components/StarRating';
import { useAppContext } from '../context/AppContext';
import { useAuth } from "@clerk/clerk-react";

const RoomDetails = () => {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { rooms, currency, api } = useAppContext();
    const { getToken, isSignedIn } = useAuth();

    const discountPercent = parseInt(searchParams.get('discount')) || 0;
    const couponCode = searchParams.get('code') || "";

    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);
    const [isAvailable, setIsAvailable] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const foundRoom = rooms.find(r => r._id === id);
        if (foundRoom) {
            setRoom(foundRoom);
            setMainImage(foundRoom.images?.[0]);
        }
    }, [id, rooms]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        setIsAvailable(null);
    }, [checkInDate, checkOutDate, guests]);

    if (!room) {
        return (
            <div className='min-h-screen flex items-center justify-center font-playfair text-xl text-gray-400'>
                Loading your experience...
            </div>
        );
    }

    const originalPrice = room.pricePerNight;
    const discountedPrice = discountPercent > 0 
        ? Math.round(originalPrice * (1 - discountPercent / 100)) 
        : originalPrice;

    const handleAction = async (e) => {
        e.preventDefault();
        if (!isSignedIn) {
            toast.error("Please sign in to continue with your booking.");
            return;
        }
        if (isAvailable === true) {
            await bookRoom();
        } else {
            await checkAvailability();
        }
    };

    const checkAvailability = async () => {
        if (!checkInDate || !checkOutDate) {
            toast.error("Please select both Check-In and Check-Out dates");
            return;
        }
        try {
            setLoading(true);
            const { data } = await api.post('/api/bookings/check-availability', {
                room: id,
                checkInDate,
                checkOutDate
            });
            if (data.success) {
                setIsAvailable(data.isAvailable);
                data.isAvailable 
                    ? toast.success("Room is available!") 
                    : toast.error("Room already booked.");
            }
        } catch (err) {
            toast.error("Check failed");
        } finally {
            setLoading(false);
        }
    };

    const bookRoom = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const { data } = await api.post(
                '/api/bookings/book',
                {
                    room: id,
                    checkInDate,
                    checkOutDate,
                    guests,
                    appliedDiscount: discountPercent,
                    couponCode,
                    paymentMethod: "Pay At Hotel"
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success("Booking successful!");
                navigate('/my-bookings');
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Booking failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='pt-32 pb-20 px-4 md:px-16 lg:px-24 xl:px-32 bg-white'>
            {/* Header Section */}
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-4'>
                <div>
                    <div className='flex flex-wrap items-center gap-3'>
                        <h1 className='text-3xl md:text-5xl font-playfair text-gray-900'>
                            {room.hotel?.name || "Urbanza Suites"}
                        </h1>
                        <span className='px-4 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-widest'>
                            {room.roomType}
                        </span>
                    </div>
                    
                    <div className='flex items-center gap-2 text-gray-500 mt-4'>
                        <img src={assets.locationIcon} alt="location" className='w-4 opacity-70' />
                        <span className='text-sm font-light'>
                            {room.hotel?.address}{room.hotel?.city ? `, ${room.hotel?.city}` : ""}
                        </span>
                    </div>
                </div>

                <div className='text-left md:text-right'>
                    <p className='text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1'>Price per night</p>
                    <div className='flex items-center gap-3 md:justify-end'>
                        <span className='text-3xl font-bold'>{currency}{discountedPrice}</span>
                        {discountPercent > 0 && (
                            <span className='line-through text-gray-400 text-lg'>{currency}{originalPrice}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Ratings */}
            <div className='flex items-center gap-1 mt-6 border-b border-gray-100 pb-8'>
                <StarRating />
                <p className='ml-2 text-sm text-gray-600 font-medium'>4.8 (240 Reviews)</p>
            </div>

            {/* Image Gallery */}
            <div className='flex flex-col lg:flex-row mt-10 gap-6'>
                <div className='lg:w-2/3 w-full h-[300px] md:h-[500px]'>
                    <img src={mainImage} alt="main" className='w-full h-full rounded-[2.5rem] shadow-xl object-cover transition-all duration-500' />
                </div>
                <div className='grid grid-cols-2 lg:grid-cols-1 lg:w-1/3 gap-4'>
                    {room.images?.slice(0, 3).map((image, index) => (
                        <div key={index} className='h-36 md:h-56 lg:h-[155px]'>
                            <img 
                                onClick={() => setMainImage(image)}
                                src={image} 
                                alt={`thumb-${index}`}
                                className={`w-full h-full rounded-3xl shadow-md object-cover cursor-pointer hover:scale-[1.02] transition-all ${mainImage === image ? 'ring-4 ring-black' : ''}`} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Body */}
            <div className='flex flex-col lg:flex-row gap-16 mt-16'>
                <div className='flex-1'>
                    <h2 className='text-2xl font-playfair mb-6'>What this place offers</h2>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10'>
                        {room.amenities?.map((item, index) => (
                            <div key={index} className='flex items-center gap-4 group'>
                                <div className='p-3 bg-gray-50 rounded-2xl group-hover:bg-gray-100 transition-colors'>
                                    <img 
                                        src={facilityIcons[item] || assets.check_icon} 
                                        alt={item} 
                                        className='w-6 h-6 opacity-80' 
                                        onError={(e) => { e.target.src = assets.check_icon }}
                                    />
                                </div>
                                <p className='text-sm font-medium text-gray-700'>{item}</p>
                            </div>
                        ))}
                    </div>

                    <hr className='my-12 border-gray-100' />

                    <div className='space-y-8'>
                        {roomCommonData.map((item, index) => (
                            <div key={index} className='flex gap-6'>
                                <img src={item.icon} className='w-6 h-6 mt-1' alt="" />
                                <div>
                                    <h4 className='font-bold text-gray-900'>{item.title}</h4>
                                    <p className='text-sm text-gray-500 mt-1 leading-relaxed'>{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Booking Sidebar */}
                <aside className='lg:w-[400px]'>
                    <div className='sticky top-32 bg-white border border-gray-100 shadow-2xl rounded-[2.5rem] p-8'>
                        <h3 className='text-xl font-bold mb-6 text-gray-900 text-center'>Reserve Your Stay</h3>
                        <form onSubmit={handleAction} className='space-y-4'>
                            <div className='grid grid-cols-1 gap-4'>
                                <div className='flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Check-In</label>
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split("T")[0]}
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        className='bg-transparent outline-none text-sm font-bold cursor-pointer' 
                                        required 
                                    />
                                </div>
                                <div className='flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Check-Out</label>
                                    <input 
                                        type="date" 
                                        min={checkInDate || new Date().toISOString().split("T")[0]}
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        className='bg-transparent outline-none text-sm font-bold cursor-pointer' 
                                        required 
                                    />
                                </div>
                                <div className='flex flex-col p-4 bg-gray-50 rounded-2xl border border-gray-100'>
                                    <label className='text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Guests</label>
                                    <select 
                                        value={guests} 
                                        onChange={(e) => setGuests(e.target.value)}
                                        className='bg-transparent outline-none text-sm font-bold cursor-pointer'
                                    >
                                        {[1, 2, 3, 4].map(num => (
                                            <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <button 
                                type='submit' 
                                disabled={loading || isAvailable === false}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all duration-300 mt-4 active:scale-[0.98]
                                    ${isAvailable ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-black text-white'}
                                    disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed`}
                            >
                                {loading ? "Processing..." : isAvailable ? "Confirm Booking" : "Check Availability"}
                            </button>
                        </form>

                        {isAvailable === false && (
                            <p className='text-center text-red-500 text-xs font-bold mt-4'>Not available for selected dates.</p>
                        )}
                        
                        <p className='text-center text-gray-400 text-[10px] mt-6 leading-relaxed'>
                            You won't be charged yet. This request is subject to availability and hotel confirmation.
                        </p>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default RoomDetails;