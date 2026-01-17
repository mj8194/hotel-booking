import React, { useEffect, useState } from 'react';
import Title from '../../components/Title';
import { useAppContext } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { useAuth } from '@clerk/clerk-react';

const ListRoom = () => {
  const [rooms, setRooms] = useState([]);
  const { api, user, currency } = useAppContext(); // Ensure currency is provided by your context
  const { getToken } = useAuth();

  const fetchRooms = async () => {
    try {
      const token = await getToken();
      if (!token) return;
      const { data } = await api.get('/api/rooms/owner', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const toggleAvailability = async (roomId) => {
    try {
      const token = await getToken();
      
      // Optimistic Update
      setRooms(prev => prev.map(r => r._id === roomId ? { ...r, isAvailable: !r.isAvailable } : r));

      const { data } = await api.patch(`/api/rooms/${roomId}/availability`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data.success) {
        fetchRooms();
        toast.error(data.message);
      } else {
        toast.success("Availability updated");
      }
    } catch (error) {
      fetchRooms(); 
      toast.error("Failed to update status");
    }
  };

  useEffect(() => {
    if (user) fetchRooms();
  }, [user]);

  return (
    <div className="pb-10">
      <Title align="left" font="outfit" title="Room Listings" subTitle="Manage your rooms." />
      <div className="w-full max-w-4xl border border-gray-200 rounded-lg overflow-hidden mt-8 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-800 font-semibold">
                <th className="py-4 px-6">Room Type</th>
                <th className="py-4 px-6 max-sm:hidden">Amenities</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6 text-center">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rooms.length > 0 ? (
                rooms.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-700">{item.roomType}</td>
                    <td className="py-4 px-6 max-sm:hidden">
                      <div className="flex flex-wrap gap-1">
                        {item.amenities && item.amenities.length > 0 ? (
                            item.amenities.map((am, i) => (
                                <span key={i} className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] border border-blue-100 uppercase font-bold">{am}</span>
                            ))
                        ) : (
                            <span className="text-gray-400 text-xs italic">None</span>
                        )}
                      </div>
                    </td>
                    {/* FIXED: Added a fallback for currency and ensured proper spacing */}
                    <td className="py-4 px-6 font-medium text-gray-700">
                      {currency ? currency : '$'} {item.pricePerNight}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <label className='relative inline-flex items-center cursor-pointer'>
                        <input type="checkbox" className='sr-only peer' checked={item.isAvailable} onChange={() => toggleAvailability(item._id)} />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-10 text-center text-gray-400 italic">No rooms found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListRoom;