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

    // Discount & Coupon Logic from Search Params
    const discountPercent = parseInt(searchParams.get('discount')) || 0;
    const couponCode = searchParams.get('code') || "";

    const [room, setRoom] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [checkInDate, setCheckInDate] = useState("");
    const [checkOutDate, setCheckOutDate] = useState("");
    const [guests, setGuests] = useState(1);

    const [isAvailable, setIsAvailable] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch Room Data
    useEffect(() => {
        const foundRoom = rooms.find(r => r._id === id);
        if (foundRoom) {
            setRoom(foundRoom);
            setMainImage(foundRoom.images?.[0]);
        }
    }, [id, rooms]);

    // Scroll to top
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Reset availability on input change
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

    // Price Calculation
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
                    ? toast.success("Room is available! Proceed to book.") 
                    : toast.error("Room already booked for these dates.");
            }
        } catch (err) {
            toast.error("Availability check failed");
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
                window.scrollTo(0, 0);
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
        <div className='py-28 md:py-36 px-4 md:px-16 lg:px-24 xl:px-32 bg-white'>

            {/* Header Section */}
            <div className='flex flex-col md:flex-row items-start md:items-center gap-3'>
                <h1 className='text-3xl md:text-5xl font-playfair text-gray-900'>
                    {room.hotel.name} 
                    <span className='ml-3 font-sans text-sm font-light text-gray-500'>({room.roomType})</span>
                </h1>
                {discountPercent > 0 ? (
                    <span className='text-[10px] font-bold py-1.5 px-4 text-white bg-green-600 rounded-full tracking-widest uppercase'>
                        {discountPercent}% OFF APPLIED
                    </span>
                ) : (
                    <p className='text-[10px] font-bold py-1.5 px-4 text-white bg-orange-500 rounded-full tracking-widest uppercase'>
                        Limited Offer
                    </p>
                )}
            </div>

            {/* Rating */}
            <div className='flex items-center gap-1 mt-3'>
                <StarRating />
                <p className='ml-2 text-sm text-gray-600 font-medium'>200+ Verified Reviews</p>
            </div>

            {/* Address */}
            <div className='flex items-center gap-2 text-gray-500 mt-3 italic'>
                <img src={assets.location_icon || assets.locationIcon} alt="location" className='w-4 opacity-60' />
                <span className='text-sm'>{room.hotel.address}</span>
            </div>

            {/* Image Gallery */}
            <div className='flex flex-col lg:flex-row mt-10 gap-6'>
                <div className='lg:w-3/5 w-full h-75 md:h-125'>
                    <img src={mainImage} alt="main-room" className='w-full h-full rounded-3xl shadow-2xl object-cover transition-all duration-500' />
                </div>
                <div className='grid grid-cols-2 gap-4 lg:w-2/5 w-full'>
                    {room.images.map((image, index) => (
                        <div key={index} className='relative h-full min-h-35'>
                            <img 
                                onClick={() => setMainImage(image)}
                                src={image} 
                                alt={`room-thumb-${index}`}
                                className={`absolute inset-0 w-full h-full rounded-2xl shadow-md object-cover cursor-pointer transition-all ${mainImage === image ? 'ring-4 ring-black' : 'hover:opacity-80'}`} 
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Pricing Section */}
            <div className='mt-16'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-100 pb-8'>
                    <h2 className='text-3xl md:text-4xl font-playfair text-gray-900'>
                        Experience Luxury <br /> Like Never Before
                    </h2>
                    <div className='mt-6 md:mt-0 text-right'>
                        {discountPercent > 0 && (
                            <p className='line-through text-gray-400 text-sm italic'>
                                Was {currency}{originalPrice}
                            </p>
                        )}
                        <p className='text-4xl font-bold text-gray-900'>
                            {currency}{discountedPrice}
                            <span className='text-lg font-light text-gray-400'>/night</span>
                        </p>
                        {couponCode && (
                            <p className='text-green-600 text-xs font-bold mt-1 uppercase tracking-tighter'>
                                Coupon {couponCode} Active
                            </p>
                        )}
                    </div>
                </div>

                {/* Amenities Grid */}
                <div className='flex flex-wrap items-center mt-8 gap-4'>
                    {room.amenities.map((item, index) => (
                        <div key={index} className='flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors'>
                            <img src={facilityIcons[item]} alt={item} className='w-5 h-5 opacity-70' />
                            <p className='text-xs font-bold uppercase tracking-tighter text-gray-600'>{item}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Booking Form */}
            <form 
                onSubmit={handleAction}
                className='flex flex-col md:flex-row items-center justify-between bg-white shadow-2xl shadow-gray-200 p-8 rounded-4xl mx-auto mt-20 max-w-6xl border border-gray-50'
            >
                <div className='flex flex-col md:flex-row items-center gap-8 md:gap-12 text-gray-500 w-full md:w-auto'>
                    <div className='flex flex-col w-full md:w-auto'>
                        <label className='text-xs font-black uppercase tracking-widest mb-2 ml-1'>Check-In</label>
                        <input 
                            type="date" 
                            min={new Date().toISOString().split("T")[0]}
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className='rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black transition-all text-sm' 
                            required 
                        />
                    </div>
                    
                    <div className='hidden md:block w-px h-12 bg-gray-100'></div>

                    <div className='flex flex-col w-full md:w-auto'>
                        <label className='text-xs font-black uppercase tracking-widest mb-2 ml-1'>Check-Out</label>
                        <input 
                            type="date" 
                            min={checkInDate || new Date().toISOString().split("T")[0]}
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className='rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black transition-all text-sm' 
                            required 
                        />
                    </div>

                    <div className='hidden md:block w-px h-12 bg-gray-100'></div>

                    <div className='flex flex-col w-full md:w-auto'>
                        <label className='text-xs font-black uppercase tracking-widest mb-2 ml-1'>Guests</label>
                        <input 
                            type="number" 
                            min="1"
                            max="10"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            className='rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-black transition-all text-sm w-full md:w-24' 
                            required 
                        />
                    </div>
                </div>

                <button 
                    type='submit' 
                    disabled={loading || isAvailable === false}
                    className={`transition-all text-white font-bold uppercase tracking-widest rounded-2xl w-full md:w-auto md:px-12 py-5 mt-8 md:mt-0 text-sm shadow-xl 
                        ${isAvailable ? 'bg-green-600 hover:bg-green-700 shadow-green-100' : 'bg-gray-900 hover:bg-black shadow-gray-200'}
                        disabled:bg-gray-400 disabled:shadow-none active:scale-95`}
                >
                    {loading ? "Processing..." : isAvailable ? "Confirm Booking" : "Check Availability"}
                </button>
            </form>

            {/* Specifications Section */}
            <div className='mt-32 grid grid-cols-1 md:grid-cols-2 gap-10'>
                {roomCommonData.map((spec, index) => (
                    <div key={index} className='flex items-start gap-5 p-6 rounded-3xl hover:bg-gray-50 transition-all'>
                        <div className='bg-gray-100 p-4 rounded-2xl'>
                            <img src={spec.icon} alt={spec.title} className='w-8' />
                        </div>
                        <div>
                            <p className='text-lg font-bold text-gray-900 mb-1'>{spec.title}</p>
                            <p className='text-gray-500 text-sm leading-relaxed'>{spec.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Description */}
            <div className='max-w-4xl border-y border-gray-100 my-20 py-12'>
                <p className='text-gray-500 leading-loose text-lg font-light'>
                    {room.description || "Experience a true city feeling in this comfortable luxury apartment, designed for ultimate relaxation and convenience."}
                </p>    
            </div>

            {/* Host Section */}
            <div className='flex flex-col md:flex-row items-start md:items-center justify-between gap-8 bg-gray-50 p-10 rounded-[3rem]'>
                <div className='flex gap-6 items-center'>
                    <img 
                        src="https://images.pexels.com/photos/832998/pexels-photo-832998.jpeg" 
                        alt="Host" 
                        className='h-20 w-20 md:h-24 md:w-24 rounded-full object-cover ring-4 ring-white shadow-lg' 
                    />
                    <div>
                        <p className='text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1'>Property Host</p>
                        <p className='text-2xl font-playfair text-gray-900'>Managed by {room.hotel.name}</p>
                        <div className='flex items-center mt-2'>
                            <StarRating />
                            <p className='ml-3 text-sm text-gray-500'>Verified Host • 200+ Reviews</p>
                        </div>
                    </div>
                </div>
                <button className='px-10 py-4 rounded-2xl text-white bg-black hover:bg-gray-800 transition-all font-bold uppercase tracking-widest text-xs shadow-lg'>
                    Contact Host
                </button>
            </div>
        </div>
    );
};

export default RoomDetails;