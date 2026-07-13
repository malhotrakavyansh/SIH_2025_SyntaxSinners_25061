"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface MeditationSession {
  id: number
  name: string
  monastery: string
  sessionType: 'morning' | 'evening'
  sessionTime: string
  duration: string
  rating: number
  reviews: number
  description: string
  experience: string
  price: number
}

const allSessions: MeditationSession[] = [
  {
    id: 1,
    name: "Tashiding Dawn Meditation",
    monastery: "Tashiding",
    sessionType: "morning",
    sessionTime: "6:00 AM",
    duration: "1 hour",
    rating: 4.9,
    reviews: 214,
    description: "Begin your day with guided meditation overlooking the monastery",
    experience: "All levels welcome",
    price: 300,
  },
  {
    id: 2,
    name: "Rumtek Evening Mindfulness",
    monastery: "Rumtek",
    sessionType: "evening",
    sessionTime: "5:00 PM",
    duration: "1.5 hours",
    rating: 4.8,
    reviews: 187,
    description: "Peaceful evening meditation with resident monks",
    experience: "Beginner to intermediate",
    price: 350,
  },
  {
    id: 3,
    name: "Dubdi Spiritual Practice",
    monastery: "Dubdi",
    sessionType: "morning",
    sessionTime: "6:30 AM",
    duration: "1 hour",
    rating: 4.9,
    reviews: 156,
    description: "Traditional Buddhist meditation techniques",
    experience: "All levels welcome",
    price: 280,
  },
  {
    id: 4,
    name: "Tsuk La Khang Morning Practice",
    monastery: "Tsuk La Khang",
    sessionType: "morning",
    sessionTime: "6:00 AM",
    duration: "1.5 hours",
    rating: 4.9,
    reviews: 202,
    description: "Deep meditation with experienced Buddhist monks",
    experience: "All levels welcome",
    price: 320,
  },
  {
    id: 5,
    name: "Tashiding Evening Calm",
    monastery: "Tashiding",
    sessionType: "evening",
    sessionTime: "5:00 PM",
    duration: "1 hour",
    rating: 4.8,
    reviews: 178,
    description: "Relaxing meditation session as day concludes",
    experience: "Beginner friendly",
    price: 300,
  },
  {
    id: 6,
    name: "Rumtek Dawn Awakening",
    monastery: "Rumtek",
    sessionType: "morning",
    sessionTime: "6:00 AM",
    duration: "2 hours",
    rating: 4.7,
    reviews: 164,
    description: "Extended meditation with teachings",
    experience: "Intermediate to advanced",
    price: 400,
  },
]

function getRandomSessions(count: number = 4): MeditationSession[] {
  const shuffled = [...allSessions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function MeditationBookingPage() {
  const router = useRouter()
  const [sessions, setSessions] = useState<MeditationSession[]>([])
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [sessionDate, setSessionDate] = useState<Date | null>(null)
  const [participants, setParticipants] = useState("")
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirm'>('details')
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const UPI_ID = "anshjayara.edu@okaxis"
  const PAYEE_NAME = "Ansh Jayara"

  // Date restrictions
  const MIN_DATE = new Date(2025, 11, 8) // December 8, 2025
  const MAX_DATE = new Date(2026, 6, 31) // July 31, 2026

  const calculatePrice = () => {
    if (!selectedSession || !participants) return 0
    return selectedSession.price * parseInt(participants)
  }

  const buildUpiLink = () => {
    if (!selectedSession || !sessionDate || !participants) return null

    const formattedDate = sessionDate.toLocaleDateString('en-GB')
    const amount = calculatePrice()
    const intent = new URL("upi://pay")
    intent.searchParams.set("pa", UPI_ID)
    intent.searchParams.set("pn", PAYEE_NAME)
    intent.searchParams.set("am", `${amount}`)
    intent.searchParams.set("cu", "INR")
    intent.searchParams.set("tn", `Meditation: ${selectedSession.name} on ${formattedDate} at ${selectedSession.sessionTime}`)
    return intent.toString()
  }

  const handlePaymentDone = async () => {
    if (!selectedSession || !sessionDate || !participants) {
      alert("Please fill all details before proceeding.")
      return
    }

    setIsProcessing(true)
    try {
      const formattedDate = sessionDate.toISOString().split('T')[0]
      const response = await fetch(`${BACKEND_URL}/api/create-meditation-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionName: selectedSession.name,
          sessionId: selectedSession.id,
          sessionType: selectedSession.sessionType,
          date: formattedDate,
          sessionTime: selectedSession.sessionTime,
          participants: parseInt(participants),
          amount: calculatePrice(),
          userName: "User",
          userEmail: "user@example.com",
        }),
      })

      const data = await response.json()
      if (data.success && data.bookingId) {
        setBookingConfirmed(true)
        setCurrentStep('confirm')
      } else {
        alert("Failed to create booking. Please try again.")
      }
    } catch (error) {
      console.error("Booking error:", error)
      alert("Error creating booking. Make sure backend is running on port 5000.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    setSessions(getRandomSessions(4))
  }, [])

  const handleRefresh = () => {
    setSessions(getRandomSessions(4))
  }

  const handleBooking = (session: MeditationSession) => {
    setSelectedSession(session)
    setSessionDate(null)
    setParticipants("")
    setCurrentStep('details')
    setBookingConfirmed(false)
    setShowQRCode(false)
    setShowModal(true)
  }

  const openGPayLink = () => {
    const link = buildUpiLink()
    if (!link) {
      alert("Please fill all details before starting payment.")
      return
    }

    window.location.href = link
  }

  const copyUpiLink = async () => {
    const link = buildUpiLink()
    if (!link) {
      alert("Please fill all details before copying the payment link.")
      return
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(link)
        alert("Payment link copied. If it did not open, paste it into your UPI app.")
      } else {
        throw new Error("Clipboard unavailable")
      }
    } catch (err) {
      alert(`Payment link: ${link}`)
    }
  }

  const upiLink = buildUpiLink()
  const totalPrice = calculatePrice()

  return (
    <div className="min-h-screen py-16 px-6 bg-gradient-to-b from-[#2b0d0d] via-[#5a1f1f] to-[#3b1212] text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/experiences"
              className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-2 font-poppins"
            >
              ← Back to Experiences
            </Link>
          </div>
          <h1 className="font-cinzel-decorative text-5xl md:text-6xl leading-tight text-amber-100 mb-2">
            MEDITATION WITH MONKS
          </h1>
          <p className="text-white/80 text-lg font-merriweather">
            Sit in guided meditation sessions with resident monks
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-amber-300/20 hover:bg-amber-300/30 border border-amber-300 text-amber-200 rounded-lg transition-all font-poppins"
          >
            Refresh Sessions
          </button>
        </div>

        {/* Meditation Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="bg-[#4a1414] rounded-2xl overflow-hidden pop-card hover:shadow-lg hover:shadow-amber-300/20 transition-all duration-300 flex flex-col"
            >
              {/* Session Icon */}
              <div className="w-full h-48 bg-gradient-to-b from-amber-300/20 to-transparent flex items-center justify-center border-b border-amber-300/20">
                <div className="text-6xl">
                  🧘
                </div>
              </div>

              {/* Session Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-cinzel-decorative text-amber-50 mb-1">
                  {session.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(session.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/70 font-poppins">
                    ({session.reviews})
                  </span>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Monastery:</span> {session.monastery}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Time:</span> {session.sessionTime}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Duration:</span> {session.duration}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    {session.description}
                  </p>
                  <p className="text-xs text-white/70 font-merriweather">
                    <span className="font-semibold">Level:</span> {session.experience}
                  </p>
                  <p className="text-amber-200 font-merriweather">
                    <span className="font-semibold">₹{session.price}/person</span>
                  </p>
                </div>

                <button
                  onClick={() => handleBooking(session)}
                  className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-300 hover:to-amber-200 transition-all duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b1212] border border-amber-300/30 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-cinzel-decorative text-amber-100 mb-2">
              Confirm Booking
            </h2>
            <p className="text-white/80 mb-6 font-merriweather">
              for <span className="text-amber-200 font-semibold">{selectedSession.name}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-amber-200 text-sm font-poppins mb-2">
                  Date
                </label>
                <DatePicker
                  selected={sessionDate}
                  onChange={(date: Date | null) => setSessionDate(date)}
                  minDate={MIN_DATE}
                  maxDate={MAX_DATE}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="dd-mm-yyyy"
                  showYearDropdown
                  yearDropdownItemNumber={2}
                  scrollableYearDropdown={false}
                  className="w-full px-4 py-2 bg-white/10 border border-amber-300/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-poppins"
                  wrapperClassName="w-full"
                  calendarClassName="custom-datepicker"
                />
              </div>

              <div>
                <label className="block text-amber-200 text-sm font-poppins mb-2">
                  Number of Participants
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  placeholder="Enter number"
                  className="w-full px-4 py-2 bg-white/10 border border-amber-300/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-poppins"
                />
              </div>

              <div className="pt-2 border-t border-amber-300/20">
                <p className="text-sm text-white/80 font-merriweather mb-1">
                  <span className="font-semibold">Session:</span> {selectedSession.sessionTime} ({selectedSession.duration})
                </p>
                <p className="text-sm text-white/80 font-merriweather mb-1">
                  <span className="font-semibold">Price per person:</span> ₹{selectedSession.price}
                </p>
                {participants && (
                  <p className="text-sm text-amber-200 font-merriweather font-semibold">
                    <span>Total: ₹{totalPrice}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Step 1: Details Selection */}
            {currentStep === 'details' && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-amber-300/50 text-amber-200 rounded-lg font-poppins hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!sessionDate || !participants) {
                      alert("Please fill all fields")
                      return
                    }
                    const participantCount = parseInt(participants)
                    if (participantCount < 1 || participantCount > 10) {
                      alert("Participants must be between 1 and 10")
                      return
                    }
                    setCurrentStep('payment')
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-400 hover:to-amber-200 transition-all"
                >
                  Proceed to payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === 'payment' && (
              <>
                {!showQRCode ? (
                  <div className="mt-6 space-y-4">
                    <div className="pt-3 border-t border-amber-300/20 space-y-3">
                      <p className="text-lg text-amber-100 font-cinzel-decorative text-center">Payment Details</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm text-white/80 font-poppins bg-white/5 px-4 py-3 rounded-lg border border-amber-300/20">
                          <span className="text-amber-200 font-semibold">UPI ID:</span>
                          <span className="truncate">{UPI_ID}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-sm text-white/80 font-poppins bg-white/5 px-4 py-3 rounded-lg border border-amber-300/20">
                          <span className="text-amber-200 font-semibold">Payee:</span>
                          <span className="truncate">{PAYEE_NAME}</span>
                        </div>
                      </div>

                      <p className="text-xs text-white/60 font-merriweather text-center">Tap the button below to open Google Pay / UPI.</p>
                      
                      <button
                        onClick={() => {
                          openGPayLink()
                          setShowQRCode(true)
                        }}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-400 hover:to-amber-200 transition-all text-lg"
                      >
                        PAY WITH GOOGLE PAY
                      </button>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-amber-300/20">
                      <button
                        onClick={() => setCurrentStep('details')}
                        className="flex-1 py-2 border border-amber-300/50 text-amber-200 rounded-lg font-poppins hover:bg-white/5 transition-all"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    <div className="pt-3 border-t border-amber-300/20 space-y-3">
                      <p className="text-lg text-amber-100 font-cinzel-decorative text-center">Complete Your Payment</p>
                      
                      <button
                        onClick={copyUpiLink}
                        className="w-full py-2 bg-transparent text-amber-200 border border-amber-300/50 rounded-lg font-poppins hover:bg-white/5 transition-all"
                      >
                        Copy payment link
                      </button>
                      
                      {upiLink && (
                        <div className="mt-2 space-y-2 text-center">
                          <p className="text-sm text-white/70 font-poppins">Or scan QR in your UPI app</p>
                          <div className="mx-auto bg-white/5 border border-amber-300/30 rounded-xl p-3 w-fit">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiLink)}`}
                              alt="UPI QR"
                              className="h-64 w-64 object-contain"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-amber-300/20">
                      <button
                        onClick={() => setShowQRCode(false)}
                        className="flex-1 py-2 border border-amber-300/50 text-amber-200 rounded-lg font-poppins hover:bg-white/5 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePaymentDone}
                        disabled={isProcessing}
                        className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-400 hover:to-amber-200 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? "Processing..." : "PROCEED TO PAYMENT"}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Confirmation */}
            {currentStep === 'confirm' && bookingConfirmed && (
              <div className="mt-6 space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-cinzel-decorative text-amber-100">Booking Confirmed!</h3>
                  <p className="text-white/80 font-merriweather">Your meditation session has been successfully booked.</p>
                  
                  <div className="bg-white/5 border border-amber-300/30 rounded-lg p-4 space-y-2 text-left">
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Session:</span> {selectedSession?.name}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Date:</span> {sessionDate?.toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Time:</span> {selectedSession?.sessionTime}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Participants:</span> {participants}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Total Price:</span> ₹{totalPrice}
                    </p>
                  </div>
                  
                  <p className="text-xs text-white/60 font-merriweather">A confirmation email will be sent to you shortly.</p>
                </div>

                <button
                  onClick={() => setShowModal(false)}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-400 hover:to-amber-200 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
