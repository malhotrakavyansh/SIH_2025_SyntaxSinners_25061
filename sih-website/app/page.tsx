"use client";
import Intro from "../components/Intro";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import Reveal from "../components/Reveal";
import ExploreCarouselMount from "../components/ExploreCarouselMount";
import { useEffect, useRef, useState } from "react";
import MonasterySlideshow from "../components/MonasterySlideshow";
import MonasteryMap from "../components/MonasteryMap";

// Animation for Explore section

export default function Page() {
  return (
    <main className="bg-white text-black">
      {/* Landing overlay */}
      <Intro
        mp4="/hero.mp4"
        title="Sangha"
        subtitle="A digital window into Sikkim’s monasteries"
      />

      <Nav />
      <Hero />

      {/* --- Explore --- */}
      <section
        id="explore"
        className="relative px-6 py-24 md:py-40 transition-all duration-1000 ease-out opacity-100 scale-100"
        style={{
          backgroundImage: 'url(/bg1.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Dark overlay + smokey tinge */}
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: `
            linear-gradient(120deg, #3a1c1c 0%, #1a0a0a 100%),
            radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 60%, transparent 100%),
            radial-gradient(ellipse at 30% 70%, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 60%, transparent 100%),
            radial-gradient(ellipse at 80% 80%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 60%, transparent 100%)
          `,
          opacity: 0.75,
          zIndex: 1,
        }} />
        <div className="relative mx-auto max-w-7xl" style={{zIndex:2}}>
          <div className="mt-10">
            <ExploreCarouselMount />
            <div id="monastery-slideshow">
              <MonasterySlideshow />
            </div>
            <div id="monastery-map">
              <MonasteryMap />
            </div>
          </div>
        </div>
      </section>

      {/* Archive and Contact sections removed as requested */}
    </main>
  );
}