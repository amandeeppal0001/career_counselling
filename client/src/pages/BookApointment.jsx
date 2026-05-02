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
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }

  useEffect(() => {
    const fetchCounsellor = async () => {
      try {
        const response = await fetch(`https://career-counselling-nr04.onrender.com/api/users/counsellors/${counsellorId}`, {
          credentials: "include"
        })
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
      fetchCounsellor()
    }
  }, [counsellorId])

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time")
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
        credentials: "include",
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {}
            <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-200">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">👨‍🏫</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900">{counsellor?.fullName}</h2>
                <p className="text-purple-600 font-medium">{counsellor?.specialization}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">🎓</span>
                  <span>{counsellor?.experience} Experience</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-lg">🌐</span>
                  <span>{counsellor?.languages?.join(", ")}</span>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-2">About</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{counsellor?.bio}</p>
                </div>
              </div>
            </div>

            {}
            <div className="md:w-2/3 p-8">
              <div className="space-y-8">
                {}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">1</span>
                    Select Date
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {getAvailableDates().map((date) => {
                      const d = new Date(date)
                      return (
                        <button
                          key={date}
                          onClick={() => setSelectedDate(date)}
                          className={`p-3 rounded-xl border-2 transition-all text-center ${
                            selectedDate === date
                              ? "bg-blue-600 border-blue-600 text-white shadow-md"
                              : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                          }`}
                        >
                          <p className="text-xs font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className="text-lg font-bold">{d.getDate()}</p>
                          <p className="text-[10px] uppercase">{d.toLocaleDateString('en-US', { month: 'short' })}</p>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">2</span>
                    Select Time
                  </h3>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {timeSlots.map((time) => (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        className={`p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                          selectedTime === time
                            ? "bg-blue-600 border-blue-600 text-white shadow-md"
                            : "border-gray-100 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>

                {}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">3</span>
                    Session Type
                  </h3>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setSessionType("video")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        sessionType === "video"
                          ? "bg-purple-50 border-purple-600 text-purple-700"
                          : "border-gray-100 hover:border-purple-300"
                      }`}
                    >
                      <span className="text-xl">📹</span>
                      <span className="font-bold">Video Call</span>
                    </button>
                    <button
                      onClick={() => setSessionType("chat")}
                      className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
                        sessionType === "chat"
                          ? "bg-blue-50 border-blue-600 text-blue-700"
                          : "border-gray-100 hover:border-blue-300"
                      }`}
                    >
                      <span className="text-xl">💬</span>
                      <span className="font-bold">Chat</span>
                    </button>
                  </div>
                </div>

                {}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm">4</span>
                    Message for Counsellor (Optional)
                  </h3>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Briefly describe what you'd like to discuss..."
                    className="w-full p-4 border-2 border-gray-100 rounded-xl focus:border-blue-600 outline-none min-h-[100px] transition-all"
                  />
                </div>

                <button
                  onClick={handleBooking}
                  disabled={isBooking || !selectedDate || !selectedTime}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transform transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isBooking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Confirming...
                    </span>
                  ) : (
                    "Confirm Booking"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BookAppointment