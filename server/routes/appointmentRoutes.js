import express from 'express';
import { Appointment } from '../models/Appointment.js';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/book', async (req, res) => {
    try {
        const { studentId, counsellorId, date, time, sessionType, message } = req.body;

        const timeStr = time.includes('-') ? time.split('-')[0] : time;
        const [startHour, startMinute] = timeStr.split(':');

        const appointmentTime = new Date(`${date}T${startHour.padStart(2, '0')}:${startMinute || '00'}:00`);
        const endTime = new Date(appointmentTime);
        endTime.setHours(appointmentTime.getHours() + 1);

        const appointment = new Appointment({
            student: new mongoose.Types.ObjectId(studentId),
            counselor: new mongoose.Types.ObjectId(counsellorId),
            appointmentTime,
            endTime,
            mode: sessionType === 'video' ? 'Online' : 'In-person',
            notes: message,
            status: 'Scheduled'
        });

        await appointment.save();

        res.status(201).json({ 
            message: 'Appointment booked successfully', 
            appointmentId: appointment._id 
        });
    } catch (error) {
        console.error('Error booking appointment:', error);
        res.status(500).json({ error: 'Failed to book appointment' });
    }
});

router.get('/counselor/:counselorId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ counselor: req.params.counselorId })
            .populate('student', 'name email')
            .sort({ appointmentTime: 1 });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

router.get('/student/:studentId', async (req, res) => {
    try {
        const appointments = await Appointment.find({ student: req.params.studentId })
            .populate('counselor', 'name email')
            .sort({ appointmentTime: 1 });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching student appointments:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

router.put('/cancel/:id', async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id, 
            { status: 'Cancelled' },
            { new: true }
        );
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment cancelled successfully', appointment });
    } catch (error) {
        console.error('Error cancelling appointment:', error);
        res.status(500).json({ error: 'Failed to cancel appointment' });
    }
});

router.put('/reschedule/:id', async (req, res) => {
    try {
        const { date, time } = req.body;

        const timeStr = time.includes('-') ? time.split('-')[0] : time;
        const [startHour, startMinute] = timeStr.split(':');

        const appointmentTime = new Date(`${date}T${startHour.padStart(2, '0')}:${startMinute || '00'}:00`);
        const endTime = new Date(appointmentTime);
        endTime.setHours(appointmentTime.getHours() + 1);

        const appointment = await Appointment.findByIdAndUpdate(
            req.params.id,
            { appointmentTime, endTime, status: 'Scheduled' },
            { new: true }
        );

        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
        res.json({ message: 'Appointment rescheduled successfully', appointment });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        res.status(500).json({ error: 'Failed to reschedule appointment' });
    }
});

export default router;
