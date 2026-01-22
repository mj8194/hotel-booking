import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import AllRooms from "./pages/AllRooms";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import ExclusiveOffers from "./components/ExclusiveOffers";
import Contact from "./pages/Contact";
import Loader from "./components/Loader";

import HotelReg from "./components/HotelReg";

import Layout from "./pages/hotelOwner/Layout";
import Dashboard from "./pages/hotelOwner/Dashboard";
import AddRoom from "./pages/hotelOwner/AddRoom";
import ListRoom from "./pages/hotelOwner/ListRoom";

import { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

const App = () => {
  const location = useLocation();
  const isOwnerPath = location.pathname.startsWith("/owner");

  const { showHotelReg } = useAppContext();

  return (
    <div className="bg-white">
      <Toaster position="bottom-right" />

      {!isOwnerPath && <Navbar />}

      {showHotelReg && <HotelReg />}

      <div className="min-h-[70vh]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<AllRooms />} />
          <Route path="/rooms/:id" element={<RoomDetails />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/offers" element={<ExclusiveOffers />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loader/:nextUrl" element={<Loader />} />

          {/* Hotel Owner Routes */}
          <Route path="/owner" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="add-room" element={<AddRoom />} />
            <Route path="list-room" element={<ListRoom />} />
          </Route>
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

export default App;
