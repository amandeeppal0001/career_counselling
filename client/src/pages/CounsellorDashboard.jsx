"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import CounsellorProfilePopup from "./CounsellorProfilePopup"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://career-counselling-nr04.onrender.com"

const CounsellorDashboard = ({ onLogout }) => {
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
  const [activeTab, setActiveTab] = useState("overview")
  const [conversations, setConversations] = useState([])
  const [isActionLoading, setIsActionLoading] = useState(false)

  console.log("CounsellorDashboard rendered. User state:", user)

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    console.log("useEffect triggered. Current user:", user)

    if (!user) {
      console.log("No user found. Skipping profile fetch.")
      return
    }
    if (!user._id) {
      console.log("User object has no _id:", user)
      return
    }
    if (user.role !== "counselor") {
      console.log("User role is not counselor. Role:", user.role)
      return
    }

    const checkProfileCompletion = async () => {
      try {
        console.log("Fetching counsellor profile for userId:", user._id)

        const response = await fetch(`${API_BASE_URL}/api/users/counsellor-profile/${user._id}`)
        console.log("Fetch response status:", response.status)

        if (!response.ok) {
          console.warn("No profile found, showing popup.")
          setShowProfilePopup(true)
          return
        }

        const profile = await response.json()
        console.log("Fetched counsellor profile data from backend:", profile)

        if (profile && profile.profileCompleted) {
          console.log("Profile marked completed in DB.")
          setUserProfile(profile)
          setProfileCompleted(true)
        } else {
          console.warn("Profile exists but profileCompleted=false.")
          setShowProfilePopup(true)
        }
      } catch (error) {
        console.error("Error checking counsellor profile:", error)
        setShowProfilePopup(true)
      }
    }

    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/appointments/counselor/${user._id}`)
        if (response.ok) {
          const data = await response.json()
          setAppointments(data)
        }
      } catch (error) {
        console.error("Error fetching appointments:", error)
      }
    }

    const fetchConversations = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/messages/conversations/${user._id}`)
        if (response.ok) {
          const data = await response.json()
          setConversations(data)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      }
    }

    checkProfileCompletion()
    fetchAppointments()
    fetchConversations()
  }, [user])

  const handleProfileComplete = (profileData) => {
    console.log("Profile completed in popup. Saving to state:", profileData)
    setUserProfile(profileData)
    setProfileCompleted(true)
    setShowProfilePopup(false)

    const updatedUser = { ...user, profileCompleted: true }
    localStorage.setItem("user", JSON.stringify(updatedUser))
    setUser(updatedUser)
  }

  const handleCancelAppointment = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setIsActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/cancel/${id}`, { 
        method: 'PUT',
        credentials: 'include'
      });
      if (res.ok) {
        setAppointments(prev => prev.map(app => app._id === id ? { ...app, status: 'Cancelled' } : app));
        alert("Appointment cancelled successfully");
      } else {
        alert("Failed to cancel appointment");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  }

  const handleRescheduleSubmit = async (e, id) => {
    e.preventDefault();
    setIsActionLoading(true);
    const appointmentDate = new Date(`${rescheduleData.date}T${rescheduleData.time}:00`)
    try {
      const res = await fetch(`${API_BASE_URL}/api/appointments/reschedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          date: rescheduleData.date, 
          time: rescheduleData.time,
          appointmentTimeISO: appointmentDate.toISOString()
        })
      });
      if (res.ok) {
        alert("Appointment rescheduled successfully!");
        window.location.reload();
      } else {
        alert("Failed to reschedule appointment");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsActionLoading(false);
    }
  }

  const upcomingAppointments = appointments.filter(app => 
    app.status === 'Scheduled' && new Date(app.endTime || app.appointmentTime) >= new Date()
  );

  const pastAppointments = appointments.filter(app => 
    app.status === 'Cancelled' || app.status === 'Completed' || new Date(app.endTime || app.appointmentTime) < new Date()
  );

  const isCallActive = (time) => new Date() >= new Date(new Date(time).getTime() - 5 * 60000);

  const uniqueStudents = new Set(appointments.filter(app => app.student).map(app => app.student._id)).size;

  const totalEarnings = appointments.reduce((sum, app) => {
    if (app.status !== 'Cancelled') {
      return sum + (app.amountPaid || userProfile?.consultationFee || 500);
    }
    return sum;
  }, 0);

  const paidSessionsCount = appointments.filter(app => app.status !== 'Cancelled' && (app.paymentStatus === 'Paid' || app.amountPaid)).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const appointmentsThisMonth = appointments.filter(app => {
    const appDate = new Date(app.appointmentTime);
    return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear;
  }).length;

  const experience = userProfile?.experience || 0;
  const mockRating = Math.min(5.0, (4.0 + (experience * 0.1))).toFixed(1);
  const mockSuccessRate = Math.min(99, (85 + (experience * 2))) + "%";

  const dashboardFeatures = [
    {
      title: "Student Consultations",
      description: "Manage your upcoming and past consultation sessions",
      icon: "👥",
      count: `${upcomingAppointments.length} Active`,
      gradient: "from-blue-500 to-blue-600",
      hoverGradient: "from-blue-600 to-blue-700",
    },
    {
      title: "Career Assessments",
      description: "Review and provide feedback on student assessments",
      icon: "📊",
      count: "8 Pending",
      gradient: "from-green-500 to-green-600",
      hoverGradient: "from-green-600 to-green-700",
    },
    {
      title: "Resource Library",
      description: "Access and share career guidance resources",
      icon: "📚",
      count: "45 Resources",
      gradient: "from-purple-500 to-purple-600",
      hoverGradient: "from-purple-600 to-purple-700",
    },
    {
      title: "Analytics & Reports",
      description: "Track your counseling impact and student progress",
      icon: "📈",
      count: "View Reports",
      gradient: "from-orange-500 to-orange-600",
      hoverGradient: "from-orange-600 to-orange-700",
    },
  ]

  const unreadCount = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-8">
            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white p-6 rounded-2xl shadow-lg border border-purple-500/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100 font-medium">Total Revenue</p>
                    <p className="text-3xl font-black mt-1">₹{totalEarnings}</p>
                    <p className="text-xs text-purple-200 mt-1 font-semibold">{paidSessionsCount} Paid Consultations</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                    💰
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{uniqueStudents}</p>
                    <p className="text-xs text-gray-400 mt-1">Counseled so far</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    👨‍🎓
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{appointmentsThisMonth}</p>
                    <p className="text-xs text-green-600 font-medium mt-1">Active bookings</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                    📅
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Rating & Reviews</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{mockRating} ⭐</p>
                    <p className="text-xs text-yellow-600 font-medium mt-1">Success: {mockSuccessRate}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                    🏆
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {dashboardFeatures.map((feature, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                    !profileCompleted ? "opacity-75" : ""
                  }`}
                  onClick={() => {
                    if (!profileCompleted) {
                      alert("Please complete your profile first to access this feature!")
                      setShowProfilePopup(true)
                      return
                    }
                    console.log(`Clicked ${feature.title}`)
                  }}
                >
                  <div className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 mx-auto transform transition-transform duration-200 hover:scale-110`}
                    >
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">{feature.title}</h3>
                    <p className="text-gray-600 text-sm text-center leading-relaxed mb-4">{feature.description}</p>
                    <div className="text-center">
                      <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                        {feature.count}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "messages":
        return (
          <div className="bg-white rounded-2xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Messages</h3>
              <p className="text-gray-600">Communicate with students, parents, and other counsellors</p>
            </div>
            <div className="divide-y divide-gray-200">
              {conversations.length === 0 && (
                <div className="p-6 text-center text-gray-500">No messages yet.</div>
              )}
              {conversations.map((conv) => (
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
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-blue-500"
                        >
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
              ))}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium">
                View All Messages
              </button>
            </div>
          </div>
        )

      case "profile":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h3>
            {profileCompleted && userProfile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-bold text-blue-900 mb-3">Personal Information</h4>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Name:</strong> {userProfile.fullName}
                    </p>
                    <p className="text-sm text-blue-700 mb-1">
                      <strong>Location:</strong> {userProfile.location}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Phone:</strong> {userProfile.phoneNumber}
                    </p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-xl border border-green-100">
                    <h4 className="font-bold text-green-900 mb-3">Professional Details</h4>
                    <p className="text-sm text-green-700 mb-1">
                      <strong>Specialization:</strong> {userProfile.specialization}
                    </p>
                    <p className="text-sm text-green-700 mb-1">
                      <strong>Experience:</strong> {userProfile.experience} years
                    </p>
                    <p className="text-sm text-green-700">
                      <strong>Fee:</strong> ₹{userProfile.consultationFee}/session
                    </p>
                  </div>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100">
                  <h4 className="font-bold text-purple-900 mb-3">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.expertise?.map((area, index) => (
                      <span key={index} className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-sm">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                  <h4 className="font-bold text-orange-900 mb-3">Qualifications</h4>
                  <div className="flex flex-wrap gap-2">
                    {userProfile.qualifications?.map((qual, index) => (
                      <span key={index} className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-sm">
                        {qual}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Professional Bio</h4>
                  <p className="text-sm text-gray-700">{userProfile.bio}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Complete your profile to start helping students</p>
                <button
                  onClick={() => setShowProfilePopup(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  Complete Profile
                </button>
              </div>
            )}
          </div>
        )

      case "schedule":
        return (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Your Schedule</h3>
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
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{appointment.student?.name || 'Student'}</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-semibold">Email:</span> {appointment.student?.email || 'N/A'}
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
                      <span className="flex items-center px-3 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        💳 {appointment.paymentStatus === 'Free' ? 'Free Session' : `Fee: ₹${appointment.amountPaid || userProfile?.consultationFee || 500} (Paid)`}
                      </span>
                    </div>
                    {appointment.notes && (
                      <p className="mt-3 text-sm text-gray-600 italic">"{appointment.notes}"</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 min-w-[200px]">
                    {rescheduleData && rescheduleData.id === appointment._id ? (
                      <form onSubmit={(e) => handleRescheduleSubmit(e, appointment._id)} className="flex flex-col gap-2 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                        <input type="date" required value={rescheduleData.date} onChange={e => setRescheduleData({...rescheduleData, date: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                        <input type="time" required value={rescheduleData.time} onChange={e => setRescheduleData({...rescheduleData, time: e.target.value})} className="border rounded px-2 py-1 text-sm" />
                        <div className="flex gap-2">
                          <button disabled={isActionLoading} type="submit" className="bg-blue-600 text-white px-3 py-1 rounded text-sm w-full font-medium">
                            {isActionLoading ? "Saving..." : "Save"}
                          </button>
                          <button disabled={isActionLoading} type="button" onClick={() => setRescheduleData(null)} className="bg-gray-300 text-gray-800 px-3 py-1 rounded text-sm w-full font-medium">Cancel</button>
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
                            <span className="mr-2">🎥</span>{isCallActive(appointment.appointmentTime) ? "Join Call" : "Join Call 5 minutes before scheduled appointment time"}
                          </button>
                        )}
                        <div className="flex gap-2">
                          <button 
                            disabled={isActionLoading}
                            onClick={() => setRescheduleData({ id: appointment._id, date: '', time: '' })}
                            className="flex-1 bg-white border border-blue-600 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors disabled:opacity-50"
                          >
                            Reschedule
                          </button>
                          <button 
                            disabled={isActionLoading}
                            onClick={() => handleCancelAppointment(appointment._id)}
                            className="flex-1 bg-white border border-red-500 text-red-500 px-3 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors disabled:opacity-50"
                          >
                            {isActionLoading ? "..." : "Cancel"}
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
                            <h4 className="font-bold text-gray-700">{appointment.student?.name || 'Student'}</h4>
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
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">👨‍🏫</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Counsellor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveTab("messages")}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-xl">💬</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button
                onClick={async () => {
                  try {
                    await fetch("https://career-counselling-nr04.onrender.com/api/users/logout", {
                      method: "POST", 
                      credentials: "include"
                    });
                  } catch (error) {
                    console.error("Logout failed:", error);
                  } finally {
                    localStorage.removeItem("user");
                    setUser(null);
                    navigate("/");
                    if (onLogout) onLogout();
                  }
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
                Profile completed! You're ready to help students achieve their career goals.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded-r-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700 font-medium">
                Complete your profile to start accepting student consultations and unlock all features.
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

      {}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "schedule", name: "Schedule", icon: "📅" },
              { id: "messages", name: "Messages", icon: "💬", badge: unreadCount },
              { id: "profile", name: "Profile", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-purple-500 text-purple-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
                {tab.badge > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-2 py-1">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{renderTabContent()}</main>

      {}
      {showProfilePopup && (
        <CounsellorProfilePopup
          user={user}
          onComplete={handleProfileComplete}
          onClose={() => setShowProfilePopup(false)}
        />
      )}
    </div>
  )
}

export default CounsellorDashboard





















































































































































































































































































































































































































































































































































