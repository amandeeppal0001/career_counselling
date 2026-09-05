import express from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import CounsellorProfile from '../models/counsellor-profile.js';

const router = express.Router();

// Helper to get initialized Razorpay instance
const getRazorpayInstance = () => {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
        throw new Error("Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in server .env");
    }

    return new Razorpay({
        key_id,
        key_secret
    });
};

// GET /api/payments/key - Public endpoint to retrieve Razorpay Key ID for client checkout
router.get('/key', (req, res) => {
    res.json({
        keyId: process.env.RAZORPAY_KEY_ID || ''
    });
});

// POST /api/payments/create-order - Create a new Razorpay Order for session booking
router.post('/create-order', async (req, res) => {
    try {
        const { counsellorId, studentId } = req.body;

        if (!counsellorId || !studentId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Both counsellorId and studentId are required' 
            });
        }

        // Find counselor profile by _id or userId
        let counsellor;
        if (mongoose.Types.ObjectId.isValid(counsellorId)) {
            counsellor = await CounsellorProfile.findById(counsellorId);
            if (!counsellor) {
                counsellor = await CounsellorProfile.findOne({ userId: counsellorId });
            }
        }

        if (!counsellor) {
            return res.status(404).json({ 
                success: false, 
                message: 'Counsellor profile not found' 
            });
        }

        const fee = typeof counsellor.consultationFee === 'number' 
            ? counsellor.consultationFee 
            : 500;

        // If counselor provides free consultations
        if (fee <= 0) {
            return res.json({
                success: true,
                isFree: true,
                amount: 0,
                currency: 'INR',
                counsellorName: counsellor.fullName,
                message: 'This session is free of charge.'
            });
        }

        const razorpay = getRazorpayInstance();

        // Amount in smallest currency unit (paise for INR)
        const amountInPaise = Math.round(fee * 100);

        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `rcpt_${Date.now().toString().slice(-8)}`,
            notes: {
                counsellorId: counsellor.userId ? counsellor.userId.toString() : counsellor._id.toString(),
                studentId: studentId.toString(),
                counsellorName: counsellor.fullName
            }
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            isFree: false,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
            counsellorName: counsellor.fullName,
            fee: fee
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create payment order' 
        });
    }
});

// POST /api/payments/verify-and-book - Verify Razorpay signature and create Appointment + Payment
router.post('/verify-and-book', async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingDetails,
            isFree
        } = req.body;

        if (!bookingDetails) {
            return res.status(400).json({ 
                success: false, 
                message: 'bookingDetails are required' 
            });
        }

        const {
            studentId,
            counsellorId,
            date,
            time,
            appointmentTimeISO,
            sessionType,
            message
        } = bookingDetails;

        if (!studentId || !counsellorId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Student ID and Counsellor ID are required' 
            });
        }

        // 1. If not a free session, verify Razorpay cryptographic signature
        if (!isFree) {
            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).json({
                    success: false,
                    message: 'Missing payment verification credentials'
                });
            }

            const key_secret = process.env.RAZORPAY_KEY_SECRET;
            if (!key_secret) {
                return res.status(500).json({
                    success: false,
                    message: 'Razorpay secret key not configured on server'
                });
            }

            const body = `${razorpay_order_id}|${razorpay_payment_id}`;
            const expectedSignature = crypto
                .createHmac('sha256', key_secret)
                .update(body.toString())
                .digest('hex');

            const isSignatureValid = expectedSignature === razorpay_signature;

            if (!isSignatureValid) {
                console.error("Signature mismatch: expected", expectedSignature, "got", razorpay_signature);
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed: Invalid signature'
                });
            }
        }

        // 2. Resolve Counselor User ID
        let counselorUserId = counsellorId;
        let counsellorProfile = await CounsellorProfile.findOne({ userId: counsellorId });
        if (!counsellorProfile && mongoose.Types.ObjectId.isValid(counsellorId)) {
            counsellorProfile = await CounsellorProfile.findById(counsellorId);
            if (counsellorProfile) {
                counselorUserId = counsellorProfile.userId;
            }
        }

        const consultationFee = counsellorProfile?.consultationFee || 500;

        // 3. Calculate Appointment Times
        let appointmentTime;
        if (appointmentTimeISO) {
            appointmentTime = new Date(appointmentTimeISO);
        } else {
            const timeStr = time.includes('-') ? time.split('-')[0] : time;
            const [startHour, startMinute] = timeStr.split(':');
            appointmentTime = new Date(`${date}T${startHour.padStart(2, '0')}:${startMinute || '00'}:00`);
        }

        const endTime = new Date(appointmentTime);
        endTime.setHours(appointmentTime.getHours() + 1);

        // 4. Check for double booking collision
        const existingAppointment = await Appointment.findOne({
            counselor: counselorUserId,
            appointmentTime,
            status: { $ne: 'Cancelled' }
        });

        if (existingAppointment) {
            return res.status(409).json({
                success: false,
                message: 'This time slot was just booked by another student. Please select another slot.'
            });
        }

        // 5. Create Payment record in DB
        const payment = new Payment({
            student: new mongoose.Types.ObjectId(studentId),
            counselor: new mongoose.Types.ObjectId(counselorUserId),
            razorpayOrderId: razorpay_order_id || 'free_session',
            razorpayPaymentId: razorpay_payment_id || 'free_session',
            razorpaySignature: razorpay_signature || 'free_session',
            amount: isFree ? 0 : consultationFee,
            currency: 'INR',
            status: isFree ? 'created' : 'paid',
            receipt: `rcpt_${Date.now()}`
        });

        await payment.save();

        // 6. Create Appointment record
        const appointment = new Appointment({
            student: new mongoose.Types.ObjectId(studentId),
            counselor: new mongoose.Types.ObjectId(counselorUserId),
            appointmentTime,
            endTime,
            mode: sessionType === 'video' ? 'Online' : 'In-person',
            notes: message,
            status: 'Scheduled',
            payment: payment._id,
            paymentStatus: isFree ? 'Free' : 'Paid',
            amountPaid: isFree ? 0 : consultationFee
        });

        await appointment.save();

        // Link appointment back to payment
        payment.appointment = appointment._id;
        await payment.save();

        res.status(201).json({
            success: true,
            message: 'Payment verified and appointment booked successfully!',
            appointmentId: appointment._id,
            paymentId: payment._id,
            paymentDetails: {
                razorpayPaymentId: payment.razorpayPaymentId,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status
            },
            appointment
        });

    } catch (error) {
        console.error('Error verifying payment and booking appointment:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to complete booking' 
        });
    }
});

// GET /api/payments/student/:studentId - Get payment transaction history for a student
router.get('/student/:studentId', async (req, res) => {
    try {
        const payments = await Payment.find({ student: req.params.studentId })
            .populate('counselor', 'name email')
            .populate('appointment')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            payments
        });
    } catch (error) {
        console.error('Error fetching student payments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch payments' });
    }
});

// GET /api/payments/counselor/:counselorId - Get earnings & payment history for counselor
router.get('/counselor/:counselorId', async (req, res) => {
    try {
        const counselorId = req.params.counselorId;

        const payments = await Payment.find({ 
            counselor: counselorId,
            status: 'paid'
        })
        .populate('student', 'name email')
        .populate('appointment')
        .sort({ createdAt: -1 });

        const totalEarnings = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
        const totalSessions = payments.length;

        res.json({
            success: true,
            totalEarnings,
            totalSessions,
            payments
        });
    } catch (error) {
        console.error('Error fetching counselor payments:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch counselor earnings' });
    }
});

export default router;
