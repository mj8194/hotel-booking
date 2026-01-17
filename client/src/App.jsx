import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import HotelReg from "./components/HotelReg";
import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";
import { Toaster } from 'react-hot-toast';
import { useAppContext } from "./context/AppContext";
import ExclusiveOffers from "./components/ExclusiveOffers";
import Contact from "./pages/Contact";

const App = () => {
  const location = useLocation();
  const isOwnerPath = location.pathname.includes("owner");
  const { showHotelReg } = useAppContext();

  return (
    <div className="bg-white">
      {/* Toast notifications handler */}
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* Conditionally render Navbar: Hidden on owner dashboard */}
      {!isOwnerPath && <Navbar />}
      
      {/* Conditional Hotel Registration Modal */}
      {showHotelReg && <HotelReg />}
      
      <div className="min-h-[70vh]">
        <Routes>
          {/* Public & Guest Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/offers" element={<ExclusiveOffers />} />
          <Route path="/contact" element={<Contact />} />

          {/* Hotel Owner Dashboard Routes */}
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>
      
      {/* Footer displays on all pages */}
      <Footer />
    </div>
  );
};

export default App;