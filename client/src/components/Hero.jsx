import React, { useState } from 'react'
import { assets, cities } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
import heroImage from '../assets/heroImage.jpg'

const Hero = () => {
    const { navigate, getToken, axios, setSearchedCities } = useAppContext()
    const [destination, setDestination] = useState("")

    const onSearch = async (e) => {
        e.preventDefault();

        // 1. Navigate to the rooms page with the search query
        navigate(`/rooms?destination=${destination.trim()}`)

        // 2. Handle Recent Searches Logic
        try {
            const token = await getToken();
            
            // Only attempt API call if user is logged in
            if (token) {
                await axios.post(
                    '/api/user/store-recent-search', 
                    { recentSearchedCity: destination }, 
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }

            // 3. Update Local UI State for Recent Searches
            setSearchedCities((prevSearchedCities) => {
                // Remove existing instance of city to avoid duplicates, then add to end
                const filtered = prevSearchedCities.filter(city => city.toLowerCase() !== destination.toLowerCase());
                const updated = [...filtered, destination];
                
                // Keep only the last 3 searches
                return updated.slice(-3);
            });

        } catch (error) {
            console.error("Error saving recent search:", error);
        }
    }

    return (
        <div 
            className='flex flex-col items-start justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-no-repeat bg-cover h-screen relative'
            style={{
                backgroundImage: `url(${heroImage})`,
            }}
        >
            
            {/* Overlay for better text readability */}
            <div className='absolute inset-0 bg-black/20 -z-10'></div>

            <p className='bg-[#49B9FF]/50 px-3.5 py-1 rounded-full mt-20 text-sm font-medium'>
                The Ultimate Hotel Experience
            </p>

            <h1 className='font-playfair text-3xl md:text-5xl lg:text-6xl font-bold max-w-xl mt-4 leading-tight'>
                Relax more. <br /> Spend less.
            </h1>

            <p className='max-w-md mt-4 text-sm md:text-base text-gray-100 leading-relaxed'>
                Travel should feel simple. We make it easy to explore hotels, compare options, and book stays that match your plans, budget, and mood, without the stress.
            </p>

            {/* Search Form */}
            <form 
                onSubmit={onSearch} 
                className='bg-white text-gray-600 rounded-xl px-6 py-6 mt-10 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 shadow-2xl w-full max-w-5xl'
            >
                {/* Destination */}
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                        <img src={assets.location_icon || assets.searchIcon} alt="" className='h-4 opacity-70' />
                        <label htmlFor="destinationInput" className='text-xs font-bold uppercase tracking-wider'>Destination</label>
                    </div>
                    <input 
                        onChange={e => setDestination(e.target.value)} 
                        value={destination} 
                        list='destinations' 
                        id="destinationInput" 
                        type="text" 
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
                        placeholder="Where are you going?" 
                        required 
                    />
                    <datalist id='destinations'>
                        {cities.map((city, index) => (
                            <option value={city} key={index} />
                        ))}
                    </datalist>
                </div>

                {/* Check In */}
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                        <img src={assets.calenderIcon} alt="" className='h-4 opacity-70' />
                        <label htmlFor="checkIn" className='text-xs font-bold uppercase tracking-wider'>Check in</label>
                    </div>
                    <input 
                        id="checkIn" 
                        type="date" 
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
                    />
                </div>

                {/* Check Out */}
                <div className='flex-1'>
                    <div className='flex items-center gap-2 mb-2'>
                        <img src={assets.calenderIcon} alt="" className='h-4 opacity-70' />
                        <label htmlFor="checkOut" className='text-xs font-bold uppercase tracking-wider'>Check out</label>
                    </div>
                    <input 
                        id="checkOut" 
                        type="date" 
                        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-primary transition-colors" 
                    />
                </div>

                {/* Guests */}
                <div className='flex-1 lg:max-w-30'>
                    <div className='flex items-center gap-2 mb-2'>
                        <label htmlFor="guests" className='text-xs font-bold uppercase tracking-wider'>Guests</label>
                    </div>
                    <input 
                        min={1} max={10} 
                        id="guests" 
                        type="number" 
                        className="w-full rounded-lg border border-gray-100 px-4 py-2 text-sm outline-none focus:border-primary" 
                        placeholder="1" 
                    />
                </div>

                {/* Submit Button */}
                <button 
                    type="submit"
                    className='bg-gray-900 hover:bg-black text-white rounded-xl px-8 py-4 flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-gray-200 self-end lg:self-center'
                >
                    <img src={assets.searchIcon} alt="searchIcon" className='h-5 invert' />
                    <span className='font-bold uppercase tracking-widest text-xs'>Search</span>
                </button>
            </form>
        </div>
    )
}

export default Hero