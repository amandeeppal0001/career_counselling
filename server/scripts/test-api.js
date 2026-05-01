
const API_BASE_URL = "http://localhost:5000"

async function testAPI() {
  console.log("🚀 Testing Career Advisor API...\n")

  try {

    console.log("1. Testing health check...")
    const healthResponse = await fetch(`${API_BASE_URL}/api/health`)
    const healthData = await healthResponse.json()
    console.log("✅ Health check:", healthData)
    console.log("")

    const mockClerkUserId = "test-user-123"
    const headers = {
      "Content-Type": "application/json",
      "x-clerk-user-id": mockClerkUserId,
    }

    console.log("2. Testing user creation...")
    const userData = {
      name: "Test Student",
      email: "test.student@example.com",
      role: "student",
    }

    const userResponse = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers,
      body: JSON.stringify(userData),
    })
    const userResult = await userResponse.json()
    console.log("✅ User creation:", userResult)
    console.log("")

    console.log("3. Testing student profile creation...")
    const profileData = {
      qualification: "class-12",
      interests: ["science", "engineering", "technology"],
      goals:
        "I want to become a software engineer and work at a tech company. My goal is to develop innovative applications that can help people solve real-world problems.",
    }

    const profileResponse = await fetch(`${API_BASE_URL}/api/student/profile`, {
      method: "POST",
      headers,
      body: JSON.stringify(profileData),
    })
    const profileResult = await profileResponse.json()
    console.log("✅ Student profile creation:", profileResult)
    console.log("")

    console.log("4. Testing get student profile...")
    const getProfileResponse = await fetch(`${API_BASE_URL}/api/student/profile`, {
      headers,
    })
    const getProfileResult = await getProfileResponse.json()
    console.log("✅ Get student profile:", getProfileResult)
    console.log("")

    console.log("🎉 All API tests completed successfully!")
  } catch (error) {
    console.error("❌ API test failed:", error)
  }
}

testAPI()
