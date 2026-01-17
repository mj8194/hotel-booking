import React from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'

const HotelCard = ({ room, index }) => {
  const { currency } = useAppContext();

  // Helper to safely display address
  const getAddress = () => {
    if (typeof room.hotel?.address === 'string') return room.hotel.address;
    return room.hotel?.address?.city || room.hotel?.location || "Location N/A";
  };

  return (
    <Link 
      to={`/rooms/${room._id}`} 
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
      className='relative max-w-70 w-full rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-lg transition-all duration-300 group'
    >
      {/* Room Image */}
      <div className='overflow-hidden h-48'>
        <img 
          src={room.images && room.images.length > 0 ? room.images[0] : assets.placeholderImage} 
          alt={room.roomType} 
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
        />
      </div>

      {/* Badge */}
      {index % 2 === 0 && (
        <p className='px-3 py-1 absolute top-3 left-3 text-[10px] uppercase tracking-wider bg-white text-gray-800 font-bold rounded-full shadow-md z-10'>
          Best Seller
        </p>
      )}

      <div className='p-4 pt-5'>
        {/* Hotel Name & Rating */}
        <div className='flex items-start justify-between gap-2'>
          <p className='font-outfit text-lg font-semibold text-gray-800 truncate leading-tight'>
            {room.hotel?.name || "Hotel Name"}
          </p>
          <div className='flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded text-xs font-bold text-green-700 shrink-0'>
            {/* CORRECTED ASSET NAMES */}
            <img src={assets.star_icon || assets.starIconFilled} alt="" className='w-2.5 h-2.5' />
            4.5
          </div>
        </div>

        {/* Location - FIXED LOGIC */}
        <div className='flex items-center gap-1 text-xs mt-2 text-gray-500'>
          <img src={assets.location_icon || assets.locationIcon} alt="" className='w-3 h-3' />
          <span className='truncate'>{getAddress()}</span>
        </div>

        {/* Room Type Tag */}
        <div className='mt-3 flex items-center justify-between'>
            <p className='text-[11px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium uppercase tracking-wide'>
                {room.roomType}
            </p>
        </div>

        {/* Price & Action */}
        <div className='flex items-center justify-between mt-5 border-t border-gray-100 pt-4'>
          <p className='text-gray-500 text-[10px] flex flex-col'>
            <span className='text-xl font-bold text-gray-900 leading-none'>
              {currency}{room.pricePerNight}
            </span>
            per night
          </p>
          <button className='px-4 py-2 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer'>
            Book Now
          </button>
        </div>
      </div>
    </Link>
  )
}

export default HotelCard;