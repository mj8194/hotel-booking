import React, { useState } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';
import { toast } from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react'; // Added direct Clerk hook

const AddRoom = () => {
    const { api } = useAppContext(); 
    const { getToken } = useAuth(); // Destructure getToken directly from Clerk
    const [loading, setLoading] = useState(false);
    
    const [images, setImages] = useState({
        1: null,
        2: null,
        3: null,
        4: null,
    });

    const [inputs, setInputs] = useState({
        roomType: '',
        pricePerNight: '',
        amenities: {
            'Free Wifi': false,
            'Free Breakfast': false,
            'Room Service': false,
            'Mountain View': false,
            'Pool Access': false,
        },
    });

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!inputs.roomType || !inputs.pricePerNight || !Object.values(images).some(image => image)) {
            toast.error("Please fill in all details and upload at least one image");
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Adding room...");

        try {
            const formData = new FormData();
            formData.append('roomType', inputs.roomType);
            formData.append('pricePerNight', inputs.pricePerNight);
            
            const amenitiesArray = Object.keys(inputs.amenities).filter(key => inputs.amenities[key]);
            formData.append('amenities', JSON.stringify(amenitiesArray));

            Object.keys(images).forEach((key) => {
                if (images[key]) {
                    formData.append('images', images[key]);
                }
            });

            // FIXED: Getting token directly from Clerk hook
            const token = await getToken();
            
            if (!token) {
                toast.error("Session expired. Please login again.", { id: toastId });
                return;
            }

            const { data } = await api.post('/api/rooms', formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data' 
                }
            });

            if (data.success) {
                toast.success(data.message, { id: toastId });
                setInputs({
                    roomType: '',
                    pricePerNight: '',
                    amenities: {
                        'Free Wifi': false,
                        'Free Breakfast': false,
                        'Room Service': false,
                        'Mountain View': false,
                        'Pool Access': false
                    }
                });
                setImages({ 1: null, 2: null, 3: null, 4: null });
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (error) {
            console.error("Room Upload Error:", error);
            toast.error(error.response?.data?.message || "Error uploading room", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmitHandler} className="pb-20">
            <Title
                align="left"
                font="outfit"
                title="Add Room"
                subTitle="Fill in details accurately to improve the booking experience."
            />

            <p className="text-gray-800 mt-10 mb-2 font-medium">Room Images</p>
            <div className="flex gap-4 flex-wrap">
                {[1, 2, 3, 4].map((key) => (
                    <label key={key} htmlFor={`roomImage${key}`} className="cursor-pointer">
                        <img
                            src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
                            alt="upload"
                            className="h-24 w-24 object-cover opacity-80 border rounded-md hover:opacity-100 transition-opacity"
                        />
                        <input
                            type="file"
                            accept="image/*"
                            id={`roomImage${key}`}
                            hidden
                            onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
                        />
                    </label>
                ))}
            </div>

            <div className="w-full flex flex-wrap gap-6 mt-6">
                <div className="flex-1 max-w-xs">
                    <p className="text-gray-800 mb-1 font-medium">Room Type</p>
                    <select
                        value={inputs.roomType}
                        onChange={(e) => setInputs({ ...inputs, roomType: e.target.value })}
                        className="border border-gray-300 rounded p-2 w-full outline-none focus:border-primary"
                    >
                        <option value="">Select Room Type</option>
                        <option value="Single Bed">Single Bed</option>
                        <option value="Double Bed">Double Bed</option>
                        <option value="Luxury Room">Luxury Room</option>
                        <option value="Family Suite">Family Suite</option>
                    </select>
                </div>

                <div>
                    <p className="text-gray-800 mb-1 font-medium">Price <span className="text-xs text-gray-500">/night</span></p>
                    <input
                        type="number"
                        placeholder="0"
                        className="border border-gray-300 rounded p-2 w-32 outline-none focus:border-primary"
                        value={inputs.pricePerNight}
                        onChange={(e) => setInputs({ ...inputs, pricePerNight: e.target.value })}
                    />
                </div>
            </div>

            <p className="text-gray-800 mt-6 font-medium">Amenities</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-gray-600 max-w-lg">
                {Object.keys(inputs.amenities).map((amenity, index) => (
                    <label key={index} className="flex items-center gap-2 cursor-pointer text-sm bg-gray-50 p-2 rounded border hover:bg-gray-100">
                        <input
                            type="checkbox"
                            checked={inputs.amenities[amenity]}
                            onChange={() => setInputs({
                                ...inputs,
                                amenities: { ...inputs.amenities, [amenity]: !inputs.amenities[amenity] }
                            })}
                            className="h-4 w-4 accent-primary"
                        />
                        <span>{amenity}</span>
                    </label>
                ))}
            </div>

            <button
                type="submit"
                disabled={loading}
                className="bg-primary text-white px-10 py-3 rounded-lg mt-10 hover:bg-opacity-90 transition-all disabled:bg-gray-400"
            >
                {loading ? 'Adding...' : 'Add Room'}
            </button>
        </form>
    );
};

export default AddRoom;