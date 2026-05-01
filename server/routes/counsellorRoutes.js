import express from 'express';
import counsellorProfile from '../models/counsellor-profile.js';
import verifyJWT from "../middleware/authMiddleware.js";


import User from "../models/user.js";
import mongoose from 'mongoose';


const router = express.Router();












router.get('/:counsellorId', async (req, res) => {
  try {
    const { counsellorId } = req.params;
    const counsellor = await counsellorProfile.findById(counsellorId);
    if (counsellor) {
      res.json(counsellor);
    } else {
      res.status(404).json({ message: 'Counsellor not found' });
    }

  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch counsellor' });
  }
});


export default router;