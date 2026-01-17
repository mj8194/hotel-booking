import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { UserButton, useAuth, useClerk } from "@clerk/clerk-react";
import { useAppContext } from "../context/AppContext";

/* ---------- Icons ---------- */

const BookIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 19V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v13H7a2 2 0 0 0-2 2Zm0 0a2 2 0 0 0 2 2h12"
    />
  </svg>
);

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24">
    <path
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

/* ---------- Component ---------- */

const Navbar = () => {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Hotels", path: "/rooms" },
    { name: "Offers", path: "/offers" },
    { name: "Contact", path: "/contact" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const { isOwner, setShowHotelReg } = useAppContext();

  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  /* Scroll behavior */
  useEffect(() => {
    const onScroll = () =>
      setIsScrolled(!isHomePage || window.scrollY > 10);

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  /* Close mobile menu on route change */
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogin = () => {
    if (!isSignedIn) openSignIn();
  };

  const handleHotelAction = () => {
    if (!isSignedIn) return openSignIn();
    isOwner ? navigate("/owner") : setShowHotelReg(true);
  };

  const linkColor =
    isHomePage && !isScrolled ? "text-white" : "text-gray-700";

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-4 md:px-16 lg:px-24 py-4">
        {/* Logo */}
        <Link to="/">
          <img
            src={assets.logo}
            alt="logo"
            className={`h-10 ${
              isHomePage && !isScrolled ? "invert" : ""
            }`}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`font-medium ${
                location.pathname === link.path
                  ? "underline underline-offset-8"
                  : ""
              } ${linkColor}`}
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={handleHotelAction}
            className={`border px-4 py-1 rounded-full text-sm ${
              isScrolled
                ? "border-black text-black"
                : "border-white text-white"
            }`}
          >
            {isOwner ? "Dashboard" : "List your Hotel"}
          </button>
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <UserButton>
              <UserButton.MenuItems>
                <UserButton.Action
                  label="My Bookings"
                  labelIcon={<BookIcon />}
                  onClick={() => navigate("/my-bookings")}
                />
              </UserButton.MenuItems>
            </UserButton>
          ) : (
            <button
              onClick={handleLogin}
              className={`px-6 py-2 rounded-full font-semibold ${
                isScrolled
                  ? "bg-black text-white"
                  : "bg-white text-black"
              }`}
            >
              Login
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`md:hidden ${linkColor}`}
        >
          {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 space-y-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block font-medium text-gray-800"
            >
              {link.name}
            </Link>
          ))}

          <button
            onClick={handleHotelAction}
            className="w-full border border-black py-2 rounded-full text-sm"
          >
            {isOwner ? "Dashboard" : "List your Hotel"}
          </button>

          {!isSignedIn && (
            <button
              onClick={handleLogin}
              className="w-full bg-black text-white py-2 rounded-full"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
