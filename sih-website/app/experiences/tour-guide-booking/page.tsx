"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface TourGuide {
  id: number
  name: string
  image: string
  monastery: string
  experience: string
  rating: number
  reviews: number
  specialty: string
  availability: string
  price: number
}

// Sample tour guides data - you can replace with API call
const allTourGuides: TourGuide[] = [
  {
    id: 1,
    name: "Tenzin Dorje",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Tashiding",
    experience: "15 years",
    rating: 4.9,
    reviews: 128,
    specialty: "Buddhist History & Architecture",
    availability: "Available",
    price: 500,
  },
  {
    id: 2,
    name: "Pema Norbu",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Rumtek",
    experience: "12 years",
    rating: 4.8,
    reviews: 95,
    specialty: "Spiritual Traditions",
    availability: "Available",
    price: 450,
  },
  {
    id: 3,
    name: "Sonam Wangmo",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Dubdi",
    experience: "8 years",
    rating: 4.7,
    reviews: 72,
    specialty: "Cultural Heritage",
    availability: "Available",
    price: 400,
  },
  {
    id: 4,
    name: "Yeshi Tamang",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Tsuk La Khang",
    experience: "10 years",
    rating: 4.9,
    reviews: 110,
    specialty: "Local History & Art",
    availability: "Available",
    price: 480,
  },
  {
    id: 5,
    name: "Karma Dawa",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Tashiding",
    experience: "9 years",
    rating: 4.6,
    reviews: 85,
    specialty: "Meditation Guidance",
    availability: "Available",
    price: 420,
  },
  {
    id: 6,
    name: "Nima Yangchen",
    image: "/Icons/ICONS/HEADPHONE.png",
    monastery: "Rumtek",
    experience: "11 years",
    rating: 4.8,
    reviews: 102,
    specialty: "Ancient Texts & Philosophy",
    availability: "Available",
    price: 470,
  },
]

function getRandomGuides(count: number = 4): TourGuide[] {
  const shuffled = [...allTourGuides].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function TourGuideBookingPage() {
  const router = useRouter()
  const [guides, setGuides] = useState<TourGuide[]>([])
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [bookingDate, setBookingDate] = useState<Date | null>(null)
  const [bookingTime, setBookingTime] = useState("")
  const [currentStep, setCurrentStep] = useState<'datetime' | 'payment' | 'confirm'>('datetime')
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const UPI_ID = "anshjayara.edu@okaxis"
  const PAYEE_NAME = "Ansh Jayara"

  // Date restrictions
  const MIN_DATE = new Date(2025, 11, 8) // December 8, 2025 (month is 0-indexed)
  const MAX_DATE = new Date(2026, 6, 31) // July 31, 2026

  // Available time slots (7 AM to 3 PM)
  const TIME_SLOTS = [
    { value: "07:00", label: "7:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "15:00", label: "3:00 PM" }
  ]

  const buildUpiLink = () => {
    if (!selectedGuide || !bookingDate || !bookingTime) return null

    const formattedDate = bookingDate.toLocaleDateString('en-GB')
    const intent = new URL("upi://pay")
    intent.searchParams.set("pa", UPI_ID)
    intent.searchParams.set("pn", PAYEE_NAME)
    intent.searchParams.set("am", `${selectedGuide.price}`)
    intent.searchParams.set("cu", "INR")
    intent.searchParams.set("tn", `Guide: ${selectedGuide.name} on ${formattedDate} ${bookingTime}`)
    return intent.toString()
  }

  const handlePaymentDone = async () => {
    if (!selectedGuide || !bookingDate || !bookingTime) {
      alert("Please select date and time before proceeding.")
      return
    }

    setIsProcessing(true)
    try {
      const formattedDate = bookingDate.toISOString().split('T')[0]
      const response = await fetch(`${BACKEND_URL}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guideName: selectedGuide.name,
          guideId: selectedGuide.id,
          date: formattedDate,
          time: bookingTime,
          amount: selectedGuide.price,
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
      // Fallback: create a local booking ID and proceed
      const localBookingId = `TOUR-${Date.now()}`
      router.push(`/booking-success?bookingId=${localBookingId}`)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    setGuides(getRandomGuides(4))
  }, [])

  const handleRefresh = () => {
    setGuides(getRandomGuides(4))
  }

  const handleBooking = (guide: TourGuide) => {
    setSelectedGuide(guide)
    setBookingDate(null)
    setBookingTime("")
    setCurrentStep('datetime')
    setBookingConfirmed(false)
      setShowQRCode(false)
    setShowModal(true)
  }

  const openGPayLink = () => {
    const link = buildUpiLink()
    if (!link) {
      alert("Please select date and time before starting payment.")
      return
    }

    window.location.href = link
  }

  const copyUpiLink = async () => {
    const link = buildUpiLink()
    if (!link) {
      alert("Please select date and time before copying the payment link.")
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
            TOUR GUIDE BOOKING
          </h1>
          <p className="text-white/80 text-lg font-merriweather">
            Select from our certified monastery tour guides and book your experience
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-amber-300/20 hover:bg-amber-300/30 border border-amber-300 text-amber-200 rounded-lg transition-all font-poppins"
          >
            Refresh Guides
          </button>
        </div>

        {/* Tour Guides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-[#4a1414] rounded-2xl overflow-hidden pop-card hover:shadow-lg hover:shadow-amber-300/20 transition-all duration-300 flex flex-col"
            >
              {/* Guide Image */}
              <div className="w-full h-48 bg-gradient-to-b from-amber-300/20 to-transparent flex items-center justify-center border-b border-amber-300/20">
                <div className="w-24 h-24 bg-amber-300/30 rounded-full flex items-center justify-center">
                  <span className="text-3xl">🧘</span>
                </div>
              </div>

              {/* Guide Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-cinzel-decorative text-amber-50 mb-1">
                  {guide.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(guide.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/70 font-poppins">
                    ({guide.reviews})
                  </span>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Monastery:</span> {guide.monastery}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Experience:</span> {guide.experience}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Specialty:</span> {guide.specialty}
                  </p>
                  <p className="text-sm text-amber-200 font-merriweather">
                    <span className="font-semibold">₹{guide.price}/tour</span>
                  </p>
                </div>

                <button
                  onClick={() => handleBooking(guide)}
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
      {showModal && selectedGuide && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b1212] border border-amber-300/30 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-cinzel-decorative text-amber-100 mb-2">
              Confirm Booking
            </h2>
            <p className="text-white/80 mb-6 font-merriweather">
              with <span className="text-amber-200 font-semibold">{selectedGuide.name}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-amber-200 text-sm font-poppins mb-2">
                  Date
                </label>
                <DatePicker
                  selected={bookingDate}
                  onChange={(date: Date | null) => setBookingDate(date)}
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
                  Time
                </label>
                <select
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-amber-300/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-poppins"
                >
                  <option value="" disabled className="bg-[#3b1212] text-white/50">
                    --:--
                  </option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value} className="bg-[#3b1212] text-white">
                      {slot.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 border-t border-amber-300/20">
                <p className="text-sm text-white/80 font-merriweather mb-1">
                  <span className="font-semibold">Price:</span> ₹{selectedGuide.price}
                </p>
                <p className="text-xs text-white/60 font-merriweather">
                  Duration: 2-3 hours
                </p>
              </div>
            </div>

            {/* Step 1: Date & Time Selection */}
            {currentStep === 'datetime' && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-amber-300/50 text-amber-200 rounded-lg font-poppins hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!bookingDate || !bookingTime) {
                      alert("Please select both date and time")
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
                        onClick={() => setCurrentStep('datetime')}
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
                  <p className="text-white/80 font-merriweather">Your tour has been successfully booked.</p>
                  
                  <div className="bg-white/5 border border-amber-300/30 rounded-lg p-4 space-y-2 text-left">
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Guide:</span> {selectedGuide?.name}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Date:</span> {bookingDate?.toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Time:</span> {TIME_SLOTS.find(slot => slot.value === bookingTime)?.label}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Price:</span> ₹{selectedGuide?.price}
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
