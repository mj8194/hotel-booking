import React, { useState, useEffect } from 'react';
import Title from '../../components/Title';
import { assets } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const Dashboard = () => {
    const { currency, user, toast, api, isLoaded, isSignedIn } = useAppContext();
    
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true); 
    const [dashboardData, setDashboardData] = useState({
        bookings: [],
        totalBookings: 0,
        totalRevenue: 0,
        stats: { confirmedRate: 0, cancelledRate: 0 }
    });

    const fetchDashboardData = async () => {
        // PREVENT 401: Do not call API if not authenticated
        if (!isLoaded || !isSignedIn) return;

        try {
            setLoading(true);
            const { data } = await api.get(`/api/bookings/hotel-records?range=${filter}`);
            
            if (data.success) {
                setDashboardData(data.dashboardData);
            }
        } catch (error) {
            console.error("Dashboard Error:", error);
            // Don't toast 401s during the initial split-second load
            if (error.response?.status !== 401) {
                toast.error("Error loading dashboard data");
            }
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch when auth state changes or filter changes
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchDashboardData();
        }
    }, [isLoaded, isSignedIn, filter]);

    // Show a clean loader while Clerk is verifying the session
    if (!isLoaded || (loading && dashboardData.totalBookings === 0)) {
        return (
            <div className='flex flex-col items-center justify-center min-h-[400px]'>
                <div className='w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
                <p className='mt-4 text-gray-500 font-outfit'>Verifying credentials...</p>
            </div>
        );
    }

    return (
        <div className="pb-10 font-outfit">
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <Title align='left' title='Dashboard' subTitle='Monitor your property performance.' />
                
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

            {/* STAT CARDS */}
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
                    <p className='text-gray-600 text-sm font-semibold mb-3'>Booking Ratio</p>
                    <div className='w-full bg-gray-100 rounded-full h-2 flex overflow-hidden'>
                        <div className='bg-green-500 h-full' style={{ width: `${dashboardData.stats.confirmedRate}%` }}></div>
                        <div className='bg-red-400 h-full' style={{ width: `${dashboardData.stats.cancelledRate}%` }}></div>
                    </div>
                    <div className='flex justify-between text-[10px] mt-2 uppercase font-bold text-gray-400'>
                        <span>Confirmed {dashboardData.stats.confirmedRate}%</span>
                        <span>Cancelled {dashboardData.stats.cancelledRate}%</span>
                    </div>
                </div>
            </div>

            {/* TABLE */}
            <div className='w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white'>
                <table className='w-full text-left'>
                    <thead className='bg-gray-50 border-b text-gray-800 text-sm'>
                        <tr>
                            <th className='py-4 px-6'>Guest</th>
                            <th className='py-4 px-6'>Room</th>
                            <th className='py-4 px-6 text-center'>Amount</th>
                            <th className='py-4 px-6 text-center'>Status</th>
                        </tr>
                    </thead>
                    <tbody className='text-sm divide-y divide-gray-100'>
                        {dashboardData.bookings.map((item) => (
                            <tr key={item._id}>
                                <td className='py-4 px-6'>
                                    <p className="font-medium">{item.user?.username || 'Guest'}</p>
                                    <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</p>
                                </td>
                                <td className='py-4 px-6 text-gray-600'>{item.room?.roomType}</td>
                                <td className='py-4 px-6 text-center font-medium'>{currency}{item.totalPrice}</td>
                                <td className='py-4 px-6 text-center'>
                                    <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ${item.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        {item.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;