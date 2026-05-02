"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"

const BookAppointment = () => {
  const { counsellorId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/", { replace: true })
    }
  }, [navigate])

  const [counsellor, setCounsellor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [sessionType, setSessionType] = useState("video")
  const [message, setMessage] = useState("")
  const [isBooking, setIsBooking] = useState(false)


  const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);


  const getAvailableDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i <= 10; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)


      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0])
      }
    }
    return dates
  }

  useEffect(() => {
    const fetchCounsellorDetails = async () => {
      try {
        const response = await fetch(`https://career-counselling-nr04.onrender.com/api/counsellors/${counsellorId}`)
        if (response.ok) {
          const data = await response.json()
          setCounsellor(data)
        }
      } catch (error) {
        console.error("Error fetching counsellor:", error)
      } finally {
        setLoading(false)
      }
    }

    if (counsellorId) {
      fetchCounsellorDetails()
    }
  }, [counsellorId])

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !sessionType) {
      alert("Please fill in all required fields")
      return
    }

    setIsBooking(true)

    try {
      const appointmentData = {
        studentId: user._id,
        counsellorId: counsellor.userId, 
        date: selectedDate,
        time: selectedTime,
        sessionType: sessionType,
        message: message,
        status: "pending"
      }

      const response = await fetch("https://career-counselling-nr04.onrender.com/api/appointments/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(appointmentData)
      })

      if (response.ok) {
        const responseData = await response.json();
        alert("Appointment booked successfully! You will receive a confirmation soon.")
        if (sessionType === "video") {
          const generatedRoomId = responseData.appointmentId || "room_" + Math.random().toString(36).substring(2, 9);
          navigate(`/video-call/${generatedRoomId}`);
        } else {
          navigate("/consult-counsellor", { state: { user } })
        }
      } else {
        throw new Error("Failed to book appointment")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Failed to book appointment. Please try again.")
    } finally {
      setIsBooking(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">Please login to book an appointment.</p>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="ml-3 text-lg text-gray-600">Loading...</span>
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
                <span className="text-white font-bold text-lg">📅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          {counsellor && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{counsellor.fullName}</h2>
                <p className="text-purple-600 font-medium">{counsellor.specialization}</p>
                <div className="flex items-center justify-center mt-2">
                  <div className="flex text-yellow-400">
                    {'★★★★★'.slice(0, Math.floor(counsellor.rating || 4.5))}
                  </div>
                  <span className="ml-2 text-gray-600">
                    {counsellor.rating || 4.5} ({counsellor.reviewsCount || 12} reviews)
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600">🎓</span>
                  <span className="text-gray-700">{counsellor.experience} years experience</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600">💰</span>
                  <span className="text-gray-700">₹{counsellor.consultationFee || 500} per session</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-purple-600">⏰</span>
                  <span className="text-gray-700">{counsellor.sessionDuration || 45} minutes</span>
                </div>
              </div>
            </div>
          )}

          {}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Your Session</h3>

            <div className="space-y-6">
              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                >
                  <option value="">Choose a date</option>
                  {getAvailableDates().map(date => {
                    const dateObj = new Date(date)
                    const formattedDate = dateObj.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    return (
                      <option key={date} value={date}>{formattedDate}</option>
                    )
                  })}
                </select>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        selectedTime === time
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Type *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setSessionType("video")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      sessionType === "video"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">🎥</div>
                    <div className="font-medium">Video Call</div>
                    <div className="text-sm text-gray-500">Face-to-face online session</div>
                  </button>
                  <button
                    onClick={() => setSessionType("phone")}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      sessionType === "phone"
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-2xl mb-2">📞</div>
                    <div className="font-medium">Phone Call</div>
                    <div className="text-sm text-gray-500">Audio-only session</div>
                  </button>
                </div>
              </div>

              {}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Tell the counsellor about your specific concerns or goals for this session..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>

              {}
              <button
                onClick={handleBooking}
                disabled={isBooking || !selectedDate || !selectedTime}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  isBooking || !selectedDate || !selectedTime
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isBooking ? "Booking..." : "Book Appointment"}
              </button>

              <div className="text-center text-sm text-gray-500">
                <p>💡 You will receive a confirmation email with session details</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookAppointment