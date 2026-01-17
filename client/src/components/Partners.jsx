import React from "react";

// Sample logos (replace with your real assets)
import partner1 from "../assets/Expedia.png";
import partner2 from "../assets/Booking.png";
import partner3 from "../assets/Agoda.png";
import partner4 from "../assets/Hotels.png";
import partner5 from "../assets/airbnb.png";

const partners = [partner1, partner2, partner3, partner4, partner5];

const PartnersSection = () => {
  return (
    <div className="w-full bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto flex flex-col items-center px-6 md:px-12">
        
        {/* Section Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Trusted By
        </h2>
        <p className="text-gray-500 text-center mb-12 max-w-2xl">
          Our partners and associations ensure the best quality and experience for our guests.
        </p>

        {/* Logos Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {partners.map((logo, index) => (
            <div 
              key={index} 
              className="flex items-center justify-center p-4 w-32 h-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
            >
              <img src={logo} alt={`Partner ${index + 1}`} className="max-h-12 object-contain" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartnersSection;
