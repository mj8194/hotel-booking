import React, { useState, useEffect } from 'react';
import { assets } from '../assets/assets';
import Title from './Title';
import { useAppContext } from '../context/AppContext';
import Confetti from 'react-confetti';

const NewsLetter = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const { toast } = useAppContext();

  // Update window size for confetti if user resizes browser
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubscribe = (e) => {
    e.preventDefault();

    if (!email) return toast.error("Please enter your email");
    if (!isValidEmail(email)) return toast.error("Invalid email address");

    setLoading(true);

    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      setShowConfetti(true);
      toast.success("Welcome to the community!");
      setEmail("");

      // Stop confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-4 py-12 md:py-16 mx-2 lg:mx-auto my-30 bg-gray-900 text-white relative overflow-hidden">
      
      {/* Confetti Component */}
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false} // Confetti falls once and stops
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      <Title 
        title="Stay Inspired" 
        subTitle='Enter your email to receive a monthly dose of curated news, helpful guides, and beautiful stories. No spam—just high-quality updates.'
      />

      <form 
        onSubmit={handleSubscribe} 
        className="flex flex-col md:flex-row items-center justify-center gap-4 mt-6 w-full z-10"
      >
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-white/10 px-4 py-2.5 border border-white/20 rounded outline-none max-w-66 w-full focus:border-blue-400 transition-all" 
          placeholder="Enter your email" 
        />
        
        <button 
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 group bg-black px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? "Processing..." : "Subscribe"}
          {!loading && (
            <img 
              src={assets.arrowIcon} 
              className='w-3.5 invert group-hover:translate-x-1 transition-all' 
              alt="arrow" 
            />
          )}
        </button>
      </form>

      <p className="text-gray-500 mt-6 text-xs text-center">
        By subscribing, you agree to our Privacy Policy and consent to receive updates.
      </p>
    </div>
  );
};

export default NewsLetter;