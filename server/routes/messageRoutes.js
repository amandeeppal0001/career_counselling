import express from 'express';
import { Message } from '../models/Message.js';
import mongoose from 'mongoose';
import User from '../models/user.js';

const router = express.Router();

router.get('/history/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ]
        })
        .populate('sender', 'name email role')
        .populate('receiver', 'name email role')
        .sort({ createdAt: 1 }); 

        await Message.updateMany(
            { sender: user2, receiver: user1, isRead: false },
            { $set: { isRead: true } }
        );

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

router.get('/conversations/:userId', async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [{ sender: userId }, { receiver: userId }]
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$sender", userId] },
                            "$receiver",
                            "$sender"
                        ]
                    },
                    latestMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ["$receiver", userId] }, { $eq: ["$isRead", false] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "otherUser"
                }
            },
            {
                $unwind: "$otherUser"
            },
            {
                $project: {
                    _id: 1,
                    "otherUser.name": 1,
                    "otherUser.email": 1,
                    "otherUser.role": 1,
                    latestMessage: 1,
                    unreadCount: 1
                }
            },
            {
                $sort: { "latestMessage.createdAt": -1 }
            }
        ]);

        res.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

router.get('/unread/:userId', async (req, res) => {
    try {
        const count = await Message.countDocuments({ receiver: req.params.userId, isRead: false });
        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
});

export default router;
