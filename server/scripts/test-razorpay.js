import Razorpay from 'razorpay';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log("Testing Razorpay order creation with:");
console.log("Key ID:", process.env.RAZORPAY_KEY_ID);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testOrder() {
  try {
    const order = await razorpay.orders.create({
      amount: 500 * 100, // 500 INR in paise
      currency: "INR",
      receipt: "receipt_test_" + Date.now().toString().slice(-6),
      notes: {
        test: "career-counselling-test"
      }
    });
    console.log("SUCCESS: Razorpay Test Order Created!");
    console.log("Order ID:", order.id);
    console.log("Amount:", order.amount, order.currency);
    console.log("Status:", order.status);
  } catch (error) {
    console.error("FAILED: Razorpay order creation failed:", error);
  }
}

testOrder();
