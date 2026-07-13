'use client';

import React, { useState, useRef } from 'react';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export default function MeditatePage() {
  const [selectedMonastery, setSelectedMonastery] = useState('dubdi');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const monasteries = [
    { id: 'dubdi', name: 'DUBDI', audio: '/dubdi audio.mp3', color: '#f59e0b' },
    { id: 'tashiding', name: 'TASHIDING', audio: '/tashiding audio.mp4', color: '#d97706' },
    { id: 'tsuk', name: 'TSUK', audio: '/tsuk audio.mp3', color: '#b45309' },
    { id: 'rumtek', name: 'RUMTEK', audio: '/rumtek audio.mp3', color: '#92400e' },
  ];

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

  const handleMonasteryChange = (monasteryId: string) => {
    setSelectedMonastery(monasteryId);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const currentMonastery = monasteries.find((m) => m.id === selectedMonastery);

  return (
    <main className="min-h-screen relative">
      {/* Background Image */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(/meditation-forest-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Nav />

        {/* Header Section */}
        <section className="relative w-full pt-32 pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <div className="text-center mb-12">
            <h1
              className="text-5xl md:text-6xl font-bold text-amber-100 mb-4 uppercase tracking-wide"
              style={{ fontFamily: 'Cinzel Decorative' }}
            >
              Live Meditation
            </h1>
            <p className="text-amber-200 text-lg italic max-w-2xl mx-auto" style={{ fontFamily: 'Chivo' }}>
              Immerse yourself in the peaceful chants and meditative atmosphere of Sikkim&apos;s sacred monasteries
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative w-full pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-14">
          <div className="grid lg:grid-cols-[300px_1fr] gap-8">
            {/* Left Sidebar - Monasteries List */}
            <div
              className="rounded-3xl p-6 h-fit sticky top-24"
              style={{
                backgroundColor: 'rgba(217, 119, 6, 0.15)',
                border: '2px solid rgba(217, 119, 6, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <h2
                className="text-2xl font-bold text-amber-100 mb-6 uppercase"
                style={{ fontFamily: 'Cinzel' }}
              >
                Monasteries
              </h2>
              <div className="space-y-3">
                {monasteries.map((monastery) => (
                  <button
                    key={monastery.id}
                    onClick={() => handleMonasteryChange(monastery.id)}
                    className={`w-full text-left px-6 py-4 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                      selectedMonastery === monastery.id
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-amber-900 shadow-lg scale-105'
                        : 'text-amber-100 hover:bg-amber-900/30 hover:text-amber-50'
                    }`}
                    style={{ fontFamily: 'Cinzel' }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          selectedMonastery === monastery.id ? '#451a03' : monastery.color,
                      }}
                    />
                    <span>{monastery.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right Content - Video and Controls */}
            <div className="space-y-8">
              {/* Video Player */}
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Video Display */}
                <div className="relative aspect-video bg-gradient-to-br from-amber-950 to-orange-950">
                  <video
                    className="w-full h-full object-cover"
                    poster="/monastery-meditation.jpg"
                    controls={false}
                  >
                    <source src={`/${selectedMonastery}/meditation-video.mp4`} type="video/mp4" />
                  </video>

                  {/* Overlay Text */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="text-center text-amber-100">
                      <div className="text-6xl mb-4">🕉️</div>
                      <h3
                        className="text-3xl font-bold uppercase tracking-wider"
                        style={{ fontFamily: 'Cinzel Decorative' }}
                      >
                        {currentMonastery?.name}
                      </h3>
                      <p className="text-lg mt-2" style={{ fontFamily: 'Chivo' }}>
                        Meditation Session
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audio Controls */}
                <div className="p-8">
                  <audio
                    ref={audioRef}
                    src={currentMonastery?.audio}
                    preload="metadata"
                    onEnded={() => setIsPlaying(false)}
                  />

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="w-full h-2 bg-amber-900/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-200 rounded-full transition-all"
                        style={{ width: '0%' }}
                      />
                    </div>
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-center gap-6">
                    <button
                      onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime -= 10;
                      }}
                      className="w-12 h-12 rounded-full bg-amber-900/40 hover:bg-amber-900/60 flex items-center justify-center text-amber-100 hover:text-white transition text-xl"
                    >
                      ◀
                    </button>

                    <button
                      onClick={togglePlay}
                      className="w-20 h-20 rounded-full bg-gradient-to-b from-amber-100 to-amber-200 flex items-center justify-center text-3xl text-amber-900 hover:scale-110 transition shadow-lg hover:shadow-xl"
                    >
                      {isPlaying ? '⏸' : '▶'}
                    </button>

                    <button
                      onClick={() => {
                        if (audioRef.current) audioRef.current.currentTime += 10;
                      }}
                      className="w-12 h-12 rounded-full bg-amber-900/40 hover:bg-amber-900/60 flex items-center justify-center text-amber-100 hover:text-white transition text-xl"
                    >
                      ▶
                    </button>
                  </div>

                  {/* Download Button */}
                  <div className="flex justify-center mt-6">
                    <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-900/40 hover:bg-amber-900/60 text-amber-100 hover:text-white transition">
                      <span className="text-xl">⬇</span>
                      <span className="font-semibold" style={{ fontFamily: 'Chivo' }}>
                        Download Audio
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div
                className="rounded-3xl p-8"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3
                  className="text-2xl font-bold text-amber-100 mb-4 uppercase"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  About This Meditation
                </h3>
                <p className="text-amber-200 leading-relaxed mb-4" style={{ fontFamily: 'Chivo' }}>
                  Experience the serene atmosphere of {currentMonastery?.name} Monastery through this
                  immersive meditation session. Listen to authentic chants and prayers recorded live
                  from the monastery, offering you a window into centuries-old spiritual practices.
                </p>
                <p className="text-amber-200 leading-relaxed" style={{ fontFamily: 'Chivo' }}>
                  These meditation sessions feature traditional Buddhist chants, bell sounds, and the
                  peaceful ambience of the monastery environment. Perfect for meditation, relaxation, or
                  spiritual contemplation.
                </p>
              </div>

              {/* Benefits Section */}
              <div
                className="rounded-3xl p-8"
                style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <h3
                  className="text-2xl font-bold text-amber-100 mb-6 uppercase"
                  style={{ fontFamily: 'Cinzel' }}
                >
                  Benefits of Meditation
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { icon: '🧘', title: 'Inner Peace', desc: 'Find tranquility and calm your mind' },
                    {
                      icon: '💫',
                      title: 'Stress Relief',
                      desc: 'Reduce anxiety and tension naturally',
                    },
                    {
                      icon: '🌟',
                      title: 'Mental Clarity',
                      desc: 'Enhance focus and concentration',
                    },
                    {
                      icon: '❤️',
                      title: 'Emotional Balance',
                      desc: 'Cultivate compassion and mindfulness',
                    },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-2xl bg-amber-900/20 hover:bg-amber-900/30 transition"
                    >
                      <div className="text-3xl">{benefit.icon}</div>
                      <div>
                        <h4
                          className="text-amber-100 font-semibold mb-1"
                          style={{ fontFamily: 'Cinzel' }}
                        >
                          {benefit.title}
                        </h4>
                        <p className="text-amber-200 text-sm" style={{ fontFamily: 'Chivo' }}>
                          {benefit.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        <Footer />
      </div>
    </main>
  );
}
