"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

interface Accommodation {
  id: number
  name: string
  type: string
  monastery: string
  rating: number
  reviews: number
  description: string
  amenities: string[]
  pricePerNight: number
  maxGuests: number
}

interface NearbyStay {
  id: number
  name: string
  distance: string
  priceRange: string
  amenities: string[]
  availability: "Available" | "Limited" | "Full"
  rating: number
}

const allAccommodations: Accommodation[] = [
  {
    id: 1,
    name: "Tashiding Monastery Guest House",
    type: "Monastery Stay",
    monastery: "Tashiding",
    rating: 4.9,
    reviews: 182,
    description: "Traditional monastery accommodation with spiritual experience",
    amenities: ["Meditation room", "Traditional meals", "WiFi", "Hot water"],
    pricePerNight: 1200,
    maxGuests: 2,
  },
  {
    id: 2,
    name: "Rumtek Heritage Guesthouse",
    type: "Guesthouse",
    monastery: "Rumtek",
    rating: 4.8,
    reviews: 156,
    description: "Cozy guesthouse near Rumtek monastery with modern amenities",
    amenities: ["AC", "Private bathroom", "WiFi", "Tea/Coffee"],
    pricePerNight: 950,
    maxGuests: 3,
  },
  {
    id: 3,
    name: "Dubdi Spiritual Retreat",
    type: "Retreat Center",
    monastery: "Dubdi",
    rating: 4.7,
    reviews: 128,
    description: "Peaceful retreat center with meditation facilities",
    amenities: ["Yoga room", "Meditation hall", "Garden", "Parking"],
    pricePerNight: 1100,
    maxGuests: 4,
  },
  {
    id: 4,
    name: "Tsuk La Khang Monastery Stay",
    type: "Monastery Stay",
    monastery: "Tsuk La Khang",
    rating: 4.9,
    reviews: 194,
    description: "Authentic monastic experience with traditional Buddhist teachings",
    amenities: ["Meditation sessions", "Traditional meals", "Library access", "Courtyard"],
    pricePerNight: 1300,
    maxGuests: 2,
  },
  {
    id: 5,
    name: "Tashiding Valley Guesthouse",
    type: "Guesthouse",
    monastery: "Tashiding",
    rating: 4.8,
    reviews: 167,
    description: "Modern guesthouse with valley views",
    amenities: ["Balcony", "Room service", "WiFi", "Heater"],
    pricePerNight: 1050,
    maxGuests: 3,
  },
  {
    id: 6,
    name: "Rumtek Sacred Inn",
    type: "Inn",
    monastery: "Rumtek",
    rating: 4.7,
    reviews: 142,
    description: "Budget-friendly inn with basic amenities",
    amenities: ["Shared kitchen", "Common area", "WiFi", "Clean rooms"],
    pricePerNight: 650,
    maxGuests: 2,
  },
]

const nearbyStays: NearbyStay[] = [
  {
    id: 1,
    name: "Yuksom Residency",
    distance: "18 km from Tashiding",
    priceRange: "Rs 1,200 - Rs 2,500",
    amenities: ["WiFi", "Parking", "Hot Water", "Restaurant", "Garden View"],
    availability: "Available",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Tashiding Guest House",
    distance: "0.5 km from Tashiding",
    priceRange: "Rs 800 - Rs 1,500",
    amenities: ["Hot Water", "Local Cuisine", "Mountain View", "Prayer Room"],
    availability: "Limited",
    rating: 4.2,
  },
  {
    id: 3,
    name: "Demazong Homestay",
    distance: "12 km from Tashiding",
    priceRange: "Rs 1,000 - Rs 2,000",
    amenities: ["WiFi", "Home Cooked Meals", "Hot Water", "Cultural Experience"],
    availability: "Available",
    rating: 4.7,
  },
  {
    id: 4,
    name: "Norling Homestay Yuksom",
    distance: "20 km from Tashiding",
    priceRange: "Rs 1,500 - Rs 2,800",
    amenities: ["WiFi", "Parking", "Hot Water", "Organic Food", "Trekking Guide"],
    availability: "Available",
    rating: 4.6,
  },
  {
    id: 5,
    name: "Potala Guest House",
    distance: "15 km from Tashiding",
    priceRange: "Rs 900 - Rs 1,800",
    amenities: ["Hot Water", "Basic WiFi", "Local Food", "Peaceful Setting"],
    availability: "Full",
    rating: 4.0,
  },
  {
    id: 6,
    name: "Tashi Gang Resort",
    distance: "22 km from Tashiding (Near Yuksom)",
    priceRange: "Rs 2,000 - Rs 4,000",
    amenities: ["WiFi", "Parking", "Hot Water", "Restaurant", "Spa", "Conference Room"],
    availability: "Available",
    rating: 4.8,
  }
]

function getRandomAccommodations(count: number = 4): Accommodation[] {
  const shuffled = [...allAccommodations].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

const getAvailabilityColor = (status: NearbyStay["availability"]) => {
  switch (status) {
    case "Available":
      return "bg-green-500/20 text-green-300"
    case "Limited":
      return "bg-yellow-500/20 text-yellow-300"
    case "Full":
      return "bg-red-500/20 text-red-300"
    default:
      return "bg-gray-500/20 text-gray-300"
  }
}

export default function AccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [selectedAccommodation, setSelectedAccommodation] = useState<Accommodation | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [checkInDate, setCheckInDate] = useState<Date | null>(null)
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null)
  const [guests, setGuests] = useState("")
  const [currentStep, setCurrentStep] = useState<"details" | "payment" | "confirm">("details")
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingConfirmed, setBookingConfirmed] = useState(false)
  const [showQRCode, setShowQRCode] = useState(false)

  const UPI_ID = "anshjayara.edu@okaxis"
  const PAYEE_NAME = "Ansh Jayara"

  const MIN_DATE = new Date(2025, 11, 8) // December 8, 2025
  const MAX_DATE = new Date(2026, 6, 31) // July 31, 2026

  const calculateNights = () => {
    if (!checkInDate || !checkOutDate) return 0
    const timeDiff = checkOutDate.getTime() - checkInDate.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    return Math.max(1, Math.ceil(daysDiff))
  }

  const calculatePrice = () => {
    if (!selectedAccommodation || !guests || calculateNights() === 0) return 0
    return selectedAccommodation.pricePerNight * calculateNights()
  }

  const buildUpiLink = () => {
    if (!selectedAccommodation || !checkInDate || !checkOutDate || !guests) return null

    const formattedCheckIn = checkInDate.toLocaleDateString("en-GB")
    const amount = calculatePrice()
    const intent = new URL("upi://pay")
    intent.searchParams.set("pa", UPI_ID)
    intent.searchParams.set("pn", PAYEE_NAME)
    intent.searchParams.set("am", `${amount}`)
    intent.searchParams.set("cu", "INR")
    intent.searchParams.set("tn", `Accommodation: ${selectedAccommodation.name} from ${formattedCheckIn}`)
    return intent.toString()
  }

  const handlePaymentDone = async () => {
    if (!selectedAccommodation || !checkInDate || !checkOutDate || !guests) {
      alert("Please fill all details before proceeding.")
      return
    }

    setIsProcessing(true)
    try {
      const checkInFormatted = checkInDate.toISOString().split("T")[0]
      const checkOutFormatted = checkOutDate.toISOString().split("T")[0]
      const response = await fetch(`${BACKEND_URL}/api/create-accommodation-booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accommodationName: selectedAccommodation.name,
          accommodationId: selectedAccommodation.id,
          accommodationType: selectedAccommodation.type,
          checkInDate: checkInFormatted,
          checkOutDate: checkOutFormatted,
          guests: parseInt(guests),
          nights: calculateNights(),
          amount: calculatePrice(),
          userName: "User",
          userEmail: "user@example.com",
        }),
      })

      const data = await response.json()
      if (data.success && data.bookingId) {
        setBookingConfirmed(true)
        setCurrentStep("confirm")
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
    setAccommodations(getRandomAccommodations(4))
  }, [])

  const handleRefresh = () => {
    setAccommodations(getRandomAccommodations(4))
  }

  const handleBooking = (accommodation: Accommodation) => {
    setSelectedAccommodation(accommodation)
    setCheckInDate(null)
    setCheckOutDate(null)
    setGuests("")
    setCurrentStep("details")
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
  const nights = calculateNights()

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
               Back to Experiences
            </Link>
          </div>
          <h1 className="font-cinzel-decorative text-5xl md:text-6xl leading-tight text-amber-100 mb-2">
            ACCOMMODATIONS
          </h1>
          <p className="text-white/80 text-lg font-merriweather">
            Find nearby guesthouses and monastery stay options near Tashiding Monastery, Sikkim
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

        {/* Accommodations Grid (booking-enabled) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {accommodations.map((accommodation) => (
            <div
              key={accommodation.id}
              className="bg-[#4a1414] rounded-2xl overflow-hidden pop-card hover:shadow-lg hover:shadow-amber-300/20 transition-all duration-300 flex flex-col"
            >
              {/* Accommodation Icon */}
              <div className="w-full h-48 bg-gradient-to-b from-amber-300/20 to-transparent flex items-center justify-center border-b border-amber-300/20">
                <div className="text-6xl">≡ƒÅ¿</div>
              </div>

              {/* Accommodation Info */}
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-xl font-cinzel-decorative text-amber-50 mb-1">{accommodation.name}</h3>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-300">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>{i < Math.floor(accommodation.rating) ? "Γÿà" : "Γÿå"}</span>
                    ))}
                  </div>
                  <span className="text-xs text-white/70 font-poppins">({accommodation.reviews})</span>
                </div>

                <div className="space-y-2 mb-4 flex-grow">
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Type:</span> {accommodation.type}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">
                    <span className="font-semibold">Monastery:</span> {accommodation.monastery}
                  </p>
                  <p className="text-sm text-white/80 font-merriweather">{accommodation.description}</p>
                  <p className="text-xs text-white/70 font-merriweather">
                    <span className="font-semibold">Amenities:</span> {accommodation.amenities.slice(0, 2).join(", ")}
                  </p>
                  <p className="text-amber-200 font-merriweather">
                    <span className="font-semibold">Rs {accommodation.pricePerNight}/night</span>
                  </p>
                </div>

                <button
                  onClick={() => handleBooking(accommodation)}
                  className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-300 hover:to-amber-200 transition-all duration-200"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Stays Near Tashiding (static list from main branch) */}
        <div className="mb-12">
          <h2 className="text-3xl font-cinzel-decorative text-amber-100 mb-4">Featured stays near Tashiding</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyStays.map((stay) => (
              <div
                key={stay.id}
                className="bg-[#4a1414] rounded-3xl p-6 pop-card shine-border hover:shadow-2xl hover:shadow-amber-300/20 transition-all duration-300 flex flex-col"
              >
                {/* Icon Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-amber-300 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="w-8 h-8 text-black"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path d="M3 21h18" strokeLinecap="round" />
                      <path d="M3 10h18" strokeLinecap="round" />
                      <path d="M5 21V10l7-7 7 7v11" strokeLinejoin="round" />
                      <path d="M9 14h6v7H9z" strokeLinejoin="round" />
                    </svg>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getAvailabilityColor(
                      stay.availability,
                    )}`}
                  >
                    ΓùÅ {stay.availability}
                  </span>
                </div>

                {/* Title & Details */}
                <h3 className="text-2xl font-cinzel font-bold text-amber-50 mb-2">{stay.name}</h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-amber-300">Γ¡É</span>
                  <span className="text-white/90 font-merriweather text-sm">{stay.rating} / 5.0</span>
                </div>

                <p className="text-sm text-white/70 font-merriweather mb-2">
                  <span className="text-amber-300">≡ƒôì</span> {stay.distance}
                </p>

                <p className="text-lg text-amber-100 font-cinzel font-bold mb-4">{stay.priceRange}/night</p>

                {/* Amenities */}
                <div className="flex-grow mb-4">
                  <h4 className="text-sm text-amber-200 font-poppins mb-2 uppercase tracking-wide">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {stay.amenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 border border-amber-300/20 rounded-full text-xs text-white/80 font-merriweather"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Book Button */}
                <button
                  disabled={stay.availability === "Full"}
                  className={`w-full py-3 rounded-xl font-cinzel font-bold transition-all ${
                    stay.availability === "Full"
                      ? "bg-gray-500 text-gray-700 cursor-not-allowed opacity-50"
                      : "bg-amber-400 hover:bg-amber-500 text-black shadow-lg hover:shadow-amber-300/50"
                  }`}
                >
                  {stay.availability === "Full" ? "Fully Booked" : "Book Now"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-yellow-400/15 border-2 border-yellow-400/40 rounded-3xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0">≡ƒÆí</span>
            <div>
              <h3 className="font-cinzel text-amber-100 text-xl mb-2">Booking Tips</h3>
              <ul className="space-y-2 text-white/90 font-merriweather leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-1">ΓåÆ</span>
                  <span>Book early during festival seasons (October - November) when monastery stays fill quickly.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-1">ΓåÆ</span>
                  <span>Most hosts offer authentic Sikkimese meals - ask about meal plans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-1">ΓåÆ</span>
                  <span>Check for guided meditation or monastery visit slots when you book.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-300 mt-1">ΓåÆ</span>
                  <span>Carry some cash; digital payments may be patchy in hill areas; card facilities may be limited.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center">
          <Link
            href="/experiences"
            className="inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold rounded-lg transition-all shadow-lg hover:shadow-amber-300/50"
          >
            Explore More Experiences
          </Link>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && selectedAccommodation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#3b1212] border border-amber-300/30 rounded-2xl p-6 md:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-cinzel-decorative text-amber-100 mb-2">Confirm Booking</h2>
            <p className="text-white/80 mb-6 font-merriweather">
              for <span className="text-amber-200 font-semibold">{selectedAccommodation.name}</span>
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-amber-200 text-sm font-poppins mb-2">Check-in Date</label>
                <DatePicker
                  selected={checkInDate}
                  onChange={(date: Date | null) => setCheckInDate(date)}
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
                <label className="block text-amber-200 text-sm font-poppins mb-2">Check-out Date</label>
                <DatePicker
                  selected={checkOutDate}
                  onChange={(date: Date | null) => setCheckOutDate(date)}
                  minDate={checkInDate || MIN_DATE}
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
                <label className="block text-amber-200 text-sm font-poppins mb-2">Number of Guests</label>
                <input
                  type="number"
                  min="1"
                  max={selectedAccommodation.maxGuests}
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  placeholder="Enter number"
                  className="w-full px-4 py-2 bg-white/10 border border-amber-300/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/50 font-poppins"
                />
              </div>

              <div className="pt-2 border-t border-amber-300/20">
                <p className="text-sm text-white/80 font-merriweather mb-1">
                  <span className="font-semibold">Price per night:</span> Rs {selectedAccommodation.pricePerNight}
                </p>
                {nights > 0 && (
                  <>
                    <p className="text-sm text-white/80 font-merriweather mb-1">
                      <span className="font-semibold">Number of nights:</span> {nights}
                    </p>
                    <p className="text-sm text-amber-200 font-merriweather font-semibold">
                      <span>Total: Rs {totalPrice}</span>
                    </p>
                  </>
                )}
                <p className="text-xs text-white/60 font-merriweather mt-1">
                  Maximum guests: {selectedAccommodation.maxGuests}
                </p>
              </div>
            </div>

            {/* Step 1: Details Selection */}
            {currentStep === "details" && (
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-amber-300/50 text-amber-200 rounded-lg font-poppins hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!checkInDate || !checkOutDate || !guests) {
                      alert("Please fill all fields")
                      return
                    }
                    const guestCount = parseInt(guests)
                    if (guestCount < 1 || guestCount > selectedAccommodation.maxGuests) {
                      alert(`Guests must be between 1 and ${selectedAccommodation.maxGuests}`)
                      return
                    }
                    if (checkOutDate <= checkInDate) {
                      alert("Check-out date must be after check-in date")
                      return
                    }
                    setCurrentStep("payment")
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-400 hover:to-amber-200 transition-all"
                >
                  Proceed to payment
                </button>
              </div>
            )}

            {/* Step 2: Payment Details */}
            {currentStep === "payment" && (
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
                        onClick={() => setCurrentStep("details")}
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
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiLink ?? "")}`}
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
            {currentStep === "confirm" && bookingConfirmed && (
              <div className="mt-6 space-y-4">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400">
                    <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-cinzel-decorative text-amber-100">Booking Confirmed!</h3>
                  <p className="text-white/80 font-merriweather">Your accommodation has been successfully booked.</p>

                  <div className="bg-white/5 border border-amber-300/30 rounded-lg p-4 space-y-2 text-left">
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Accommodation:</span> {selectedAccommodation.name}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Check-in:</span> {checkInDate?.toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Check-out:</span> {checkOutDate?.toLocaleDateString("en-GB")}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Guests:</span> {guests}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Total nights:</span> {nights}
                    </p>
                    <p className="text-sm text-white/80 font-poppins">
                      <span className="text-amber-200 font-semibold">Total Price:</span> Rs {totalPrice}
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


