"use client";
import { useState, useRef, useEffect } from "react";


const MONASTERIES = [
  {
    name: "Tashiding Monastery",
    location: "West Sikkim",
    altitude: "1,465m",
    founded: "1700 CE",
    description:
      "Revered as the 'Venerated Central Glory', Tashiding is vital to Sikkimese monasticism, its sublime mountain site and stupa are iconic. A single image is said to cleanse one's sins.",
    image: "/monasteries/tashiding.png",
  },
  {
    name: "Pemayangtse Monastery",
    location: "Near Pelling, West Sikkim",
    altitude: "2,085m",
    founded: "1705 CE",
    description:
      "Meaning 'Perfect Sublime Lotus', Pemayangtse stands among Sikkim's oldest monasteries, embodying purity and spiritual vision for a perfect world.",
    image: "/monasteries/pemayangtse.jpg",
  },
  {
    name: "Dubdi Monastery",
    location: "Yuksom, West Sikkim",
    altitude: "2,100m",
    founded: "1701 CE",
    description:
      "The 'Hermit's Cell', Dubdi, is Sikkim's first monastery, its stone chapel marking the crowning of the kingdom's Buddhist order.",
    image: "/monasteries/dubdi.png",
  },
  {
    name: "Rumtek Monastery",
    location: "East Sikkim",
    altitude: "1,500m",
    founded: "18th century",
    description:
      "Grand and imposing, Rumtek is the Dharma Chakra Centre, stunning, alive with ritual, color, and living tradition.",
    image: "/monasteries/rumtek.jpg",
  },
];

export default function MonasterySlideshow() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const m = MONASTERIES[index];
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);

  const startAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % MONASTERIES.length);
        setFade(true);
      }, 400);
    }, 5000);
  };

  // manual navigation (arrows, thumbnails, drag) restarts the autoplay timer
  // so it doesn't yank the slide away right after the user interacts
  const goTo = (newIndex: number) => {
    setFade(false);
    setTimeout(() => {
      setIndex(newIndex);
      setFade(true);
    }, 400);
    startAutoplay();
  };
  const next = () => goTo((index + 1) % MONASTERIES.length);
  const prev = () => goTo((index - 1 + MONASTERIES.length) % MONASTERIES.length);

  useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    const observer = new window.IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const DRAG_THRESHOLD = 50;
  const handlePointerDown = (e: React.PointerEvent) => {
    dragStartX.current = e.clientX;
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragStartX.current === null) return;
    const deltaX = e.clientX - dragStartX.current;
    dragStartX.current = null;
    if (deltaX > DRAG_THRESHOLD) prev();
    else if (deltaX < -DRAG_THRESHOLD) next();
  };
  const handlePointerLeave = () => {
    dragStartX.current = null;
  };
  return (
    <div ref={ref} className={`w-full flex flex-col items-center mt-50 fade-in-section${visible ? ' is-visible' : ''}`}> 
      {/* Title and Subtitle */}
      <h2 className="text-4xl md:text-5xl font-cinzel text-white mb-2 tracking-wide text-center">SACRED MONASTRIES</h2>
      <p className="text-lg md:text-xl text-white/90 font-lora mb-8 text-center max-w-2xl">
        Explore the spiritual heart of Sikkim through its ancient monasteries, each telling a unique story of devotion and cultural heritage.
      </p>
  <div className="relative flex flex-row items-stretch w-full max-w-none bg-transparent" style={{ minHeight: '400px', height: '400px', margin: '32px 0' }}>
        {/* Left Arrow */}
        <button
          onClick={prev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-2xl"
          aria-label="Previous"
        >&#8249;</button>
        {/* Main Card Slide */}
        <div
          className={`flex flex-row w-full rounded-2xl overflow-hidden shadow-xl relative transition-all duration-500 select-none ${fade ? 'opacity-100' : 'opacity-0'}`}
          style={{ minHeight: '400px', height: '400px', background: 'linear-gradient(to right, #e5e5e5 65%, #bdbdbd 35%)', cursor: 'grab', touchAction: 'pan-y' }}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerLeave}
        >
          {/* Image */}
          <img src={m.image} alt={m.name} className="w-[420px] h-full object-cover rounded-l-2xl" />
          {/* Info Card */}
          <div className="flex-1 flex flex-col justify-between p-0 min-w-[320px]">
            {/* Yellow Header */}
            <div className="bg-amber-400 px-12 py-4 rounded-tr-2xl rounded-bl-2xl flex items-center">
              <span className="text-3xl font-cinzel tracking-wide text-black">{m.name}</span>
            </div>
            {/* Description and Details */}
            <div className="flex flex-row w-full gap-0 h-full">
              {/* Description in lighter grey box */}
              <div className="px-12 py-8 flex-1 flex flex-col justify-center h-full bg-[#e5e5e5]" style={{ minHeight: '100%' }}>
                <div className="flex flex-col justify-center h-full">
                  <p className="text-xl font-merriweather text-black mb-8 leading-relaxed">{m.description}</p>
                  <span className="inline-block bg-amber-400 text-black font-cinzel px-8 py-3 rounded-full text-lg self-start">Slide In</span>
                </div>
              </div>
              {/* Details Box */}
              <div className="flex flex-col justify-center items-start bg-[#bdbdbd] rounded-r-2xl px-8 py-8 min-w-[260px] gap-8 h-full" style={{ minHeight: '100%' }}>
                <div className="flex flex-col gap-8 justify-center h-full w-full">
                  <div className="flex items-center gap-3">
                    {/* Location Pin Icon */}
                    <span className="inline-block w-8 h-8">
                      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                        <ellipse cx="24" cy="16" rx="4" ry="4" fill="#222"/>
                        <path d="M24 6C15.163 6 8 13.163 8 22c0 8.837 16 20 16 20s16-11.163 16-20c0-8.837-7.163-16-16-16zm0 26a6 6 0 1 1 0-12 6 6 0 0 1 0 12z" fill="#222"/>
                      </svg>
                    </span>
                    <span className="font-merriweather text-black text-lg">{m.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mountain Icon */}
                    <span className="inline-block w-8 h-8">
                      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                        <path d="M4 44L18 20l8 12 6-10 12 22H4z" fill="#222"/>
                        <path d="M18 20l8 12 6-10 12 22H4z" fill="#444" fillOpacity=".7"/>
                      </svg>
                    </span>
                    <span className="font-merriweather text-black text-lg">{m.altitude}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Clock Icon */}
                    <span className="inline-block w-8 h-8">
                      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
                        <circle cx="24" cy="24" r="18" stroke="#222" strokeWidth="3" fill="none"/>
                        <path d="M24 14v10l8 8" stroke="#222" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span className="font-merriweather text-black text-lg">Founded in {m.founded}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Right Arrow */}
        <button
          onClick={next}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-2xl"
          aria-label="Next"
        >&#8250;</button>
      </div>
      {/* Thumbnails below */}
      <div className="flex gap-4 mt-6">
        {MONASTERIES.map((mon, i) => (
          <img
            key={i}
            src={mon.image}
            alt={mon.name}
            className={`w-32 h-20 object-cover rounded-2xl border-2 ${i === index ? 'border-amber-400' : 'border-transparent'} cursor-pointer transition-all duration-200`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
