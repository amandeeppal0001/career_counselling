"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"

const ConsultCounsellor = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user

  const [counsellors, setCounsellors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSpecialization, setSelectedSpecialization] = useState("")
  const [followedCounsellors, setFollowedCounsellors] = useState(new Set())

  useEffect(() => {
    const fetchCounsellors = async () => {
      try {
        setLoading(true)
       const response = await fetch("https://career-counselling-gray.vercel.app/api/users/counsellors/all");

        if (!response.ok) {
          throw new Error("Failed to fetch counsellors")
        }

        const data = await response.json()
        setCounsellors(data)
      } catch (err) {
        console.error("Error fetching counsellors:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCounsellors()
  }, [])

  const specializations = [...new Set(counsellors.map(c => c.specialization))]

  const filteredCounsellors = counsellors.filter(counsellor => {
    const matchesSearch = counsellor.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         counsellor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialization = selectedSpecialization === "" || counsellor.specialization === selectedSpecialization

    return matchesSearch && matchesSpecialization
  })

  const handleBookAppointment = (counsellorId) => {

    navigate(`/book-appointment/${counsellorId}`, { state: { user } })
  }

  const handleFollow = (counsellorId) => {
    setFollowedCounsellors(prev => {
      const newSet = new Set(prev)
      if (newSet.has(counsellorId)) {
        newSet.delete(counsellorId)
      } else {
        newSet.add(counsellorId)
      }
      return newSet
    })
  }

  const handleMessage = (counsellorId) => {

    navigate(`/message/${counsellorId}`, { state: { user } })
  }

  const handleViewProfile = (counsellorId) => {

    navigate(`/counsellor-profile/${counsellorId}`, { state: { user } })
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login to access this page.</p>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
              >
                ← Back
              </button>
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">👨‍🏫</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Consult Counsellors</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("user")
                  navigate("/")
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search counsellors by name or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="lg:w-64">
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect with Expert Career Counsellors</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get personalized career guidance from certified professionals who understand your journey and goals.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-lg text-gray-600">Loading counsellors...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex">
              <div className="text-red-400 text-xl mr-3">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Error loading counsellors</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                Found <span className="font-semibold text-purple-600">{filteredCounsellors.length}</span> counsellors
              </p>
            </div>

            {filteredCounsellors.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No counsellors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCounsellors.map((counsellor) => (
                  <div key={counsellor._id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                    {}
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <span className="text-2xl">👨‍💼</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold">{counsellor.fullName}</h3>
                          <p className="text-purple-100 text-sm">{counsellor.specialization}</p>
                          <div className="flex items-center mt-2">
                            <div className="flex text-yellow-300">
                              {'★★★★★'.slice(0, Math.floor(counsellor.rating || 4.5))}
                            </div>
                            <span className="ml-2 text-sm text-purple-100">
                              {counsellor.rating || 4.5} ({counsellor.reviewsCount || 12} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                          <p className="text-gray-600 text-sm">{counsellor.experience} years of professional counselling</p>
                        </div>

                        {counsellor.qualifications && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Qualifications</h4>
                            <p className="text-gray-600 text-sm">{counsellor.qualifications}</p>
                          </div>
                        )}

                        {counsellor.languages && counsellor.languages.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {counsellor.languages.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                  {lang}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>💰 ₹{counsellor.consultationFee || 500}/session</span>
                            <span>🕒 {counsellor.sessionDuration || 45} mins</span>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => handleBookAppointment(counsellor._id)}
                          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 px-4 rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          📅 Book Appointment
                        </button>

                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleFollow(counsellor._id)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                              followedCounsellors.has(counsellor._id)
                                ? "bg-green-100 text-green-800 border border-green-300"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {followedCounsellors.has(counsellor._id) ? "✅ Following" : "➕ Follow"}
                          </button>

                          <button
                            onClick={() => handleMessage(counsellor.userId || counsellor._id)}
                            className="py-2 px-3 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                          >
                            💬 Message
                          </button>

                          <button
                            onClick={() => handleViewProfile(counsellor._id)}
                            className="py-2 px-3 rounded-lg text-sm font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200 transition-colors"
                          >
                            👁️ Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default ConsultCounsellor