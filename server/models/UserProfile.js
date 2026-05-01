import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true 
  },
  grade: { type: String, required: true },
  stream: { type: String, required: true },
  interests: [{ type: String }],
  strongSubjects: [{ type: String }],
  age: { type: Number, required: true },
  location: { type: String, required: true },
  careerGoals: { type: String },
  hobbies: [{ type: String }],
  profileCompleted: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("UserProfile", userProfileSchema);