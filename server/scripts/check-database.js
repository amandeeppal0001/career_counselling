
const mongoose = require("mongoose")
require("dotenv").config()

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/career-advisor"

const { User, StudentProfile } = require("./init-database")

async function checkDatabase() {
  try {
    console.log("🔍 Checking database health and contents...")
    await mongoose.connect(MONGO_URI)
    console.log("✅ Connected to MongoDB successfully")

    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log("\n📁 Available collections:")
    collections.forEach((collection) => {
      console.log(`   - ${collection.name}`)
    })

    console.log("\n👥 Users:")
    const users = await User.find({}).sort({ createdAt: -1 })
    console.log(`   Total: ${users.length}`)

    if (users.length > 0) {
      console.log("   Recent users:")
      users.slice(0, 5).forEach((user) => {
        console.log(`     - ${user.name} (${user.email}) - ${user.role}`)
      })
    }

    console.log("\n🎓 Student Profiles:")
    const profiles = await StudentProfile.find({}).populate("userId", "name email").sort({ createdAt: -1 })
    console.log(`   Total: ${profiles.length}`)

    if (profiles.length > 0) {
      console.log("   Recent profiles:")
      profiles.slice(0, 5).forEach((profile) => {
        console.log(`     - ${profile.userId.name}: ${profile.qualification}, ${profile.interests.length} interests`)
      })
    }

    console.log("\n🔍 Data integrity checks:")

    const orphanedProfiles = await StudentProfile.find({}).populate("userId")
    const orphaned = orphanedProfiles.filter((profile) => !profile.userId)
    console.log(`   Orphaned profiles: ${orphaned.length}`)

    const studentUsers = await User.find({ role: "student" })
    const studentsWithoutProfiles = []

    for (const student of studentUsers) {
      const profile = await StudentProfile.findOne({ userId: student._id })
      if (!profile) {
        studentsWithoutProfiles.push(student)
      }
    }
    console.log(`   Students without profiles: ${studentsWithoutProfiles.length}`)

    if (studentsWithoutProfiles.length > 0) {
      console.log("   Students missing profiles:")
      studentsWithoutProfiles.forEach((student) => {
        console.log(`     - ${student.name} (${student.email})`)
      })
    }

    console.log("\n📇 Database indexes:")
    const userIndexes = await User.collection.getIndexes()
    const profileIndexes = await StudentProfile.collection.getIndexes()

    console.log("   User indexes:")
    Object.keys(userIndexes).forEach((indexName) => {
      console.log(`     - ${indexName}`)
    })

    console.log("   StudentProfile indexes:")
    Object.keys(profileIndexes).forEach((indexName) => {
      console.log(`     - ${indexName}`)
    })

    console.log("\n✅ Database health check completed successfully!")
  } catch (error) {
    console.error("❌ Database health check failed:", error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

if (require.main === module) {
  checkDatabase()
    .then(() => {
      console.log("🏁 Database check script completed")
      process.exit(0)
    })
    .catch((error) => {
      console.error("💥 Database check script failed:", error)
      process.exit(1)
    })
}

module.exports = { checkDatabase }
