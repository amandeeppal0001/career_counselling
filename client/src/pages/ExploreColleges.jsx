"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import CollegeMap from "./CollegeMap.jsx"
import LoadingSkeleton from "./LoadingSkeleton"
import { searchColleges } from "../services/collegeApi"

const ExploreColleges = () => {
  const navigate = useNavigate()
  const [searchFilters, setSearchFilters] = useState({
    location: "",
    collegeType: "",
    courses: "",
    degreeLevel: "",
    budget: "",
    ranking: "",
    examsAccepted: "",
  })
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  const [sortBy, setSortBy] = useState("ranking")

  const handleSearch = async () => {
    setLoading(true)
    try {
      const data = await searchColleges(searchFilters)

      if (data.success) {
        setColleges(data.colleges || [])
      } else {
        console.error("Search failed:", data.error)
        setColleges([])
      }
    } catch (error) {
      console.error("Error searching colleges:", error)
      setColleges([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setSearchFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const sortedColleges = [...colleges].sort((a, b) => {
    switch (sortBy) {
      case "ranking":
        return (a.ranking || 999) - (b.ranking || 999)
      case "fees":
        return (a.fees || 0) - (b.fees || 0)
      case "name":
        return a.name.localeCompare(b.name)
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student-dashboard")}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Explore Colleges</h1>
              <p className="text-gray-600">Find the perfect college for your future</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔍</span>
            <h2 className="text-xl font-semibold">Search Filters</h2>
          </div>
          <p className="text-gray-600 mb-6">Customize your search to find colleges that match your preferences</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <input
                type="text"
                placeholder="Enter city, state, or region"
                value={searchFilters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">College Type</label>
              <select
                onChange={(e) => handleFilterChange("collegeType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select type</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="community">Community College</option>
                <option value="technical">Technical Institute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Courses/Streams</label>
              <select
                onChange={(e) => handleFilterChange("courses", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select field</option>
                <option value="engineering">Engineering</option>
                <option value="medicine">Medicine</option>
                <option value="business">Business</option>
                <option value="arts">Arts & Humanities</option>
                <option value="science">Science</option>
                <option value="law">Law</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Degree Level</label>
              <select
                onChange={(e) => handleFilterChange("degreeLevel", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="undergraduate">Undergraduate</option>
                <option value="graduate">Graduate</option>
                <option value="doctorate">Doctorate</option>
                <option value="certificate">Certificate</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Budget Range</label>
              <select
                onChange={(e) => handleFilterChange("budget", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select budget</option>
                <option value="0-10000">Under $10,000</option>
                <option value="10000-25000">$10,000 - $25,000</option>
                <option value="25000-50000">$25,000 - $50,000</option>
                <option value="50000+">$50,000+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Ranking</label>
              <select
                onChange={(e) => handleFilterChange("ranking", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select ranking</option>
                <option value="top-10">Top 10</option>
                <option value="top-50">Top 50</option>
                <option value="top-100">Top 100</option>
                <option value="all">All Rankings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Exams Accepted</label>
              <select
                onChange={(e) => handleFilterChange("examsAccepted", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select exam</option>
                <option value="sat">SAT</option>
                <option value="act">ACT</option>
                <option value="gre">GRE</option>
                <option value="gmat">GMAT</option>
                <option value="toefl">TOEFL</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                🔍 {loading ? "Searching..." : "Search Colleges"}
              </button>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {colleges.length > 0 ? `${colleges.length} Colleges Found` : "Search Results"}
              </h2>
              {colleges.length > 0 && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ranking">Sort by Ranking</option>
                  <option value="fees">Sort by Fees</option>
                  <option value="name">Sort by Name</option>
                </select>
              )}
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {loading ? (
                <LoadingSkeleton />
              ) : sortedColleges.length > 0 ? (
                sortedColleges.map((college, index) => (
                  <div
                    key={index}
                    className={`bg-white rounded-lg shadow-sm border p-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedCollege?.name === college.name ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => setSelectedCollege(college)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{college.name}</h3>
                        <p className="text-gray-600 flex items-center gap-1 mt-1">📍 {college.location}</p>
                      </div>
                      {college.ranking && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-sm">
                          #{college.ranking}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">💰</span>
                        <span>${college.fees?.toLocaleString() || "N/A"}/year</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">👥</span>
                        <span>{college.students?.toLocaleString() || "N/A"} students</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-600">⭐</span>
                        <span>{college.rating || "N/A"}/5.0</span>
                      </div>
                      <div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {college.type || "University"}
                        </span>
                      </div>
                    </div>

                    {college.programs && (
                      <div>
                        <p className="text-sm font-medium mb-2">Popular Programs:</p>
                        <div className="flex flex-wrap gap-2">
                          {college.programs.slice(0, 3).map((program, idx) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                              {program}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🔍</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No colleges found</h3>
                  <p className="text-gray-600">Try adjusting your search filters to find more results.</p>
                </div>
              )}
            </div>
          </div>

          {}
          <div>
            <h2 className="text-xl font-semibold mb-4">College Locations</h2>
            <div className="h-[600px] rounded-lg overflow-hidden">
              <CollegeMap colleges={colleges} selectedCollege={selectedCollege} onCollegeSelect={setSelectedCollege} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreColleges
