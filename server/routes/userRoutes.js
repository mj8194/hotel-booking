import express from "express";
import { getUserData, storeRecentSearchedCities } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET logged-in user data
// 'protect' ensures req.auth.userId exists before reaching getUserData
router.get("/", protect, getUserData);

// Store recent searched city
router.post("/store-recent-search", protect, storeRecentSearchedCities);

export default router;