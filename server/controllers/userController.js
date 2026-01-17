import User from "../models/User.js";

// Get user data
export async function getUserData(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: "Not authenticated" });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        recentSearchedCities: user.recentSearchedCities,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Store recent searched city
export async function storeRecentSearchedCities(req, res) {
  try {
    const { recentSearchedCity } = req.body;
    const user = req.user;
    if (!recentSearchedCity) return res.status(400).json({ success: false, message: "City required" });

    user.recentSearchedCities = user.recentSearchedCities.filter(c => c !== recentSearchedCity);
    user.recentSearchedCities.unshift(recentSearchedCity);
    if (user.recentSearchedCities.length > 3) user.recentSearchedCities.pop();

    await user.save();
    res.json({ success: true, recentSearchedCities: user.recentSearchedCities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
