"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Transport {
  id: number
  type: string
  name: string
  monastery: string
  capacity: number
  rating: number
  reviews: number
  description: string
  availability: string
  price: number
  priceType: string
}

const allTransport: Transport[] = [
  {
    id: 1,
    type: "Taxi",
    name: "Tashiding Express Taxi",
    monastery: "Tashiding",
    capacity: 4,
    rating: 4.9,
    reviews: 156,
    description: "Comfortable taxi service with experienced drivers",
    availability: "Available",
    price: 800,
    priceType: "per trip",
  },
  {
    id: 2,
    type: "Bus",
    name: "Rumtek Heritage Bus",
    monastery: "Rumtek",
    capacity: 45,
    rating: 4.8,
    reviews: 203,
    description: "Air-conditioned coach for group travel",
    availability: "Available",
    price: 50,
    priceType: "per person",
  },
  {
    id: 3,
    type: "Taxi",
    name: "Dubdi Local Taxi",
    monastery: "Dubdi",
    capacity: 5,
    rating: 4.7,
    reviews: 128,
    description: "Reliable transport with friendly drivers",
    availability: "Available",
    price: 650,
    priceType: "per trip",
  },
  {
    id: 4,
    type: "Bus",
    name: "Tsuk La Khang Shuttle",
    monastery: "Tsuk La Khang",
    capacity: 35,
    rating: 4.9,
    reviews: 174,
    description: "Modern shuttle service with comfortable seating",
    availability: "Available",
    price: 45,
    priceType: "per person",
  },
  {
    id: 5,
    type: "Taxi",
    name: "Premium Tashiding Cab",
    monastery: "Tashiding",
    capacity: 4,
    rating: 4.8,
    reviews: 142,
    description: "Premium vehicle with air conditioning",
    availability: "Available",
    price: 1200,
    priceType: "per trip",
  },
  {
    id: 6,
    type: "Bus",
    name: "Rumtek Group Bus",
    monastery: "Rumtek",
    capacity: 50,
    rating: 4.6,
    reviews: 167,
    description: "Spacious bus for large groups",
    availability: "Available",
    price: 55,
    priceType: "per person",
  },
]

function getRandomTransport(count: number = 4): Transport[] {
  const shuffled = [...allTransport].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export default function CabsBusesPage() {
  const router = useRouter()
  const [transport, setTransport] = useState<Transport[]>([])
  const [selectedTransport, setSelectedTransport] = useState<Transport | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [bookingDate, setBookingDate] = useState<Date | null>(null)
  const [bookingTime, setBookingTime] = useState("")
  const [passengers, setPassengers] = useState("")
  const [currentStep, setCurrentStep] = useState<'details' | 'payment' | 'confirm'>('details')
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const UPI_ID = "anshjayara.edu@okaxis"
  const PAYEE_NAME = "Ansh Jayara"

  // Date restrictions
  const MIN_DATE = new Date(2025, 11, 8) // December 8, 2025
  const MAX_DATE = new Date(2026, 6, 31) // July 31, 2026

  // Available time slots
  const TIME_SLOTS = [
    { value: "06:00", label: "6:00 AM" },
    { value: "08:00", label: "8:00 AM" },
    { value: "10:00", label: "10:00 AM" },
    { value: "12:00", label: "12:00 PM" },
    { value: "14:00", label: "2:00 PM" },
    { value: "16:00", label: "4:00 PM" },
    { value: "18:00", label: "6:00 PM" }
  ]

  const calculatePrice = () => {
    if (!selectedTransport || !passengers) return 0
    const passengerCount = parseInt(passengers)
    if (selectedTransport.priceType === "per person") {
      return selectedTransport.price * passengerCount
    }
    return selectedTransport.price
  }

  const buildUpiLink = () => {
    if (!selectedTransport || !bookingDate || !bookingTime || !passengers) return null

    const formattedDate = bookingDate.toLocaleDateString('en-GB')
    const amount = calculatePrice()
    const intent = new URL("upi://pay")
    intent.searchParams.set("pa", UPI_ID)
    intent.searchParams.set("pn", PAYEE_NAME)
    intent.searchParams.set("am", `${amount}`)
    intent.searchParams.set("cu", "INR")
    intent.searchParams.set("tn", `Transport: ${selectedTransport.name} on ${formattedDate} ${bookingTime}`)
    return intent.toString()
  }

  const handlePaymentDone = async () => {
    if (!selectedTransport || !bookingDate || !bookingTime || !passengers) {
      alert("Please fill all details before proceeding.")
      return
    }

    setIsProcessing(true)
    try {
      const formattedDate = bookingDate.toISOString().split('T')[0]
      const response = await fetch(`${BACKEND_URL}/api/create-transport-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transportName: selectedTransport.name,
          transportId: selectedTransport.id,
          transportType: selectedTransport.type,
          date: formattedDate,
          time: bookingTime,
          passengers: parseInt(passengers),
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
    setTransport(getRandomTransport(4))
  }, [])

  const handleRefresh = () => {
    setTransport(getRandomTransport(4))
  }

  const handleBooking = (item: Transport) => {
    setSelectedTransport(item)
    setBookingDate(null)
    setBookingTime("")
    setPassengers("")
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
            CABS & BUSES
          </h1>
          <p className="text-white/80 text-lg font-merriweather">
            Arrange reliable transport to and from the monasteries
          </p>
        </div>

        {/* Refresh Button */}
        <div className="mb-8 flex justify-end">
          <button
            onClick={handleRefresh}
            className="px-6 py-2 bg-amber-300/20 hover:bg-amber-300/30 border border-amber-300 text-amber-200 rounded-lg transition-all font-poppins"
          >
            Refresh Options
          </button>
        </div>

        {/* Transport Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {transport.map((item) => (
            <div
              key={item.id}
              className="bg-[#4a1414] rounded-2xl overflow-hidden pop-card hover:shadow-lg hover:shadow-amber-300/20 transition-all duration-300 flex flex-col"
            >
              {/* Transport Icon */}
              <div className="w-full h-48 bg-gradient-to-b from-amber-300/20 to-transparent flex items-center justify-center border-b border-amber-300/20">
                <div className="text-6xl">
                  {item.type === "Taxi" ? "🚕" : "🚌"}
                </div>
              </div>

              {/* Transport Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-cinzel-decorative text-amber-50 mb-1">
                  {item.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>
                        {i < Math.floor(item.rating) ? "★" : "☆"}
                      </span>
                    ))}
                  </div>
                  <span className="text-xs text-white/70 font-poppins">
                    ({item.reviews})
                  </span>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Monastery:</span> {item.monastery}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Capacity:</span> {item.capacity} {item.type === "Taxi" ? "passengers" : "people"}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    {item.description}
                  </p>
                  <p className="text-amber-200 font-merriweather">
                    <span className="font-semibold">₹{item.price}/{item.priceType}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleBooking(item)}
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
      {showModal && selectedTransport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b1212] border border-amber-300/30 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-cinzel-decorative text-amber-100 mb-2">
              Confirm Booking
            </h2>
            <p className="text-white/80 mb-6 font-merriweather">
              for <span className="text-amber-200 font-semibold">{selectedTransport.name}</span>
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

              <div>
                <label className="block text-amber-200 text-sm font-poppins mb-2">
                  Number of Passengers
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedTransport.capacity}
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  placeholder="Enter number"
                  className="w-full px-4 py-2 bg-white/10 border border-amber-300/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-poppins"
                />
              </div>

              <div className="pt-2 border-t border-amber-300/20">
                <p className="text-sm text-white/80 font-merriweather mb-1">
                  <span className="font-semibold">Price:</span> ₹{selectedTransport.price}/{selectedTransport.priceType}
                </p>
                {passengers && (
                  <p className="text-sm text-amber-200 font-merriweather font-semibold">
                    <span>Total: ₹{totalPrice}</span>
                  </p>
                )}
                <p className="text-xs text-white/60 font-merriweather mt-1">
                  Maximum capacity: {selectedTransport.capacity} people
                </p>
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
                    if (!bookingDate || !bookingTime || !passengers) {
                      alert("Please fill all fields")
                      return
                    }
                    const passengerCount = parseInt(passengers)
                    if (passengerCount < 1 || passengerCount > selectedTransport.capacity) {
                      alert(`Passengers must be between 1 and ${selectedTransport.capacity}`)
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
                  <p className="text-white/80 font-merriweather">Your transport has been successfully booked.</p>
                  
                  <div className="bg-white/5 border border-amber-300/30 rounded-lg p-4 space-y-2 text-left">
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Transport:</span> {selectedTransport?.name}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Date:</span> {bookingDate?.toLocaleDateString('en-GB')}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Time:</span> {TIME_SLOTS.find(slot => slot.value === bookingTime)?.label}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Passengers:</span> {passengers}
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
