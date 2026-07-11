'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '@/components/Reveal';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type TsukArchiveItem = {
  id: string;
  title: string;
  monastery: string;
  type: string;
  year: string;
  img: string;
  tags: string[];
  ocrText: string;
  location: string;
  description: string;
};

export default function TsukMonastery() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<TsukArchiveItem | null>(null);

  // AUDIO PLAYER STATE
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioDuration, setAudioDuration] = useState('0:00');
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [viewMode, setViewMode] = useState<'3d' | 'panoramic'>('3d');
  const audioRef = useRef<HTMLAudioElement>(null);

  const scrollToSection = (id: string) => {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(id);
    if (!el) return;

    el.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const images = [
    { src: '/tsuk/tsuk.avif', alt: 'Tsuk 1' },
    { src: '/tsuk/tsuk2.avif', alt: 'Tsuk 2' },
    { src: '/tsuk/tsuk3.avif', alt: 'Tsuk 3' },
  ];

  const tsukArchiveItems = [
    {
      id: 't1',
      title: 'Royal Chapel Murals',
      monastery: 'Tsuk La Khang',
      type: 'mural',
      year: '19th c.',
      img: '/tsuk/tsuk4.jpg',
      tags: ['Color-corrected', 'AI-enhanced'],
      ocrText: 'Placeholder OCR text for Royal Chapel Murals.',
      location: 'Tsuk La Khang',
      description:
        'Vibrant murals within the former royal chapel, depicting scenes from the life of Buddha and various deities, showcasing the rich artistic heritage of Sikkim.',
    },
    {
      id: 't2',
      title: 'Ancient Buddhist Scriptures',
      monastery: 'Tsuk La Khang',
      type: 'manuscript',
      year: '19th c.',
      img: '/tsuk/tsuk5.avif',
      tags: ['AI-OCR processed', 'High-res'],
      ocrText: 'Placeholder OCR text for ancient scriptures.',
      location: 'Tsuk La Khang',
      description: 'A collection of centuries-old Buddhist scriptures and manuscripts, preserved at the monastery, representing a significant repository of spiritual knowledge.',
    },
  ];

  const tsukTimeline = [
      {
      title: 'Establishment of Tsuk La Khang',
      year: '1894 CE',
      description:
        'Tsuk La Khang was constructed during the reign of Chogyal Sidkeong Tulku Namgyal, serving as the royal chapel for the Chogyal dynasty of Sikkim.',
    },
    {
      title: 'Center of Royal Rituals',
      year: 'Late 19th - Mid 20th c.',
      description:
        'The monastery was the primary location for royal ceremonies, rituals, and festivals, playing a central role in the spiritual and political life of the kingdom.',
    },
    {
      title: 'Integration with India',
      year: '1975 CE',
      description:
        'Following Sikkim\'s merger with India, the monastery transitioned from a royal chapel to a public place of worship, while retaining its cultural significance.',
    },
      {
      title: 'Preservation Efforts',
      year: 'c. 2000 CE',
      description:
        'Conservation initiatives were undertaken to preserve the monastery\'s unique murals, artifacts, and architectural integrity for future generations.',
    },
  ];


  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
    };

    const interval = setInterval(() => {
      if (audio && !audio.paused) {
        updateProgress();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  // AUDIO PLAYER HANDLERS
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Play error:', err));
    }
  };

  const skipForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime -= 10;
  };

  const fastForward = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
  };

  const fastRewind = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 30, 0);
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const progressBar = e.currentTarget;
    const clickX = e.clientX - progressBar.getBoundingClientRect().left;
    const width = progressBar.offsetWidth;
    const clickedTime = (clickX / width) * duration;
    audioRef.current.currentTime = clickedTime;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;


  // ArchiveCard component – transparent glass box with smooth hover
  const ArchiveCard = ({ item, onOpen }: { item: TsukArchiveItem; onOpen: (it: TsukArchiveItem) => void }) => {
    return (
      <div className="group relative cursor-pointer" onClick={() => onOpen(item)}>
        <div
          className="
            overflow-hidden shadow-lg rounded-2xl border-0
            transition-all duration-300 ease-out
            group-hover:shadow-2xl group-hover:scale-[1.08] group-hover:-translate-y-1
          "
          style={{
            borderRadius: '1rem',
            background: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            maxWidth: '360px',
          }}
        >
          <div
            className="aspect-[4/3] w-full overflow-hidden transition-transform duration-300 ease-out group-hover:scale-110"
            style={{ background: '#2F3A3D' }}
          >
            <img src={item.img} alt={item.title} className="h-full w-full object-cover" />
          </div>

          <div className="p-4">
            <h3 className="text-sm font-semibold text-amber-100 line-clamp-2">{item.title}</h3>
            <div className="mt-1 text-xs text-amber-200">
              {item.monastery} • {item.location}
            </div>
            {item.description && (
              <div className="mt-2 text-xs text-amber-100 leading-relaxed whitespace-pre-line">
                {item.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  type TimelineEvent = (typeof tsukTimeline)[number];

  const TimelineCard = ({ event }: { event: TimelineEvent }) => (
    <div className="rounded-3xl bg-[#4B130E] border border-amber-600/40 px-5 py-4 shadow">
      <h3 className="text-sm md:text-base font-semibold text-amber-50 mb-2">{event.title}</h3>
      <p className="text-xs md:text-sm text-amber-100/85 mb-3 leading-snug line-clamp-3">
        {event.description}
      </p>
      <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-semibold text-amber-950 bg-amber-400 px-3 py-1 rounded-full">
        <span>{event.year}</span>
      </div>
    </div>
  );

  return (
    <main className="overflow-hidden">
      <Nav />

      {/* HERO SECTION */}
      <section
        className="relative w-full overflow-hidden pt-8 pb-4"
        style={{
          backgroundImage: 'url(/bg1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        {/* Top Carousel */}
        <div className="flex justify-center gap-4 mt-6 mb-4 px-4">
          {[0, 1, 2].map((i) => (
            <Reveal delay={0.1 * (i + 1)} key={i}>
              <div
                className={`${i === 1 ? 'w-[700px]' : 'w-96'}
                h-72 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer`}
                onClick={() => goToSlide(i)}
                style={{
                  opacity: activeIndex === i ? 1 : 0.6,
                  transform: activeIndex === i ? 'scale(1)' : 'scale(0.9)',
                }}
              >
                <img
                  src={images[i].src}
                  alt={images[i].alt}
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center gap-2 mb-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                activeIndex === index
                  ? 'bg-amber-100 w-6'
                  : 'bg-amber-100/40 w-2'
              }`}
            />
          ))}
        </div>

        {/* Title + Info */}
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <Reveal delay={0.4}>
            <div className="flex-1 flex flex-col items-center text-center">
              <h1 className="text-6xl font-bold text-amber-100 tracking-wide leading-tight font-cinzel-decorative">
                TSUK LA KHANG
              </h1>
              <h2 className="text-5xl font-bold text-amber-100 tracking-wide font-cinzel-decorative">
                MONASTERY
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="flex-1 flex flex-col gap-6 text-amber-100 pl-12">
              <div className="flex items-start gap-4">
                <svg
                  className="w-8 h-8 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <div>
                  <div className="text-xl font-semibold">TSUK LA KHANG, GANGTOK</div>
                  <div className="text-lg">GANGTOK (737135), INDIA</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg
                  className="w-8 h-8 mt-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div className="text-xl font-semibold">BUILT IN</div>
                  <div className="text-lg">1894 CE</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Hero Buttons */}
        <div className="flex justify-center gap-4 mt-10 flex-wrap px-8">
          {[
            { key: 'overview', target: 'overview' },
            { key: 'digitalArchive', target: 'digital-archive' },
            { key: 'culturalCalendar', target: 'cultural-calendar' },
            { key: 'audioTour', target: 'audio-tour' },
            { key: 'virtualTour', target: 'virtual-tour' },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => scrollToSection(btn.target)}
              className="px-8 py-3 bg-amber-200 text-amber-900 rounded-full font-bold uppercase hover:bg-amber-100 transition"
              style={{ fontFamily: 'Cinzel' }}
            >
              {t(`monasteryPage.sections.${btn.key}`)}
            </button>
          ))}
        </div>
      </section>

      {/* OVERVIEW SECTION */}
      <section id="overview" className="relative w-full py-20" style={{ backgroundColor: '#410704' }}>
        <div className="w-full max-w-7xl xl:max-w-[95rem] mx-auto px-6 lg:px-14">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)] gap-10 xl:gap-12 items-start">
              {/* LEFT TEXT */}
              <div>
                <Reveal>
                  <h2 className="text-4xl md:text-5xl font-bold text-amber-100 mb-8 leading-tight uppercase" style={{ fontFamily: 'Cinzel', fontWeight: 900 }}>
                    TSUK LA KHANG MONASTERY: WHERE THE SPIRIT FINDS HARMONY IN SACRED STILLNESS
                  </h2>
                </Reveal>

                <div className="rounded-3xl bg-white/5 backdrop-blur-sm border border-amber-500/10 p-8">
                    <Reveal delay={0.2}>
                    <p className="text-base text-amber-50 leading-relaxed mb-6">
                      Tsuk La Khang Monastery, located in the heart of Gangtok, is the former royal chapel of the Chogyal dynasty and one of Sikkim’s most significant centres of Buddhist learning. Set against the Himalayan skyline, its simple white façade opens into a richly adorned prayer hall filled with vibrant murals, intricate thangka paintings, and centuries-old Buddhist scriptures. The monastery remains an active spiritual space where monks chant, meditate, and perform traditional rituals, offering visitors an authentic glimpse into living Buddhist practice rather than a staged cultural display.
                    </p>
                  </Reveal>

                  <Reveal delay={0.35}>
                    <p className="text-base text-amber-50 leading-relaxed">
                      The monastery’s serene courtyard overlooks the city of Gangtok, creating a striking contrast between its calm spiritual atmosphere and the bustling life below. During festivals, the space comes alive with ceremonial chants, musical instruments, and masked dances that reflect Sikkim’s deep-rooted cultural identity.
                    </p>
                  </Reveal>
                  <Reveal delay={0.5}>
                    <p className="text-base text-amber-50 leading-relaxed mt-6">
                      Built in the late 19th century during the reign of Chogyal Sidkeong Tulku Namgyal, Tsuk La Khang emerged at a time when Sikkim was navigating British influence and redefining its cultural identity. Sidkeong Tulku envisioned it as a centre for strengthening the Nyingma school of Tibetan Buddhism and preserving traditional scholarship. Its placement within the royal palace complex underscores its importance as both a religious and royal institution.
                    </p>
                  </Reveal>

                  <Reveal delay={0.65}>
                    <p className="text-base text-amber-50 leading-relaxed">
                      Through the colonial era, Sikkim’s modernization phase, and its eventual integration with India, Tsuk La Khang has remained a cornerstone of spiritual life. Today, it stands as a living archive of Sikkim’s heritage—an enduring symbol of faith, royal patronage, and the timeless Buddhist traditions that continue to shape the region.
                    </p>
                  </Reveal>
                </div>
              </div>

              {/* RIGHT SIDE INFO */}
              <aside className="space-y-8">

                {/* UPDATED LOCATION CARD */}
                <div className="ml-auto w-[340px] max-w-full rounded-3xl bg-[#1a1209] border border-amber-500/40 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-amber-100 mb-2 flex items-center gap-2">
                    {t('monasteryPage.common.locationMap')}
                  </h3>

                  <p className="text-xs text-amber-300 mb-3">
                    27.328550, 88.614650
                  </p>

                  <div className="overflow-hidden rounded-2xl mb-4">
                    <iframe
                      title="Tsuk map"
                      className="w-full h-56"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3483.7067076783474!2d88.6146503!3d27.3285504!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39e6a51639b83b4f%3A0x6e86ba8d097ec58f!2sTsuglagkhang%20Monastery%2C%20Gangtok!5e0!3m2!1sen!2sin!4v1733400000000!5m2!1sen!2sin"
                    />
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="https://maps.app.goo.gl/5ZRM2Z7SbpedhkMe7"
                      className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-amber-950 font-semibold flex items-center justify-center"
                    >
                      Get Directions
                    </a>

                    <a
                      href="https://maps.app.goo.gl/5ZRM2Z7SbpedhkMe7"
                      className="flex-1 px-3 py-2 rounded-full border border-amber-500 text-amber-100 text-center font-semibold text-xs"
                    >
                      View on Google Maps
                    </a>
                  </div>
                </div>

                {/* Visit info card */}
                <div className="ml-auto w-[340px] max-w-full rounded-3xl bg-[#1a1209] border border-amber-500/40 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-amber-100 mb-3">
                    Visit Information
                  </h3>

                  <div className="space-y-3 text-xs text-amber-50">
                    <div>
                      <p className="font-semibold text-amber-100">Visiting Hours</p>
                      <p>Monastery: 7:00 AM - 5:00 PM, Daily.</p>
                    </div>

                    <div className="border-t border-amber-500/30 pt-2">
                      <p className="font-semibold text-amber-100">Entry Fee</p>
                      <p>₹ Free for all visitors.</p>
                    </div>

                    <div className="border-t border-amber-500/30 pt-2">
                      <p className="font-semibold text-amber-100">Best Visit Times</p>
                      <p>
                        During Pang Lhabsol (August/September), Losar (February/March), and Saga Dawa (May/June) for vibrant Buddhist celebrations, masked dances, and special prayers. October to November and March to May: Pleasant weather (10-20°C) with clear skies, ideal for exploring. Early morning (7-9 AM) is recommended for a peaceful experience and to witness morning prayers.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>

            </div>
          </div>
      </section>

      {/* DIGITAL ARCHIVE SECTION */}
      <section
        id="digital-archive"
        className="w-screen min-h-[80vh] py-0"
        style={{ backgroundColor: '#410704' }}
      >
        {/* FULL WIDTH TOP BAR WITH VIDEO BACKGROUND */}
        <div className="relative w-screen h-56 md:h-72 lg:h-80 overflow-hidden flex items-center">
          {/* Background video */}
          <video
            src="/archive.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Gradient overlay for contrast */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.1) 100%)',
            }}
          />

          {/* DIGITAL ARCHIVE text + icon */}
          <div className="relative z-10 w-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-amber-100">
                <span className="text-amber-100 text-2xl">⏱</span>
              </div>

              <h3 className="text-amber-100 text-4xl md:text-5xl font-bold uppercase" style={{ fontFamily: 'Cinzel Decorative', letterSpacing: '0.08em' }}>
                DIGITAL ARCHIVE
              </h3>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
<div
  className="relative w-screen min-h-[70vh] py-12 px-6 md:px-12"
  style={{
    backgroundColor: '#4b1f0f',
  }}
>
  {/* LEFT-HALF WATERMARK */}
  <div
    className="pointer-events-none absolute inset-y-0 left-0 w-1/2 opacity-45"
    style={{
      backgroundImage: "url('/design.png')",
      backgroundRepeat: 'repeat',
      backgroundSize: '500px auto',
    }}
  />
  <div
    className="absolute inset-y-0 right-0 w-[50%]"
    style={{
      backgroundColor: "#87522d", // <-- CHANGE THIS TO ANY COLOR YOU WANT
      opacity: 1,
    }}
  />


  {/* REAL CONTENT (ABOVE THE WATERMARK) */}
  <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT SIDE — Archive Cards */}
            <div className="flex flex-col gap-6">
              {tsukArchiveItems.map((it) => (
                <ArchiveCard
                  key={it.id}
                  item={it}
                  onOpen={(i) => {
                    setActiveItem(i);
                    setOpenDialog(true);
                  }}
                />
              ))}
            </div>

            {/* RIGHT SIDE — Info Section */}
            <div className="flex flex-col gap-8">
              <div className="w-full">
                <h2 className="text-amber-100 text-xl font-bold uppercase mb-4 flex items-center gap-2" style={{ fontFamily: 'Cinzel' }}>
                  <span className="text-amber-400 text-2xl">⏱</span>
                  RESEARCH & DOCUMENTATION
                </h2>

                <div className="flex flex-wrap gap-4 justify-between">
                  {/* 1 */}
                  <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-100 leading-tight">
                      Archaeological Survey Date
                    </p>
                    <p className="text-sm text-amber-50 mt-1 leading-snug">19th century establishment</p>
                  </div>

                  {/* 2 */}
                  <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-100 leading-tight">
                      Archaeological Survey By
                    </p>
                    <p className="text-sm text-amber-50 mt-1 leading-snug">
                      Sikkim State Archaeology Department, Inheritage Foundation
                    </p>
                  </div>

                  {/* 3 */}
                  <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-100 leading-tight">
                      Preservation Status
                    </p>
                    <p className="text-sm text-amber-50 mt-1 leading-snug">
                      Excellent, well-maintained with ongoing conservation efforts
                    </p>
                  </div>

                  {/* 4 */}
                  <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-100 leading-tight">
                      Heritage Status
                    </p>
                    <p className="text-sm text-amber-50 mt-1 leading-snug">
                      Royal Chapel of the former Kingdom of Sikkim
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-5 mt-6">
                <h2 className="text-amber-100 text-xl font-bold uppercase mb-2 flex items-center gap-2" style={{ fontFamily: 'Cinzel' }}>
                  <span className="text-amber-400 text-2xl">📜</span>
                  CHRONOLOGY OF TSUK
                </h2>

                {tsukTimeline.map((ev) => (
                  <TimelineCard key={ev.title} event={ev} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CULTURAL CALENDAR SECTION */}
<section
  id="cultural-calendar"
  className="relative w-full"
  style={{ backgroundColor: '#410704' }}
>
  {/* TOP BAR WITH VIDEO */}
  <div className="relative w-screen h-56 md:h-72 lg:h-80 overflow-hidden flex items-center">
    <video
      src="/cultural calendar vid.mp4"
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 w-full h-full object-cover"
    />

    {/* Gradient overlay (same as Digital Archive) */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.1) 100%)',
      }}
    />

    {/* Center Title */}
    <div className="relative z-10 w-full flex items-center justify-center">
      <div className="flex items-center gap-3">
        <h3
          className="text-amber-100 text-3xl md:text-4xl font-semibold tracking-[0.25em] uppercase"
          style={{ fontFamily: 'Cinzel Decorative' }}
        >
          CULTURAL CALENDAR
        </h3>
      </div>
    </div>
  </div>

  {/* ORIGINAL CONTENT BELOW VIDEO */}
  <div className="max-w-7xl mx-auto px-6 lg:px-14 py-20">
          {/* Horizontal Timeline Container */}
          <div className="relative" style={{ paddingTop: '150px', paddingBottom: '0px' }}>
            {/* Main horizontal dashed line (centered between top/bottom boxes) */}
              <div className="absolute left-0 right-0 h-1 transform -translate-y-1/2"
                style={{
                  top: 'calc(50% - 89px)',
                  backgroundImage: 'repeating-linear-gradient(to right, #d97706 0px, #d97706 15px, transparent 15px, transparent 35px)',
                  zIndex: 0,
                }}
              />

            {/* Timeline events - horizontal layout with centered dots/connectors */}
            <div className="grid grid-cols-5 gap-0 relative" style={{ minHeight: '360px' }}>
              {/* Column 1 - Saga Dawa (top) */}
              <div className="relative">
                <Reveal delay={0.1}>
                  {/* Top box */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-200 border-4 border-yellow-400 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 160px)', zIndex:2 }}>
                    <p className="text-xs font-semibold text-amber-900 mb-1">May–June</p>
                    <p className="text-xs text-amber-900 mb-2">Full-moon of the 4th Tibetan month</p>
                    <h3 className="text-lg font-bold text-amber-900">Saga Dawa</h3>
                  </div>
                  {/* Connector from box down to center line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: 'calc(50% - 64px)', width: '4px', height: '64px', backgroundColor: '#fcd34d' }} />
                  {/* Dot on center line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#fef08a', border: '4px solid #f59e0b', transformOrigin: 'center', zIndex: -1 }} />
                </Reveal>
              </div>

              {/* Column 2 - Drukpa Teshi (bottom) */}
              <div className="relative">
                <Reveal delay={0.2}>
                  {/* Dot on center line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#f59e0b', border: '4px solid #b45309', zIndex: -1 }} />
                  {/* Connector from center line down to box */}
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: '50%', width: '4px', height: '80px', backgroundColor: '#eab308', zIndex:-2 }} />
                  {/* Bottom box */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-400 border-4 border-yellow-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}>
                    <p className="text-xs font-semibold text-white mb-1">July–August</p>
                    <p className="text-xs text-white mb-2">4th day of the 6th Tibetan month</p>
                    <h3 className="text-lg font-bold text-white">Drukpa Teshi</h3>
                  </div>
                </Reveal>
              </div>

              {/* Column 3 - Pang Lhabsol (top) */}
              <div className="relative">
                <Reveal delay={0.3}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 border-4 border-orange-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 160px)', zIndex:2 }}>
                    <p className="text-xs font-semibold text-white mb-1">Late Aug–Early Sep</p>
                    <p className="text-xs text-white mb-2">15th day of the 7th Tibetan month</p>
                    <h3 className="text-lg font-bold text-white">Pang Lhabsol</h3>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: 'calc(50% - 64px)', width: '4px', height: '64px', backgroundColor: '#fb923c' }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#fb923c', border: '4px solid #ea580c', zIndex: -1 }} />
                </Reveal>
              </div>

              {/* Column 4 - Kagyed Dance (bottom) */}
              <div className="relative">
                <Reveal delay={0.4}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#d97706', border: '4px solid #92400e', zIndex: -1 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: '50%', width: '4px', height: '80px', backgroundColor: '#d97706', zIndex:-2 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-500 border-4 border-yellow-700 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}>
                    <p className="text-xs font-semibold text-white mb-1">Early December</p>
                    <p className="text-xs text-white mb-2">28th–29th day of 10th Tibetan month</p>
                    <h3 className="text-lg font-bold text-white">Kagyed Dance</h3>
                  </div>
                </Reveal>
              </div>

              {/* Column 5 - Losoong (top) */}
              <div className="relative">
                <Reveal delay={0.5}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-orange-600 to-orange-500 border-4 border-orange-700 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 160px)', zIndex:2 }}>
                    <p className="text-xs font-semibold text-white mb-1">December</p>
                    <p className="text-xs text-white mb-2">Last week of 10th Tibetan month</p>
                    <h3 className="text-lg font-bold text-white">Losoong</h3>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: 'calc(50% - 64px)', width: '4px', height: '64px', backgroundColor: '#ea580c' }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#fb6b13', border: '4px solid #c2410c', zIndex: -1 }} />
                </Reveal>
              </div>
            </div>
          </div>

          {/* Calendar Narrative Section */}
          <Reveal delay={0.6}>
            <div className="mt-2 space-y-8">
              {/* Festival narratives in grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Saga Dawa */}
                <Reveal delay={0.7}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">Saga Dawa</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Brings a serene, devotional atmosphere. Inside Tsuk La Khang, monks chant scriptures commemorating the Buddha&apos;s birth, enlightenment, and parinirvana. Butter lamps glow throughout the day, and devotees circumambulate the monastery with incense and prayer wheels, creating a sense of shared merit.
                    </p>
                  </div>
                </Reveal>

                {/* Drukpa Teshi */}
                <Reveal delay={0.75}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">Drukpa Teshi</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Introduces a more structured ritual tone. This festival marks the Buddha&apos;s first teaching of the Four Noble Truths. Tsuk La Khang conducts special dharma recitations and blessings, and the courtyard becomes a gathering ground for teachings meant to foster clarity and wisdom for the months ahead.
                    </p>
                  </div>
                </Reveal>

                {/* Pang Lhabsol */}
                <Reveal delay={0.8}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-500/20 p-6 hover:border-orange-400/40 transition-colors">
                    <h3 className="text-xl font-bold text-orange-300 mb-3">Pang Lhabsol</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      The most distinctive festival of Sikkim. Tsuk La Khang becomes the center of state ritual life, honoring Mount Khangchendzonga as a guardian deity. Sacred Cham dances, masked monks, the boom of long horns, and rhythmic drumbeats turn the monastery into a dramatic spiritual theatre, symbolizing unity and protection of Sikkim&apos;s heritage.
                    </p>
                  </div>
                </Reveal>

                {/* Kagyed */}
                <Reveal delay={0.85}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-600/20 p-6 hover:border-yellow-500/40 transition-colors">
                    <h3 className="text-xl font-bold text-yellow-300 mb-3">Kagyed</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Shifts the mood toward purification. Nighttime masked dances take place in the Tsuk La Khang courtyard, representing protective deities driving away negativity. The interplay of shadows, ritual fire, butter lamps, and precise choreography creates one of the year&apos;s most striking ritual performances.
                    </p>
                  </div>
                </Reveal>

                {/* Losoong */}
                <Reveal delay={0.9}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-600/20 p-6 hover:border-orange-500/40 transition-colors lg:col-span-2">
                    <h3 className="text-xl font-bold text-orange-300 mb-3">Losoong</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      The Sikkimese New Year. Tsuk La Khang becomes a site of renewal—monks offer year-end prayers, perform auspicious Cham dances, and bless visitors seeking prosperity and a clean beginning for the year ahead.
                    </p>
                  </div>
                </Reveal>
              </div>

              {/* Closing narrative */}
              <Reveal delay={0.95}>
                <div className="rounded-3xl bg-gradient-to-r from-orange-900/20 to-amber-900/20 backdrop-blur-md border border-amber-500/20 p-8">
                  <p className="text-base text-amber-50 leading-relaxed font-light">
                    Through these festivals, Tsuk La Khang defines the cultural and spiritual calendar of Sikkim. Each celebration is not just an event but a communal experience that reinforces identity, continuity, and the living heritage of the region.
                  </p>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AUDIO TOUR SECTION */}
      <section
        id="audio-tour"
        className="relative w-full py-0"
        style={{ backgroundColor: '#410704' }}
      >
        {/* Heading with video background */}
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          <video
            src="/audio tour vid.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, rgba(107, 74, 58, 0.8) 0%, rgba(65, 7, 4, 0.8) 100%)',
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-14 text-center">
            <h2
              className="text-amber-100 text-6xl md:text-7xl font-bold mb-2 flex items-center justify-center gap-4"
              style={{ fontFamily: 'Cinzel Decorative', fontWeight: 'bold' }}
            >
              <img
                src="/Icons/ICONS/HEADPHONE.png"
                alt="Headphone"
                className="w-16 h-16"
                style={{
                  filter:
                    'brightness(0) saturate(100%) invert(80%) sepia(60%) hue-rotate(30deg) saturate(120%)',
                }}
              />
              AUDIO TOUR
            </h2>
          </div>
        </div>

        {/* Content section */}
        <div className="w-full py-10" style={{ backgroundColor: '#410704' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-14">
            <div className="text-center mb-10">
              <p className="text-amber-50 text-lg italic max-w-2xl mx-auto uppercase">
                Experience Tsuk Monastery through an immersive audio-guided journey.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="relative">
                <svg
                  className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search audio guides"
                  className="w-full pl-16 pr-6 py-4 rounded-full text-amber-100 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  style={{
                    backgroundColor: 'rgba(217, 119, 6, 0.2)',
                    border: '2px solid rgba(217, 119, 6, 0.3)',
                    backdropFilter: 'blur(10px)',
                  }}
                />
              </div>
            </div>

            {/* Audio Tour Card */}
            <div
              className="max-w-4xl mx-auto rounded-3xl p-8"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                border: '2px solid rgba(217, 119, 6, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <audio
                ref={audioRef}
                src="/tsuk/tsuk audio guide.wav"
                preload="metadata"
                onTimeUpdate={(e) => {
                  const time = (e.target as HTMLAudioElement).currentTime;
                  setCurrentTime(time);
                  console.log('Time update:', time);
                }}
                onLoadedMetadata={(e) => {
                  const dur = (e.target as HTMLAudioElement).duration;
                  setDuration(dur);
                  const minutes = Math.floor(dur / 60);
                  const seconds = Math.floor(dur % 60);
                  setAudioDuration(`${minutes}:${seconds.toString().padStart(2, '0')}`);
                }}
                onEnded={() => {
                  setIsPlaying(false);
                }}
              />
              <div className="grid md:grid-cols-2 gap-8 items-center">
                {/* Image */}
                <div className="rounded-2xl overflow-hidden group cursor-pointer">
                  <img
                    src="/tsuk/audiim.png"
                    alt="Tsuk Monastery"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
                  />
                </div>

                {/* Audio Content */}
                <div className="flex flex-col gap-6">
                  <p className="text-amber-50 text-lg italic leading-relaxed">
                    Listen to the stories and history of the Tsuk Monastery, from its time as a royal chapel to its current role as a center of Buddhist learning.
                  </p>

                  {/* Player Controls */}
                  <div className="flex items-center justify-between gap-4">
                    <button className="text-amber-100 hover:text-white transition">☰</button>
                    <button
                      onClick={toggleLike}
                      className={`transition ${
                        isLiked ? 'text-red-500' : 'text-amber-100 hover:text-white'
                      }`}
                    >
                      {isLiked ? '❤' : '♡'}
                    </button>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative w-full mb-4">
                    <div 
                      className="w-full h-2 bg-amber-900/30 rounded-full cursor-pointer group"
                      onClick={handleProgressClick}
                    >
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full relative"
                        style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`, transition: 'width 0.1s linear' }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-100 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={fastRewind}
                      className="text-amber-100 hover:text-white transition text-2xl hover:scale-110 active:scale-95"
                    >
                      ⏮
                    </button>
                    <button
                      onClick={skipBackward}
                      className="text-amber-100 hover:text-white transition text-2xl hover:scale-110 active:scale-95"
                    >
                      ◀
                    </button>
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center text-2xl text-amber-900 hover:scale-110 transition shadow-lg"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>
                    <button
                      onClick={skipForward}
                      className="text-amber-100 hover:text-white transition text-2xl hover:scale-110 active:scale-95"
                    >
                      ▶
                    </button>
                    <button
                      onClick={fastForward}
                      className="text-amber-100 hover:text-white transition text-2xl hover:scale-110 active:scale-95"
                    >
                      ⏭
                    </button>
                  </div>

                  {/* Duration and Download */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-100">
                      <span className="text-xl">⏱</span>
                      <span className="font-semibold">
                        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}
                      </span>
                    </div>
                    <button className="text-amber-100 hover:text-white transition text-2xl">⬇</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIRTUAL TOUR SECTION */}
      <section
        id="virtual-tour"
        className="relative w-full py-20"
        style={{ backgroundColor: '#410704' }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          {/* Header */}
          <div
            className="relative text-center mb-16 overflow-hidden rounded-3xl py-20"
            style={{
              marginLeft: 'calc(-100vw / 2 + 100% / 2)',
              marginRight: 'calc(-100vw / 2 + 100% / 2)',
            }}
          >
            {/* Video Background for Header Only */}
            <div className="absolute inset-0">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute w-screen h-full object-cover opacity-70"
              >
                <source src="/virtual tour video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-[#410704]/30 via-[#410704]/40 to-[#410704]/50"></div>
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-3 mb-6">
                <img src="/Icons/ICONS/video tour icon.png" alt="Virtual Tour" className="w-12 h-12" />
                <h2
                  className="text-5xl font-bold text-amber-50 uppercase"
                  style={{ fontFamily: 'Cinzel Decorative' }}
                >
                  Virtual Tour
                </h2>
              </div>
              <p className="text-amber-50 text-lg italic max-w-3xl mx-auto">
                Step into Tsuk Monastery digitally—explore its courtyards, prayer halls, and surrounding
                hills in an immersive 360° experience.
              </p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Tour Features */}
            <div className="space-y-6">
              {/* Monastery Card */}
              <div
                className="rounded-3xl p-6"
                style={{
                  backgroundColor: 'rgba(120, 53, 15, 0.6)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-extrabold text-amber-900"
                    style={{ fontFamily: 'Cinzel Decorative' }}
                  >
                    T
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-2xl font-semibold text-amber-50 mb-2 uppercase"
                      style={{ fontFamily: 'Cinzel' }}
                    >
                      Tsuk Monastery
                    </h3>
                    <div className="flex items-center gap-4 text-amber-200 text-sm mb-3">
                      <span className="flex items-center gap-1">📍 East Sikkim</span>
                      <span className="flex items-center gap-1">📅 Est 1894</span>
                    </div>
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-medium text-amber-900 bg-amber-100">
                      360° Tour Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Tour Features Box */}
              <div
                className="rounded-3xl p-6 h-96 flex flex-col overflow-hidden"
                style={{
                  backgroundColor: 'rgba(120, 53, 15, 0.5)',
                  border: '2px solid rgba(217, 119, 6, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3
                  className="text-lg font-semibold text-amber-50 mb-4 uppercase"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  Tour Features
                </h3>
                <div className="space-y-3 flex-1 flex flex-col justify-center overflow-y-auto">
                  <div
                    className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 p-2.5">
                      <img src="/Icons/ICONS/LOCATION.png" alt="Interactive Navigation" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">
                        Interactive Navigation
                      </h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">
                        Move freely through courtyards, halls, and stairways.
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 p-2.5">
                      <img src="/Icons/ICONS/HEADPHONE.png" alt="Audio Narration" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">
                        Audio Narration
                      </h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">
                        Layered storytelling on history, art, and rituals.
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 p-2">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <path d="M17 2H7C5.89543 2 5 2.89543 5 4V20C5 21.1046 5.89543 22 7 22H17C18.1046 22 19 21.1046 19 20V4C19 2.89543 18.1046 2 17 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7 6H17M7 18H17M10 19H14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        <circle cx="8" cy="10" r="0.75" fill="currentColor"/>
                        <circle cx="12" cy="10" r="0.75" fill="currentColor"/>
                        <circle cx="16" cy="10" r="0.75" fill="currentColor"/>
                        <circle cx="8" cy="13" r="0.75" fill="currentColor"/>
                        <circle cx="12" cy="13" r="0.75" fill="currentColor"/>
                        <circle cx="16" cy="13" r="0.75" fill="currentColor"/>
                        <circle cx="8" cy="16" r="0.75" fill="currentColor"/>
                        <circle cx="12" cy="16" r="0.75" fill="currentColor"/>
                        <circle cx="16" cy="16" r="0.75" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">
                        Mobile Friendly
                      </h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">
                        Explore Tsuk from any device, anywhere.
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-amber-600 flex items-center justify-center flex-shrink-0 p-2">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
                        <path d="M3 14L8 9L12 13L21 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="16" cy="8" r="2" fill="currentColor"/>
                        <path d="M1 1L5 5M19 1L23 5M1 23L5 19M19 23L23 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">
                        High Resolution
                      </h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">
                        Crisp details of murals, stupas, and textures.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vlogger Journeys Box */}
              <div
                className="rounded-3xl p-6"
                style={{
                  backgroundColor: 'rgba(120, 53, 15, 0.5)',
                  border: '2px solid rgba(217, 119, 6, 0.4)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 p-2.5">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                      <path d="M3 4C3 2.89543 3.89543 2 5 2H16C17.1046 2 18 2.89543 18 4V13C18 14.1046 17.1046 15 16 15H5C3.89543 15 3 14.1046 3 13V4Z" stroke="currentColor" strokeWidth="0.5"/>
                      <path d="M18 6.5L22 4V13L18 10.5V6.5Z"/>
                      <circle cx="6.5" cy="5.5" r="1" fill="white" opacity="0.8"/>
                      <path d="M8.5 7L13 9.5L8.5 12V7Z" fill="white"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-xl font-semibold text-amber-50 mb-2 leading-tight"
                      style={{ fontFamily: 'Chivo' }}
                    >
                      Explore Through Their Eyes: Virtual Tour Based on Vlogger Journeys
                    </h3>
                    <p
                      className="text-base text-amber-200 leading-relaxed mb-4"
                      style={{ fontFamily: 'Chivo' }}
                    >
                      Experience the monastery through authentic perspectives captured by travel vloggers. Navigate their documented paths and discover hidden details they&apos;ve shared.
                    </p>
                    
                    {/* Video Links */}
                    <div className="space-y-2">
                      <a 
                        href="https://www.youtube.com/watch?v=2wFeKXtUCiY" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=2wFeKXtUCiY</span>
                      </a>
                      <a 
                        href="https://www.youtube.com/watch?v=lSAVxUSX21I" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=lSAVxUSX21I</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Tour Preview */}
            <div className="space-y-6">
              {/* View Mode Toggle */}
              <div
                className="rounded-full p-1.5"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.2)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                }}
              >
                <div className="flex gap-1">
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      viewMode === '3d'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-900 shadow-lg'
                        : 'text-amber-100 hover:text-amber-50'
                    }`}
                    style={{ fontFamily: 'Cinzel' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 2L3 7V17L12 22L21 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        <path d="M12 12L3 7M12 12L21 7M12 12V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M7.5 9.5L12 12L16.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>3D Model</span>
                    </span>
                  </button>
                  <button
                    onClick={() => setViewMode('panoramic')}
                    className={`flex-1 px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                      viewMode === 'panoramic'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-900 shadow-lg'
                        : 'text-amber-100 hover:text-amber-50'
                    }`}
                    style={{ fontFamily: 'Cinzel' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <ellipse cx="12" cy="6" rx="10" ry="3" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <path d="M2 6V18C2 19.6569 6.47715 21 12 21C17.5228 21 22 19.6569 22 18V6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                        <circle cx="9" cy="11" r="1.5" fill="currentColor"/>
                        <path d="M7 15L10 12L13 15L17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                      <span>Panoramic</span>
                    </span>
                  </button>
                </div>
              </div>

              {/* Start Tour Button */}
              <button
                className="w-full py-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group"
                style={{ fontFamily: 'Cinzel' }}
              >
                <span className="text-3xl group-hover:scale-110 transition-transform">▶</span>
                <span className="text-2xl font-bold text-amber-900">Start {viewMode === '3d' ? '3D' : 'Panoramic'} Tour</span>
              </button>

              {/* Preview Box with Dynamic Content */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <div className="h-[28rem] relative">
                  {viewMode === '3d' ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover"
                      style={{ filter: 'contrast(1.15) saturate(1.2) brightness(1.08) sharpness(1.1)' }}
                    >
                      <source src="/tsuk/tsuk 3d.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <div className="h-full bg-gradient-to-br from-amber-900 to-orange-900 flex items-center justify-center">
                      <div className="text-center text-amber-100">
                        <div className="text-6xl mb-4">👁️</div>
                        <p className="text-lg font-semibold mb-2" style={{ fontFamily: 'Cinzel' }}>Panoramic View</p>
                        <p className="text-sm text-amber-200" style={{ fontFamily: 'Cinzel' }}>360° immersive experience</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Mode indicator badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-amber-900/80 backdrop-blur-sm border border-amber-500/30">
                    <span className="text-xs font-semibold text-amber-100 uppercase" style={{ fontFamily: 'Cinzel' }}>
                      {viewMode === '3d' ? '3D Model' : 'Panoramic 360°'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Modal – OCR + Image (matches Rumtek behavior) */}
      {openDialog && activeItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setOpenDialog(false)}
        >
          <div
            className="max-w-3xl w-full overflow-hidden rounded-3xl"
            style={{
              background: '#1a1209',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image */}
              <div className="relative" style={{ background: '#2F3A3D' }}>
                <img src={activeItem.img} alt={activeItem.title} className="h-full w-full object-cover" />
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                <h2 className="text-2xl font-semibold text-amber-100">{activeItem.title}</h2>

                {/* OCR / Details */}
                <div className="mt-5">
                  <h3 className="font-medium mb-2 text-amber-100">OCR Snippet</h3>
                  <div
                    className="rounded-xl p-4 text-sm text-amber-50"
                    style={{
                      background: 'rgba(248, 244, 234, 0.1)',
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                    }}
                  >
                    {activeItem.ocrText}
                  </div>
                </div>

                <button onClick={() => setOpenDialog(false)} className="mt-6 text-amber-200 hover:text-amber-100">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Booking Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#3b1212] to-[#2b0d0d] border-t border-amber-300/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-cinzel-decorative text-amber-100 mb-12 text-center">
            Experience Tsuk La Khang
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BookingCard 
              title="GUIDED TOUR" 
              description="Book a certified tour guide" 
              icon="🧑‍🏫"
              href="/experiences/tour-guide-booking"
            />
            <BookingCard 
              title="MEDITATION" 
              description="Join meditation sessions" 
              icon="🧘"
              href="/experiences/meditation-booking"
            />
            <BookingCard 
              title="ACCOMMODATION" 
              description="Book your stay" 
              icon="🏨"
              href="/experiences/accommodations"
            />
            <BookingCard 
              title="TRANSPORT" 
              description="Arrange transport" 
              icon="🚌"
              href="/experiences/cabs-buses"
            />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function BookingCard({ title, description, icon, href }: { title: string; description: string; icon: string; href: string }) {
  return (
    <a
      href={href}
      className="bg-[#4a1414] rounded-2xl p-6 pop-card hover:shadow-lg hover:shadow-amber-300/20 transition-all duration-300 flex flex-col group"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="text-xl font-cinzel-decorative text-amber-50 mb-3">
        {title}
      </h3>
      <p className="text-white/80 text-sm font-merriweather flex-grow">
        {description}
      </p>
      <button className="mt-4 w-full py-2 bg-gradient-to-r from-amber-400 to-amber-300 text-black rounded-lg font-cinzel-decorative font-semibold hover:from-amber-300 hover:to-amber-200 transition-all">
        Book Now
      </button>
    </a>
  );
}
