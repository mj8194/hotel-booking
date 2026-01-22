import React from 'react';
import HotelCard from './HotelCard';
import Title from './Title';
import { useAppContext } from '../context/AppContext';

const FeatureDestination = () => {
  const { rooms, navigate } = useAppContext();

  if (!rooms || rooms.length === 0) return null;

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-12 pb-16'>
      <Title 
        title='Featured Destination' 
        subTitle='Handpicked places where comfort, culture, and quiet moments come together.'
      />

      {/* Use grid for 4-column layout on large screens */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12'>
        {rooms.slice(0, 4).map((room, index) => (
          <HotelCard key={room._id} room={room} index={index} />
        ))}
      </div>

      <button 
        onClick={() => {
          navigate('/rooms');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        className='mt-8 px-10 py-3 text-sm font-medium border border-gray-300 rounded bg-white hover:bg-gray-100 hover:shadow-sm transition-all cursor-pointer'
      >
        View All Destinations
      </button>
    </div>
  );
};

export default FeatureDestination;
