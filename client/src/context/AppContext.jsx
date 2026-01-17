import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useAuth } from "@clerk/clerk-react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { getToken, isSignedIn } = useAuth();

  // State Management
  const [isOwner, setIsOwner] = useState(false);
  const [showHotelReg, setShowHotelReg] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [searchedCities, setSearchedCities] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [currency] = useState("$");

  // Fetch Public Rooms (No auth required)
  const fetchRooms = async () => {
    try {
      const { data } = await api.get('/api/rooms');
      if (data.success) {
        setRooms(data.rooms);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Fetch Rooms Error:", error);
      toast.error("Failed to load rooms");
    }
  };

  // Fetch Authenticated User Data & Sync Role
  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      const token = await getToken();
      
      if (!token) {
        setLoadingUser(false);
        return;
      }

      // Update the api instance with the latest token
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      const { data } = await api.get("/api/user");

      if (data?.success) {
  // Set isOwner to true if the role is either hotelOwner OR hotelier
  const role = data.user.role;
  setIsOwner(role === "hotelOwner" || role === "hotelier");
}
    } catch (error) {
      console.error("User fetch failed:", error);
      // If the backend returns 401/404, the user might not exist in our DB yet
      setIsOwner(false);
    } finally {
      setLoadingUser(false);
    }
  };

  // Initial load of public data
  useEffect(() => {
    fetchRooms();
  }, []);

  // Handle Login / Logout State changes
  useEffect(() => {
    if (isLoaded) {
      if (isSignedIn && user) {
        fetchUserData();
      } else {
        // Reset states on logout
        setIsOwner(false);
        setLoadingUser(false);
        delete api.defaults.headers.common.Authorization;
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return (
    <AppContext.Provider
      value={{
        navigate,
        api,
        axios: api, 
        isOwner,
        setIsOwner,
        showHotelReg,
        setShowHotelReg,
        loadingUser,
        user,
        currency,
        rooms,
        setRooms,
        fetchRooms,
        getToken,
        toast,
        searchedCities,
        setSearchedCities,
        isSignedIn
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);