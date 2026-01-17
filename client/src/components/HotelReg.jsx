import { useState } from "react";
import { assets, cities } from "../assets/assets";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { useAuth, useClerk } from "@clerk/clerk-react";

const HotelReg = () => {
    const { setShowHotelReg, api, setIsOwner } = useAppContext();
    const { isSignedIn, getToken } = useAuth(); // Direct hook access
    const { openSignIn } = useClerk();

    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [contact, setContact] = useState("");
    const [city, setCity] = useState("");
    const [pricePerNight, setPricePerNight] = useState("");

    const validateForm = () => {
        if (!name || !address || !contact || !city || !pricePerNight) {
            toast.error("All fields are required");
            return false;
        }
        return true;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!isSignedIn) {
            setShowHotelReg(false);
            openSignIn();
            return;
        }

        if (!validateForm()) return;

        const toastId = toast.loading("Registering hotel...");

        try {
            const token = await getToken();
            
            const { data } = await api.post("/api/hotels", {
                name,
                address,
                city,
                contact,
                pricePerNight: Number(pricePerNight),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (data.success) {
                toast.success(data.message, { id: toastId });
                setIsOwner(true);
                setShowHotelReg(false);
            } else {
                toast.error(data.message, { id: toastId });
            }
        } catch (err) {
            console.error("Hotel Reg Error:", err);
            toast.error(err.response?.data?.message || "Registration failed", { id: toastId });
        }
    };

    return (
        <div
            onClick={() => setShowHotelReg(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        >
            <form
                onSubmit={onSubmitHandler}
                onClick={(e) => e.stopPropagation()}
                className="flex bg-white rounded-xl max-w-4xl w-full overflow-hidden shadow-2xl"
            >
                <img src={assets.regImage} alt="reg" className="w-1/2 object-cover hidden md:block" />

                <div className="relative flex flex-col w-full md:w-1/2 p-8 h-[90vh] overflow-y-auto">
                    <img
                        src={assets.closeIcon}
                        alt="close"
                        className="absolute top-4 right-4 h-4 w-4 cursor-pointer"
                        onClick={() => setShowHotelReg(false)}
                    />

                    <p className="text-2xl font-semibold text-center mb-6">Register Your Hotel</p>

                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <label className="text-gray-500 text-sm">Hotel Name</label>
                            <input value={name} onChange={(e) => setName(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-gray-500 text-sm">Phone Number</label>
                            <input value={contact} onChange={(e) => setContact(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-gray-500 text-sm">Full Address</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
                        </div>

                        <div className="flex flex-col">
                            <label className="text-gray-500 text-sm">City</label>
                            <select value={city} onChange={(e) => setCity(e.target.value)} className="border rounded w-full px-3 py-2 mt-1">
                                <option value="">Select City</option>
                                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-gray-500 text-sm">Price per Night ($)</label>
                            <input type="number" value={pricePerNight} onChange={(e) => setPricePerNight(e.target.value)} className="border rounded w-full px-3 py-2 mt-1" />
                        </div>
                    </div>

                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg mt-8">
                        Register Property
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HotelReg;