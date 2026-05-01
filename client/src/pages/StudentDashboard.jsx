

"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import ProfileCompletionPopup from "./ProfileCompletionPopup"

const StudentDashboard = ({ onLogout }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const [user, setUser] = useState(() => {
    return location.state?.user || JSON.parse(localStorage.getItem("user")) || null
  })

  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [profileCompleted, setProfileCompleted] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [showPastAppointments, setShowPastAppointments] = useState(false)
  const [rescheduleData, setRescheduleData] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [conversations, setConversations] = useState([])

  console.log("🔵 StudentDashboard rendered. User state:", user)

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    console.log("🟠 useEffect triggered. Current user:", user)

    if (!user) {
      console.log("⛔ No user found. Skipping profile fetch.")
      return
    }
    if (!user._id) {
      console.log("⛔ User object has no _id:", user)
      return
    }
    if (user.role !== "student") {
      console.log("ℹ User role is not student. Role:", user.role)
      return
    }

    const checkProfileCompletion = async () => {
      try {
        console.log("🟢 Fetching profile for userId:", user._id)

        const response = await fetch(`https://career-counselling-gray.vercel.app/api/users/profile/${user._id}`)
        console.log("🔵 Fetch response status:", response.status)

        if (!response.ok) {
          console.warn("⚠ No profile found, showing popup.")
          setShowProfilePopup(true)
          return
        }

        const profile = await response.json()
        console.log("✅ Fetched profile data from backend:", profile)

        if (profile && profile.profileCompleted) {
          console.log("🎉 Profile marked completed in DB.")
          setUserProfile(profile)
          setProfileCompleted(true)
        } else {
          console.warn("⚠ Profile exists but profileCompleted=false.")
          setShowProfilePopup(true)
        }
      } catch (error) {
        console.error("🔥 Error checking profile:", error)
        setShowProfilePopup(true)
      }
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`https://career-counselling-gray.vercel.app/api/appointments/student/${user._id}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    checkProfileCompletion()
    fetchAppointments()
  }, [user])

  useEffect(() => {
    if (activeTab === "messages" && user) {
      const fetchConversations = async () => {
        try {
          const response = await fetch(`https://career-counselling-gray.vercel.app/api/messages/conversations/${user._id}`)
          if (response.ok) {
            const data = await response.json()
            setConversations(data)
          }
        } catch (error) {
          console.error("Error fetching conversations:", error)
        }
      }
      fetchConversations()
    }
  }, [activeTab, user])

  const handleProfileComplete = (profileData) => {
    console.log("✅ Profile completed in popup. Saving to state:", profileData)
    setUserProfile(profileData)
    setProfileCompleted(true)
    setShowProfilePopup(false)

    const updatedUser = { ...user, profileCompleted: true }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const res = await fetch(`https://career-counselling-gray.vercel.app/api/appointments/cancel/${id}`, { method: 'PUT' });
      if (res.ok) {
        setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: 'Cancelled' } : app));
        alert("Appointment cancelled successfully");
      } else {
        alert("Failed to cancel appointment");
      }
    } catch (e) {
      console.error(e);
    }
  }

  const handleRescheduleSubmit = async (e, id) => {
    e.preventDefault();
    try {
      const res = await fetch(`https://career-counselling-gray.vercel.app/api/appointments/reschedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: rescheduleData.date, time: rescheduleData.time })
      });
      if (res.ok) {
        alert("Appointment rescheduled successfully!");
        window.location.reload(); 
      } else {
        alert("Failed to reschedule appointment");
      }
    } catch (e) {
      console.error(e);
    }
  }

  const upcomingAppointments = appointments.filter(app => 
    app.status === 'Scheduled' && new Date(app.endTime || app.appointmentTime) >= new Date()
  );

  const pastAppointments = appointments.filter(app => 
    app.status === 'Cancelled' || app.status === 'Completed' || new Date(app.endTime || app.appointmentTime) < new Date()
  );

  const isCallActive = (time) => new Date() >= new Date(new Date(time).getTime() - 5 * 60000);

  const features = [
    {
      title: "Explore Colleges",
      description: "Discover colleges that match your interests and academic profile",
      icon: "🏫",
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Generate Career Roadmap",
      description: "Get personalized career guidance based on your profile and goals",
      icon: "🗺",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
    },
    {
      title: "Still Confused?",
      description: "Take our comprehensive assessment to find your perfect career path",
      icon: "🤔",
      gradient: "from-yellow-500 to-orange-500",
      hoverGradient: "from-yellow-600 to-orange-600",
    },
    {
      title: "Consult Counsellor",
      description: "Get expert advice from professional career counsellors",
      icon: "👨‍🏫",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
    },
  ]

  const handleFeatureClick = (featureTitle) => {
    if (!profileCompleted) {
      alert("Please complete your profile first to access this feature!")
      setShowProfilePopup(true)
      return
    }
    console.log(`Clicked ${featureTitle}`)
    if (featureTitle === "Explore Colleges") {
      navigate("/explore-colleges")
    }
    if (featureTitle === "Generate Career Roadmap") {
      navigate("/career-roadmap")
    }
    if (featureTitle === "Still Confused?") {
      navigate("/select")
    }

     if (featureTitle === "Consult Counsellor") {
      navigate("/consult-counsellor", { state: { user } })
    }

  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎓</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Career Advisor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("messages")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeTab === "messages"
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Messages
              </button>
              <span className="text-gray-700">Welcome, {user?.email}</span>
              <button
                onClick={() => {
                  localStorage.removeItem("user")
                  setUser(null)
                  navigate("/")
                  if (onLogout) onLogout()
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
      {profileCompleted ? (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-green-400 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 font-medium">
                Profile completed! You're all set to explore your career options.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Complete your profile to unlock all features and get personalized recommendations.
              </p>
              <button
                onClick={() => setShowProfilePopup(true)}
                className="mt-2 text-yellow-800 underline hover:text-yellow-900"
              >
                Complete Profile Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "dashboard" && (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Career Journey Starts Here</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore colleges, get career guidance, and plan your future with our comprehensive tools designed just for
            students like you.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                !profileCompleted ? "opacity-75" : ""
              }`}
              onClick={() => handleFeatureClick(feature.title)}
            >
              <div className="p-6">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-200 hover:scale-110`}
                >
                  <span className="text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                <p className="text-gray-600 text-sm text-center leading-relaxed">{feature.description}</p>
              </div>
              <div className="px-6 pb-6">
                <button
                  className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                    profileCompleted
                      ? `bg-gradient-to-r ${feature.gradient} hover:${feature.hoverGradient} text-white shadow-md hover:shadow-lg`
                      : "bg-gray-100 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {profileCompleted ? "Get Started" : "Complete Profile First"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Appointments Section */}
        {appointments.length > 0 && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Scheduled Appointments</h3>
              <button 
                onClick={() => setShowPastAppointments(!showPastAppointments)}
                className="text-blue-600 font-medium hover:text-blue-800 transition-colors"
              >
                {showPastAppointments ? "Hide Past Appointments" : "View Past Appointments"}
              </button>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.length === 0 && <p className="text-gray-500 italic">No upcoming appointments.</p>}

              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="border border-blue-200 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-md transition-shadow bg-blue-50">
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{appointment.counselor?.name || 'Counsellor'}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Email:</span> {appointment.counselor?.email || 'N/A'}
                    </p>
                    <div className="flex gap-4 text-sm mb-4 md:mb-0">
                      <span className="flex items-center text-blue-600 bg-white px-3 py-1 rounded-full font-medium border border-blue-100">
                        📅 {new Date(appointment.appointmentTime).toLocaleDateString()}
                      </span>
                      <span className="flex items-center text-purple-600 bg-white px-3 py-1 rounded-full font-medium border border-purple-100">
                        ⏰ {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className={`flex items-center px-3 py-1 rounded-full font-medium bg-white border ${appointment.mode === 'Online' ? 'text-green-600 border-green-100' : 'text-orange-600 border-orange-100'}`}>
                        {appointment.mode === 'Online' ? '🎥 Video Call' : '🏢 In-person'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {rescheduleData && rescheduleData.id === appointment._id ? (
                      <form onSubmit={(e) => handleRescheduleSubmit(e, appointment._id)} className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <input type="date" required value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                        <input type="time" required value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                        <div className="flex gap-2">
                          <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm w-full font-medium">Save</button>
                          <button type="button" onClick={() => setRescheduleData(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm w-full font-medium">Cancel</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {appointment.mode === 'Online' && (
                          <button
                            onClick={() => navigate(`/video-call/${appointment._id}`)}
                            disabled={!isCallActive(appointment.appointmentTime)}
                            className={`px-4 py-2 rounded-lg transition-colors font-semibold flex items-center justify-center shadow-md ${isCallActive(appointment.appointmentTime) ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            title={!isCallActive(appointment.appointmentTime) ? `Call starts 5 mins before ${new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                          >
                            <span className="mr-2">🎥</span> Join Call
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setRescheduleData({ id: appointment._id, date: '', time: '' })}
                            className="flex-1 bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
                          >
                            Reschedule
                          </button>
                          <button 
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="flex-1 bg-white border border-red-500 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {showPastAppointments && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-bold text-gray-700 mb-4">Past & Cancelled Appointments</h4>
                  {pastAppointments.length === 0 ? (
                    <p className="text-gray-500 italic">No past appointments.</p>
                  ) : (
                    <div className="space-y-3">
                      {pastAppointments.map((appointment) => (
                        <div key={appointment._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between bg-gray-50 opacity-75">
                          <div>
                            <h4 className="font-bold text-gray-700">{appointment.counselor?.name || 'Counsellor'}</h4>
                            <div className="flex gap-4 text-sm mt-2">
                              <span className="text-gray-600">📅 {new Date(appointment.appointmentTime).toLocaleDateString()}</span>
                              <span className="text-gray-600">⏰ {new Date(appointment.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span className={`font-semibold ${appointment.status === 'Cancelled' ? 'text-red-500' : 'text-gray-600'}`}>
                                Status: {appointment.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile Summary */}
        {profileCompleted && userProfile && (
          <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Your Profile Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                <h4 className="font-bold text-blue-900 mb-2">Academic Info</h4>
                <p className="text-sm text-blue-700">Grade: {userProfile.grade}</p>
                <p className="text-sm text-blue-700">Stream: {userProfile.stream}</p>
                <p className="text-sm text-blue-700">Age: {userProfile.age}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                <h4 className="font-bold text-green-900 mb-2">Location</h4>
                <p className="text-sm text-green-700">{userProfile.location}</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                <h4 className="font-bold text-purple-900 mb-2">Interests</h4>
                <p className="text-sm text-purple-700">{userProfile.interests?.join(", ") || "Not specified"}</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                <h4 className="font-bold text-orange-900 mb-2">Strong Subjects</h4>
                <p className="text-sm text-orange-700">{userProfile.strongSubjects?.join(", ") || "Not specified"}</p>
              </div>
            </div>
            {userProfile.careerGoals && (
              <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2">Career Goals</h4>
                <p className="text-sm text-gray-700">{userProfile.careerGoals}</p>
              </div>
            )}
          </div>
        )}
      </main>
      )}

      {activeTab === "messages" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No messages yet.</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv._id}
                    onClick={() => navigate(`/message/${conv._id}`)}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      conv.unreadCount > 0 ? "bg-blue-50 border-l-4 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-500">
                            {conv.otherUser.role === "student" ? "👨‍🎓" : "👨‍🏫"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{conv.otherUser.name}</h4>
                            <p className="text-sm text-gray-500 capitalize">{conv.otherUser.role}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <span className="w-5 h-5 bg-blue-500 text-white text-xs font-bold flex items-center justify-center rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm mb-2 truncate">{conv.latestMessage.text}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(conv.latestMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Popup */}
      {showProfilePopup && (
        <ProfileCompletionPopup
          user={user}
          onComplete={handleProfileComplete}
          onClose={() => setShowProfilePopup(false)}
        />
      )}
    </div>
  )
}

export default StudentDashboard
