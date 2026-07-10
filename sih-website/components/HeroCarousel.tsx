"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";

const SLIDES: string[] = [
  "/carousel/1.jpg",
  "/carousel/2.jpg",
  "/carousel/3.jpg",
  "/carousel/4.jpg",
  "/carousel/5.jpg",
  "/carousel/6.jpg",
];


export default function HeroCarousel() {
  return (
    <div className="relative select-none">
      <Swiper
        modules={[Autoplay]}
        freeMode={true}
        loop
        autoplay={{ delay: 0, disableOnInteraction: false }}
        speed={12000}
        breakpoints={{
          0:    { slidesPerView: 1.15, spaceBetween: 12 },
          640:  { slidesPerView: 1.6,  spaceBetween: 14 },
          768:  { slidesPerView: 2.1,  spaceBetween: 16 },
          1024: { slidesPerView: 2.6,  spaceBetween: 20 },
        }}
        className="!overflow-visible"
      >
        {SLIDES.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/15 bg-white/5 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300">
              <img src={src} alt="" aria-hidden="true"
                   className="h-[360px] w-full object-cover object-center" loading="lazy" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
