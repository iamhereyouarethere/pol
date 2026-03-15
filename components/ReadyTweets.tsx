'use client';
import { useState } from 'react';
import { FeedItem } from '@/lib/feedConfig';

interface Tweet {
  text: string;
  hashtags: string[];
}

interface FeedbackEntry {
  content: string;
  reason: string;
  timestamp: string;
}

interface Props {
  selectedNews: FeedItem | null;
}

const FEEDBACK_KEY = 'forza_tweet_feedback';

function loadFeedback(): FeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || '[]');
  } catch { return []; }
}

function saveFeedback(entries: FeedbackEntry[]) {
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(entries.slice(-50))); // keep last 50
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

export default function ReadyTweets({ selectedNews }: Props) {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [rejectingIdx, setRejectingIdx] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvedIdx, setApprovedIdx] = useState<Set<number>>(new Set());
  const [rejectedIdx, setRejectedIdx] = useState<Set<number>>(new Set());

  const generate = async () => {
    if (!selectedNews) return;
    setLoading(true);
    setError('');
    setTweets([]);
    setApprovedIdx(new Set());
    setRejectedIdx(new Set());

    try {
      const feedback = loadFeedback();
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'tweets', newsItem: selectedNews, feedback }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setTweets(data.result.tweets || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate tweets');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (tweet: Tweet, idx: number) => {
    const fullText = `${tweet.text} ${tweet.hashtags.join(' ')}`;
    copyToClipboard(fullText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleApprove = (idx: number) => {
    setApprovedIdx(prev => new Set([...prev, idx]));
    setRejectedIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
  };

  const handleRejectStart = (idx: number) => {
    setRejectingIdx(idx);
    setRejectReason('');
  };

  const handleRejectConfirm = (tweet: Tweet, idx: number) => {
    if (!rejectReason.trim()) return;
    const feedback = loadFeedback();
    feedback.push({
      content: tweet.text,
      reason: rejectReason.trim(),
      timestamp: new Date().toISOString(),
    });
    saveFeedback(feedback);
    setRejectedIdx(prev => new Set([...prev, idx]));
    setApprovedIdx(prev => { const n = new Set(prev); n.delete(idx); return n; });
    setRejectingIdx(null);
    setRejectReason('');
  };

  const charCount = (tweet: Tweet) =>
    `${tweet.text} ${tweet.hashtags.join(' ')}`.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Ready Tweets</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            AI-generated tweets ready to post — approve, copy, or reject with feedback
          </p>
        </div>
      </div>

      {/* Selected news */}
      {selectedNews ? (
        <div className="card" style={{ borderColor: 'var(--accent)', background: 'var(--accent-glow)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--accent-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Source Story
          </p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '14px' }}>{selectedNews.title}</p>
          <button
            className="btn-primary"
            style={{ marginTop: '12px' }}
            onClick={generate}
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : '✨ Generate Tweets'}
          </button>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📰</p>
          <p style={{ margin: 0 }}>Select a story from Live Radar and click Generate to create tweets</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', background: 'var(--urgent-bg)', border: '1px solid var(--urgent)', borderRadius: '10px', color: '#f87171', fontSize: '14px' }}>
          ⚠ {error}
        </div>
      )}

      {/* Tweet cards */}
      {tweets.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tweets.map((tweet, idx) => {
            const isApproved = approvedIdx.has(idx);
            const isRejected = rejectedIdx.has(idx);
            const isRejecting = rejectingIdx === idx;
            const chars = charCount(tweet);

            return (
              <div
                key={idx}
                className="card animate-slide-in"
                style={{
                  borderColor: isApproved ? 'var(--accent)' : isRejected ? 'var(--urgent)' : 'var(--border)',
                  background: isApproved ? 'var(--accent-glow)' : isRejected ? 'var(--urgent-bg)' : 'var(--bg-card)',
                  opacity: isRejected ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 8px', fontSize: '15px', lineHeight: 1.5 }}>{tweet.text}</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {tweet.hashtags.map(tag => (
                        <span key={tag} style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 500 }}>{tag}</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: chars > 280 ? '#f87171' : 'var(--text-muted)' }}>
                      {chars}/280 chars
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    {!isRejected && (
                      <>
                        <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => handleCopy(tweet, idx)}>
                          {copiedIdx === idx ? '✓ Copied!' : '📋 Copy'}
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 10px', borderColor: isApproved ? 'var(--accent)' : '', color: isApproved ? 'var(--accent-light)' : '' }}
                          onClick={() => handleApprove(idx)}
                        >
                          {isApproved ? '✓ Approved' : '✓ Approve'}
                        </button>
                        <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => handleRejectStart(idx)}>
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {isRejected && (
                      <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>✕ Rejected</span>
                    )}
                  </div>
                </div>

                {/* Rejection form */}
                {isRejecting && (
                  <div style={{ marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Why are you rejecting this tweet? (This helps Claude learn your style)
                    </p>
                    <textarea
                      className="input"
                      rows={2}
                      placeholder="e.g. Too generic, not engaging enough, wrong tone…"
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      style={{ marginBottom: '8px', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn-danger"
                        disabled={!rejectReason.trim()}
                        onClick={() => handleRejectConfirm(tweet, idx)}
                      >
                        Confirm Rejection
                      </button>
                      <button className="btn-secondary" onClick={() => setRejectingIdx(null)}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Regenerate hint */}
          <div style={{ textAlign: 'center' }}>
            <button className="btn-secondary" onClick={generate} disabled={loading}>
              ↻ Regenerate (learns from rejections)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
