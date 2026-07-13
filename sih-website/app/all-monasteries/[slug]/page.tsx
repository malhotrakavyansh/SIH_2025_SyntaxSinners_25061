"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Nav from "../../../components/Nav";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  history: "History",
  architecture: "Architecture",
  rituals: "Rituals",
  bestVisitTime: "Best Visit Time",
  travelInfo: "Travel Info",
};

type Monastery = {
  name: string;
  location: string;
  altitude: string;
  founded: string;
  shortDescription: string;
  heroImageUrl: string;
  gallery: string[];
  sections: Record<string, string>;
};

export default function PublicMonasteryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [monastery, setMonastery] = useState<Monastery | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/monasteries/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => setMonastery(data.monastery))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-2xl px-4 pt-32 pb-16 text-center">
          <h1 className="font-poppins text-2xl text-[#0c3b44]">Monastery not found</h1>
        </main>
      </>
    );
  }

  if (!monastery) {
    return (
      <>
        <Nav />
        <main className="mx-auto max-w-2xl px-4 pt-32 pb-16 text-center text-black/60">Loading…</main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {monastery.heroImageUrl && (
          <img
            src={monastery.heroImageUrl}
            alt={monastery.name}
            className="w-full h-72 object-cover rounded-2xl mb-6"
          />
        )}
        <h1 className="font-poppins text-3xl text-[#0c3b44]">{monastery.name}</h1>
        <p className="mt-2 text-black/60">
          {monastery.location}
          {monastery.altitude && ` • ${monastery.altitude}`}
          {monastery.founded && ` • Founded ${monastery.founded}`}
        </p>
        {monastery.shortDescription && <p className="mt-4 text-black/80">{monastery.shortDescription}</p>}

        {Object.entries(SECTION_LABELS).map(([key, label]) =>
          monastery.sections[key] ? (
            <section key={key} className="mt-8">
              <h2 className="font-poppins text-xl text-[#0c3b44] mb-2">{label}</h2>
              <p className="whitespace-pre-wrap text-black/80">{monastery.sections[key]}</p>
            </section>
          ) : null
        )}

        {monastery.gallery.length > 0 && (
          <section className="mt-8">
            <h2 className="font-poppins text-xl text-[#0c3b44] mb-3">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {monastery.gallery.map((src, i) => (
                <img key={i} src={src} alt={`${monastery.name} ${i + 1}`} className="w-full h-40 object-cover rounded-lg" />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
