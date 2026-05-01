
const mongoose = require("mongoose")
require("dotenv").config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career-advisor"

const { User, StudentProfile } = require("./init-database")

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")
    await mongoose.connect(MONGO_URI)
    console.log("✅ Connected to MongoDB")

    const additionalUsers = [
      {
        name: "Jessica Williams",
        email: "jessica.williams@example.com",
        role: "student",
        clerkUserId: "student-demo-004",
      },
      {
        name: "David Brown",
        email: "david.brown@example.com",
        role: "student",
        clerkUserId: "student-demo-005",
      },
      {
        name: "Lisa Anderson",
        email: "lisa.anderson@example.com",
        role: "student",
        clerkUserId: "student-demo-006",
      },
      {
        name: "Robert Wilson",
        email: "robert.wilson@example.com",
        role: "parent",
        clerkUserId: "parent-demo-002",
      },
      {
        name: "Dr. Thompson",
        email: "dr.thompson@school.edu",
        role: "counselor",
        clerkUserId: "counselor-demo-002",
      },
    ]

    console.log("🔄 Creating additional users...")
    const newUsers = []

    for (const userData of additionalUsers) {
      try {
        const existingUser = await User.findOne({ email: userData.email })
        if (!existingUser) {
          const user = new User(userData)
          await user.save()
          newUsers.push(user)
          console.log(`   ✅ Created user: ${userData.name}`)
        } else {
          console.log(`   ⚠️  User already exists: ${userData.name}`)
        }
      } catch (error) {
        console.log(`   ❌ Error creating user ${userData.name}:`, error.message)
      }
    }

    const newStudentUsers = newUsers.filter((user) => user.role === "student")
    const additionalProfiles = [
      {
        userId: newStudentUsers[0]?._id,
        clerkUserId: newStudentUsers[0]?.clerkUserId,
        qualification: "undergraduate",
        interests: ["arts", "education", "other"],
        goals:
          "I want to become a teacher and inspire the next generation. My goal is to develop innovative teaching methods that make learning more engaging and accessible for all students.",
      },
      {
        userId: newStudentUsers[1]?._id,
        clerkUserId: newStudentUsers[1]?.clerkUserId,
        qualification: "class-12",
        interests: ["vocational", "engineering", "technology"],
        goals:
          "I am interested in mechanical engineering and want to work in the automotive industry. My goal is to contribute to the development of sustainable transportation solutions.",
      },
      {
        userId: newStudentUsers[2]?._id,
        clerkUserId: newStudentUsers[2]?.clerkUserId,
        qualification: "graduate",
        interests: ["commerce", "technology", "other"],
        goals:
          "I want to pursue a career in financial technology (FinTech). My goal is to develop innovative financial solutions that make banking and investments more accessible to everyone.",
      },
    ].filter((profile) => profile.userId) 

    if (additionalProfiles.length > 0) {
      console.log("🔄 Creating additional student profiles...")
      for (const profileData of additionalProfiles) {
        try {
          const existingProfile = await StudentProfile.findOne({ clerkUserId: profileData.clerkUserId })
          if (!existingProfile) {
            const profile = new StudentProfile(profileData)
            await profile.save()
            console.log(`   ✅ Created profile for user ID: ${profileData.userId}`)
          } else {
            console.log(`   ⚠️  Profile already exists for user ID: ${profileData.userId}`)
          }
        } catch (error) {
          console.log(`   ❌ Error creating profile for user ID ${profileData.userId}:`, error.message)
        }
      }
    }

    const totalUsers = await User.countDocuments()
    const totalProfiles = await StudentProfile.countDocuments()
    const usersByRole = await User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }])

    console.log("\n📊 Final database statistics:")
    console.log(`   Total Users: ${totalUsers}`)
    console.log(`   Total Student Profiles: ${totalProfiles}`)
    console.log("   Users by Role:")
    usersByRole.forEach((role) => {
      console.log(`     - ${role._id}: ${role.count}`)
    })

    console.log("\n🎉 Database seeding completed successfully!")
  } catch (error) {
    console.error("❌ Database seeding failed:", error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🏁 Database seeding script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Database seeding script failed:", error)
      process.exit(1)
    })
}

module.exports = { seedDatabase }
