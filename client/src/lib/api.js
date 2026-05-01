

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://careercounselling-production-725b.up.railway.app"

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    if (typeof window !== "undefined") {
      const clerkUserId = localStorage.getItem("clerk-user-id") 
      if (clerkUserId) {
        config.headers["x-clerk-user-id"] = clerkUserId
      }
    }

    try {
      console.log(`[v0] API Request: ${config.method || "GET"} ${url}`)

      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        console.error("[v0] API Error:", data)
        throw new Error(data.message || "API request failed")
      }

      console.log("[v0] API Response:", data)
      return data
    } catch (error) {
      console.error("[v0] API Request failed:", error)
      throw error
    }
  }

  async healthCheck() {
    return this.request("/api/health")
  }

  async createUser(userData) {
    return this.request("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getUserProfile() {
    return this.request("/api/users/profile")
  }

  async createStudentProfile(profileData) {
    return this.request("/api/student/profile", {
      method: "POST",
      body: JSON.stringify(profileData),
    })
  }

  async getStudentProfile() {
    return this.request("/api/student/profile")
  }

  async getStudentProfileById(id) {
    return this.request(`/api/student/profile/${id}`)
  }

  async getAllStudents() {
    return this.request("/api/students")
  }
}

const apiClient = new ApiClient()

export default apiClient

export const {
  healthCheck,
  createUser,
  getUserProfile,
  createStudentProfile,
  getStudentProfile,
  getStudentProfileById,
  getAllStudents,
} = apiClient
