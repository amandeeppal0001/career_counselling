import express from 'express';
import counsellorProfile from '../models/counsellor-profile.js';
import verifyJWT from "../middleware/authMiddleware.js";


import User from "../models/user.js";
import mongoose from 'mongoose';


const router = express.Router();












router.get('/', async (req, res) => {
  try {
    const counsellors = await counsellorProfile.find({});
    res.json(counsellors);
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    res.status(500).json({ error: 'Failed to fetch counsellors' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const counsellors = await counsellorProfile.find({});
    res.json(counsellors);
  } catch (error) {
    console.error("Error fetching counsellors:", error);
    res.status(500).json({ error: 'Failed to fetch counsellors' });
  }
});

router.get('/:counsellorId', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(counsellorId)) {
      return res.status(400).json({ message: 'Invalid counsellor ID format' });
    }
    const counsellor = await counsellorProfile.findById(counsellorId);
    if (counsellor) {
      res.json(counsellor);
    } else {
      res.status(404).json({ message: 'Counsellor not found' });
    }
  } catch (error) {
    console.error("Error fetching counsellor:", error);
    res.status(500).json({ error: 'Failed to fetch counsellor' });
  }
});


export default router;