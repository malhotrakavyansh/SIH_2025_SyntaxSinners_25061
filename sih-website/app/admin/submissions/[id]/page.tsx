'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StatusBadge from '../../../../components/admin/StatusBadge';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type Submission = {
  id: string;
  contributorId: string;
  contributorName: string;
  title: string;
  monastery: string;
  type: string;
  year: string;
  location: string;
  description: string;
  imageFilename: string;
  ocrText: string;
  tags: string[];
  status: 'pending' | 'approved' | 'rejected';
  reviewNote: string | null;
  createdAt: string;
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/api/admin/submissions/${params.id}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Submission not found');
      const data = await res.json();
      setSubmission(data.submission);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) fetchSubmission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/submissions/${params.id}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to approve submission');
      router.push('/admin/submissions');
    } catch {
      alert('Failed to approve submission');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes) {
      alert('Please provide review notes before rejecting');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/submissions/${params.id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review_note: reviewNotes }),
      });
      if (!res.ok) throw new Error('Failed to reject submission');
      router.push('/admin/submissions');
    } catch {
      alert('Failed to reject submission');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl p-4 bg-red-950/60 border border-red-900/50 text-red-200">
          Error: {error}
        </div>
      )}

      {loading && (
        <div className="rounded-2xl p-6 backdrop-blur-sm bg-amber-900/40 border border-amber-800/50">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-amber-500 border-t-transparent"></div>
            <p className="text-amber-100" style={{ fontFamily: 'Poppins' }}>Loading submission...</p>
          </div>
        </div>
      )}

      {!loading && submission && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white" style={{ fontFamily: 'Poppins' }}>
                  {submission.title}
                </h1>
                <StatusBadge
                  status={(submission.status.charAt(0).toUpperCase() + submission.status.slice(1)) as 'Pending' | 'Approved' | 'Rejected'}
                  size="lg"
                />
              </div>
              <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
                Artifact Submission Review
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 text-amber-100 font-medium transition"
              style={{ fontFamily: 'Poppins' }}
            >
              ← Back to Submissions
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins' }}>Contributor Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Name</p>
                    <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.contributorName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Submitted On</p>
                    <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-6 backdrop-blur-sm" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins' }}>Submission Details</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-amber-100 mb-4" style={{ fontFamily: 'Poppins' }}>Basic Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-amber-900/20 rounded-lg p-4">
                        <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Monastery</p>
                        <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.monastery}</p>
                      </div>
                      <div className="bg-amber-900/20 rounded-lg p-4">
                        <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Location</p>
                        <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.location || 'Not provided'}</p>
                      </div>
                      <div className="bg-amber-900/20 rounded-lg p-4">
                        <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Type</p>
                        <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.type}</p>
                      </div>
                      <div className="bg-amber-900/20 rounded-lg p-4">
                        <p className="text-sm text-amber-300/70 mb-1" style={{ fontFamily: 'Poppins' }}>Year</p>
                        <p className="text-amber-100 font-medium" style={{ fontFamily: 'Poppins' }}>{submission.year || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {submission.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}>Description</h3>
                      <div className="bg-amber-900/20 rounded-lg p-4">
                        <p className="text-amber-200 leading-relaxed" style={{ fontFamily: 'Poppins' }}>{submission.description}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}>OCR Extracted Text</h3>
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <p className="text-amber-200 leading-relaxed whitespace-pre-wrap" style={{ fontFamily: 'Poppins' }}>{submission.ocrText}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}>Image</h3>
                    <div className="bg-amber-900/20 rounded-lg p-4">
                      <img
                        src={`${API_URL}/archive_uploads/${submission.imageFilename}`}
                        alt={submission.title}
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  </div>

                  {submission.tags.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-amber-100 mb-3" style={{ fontFamily: 'Poppins' }}>Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {submission.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-full text-sm bg-amber-600/30 text-amber-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl p-6 backdrop-blur-sm sticky top-24" style={{ background: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.2)' }}>
                <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins' }}>Review Actions</h2>

                <div className="space-y-4">
                  {submission.status === 'pending' ? (
                    <>
                      <div>
                        <label className="block text-amber-200 font-medium mb-2" style={{ fontFamily: 'Poppins' }}>
                          Review Notes
                        </label>
                        <textarea
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg bg-amber-900/30 border border-amber-500/30 text-amber-100 placeholder-amber-300/50 focus:outline-none focus:border-amber-500/50 transition resize-none"
                          placeholder="Required only if rejecting..."
                          style={{ fontFamily: 'Poppins' }}
                        />
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={handleApprove}
                          disabled={isProcessing}
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-bold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style={{ fontFamily: 'Poppins' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Approve
                        </button>

                        <button
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          style={{ fontFamily: 'Poppins' }}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Reject Submission
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-amber-200" style={{ fontFamily: 'Poppins' }}>
                      {submission.status === 'approved'
                        ? 'This submission has been approved and published to the Digital Archive.'
                        : `Rejected: ${submission.reviewNote || 'No reason given.'}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
