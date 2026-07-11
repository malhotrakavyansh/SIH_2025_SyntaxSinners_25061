"use client";
import React, { useEffect, useRef } from "react";

const BackgroundAudio: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Start muted for now
    audio.muted = true;

    // Try to play (may be blocked by browser autoplay policies)
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.catch(() => {
        // Autoplay likely blocked — user interaction will resume playback.
      });
    }
  }, []);

  return (
    <audio
      ref={audioRef}
      src="/bg_music.mp3"
      autoPlay
      loop
      // hidden visually — keep element out of layout
      style={{ display: "none" }}
    />
  );
};

export default BackgroundAudio;
