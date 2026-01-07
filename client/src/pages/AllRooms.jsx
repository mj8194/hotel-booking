import React, { useState, useMemo } from 'react'
import { assets, facilityIcons, roomsDummyData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import StarRating from '../components/Starrating'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="checkbox"
        checked={selected}
        onChange={(e) => onChange(e.target.checked, label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
}

const RadioButton = ({ label, selected = false, onChange = () => {} }) => {
  return (
    <label className="flex gap-3 items-center cursor-pointer mt-2 text-sm">
      <input
        type="radio"
        name="sortOption"
        checked={selected}
        onChange={() => onChange(label)}
      />
      <span className="font-light select-none">{label}</span>
    </label>
  )
}

const AllRooms = () => {
  const navigate = useNavigate()
  const [openFilters, setOpenFilters] = useState(false)

  const [selectedRoomTypes, setSelectedRoomTypes] = useState([])
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([])
  const [sortOption, setSortOption] = useState('')

  const roomTypes = [
    'Single Bed',
    'Double Bed',
    'Luxury Room',
    'Family Suite',
  ]

  const priceRanges = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000',
  ]

  const sortOptions = [
    'Price Low to High',
    'Price High to Low',
    'Newest First',
  ]

  const handleClearFilters = () => {
    setSelectedRoomTypes([])
    setSelectedPriceRanges([])
    setSortOption('')
  }

  const filteredRooms = useMemo(() => {
    let filtered = [...roomsDummyData]

    if (selectedRoomTypes.length) {
      filtered = filtered.filter((room) =>
        selectedRoomTypes.includes(room.roomType)
      )
    }

    if (selectedPriceRanges.length) {
      filtered = filtered.filter((room) =>
        selectedPriceRanges.some((range) => {
          const [min, max] = range.split(' to ').map(Number)
          return room.pricePerNight >= min && room.pricePerNight <= max
        })
      )
    }

    if (sortOption === 'Price Low to High') {
      filtered.sort((a, b) => a.pricePerNight - b.pricePerNight)
    }

    if (sortOption === 'Price High to Low') {
      filtered.sort((a, b) => b.pricePerNight - a.pricePerNight)
    }

    if (sortOption === 'Newest First') {
      filtered.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
    }

    return filtered
  }, [selectedRoomTypes, selectedPriceRanges, sortOption])

  return (
    <div className="pt-28 md:pt-35 px-4 md:px-16 lg:px-24 xl:px-32">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="font-playfair text-4xl md:text-[40px]">Hotel Rooms</h1>
        <p className="text-sm md:text-base text-gray-500/90 mt-2 max-w-175">
          Find your home away from home in our spacious rooms, where warm
          hospitality meets effortless style.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* Rooms */}
        <div className="flex flex-col gap-12 flex-1">
          {filteredRooms.map((room) => (
            <div
              key={room._id}
              className="flex flex-col md:flex-row items-start py-10 gap-6 max-w-5xl border-b border-gray-200"
            >
              <img
                src={room.images[0]}
                alt="hotel-img"
                onClick={() => {
                  navigate(`/rooms/${room._id}`)
                  window.scrollTo(0, 0)
                }}
                className="w-full lg:w-2/5 max-h-60 rounded-xl shadow-lg object-cover cursor-pointer"
              />

              <div className="flex flex-col gap-2 lg:w-3/5">
                <p className="text-gray-500">{room.hotel.city}</p>

                <p
                  onClick={() => {
                    navigate(`/rooms/${room._id}`)
                    window.scrollTo(0, 0)
                  }}
                  className="text-gray-800 text-3xl font-playfair cursor-pointer"
                >
                  {room.hotel.name}
                </p>

                <div className="flex items-center">
                  <StarRating />
                  <p className="ml-2 text-sm text-gray-500">200+ reviews</p>
                </div>

                <div className="flex items-center gap-1 text-gray-500 mt-2 text-sm">
                  <img src={assets.locationIcon} alt="location-icon" />
                  <span>{room.hotel.address}</span>
                </div>

                <div className="flex flex-wrap items-center mt-3 mb-6 gap-4">
                  {room.amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70"
                    >
                      <img
                        src={facilityIcons[item]}
                        alt={item}
                        className="w-5 h-5"
                      />
                      <p className="text-xs">{item}</p>
                    </div>
                  ))}
                </div>

                <p className="text-xl font-medium text-gray-700">
                  ${room.pricePerNight} /night
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white w-full lg:w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16">
          <div className="flex items-center justify-between px-5 py-2.5 border-b border-gray-300">
            <p className="text-base font-medium text-gray-800">FILTERS</p>

            <div className="text-xs cursor-pointer">
              <span
                onClick={() => setOpenFilters(!openFilters)}
                className="lg:hidden"
              >
                {openFilters ? 'HIDE' : 'SHOW'}
              </span>

              <span
                onClick={handleClearFilters}
                className="hidden lg:block text-blue-600 hover:underline"
              >
                CLEAR
              </span>
            </div>
          </div>

          <div
            className={`${
              openFilters ? 'h-auto' : 'h-0 lg:h-auto'
            } overflow-hidden transition-all duration-700`}
          >
            <div className="px-5 pt-5">
              <p className="font-medium text-gray-800 pb-2">Popular Filters</p>
              {roomTypes.map((room, index) => (
                <CheckBox
                  key={index}
                  label={room}
                  selected={selectedRoomTypes.includes(room)}
                  onChange={(checked, label) =>
                    setSelectedRoomTypes((prev) =>
                      checked
                        ? [...prev, label]
                        : prev.filter((r) => r !== label)
                    )
                  }
                />
              ))}
            </div>

            <div className="px-5 pt-5">
              <p className="font-medium text-gray-800 pb-2">Price Range</p>
              {priceRanges.map((range, index) => (
                <CheckBox
                  key={index}
                  label={`$ ${range}`}
                  selected={selectedPriceRanges.includes(range)}
                  onChange={(checked) =>
                    setSelectedPriceRanges((prev) =>
                      checked
                        ? [...prev, range]
                        : prev.filter((r) => r !== range)
                    )
                  }
                />
              ))}
            </div>

            <div className="px-5 pt-5 pb-7">
              <p className="font-medium text-gray-800 pb-2">Sort By</p>
              {sortOptions.map((option, index) => (
                <RadioButton
                  key={index}
                  label={option}
                  selected={sortOption === option}
                  onChange={setSortOption}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AllRooms
