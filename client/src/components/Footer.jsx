import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { toast } from 'react-hot-toast';

const Footer = () => {
    const [email, setEmail] = useState("");

    const handleSubscribe = (e) => {
        e.preventDefault();
        
        if (!email) {
            toast.error("Please enter a valid email address.");
            return;
        }

        // Show the success popup
        toast.success("Welcome to our community!", {
            position: "bottom-right",
            duration: 4000,
            style: {
                background: '#333',
                color: '#fff',
                borderRadius: '10px',
                fontSize: '14px'
            },
        });

        // Clear input after subscribing
        setEmail("");
    };

    return (
        <div className='bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32'>
            <div className='flex flex-wrap justify-between gap-12 md:gap-6'>
                <div className='max-w-80'>
                    <img src={assets.logo} alt="logo" className='mb-4 h-8 md:h-9' />
                    <p className='text-sm'>
                        Discover your perfect getaway with Sthivra, where exceptional locations meet unmatched guest comfort. Book your next escape today and let us transform your travel dreams into lasting, beautiful memories.
                    </p>
                    <div className='flex items-center gap-3 mt-4'>
                        <img src={assets.instagramIcon} alt="instagram-icon" className='w-6 cursor-pointer hover:opacity-70 transition-all'/>
                        <img src={assets.facebookIcon} alt="facebook-icon" className='w-6 cursor-pointer hover:opacity-70 transition-all'/>
                        <img src={assets.twitterIcon} alt="twitter-icon" className='w-6 cursor-pointer hover:opacity-70 transition-all'/>
                        <img src={assets.linkendinIcon} alt="linkedin-icon" className='w-6 cursor-pointer hover:opacity-70 transition-all'/>
                    </div>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>COMPANY</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#" className='hover:text-black transition-colors'>About</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Careers</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Press</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Blog</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Partners</a></li>
                    </ul>
                </div>

                <div>
                    <p className='font-playfair text-lg text-gray-800'>SUPPORT</p>
                    <ul className='mt-3 flex flex-col gap-2 text-sm'>
                        <li><a href="#" className='hover:text-black transition-colors'>Help Center</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Safety Information</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Cancellation Options</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Contact Us</a></li>
                        <li><a href="#" className='hover:text-black transition-colors'>Accessibility</a></li>
                    </ul>
                </div>

                <div className='max-w-80'>
                    <p className='font-playfair text-lg text-gray-800'>STAY UPDATED</p>
                    <p className='mt-3 text-sm'>
                        Subscribe to our newsletter for inspiration and special offers.
                    </p>
                    <form onSubmit={handleSubscribe} className='flex items-center mt-4'>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none w-full text-gray-700 focus:border-black transition-all' 
                            placeholder='Your email' 
                        />
                        <button 
                            type="submit"
                            className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r hover:bg-gray-800 transition-all'
                        >
                            <img src={assets.arrowIcon} alt="arrow-icon" className='w-3.5 invert' />
                        </button>
                    </form>
                </div>
            </div>
            
            <hr className='border-gray-300 mt-8' />
            
            <div className='flex flex-col md:flex-row gap-2 items-center justify-between py-5'>
                <p>© {new Date().getFullYear()} Sthivra. All rights reserved.</p>
                <ul className='flex items-center gap-4'>
                    <li><a href="#" className='hover:text-black transition-colors'>Privacy</a></li>
                    <li><a href="#" className='hover:text-black transition-colors'>Terms</a></li>
                    <li><a href="#" className='hover:text-black transition-colors'>Sitemap</a></li>
                </ul>
            </div>
        </div>
    );
};

export default Footer;