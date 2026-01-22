import React, { useState, useMemo } from 'react'
import { assets, facilityIcons } from '../assets/assets'
import { useSearchParams } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

// ---------------- HELPERS ----------------

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm group">
    <input
      type="checkbox"
      className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
      checked={selected}
      onChange={(e) => onChange(e.target.checked, label)}
    />
    <span className="font-light text-gray-600 group-hover:text-black transition">
      {label}
    </span>
  </label>
)

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className="flex gap-3 items-center cursor-pointer mt-3 text-sm group">
    <input
      type="radio"
      name="sortOption"
      className="w-4 h-4 accent-primary cursor-pointer"
      checked={selected}
      onChange={() => onChange(label)}
    />
    <span className="font-light text-gray-600 group-hover:text-black transition">
      {label}
    </span>
  </label>
)

// ---------------- ROOM CARD ----------------

const RoomListCard = ({ room, navigate, currency, discountPercent, couponCode }) => {
  const originalPrice = room.pricePerNight
  const finalPrice =
    discountPercent > 0
      ? Math.round(originalPrice * (1 - discountPercent / 100))
      : originalPrice

  const handleNavigate = () => {
    let url = `/rooms/${room._id}`
    const params = []
    if (discountPercent > 0) params.push(`discount=${discountPercent}`)
    if (couponCode) params.push(`code=${couponCode}`)
    if (params.length) url += `?${params.join('&')}`
    navigate(url)
  }

  return (
    <div className="flex flex-col md:flex-row gap-10 group pb-20 border-b border-gray-100 last:border-none">

      {/* Image Section */}
      <div className="w-full md:w-105 h-78 rounded-[2.5rem] overflow-hidden relative">
        <img
          src={room.images?.[0] || assets.uploadArea}
          onClick={handleNavigate}
          className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition duration-700"
          alt={room.hotel?.name}
        />

        {discountPercent > 0 && (
          <span className="absolute top-6 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest">
            SAVE {discountPercent}%
          </span>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col">
        <h2
          onClick={handleNavigate}
          className="text-3xl font-playfair text-gray-900 hover:text-primary cursor-pointer"
        >
          {room.hotel?.name || "Luxury Hotel"}
        </h2>

        {/* Address Display - FIXED */}
        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <img src={assets.locationIcon} className="w-4 opacity-70" alt="loc" />
          <p className="text-sm">
            {room.hotel?.address}{room.hotel?.city ? `, ${room.hotel?.city}` : ""}
          </p>
        </div>

        {/* Info Icons - Fixed to use existing icons from your assets.js */}
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={assets.homeIcon} className="w-4" alt="bed" />
            <span>{room.roomType}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.guestsIcon} className="w-4" alt="user" />
            <span>Up to {room.maxGuests || 2} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.badgeIcon} className="w-4" alt="size" />
            <span>Premium Stay</span>
          </div>
        </div>

        {/* Amenities - FIXED Mapping */}
        <div className="flex flex-wrap gap-4 mt-6">
          {room.amenities?.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
              <img
                src={facilityIcons[item] || assets.logo} 
                className="w-4 opacity-70"
                alt={item}
              />
              <span className="text-xs text-gray-500">{item}</span>
            </div>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="mt-auto pt-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">
              {discountPercent ? 'Exclusive Member Offer' : 'Starting From'}
            </p>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold">
                {currency}{finalPrice}
              </span>
              {discountPercent > 0 && (
                <span className="line-through text-gray-400">
                  {currency}{originalPrice}
                </span>
              )}
              <span className="text-sm text-gray-400">/night</span>
            </div>
          </div>

          <button
            onClick={handleNavigate}
            className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-xs font-bold tracking-widest hover:bg-black transition shadow-xl active:scale-95"
          >
            RESERVE
          </button>
        </div>
      </div>
    </div>
  )
}

const AllRooms = () => {
  const [searchParams] = useSearchParams()
  const { rooms, navigate, currency } = useAppContext()

  const discountPercent = parseInt(searchParams.get('discount')) || 0
  const couponCode = searchParams.get('code')

  const [selectedRoomTypes, setSelectedRoomTypes] = useState([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([])
  const [sortOption, setSortOption] = useState('')

  const roomTypes = ['Single Bed', 'Double Bed', 'Luxury Room', 'Family Suite']
  const priceRanges = ['0 to 500', '500 to 1000', '1000 to 2000', '2000 to 3000']
  const sortOptions = ['Price Low to High', 'Price High to Low', 'Newest First']

  // Optimized Filtering logic
  const filteredRooms = useMemo(() => {
    let filtered = [...rooms]

    if (selectedRoomTypes.length)
      filtered = filtered.filter(r => selectedRoomTypes.includes(r.roomType))

    if (selectedPriceRanges.length)
      filtered = filtered.filter(r =>
        selectedPriceRanges.some(range => {
          const [min, max] = range.split(' to ').map(Number)
          return r.pricePerNight >= min && r.pricePerNight <= max
        })
      )

    if (sortOption === 'Price Low to High')
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight)
    if (sortOption === 'Price High to Low')
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight)
    if (sortOption === 'Newest First')
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return filtered
  }, [rooms, selectedRoomTypes, selectedPriceRanges, sortOption])

  return (
    <div className="pt-28 px-4 md:px-16 xl:px-32 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-playfair mb-16 text-gray-900">Our Collections</h1>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filter */}
          <aside className="lg:w-80 lg:sticky lg:top-28 p-8 bg-gray-50 rounded-4xl h-fit border border-gray-100">
            <FilterContent
              roomTypes={roomTypes}
              priceRanges={priceRanges}
              sortOptions={sortOptions}
              selectedRoomTypes={selectedRoomTypes}
              setSelectedRoomTypes={setSelectedRoomTypes}
              selectedPriceRanges={selectedPriceRanges}
              setSelectedPriceRanges={setSelectedPriceRanges}
              sortOption={sortOption}
              setSortOption={setSortOption}
              currency={currency}
            />
          </aside>

          {/* Rooms List */}
          <div className="flex-1 space-y-12">
            {filteredRooms.length > 0 ? (
               filteredRooms.map(room => (
                <RoomListCard
                  key={room._id}
                  room={room}
                  navigate={navigate}
                  currency={currency}
                  discountPercent={discountPercent}
                  couponCode={couponCode}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-40 border-2 border-dashed border-gray-100 rounded-4xl">
                <img src={assets.searchIcon} className="w-12 opacity-20 mb-4" alt="empty" />
                <p className="text-gray-400 font-playfair text-xl">No rooms match your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const FilterContent = ({
  roomTypes, priceRanges, sortOptions,
  selectedRoomTypes, setSelectedRoomTypes,
  selectedPriceRanges, setSelectedPriceRanges,
  sortOption, setSortOption, currency
}) => (
  <div className="space-y-10">
    <div>
      <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4">Room Type</h3>
      {roomTypes.map(type => (
        <CheckBox
          key={type}
          label={type}
          selected={selectedRoomTypes.includes(type)}
          onChange={(checked, label) =>
            setSelectedRoomTypes(prev =>
              checked ? [...prev, label] : prev.filter(t => t !== label)
            )
          }
        />
      ))}
    </div>

    <div>
      <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4">Price Range</h3>
      {priceRanges.map(range => (
        <CheckBox
          key={range}
          label={`${currency} ${range}`}
          selected={selectedPriceRanges.includes(range)}
          onChange={checked =>
            setSelectedPriceRanges(prev =>
              checked ? [...prev, range] : prev.filter(r => r !== range)
            )
          }
        />
      ))}
    </div>

    <div>
      <h3 className="font-black uppercase text-[10px] tracking-widest text-gray-400 mb-4">Sort By</h3>
      {sortOptions.map(opt => (
        <RadioButton
          key={opt}
          label={opt}
          selected={sortOption === opt}
          onChange={setSortOption}
        />
      ))}
    </div>
  </div>
)

export default AllRooms