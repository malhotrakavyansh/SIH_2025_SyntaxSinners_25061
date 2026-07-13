"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Nav from "./Nav";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// NOTE: project was missing lucide-react and a custom UI library. Provide
// small local fallbacks so this component compiles and works without those
// dependencies. These are minimal and can be replaced with your preferred
// design system later.

type IconProps = { children: React.ReactNode; className?: string; style?: React.CSSProperties };
const Icon = ({ children, className = "", style }: IconProps) => (
  <span
    className={`inline-flex items-center justify-center align-middle ${className}`}
    style={{ fontSize: "0.85em", lineHeight: 1, ...style }}
    aria-hidden
  >
    {children}
  </span>
);
type GlyphProps = { className?: string; style?: React.CSSProperties };
const Filter = (props: GlyphProps) => <Icon {...props}>⚙️</Icon>;
const ChevronDown = (props: GlyphProps) => <Icon {...props}>▾</Icon>;
const X = (props: GlyphProps) => <Icon {...props}>✕</Icon>;
const ImageIcon = (props: GlyphProps) => <Icon {...props}>🖼️</Icon>;
const FileText = (props: GlyphProps) => <Icon {...props}>📄</Icon>;
const BookOpen = (props: GlyphProps) => <Icon {...props}>📚</Icon>;
const Download = (props: GlyphProps) => <Icon {...props}>⬇️</Icon>;
const Eye = (props: GlyphProps) => <Icon {...props}>👁️</Icon>;
const Sparkles = (props: GlyphProps) => <Icon {...props}>✨</Icon>;
const MapPin = (props: GlyphProps) => <Icon {...props}>📍</Icon>;
const Calendar = (props: GlyphProps) => <Icon {...props}>📅</Icon>;
const ShieldCheck = (props: GlyphProps) => <Icon {...props}>🛡️</Icon>;

// Minimal UI primitives
type CardProps = { children: React.ReactNode; className?: string; style?: React.CSSProperties };
const Card = ({ children, className = "", style = {} }: CardProps) => (
  <div className={className} style={style}>{children}</div>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);
type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
};
const Button = ({ children, onClick, className = "", style = {}, disabled }: ButtonProps) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 ${className}`}
    style={style}
    disabled={disabled}
  >
    {children}
  </button>
);
type BadgeProps = { children: React.ReactNode; className?: string; style?: React.CSSProperties };
const Badge = ({ children, className = "", style = {} }: BadgeProps) => (
  <span className={className} style={{ ...style, color: style.color || "#2F3A3D" }}>{children}</span>
);

// Very small dropdown & dialog fallbacks that simply render their children.
const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
const DropdownMenuTrigger = ({ children }: { children: React.ReactNode; asChild?: boolean }) => children;
const DropdownMenuContent = ({ children, className = "" }: { children: React.ReactNode; className?: string; align?: string }) => <div className={className}>{children}</div>;
const DropdownMenuCheckboxItem = ({ children, checked, onCheckedChange }: {
  children: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <label className="flex items-center gap-2 px-2 py-1 cursor-pointer" style={{ color: '#2F3A3D' }}>
    <input type="checkbox" checked={checked} onChange={(e) => onCheckedChange(e.target.checked)} />
    <span style={{ color: '#2F3A3D' }}>{children}</span>
  </label>
);
const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <div className="px-2 py-1 font-semibold" style={{ color: '#2F3A3D' }}>{children}</div>;
const DropdownMenuSeparator = () => <hr className="my-2" style={{ borderColor: '#E8E2D6' }} />;

const Dialog = ({ open, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: React.ReactNode }) => open ? <div>{children}</div> : null;
const DialogContent = ({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) => <div className={className} style={style}>{children}</div>;

// ----------------------------------------------
// THEME (approx. matched to video):
// Primary deep maroon: #5B2C2C
// Accent gold: #D4AF37
// Parchment bg: #F8F4EA
// Ink gray: #2F3A3D
// Accent teal: #2A6F6C
// ----------------------------------------------

const MONASTERIES = [
  "Rumtek", "Tashiding", "Dubdi", "Pemayangtse"
];

const TYPES = [
  { key: "mural", label: "Murals", icon: ImageIcon },
  { key: "thangka", label: "Thangkas", icon: ImageIcon },
  { key: "manuscript", label: "Manuscripts", icon: FileText },
];

type ArchiveItem = {
  id: string;
  title: string;
  monastery: string;
  type: string;
  year: string;
  img: string;
  tags: string[];
  ocrText: string;
  location: string;
};

// Shape returned by the backend (GET /archive, POST /archive/upload)
type ApiArchiveItem = {
  id: string;
  title: string;
  monastery: string;
  type: string;
  year: string;
  location: string;
  image_filename: string;
  ocrText: string;
  tags: string[];
};

function fromApiItem(d: ApiArchiveItem): ArchiveItem {
  return {
    id: d.id,
    title: d.title,
    monastery: d.monastery,
    type: d.type,
    year: d.year,
    location: d.location,
    img: `${API_URL}/archive_uploads/${d.image_filename}`,
    ocrText: d.ocrText,
    tags: d.tags,
  };
}

type MonasteryInfo = { key: string; label: string; img: string };

const MONASTERIES_INFO: MonasteryInfo[] = [
  { key: 'rumtek', label: 'Rumtek', img: '/monasteries/rumtek.jpg' },
  { key: 'tashiding', label: 'Tashiding', img: '/monasteries/tashiding.png' },
  { key: 'dubdi', label: 'Dubdi', img: '/monasteries/dubdi.png' },
  { key: 'pemayangtse', label: 'Pemayangtse', img: '/monasteries/pemayangtse.jpg' },
];

function MonasteryCard({ m, onClick }: { m: MonasteryInfo; onClick?: (label: string) => void }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md cursor-pointer w-full pop-card shine-border" onClick={() => onClick && onClick(m.label)}>
      <div className="w-full overflow-hidden" style={{ aspectRatio: '3/2', background: '#EDEDED' }}>
        <img src={m.img} alt={m.label} className="w-full h-full object-cover" />
      </div>
      <div style={{ background: '#D4AF37' }} className="px-3 py-3 text-center">
        <span style={{ color: '#5B2C2C', fontWeight: 700, letterSpacing: '1px' }}>{m.label.toUpperCase()}</span>
      </div>
    </div>
  );
}

function Chip({ children, onRemove }: { children: React.ReactNode; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm shadow-sm border" style={{
      background: "#F8F4EA",
      borderColor: "#E8E2D6",
      color: "#2F3A3D",
    }}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:opacity-80" aria-label="Remove filter">
          <X className="h-4 w-4" />
        </button>
      )}
    </span>
  );
}

function ArchiveCard({ item, onOpen }: { item: ArchiveItem; onOpen: (it: ArchiveItem) => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="overflow-hidden border-0 shadow-lg pop-card shine-border" style={{ borderRadius: "1.25rem", background: "#F8F4EA" }}>
        <div className="aspect-[4/3] w-full overflow-hidden" style={{ background: "#2F3A3D" }}>
          <img src={item.img} alt={item.title} className="h-full w-full object-cover hover:scale-[1.02] transition-transform duration-300" />
        </div>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-semibold" style={{ color: "#2F3A3D" }}>{item.title}</h3>
            <Badge className="text-xs shadow-sm shrink-0" style={{ background: "#2A6F6C", color: "white", borderRadius: "0.875rem", padding: "0.375rem 0.875rem" }}>{item.type}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm" style={{ color: "#2F3A3D" }}>
            <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{item.monastery} • {item.location}</span>
            <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" />{item.year}</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {item.tags.map((t: string) => (
              <Badge key={t} className="text-[11px]" style={{ background: "#F8F4EA", color: "#2F3A3D", border: "1px solid #E8E2D6" }}>{t}</Badge>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => onOpen(item)} className="shadow-sm pop-btn" style={{ background: "#5B2C2C", color: "white", borderRadius: "0.875rem" }}>
              <Eye className="h-4 w-4 mr-2" /> View
            </Button>
            <Button className="shadow-sm pop-btn" style={{ borderRadius: "0.875rem", borderColor: "#D4AF37", color: "#5B2C2C" }}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function UploadForm({ onUploaded }: { onUploaded: (item: ArchiveItem) => void }) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [monastery, setMonastery] = useState(MONASTERIES[0]);
  const [type, setType] = useState(TYPES[0].key);
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const reset = () => {
    setTitle("");
    setYear("");
    setLocation("");
    setTags("");
    setFile(null);
    setMonastery(MONASTERIES[0]);
    setType(TYPES[0].key);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("monastery", monastery);
      formData.append("type", type);
      formData.append("year", year);
      formData.append("location", location);
      formData.append("tags", tags);
      formData.append("file", file);
      const res = await fetch(`${API_URL}/archive/upload`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const item: ApiArchiveItem = await res.json();
      onUploaded(fromApiItem(item));
      reset();
      setOpen(false);
    } catch {
      setError("Upload failed. Is the backend running?");
    }
    setSubmitting(false);
  };

  const inputClass = "border rounded-lg px-3 py-2 text-sm";
  const inputStyle = { borderColor: "#E8E2D6", color: "#2F3A3D" };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="shadow-sm" style={{ background: "#5B2C2C", color: "white", borderRadius: "0.875rem" }}>
        + Add Artifact
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg p-6" style={{ background: "white", borderRadius: "1.25rem" }}>
          <h3 className="text-xl font-semibold mb-4" style={{ color: "#2F3A3D" }}>Add Artifact</h3>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} />
            <select value={monastery} onChange={(e) => setMonastery(e.target.value)} className={inputClass} style={inputStyle}>
              {MONASTERIES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} style={inputStyle}>
              {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
            <input required placeholder="Year (e.g. 17th c.)" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} style={inputStyle} />
            <input required placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} style={inputStyle} />
            <input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} style={inputStyle} />
            <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
            {error && <div className="text-sm" style={{ color: "#b91c1c" }}>{error}</div>}
            <div className="flex gap-3 mt-2">
              <Button className="shadow-sm" disabled={submitting} style={{ background: "#5B2C2C", color: "white", borderRadius: "0.875rem" }}>
                {submitting ? "Uploading & running OCR…" : "Upload"}
              </Button>
              <Button onClick={() => setOpen(false)} className="shadow-sm" style={{ borderRadius: "0.875rem", borderColor: "#D4AF37", color: "#5B2C2C" }}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function DigitalArchivePage() {
  const [query] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ArchiveItem | null>(null);
  const [selectedMonasteries, setSelectedMonasteries] = useState<string[]>(["Rumtek", "Tashiding", "Dubdi", "Pemayangtse"]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [aiOnly, setAiOnly] = useState(false);
  const [items, setItems] = useState<ArchiveItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/archive`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: ApiArchiveItem[]) => {
        if (cancelled) return;
        setItems(data.map(fromApiItem));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchesQ = !query || (it.title.toLowerCase().includes(query.toLowerCase()) || it.ocrText.toLowerCase().includes(query.toLowerCase()));
      const matchesM = selectedMonasteries.includes(it.monastery);
      const matchesT = selectedTypes.length === 0 || selectedTypes.includes(it.type);
      const matchesAI = !aiOnly || it.tags.some((t: string) => /AI|OCR/i.test(t));
      return matchesQ && matchesM && matchesT && matchesAI;
    });
  }, [items, query, selectedMonasteries, selectedTypes, aiOnly]);

  const toggleType = (t: string) => setSelectedTypes((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);
  const removeMonastery = (m: string) => setSelectedMonasteries((prev) => prev.filter((x) => x !== m));

  return (
    <main className="min-h-screen relative" style={{
      backgroundImage: "url('/bg1.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
    }}>
      <Nav />
      {/* subtle overlay on background to improve contrast */}
      <div style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        background: `linear-gradient(120deg, rgba(91,44,44,0.06) 0%, rgba(91,44,44,0.06) 100%)`,
        zIndex: 1,
      }} />
      <div className="relative" style={{ zIndex: 2, paddingTop: '72px' }}>
      {/* Hero / Header */}
      <section className="pt-6 pb-6">
        <div className="mx-auto max-w-7xl">
          {/* Banner with background video + maroon gradient overlay (uses public/archive.mp4) */}
          <div className="relative rounded-xl overflow-hidden mb-6" style={{ borderRadius: '1rem' }}>
            <div className="w-full h-56 md:h-72 lg:h-96 relative">
              <video
                src={'/archive.mp4'}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-cover"
                style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' }}
              />

              {/* gradient overlay to improve text contrast */}
              <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(91,44,44,0.88) 0%, rgba(91,44,44,0.6) 35%, rgba(0,0,0,0.0) 100%)' }} />

              {/* content overlay */}
              <div className="absolute inset-0 flex items-center">
                <div className="px-6 md:px-12 py-6 md:py-8">
                  <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs tracking-wide" style={{ background: '#5B2C2C', color: '#F8F4EA' }}>
                    <Sparkles className="h-4 w-4" /> AI · OCR · Cloud Preservation
                  </div>
                  <h1 className="mt-4 text-3xl md:text-6xl font-extrabold leading-tight font-poppins" style={{ color: '#F8F4EA' }}>
                    Digital Archive Library
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm md:text-lg" style={{ color: '#F8F4EA', opacity: 0.95 }}>
                    Ancient murals, thangkas, and manuscripts carefully digitized using AI-powered OCR and cloud systems, now live on as a searchable cultural library for generations to come.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monastery showcase: image tiles from public/monasteries */}
          <div className="mt-2 mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MONASTERIES_INFO.map((m) => (
                <MonasteryCard key={m.key} m={m} onClick={(label) => setSelectedMonasteries([label])} />
              ))}
            </div>
          </div>


          {/* Search & Filters – two-column layout spanning full width */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Left: Monasteries */}
            <div className="md:col-span-4">
              <div className="rounded-2xl p-5 border" style={{ background: "#F8F4EA", borderColor: "#D4AF37", boxShadow: "0 12px 36px rgba(0,0,0,0.35)" }}>
                <h3 className="text-xs font-semibold mb-4 tracking-wider" style={{ color: "#5B2C2C" }}>MONASTERIES</h3>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full rounded-xl text-left justify-between" style={{ borderColor: "#D4AF37", color: "#5B2C2C", background: "white" }}>
                      <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Select Location</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Select Monasteries</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {MONASTERIES.map((m) => (
                      <DropdownMenuCheckboxItem
                        key={m}
                        checked={selectedMonasteries.includes(m)}
                        onCheckedChange={(v: boolean) => {
                          setSelectedMonasteries((prev) => v ? Array.from(new Set([...prev, m])) : prev.filter((x) => x !== m));
                        }}
                      >{m}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Center: Artifact Type */}
            <div className="md:col-span-4">
              <div className="rounded-2xl p-5 border" style={{ background: "#F8F4EA", borderColor: "#D4AF37", boxShadow: "0 12px 36px rgba(0,0,0,0.35)" }}>
                <h3 className="text-xs font-semibold mb-4 tracking-wider" style={{ color: "#5B2C2C" }}>ARTIFACT TYPE</h3>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full rounded-xl text-left justify-between" style={{ borderColor: "#D4AF37", color: "#5B2C2C", background: "white" }}>
                      <span className="flex items-center gap-2"><Filter className="h-4 w-4" /> Filter Type</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    <DropdownMenuLabel>Artifact Type</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {TYPES.map((t) => (
                      <DropdownMenuCheckboxItem
                        key={t.key}
                        checked={selectedTypes.includes(t.key)}
                        onCheckedChange={() => toggleType(t.key)}
                      >{t.label}</DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

          </div>

          {/* Active filter chips */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {selectedMonasteries.map((m) => (
              <Chip key={m} onRemove={() => removeMonastery(m)}>{m}</Chip>
            ))}
            {selectedTypes.map((t) => (
              <Chip key={t} onRemove={() => toggleType(t)}>{t}</Chip>
            ))}
            {aiOnly && <Chip onRemove={() => setAiOnly(false)}>AI/OCR</Chip>}
            <div className="ml-auto flex items-center gap-3">
              <Link
                href="/tibetan-ocr"
                className="inline-flex items-center px-4 py-2 shadow-sm pop-btn text-sm font-medium"
                style={{ borderRadius: "0.875rem", border: "1px solid #D4AF37", color: "#5B2C2C", background: "#F8F4EA" }}
              >
                Tibetan OCR
              </Link>
              <UploadForm onUploaded={(item) => setItems((prev) => [item, ...prev])} />
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 md:px-8 lg:px-12 pb-16">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "#E8E2D6", color: "#2F3A3D" }}>
              Loading artifacts…
            </div>
          ) : loadError ? (
            <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "#E8E2D6", color: "#2F3A3D" }}>
              Couldn&apos;t reach the archive service. Is the backend running?
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center" style={{ borderColor: "#E8E2D6", color: "#2F3A3D" }}>
              No results. Try removing some filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filtered.map((it) => (
                  <ArchiveCard key={it.id} item={it} onOpen={(i) => { setActive(i); setOpen(true); }} />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>

      {/* Detail Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden" style={{ borderRadius: "1.25rem" }}>
          {active && (
            <div className="grid md:grid-cols-2">
              <div className="relative" style={{ background: "#2F3A3D" }}>
                <img src={active.img} alt={active.title} className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs" style={{ background: "#5B2C2C", color: "#F8F4EA" }}>
                  <Sparkles className="h-4 w-4" /> AI · OCR
                </div>
              </div>
              <div className="p-6 md:p-8 bg-white">
                <h2 className="text-2xl font-semibold" style={{ color: "#2F3A3D" }}>{active.title}</h2>
                <div className="mt-2 flex flex-wrap gap-3 text-sm" style={{ color: "#2F3A3D" }}>
                  <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" /> {active.monastery} • {active.location}</span>
                  <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4" /> {active.year}</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {active.tags.map((t: string) => (
                    <Badge key={t} className="text-[11px]" style={{ background: "#F8F4EA", color: "#2F3A3D", border: "1px solid #E8E2D6" }}>{t}</Badge>
                  ))}
                </div>

                <div className="mt-5">
                  <h3 className="font-medium mb-2" style={{ color: "#2F3A3D" }}>OCR Snippet</h3>
                  <div className="rounded-xl p-4 text-sm" style={{ background: "#F8F4EA", color: "#2F3A3D", border: "1px solid #E8E2D6" }}>
                    {active.ocrText}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button className="shadow-sm" style={{ background: "#5B2C2C", color: "white", borderRadius: "0.875rem" }}>
                    <Download className="h-4 w-4 mr-2" /> Download Artifact
                  </Button>
                  <Button className="shadow-sm" style={{ borderRadius: "0.875rem", borderColor: "#D4AF37", color: "#5B2C2C" }}>
                    <BookOpen className="h-4 w-4 mr-2" /> View Full Metadata
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer strip */}
      <footer className="border-t" style={{ borderColor: "#E8E2D6" }}>
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm" style={{ color: "#2F3A3D" }}>
            © Monastery360 · AI‑preserved Heritage · Sikkim
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" style={{ color: "#2A6F6C" }} /> OCR Accuracy ≥ 98%*</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" style={{ color: "#2A6F6C" }} /> Cloud Redundancy x3</span>
          </div>
        </div>
      </footer>
      </div>
    </main>
  );
}
