import express from 'express';
import { createHotel, getHotels } from '../controllers/hotelController.js';
import { protect } from '../middleware/authMiddleware.js';

const hotelRouter = express.Router();

// This corresponds to POST /api/hotels
hotelRouter.post("/", protect, createHotel); 
hotelRouter.get("/", getHotels);

export default hotelRouter;