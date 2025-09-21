"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [search, setSearch] = useState("");
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const val = search.trim().toLowerCase();
    if (val === "home") {
      document.getElementById("home")?.scrollIntoView({ behavior: "smooth" });
    } else if (val === "map") {
      document.getElementById("monastery-map")?.scrollIntoView({ behavior: "smooth" });
    } else if (val === "overview") {
      document.getElementById("monastery-slideshow")?.scrollIntoView({ behavior: "smooth" });
    }
    setSearch("");
  };
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-shadow
      ${scrolled ? "shadow-[0_2px_12px_rgba(0,0,0,0.15)]" : ""}`}>
      <div className="bg-[#0c3b44] text-white">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          {/* Left: logo */}
          <Link href="/" className="flex flex-row items-center gap-2">
            <img src="/logo web.png" alt="Logo" className="h-12 w-12 object-contain" />
            <span className="font-poppins tracking-wide text-xl">Sangha</span>
            <span className="font-lora italic text-sm text-white/90"></span>
          </Link>

          {/* Center: links */}
          <ul className="mx-auto hidden md:flex items-center gap-8 text-sm uppercase tracking-wider">
            <li><a href="#home" className="hover:opacity-80">Home</a></li>
            <li><a href="#explore" className="hover:opacity-80">Virtual Tour</a></li>
            <li><a href="#monastery-slideshow" className="hover:opacity-80">Overview</a></li>
            <li><a href="#monastery-map" className="hover:opacity-80">Map</a></li>
          </ul>

          {/* Right: search + burger */}
          <div className="ml-auto flex items-center gap-3">
            <form className="hidden sm:flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5" onSubmit={handleSearch}>
              {/* search icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80">
                <path fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16a6.471 6.471 0 0 0 4.23-1.57l.27.28v.79L20 21.5 21.5 20zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-28 bg-transparent text-sm placeholder-white/70 outline-none"
              />
            </form>

            <button
              aria-label="Menu"
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center rounded-md p-2 hover:bg-white/10 md:hidden"
            >
              <svg width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>
            </button>
          </div>
        </nav>

        {/* Mobile sheet */}
        {open && (
          <div className="md:hidden border-t border-white/15">
            <ul className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 text-sm uppercase tracking-wider">
              <li><a href="#home" onClick={()=>setOpen(false)}>Home</a></li>
              <li><a href="#explore" onClick={()=>setOpen(false)}>Virtual Tour</a></li>
              <li><a href="#monastery-slideshow" onClick={()=>setOpen(false)}>Overview</a></li>
              <li><a href="#monastery-map" onClick={()=>setOpen(false)}>Map</a></li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
