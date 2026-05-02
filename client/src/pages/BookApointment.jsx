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
  const [bookedAppointments, setBookedAppointments] = useState([])
  const [fetchingAppointments, setFetchingAppointments] = useState(false)

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const availableDays = counsellor?.availability?.days || []
    
    for (let i = 0; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const localDate = `${year}-${month}-${day}`
      
      if (availableDays.length === 0 || availableDays.includes(dayName)) {
        dates.push(localDate)
      }
    }
    return dates
  }

  const getAvailableTimeSlots = () => {
    const defaultSlots = counsellor?.availability?.timeSlots || []
    
    if (defaultSlots.length === 0) return []

    return defaultSlots.filter(slot => {
      if (!selectedDate) return true
      
      const slotTime = slot.split('-')[0]
      const [hours, minutes] = slotTime.split(':')
      
      // Construct a Date object for this slot on the selected date in LOCAL time
      const slotDate = new Date(`${selectedDate}T${hours.padStart(2, '0')}:${minutes || '00'}:00`)
      
      const isBooked = bookedAppointments.some(app => {
        if (app.status === 'Cancelled') return false
        const appDate = new Date(app.appointmentTime)
        // Compare UTC times (both Date objects will be converted to UTC internally)
        return appDate.getTime() === slotDate.getTime()
      })
      
      return !isBooked
    })
  }

  useEffect(() => {
    const fetchCounsellorDetails = async () => {
      try {
        const response = await fetch(`https://career-counselling-nr04.onrender.com/api/counsellors/${counsellorId}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setCounsellor(data)
          if (data.userId) {
            fetchBookedAppointments(data.userId)
          }
        }
      } catch (error) {
        console.error("Error fetching counsellor:", error)
      } finally {
        setLoading(false)
      }
    }

    const fetchBookedAppointments = async (userId) => {
      setFetchingAppointments(true)
      try {
        const response = await fetch(`https://career-counselling-nr04.onrender.com/api/appointments/counselor/${userId}`, {
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setBookedAppointments(data)
        }
      } catch (error) {
        console.error("Error fetching booked appointments:", error)
      } finally {
        setFetchingAppointments(false)
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
      const timeStr = selectedTime.split('-')[0]
      const [hours, minutes] = timeStr.split(':')
      // Create a Date object in the user's local timezone
      const appointmentDate = new Date(`${selectedDate}T${hours.padStart(2, '0')}:${minutes || '00'}:00`)

      const appointmentData = {
        studentId: user._id,
        counsellorId: counsellor.userId, 
        date: selectedDate,
        time: selectedTime,
        appointmentTimeISO: appointmentDate.toISOString(), // Send UTC ISO string
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

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="min-h-screen bg-gray-50">
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

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Schedule Your Session</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <select
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setSelectedTime("")
                  }}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time * {fetchingAppointments && <span className="text-xs text-blue-500 animate-pulse ml-2">(Checking slots...)</span>}
                </label>
                {selectedDate ? (
                  availableTimeSlots.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableTimeSlots.map(time => (
                        <button
                          key={time}
                          type="button"
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
                  ) : (
                    <p className="text-sm text-red-500 italic">No slots available for this date.</p>
                  )
                ) : (
                  <p className="text-sm text-gray-500 italic">Please select a date first.</p>
                )}
              </div>

              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center space-x-4">
                <div className="text-2xl">🎥</div>
                <div>
                  <div className="font-bold text-purple-900">Video Call Session</div>
                  <div className="text-sm text-purple-700">All sessions are conducted via our secure video platform.</div>
                </div>
              </div>

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