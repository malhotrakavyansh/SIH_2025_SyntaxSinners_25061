"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StatusBadge from "../../components/admin/StatusBadge";
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
  status: "pending" | "approved" | "rejected";
  reviewNote: string | null;
  createdAt: string;
};

const inputClass =
  "w-full bg-gray-900/50 border border-amber-900/30 rounded-lg px-4 py-2 text-gray-200 outline-none focus:border-amber-500";

const getStatusCapitalized = (status: string): "Pending" | "Approved" | "Rejected" =>
  (status.charAt(0).toUpperCase() + status.slice(1)) as "Pending" | "Approved" | "Rejected";

export default function ContributePage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [title, setTitle] = useState("");
  const [monastery, setMonastery] = useState(MONASTERIES[0]);
  const [type, setType] = useState(TYPES[0].key);
  const [year, setYear] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (event) => setImagePreview(event.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const reset = () => {
    setTitle("");
    setYear("");
    setLocation("");
    setDescription("");
    setTags([]);
    setFile(null);
    setImagePreview(null);
    setMonastery(MONASTERIES[0]);
    setType(TYPES[0].key);
  };

  const handleSubmit = async () => {
    if (!file || !title || !location) {
      setError("Please add an image, title, and location.");
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
      formData.append("description", description);
      formData.append("tags", tags.join(","));
      formData.append("file", file);

      const res = await fetch(`${API_URL}/api/submissions`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setExtractedText(data.submission.ocrText);
      reset();
      loadMine();
    } catch {
      setError("Submission failed. Is the backend running?");
    }
    setSubmitting(false);
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2d1810] via-[#3d1f10] to-[#2d1810] flex items-center justify-center px-4">
        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white font-poppins mb-2">Contribute to the archive</h1>
          <p className="text-gray-300 mb-6">You need an account to submit artifacts for review.</p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium transition">
              Log in
            </Link>
            <Link href="/register" className="px-4 py-2 rounded-lg border border-amber-600 text-amber-200 hover:bg-amber-900/30 transition">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2d1810] via-[#3d1f10] to-[#2d1810]">
      <header className="bg-[#0c3b44] text-white py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo web.png" alt="Logo" className="h-10 w-10 object-contain" />
            <span className="font-poppins text-xl">Sangha</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm hidden sm:inline">{user?.name}</span>
            <button
              onClick={async () => {
                await logout();
                router.push("/");
              }}
              className="text-sm px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-lg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white font-poppins">Contribute an Artifact</h1>
              <p className="text-amber-200 text-lg mt-1">Help grow the Digital Archive</p>
            </div>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed mt-6">
            Submit a photo of a mural, thangka, or manuscript. It runs through the same BDRC-based OCR
            pipeline used across the archive, then queues for admin review — nothing you submit is
            published automatically.
          </p>
        </div>

        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-semibold text-amber-200 mb-4">Photo Contribution Guidelines</h3>
          <ul className="space-y-3 text-gray-300">
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong className="text-white">Quality:</strong> Clear, well-lit images without blur or distortion</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong className="text-white">Content:</strong> Focus on architectural details, artifacts, murals, and manuscripts</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong className="text-white">Metadata:</strong> Include monastery, location, and a brief description of the subject</span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 font-bold">•</span>
              <span><strong className="text-white">Rights:</strong> You must own full rights to the image and grant permission for archival use</span>
            </li>
          </ul>
        </div>

        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6 mb-6">
          <h3 className="text-xl font-semibold text-amber-200 mb-4">Upload Image</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
          >
            Choose Image
          </button>
          {imagePreview && (
            <div className="mt-4">
              <img src={imagePreview} alt="Preview" className="max-w-full h-auto rounded-lg border border-amber-900/50" />
            </div>
          )}
        </div>

        <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-amber-200 mb-4 flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            Artifact Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputClass}
                placeholder="e.g., Tashiding Monastery Mural"
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Monastery *</label>
              <select value={monastery} onChange={(e) => setMonastery(e.target.value)} className={inputClass}>
                {MONASTERIES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Type *</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
                {TYPES.map((t) => (
                  <option key={t.key} value={t.key}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className={inputClass}
                placeholder="e.g., 17th century"
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Location *</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={inputClass}
                placeholder="e.g., West Sikkim"
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`${inputClass} resize-y`}
                rows={3}
                placeholder="Notes for the reviewer (optional)"
              />
            </div>

            <div>
              <label className="block text-amber-200 text-sm font-semibold mb-2">Tags</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  className={`flex-1 ${inputClass}`}
                  placeholder="Add tag and press Enter"
                />
                <button
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-amber-600/30 border border-amber-600 rounded-full text-amber-200 text-sm"
                  >
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-white">×</button>
                  </span>
                ))}
              </div>
            </div>

            {error && <p className="text-red-300 text-sm">{error}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors"
            >
              {submitting ? "Uploading & running OCR…" : "Submit for Review"}
            </button>
          </div>
        </div>

        {extractedText && (
          <div className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold text-amber-200 mb-4">Extracted Text</h3>
            <pre className="bg-gray-900/50 border border-amber-900/30 rounded-lg p-4 text-gray-200 whitespace-pre-wrap font-mono text-sm max-h-64 overflow-y-auto">
              {extractedText}
            </pre>
            <p className="text-gray-400 text-xs mt-2">Submitted — an admin will review it soon.</p>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white font-poppins mt-12 mb-4">Your Submissions</h2>
        {mineLoading ? (
          <p className="text-gray-300">Loading…</p>
        ) : mine.length === 0 ? (
          <p className="text-gray-300">You haven&apos;t submitted anything yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {mine.map((s) => (
              <li key={s.id} className="bg-[rgba(41,24,10,0.8)] border border-amber-900/30 rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-white font-medium">{s.title}</p>
                    <p className="text-xs text-gray-400">
                      {s.monastery} • {s.type} • {new Date(s.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <StatusBadge status={getStatusCapitalized(s.status)} />
                </div>
                {s.status === "rejected" && s.reviewNote && (
                  <p className="mt-2 text-xs text-red-300">Reviewer note: {s.reviewNote}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
