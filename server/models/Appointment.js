import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counselor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointmentTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled', 'No-show'],
        default: 'Scheduled'
    },
    notes: { 
        type: String
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    mode: { 
        type: String,
        enum: ['Online', 'In-person'],
        default: 'Online'
    },
    payment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Payment'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded', 'Free'],
        default: 'Pending'
    },
    amountPaid: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

appointmentSchema.index({ counselor: 1, appointmentTime: 1 }, { unique: true });

export const Appointment = mongoose.model('Appointment', appointmentSchema);
