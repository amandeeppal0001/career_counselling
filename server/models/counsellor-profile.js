import mongoose from "mongoose"

const counsellorProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    fullName: { type: String, required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true }, 
    qualifications: [{ type: String }], 
    expertise: [{ type: String }], 
    location: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    bio: { type: String, required: true },
    consultationFee: { type: Number, required: true },
    availability: {
      days: [{ type: String }], 
      timeSlots: [{ type: String }], 
    },
    languages: [{ type: String }],
    profileCompleted: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export default mongoose.model("CounsellorProfile", counsellorProfileSchema)
