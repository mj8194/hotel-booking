import React, { useState, useEffect } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const Dashboard = () => {
    const { currency, user, toast, api } = useAppContext();
    
    // State Management
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(false); // Added this to fix the ReferenceError
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
        stats: { confirmedRate: 0, cancelledRate: 0 }
    });

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Using backticks for template literal
            const { data } = await api.get(`/api/bookings/hotel-records?range=${filter}`);
            
            if (data.success) {
                setDashboardData(data.dashboardData);
            }
        } catch (error) {
            console.error("Filter Error:", error);
            toast.error(error.response?.data?.message || "Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchDashboardData();
    }, [user, filter]);

    return (
        <div className={`pb-10 transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <Title 
                    align='left' 
                    font='outfit' 
                    title='Dashboard' 
                    subTitle='Monitor your property performance.'
                />
                
                <div className='flex items-center gap-2 bg-white border rounded-lg px-3 py-2 shadow-sm'>
                    <span className='text-xs text-gray-500 font-medium'>Period:</span>
                    <select 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className='text-sm font-semibold outline-none bg-transparent cursor-pointer text-blue-600'
                    >
                        <option value="all">All Time</option>
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-8'>
                <div className='bg-white border border-gray-200 rounded-xl flex p-5 items-center shadow-sm'>
                    <img src={assets.totalBookingIcon} alt="" className='h-10' />
                    <div className='ml-4'>
                        <p className='text-blue-500 text-sm font-medium'>Total Bookings</p>
                        <p className='text-neutral-700 text-2xl font-bold'>{dashboardData.totalBookings}</p>
                    </div>
                </div>

                <div className='bg-white border border-gray-200 rounded-xl flex p-5 items-center shadow-sm'>
                    <img src={assets.totalRevenueIcon} alt="" className='h-10' />
                    <div className='ml-4'>
                        <p className='text-blue-500 text-sm font-medium'>Total Revenue</p>
                        <p className='text-neutral-700 text-2xl font-bold'>{currency} {dashboardData.totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                <div className='bg-white border border-gray-200 rounded-xl p-5 shadow-sm'>
                    <p className='text-gray-600 text-sm font-semibold mb-3'>Booking Status Ratio</p>
                    <div className='flex items-center justify-between text-[10px] mb-1 uppercase font-bold'>
                        <span className='text-green-600'>Confirmed: {dashboardData.stats.confirmedRate}%</span>
                        <span className='text-red-500'>Cancelled: {dashboardData.stats.cancelledRate}%</span>
                    </div>
                    <div className='w-full bg-gray-100 rounded-full h-2 flex overflow-hidden'>
                        <div className='bg-green-500 h-full transition-all duration-500' style={{ width: `${dashboardData.stats.confirmedRate}%` }}></div>
                        <div className='bg-red-400 h-full transition-all duration-500' style={{ width: `${dashboardData.stats.cancelledRate}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Bookings Table */}
            <div className='w-full max-w-5xl border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white'>
                <div className='overflow-x-auto'>
                    <table className='w-full text-left'>
                        <thead className='bg-gray-50 border-b border-gray-200'>
                            <tr className='text-gray-800 font-semibold text-sm'>
                                <th className='py-4 px-6'>Guest</th>
                                <th className='py-4 px-6 max-sm:hidden'>Room Type</th>
                                <th className='py-4 px-6 text-center'>Amount</th>
                                <th className='py-4 px-6 text-center'>Status</th>
                            </tr>
                        </thead>
                        <tbody className='text-sm divide-y divide-gray-100'>
                            {dashboardData.bookings.length > 0 ? (
                                dashboardData.bookings.map((item, index) => (
                                    <tr key={item._id || index} className={`hover:bg-gray-50 transition-colors ${item.status === 'Cancelled' ? 'bg-red-50/30' : ''}`}>
                                        <td className='py-4 px-6'>
                                            <div className={`font-medium ${item.status === 'Cancelled' ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                                {item.user?.username || 'Guest'}
                                            </div>
                                            <div className='text-xs text-gray-400'>{new Date(item.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className='py-4 px-6 text-gray-600 max-sm:hidden'>
                                            {item.room?.roomType || 'N/A'}
                                        </td>
                                        <td className='py-4 px-6 text-gray-700 text-center font-medium'>
                                            {currency} {item.totalPrice}
                                        </td>
                                        <td className='py-4 px-6 text-center'>
                                            <span className={`inline-block px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${
                                                item.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-gray-400 italic">No bookings found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;