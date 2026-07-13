"use client"

import React from "react"
import Link from "next/link"

export default function TravelPage() {
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
            TRAVEL OPTIONS
          </h1>
          <p className="text-white/80 text-lg font-merriweather">
            Convenient transportation options to reach the monasteries
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* BUS SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-[#4a1414] rounded-3xl p-8 pop-card shine-border h-full">
              {/* Card Header with Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-amber-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" fill="none" />
                    <path d="M6 18v2M18 18v2M2 9h20" stroke="currentColor" strokeLinecap="round" />
                    <circle cx="5" cy="16" r="1.5" fill="currentColor" />
                    <circle cx="19" cy="16" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="text-3xl font-cinzel text-amber-50">BUS</h2>
              </div>

              {/* Bus Routes */}
              <div className="space-y-4">
                {/* Route 1 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <h3 className="font-cinzel font-bold text-amber-50 mb-2">Gangtok → Rumtek</h3>
                  <p className="text-sm text-white/70 mb-3 font-merriweather">
                    <span className="inline-block text-amber-300 mr-2">⏰</span>
                    7:00 AM, 11:00 AM, 3:00 PM
                  </p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>

                {/* Route 2 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <h3 className="font-cinzel font-bold text-amber-50 mb-2">Pelling → Rumtek</h3>
                  <p className="text-sm text-white/70 mb-3 font-merriweather">
                    <span className="inline-block text-amber-300 mr-2">⏰</span>
                    8:30 AM, 2:00 PM
                  </p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>

                {/* Route 3 */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <h3 className="font-cinzel font-bold text-amber-50 mb-2">Namchi → Rumtek</h3>
                  <p className="text-sm text-white/70 mb-3 font-merriweather">
                    <span className="inline-block text-amber-300 mr-2">⏰</span>
                    9:00 AM, 4:00 PM
                  </p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CAB SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-[#4a1414] rounded-3xl p-8 pop-card shine-border h-full">
              {/* Card Header with Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-amber-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 11.5h1.5l1.2-3.2A2 2 0 0 1 7.6 6h8.8a2 2 0 0 1 1.9 2.3L19.5 11.5H21" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="3" y="11.5" width="18" height="3.8" rx="1" stroke="currentColor" fill="none" />
                    <circle cx="7" cy="17.2" r="1" stroke="currentColor" fill="none" />
                    <circle cx="17" cy="17.2" r="1" stroke="currentColor" fill="none" />
                  </svg>
                </div>
                <h2 className="text-3xl font-cinzel text-amber-50">CAB</h2>
              </div>

              {/* Cab Services */}
              <div className="space-y-4">
                {/* Sikkim Taxi Union */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-cinzel font-bold text-amber-50">Sikkim Taxi Union</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                      ● Available
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-merriweather mb-3">✆ +91-97336-12345</p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>

                {/* Gangtok Tourist Cab Service */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-cinzel font-bold text-amber-50">Tourist Cab Service</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                      ● Available
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-merriweather mb-3">✆ +91-98765-43210</p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>

                {/* Rumtek Monastery Cabs */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-cinzel font-bold text-amber-50">Monastery Cabs</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-semibold">
                      ● Not Available
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-merriweather mb-3">✆ +91-89012-34567</p>
                  <button disabled className="w-full bg-gray-500 text-gray-700 font-cinzel font-bold py-2 rounded-lg cursor-not-allowed opacity-50">
                    Currently Unavailable
                  </button>
                </div>

                {/* Shared Jeep Service */}
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-cinzel font-bold text-amber-50">Shared Jeep Service</h3>
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                      ● Available
                    </span>
                  </div>
                  <p className="text-xs text-white/60 font-merriweather mb-3">✆ +91-90123-45678</p>
                  <button className="w-full bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold py-2 rounded-lg transition">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RAILWAY STATION SECTION */}
          <div className="lg:col-span-1">
            <div className="bg-[#4a1414] rounded-3xl p-8 pop-card shine-border h-full">
              {/* Card Header with Icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-amber-300 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 text-black" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="7" width="20" height="10" rx="1" stroke="currentColor" fill="none" />
                    <line x1="6" y1="7" x2="6" y2="4" stroke="currentColor" strokeLinecap="round" />
                    <line x1="12" y1="7" x2="12" y2="3" stroke="currentColor" strokeLinecap="round" />
                    <line x1="18" y1="7" x2="18" y2="4" stroke="currentColor" strokeLinecap="round" />
                    <circle cx="5" cy="19" r="1.5" fill="currentColor" />
                    <circle cx="19" cy="19" r="1.5" fill="currentColor" />
                  </svg>
                </div>
                <h2 className="text-2xl font-cinzel text-amber-50">Railway</h2>
              </div>

              {/* Station Info */}
              <div className="space-y-4">
                <div className="bg-white/5 rounded-2xl p-4 border border-amber-300/20">
                  <h3 className="font-cinzel font-bold text-amber-50 mb-2">New Jalpaiguri (NJP)</h3>
                  <p className="text-sm text-white/70 font-merriweather">
                    <span className="inline-block text-amber-300 mr-2">📍</span>
                    148 km from monastery
                  </p>
                </div>

                {/* Info Box */}
                <div className="bg-amber-300/10 border border-amber-300/30 rounded-2xl p-4">
                  <p className="text-sm text-white/90 font-merriweather mb-2">
                    <span className="text-amber-300 font-bold">⏱ Travel Time:</span>
                    <br />
                    4–5 hours by road
                  </p>
                  <p className="text-sm text-white/90 font-merriweather">
                    <span className="text-amber-300 font-bold">💡 Tip:</span>
                    <br />
                    Pre-book taxis or shared jeeps from NJP station
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Travel Tip Box */}
        <div className="bg-yellow-400/15 border-2 border-yellow-400/40 rounded-3xl p-8 mb-12">
          <div className="flex items-start gap-4">
            <span className="text-4xl flex-shrink-0">💡</span>
            <div>
              <h3 className="font-cinzel text-amber-100 text-xl mb-2">Travel Tip</h3>
              <p className="text-white/90 font-merriweather leading-relaxed">
                Roads to monasteries can be winding. Best visited from October to May for clear weather and beautiful mountain views.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="text-center">
          <Link
            href="/experiences"
            className="inline-block px-8 py-3 bg-amber-400 hover:bg-amber-500 text-black font-cinzel font-bold rounded-lg transition-all shadow-lg"
          >
            Explore More Experiences
          </Link>
        </div>
      </div>
    </div>
  )
}
