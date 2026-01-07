import React, { useState } from 'react'
import Title from '../../components/Title'
import { assets } from '../../assets/assets'

const AddRoom = () => {
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  })

  const [inputs, setInputs] = useState({
    roomType: '',
    pricePerNight: 0,
    amenities: {
      'Free Wifi': false,
      'Free Breakfast': false,
      'Room Service': false,
      'Mountain View': false,
      'Pool Access': false,
    },
  })

  return (
    <form className="pb-20">
      <Title
        align="left"
        font="outfit"
        title="Add Room"
        subTitle="Fill in the details carefully and accurately. Proper room details, pricing, and amenities improve the booking experience."
      />

      {/* Upload Area */}
      <p className="text-gray-800 mt-10 mb-2">Images</p>

      <div className="flex gap-4 flex-wrap">
        {Object.keys(images).map((key) => (
          <label
            key={key}
            htmlFor={`roomImage${key}`}
            className="cursor-pointer"
          >
            <img
              src={
                images[key]
                  ? URL.createObjectURL(images[key])
                  : assets.uploadArea
              }
              alt="upload"
              className="h-24 w-24 object-cover opacity-80 border rounded-md"
            />
            <input
              type="file"
              accept="image/*"
              id={`roomImage${key}`}
              hidden
              onChange={(e) =>
                setImages({ ...images, [key]: e.target.files[0] })
              }
            />
          </label>
        ))}
      </div>

      {/* Room Details */}
      <div className="w-full flex flex-wrap gap-6 mt-6">
        {/* Room Type */}
        <div className="flex-1 max-w-48">
          <p className="text-gray-800 mt-4">Room Type</p>
          <select
            value={inputs.roomType}
            onChange={(e) =>
              setInputs({ ...inputs, roomType: e.target.value })
            }
            className="border opacity-70 border-gray-300 mt-1 rounded p-2 w-full"
          >
            <option value="">Select Room Type</option>
            <option value="Single Bed">Single Bed</option>
            <option value="Double Bed">Double Bed</option>
            <option value="Luxury Room">Luxury Room</option>
            <option value="Family Suite">Family Suite</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <p className="mt-4 text-gray-800">
            Price <span className="text-xs text-gray-500">/night</span>
          </p>
          <input
            type="number"
            placeholder="0"
            className="border border-gray-300 mt-1 rounded p-2 w-24"
            value={inputs.pricePerNight}
            onChange={(e) =>
              setInputs({ ...inputs, pricePerNight: e.target.value })
            }
          />
        </div>
      </div>

      {/* Amenities */}
      <p className="text-gray-800 mt-6">Amenities</p>

      <div className="flex flex-col gap-2 mt-2 text-gray-600 max-w-sm">
        {Object.keys(inputs.amenities).map((amenity, index) => (
          <label
            key={index}
            htmlFor={`amenity${index}`}
            className="flex items-center gap-2 cursor-pointer text-sm"
          >
            <input
              type="checkbox"
              id={`amenity${index}`}
              checked={inputs.amenities[amenity]}
              onChange={() =>
                setInputs({
                  ...inputs,
                  amenities: {
                    ...inputs.amenities,
                    [amenity]: !inputs.amenities[amenity],
                  },
                })
              }
              className="h-4 w-4"
            />
            <span>{amenity}</span>
          </label>
        ))}
      </div>

      <button
        type="submit"
        className="bg-primary text-white px-8 py-2 rounded mt-8 cursor-pointer"
      >
        Add Room
      </button>
    </form>
  )
}

export default AddRoom
