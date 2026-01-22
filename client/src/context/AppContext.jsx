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

  const [showHotelReg, setShowHotelReg] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [interceptorReady, setInterceptorReady] = useState(false);

  const [hotels, setHotels] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchedCities, setSearchedCities] = useState([]);
  const [currency] = useState("$");

  /* ---------- Axios Auth Interceptor ---------- */
  useEffect(() => {
    let authInterceptor;

    const setupAuth = async () => {
      if (isLoaded && isSignedIn) {
        authInterceptor = api.interceptors.request.use(async (config) => {
          const token = await getToken();
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
        });

        setInterceptorReady(true);
        fetchUserData();
      } else if (isLoaded && !isSignedIn) {
        setInterceptorReady(true);
        setLoadingUser(false);
      }
    };

    setupAuth();

    return () => {
      if (authInterceptor) {
        api.interceptors.request.eject(authInterceptor);
      }
    };
  }, [isLoaded, isSignedIn]);

  /* ---------- Fetch Logged-in User ---------- */
  const fetchUserData = async () => {
    try {
      const { data } = await api.get("/api/user");
      if (data?.success) {
        setIsOwner(
          data.user.role === "hotelOwner" ||
          data.user.role === "hotelier"
        );
      }
    } catch (err) {
      console.error("User sync error");
    } finally {
      setLoadingUser(false);
    }
  };

  /* ---------- Fetch Hotels ---------- */
  const fetchHotels = async () => {
    try {
      const { data } = await api.get("/api/hotels");
      if (data.success) setHotels(data.hotels || []);
    } catch {
      setHotels([]);
    }
  };

  /* ---------- Fetch Rooms ---------- */
  const fetchRooms = async () => {
    try {
      const { data } = await api.get("/api/rooms");
      if (data.success) setRooms(data.rooms || []);
    } catch {
      setRooms([]);
    }
  };

  useEffect(() => {
    fetchHotels();
    fetchRooms();
  }, []);

  return (
    <AppContext.Provider
      value={{
        api,
        currency,
        navigate,
        user,

        // Auth / Role
        isSignedIn,
        isLoaded,
        isOwner,
        setIsOwner,

        // Hotel Registration Modal
        showHotelReg,
        setShowHotelReg,

        // Data
        hotels,
        rooms,
        setRooms,
        searchedCities,
        setSearchedCities,

        // State helpers
        loadingUser,
        interceptorReady,
        toast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
