
const mongoose = require("mongoose")
require("dotenv").config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career-advisor"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "parent", "counselor"],
    },
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
)

const studentProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clerkUserId: {
      type: String,
      required: true,
    },
    qualification: {
      type: String,
      required: true,
      enum: ["class-10", "class-12", "undergraduate", "graduate", "postgraduate"],
    },
    interests: [
      {
        type: String,
        enum: [
          "arts",
          "science",
          "commerce",
          "vocational",
          "healthcare",
          "engineering",
          "education",
          "sports",
          "other",
        ],
      },
    ],
    goals: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
)

userSchema.index({ email: 1 })
userSchema.index({ clerkUserId: 1 })
userSchema.index({ role: 1 })

studentProfileSchema.index({ userId: 1 })
studentProfileSchema.index({ clerkUserId: 1 })
studentProfileSchema.index({ qualification: 1 })
studentProfileSchema.index({ interests: 1 })

const User = mongoose.model("User", userSchema)
const StudentProfile = mongoose.model("StudentProfile", studentProfileSchema)

async function initializeDatabase() {
  try {
    console.log("🔄 Connecting to MongoDB...")
    await mongoose.connect(MONGO_URI)
    console.log("✅ Connected to MongoDB successfully")

    console.log("🔄 Creating database indexes...")
    await User.createIndexes()
    await StudentProfile.createIndexes()
    console.log("✅ Database indexes created successfully")

    console.log("🔄 Checking existing data...")
    const userCount = await User.countDocuments()
    const profileCount = await StudentProfile.countDocuments()

    console.log(`📊 Current database stats:`)
    console.log(`   - Users: ${userCount}`)
    console.log(`   - Student Profiles: ${profileCount}`)

    if (userCount === 0) {
      console.log("🔄 Creating sample data...")
      await createSampleData()
    } else {
      console.log("ℹ️  Database already contains data, skipping sample data creation")
    }

    console.log("🎉 Database initialization completed successfully!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

async function createSampleData() {
  try {

    const sampleUsers = [
      {
        name: "Alex Johnson",
        email: "alex.johnson@example.com",
        role: "student",
        clerkUserId: "student-demo-001",
      },
      {
        name: "Emma Davis",
        email: "emma.davis@example.com",
        role: "student",
        clerkUserId: "student-demo-002",
      },
      {
        name: "Michael Chen",
        email: "michael.chen@example.com",
        role: "student",
        clerkUserId: "student-demo-003",
      },
      {
        name: "Sarah Johnson",
        email: "sarah.johnson@example.com",
        role: "parent",
        clerkUserId: "parent-demo-001",
      },
      {
        name: "Ms. Rodriguez",
        email: "m.rodriguez@school.edu",
        role: "counselor",
        clerkUserId: "counselor-demo-001",
      },
    ]

    console.log("   Creating sample users...")
    const createdUsers = await User.insertMany(sampleUsers)
    console.log(`   ✅ Created ${createdUsers.length} sample users`)

    const studentUsers = createdUsers.filter((user) => user.role === "student")
    const sampleProfiles = [
      {
        userId: studentUsers[0]._id,
        clerkUserId: studentUsers[0].clerkUserId,
        qualification: "class-12",
        interests: ["science", "engineering", "technology"],
        goals:
          "I want to become a software engineer and work at a leading tech company. My goal is to develop innovative applications that solve real-world problems and make a positive impact on society.",
      },
      {
        userId: studentUsers[1]._id,
        clerkUserId: studentUsers[1].clerkUserId,
        qualification: "class-11",
        interests: ["healthcare", "science", "education"],
        goals:
          "I aspire to become a doctor and specialize in pediatrics. I want to help children and their families during challenging times and contribute to medical research.",
      },
      {
        userId: studentUsers[2]._id,
        clerkUserId: studentUsers[2].clerkUserId,
        qualification: "class-12",
        interests: ["commerce", "arts", "other"],
        goals:
          "I am interested in pursuing a career in business and entrepreneurship. My goal is to start my own company and create innovative solutions in the e-commerce space.",
      },
    ]

    console.log("   Creating sample student profiles...")
    const createdProfiles = await StudentProfile.insertMany(sampleProfiles)
    console.log(`   ✅ Created ${createdProfiles.length} sample student profiles`)

    console.log("✅ Sample data created successfully")
  } catch (error) {
    console.error("❌ Error creating sample data:", error)
    throw error
  }
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("🏁 Database initialization script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Database initialization script failed:", error)
      process.exit(1)
    })
}

module.exports = { initializeDatabase, User, StudentProfile }
