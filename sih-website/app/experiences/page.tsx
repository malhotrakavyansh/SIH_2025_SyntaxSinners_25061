"use client"

import React, { useState } from "react"
import Link from "next/link"

const monasteries = [
  { id: "tashiding", name: "Tashiding" },
  { id: "rumtek", name: "Rumtek" },
  { id: "dubdi", name: "Dubdi" },
  { id: "tsuk", name: "Tsuk La Khang" },
]

const options = [
  {
    id: "tour",
    title: "TOUR GUIDE BOOKING",
    desc: "Book certified monastery tour guides who share deep knowledge of traditions, architecture, and local history.",
    icon: "/Icons/ICONS/HEADPHONE.png",
  },
  { id: "meditate", title: "MEDITATION WITH MONKS", desc: "Sit in guided meditation sessions with resident monks.", icon: "/Icons/ICONS/HEADPHONE.png" },
  { id: "cabs", title: "CABS & BUSES", desc: "Arrange reliable transport to and from the monastery.", icon: "/Icons/ICONS/HEADPHONE.png" },
  { id: "stay", title: "ACCOMMODATIONS", desc: "Find nearby guesthouses and monastery stay options.", icon: "/Icons/ICONS/HEADPHONE.png" },
]

export default function ExperiencesPage() {
  const [selected, setSelected] = useState(monasteries[0].id)

  return (
    <div className="min-h-screen py-16 px-6 bg-gradient-to-b from-[#2b0d0d] via-[#5a1f1f] to-[#3b1212] text-white">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-cinzel-decorative text-6xl md:text-[6rem] leading-none text-amber-100 text-center">EXPERIENCES</h1>
        <p className="mt-2 text-center text-white/80 underline text-lg font-lora">IMMERSE YOURSELF IN SPIRITUAL AND CULTURAL EXPERIENCES</p>

        <div className="mt-12 flex flex-col md:flex-row gap-8">
          <aside className="md:w-1/4">
            <div className="bg-transparent p-4 rounded-lg">
              <h3 className="text-sm text-amber-200 mb-4 font-poppins">Select Monastery</h3>
              <div className="flex flex-col gap-3">
                {monasteries.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m.id)}
                    className={`text-left rounded-xl px-4 py-3 transition-all duration-150 pop-card ${
                      selected === m.id
                        ? "bg-amber-50/8 ring-2 ring-amber-300 text-amber-50"
                        : "bg-white/5 hover:bg-white/10 text-white/90"
                    }`}
                  >
                    <div className="font-cinzel font-bold">{m.name}</div>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="md:w-3/4">
            <div className="mb-6">
              <h2 className="text-3xl font-cinzel text-amber-50">
                {monasteries.find((m) => m.id === selected)?.name}
              </h2>
              <p className="text-sm text-white/70 mt-1 font-merriweather">Choose an experience below to learn more or book.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {options.map((opt) => {
                const isClickable = opt.id === 'tour' || opt.id === 'cabs' || opt.id === 'stay' || opt.id === 'meditate'
                const getHref = () => {
                  if (opt.id === 'tour') return '/experiences/tour-guide-booking'
                  if (opt.id === 'cabs') return '/experiences/cabs-buses'
                  if (opt.id === 'stay') return '/experiences/accommodations'
                  if (opt.id === 'meditate') return '/experiences/meditation-booking'
                  return '#'
                }

                const content = (
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-amber-300 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden" aria-hidden>
                        {opt.id === 'stay' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                            <rect x="1.5" y="8" width="21" height="6" rx="1.5" stroke="currentColor" fill="none" />
                            <rect x="1.5" y="5" width="6" height="4" rx="1" stroke="currentColor" fill="none" />
                            <path d="M1.5 14v3M22.5 14v3" stroke="currentColor" />
                          </svg>
                        )}
                        {opt.id === 'tour' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                            <path d="M5 20v-6l4-2v8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <path d="M9 12l8-3v6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                            <circle cx="5" cy="19" r="1" stroke="currentColor" fill="none" />
                            <circle cx="17" cy="18" r="1" stroke="currentColor" fill="none" />
                            <path d="M13 6l4-2v3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                          </svg>
                        )}
                        {opt.id === 'cabs' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                            <path d="M3 11.5h1.5l1.2-3.2A2 2 0 0 1 7.6 6h8.8a2 2 0 0 1 1.9 2.3L19.5 11.5H21" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            <rect x="3" y="11.5" width="18" height="3.8" rx="1" stroke="currentColor" fill="none" />
                            <circle cx="7" cy="17.2" r="1" stroke="currentColor" fill="none" />
                            <circle cx="17" cy="17.2" r="1" stroke="currentColor" fill="none" />
                          </svg>
                        )}
                        {opt.id === 'meditate' && (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                            <circle cx="12" cy="4.5" r="2" stroke="currentColor" fill="none" />
                            <path d="M7 10c1.5-1 4-1.5 5-1.5s3.5.5 5 1.5" stroke="currentColor" fill="none" strokeLinecap="round" />
                            <path d="M5.5 13.5c1-2 3.5-3 6.5-3s5.5 1 6.5 3" stroke="currentColor" fill="none" strokeLinecap="round" />
                            <path d="M8 16.5c0-1.2 1.5-2.2 4-2.2s4 1 4 2.2" stroke="currentColor" fill="none" strokeLinecap="round" />
                            <rect x="9" y="17.7" width="6" height="0.9" rx="0.45" stroke="currentColor" fill="none" />
                          </svg>
                        )}
                      </div>

                      <div>
                        <h3 className="text-xl text-amber-50 font-cinzel">{opt.title}</h3>
                        <p className="mt-3 text-sm text-white/80 max-w-md font-merriweather">{opt.desc}</p>
                      </div>
                    </div>

                    {/* Buttons / actions aligned under text column */}
                    {opt.id === 'tour' && (
                      <div className="mt-4 ml-14">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-poppins">Book now</button>
                      </div>
                    )}

                    {opt.id === 'stay' && (
                      <div className="mt-4 ml-14">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-poppins">Book now</button>
                      </div>
                    )}

                    {opt.id === 'cabs' && (
                      <div className="mt-4 ml-14">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-poppins">Check now</button>
                      </div>
                    )}

                    {opt.id === 'meditate' && (
                      <div className="mt-4 ml-14">
                        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-poppins">Book now</button>
                      </div>
                    )}
                  </div>
                )

                return isClickable ? (
                  <Link key={opt.id} href={getHref()} className="bg-[#4a1414] rounded-3xl p-6 pop-card shine-border hover:bg-[#5a1a1a] transition-colors cursor-pointer">
                    {content}
                  </Link>
                ) : (
                  <div key={opt.id} className="bg-[#4a1414] rounded-3xl p-6 pop-card shine-border">
                    {content}
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
