"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import { useAuth } from "../../components/AuthProvider";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const MONASTERIES = ["Rumtek", "Tashiding", "Dubdi", "Pemayangtse"];
const TYPES = [
  { key: "mural", label: "Mural" },
  { key: "thangka", label: "Thangka" },
  { key: "manuscript", label: "Manuscript" },
];

type Submission = {
  id: string;
  title: string;
  monastery: string;
  type: string;
  year: string;
  location: string;
  description: string;
  imageFilename: string;
  ocrText: string;
  tags: string[];
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
};

const inputClass = "border rounded-lg px-3 py-2 text-sm";
const inputStyle = { borderColor: "#E8E2D6", color: "#2F3A3D" };

function StatusBadge({ status }: { status: Submission["status"] }) {
  const colors: Record<Submission["status"], { bg: string; fg: string }> = {
    pending: { bg: "#F3E8CC", fg: "#7A5B00" },
    approved: { bg: "#DCEEE8", fg: "#146C43" },
    rejected: { bg: "#F5D9D9", fg: "#B02A2A" },
  };
  const c = colors[status];
  return (
    <span
      className="text-xs font-medium shadow-sm shrink-0 inline-flex items-center"
      style={{ background: c.bg, color: c.fg, borderRadius: "0.875rem", padding: "0.25rem 0.75rem" }}
    >
      {status[0].toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function ContributePage() {
  const { user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [monastery, setMonastery] = useState(MONASTERIES[0]);
  const [type, setType] = useState(TYPES[0].key);
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);

  const [mine, setMine] = useState<Submission[]>([]);
  const [mineLoading, setMineLoading] = useState(true);

  const loadMine = useCallback(async () => {
    setMineLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/submissions/mine`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMine(data.submissions);
      }
    } finally {
      setMineLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadMine();
  }, [user, loadMine]);

  const reset = () => {
    setTitle("");
    setYear("");
    setLocation("");
    setDescription("");
    setTags("");
    setFile(null);
    setMonastery(MONASTERIES[0]);
    setType(TYPES[0].key);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please choose an image.");
      return;
    }
    setSubmitting(true);
    setError(null);
    setJustSubmitted(false);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("monastery", monastery);
      formData.append("type", type);
      formData.append("year", year);
      formData.append("location", location);
      formData.append("description", description);
      formData.append("tags", tags);
      formData.append("file", file);
      const res = await fetch(`${API_URL}/api/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      reset();
      setJustSubmitted(true);
      loadMine();
    } catch {
      setError("Submission failed. Is the backend running?");
    }
    setSubmitting(false);
  };

  if (!loading && !user) {
    return (
      <>
        <Nav />
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pt-24 pb-16 text-center">
          <h1 className="font-poppins text-2xl text-[#0c3b44]">Contribute to the archive</h1>
          <p className="mt-2 text-sm text-black/60">
            You need an account to submit artifacts for review.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link href="/login" className="rounded-md bg-[#0c3b44] px-4 py-2 text-sm text-white hover:opacity-90">
              Log in
            </Link>
            <Link href="/register" className="rounded-md border border-[#0c3b44] px-4 py-2 text-sm text-[#0c3b44] hover:bg-[#0c3b44]/5">
              Register
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="font-poppins text-2xl" style={{ color: "#2F3A3D" }}>Contribute an artifact</h1>
        <p className="mt-2 text-sm" style={{ color: "#2F3A3D99" }}>
          Submit a photo of a mural, thangka, or manuscript. It's run through the same
          BDRC-based OCR pipeline used across the archive, then queued for admin review
          before it appears publicly — nothing you submit is published automatically.
        </p>

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} style={inputStyle} />
          <select value={monastery} onChange={(e) => setMonastery(e.target.value)} className={inputClass} style={inputStyle}>
            {MONASTERIES.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass} style={inputStyle}>
            {TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <input placeholder="Year (e.g. 17th c.)" value={year} onChange={(e) => setYear(e.target.value)} className={inputClass} style={inputStyle} />
          <input placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className={inputClass} style={inputStyle} />
          <textarea placeholder="Notes for the reviewer (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} style={inputStyle} rows={3} />
          <input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} className={inputClass} style={inputStyle} />
          <input required type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />

          {error && <div className="text-sm" style={{ color: "#b91c1c" }}>{error}</div>}
          {justSubmitted && <div className="text-sm" style={{ color: "#146C43" }}>Submitted — an admin will review it soon.</div>}

          <button
            disabled={submitting}
            className="mt-2 self-start rounded-md px-4 py-2 text-sm text-white hover:opacity-90 disabled:opacity-50"
            style={{ background: "#5B2C2C" }}
          >
            {submitting ? "Uploading & running OCR…" : "Submit for review"}
          </button>
        </form>

        <h2 className="mt-12 font-poppins text-xl" style={{ color: "#2F3A3D" }}>Your submissions</h2>
        {mineLoading ? (
          <p className="mt-3 text-sm" style={{ color: "#2F3A3D99" }}>Loading…</p>
        ) : mine.length === 0 ? (
          <p className="mt-3 text-sm" style={{ color: "#2F3A3D99" }}>You haven't submitted anything yet.</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {mine.map((s) => (
              <li key={s.id} className="rounded-lg border p-4" style={{ borderColor: "#E8E2D6", background: "#F8F4EA" }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium" style={{ color: "#2F3A3D" }}>{s.title}</p>
                    <p className="text-xs" style={{ color: "#2F3A3D99" }}>{s.monastery} • {s.type} • {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                {s.status === "rejected" && s.reviewNote && (
                  <p className="mt-2 text-xs" style={{ color: "#B02A2A" }}>Reviewer note: {s.reviewNote}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
