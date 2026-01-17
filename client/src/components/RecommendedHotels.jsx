import React, { useState, useEffect } from 'react';
import HotelCard from './HotelCard';
import Title from './Title';
import { useAppContext } from '../context/AppContext';

const RecommendedHotels = () => {
  // Destructure rooms and searchedCities from context
  const { rooms, searchedCities } = useAppContext();
  const [recommended, setRecommended] = useState([]);

  useEffect(() => {
    const filterHotels = () => {
      if (!rooms || rooms.length === 0) return;

      // Logic: If user has searched cities, show hotels in those cities.
      // Fallback: If no history, show top-rated/featured rooms.
      if (searchedCities && searchedCities.length > 0) {
        const filtered = rooms.filter(room => 
          searchedCities.some(city => city.toLowerCase() === room.hotel?.city?.toLowerCase())
        );
        
        // If we found matches in history, use them; otherwise, use default slice
        setRecommended(filtered.length > 0 ? filtered : rooms.slice(0, 4));
      } else {
        // Default recommendation for new users (e.g., first 4 rooms)
        setRecommended(rooms.slice(0, 4));
      }
    };

    filterHotels();
  }, [rooms, searchedCities]);

  // Guard clause: Don't render if there are no rooms to show
  if (!rooms || rooms.length === 0 || recommended.length === 0) {
    return null;
  }

  return (
    <section className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 py-24'>
      <div className="text-center mb-16">
        <Title 
          title='Recommended for You' 
          subTitle={searchedCities.length > 0 
            ? 'Based on your recent interest in ' + searchedCities.slice(-1) 
            : 'Handpicked places where comfort, culture, and quiet moments come together.'
          }
        />
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-7xl'>
        {recommended.slice(0, 4).map((room, index) => (
          <HotelCard 
            key={room._id || index} 
            room={room} 
            index={index} 
          />
        ))}
      </div>

      {/* Optional: Call to action if you have many results */}
      {recommended.length > 4 && (
        <button 
          onClick={() => window.scrollTo(0, 0)}
          className="mt-12 text-sm font-bold uppercase tracking-widest text-primary hover:text-black transition-colors"
        >
          View More Recommendations
        </button>
      )}
    </section>
  );
};

export default RecommendedHotels;