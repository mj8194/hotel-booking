import React, { useState, useEffect } from "react";
import Title from "./Title";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { useLocation, useNavigate } from "react-router-dom";

// IMAGE IMPORTS
import exclusiveOfferCardImg1 from "../assets/exclusiveOfferCardImg1.png";
import exclusiveOfferCardImg2 from "../assets/exclusiveOfferCardImg2.png";
import exclusiveOfferCardImg3 from "../assets/exclusiveOfferCardImg3.png";

const offerImages = {
    exclusiveOfferCardImg1,
    exclusiveOfferCardImg2,
    exclusiveOfferCardImg3,
};

// Data Array
const exclusiveOffers = [
    {
        _id: "1",
        title: "Flash Sale",
        description: "Flat 40% off on same-day bookings",
        category: "limited-time",
        priceOff: 40,
        expiryDate: "2026-01-16T23:59:00",
        countdown: true,
        image: offerImages.exclusiveOfferCardImg1,
        tags: ["Last-Minute", "Trending"],
        memberOnly: false,
        couponCode: "FLASH40",
    },
    {
        _id: "2",
        title: "Winter Getaway",
        description: "Free breakfast + 30% off",
        category: "seasonal",
        priceOff: 30,
        expiryDate: "2026-01-31",
        image: offerImages.exclusiveOfferCardImg2,
        tags: ["Seasonal"],
        memberOnly: false,
    },
    {
        _id: "3",
        title: "New User Special",
        description: "Extra ₹1,000 off on first booking",
        category: "user-based",
        priceOff: 20,
        expiryDate: "2026-02-05",
        image: offerImages.exclusiveOfferCardImg3,
        tags: ["New User"],
        memberOnly: true,
        couponCode: "NEWUSER",
    },
    {
        _id: "4",
        title: "Business Pro",
        description: "Late checkout & lounge access",
        category: "user-based",
        priceOff: 15,
        expiryDate: "2026-03-01",
        image: offerImages.exclusiveOfferCardImg1,
        tags: ["Corporate"],
        memberOnly: true,
    },
    {
        _id: "5",
        title: "Festive Fiesta",
        description: "Special Diwali package: 30% off + gifts",
        category: "limited-time",
        priceOff: 30,
        expiryDate: "2026-11-05",
        countdown: true,
        image: offerImages.exclusiveOfferCardImg1,
        tags: ["Festive", "Trending"],
        memberOnly: false,
        couponCode: "FESTIVE30",
    },
    {
        _id: "6",
        title: "Romantic Retreat",
        description: "Couples package with 50% off spa services",
        category: "seasonal",
        priceOff: 50,
        expiryDate: "2026-02-14",
        image: offerImages.exclusiveOfferCardImg2,
        tags: ["Couples", "Valentine"],
        memberOnly: false,
        couponCode: "LOVE50",
    },
    {
        _id: "7",
        title: "Family Fun",
        description: "Kids stay free + 25% off family suite",
        category: "limited-time",
        priceOff: 25,
        expiryDate: "2026-01-20T23:59:00",
        countdown: true,
        image: offerImages.exclusiveOfferCardImg3,
        tags: ["Family", "Trending"],
        memberOnly: false,
        couponCode: "FAMILY25",
    },
    {
        _id: "8",
        title: "Adventure Escape",
        description: "30% off adventure packages with guided tours",
        category: "seasonal",
        priceOff: 30,
        expiryDate: "2026-03-10",
        image: offerImages.exclusiveOfferCardImg1,
        tags: ["Adventure", "Seasonal"],
        memberOnly: true,
        couponCode: "ADVENTURE30",
    },
    {
        _id: "9",
        title: "New Year Special",
        description: "₹2,000 off bookings above ₹10,000",
        category: "limited-time",
        priceOff: 20,
        expiryDate: "2026-01-31",
        countdown: true,
        image: offerImages.exclusiveOfferCardImg2,
        tags: ["New Year", "Trending"],
        memberOnly: false,
        couponCode: "NY2026",
    },
    {
        _id: "10",
        title: "VIP Lounge Access",
        description: "Complimentary lounge + 15% off premium rooms",
        category: "user-based",
        priceOff: 15,
        expiryDate: "2026-04-01",
        image: offerImages.exclusiveOfferCardImg3,
        tags: ["Corporate", "Premium"],
        memberOnly: true,
        couponCode: "VIPLOUNGE",
    },
    {
    _id: "11",
    title: "Breakfast Bonanza",
    description: "Free breakfast + 10% off stays",
    category: "seasonal",
    priceOff: 10,
    expiryDate: "2026-02-20",
    image: offerImages.exclusiveOfferCardImg3,
    tags: ["Foodie", "Seasonal"],
    memberOnly: false,
    couponCode: "BREAK10",
},
{
    _id: "12",
    title: "Student Special",
    description: "Extra ₹1,500 off for student bookings",
    category: "user-based",
    priceOff: 15,
    expiryDate: "2026-03-31",
    image: offerImages.exclusiveOfferCardImg1,
    tags: ["Student", "New User"],
    memberOnly: true,
    couponCode: "STUDENT1500",
},
];

// Helper: Calculate Countdown
const calculateCountdown = (expiry) => {
    const diff = new Date(expiry) - new Date();
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
};

const ExclusiveOffers = ({ limit = null , topPadding = "pt-12" }) => {
    const [activeFilter, setActiveFilter] = useState("all");
    const [now, setNow] = useState(new Date());
    const { user, toast } = useAppContext();
    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = !!user;

    // Update countdown every second
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter offers by category
    const categoryFiltered = activeFilter === "all"
        ? exclusiveOffers
        : exclusiveOffers.filter((offer) => offer.category === activeFilter);

    const displayedOffers = limit ? categoryFiltered.slice(0, limit) : categoryFiltered;

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        toast.success("Coupon code copied!");
    };

    const showViewAll = location.pathname !== "/offers";

    return (
        <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 xl:px-32 pt-12 pb-32 font-outfit w-full bg-gray-50">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center w-full max-w-3xl mb-12">
                <Title
                    align="center"
                    title="Exclusive Offers"
                    subTitle="Limited-time deals designed for savvy travelers."
                />
                {showViewAll && (
                    <button
                        onClick={() => { navigate("/offers"); window.scrollTo(0, 0); }}
                        className="group flex items-center gap-2 font-bold text-sm text-blue-600 hover:text-black transition-all mt-4 pb-1 border-b-2 border-transparent hover:border-black"
                    >
                        View All Offers
                        <img 
                            src={assets.arrowIcon} 
                            alt="arrow" 
                            className="w-3 group-hover:translate-x-2 transition-transform duration-300" 
                        />
                    </button>
                )}
            </div>

            {/* Filter Tabs */}
            <div className="flex justify-center gap-3 overflow-x-auto pb-6 w-full no-scrollbar">
                {["all", "limited-time", "seasonal", "user-based"].map((type) => (
                    <button
                        key={type}
                        onClick={() => setActiveFilter(type)}
                        className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap shadow-sm ${
                            activeFilter === type
                                ? "bg-linear-to-r from-blue-500 to-purple-500 text-white shadow-xl scale-105"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                        {type.replace("-", " ")}
                    </button>
                ))}
            </div>

            {/* Offers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full">
                {displayedOffers.map((item) => (
                    <div 
                        key={item._id} 
                        className="group relative flex flex-col justify-end rounded-3xl overflow-hidden min-h-112.5 shadow-2xl hover:shadow-3xl transition-all duration-500 border border-gray-200 bg-white/5 backdrop-blur-sm"
                    >
                        {/* Image */}
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
                            style={{ backgroundImage: `url(${item.image})` }}
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />

                        {/* Discount badge */}
                        <div className="absolute top-5 left-5 z-10 flex flex-col items-center justify-center w-16 h-16 bg-linear-to-br from-red-500 to-pink-500 text-white rounded-full font-bold shadow-lg animate-pulse">
                            <span className="text-sm">{item.priceOff}%</span>
                            <span className="text-[9px] uppercase">Off</span>
                        </div>

                        {/* Card Content */}
                        <div className="relative z-10 p-8 text-white flex flex-col justify-between h-full">

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                {item.tags?.map((tag, i) => (
                                    <span key={i} className="text-[9px] font-black uppercase tracking-wider px-2 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 hover:bg-white/30 transition">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            {/* Title & Description */}
                            <div>
                                <h3 className="text-2xl font-bold mb-2 leading-snug group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                <p className="text-xs text-gray-200 mb-5 leading-relaxed line-clamp-3">{item.description}</p>
                            </div>

                            {/* Countdown */}
                            {item.countdown && (
                                <div className="mb-3 px-3 py-1 rounded-xl bg-black/50 text-white text-[10px] font-bold inline-block animate-pulse">
                                    {calculateCountdown(item.expiryDate)}
                                </div>
                            )}

                            {/* Coupon Code */}
                            {item.couponCode && (isLoggedIn || !item.memberOnly) && (
                                <div 
                                    onClick={(e) => { e.stopPropagation(); handleCopyCode(item.couponCode); }}
                                    className="flex items-center justify-between bg-white/10 border border-white/20 backdrop-blur-md px-4 py-2.5 rounded-2xl mb-5 cursor-pointer hover:bg-white/20 transition-all group/code"
                                >
                                    <span className="text-xs font-mono tracking-[0.2em] text-blue-200">{item.couponCode}</span>
                                    <span className="text-[9px] font-bold uppercase opacity-0 group-hover/code:opacity-100 transition-opacity">Copy Code</span>
                                </div>
                            )}

                            {/* Availability & Claim Button */}
                            <div className="flex items-center justify-between border-t border-white/20 pt-5">
                                <div className="flex flex-col">
                                    <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Availability</span>
                                    <span className="text-xs font-semibold text-white">
                                        {!item.countdown ? new Date(item.expiryDate).toLocaleDateString() : ""}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        if (item.memberOnly && !isLoggedIn) {
                                            navigate('/login');
                                            toast.error("Please login to unlock this offer");
                                        } else {
                                            navigate(`/rooms?filter=${item.category}&discount=${item.priceOff}&code=${item.couponCode || ''}`);
                                            window.scrollTo(0, 0);
                                        }
                                    }}
                                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        item.memberOnly && !isLoggedIn
                                            ? "bg-white/20 text-white/40 cursor-not-allowed"
                                            : "bg-linear-to-r from-blue-500 to-purple-500 text-white hover:from-purple-500 hover:to-blue-500 transform active:scale-95 shadow-md"
                                    }`}
                                >
                                    {item.memberOnly && !isLoggedIn ? "Locked" : "Claim Now"}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExclusiveOffers;
