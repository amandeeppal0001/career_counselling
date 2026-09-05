"use client"

import { useState, useEffect } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import { openRazorpayModal } from "../lib/razorpay"

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://career-counselling-nr04.onrender.com"

const BookAppointment = () => {
  const { counsellorId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user || JSON.parse(localStorage.getItem("user") || "null")

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
  const [bookingStatusText, setBookingStatusText] = useState("")
  const [paymentError, setPaymentError] = useState(null)
  const [bookingSuccessData, setBookingSuccessData] = useState(null)
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
      
      const slotDate = new Date(`${selectedDate}T${hours.padStart(2, '0')}:${minutes || '00'}:00`)
      
      const isPast = slotDate < new Date()
      
      const isBooked = bookedAppointments.some(app => {
        if (app.status === 'Cancelled') return false
        const appDate = new Date(app.appointmentTime)
        return appDate.getTime() === slotDate.getTime()
      })
      
      return !isBooked && !isPast
    })
  }

  useEffect(() => {
    const fetchCounsellorDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/counsellors/${counsellorId}`, {
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
        const response = await fetch(`${API_BASE_URL}/api/appointments/counselor/${userId}`, {
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

  const feeAmount = counsellor?.consultationFee !== undefined ? counsellor.consultationFee : 500

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !sessionType) {
      alert("Please select both a date and an available time slot.")
      return
    }

    if (!user || !user._id) {
      alert("Please login as a student to book a session.")
      navigate("/")
      return
    }

    setIsBooking(true)
    setPaymentError(null)
    setBookingStatusText("Initiating secure payment order...")

    try {
      const timeStr = selectedTime.split('-')[0]
      const [hours, minutes] = timeStr.split(':')
      const appointmentDate = new Date(`${selectedDate}T${hours.padStart(2, '0')}:${minutes || '00'}:00`)

      const bookingDetails = {
        studentId: user._id,
        counsellorId: counsellor.userId || counsellor._id,
        date: selectedDate,
        time: selectedTime,
        appointmentTimeISO: appointmentDate.toISOString(),
        sessionType: sessionType,
        message: message
      }

      // 1. Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          counsellorId: counsellor._id,
          studentId: user._id
        })
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to initiate payment order.")
      }

      // If free session
      if (orderData.isFree) {
        setBookingStatusText("Confirming appointment...")
        const freeBookingRes = await fetch(`${API_BASE_URL}/api/payments/verify-and-book`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            isFree: true,
            bookingDetails
          })
        })
        const freeBookingData = await freeBookingRes.json()
        if (freeBookingRes.ok && freeBookingData.success) {
          setBookingSuccessData({
            appointment: freeBookingData.appointment,
            paymentDetails: { amount: 0, razorpayPaymentId: 'FREE_SESSION' }
          })
        } else {
          throw new Error(freeBookingData.message || "Booking failed.")
        }
        setIsBooking(false)
        return
      }

      // 2. Open Razorpay Checkout Modal
      setBookingStatusText("Waiting for payment completion...")

      await openRazorpayModal({
        orderData,
        user,
        counsellor,
        onSuccess: async (razorpayResponse) => {
          try {
            setBookingStatusText("Verifying payment and confirming your appointment...")

            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify-and-book`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: razorpayResponse.razorpay_order_id,
                razorpay_payment_id: razorpayResponse.razorpay_payment_id,
                razorpay_signature: razorpayResponse.razorpay_signature,
                bookingDetails
              })
            })

            const verifyData = await verifyRes.json()

            if (verifyRes.ok && verifyData.success) {
              setBookingSuccessData({
                appointment: verifyData.appointment,
                paymentDetails: verifyData.paymentDetails,
                appointmentId: verifyData.appointmentId
              })
            } else {
              throw new Error(verifyData.message || "Payment verification failed on the server.")
            }
          } catch (err) {
            console.error("Verification error:", err)
            setPaymentError(err.message || "Failed to verify payment with server.")
          } finally {
            setIsBooking(false)
          }
        },
        onFailure: (err) => {
          console.error("Payment failed:", err)
          setPaymentError(err.description || "Payment failed. Please try again with another method.")
          setIsBooking(false)
        },
        onDismiss: () => {
          setPaymentError("Payment window was closed. You have not been charged.")
          setIsBooking(false)
        }
      })

    } catch (error) {
      console.error("Booking error:", error)
      setPaymentError(error.message || "An unexpected error occurred. Please try again.")
      setIsBooking(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            🔒
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Please log in to book a career guidance session.</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-md"
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
        <span className="ml-3 text-lg font-medium text-gray-700">Loading counselor details...</span>
      </div>
    )
  }

  const availableTimeSlots = getAvailableTimeSlots()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Go back"
              >
                ← Back
              </button>
              <div className="w-9 h-9 bg-purple-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">📅</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Book Consultation</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Razorpay Instant Booking</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error notification */}
        {paymentError && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-3 text-red-800">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h4 className="font-semibold text-red-900">Payment or Booking Notice</h4>
              <p className="text-sm mt-0.5">{paymentError}</p>
            </div>
            <button
              onClick={() => setPaymentError(null)}
              className="text-red-500 hover:text-red-700 text-lg font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Counsellor Profile & Fee Summary */}
          <div className="lg:col-span-5 space-y-6">
            {counsellor && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <span className="text-3xl">👨‍💼</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{counsellor.fullName}</h2>
                  <p className="text-purple-600 font-medium text-sm mt-0.5">{counsellor.specialization}</p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="flex text-yellow-400 text-sm">
                      {'★★★★★'.slice(0, Math.floor(counsellor.rating || 4.5))}
                    </div>
                    <span className="ml-2 text-xs font-semibold text-gray-600">
                      {counsellor.rating || 4.5} ({counsellor.reviewsCount || 12} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-gray-600 flex items-center">
                      <span className="mr-2">🎓</span> Experience
                    </span>
                    <span className="font-semibold text-gray-800">{counsellor.experience} years</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-gray-600 flex items-center">
                      <span className="mr-2">⏰</span> Duration
                    </span>
                    <span className="font-semibold text-gray-800">{counsellor.sessionDuration || 45} mins</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50">
                    <span className="text-gray-600 flex items-center">
                      <span className="mr-2">🗣️</span> Languages
                    </span>
                    <span className="font-semibold text-gray-800">
                      {counsellor.languages?.join(", ") || "English, Hindi"}
                    </span>
                  </div>
                </div>

                {counsellor.bio && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">About</h4>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">{counsellor.bio}</p>
                  </div>
                )}
              </div>
            )}

            {/* Pricing & Checkout Breakdown Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-purple-200">
                <span className="font-bold text-gray-900 text-lg flex items-center">
                  <span className="mr-2">💳</span> Price Breakdown
                </span>
                <span className="text-xs font-semibold bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                  INR
                </span>
              </div>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Consultation Fee</span>
                  <span className="font-medium">₹{feeAmount}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span className="flex items-center">
                    Platform Convenience Fee
                    <span className="ml-1 text-xs text-green-600 font-bold">(Free)</span>
                  </span>
                  <span className="font-medium text-green-600">₹0</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxes (GST)</span>
                  <span className="font-medium text-gray-500">Included</span>
                </div>

                <div className="pt-3 mt-2 border-t border-purple-200 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total Payable</span>
                  <span className="text-2xl font-black text-purple-700">₹{feeAmount}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-200/60 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <span>🔒 Powered by</span>
                <span className="font-bold text-blue-800 tracking-wide">Razorpay</span>
                <span>• 256-bit SSL</span>
              </div>
            </div>
          </div>

          {/* Right Column: Scheduling & Payment Trigger */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-2">⏰</span> Select Date & Available Time Slot
              </h3>

              <div className="space-y-6">
                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    1. Select Consultation Date *
                  </label>
                  <select
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value)
                      setSelectedTime("")
                    }}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">-- Choose an available date --</option>
                    {getAvailableDates().map(date => {
                      const dateObj = new Date(date)
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                      return (
                        <option key={date} value={date}>{formattedDate}</option>
                      )
                    })}
                  </select>
                </div>

                {/* Time Slots */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      2. Select Available Slot *
                    </label>
                    {fetchingAppointments && (
                      <span className="text-xs text-purple-600 animate-pulse font-medium">
                        Checking slot availability...
                      </span>
                    )}
                  </div>

                  {selectedDate ? (
                    availableTimeSlots.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {availableTimeSlots.map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-150 border ${
                              selectedTime === time
                                ? "bg-purple-600 text-white border-purple-600 shadow-md transform scale-[1.02]"
                                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50 hover:border-purple-300"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm">
                        No available slots for this date. Please select another date.
                      </div>
                    )
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-gray-500 text-sm italic">
                      Please select a date above to view available time slots.
                    </div>
                  )}
                </div>

                {/* Video call reminder */}
                <div className="bg-purple-50/80 p-4 rounded-xl border border-purple-100 flex items-center space-x-3.5">
                  <div className="text-2xl">🎥</div>
                  <div className="text-sm">
                    <span className="font-bold text-purple-900 block">High Definition Video Session</span>
                    <span className="text-purple-700 text-xs">
                      Join directly from your student dashboard via our integrated WebRTC video room.
                    </span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    3. Concerns or Questions for Counselor (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="E.g., Need guidance on engineering colleges, stream selection, abroad studies..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm transition-all"
                  />
                </div>

                {/* Submit / Pay Button */}
                <button
                  onClick={handleBooking}
                  disabled={isBooking || !selectedDate || !selectedTime}
                  className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg ${
                    isBooking || !selectedDate || !selectedTime
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5"
                  }`}
                >
                  {isBooking ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      <span>{bookingStatusText || "Processing..."}</span>
                    </>
                  ) : (
                    <>
                      <span>🔒 Pay ₹{feeAmount} & Confirm Booking</span>
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500">
                  💡 By clicking pay, you will be securely redirected to Razorpay checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Confirmation Receipt Modal */}
      {bookingSuccessData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-gray-100 text-center transform animate-in fade-in zoom-in duration-200">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 text-4xl shadow-inner">
              ✓
            </div>

            <h3 className="text-2xl font-black text-gray-900 mb-1">
              Payment & Booking Confirmed!
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your consultation session has been successfully booked and recorded.
            </p>

            <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 text-left space-y-3 text-sm mb-6">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Counselor:</span>
                <span className="font-bold text-gray-800">{counsellor?.fullName}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Scheduled Date:</span>
                <span className="font-bold text-gray-800">
                  {new Date(bookingSuccessData.appointment?.appointmentTime || selectedDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Time Slot:</span>
                <span className="font-bold text-purple-700">{selectedTime}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-green-700">₹{bookingSuccessData.paymentDetails?.amount || feeAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Razorpay Payment ID:</span>
                <span className="font-mono text-xs font-semibold text-gray-700 truncate max-w-[200px]">
                  {bookingSuccessData.paymentDetails?.razorpayPaymentId || "Verified"}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate("/student-dashboard", { state: { user } })}
                className="w-full py-3.5 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md hover:shadow-lg"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={() => {
                  setBookingSuccessData(null)
                  setSelectedDate("")
                  setSelectedTime("")
                }}
                className="w-full py-2.5 px-6 rounded-xl text-gray-600 hover:text-gray-900 font-medium text-sm transition-colors"
              >
                Book Another Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookAppointment