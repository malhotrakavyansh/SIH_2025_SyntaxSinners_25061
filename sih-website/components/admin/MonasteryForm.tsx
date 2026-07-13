'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from './StatusBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  history: 'History',
  architecture: 'Architecture',
  rituals: 'Rituals',
  bestVisitTime: 'Best Visit Time',
  travelInfo: 'Travel Info',
};

export type MonasteryFormData = {
  name: string;
  slug: string;
  location: string;
  altitude: string;
  founded: string;
  shortDescription: string;
  heroImageUrl: string;
  gallery: string[];
  sections: Record<string, string>;
  historicalPeriod: string;
  sourceReferences: string;
  isPublished: boolean;
};

const EMPTY_FORM: MonasteryFormData = {
  name: '',
  slug: '',
  location: '',
  altitude: '',
  founded: '',
  shortDescription: '',
  heroImageUrl: '',
  gallery: [''],
  sections: { overview: '', history: '', architecture: '', rituals: '', bestVisitTime: '', travelInfo: '' },
  historicalPeriod: '',
  sourceReferences: '',
  isPublished: false,
};

export default function MonasteryForm({
  monasteryId,
  initialData,
}: {
  monasteryId?: string;
  initialData?: MonasteryFormData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<MonasteryFormData>(initialData ?? EMPTY_FORM);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationStatus, setConfirmationStatus] = useState<'Draft' | 'Published'>('Draft');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<{
    approved: boolean;
    verdict: string;
    reason: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, name, slug: prev.slug || generateSlug(name) }));
  };

  const addGalleryImage = () => setFormData((prev) => ({ ...prev, gallery: [...prev.gallery, ''] }));
  const updateGalleryImage = (index: number, value: string) =>
    setFormData((prev) => {
      const gallery = [...prev.gallery];
      gallery[index] = value;
      return { ...prev, gallery };
    });
  const removeGalleryImage = (index: number) =>
    setFormData((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== index) }));

  const handleSave = async (status: 'Draft' | 'Published') => {
    if (!formData.name || !formData.location) {
      setError('Monastery name and location are required');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/verify-monastery`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          altitude: formData.altitude,
          founded: formData.founded,
          description: formData.shortDescription,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Verification failed');

      setVerificationResult(result.data);
      setConfirmationStatus(status);
      setShowConfirmation(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify monastery information');
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmSave = async () => {
    if (verificationResult && !verificationResult.approved) {
      setError('Cannot save: AI verification rejected the information');
      setShowConfirmation(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        name: formData.name,
        slug: formData.slug,
        location: formData.location,
        altitude: formData.altitude,
        founded: formData.founded,
        shortDescription: formData.shortDescription,
        heroImageUrl: formData.heroImageUrl,
        gallery: formData.gallery.filter((img) => img.trim()),
        sections: formData.sections,
        historicalPeriod: formData.historicalPeriod,
        sourceReferences: formData.sourceReferences,
        isPublished: confirmationStatus === 'Published',
      };

      const url = monasteryId
        ? `${API_URL}/api/admin/monasteries/${monasteryId}`
        : `${API_URL}/api/admin/monasteries`;
      const res = await fetch(url, {
        method: monasteryId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Failed to save monastery');

      setShowConfirmation(false);
      router.push('/admin/monasteries');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save monastery');
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const status: 'Draft' | 'Published' = formData.isPublished ? 'Published' : 'Draft';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-amber-50 mb-2" style={{ fontFamily: 'Poppins' }}>
            {monasteryId ? 'Edit Monastery' : 'Add New Monastery'}
          </h1>
          <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
            {monasteryId ? 'Update this monastery listing' : 'Create a new monastery listing'}
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-amber-800/50 hover:bg-amber-800/70 text-amber-100 font-medium transition"
          style={{ fontFamily: 'Poppins' }}
        >
          ← Back
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
            <h2 className="text-xl font-bold text-amber-50 mb-6" style={{ fontFamily: 'Poppins' }}>
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Monastery Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                  placeholder="Enter monastery name"
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>

              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                  placeholder="auto-generated-from-name"
                  style={{ fontFamily: 'Poppins' }}
                />
                <p className="text-sm text-amber-300 mt-1" style={{ fontFamily: 'Poppins' }}>
                  Auto-generated from name. Edit if needed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                    placeholder="e.g., Rumtek, Sikkim"
                    style={{ fontFamily: 'Poppins' }}
                  />
                </div>
                <div>
                  <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                    Altitude
                  </label>
                  <input
                    type="text"
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                    placeholder="e.g., 1,550 m"
                    style={{ fontFamily: 'Poppins' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Founded
                </label>
                <input
                  type="text"
                  value={formData.founded}
                  onChange={(e) => setFormData({ ...formData, founded: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                  placeholder="e.g., 1960"
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>

              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Short Description *
                </label>
                <textarea
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition resize-none"
                  placeholder="Brief description for listings and previews"
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>

              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Hero Image URL
                </label>
                <input
                  type="text"
                  value={formData.heroImageUrl}
                  onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                  placeholder="/monasteries/example.jpg"
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>

              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Gallery Images
                </label>
                <div className="space-y-2">
                  {formData.gallery.map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={img}
                        onChange={(e) => updateGalleryImage(i, e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-amber-800/40 border border-amber-700/50 text-amber-50 placeholder-amber-300/50 focus:outline-none focus:border-amber-600/50 transition"
                        placeholder="/monasteries/gallery-image.jpg"
                        style={{ fontFamily: 'Poppins' }}
                      />
                      <button
                        onClick={() => removeGalleryImage(i)}
                        className="px-3 rounded-lg bg-red-900/30 hover:bg-red-900/50 text-red-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addGalleryImage}
                    className="text-amber-300 text-sm hover:text-amber-200"
                    style={{ fontFamily: 'Poppins' }}
                  >
                    + Add image
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins' }}>
              Additional Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Historical Period
                </label>
                <select
                  value={formData.historicalPeriod}
                  onChange={(e) => setFormData({ ...formData, historicalPeriod: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-100 focus:outline-none focus:border-amber-500/50 transition"
                  style={{ fontFamily: 'Poppins' }}
                >
                  <option value="">Select a historical period...</option>
                  <option value="Ancient">Ancient (Before 1000 AD)</option>
                  <option value="Medieval">Medieval (1000-1500 AD)</option>
                  <option value="Early Modern">Early Modern (1500-1800 AD)</option>
                  <option value="Modern">Modern (1800-1950 AD)</option>
                  <option value="Contemporary">Contemporary (1950 AD onwards)</option>
                </select>
              </div>
              <div>
                <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                  Source References or Citations
                </label>
                <textarea
                  value={formData.sourceReferences}
                  onChange={(e) => setFormData({ ...formData, sourceReferences: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-500/50 transition resize-none"
                  placeholder="Add sources, citations, or references used for this information..."
                  style={{ fontFamily: 'Poppins' }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins' }}>
              Content Sections
            </h2>
            <div className="space-y-6">
              {Object.entries(SECTION_LABELS).map(([key, label]) => (
                <div key={key}>
                  <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                    {label}
                  </label>
                  <textarea
                    value={formData.sections[key] ?? ''}
                    onChange={(e) => setFormData({ ...formData, sections: { ...formData.sections, [key]: e.target.value } })}
                    rows={6}
                    className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-500/50 transition resize-none"
                    placeholder={`Enter ${label.toLowerCase()} content...`}
                    style={{ fontFamily: 'Poppins' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl p-6 backdrop-blur-sm sticky top-24" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
            <h2 className="text-xl font-bold text-amber-50 mb-6" style={{ fontFamily: 'Poppins' }}>
              Preview
            </h2>
            <div className="space-y-4">
              {formData.heroImageUrl && (
                <div className="w-full h-32 rounded-lg bg-cover bg-center" style={{ backgroundImage: `url(${formData.heroImageUrl})` }} />
              )}
              <div>
                <h3 className="text-lg font-bold text-amber-50 mb-1" style={{ fontFamily: 'Poppins' }}>
                  {formData.name || 'Monastery Name'}
                </h3>
                <p className="text-sm text-amber-200 mb-2" style={{ fontFamily: 'Poppins' }}>
                  {formData.location || 'Location'}
                </p>
                <StatusBadge status={status} />
              </div>
              {formData.shortDescription && (
                <p className="text-sm text-amber-200" style={{ fontFamily: 'Poppins' }}>{formData.shortDescription}</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
            <h2 className="text-xl font-bold text-amber-50 mb-6" style={{ fontFamily: 'Poppins' }}>
              Status
            </h2>
            {error && (
              <div className="mb-4 p-4 rounded-lg bg-red-950/60 border border-red-900/50 text-red-200">{error}</div>
            )}
            <div className="space-y-4">
              <select
                value={status}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.value === 'Published' })}
                className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-100 focus:outline-none focus:border-amber-500/50 transition"
                style={{ fontFamily: 'Poppins' }}
                disabled={loading}
              >
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
              </select>

              <div className="space-y-2">
                <button
                  onClick={() => handleSave(status)}
                  disabled={loading || isVerifying}
                  className="w-full px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-amber-50 font-bold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Poppins' }}
                >
                  {isVerifying ? 'Verifying with AI...' : loading ? 'Saving...' : status === 'Published' ? 'Save and Publish' : 'Save Monastery'}
                </button>
                <button
                  onClick={() => router.back()}
                  disabled={loading}
                  className="w-full px-4 py-3 rounded-lg bg-amber-800/50 hover:bg-amber-800/70 text-amber-100 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Poppins' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-2xl p-8 max-w-md w-full backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
            <h3 className="text-2xl font-bold text-amber-50 mb-4" style={{ fontFamily: 'Poppins' }}>
              Confirm {confirmationStatus === 'Published' ? 'Publishing' : 'Saving as Draft'}
            </h3>

            <div className="mb-6 p-4 rounded-lg bg-amber-800/30 border border-amber-700/50">
              <p className="text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}><strong>Monastery:</strong> {formData.name}</p>
              <p className="text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}><strong>Location:</strong> {formData.location}</p>
              <p className="text-amber-100" style={{ fontFamily: 'Poppins' }}><strong>Status:</strong> <StatusBadge status={confirmationStatus} /></p>
            </div>

            {confirmationStatus === 'Published' ? (
              <div className="mb-6 p-4 rounded-lg bg-green-900/40 border border-green-800/50">
                <p className="text-green-200 text-sm" style={{ fontFamily: 'Poppins' }}>
                  ✓ This monastery will be visible on the public site immediately after confirmation.
                </p>
              </div>
            ) : (
              <div className="mb-6 p-4 rounded-lg bg-blue-900/40 border border-blue-800/50">
                <p className="text-blue-200 text-sm" style={{ fontFamily: 'Poppins' }}>
                  ℹ This monastery will be saved as a draft and only visible in the admin dashboard.
                </p>
              </div>
            )}

            {verificationResult && (
              <div className={`mb-6 p-4 rounded-lg border ${verificationResult.approved ? 'bg-green-900/40 border-green-800/50' : 'bg-red-950/60 border-red-900/50'}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{verificationResult.approved ? '✓' : '✗'}</span>
                  <div className="flex-1">
                    <p className={`font-bold mb-2 ${verificationResult.approved ? 'text-green-200' : 'text-red-200'}`} style={{ fontFamily: 'Poppins' }}>
                      AI Verification: {verificationResult.verdict}
                    </p>
                    <p className={`text-sm ${verificationResult.approved ? 'text-green-200/90' : 'text-red-200/90'}`} style={{ fontFamily: 'Poppins' }}>
                      {verificationResult.reason}
                    </p>
                  </div>
                </div>
                {!verificationResult.approved && (
                  <p className="text-red-200 text-sm mt-3 font-semibold" style={{ fontFamily: 'Poppins' }}>
                    ⚠ You cannot save this monastery until the information is corrected.
                  </p>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={confirmSave}
                disabled={loading || (verificationResult !== null && !verificationResult.approved)}
                className="w-full px-4 py-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-amber-50 font-bold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Poppins' }}
              >
                {loading ? 'Saving...' : `Yes, ${confirmationStatus === 'Published' ? 'Publish' : 'Save as Draft'}`}
              </button>
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg bg-amber-800/50 hover:bg-amber-800/70 text-amber-100 font-semibold transition border border-amber-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: 'Poppins' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
