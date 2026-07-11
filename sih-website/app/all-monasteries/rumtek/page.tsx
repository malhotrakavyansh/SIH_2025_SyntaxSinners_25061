'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '@/components/Reveal';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type RumtekArchiveItem = {
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

export default function RumtekMonastery() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<RumtekArchiveItem | null>(null);

  // AUDIO PLAYER STATE (same pattern as Tashiding)
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
    { src: '/rumtek/rumtek 1.avif', alt: 'Rumtek 1' },
    { src: '/rumtek/rumtek 2.jpg', alt: 'Rumtek 2' },
    { src: '/rumtek/rumtek 3.jpg', alt: 'Rumtek 3' },
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

  const Icon = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <span className={className} aria-hidden>
      {children}
    </span>
  );
  const MapPin = (props: { className?: string }) => <Icon {...props}>📍</Icon>;
  const Calendar = (props: { className?: string }) => <Icon {...props}>📅</Icon>;
  const Eye = (props: { className?: string }) => <Icon {...props}>👁️</Icon>;
  const Download = (props: { className?: string }) => <Icon {...props}>⬇️</Icon>;

  const rumtekArchiveItems = [
    {
      id: 'r1',
      title: 'The Golden Stupa of the 16th Karmapa',
      monastery: 'Rumtek',
      type: 'thangka',
      year: '18th c.',
      img: '/rumtek/golden stupa.jpg',
      tags: ['Color-corrected', 'AI-enhanced'],
      ocrText: 'ཨོཾ་མ་ཎི་པདྨེ་ཧཱུྃ...',
      location: 'Gangtok',
      description:
        '13-foot golden reliquary stupa containing the remains and relics of the 16th Gyalwa Karmapa, Rangjung Rigpe Dorje.\n\nDecorated with jewels (turquoise, coral, etc.).\n\nSurrounded by statues of all sixteen Karmapas.',
    },
    {
      id: 'r2',
      title: 'Buddha Shakyamuni statue',
      monastery: 'Rumtek',
      type: 'mural',
      year: '17th c.',
      img: '/rumtek/buddha.jpg',
      tags: ['AI-OCR processed', 'High-res'],
      ocrText: '༄༅། །རྒྱལ་བའི་མཆོད་རྟེན་...',
      location: 'Gangtok',
      description: 'Large central Buddha Shakyamuni statue with flanking guardians/bodhisattvas.',
    },
    {
      id: 'r3',
      title: 'The Four Guardian Kings',
      monastery: 'Rumtek',
      type: 'thangka',
      year: '19th c.',
      img: '/rumtek/kings.jpg',
      tags: ['AI-enhanced', 'Metadata complete'],
      ocrText: 'ཀརྨ་པ་རིན་པོ་ཆེ་...',
      location: 'Gangtok',
      description:
        'Paintings of the Four Guardian Kings depict powerful deities protecting the cardinal directions in Buddhist and Bon traditions. These and other protective deities paintings are seen at the entrance.',
    },
    {
      id: 'r4',
      title: 'Prayer Wheel',
      monastery: 'Rumtek',
      type: 'mural',
      year: '17th c.',
      img: '/rumtek/wheel.jpg',
      tags: ['AI-OCR processed', 'Gigapixel'],
      ocrText: 'འཁོར་བའི་འཁོར་ལོ...',
      location: 'Gangtok',
      description:
        'Rows of large, colorful prayer wheels are installed around the perimeter of the monastery and are a central feature of the complex. Visitors and monks circumambulate the monastery, spinning the wheels in a clockwise direction, which in the Tibetan Buddhist tradition is believed to have the same meritorious effect as orally reciting the mantras contained within them.',
    },
  ];

  const ArchiveCard = ({ item, onOpen }: { item: RumtekArchiveItem; onOpen: (it: RumtekArchiveItem) => void }) => {
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
            <h3
              className="text-sm font-semibold text-amber-100 line-clamp-2"
              style={{ fontFamily: 'Cinzel' }}
            >
              {item.title}
            </h3>
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

  const ResearchRow = () => {
    return (
      <div className="w-full">
        <h2
          className="text-amber-100 text-xl font-bold mb-4 flex items-center gap-2 uppercase"
          style={{ fontFamily: 'Cinzel' }}
        >
          <span className="text-amber-400 text-2xl">⏱</span>
          Research &amp; Documentation
        </h2>

        <div className="flex flex-wrap gap-4 justify-between">
          <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
            <p className="text-sm font-semibold text-amber-100 leading-tight">Archaeological Survey Date</p>
            <p className="text-sm text-amber-50 mt-1 leading-snug">Unknown</p>
          </div>

          <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
            <p className="text-sm font-semibold text-amber-100 leading-tight">Archaeological Survey By</p>
            <p className="text-sm text-amber-50 mt-1 leading-snug">
              Archaeological Survey of India (ASI), Sikkim State Archaeology Department
            </p>
          </div>

          <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
            <p className="text-sm font-semibold text-amber-100 leading-tight">Preservation Status</p>
            <p className="text-sm text-amber-50 mt-1 leading-snug">
              Excellent, well-maintained with ongoing conservation efforts
            </p>
          </div>

          <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
            <p className="text-sm font-semibold text-amber-100 leading-tight">Heritage Status</p>
            <p className="text-sm text-amber-50 mt-1 leading-snug">National Heritage Site</p>
          </div>
        </div>
      </div>
    );
  };

  const rumtekTimeline = [
    {
      title: 'Original Construction',
      year: '1747 CE',
      description:
        'The original Rumtek / Ralang Monastery was built by the 9th Karmapa Wangchuk Dorje.',
    },
    {
      title: 'Relocation and Re-establishment',
      year: '1956 CE',
      description:
        'The 16th Karmapa, Rangjung Rigpe Dorje, fled Tibet and arrived in Sikkim, choosing Rumtek as his new seat.',
    },
    {
      title: 'Construction of New Monastery',
      year: '1962 CE',
      description:
        'A new monastery complex was constructed at Rumtek, closely mirroring Tsurphu Monastery in Tibet.',
    },
    {
      title: 'Consecration of Rumtek',
      year: '1966 CE',
      description:
        'The new Rumtek Monastery was consecrated and became the main seat of the 16th Karmapa.',
    },
    {
      title: 'Passing of the 16th Karmapa',
      year: '1981 CE',
      description:
        'Rangjung Rigpe Dorje passed away in exile, leading to future succession disputes around the Karmapa lineage.',
    },
    {
      title: 'Succession Controversy',
      year: '1990 CE',
      description:
        'Competing claims to the 17th Karmapa title created tensions over control and access to Rumtek.',
    },
    {
      title: 'Preservation Efforts Begin',
      year: 'c. 2000 CE',
      description:
        'Conservation programmes focused on murals, relics, and structural stability of the monastery complex.',
    },
    {
      title: "Ogyen Trinley Dorje's Visit",
      year: '2011 CE',
      description:
        'One claimant to the 17th Karmapa title, Ogyen Trinley Dorje, made a significant visit to Rumtek Monastery.',
    },
    {
      title: 'Active Monastery & Tourist Destination',
      year: '2024 CE',
      description:
        'Rumtek continues as an active monastic centre, pilgrimage site, and major tourist destination in Sikkim.',
    },
    {
      title: 'Inheritage Foundation Archival Capture',
      year: '2025 CE',
      description:
        'Rumtek’s chronology and visual heritage are documented by Inheritage Foundation for long-term digital stewardship.',
    },
  ];

  type TimelineEvent = (typeof rumtekTimeline)[number];

  const TimelineCard = ({ event }: { event: TimelineEvent }) => (
    <div className="rounded-3xl bg-[#4B130E] border border-amber-600/40 px-5 py-4 shadow">
      <h3
        className="text-sm md:text-base font-semibold text-amber-50 mb-2"
        style={{ fontFamily: 'Cinzel' }}
      >
        {event.title}
      </h3>
      <p className="text-xs md:text-sm text-amber-100/85 mb-3 leading-snug line-clamp-3">
        {event.description}
      </p>
      <div className="inline-flex items-center gap-2 text-[11px] md:text-xs font-semibold text-amber-950 bg-amber-400 px-3 py-1 rounded-full">
        <span>{event.year}</span>
      </div>
    </div>
  );

  const TimelineColumn = () => (
    <div className="w-full space-y-5 mt-6">
      <h2
        className="text-amber-100 text-xl font-bold mb-2 flex items-center gap-2 uppercase"
        style={{ fontFamily: 'Cinzel' }}
      >
        <span className="text-amber-400 text-2xl">📜</span>
        Chronology of Rumtek
      </h2>

      {rumtekTimeline.map((ev) => (
        <TimelineCard key={ev.title} event={ev} />
      ))}
    </div>
  );

  // AUDIO PLAYER HANDLERS (same as Tashiding)
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
                className={`${i === 1 ? 'w-[700px]' : 'w-96'} h-72 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer`}
                onClick={() => goToSlide(i)}
                style={{
                  opacity: activeIndex === i ? 1 : 0.6,
                  transform: activeIndex === i ? 'scale(1)' : 'scale(0.9)',
                }}
              >
                <img src={images[i].src} alt={images[i].alt} className="w-full h-full object-cover" />
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
                activeIndex === index ? 'bg-amber-100 w-6' : 'bg-amber-100/40 w-2'
              }`}
            />
          ))}
        </div>

        {/* Title + Info */}
        <div className="max-w-7xl mx-auto px-10 flex justify-between items-center">
          <Reveal delay={0.4}>
            <div className="flex-1">
              <h1
                className="text-6xl md:text-7xl font-bold text-amber-100 drop-shadow-lg leading-tight font-cinzel-decorative"
                style={{ fontWeight: '900', letterSpacing: '3px' }}
              >
                RUMTEK
              </h1>
              <h2
                className="text-5xl md:text-6xl font-bold text-amber-100 drop-shadow-lg font-cinzel-decorative"
                style={{ fontWeight: '900', letterSpacing: '3px' }}
              >
                MONASTERY
              </h2>
            </div>
          </Reveal>

          <Reveal delay={0.5}>
            <div className="flex-1 flex flex-col gap-6 text-amber-100 pl-12 mt-6">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>
                <div>
                  <div
                    className="text-xl font-bold tracking-wide uppercase"
                    style={{ fontFamily: 'Cormorant SC' }}
                  >
                    Rumtek, East Sikkim
                  </div>
                  <div className="text-lg uppercase" style={{ fontFamily: 'Cormorant SC' }}>
                    Gangtok (737135), India
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <div
                    className="text-xl font-bold tracking-wide uppercase"
                    style={{ fontFamily: 'Cormorant SC' }}
                  >
                    Built in
                  </div>
                  <div className="text-lg uppercase" style={{ fontFamily: 'Cormorant SC' }}>
                    1966 CE
                  </div>
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
      <section
        id="overview"
        className="relative w-full py-20"
        style={{ backgroundColor: '#410704' }}
      >
        <div className="w-full max-w-7xl xl:max-w-[95rem] mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)] gap-10 xl:gap-12 items-start">
            {/* LEFT: TEXT */}
            <div>
              <Reveal>
                <h2
                  className="text-4xl md:text-5xl font-bold text-amber-100 mb-10 leading-tight uppercase"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  Rumtek Monastery: Where the Himalayas Meet Living Tradition
                </h2>
              </Reveal>

              <div className="rounded-3xl p-8 md:p-10 backdrop-blur-sm bg-amber-100/5 border border-amber-200/20 shadow-2xl">
                {[
                  'Perched on a ridge overlooking Gangtok, Rumtek Monastery—also known as the Dharma Chakra Centre—feels alive with the spirit of the Himalayas. As the mountain wind whipped vibrant prayer flags into motion, the monastery revealed itself as a powerful symbol of Tibetan Buddhism and cultural resilience.',
                  "A replica of Tibet's original Tsurphu Monastery, Rumtek stands as a living link to the Karmapa lineage. Its vivid reds, golds, and blues contrast beautifully with the muted Himalayan landscape, while intricate murals of deities, mandalas, and mythic scenes breathe life into its walls. Inside, the golden stupa—adorned with precious stones and surrounded by relics of past Karmapas—radiates a profound sense of sacredness.",
                  'The rhythmic chanting of monks, the steady beat of drums, and the glow of butter lamps create an atmosphere that is both serene and powerful. Watching the monks at their rituals offers a glimpse into a world shaped by devotion, discipline, and centuries-old tradition.',
                  "Beyond the temple halls, Rumtek's tranquil gardens and sweeping views of Sikkim's rolling hills offer moments of peaceful reflection. Here, nature and spirituality blend seamlessly, making Rumtek not just a monastery but a sanctuary of heritage, faith, and quiet strength.",
                  'The monastery stands not just as a testament to Tibetan architecture and artistry, but as a living embodiment of faith, a beacon of hope amidst the towering peaks of the Himalayas.',
                ].map((text, i) => (
                  <Reveal delay={0.2 + i * 0.15} key={i}>
                    <p className="text-base text-amber-50 leading-relaxed mb-6">{text}</p>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* RIGHT: INFO BOXES */}
            <aside className="space-y-8">
              {/* Location card */}
              <div className="ml-auto w-[340px] max-w-full rounded-3xl bg-[#1a1209] border border-amber-500/40 p-5 shadow-xl">
                <h3
                  className="text-lg font-semibold text-amber-100 mb-2 flex items-center gap-2"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  {t('monasteryPage.common.locationMap')}
                </h3>

                <p className="text-xs text-amber-300 mb-3">27.288710, 88.561470</p>

                <div className="overflow-hidden rounded-2xl mb-4">
                  <iframe
                    title="Rumtek map"
                    src="https://www.google.com/maps?q=Rumtek+Dharma+Chakra+Centre&output=embed"
                    className="w-full h-56"
                  />
                </div>

                <div className="flex gap-2">
                  <a
                    href="https://www.google.com/maps/dir/?api=1&destination=Rumtek+Dharma+Chakra+Centre"
                    className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-amber-950 font-semibold flex items-center justify-center"
                  >
                    Get Directions
                  </a>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Rumtek+Dharma+Chakra+Centre"
                    className="flex-1 px-3 py-2 rounded-full border border-amber-500 text-amber-100 text-center font-semibold text-xs"
                  >
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Visit info card */}
              <div className="ml-auto w-[340px] max-w-full rounded-3xl bg-[#1a1209] border border-amber-500/40 p-5 shadow-xl">
                <h3
                  className="text-lg font-semibold text-amber-100 mb-3"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  Visit Information
                </h3>

                <div className="space-y-3 text-xs text-amber-50">
                  <div>
                    <p className="font-semibold text-amber-100">Visiting Hours</p>
                    <p>9:00 AM – 6:00 PM, daily.</p>
                  </div>

                  <div className="border-t border-amber-500/30 pt-2">
                    <p className="font-semibold text-amber-100">Entry Fee</p>
                    <p>Free for all visitors.</p>
                  </div>

                  <div className="border-t border-amber-500/30 pt-2">
                    <p className="font-semibold text-amber-100">Best Visit Times</p>
                    <p>
                      During major Buddhist festivals like Tse-Chu (late May/early June), Saga Dawa (May/June),
                      Losar (February/March), or Lhabab Duchen (October/November) for vibrant cultural and religious
                      experiences. Alternatively, March to May and September to November offer pleasant weather
                      (15-25°C) ideal for exploring. Early morning visits are recommended for a peaceful experience
                      and to witness morning prayers.
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
        {/* TOP BAR */}
        <div className="relative w-screen h-56 md:h-72 lg:h-80 overflow-hidden flex items-center">
          <video
            src="/archive.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.45) 35%, rgba(0,0,0,0.1) 100%)',
            }}
          />
          <div className="relative z-10 w-full flex items-center justify-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full border border-amber-100">
                <span className="text-amber-100 text-2xl">⏱</span>
              </div>

              <h3
                className="text-amber-100 text-3xl md:text-4xl font-semibold tracking-[0.25em] uppercase font-cinzel-decorative"
              >
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
              backgroundColor: '#87522d',
              opacity: 1,
            }}
          />

          {/* REAL CONTENT */}
          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT – Cards */}
            <div className="flex flex-col gap-6">
              {rumtekArchiveItems.map((it) => (
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

            {/* RIGHT – Research + Timeline */}
            <div className="flex flex-col items-stretch gap-8">
              <ResearchRow />
              <TimelineColumn />
            </div>
          </div>

          {/* MODAL */}
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
                  <div className="relative" style={{ background: '#2F3A3D' }}>
                    <img
                      src={activeItem.img}
                      alt={activeItem.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="p-6 md:p-8">
                    <h2
                      className="text-2xl font-semibold text-amber-100"
                      style={{ fontFamily: 'Cinzel' }}
                    >
                      {activeItem.title}
                    </h2>

                    <div className="mt-5">
                      <h3
                        className="font-medium mb-2 text-amber-100"
                        style={{ fontFamily: 'Cinzel' }}
                      >
                        OCR Snippet
                      </h3>
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

                    <button
                      onClick={() => setOpenDialog(false)}
                      className="mt-6 text-amber-200 hover:text-amber-100"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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

          {/* Gradient overlay */}
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
                className="text-amber-100 text-3xl md:text-4xl font-semibold tracking-[0.25em] uppercase font-cinzel-decorative"
              >
                CULTURAL CALENDAR
              </h3>
            </div>
          </div>
        </div>

        {/* ORIGINAL CONTENT BELOW VIDEO */}
        <div className="max-w-7xl mx-auto px-6 lg:px-14 py-20">
          {/* TIMELINE STRIP */}
          <div className="relative" style={{ paddingTop: '150px', paddingBottom: '0px' }}>
            <div
              className="absolute left-0 right-0 h-1 transform -translate-y-1/2"
              style={{
                top: 'calc(50% - 89px)',
                backgroundImage:
                  'repeating-linear-gradient(to right, #d97706 0px, #d97706 15px, transparent 15px, transparent 35px)',
                zIndex: 0,
              }}
            />

            <div
              className="grid grid-cols-4 gap-0 relative"
              style={{ minHeight: '360px' }}
            >
              {/* Rumtek Tse-Chu Cham Festival */}
              <div className="relative">
                <Reveal delay={0.1}>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-200 border-4 border-yellow-400 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 180px)', zIndex: 2 }}
                  >
                    <p className="text-xs font-semibold text-amber-900 mb-1">
                      June – July
                    </p>
                    <p className="text-xs text-amber-900 mb-2">
                      Early monsoon · Masked cham dances
                    </p>
                    <h3 className="text-lg font-bold text-amber-900">
                      Rumtek Tse-Chu Festival
                    </h3>
                  </div>

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      top: 'calc(50% - 64px)',
                      width: '4px',
                      height: '64px',
                      backgroundColor: '#fcd34d',
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{
                      top: '50%',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#fef08a',
                      border: '4px solid #f59e0b',
                      transformOrigin: 'center',
                      zIndex: -1,
                    }}
                  />
                </Reveal>
              </div>

              {/* Saga Dawa at Rumtek */}
              <div className="relative">
                <Reveal delay={0.2}>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{
                      top: '50%',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f59e0b',
                      border: '4px solid #b45309',
                      zIndex: -1,
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      top: '50%',
                      width: '4px',
                      height: '80px',
                      backgroundColor: '#eab308',
                      zIndex: -2,
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-400 border-4 border-yellow-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}
                  >
                    <p className="text-xs font-semibold text-white mb-1">
                      May – June
                    </p>
                    <p className="text-xs text-white mb-2">
                      4th Tibetan Month · Full-moon day
                    </p>
                    <h3 className="text-lg font-bold text-white">
                      Saga Dawa
                    </h3>
                  </div>
                </Reveal>
              </div>

              {/* Losoong / Sonam Losoong at Rumtek */}
              <div className="relative">
                <Reveal delay={0.3}>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 border-4 border-orange-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 190px)', zIndex: 2 }}
                  >
                    <p className="text-xs font-semibold text-white mb-1">
                      December
                    </p>
                    <p className="text-xs text-white mb-2">
                      11th Tibetan Month · Sikkimese New Year
                    </p>
                    <h3 className="text-lg font-bold text-white">
                      Losoong / Sonam Losoong
                    </h3>
                  </div>

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      top: 'calc(50% - 64px)',
                      width: '4px',
                      height: '64px',
                      backgroundColor: '#fb923c',
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{
                      top: '50%',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#fb923c',
                      border: '4px solid #ea580c',
                      zIndex: -1,
                    }}
                  />
                </Reveal>
              </div>

              {/* Losar – Tibetan New Year at Rumtek */}
              <div className="relative">
                <Reveal delay={0.4}>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{
                      top: '50%',
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#f59e0b',
                      border: '4px solid #b45309',
                      zIndex: -1,
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2"
                    style={{
                      top: '50%',
                      width: '4px',
                      height: '80px',
                      backgroundColor: '#eab308',
                      zIndex: -2,
                    }}
                  />

                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-500 border-4 border-yellow-700 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}
                  >
                    <p className="text-xs font-semibold text-white mb-1">
                      February (varies yearly)
                    </p>
                    <p className="text-xs text-white mb-2">
                      1st Tibetan Month · 1st–3rd day
                    </p>
                    <h3 className="text-lg font-bold text-white">
                      Losar (Tibetan New Year)
                    </h3>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          {/* FESTIVAL DESCRIPTIONS */}
          <Reveal delay={0.6}>
            <div className="mt-2 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rumtek Tse-Chu */}
                <Reveal delay={0.7}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-yellow-300 mb-3">
                      Rumtek Tse-Chu Cham Festival
                    </h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      At Rumtek, Tse-Chu is marked by powerful cham mask dances in the main courtyard. Monks
                      perform elaborate rituals dedicated to Guru Padmasambhava and protective deities, while
                      devotees watch from the galleries, receive blessings, and make offerings for protection,
                      healing, and harmony for the year ahead.
                    </p>
                  </div>
                </Reveal>

                {/* Saga Dawa */}
                <Reveal delay={0.75}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-yellow-300 mb-3">
                      Saga Dawa
                    </h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Saga Dawa commemorates the Buddha&apos;s birth, enlightenment, and parinirvana. At Rumtek,
                      monks hold extended pujas and recitations, light thousands of butter lamps, and lead
                      circumambulations of the monastery. Local devotees join in merit-making, charity, and
                      silent prayer, treating this &quot;triple blessed day&quot; as the most auspicious time in
                      the Buddhist year.
                    </p>
                  </div>
                </Reveal>

                {/* Losoong / Sonam Losoong */}
                <Reveal delay={0.8}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-500/20 p-6 hover:border-orange-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-orange-300 mb-3">
                      Losoong / Sonam Losoong
                    </h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Losoong is the Sikkimese New Year and harvest-thanksgiving festival. At Rumtek, the year
                      closes with joyous cham dances, ritual offerings, and gatherings of Bhutia and Lepcha
                      families. The monastery becomes a space of celebration and gratitude—marking the end of
                      the agricultural cycle and inviting good fortune for the coming year.
                    </p>
                  </div>
                </Reveal>

                {/* Losar */}
                <Reveal delay={0.85}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-600/20 p-6 hover:border-orange-500/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-orange-300 mb-3">
                      Losar (Tibetan New Year)
                    </h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Losar marks the start of the Tibetan New Year. In Rumtek, the festival begins with intensive
                      year-end purification rites and offerings, followed by New Year prayers, raising of fresh
                      prayer flags, and vibrant community celebrations. Families visit the monastery to make
                      offerings, seek blessings, and step into the new year with renewed intention.
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.95}>
                <div className="rounded-3xl bg-gradient-to-r from-orange-900/20 to-amber-900/20 backdrop-blur-md border border-amber-500/20 p-8">
                  <p className="text-base text-amber-50 leading-relaxed font-light">
                    Together, these festivals trace the spiritual heartbeat of Rumtek. They turn the monastery&apos;s
                    courtyards into living stages of dance, ritual, and prayer; binding monks, pilgrims, and local
                    communities into a shared rhythm of remembrance, renewal, and devotion across the Himalayan year.
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
                Experience Rumtek through an immersive audio-guided journey—its golden stupa, chanting halls,
                and sacred courtyards brought to life through sound.
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
                src="/rumtek audio.mp4"
                preload="metadata"
                onTimeUpdate={(e) => {
                  const time = (e.target as HTMLAudioElement).currentTime;
                  setCurrentTime(time);
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
                    src="/rumtek/aud.png"
                    alt="Rumtek Monastery"
                    className="w-full h-full object-cover rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
                  />
                </div>

                {/* Audio Content */}
                <div className="flex flex-col gap-6">
                  <p className="text-amber-50 text-lg italic leading-relaxed">
                    Walk through the courtyards of Rumtek as this guided audio takes you past the golden stupa,
                    mural-lined corridors, and chanting halls, revealing stories of the Karmapa lineage and the
                    monastery&apos;s rebirth in exile.
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
                Step into Rumtek Monastery digitally—explore its courtyards, prayer halls, and surrounding
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
                    R
                  </div>
                  <div className="flex-1">
                    <h3
                      className="text-2xl font-semibold text-amber-50 mb-2 uppercase"
                      style={{ fontFamily: 'Cinzel' }}
                    >
                      Rumtek Monastery
                    </h3>
                    <div className="flex items-center gap-4 text-amber-200 text-sm mb-3">
                      <span className="flex items-center gap-1">📍 East Sikkim</span>
                      <span className="flex items-center gap-1">📅 Est 1966</span>
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
                        Explore Rumtek from any device, anywhere.
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
              <div className="rounded-3xl p-6" style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', border: '2px solid rgba(217, 119, 6, 0.4)', backdropFilter: 'blur(10px)' }}>
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
                    <h3 className="text-xl font-semibold text-amber-50 mb-2 leading-tight" style={{ fontFamily: 'Chivo' }}>
                      Explore Through Their Eyes: Virtual Tour Based on Vlogger Journeys
                    </h3>
                    <p className="text-base text-amber-200 leading-relaxed mb-4" style={{ fontFamily: 'Chivo' }}>
                      Experience the monastery through authentic perspectives captured by travel vloggers. Navigate their documented paths and discover hidden details they&apos;ve shared.
                    </p>
                    
                    {/* Video Links */}
                    <div className="space-y-2">
                      <a 
                        href="https://youtu.be/6h69QMv8msg?si=I5JPc1ngItffHx8V" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://youtu.be/6h69QMv8msg?si=I5JPc1ngItffHx8V</span>
                      </a>
                      <a 
                        href="https://www.youtube.com/watch?v=yWDTVaocpNg" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=yWDTVaocpNg</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Tour Preview */}
            <div className="space-y-6">
              {/* View Mode Toggle */}
              <div className="rounded-full p-1.5" style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)', border: '2px solid rgba(217, 119, 6, 0.3)' }}>
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
              <button className="w-full py-6 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 group" style={{ fontFamily: 'Cinzel' }}>
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
                <div className="h-[28rem] relative overflow-hidden">
                  {viewMode === '3d' ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    >
                      <source src="/rumtek/WhatsApp Video 2025-12-08 at 7.14.23 AM.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900 to-orange-900 flex items-center justify-center">
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

      {/* Booking Section */}
      <section className="py-16 px-6 bg-gradient-to-b from-[#3b1212] to-[#2b0d0d] border-t border-amber-300/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-cinzel-decorative text-amber-100 mb-12 text-center">
            Experience Rumtek
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
