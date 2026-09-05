import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
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
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    razorpayOrderId: {
        type: String,
        required: true
    },
    razorpayPaymentId: {
        type: String,
        required: true
    },
    razorpaySignature: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed', 'refunded'],
        default: 'paid'
    },
    receipt: {
        type: String
    }
}, { timestamps: true });

export const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
