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
    <div className="flex flex-col md:flex-row gap-10 group pb-20">

      {/* Image */}
      <div className="w-full md:w-105 h-78 rounded-[2.5rem] overflow-hidden relative">
        <img
          src={room.images[0]}
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

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <h2
          onClick={handleNavigate}
          className="text-3xl font-playfair text-gray-900 hover:text-primary cursor-pointer"
        >
          {room.hotel?.name}
        </h2>

        {/* Address */}
        <div className="flex items-center gap-2 mt-2 text-gray-500">
          <img src={assets.location_icon} className="w-4 opacity-70" />
          <p className="text-sm">
            {room.hotel?.address}, {room.hotel?.city}
          </p>
        </div>

        {/* Info Icons */}
        <div className="flex flex-wrap gap-6 mt-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <img src={assets.bed_icon} className="w-4" />
            <span>{room.roomType}</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.user_icon} className="w-4" />
            <span>Up to {room.maxGuests || 2} guests</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={assets.size_icon} className="w-4" />
            <span>{room.size || 320} sq.ft</span>
          </div>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-4 mt-6">
          {room.facilities?.slice(0, 4).map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <img
                src={facilityIcons[item] || assets.check_icon}
                className="w-4 opacity-60"
              />
              <span className="text-xs text-gray-400">{item}</span>
            </div>
          ))}
        </div>

        {/* Cancellation */}
        <div className="mt-5 flex items-center gap-2 text-green-700 text-sm">
          <img src={assets.check_icon} className="w-4" />
          Free cancellation available
        </div>

        {/* Price */}
        <div className="mt-auto pt-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-black mb-1">
              {discountPercent ? 'Member Price' : 'Best Price'}
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
            className="bg-gray-900 text-white px-10 py-4 rounded-2xl text-xs font-bold tracking-widest hover:bg-black transition shadow-xl"
          >
            Reserve
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------- MAIN PAGE ----------------

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
      <h1 className="text-5xl font-playfair mb-16">Our Collections</h1>

      <div className="flex gap-12">
        <aside className="hidden lg:block w-80 sticky top-28 p-8">
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

        <div className="flex-1 space-y-24">
          {filteredRooms.map(room => (
            <RoomListCard
              key={room._id}
              room={room}
              navigate={navigate}
              currency={currency}
              discountPercent={discountPercent}
              couponCode={couponCode}
            />
          ))}
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
      <h3 className="font-bold uppercase text-sm mb-4">Room Type</h3>
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
      <h3 className="font-bold uppercase text-sm mb-4">Price Range</h3>
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
      <h3 className="font-bold uppercase text-sm mb-4">Sort By</h3>
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
