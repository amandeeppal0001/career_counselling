import express from "express";
import mongoose from "mongoose";

import User from "../models/user.js";
import UserProfile from "../models/UserProfile.js"; 
import { createOrUpdateProfile, getProfile, loginUser, registerCounselor, registerUser, logoutUser } from "../controller/authController.js";
import verifyJWT from "../middleware/authMiddleware.js";
import counsellorProfile from "../models/counsellor-profile.js";

const router = express.Router();

router.post("/signup",registerUser);

router.post('/login',loginUser);
router.post('/logout', verifyJWT, logoutUser);

router.route('/completeProfile').patch(verifyJWT, createOrUpdateProfile).get(verifyJWT, getProfile);

router.post("/complete-counsellor-profile", async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const query = mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : { userId };

    const updatedProfile = await counsellorProfile.findOneAndUpdate(
      query,
      {
        ...profileData,
        userId: query.userId,
        experience: Number(profileData.experience) || 0,
        consultationFee: Number(profileData.consultationFee) || 0,
        profileCompleted: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    try {
      await User.findByIdAndUpdate(userId, { profileCompleted: true });
    } catch (err) {
      console.warn("Could not update User.profileCompleted flag:", err.message);
    }

    res.status(200).json({ message: "Counsellor profile completed", profile: updatedProfile });
  } catch (error) {
    console.error("Counsellor profile completion error:", error);
    res.status(500).json({ error: "Failed to save counsellor profile" });
  }
});

router.get('/profile/:userId', getProfile);

router.get("/counsellor-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || userId === 'undefined' || userId === 'null') {
      return res.status(400).json({ error: "Invalid userId" });
    }

    const query = mongoose.Types.ObjectId.isValid(userId)
      ? { userId: new mongoose.Types.ObjectId(userId) }
      : { userId };

    const profile = await counsellorProfile.findOne(query);

    if (!profile) {
      console.log("No counsellor profile found for userId:", userId);
      return res.status(404).json({ message: "Counsellor profile not found" });
    }

    console.log("Fetched counsellor profile from DB:", profile);
    res.json(profile);
  } catch (error) {
    console.error("Error fetching counsellor profile:", error);
    res.status(500).json({ error: "Failed to fetch counsellor profile" });
  }
});

router.get("/counsellors/all", async (req, res) => {
  try {
    const counsellors = await counsellorProfile.find({});
    res.json(counsellors);
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    res.status(500).json({ error: "Failed to fetch counsellors" });
  }
});

export default router;
