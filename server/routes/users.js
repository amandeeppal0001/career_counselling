import express from "express";
import mongoose from "mongoose";

import User from "../models/user.js";
import UserProfile from "../models/UserProfile.js"; 
import { createOrUpdateProfile, getProfile, loginUser, registerCounselor, registerUser } from "../controller/authController.js";
import verifyJWT from "../middleware/authMiddleware.js";
import counsellorProfile from "../models/counsellor-profile.js";

const router = express.Router();

router.post("/signup",registerUser);

router.post('/login',loginUser)

router.route('/completeProfile').patch(verifyJWT, createOrUpdateProfile).get(verifyJWT, getProfile);

router.post("/complete-counsellor-profile", async (req, res) => {
  try {
    const { userId, ...profileData } = req.body

    const newProfile = new counsellorProfile({
      userId,
      ...profileData,
    })

    await newProfile.save()
    res.status(201).json({ message: "Counsellor profile completed", profile: newProfile })
  } catch (error) {
    console.error("Counsellor profile completion error:", error)
    res.status(500).json({ error: "Failed to save counsellor profile" })
  }
})

 router.get('/profile/:userId',getProfile)

router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const profile = await UserProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) })

    if (!profile) {
      console.log("No profile found for userId:", userId)
      return res.status(404).json({ message: "Profile not found" })
    }

    console.log("Fetched profile from DB:", profile)
    res.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

router.get("/counsellor-profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const profile = await counsellorProfile.findOne({ userId: new mongoose.Types.ObjectId(userId) })

    if (!profile) {
      console.log("No counsellor profile found for userId:", userId)
      return res.status(404).json({ message: "Counsellor profile not found" })
    }

    console.log("Fetched counsellor profile from DB:", profile)
    res.json(profile)
  } catch (error) {
    console.error("Error fetching counsellor profile:", error)
    res.status(500).json({ error: "Failed to fetch counsellor profile" })
  }
})

router.get("/counsellors/all", async (req, res) => {
  try {
    const counsellors = await counsellorProfile.find({});
    res.json(counsellors);
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    res.status(500).json({ error: "Failed to fetch counsellors" });
  }
});

router.get("/counsellors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await counsellorProfile.findById(id);
    if (!profile) {
      return res.status(404).json({ message: "Counsellor not found" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching counsellor by ID:", error);
    res.status(500).json({ error: "Failed to fetch counsellor" });
  }
});

export default router;
