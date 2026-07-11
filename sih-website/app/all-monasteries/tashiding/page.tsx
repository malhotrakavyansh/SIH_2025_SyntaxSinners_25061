'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Reveal from '@/components/Reveal';
// Removed MonasterySlideshow and ExploreCarouselMount per page requirements
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

type TashidingArchiveItem = {
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

const styles = `
  /* Hide Google Maps labels and overlays */
  iframe[src*="maps.embed"] {
    -webkit-filter: brightness(1.1) contrast(1.05);
    filter: brightness(1.1) contrast(1.05);
  }
  
  /* Attempt to hide text overlays using opacity and shadow tricks */
  iframe[src*="maps.embed"]::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.01);
    pointer-events: none;
  }
  
  /* Hide any text elements that might appear near the iframe */
  .maps-label {
    display: none !important;
  }
`;

export default function TashidingMonastery() {
  const [activeIndex, setActiveIndex] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [activeSidebarItem, setActiveSidebarItem] = useState('overview');
  const [openDialog, setOpenDialog] = useState(false);
  const [activeItem, setActiveItem] = useState<TashidingArchiveItem | null>(null);
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

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime += 10;
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime -= 10;
    }
  };

  const fastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 30, duration);
    }
  };

  const fastRewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 30, 0);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const progressBar = e.currentTarget;
      const clickX = e.clientX - progressBar.getBoundingClientRect().left;
      const width = progressBar.offsetWidth;
      const clickedTime = (clickX / width) * duration;
      audioRef.current.currentTime = clickedTime;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const sidebarItems = [
    { id: 'overview', labelKey: 'overview' },
    { id: 'digital-archive', labelKey: 'digitalArchive' },
    { id: 'cultural-calendar', labelKey: 'culturalCalendar' },
    { id: 'audio-tour', labelKey: 'audioTour' },
    { id: 'virtual-tour', labelKey: 'virtualTour' },
  ];

  const tashidingArchiveItems = [
    {
      id: 't1',
      title: 'The Sacred Thong-Wa-Rang-Dol Chorten',
      monastery: 'Tashiding',
      type: 'chorten',
      year: '17th c.',
      img: '/tashiding/sacred thong.jpg',
      tags: ['Color-corrected', 'AI-enhanced'],
      ocrText: 'ཡི་དམ་གཙོ་བོ་...',
      location: 'Tashiding',
      description:
        'The revered Thong-Wa-Rang-Dol chorten stands as the spiritual heart of Tashiding Monastery, believed to cleanse all sins with a single glance. Its architectural design reflects the perfect integration of Buddhist symbolism and Himalayan craftsmanship.',
    },
    {
      id: 't2',
      title: 'Intricate Murals of Deities',
      monastery: 'Tashiding',
      type: 'mural',
      year: '17th c.',
      img: '/tashiding/intricate murals of dieties  takshiding monastery generate image of this.jpg',
      tags: ['AI-OCR processed', 'High-res'],
      ocrText: '༄༅། །དེ་བཞིན་གཤེགས་པ་...',
      location: 'Tashiding',
      description: 'Delicate murals depicting various deities, mandalas, and mythic scenes that preserve the lineage of early Sikkimese Buddhism.',
    },
    {
      id: 't3',
      title: 'Prayer Flags and Mountain Views',
      monastery: 'Tashiding',
      type: 'photograph',
      year: '2024 CE',
      img: '/tashiding/prayer flags and mountain views of tashiding monastery.jpg',
      tags: ['Contemporary', 'Landscape'],
      ocrText: 'མ་ཎི་པདྨེ་ཧཱུྃ...',
      location: 'Tashiding',
      description:
        'Colorful prayer flags swaying along the sacred trails leading to Tashiding, with sweeping views of Sikkim\'s rolling hills and the confluence of rivers.',
    },
    {
      id: 't4',
      title: 'Sacred Texts and Reliquaries',
      monastery: 'Tashiding',
      type: 'artifact',
      year: '17th-19th c.',
      img: '/tashiding/sacred text and reliquaries tashiding monastery.jpg',
      tags: ['AI-enhanced', 'Digitized'],
      ocrText: 'གཙོ་བོའི་སྙིགས་མ་...',
      location: 'Tashiding',
      description:
        'Ancient Buddhist texts, sacred manuscripts, and reliquaries that contain precious relics of enlightened masters, representing centuries of spiritual heritage.',
    },
  ];

  const tashidingTimeline = [
    {
      title: 'Founding of Tashiding',
      year: '1717 CE',
      description:
        'Tashiding Monastery was established by Ngadak Sempa Chempo, a devoted follower of Guru Padmasambhava, on a sacred ridge overlooking the confluence of rivers in West Sikkim.',
    },
    {
      title: 'Construction of the Thong-Wa-Rang-Dol Chorten',
      year: '18th c.',
      description:
        'The iconic Thong-Wa-Rang-Dol chorten was constructed, becoming the spiritual heart of Tashiding and a symbol of Buddhist faith believed to cleanse all sins with a single glance.',
    },
    {
      title: 'Artistic Development',
      year: '18th-19th c.',
      description:
        'The monastery\'s interior walls were adorned with intricate murals depicting deities, mandalas, and mythic scenes, reflecting the flourishing of Sikkimese Buddhist art.',
    },
    {
      title: 'Sacred Pilgrimage Site',
      year: '19th-20th c.',
      description:
        'Tashiding became one of Sikkim\'s most revered pilgrimage destinations, attracting devotees from across the Himalayan region for spiritual retreat and celebration of Buddhist festivals.',
    },
    {
      title: 'Preservation Initiatives',
      year: 'c. 2000 CE',
      description:
        'Conservation programmes began focusing on the preservation of murals, architectural elements, and sacred relics to maintain Tashiding\'s spiritual and cultural integrity.',
    },
    {
      title: 'Recognition as Heritage Site',
      year: '2010-2024 CE',
      description:
        'Tashiding gained formal recognition as a sacred Sikkimese Buddhist heritage site, with documentation and digital archival projects beginning.',
    },
    {
      title: 'Digital Archival Capture',
      year: '2024 CE',
      description:
        'Tashiding Monastery\'s history, architecture, and visual heritage are documented by Inheritage Foundation for long-term digital preservation and global accessibility.',
    },
  ];

  const images = [
    { src: '/tashiding/tash-3.png', alt: 'Tashiding 1' },
    { src: '/tashiding/tash-8.png', alt: 'Tashiding 2' },
    { src: '/tashiding/tash-6.png', alt: 'Tashiding 3' },
  ];

    const panoramicShots = [
  {
    id: 'p0',
    title: 'Tashiding Monastery',
    note: 'Main panoramic view',
    url: 'https://www.google.com/maps/place/Tashiding+Monastery/@27.3117664,88.2976364,3a,75y,200h,90t/data=!3m8!1e1!3m6!1sCIHM0ogKEICAgICEzv29aA!2e10!3e11!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAG0ilSwSpbbNfjj0AsNJkAbZASV8BqTvqJdrq7zOAOLfxF16sJgWW1qPc6kWfw5yhihHZqo_kuz9llju-kw-lyQoWySftgjsjtD1Lwr1MwABvTajubhcFZbMWcY4EH8ZMIX9QoZqjBI%3Dw900-h600-k-no-pi0-ya89-ro0-fo100!7i8704!8i4352!4m9!3m8!1s0x39e685fca06dc171:0x92150f5f129db887!8m2!3d27.3089308!4d88.2978746!10e5!14m1!1BCgIgARICCAI!16s%2Fm%2F09glmyd',
    embedUrl: 'https://www.google.com/maps/embed?pb=!4v1765166574121!6m8!1m7!1sCIHM0ogKEICAgICEzv29aA!2m2!1d27.3117664!2d88.2976364!3f200!4f75!5f0.7820865974627469',
    earthUrl: 'https://earth.google.com/earth/rpc/cc/map?pb=!1m2!1sCIHM0ogKEICAgICEzv29aA!2m2!1d27.3117664!2d88.2976364',
  },
  {
    id: 'p1',
    title: 'Approach to Tashiding Monastery',
    note: 'Monastery in the landscape',
    url: 'https://maps.app.goo.gl/GVnM9bfDhz2ckP4m9',
    embedUrl: 'https://www.google.com/maps/embed?pb=!4v1765166574121!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004!3f260!4f10!5f0.7820865974627469',
    earthUrl: 'https://earth.google.com/earth/rpc/cc/map?pb=!1m2!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004',
  },
  {
    id: 'p2',
    title: 'Monastery Courtyard View',
    note: 'Prayer flags and chortens',
    url: 'https://maps.app.goo.gl/4uMyY25gvWW7NJFt5',
    embedUrl: 'https://www.google.com/maps/embed?pb=!4v1765166574121!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004!3f180!4f0!5f0.7820865974627469',
    earthUrl: 'https://earth.google.com/earth/rpc/cc/map?pb=!1m2!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004',
  },
  {
    id: 'p3',
    title: 'Main Shrine Surroundings',
    note: '360° around the central complex',
    url: 'https://maps.app.goo.gl/7VS6TvYXtVm53LQPA',
    embedUrl: 'https://www.google.com/maps/embed?pb=!4v1765166574121!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004!3f90!4f0!5f0.7820865974627469',
    earthUrl: 'https://earth.google.com/earth/rpc/cc/map?pb=!1m2!1sCAoSFkNJSE0wb2dLRUlDQWdJQ0V6b09UVnc.!2m2!1d27.3080960299431!2d88.29783391014004',
  },
];


  const [activePanorama, setActivePanorama] = useState(panoramicShots[0]);



  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // ArchiveCard component – transparent glass box with smooth hover
  const ArchiveCard = ({ item, onOpen }: { item: TashidingArchiveItem; onOpen: (it: TashidingArchiveItem) => void }) => {
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
            <h3 className="text-sm font-semibold text-amber-100 line-clamp-2 uppercase" style={{ fontFamily: 'Cinzel' }}>{item.title}</h3>
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

  type TimelineEvent = (typeof tashidingTimeline)[number];

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
      <style>{styles}</style>
      <Nav />
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden pt-8 pb-4" style={{ backgroundImage: 'url(/bg1.png)', backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundClip: 'border-box', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Decorative black MT icons behind the hero title (top-left & bottom-right) */}
        <div className="pointer-events-none absolute top-6 left-6 z-0 opacity-20 sm:opacity-25 md:opacity-30">
          <img src="/Icons/ICONS/black mt.png" alt="mt" className="w-36 sm:w-44 md:w-56 object-contain" />
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-0 opacity-20 sm:opacity-25 md:opacity-30">
          <img src="/Icons/ICONS/black mt.png" alt="mt" className="w-36 sm:w-44 md:w-56 object-contain rotate-180" />
        </div>
        {/* Top Carousel - Three Images */}
        <div className="flex justify-center gap-4 mt-6 mb-4 px-4 relative">
          <Reveal delay={0.1}>
            <div className="w-96 h-72 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out cursor-pointer" onClick={() => goToSlide(0)} style={{ opacity: activeIndex === 0 ? 1 : 0.6, transform: activeIndex === 0 ? 'scale(1)' : 'scale(0.9)' }}>
              <img src={images[0].src} alt={images[0].alt} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="w-[700px] h-72 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out cursor-pointer" onClick={() => goToSlide(1)} style={{ opacity: activeIndex === 1 ? 1 : 0.6, transform: activeIndex === 1 ? 'scale(1)' : 'scale(0.9)' }}>
              <img src={images[1].src} alt={images[1].alt} className="w-full h-full object-cover" />
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <div className="w-96 h-72 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 ease-in-out cursor-pointer" onClick={() => goToSlide(2)} style={{ opacity: activeIndex === 2 ? 1 : 0.6, transform: activeIndex === 2 ? 'scale(1)' : 'scale(0.9)' }}>
              <img src={images[2].src} alt={images[2].alt} className="w-full h-full object-cover" />
            </div>
          </Reveal>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mb-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${activeIndex === index ? 'bg-amber-100 w-6' : 'bg-amber-100/40 w-2'}`}
            />
          ))}
        </div>

        {/* Main Content - Left Title, Right Info */}
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center relative z-20">
          {/* Left - Monastery Name */}
          <Reveal delay={0.4}>
            <div className="flex-1">
              <h1 className="text-6xl md:text-7xl font-bold text-amber-100 drop-shadow-lg leading-tight font-cinzel-decorative" style={{ fontWeight: '900', letterSpacing: '3px' }}>
                TASHIDING
              </h1>
              <h2 className="text-5xl md:text-6xl font-bold text-amber-100 drop-shadow-lg font-cinzel-decorative" style={{ fontWeight: '900', letterSpacing: '3px' }}>
                MONASTERY
              </h2>
            </div>
          </Reveal>

          {/* Right - Info */}
          <Reveal delay={0.5}>
            <div className="flex-1 flex flex-col gap-6 text-amber-100 pl-10 mt-6">
              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <div>
                  <div className="text-xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Cormorant SC' }}>Tashiding, West Sikkim</div>
                  <div className="text-lg uppercase" style={{ fontFamily: 'Cormorant SC' }}>Geyzing (737112), Sikkim, India</div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <svg className="w-8 h-8 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <div className="text-xl font-bold tracking-wide uppercase" style={{ fontFamily: 'Cormorant SC' }}>Built in</div>
                  <div className="text-lg uppercase" style={{ fontFamily: 'Cormorant SC' }}>1717 CE</div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Buttons at Bottom */}
        <div className="flex justify-center gap-4 mt-10 z-20 flex-wrap px-8">
          {[
            { label: 'Overview', target: 'overview' },
            { label: 'Digital Archive', target: 'digital-archive' },
            { label: 'Cultural Calendar', target: 'cultural-calendar' },
            { label: 'Audio Tour', target: 'audio-tour' },
            { label: 'Virtual Tour', target: 'virtual-tour' },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={() => scrollToSection(btn.target)}
              className="px-8 py-3 bg-amber-200 text-amber-900 rounded-full font-bold uppercase hover:bg-amber-100 transition"
              style={{ fontFamily: 'Cinzel' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* Overview Section */}
      <section id="overview" className="relative w-full py-20" style={{ backgroundColor: '#410704' }}>
        <div className="w-full max-w-7xl xl:max-w-[95rem] mx-auto px-6 lg:px-14">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,0.9fr)] gap-10 xl:gap-12 items-start">
              {/* LEFT: TEXT */}
              <div>
                <Reveal>
                  <h2 className="text-4xl md:text-5xl font-bold text-amber-100 mb-10 leading-tight uppercase" style={{ fontFamily: 'Cinzel' }}>
                    Tashiding Monastery: Where the Himalayas Embrace Pure Devotion
                  </h2>
                </Reveal>

                {/* Transparent Aesthetic Box */}
                <div className="rounded-3xl p-8 md:p-10 backdrop-blur-sm bg-amber-100/5 border border-amber-200/20 shadow-2xl">
                  {[
                    'Perched on a serene ridge overlooking the confluence of the Rathong and Rangeet rivers, Tashiding Monastery is one of the most sacred and spiritually revered sites in Sikkim. Established in the 17th century by Ngadak Sempa Chempo, a follower of Guru Padmasambhava, it stands as a beacon of divine blessing in the Himalayan landscape. As morning light touches the distant snow peaks, the monastery reveals its peaceful radiance, carrying a sense of purity cherished for centuries.',
                    'Its architecture is simple but deeply symbolic. The whitewashed structures, tapering chortens, and traditional Tibetan motifs speak of ancient craftsmanship. The famed Thong-Wa-Rang-Dol chorten, believed to cleanse all sins with a single glance, embodies the spiritual heart of Tashiding. Inside the monastery, sacred texts, delicate murals, and statues of revered deities preserve the lineage of early Sikkimese Buddhism.',
                    'The environment surrounding Tashiding elevates its sanctity. Wrapped in silence and framed by dense forest, the monastery feels like a living sanctuary of peace. Instead of the rhythm of ritual instruments, it is the gentle sound of mountain breeze, rustling leaves, and distant river flow that shapes the atmosphere. This natural quietness invites deep reflection and a sense of inner stillness.',
                    'The path leading up to Tashiding enhances its sacred charm. Colorful prayer flags sway along the trail, and the fragrance of pine drifts through the cool air. As the ascent unfolds, each step feels like a journey toward spiritual clarity. By the time the monastery appears, visitors are already immersed in a profound calmness.',
                    'Tashiding Monastery stands not only as a historic seat of faith but also as a timeless symbol of purity, devotion, and spiritual renewal. Blending natural beauty with deep religious significance, it continues to inspire all who seek peace and connection amid the Himalayan heights.',
                  ].map((text, i) => (
                    <Reveal key={i} delay={0.2 * (i + 1)}>
                      <p className="text-base text-amber-50 leading-relaxed mb-6">
                        {text}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* RIGHT: INFO BOXES */}
              <aside className="space-y-8">
                {/* Location card */}
                <div className="ml-auto w-[340px] max-w-full rounded-3xl bg-[#1a1209] border border-amber-500/40 p-5 shadow-xl">
                  <h3 className="text-lg font-semibold text-amber-100 mb-2 flex items-center gap-2">
                    
                    Location Map
                  </h3>

                  <p className="text-xs text-amber-300 mb-3">27.535069, 88.212178</p>

                  <div className="overflow-hidden rounded-2xl mb-4">
                    <iframe
                      title="Tashiding map"
                      src="https://www.google.com/maps?q=Tashiding+Monastery&output=embed"
                      className="w-full h-56"
                    />
                  </div>

                  <div className="flex gap-2">
                    <a
                      href="https://www.google.com/maps/dir/?api=1&destination=Tashiding+Monastery"
                      className="flex-1 px-4 py-2 rounded-full bg-amber-400 text-amber-950 font-semibold flex items-center justify-center"

                    >
                      Get Directions
                    </a>
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Tashiding+Monastery"
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
                      <p>9:00 AM – 6:00 PM, daily.</p>
                    </div>

                    <div className="border-t border-amber-500/30 pt-2">
                      <p className="font-semibold text-amber-100">Entry Fee</p>
                      <p>Free for all visitors.</p>
                    </div>

                    <div className="border-t border-amber-500/30 pt-2">
                      <p className="font-semibold text-amber-100">Best Visit Times</p>
                      <p>
                        During major Buddhist festivals like Losar (February/March) and Saga Dawa (May/June) for vibrant cultural experiences. March to May and September to November offer pleasant weather (15-25°C) ideal for exploring. Early morning visits are recommended for a peaceful experience and to witness monks&apos; rituals.
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

        {/* FULL WIDTH CONTENT AREA */}
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
              backgroundColor: "#87522d",
              opacity: 1,
            }}
          />

          {/* REAL CONTENT (ABOVE THE WATERMARK) */}
          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* LEFT SIDE — Archive Cards */}
            <div className="flex flex-col gap-6">
              {tashidingArchiveItems.map((it) => (
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
                  RESEARCH &amp; DOCUMENTATION
                </h2>

                <div className="flex flex-wrap gap-4 justify-between">
                  {/* 1 */}
                  <div className="flex-1 min-w-[220px] max-w-[260px] rounded-3xl bg-[#7b4a26] border border-amber-600/30 px-5 py-4">
                    <p className="text-sm font-semibold text-amber-100 leading-tight">
                      Archaeological Survey Date
                    </p>
                    <p className="text-sm text-amber-50 mt-1 leading-snug">17th century establishment</p>
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
                      Sacred Sikkimese Buddhist Heritage Site
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full space-y-5 mt-6">
                <h2 className="text-amber-100 text-xl font-bold uppercase mb-2 flex items-center gap-2" style={{ fontFamily: 'Cinzel' }}>
                  <span className="text-amber-400 text-2xl">📜</span>
                  CHRONOLOGY OF TASHIDING
                </h2>

                {tashidingTimeline.map((ev) => (
                  <TimelineCard key={ev.title} event={ev} />
                ))}
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

      {/* CULTURAL CALENDAR SECTION */}
      <section id="cultural-calendar" className="relative w-full" style={{ backgroundColor: '#410704' }}>
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
          <div className="relative" style={{ paddingTop: '150px', paddingBottom: '0px' }}>
            <div className="absolute left-0 right-0 h-1 transform -translate-y-1/2"
              style={{
                top: 'calc(50% - 89px)',
                backgroundImage: 'repeating-linear-gradient(to right, #d97706 0px, #d97706 15px, transparent 15px, transparent 35px)',
                zIndex: 0,
              }}
            />

            <div className="grid grid-cols-4 gap-0 relative" style={{ minHeight: '360px' }}>
              <div className="relative">
                <Reveal delay={0.1}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-200 border-4 border-yellow-400 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 180px)', zIndex:2 }}>
                    <p className="text-xs font-semibold text-amber-900 mb-1">February – March</p>
                    <p className="text-xs text-amber-900 mb-2">1st Tibetan Month — 14th–15th day</p>
                    <h3 className="text-lg font-bold text-amber-900 uppercase" style={{ fontFamily: 'Cinzel' }}>Bhumchu Festival</h3>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: 'calc(50% - 64px)', width: '4px', height: '64px', backgroundColor: '#fcd34d' }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#fef08a', border: '4px solid #f59e0b', transformOrigin: 'center', zIndex: -1 }} />
                </Reveal>
              </div>

              <div className="relative">
                <Reveal delay={0.2}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#f59e0b', border: '4px solid #b45309', zIndex: -1 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: '50%', width: '4px', height: '80px', backgroundColor: '#eab308', zIndex:-2 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-400 border-4 border-yellow-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}>
                    <p className="text-xs font-semibold text-white mb-1">May – June</p>
                    <p className="text-xs text-white mb-2">4th Tibetan Month — Full-moon day</p>
                    <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Cinzel' }}>Saga Dawa</h3>
                  </div>
                </Reveal>
              </div>

              <div className="relative">
                <Reveal delay={0.3}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 border-4 border-orange-600 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% - 190px)', zIndex:2 }}>
                    <p className="text-xs font-semibold text-white mb-1">October – November</p>
                    <p className="text-xs text-white mb-2">9th Tibetan Month — 22nd day</p>
                    <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Cinzel' }}>Lhabab Düchen</h3>
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: 'calc(50% - 64px)', width: '4px', height: '64px', backgroundColor: '#fb923c' }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#fb923c', border: '4px solid #ea580c', zIndex: -1 }} />
                </Reveal>
              </div>

              <div className="relative">
                <Reveal delay={0.4}>
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-full shadow-md"
                    style={{ top: '50%', width: '32px', height: '32px', backgroundColor: '#f59e0b', border: '4px solid #b45309', zIndex: -1 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2"
                    style={{ top: '50%', width: '4px', height: '80px', backgroundColor: '#eab308', zIndex:-2 }} />
                  <div className="absolute left-1/2 transform -translate-x-1/2 rounded-2xl bg-gradient-to-br from-yellow-600 to-yellow-500 border-4 border-yellow-700 p-4 w-44 shadow-lg"
                    style={{ top: 'calc(50% + 72px)' }}>
                    <p className="text-xs font-semibold text-white mb-1">February (varies yearly)</p>
                    <p className="text-xs text-white mb-2">1st Tibetan Month — 1st–3rd day</p>
                    <h3 className="text-lg font-bold text-white uppercase" style={{ fontFamily: 'Cinzel' }}>Losar (Tibetan New Year)</h3>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>

          <Reveal delay={0.6}>
            <div className="mt-12 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Reveal delay={0.7}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-yellow-300 mb-3">Bhumchu Festival</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Most important Tashiding festival. The sacred vase containing holy water is opened; monks check the water level to forecast prosperity; pilgrims receive blessed water; major gathering in Sikkim.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.75}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-yellow-500/20 p-6 hover:border-yellow-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-yellow-300 mb-3">Saga Dawa</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Celebrates Buddha&apos;s birth, enlightenment, and parinirvana. Monks perform prayers, devotees light butter lamps, circumambulate, meditate, and engage in charity. Considered one of the holiest days.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.8}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-500/20 p-6 hover:border-orange-400/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-orange-300 mb-3">Lhabab Düchen</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Marks Buddha&apos;s descent from the heavenly realm back to earth. Monasteries perform special pujas; day of immense spiritual merit.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={0.85}>
                  <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-orange-600/20 p-6 hover:border-orange-500/40 transition-colors">
                    <h3 className="font-cinzel uppercase text-xl font-bold text-orange-300 mb-3">Losar (Tibetan New Year)</h3>
                    <p className="text-sm text-amber-50 leading-relaxed">
                      Tibetan New Year celebrations. Prayers, offerings, purification rituals, and community gatherings. Symbolizes new beginnings and spiritual renewal.
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal delay={0.95}>
                <div className="rounded-3xl bg-gradient-to-r from-orange-900/20 to-amber-900/20 backdrop-blur-md border border-amber-500/20 p-8">
                  <p className="text-base text-amber-50 leading-relaxed font-light">
                    Through these festivals, Tashiding defines the cultural and spiritual calendar of Sikkim. Each celebration is not just an event but a communal experience that reinforces identity, continuity, and the living heritage of the region.
                  </p>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* AUDIO TOUR SECTION */}
      <section id="audio-tour" className="relative w-full py-0" style={{ backgroundColor: '#410704' }}>
        {/* Heading with video background */}
        <div className="relative w-full overflow-hidden" style={{ paddingTop: '5rem', paddingBottom: '5rem' }}>
          {/* Background video */}
          <video
            src="/audio tour vid.mp4"
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
              background: 'linear-gradient(180deg, rgba(107, 74, 58, 0.8) 0%, rgba(65, 7, 4, 0.8) 100%)',
            }}
          />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-14 text-center">
            <h2 className="text-amber-100 text-6xl md:text-7xl font-bold mb-2 flex items-center justify-center gap-4" style={{ fontFamily: 'Cinzel Decorative', fontWeight: 'bold' }}>
              <img src="/Icons/ICONS/HEADPHONE.png" alt="Headphone" className="w-16 h-16" style={{ filter: 'brightness(0) saturate(100%) invert(80%) sepia(60%) hue-rotate(30deg) saturate(120%)' }} />
              AUDIO TOUR
            </h2>
          </div>
        </div>

        {/* Content section */}
        <div className="w-full py-10" style={{ backgroundColor: '#410704' }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-14">
            <div className="text-center mb-10">
              <p className="text-amber-50 text-lg italic max-w-2xl mx-auto uppercase">
                Experience immersive audio guided tour covering architecture, history, and spiritual significance. Available in multiple languages with offline mode for remote monastery visits.
              </p>
            </div>

            {/* Search Bar */}
            <div className="mb-12 max-w-2xl mx-auto">
              <div className="relative">
                <svg className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
                <input
                  type="text"
                  placeholder="Search audio guides"
                  className="w-full pl-16 pr-6 py-4 rounded-full text-amber-100 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-300"
                  style={{ backgroundColor: 'rgba(217, 119, 6, 0.2)', border: '2px solid rgba(217, 119, 6, 0.3)', backdropFilter: 'blur(10px)' }}
                />
              </div>
            </div>

            {/* Audio Tour Card */}
            <div className="max-w-4xl mx-auto rounded-3xl p-8" style={{ backgroundColor: 'rgba(217, 119, 6, 0.15)', border: '2px solid rgba(217, 119, 6, 0.3)', backdropFilter: 'blur(10px)' }}>
            <audio 
              ref={audioRef} 
              src="/tashiding audio.mp4"
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
                  src="/tashiding/prayer flags and mountain views of tashiding monastery.jpg"
                  alt="Tashiding Monastery"
                  className="w-full h-full object-cover rounded-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:brightness-110"
                />
              </div>

              {/* Audio Content */}
              <div className="flex flex-col gap-6">
                <p className="text-amber-50 text-lg italic leading-relaxed">
                  Visit this sacred monastery perched on a hilltop, famous for its annual Bhumchu festival and ancient Buddhist scriptures dating back centuries.
                </p>

                {/* Player Controls */}
                <div className="flex items-center justify-between gap-4">
                  <button className="text-amber-100 hover:text-white transition">☰</button>
                  <button 
                    onClick={toggleLike}
                    className={`transition ${isLiked ? 'text-red-500' : 'text-amber-100 hover:text-white'}`}
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
      <section id="virtual-tour" className="relative w-full py-20" style={{ backgroundColor: '#410704' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          {/* Header */}
          <div className="relative text-center mb-16 overflow-hidden rounded-3xl py-20" style={{ marginLeft: 'calc(-100vw / 2 + 100% / 2)', marginRight: 'calc(-100vw / 2 + 100% / 2)' }}>
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
                <h2 className="text-5xl font-bold text-amber-50 uppercase" style={{ fontFamily: 'Cinzel Decorative' }}>
                  Virtual Tour
                </h2>
              </div>
              <p className="text-amber-50 text-lg italic max-w-3xl mx-auto">
                Immerse yourself in 360° experiences of Sikkim&apos;s most sacred monasteries. Explore ancient halls, prayer rooms, and witness centuries of spiritual heritage.
              </p>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Side - Tour Features */}
            <div className="space-y-6">
              {/* Monastery Card */}
              <div className="rounded-3xl p-6" style={{ backgroundColor: 'rgba(120, 53, 15, 0.6)', border: '2px solid rgba(217, 119, 6, 0.3)', backdropFilter: 'blur(10px)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-2xl font-extrabold text-amber-900" style={{ fontFamily: 'Cinzel Decorative' }}>
                    T
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold text-amber-50 mb-2 uppercase" style={{ fontFamily: 'Cinzel' }}>Tashiding Monastery</h3>
                    <div className="flex items-center gap-4 text-amber-200 text-sm mb-3">
                      <span className="flex items-center gap-1">
                        📍 West Sikkim
                      </span>
                      <span className="flex items-center gap-1">
                        📅 Est 1641
                      </span>
                    </div>
                    <span className="inline-block px-4 py-1 rounded-full text-sm font-medium text-amber-900 bg-amber-100">
                      360° Tour Available
                    </span>
                  </div>
                </div>
              </div>

              {/* Tour Features Box */}
              <div className="rounded-3xl p-6 h-96 flex flex-col overflow-hidden" style={{ backgroundColor: 'rgba(120, 53, 15, 0.5)', border: '2px solid rgba(217, 119, 6, 0.4)', backdropFilter: 'blur(10px)' }}>
                <h3 className="text-lg font-semibold text-amber-50 mb-4 uppercase" style={{ fontFamily: 'Cinzel' }}>Tour Features</h3>
                <div className="space-y-3 flex-1 flex flex-col justify-center overflow-y-auto">
                  <div className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center flex-shrink-0 p-2.5">
                      <img src="/Icons/ICONS/LOCATION.png" alt="Interactive Navigation" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">Interactive Navigation</h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">Move freely through sacred spaces</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0 p-2.5">
                      <img src="/Icons/ICONS/HEADPHONE.png" alt="Audio Narration" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">Audio Narration</h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">Guided commentary in multiple languages</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
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
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">Mobile Friendly</h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">Experience on any device</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 transition-all duration-300 hover:scale-105 cursor-pointer p-2 rounded-lg hover:bg-opacity-60" style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)' }}>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-amber-600 flex items-center justify-center flex-shrink-0 p-2">
                      <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2"/>
                        <path d="M3 14L8 9L12 13L21 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="16" cy="8" r="2" fill="currentColor"/>
                        <path d="M1 1L5 5M19 1L23 5M1 23L5 19M19 23L23 19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-amber-100 font-semibold text-sm mb-0.5">High Resolution</h4>
                      <p className="text-amber-200 text-xs leading-snug truncate">Crystal clear imagery</p>
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
                        href="https://www.youtube.com/watch?v=EoJScAcAGsQ" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=EoJScAcAGsQ</span>
                      </a>
                      <a 
                        href="https://www.youtube.com/watch?v=5IakMi7eJ1I" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=5IakMi7eJ1I</span>
                      </a>
                      <a 
                        href="https://www.youtube.com/watch?v=XPWScZFWcZ8" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group"
                        style={{ fontFamily: 'Chivo' }}
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform">▶️</span>
                        <span className="underline break-all">https://www.youtube.com/watch?v=XPWScZFWcZ8</span>
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

              {/* Preview Box with Dynamic Content */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* TOP AREA: MODE PREVIEW / EMBED */}
                <div className="h-[20rem] bg-gradient-to-br from-amber-900 to-orange-900 relative px-6 py-4 flex items-center justify-center">
                  {viewMode === '3d' ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="auto"
                      className="w-full h-full object-cover rounded-2xl"
                      style={{ filter: 'contrast(1.15) saturate(1.2) brightness(1.08) sharpness(1.1)' }}
                    >
                      <source src="/tashiding/tashiding 3d.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <div className="w-full h-full flex flex-col md:flex-row items-stretch gap-4">
                      {/* EMBEDDED MAP / STREET VIEW */}
                      <div className="flex-1 rounded-2xl overflow-hidden border border-amber-500/40 bg-black/40">
                        <iframe
                          src={activePanorama.embedUrl}
                          title={activePanorama.title}
                          className="w-full h-full border-0"
                          loading="lazy"
                          allowFullScreen
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>

                      {/* TEXT DESCRIPTION OF CURRENT SHOT */}
                      <div className="w-full md:w-64 flex flex-col justify-center text-left text-amber-100">
                        <p
                          className="text-sm font-semibold mb-1 uppercase"
                          style={{ fontFamily: 'Cinzel' }}
                        >
                          Panoramic View
                        </p>
                        <p
                          className="text-base font-semibold mb-1"
                          style={{ fontFamily: 'Cinzel' }}
                        >
                          {activePanorama.title}
                        </p>
                        {activePanorama.note && (
                          <p className="text-sm text-amber-200 mb-3">
                            {activePanorama.note}
                          </p>
                        )}
                        <a
                          href={activePanorama.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-amber-200 underline"
                        >
                          View directly on Google Maps ↗
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Mode indicator badge */}
                  <div className="absolute top-4 right-4 px-4 py-2 rounded-full bg-amber-900/80 backdrop-blur-sm border border-amber-500/30">
                    <span
                      className="text-xs font-semibold text-amber-100 uppercase"
                      style={{ fontFamily: 'Cinzel' }}
                    >
                      {viewMode === '3d' ? '3D Model' : 'Panoramic 360°'}
                    </span>
                  </div>
                </div>

                {/* BOTTOM AREA: PANORAMIC SHOTS GRID */}
                {viewMode === 'panoramic' && (
                  <div className="border-top border-amber-500/20 bg-black/20 px-6 py-5">
                    <h4
                      className="text-sm md:text-base font-semibold text-amber-100 mb-3 flex items-center gap-2 uppercase"
                      style={{ fontFamily: 'Cinzel' }}
                    >
                      <span className="text-lg">📍</span>
                      Panoramic Shots from Google Maps
                    </h4>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {panoramicShots.map((shot) => (
                        <div
                          key={shot.id}
                          onClick={() => setActivePanorama(shot)}
                          className="group rounded-2xl overflow-hidden border border-amber-500/30 bg-black/30 hover:border-amber-300/70 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer"
                        >
                          {/* Panoramic view display */}
                          <div className="aspect-video w-full flex items-center justify-center bg-gradient-to-br from-amber-900/60 to-orange-900/60 overflow-hidden">
                            <iframe
                              src={shot.embedUrl}
                              title={shot.title}
                              className="w-full h-full border-0"
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>    
      </section>

      <Footer />
    </main>
  );
}
