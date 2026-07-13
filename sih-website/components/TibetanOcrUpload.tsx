"use client";
import React, { useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function TibetanOcrUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setText(null);
    setError(null);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    if (!file) {
      setError("Please choose an image first.");
      return;
    }
    setLoading(true);
    setError(null);
    setText(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_URL}/ocr/extract`, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setText(data.text);
    } catch {
      setError("OCR failed. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-extrabold mb-2" style={{ color: "#5B2C2C" }}>
        Tibetan OCR
      </h1>
      <p className="text-sm mb-8" style={{ color: "#2F3A3D" }}>
        Upload a photo of Tibetan manuscript or printed text. This reads it with trained
        recognition models (from BDRC&apos;s digitized manuscript archive) rather than an AI
        guessing from a general image description — validated at 96%+ character accuracy
        against real historical text. Works best on lines of running text; single carved
        inscriptions or stone mantras may be less reliable.
      </p>

      <div
        className="rounded-2xl p-6 border"
        style={{ background: "#F8F4EA", borderColor: "#D4AF37", boxShadow: "0 12px 36px rgba(0,0,0,0.12)" }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="hidden"
        />

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-4 py-2 rounded-xl shadow-sm pop-btn font-medium"
            style={{ border: "1px solid #D4AF37", color: "#5B2C2C", background: "white" }}
          >
            Upload
          </button>
        </div>
        {file && (
          <div className="mt-2 text-sm text-center" style={{ color: "#2F3A3D" }}>
            {file.name}
          </div>
        )}

        {preview && (
          <div className="flex flex-col items-center">
            <img
              src={preview}
              alt="Selected"
              className="mt-4 max-h-80 rounded-xl border"
              style={{ borderColor: "#E8E2D6" }}
            />
            <button
              onClick={submit}
              disabled={!file || loading}
              className="mt-4 inline-flex items-center px-5 py-2 rounded-xl shadow-sm pop-btn font-medium disabled:opacity-50"
              style={{ background: "#5B2C2C", color: "white" }}
            >
              {loading ? "Running OCR…" : "Extract Text"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 text-sm" style={{ color: "#b91c1c" }}>
            {error}
          </div>
        )}

        {text !== null && (
          <div className="mt-6">
            <h3 className="font-medium mb-2" style={{ color: "#2F3A3D" }}>
              Result
            </h3>
            <div
              className="rounded-xl p-4 text-lg whitespace-pre-wrap"
              style={{ background: "white", color: "#2F3A3D", border: "1px solid #E8E2D6" }}
            >
              {text || "NO_TEXT_DETECTED"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
