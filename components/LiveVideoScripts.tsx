'use client';
import { useState } from 'react';
import { FeedItem } from '@/lib/feedConfig';

interface ScriptSection {
  heading: string;
  script: string;
  duration: string;
}

interface Script {
  title: string;
  duration: string;
  hook: string;
  sections: ScriptSection[];
  callToAction: string;
  keywords: string[];
}

interface AiBrief {
  title: string;
  visualStyle: string;
  onScreenText: string[];
  voiceover: string;
  thumbnail: string;
  postingTime: string;
  platforms: string[];
}

interface FeedbackEntry {
  content: string;
  reason: string;
  timestamp: string;
}

const SCRIPT_FEEDBACK_KEY = 'forza_script_feedback';

function loadFeedback(): FeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(SCRIPT_FEEDBACK_KEY) || '[]'); }
  catch { return []; }
}

function saveFeedback(entries: FeedbackEntry[]) {
  localStorage.setItem(SCRIPT_FEEDBACK_KEY, JSON.stringify(entries.slice(-30)));
}

interface Props {
  selectedNews: FeedItem | null;
}

export default function LiveVideoScripts({ selectedNews }: Props) {
  const [tab, setTab] = useState<'live' | 'ai'>('live');
  const [script, setScript] = useState<Script | null>(null);
  const [aiBrief, setAiBrief] = useState<AiBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [rejected, setRejected] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [approved, setApproved] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async (type: 'script' | 'ai_video_brief') => {
    if (!selectedNews) return;
    setLoading(true);
    setError('');
    setScript(null);
    setAiBrief(null);
    setRejected(false);
    setApproved(false);
    setShowRejectForm(false);

    try {
      const feedback = loadFeedback();
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, newsItem: selectedNews, feedback }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (type === 'script') setScript(data.result);
      else setAiBrief(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return;
    const content = script?.title || aiBrief?.title || '';
    const feedback = loadFeedback();
    feedback.push({ content, reason: rejectReason.trim(), timestamp: new Date().toISOString() });
    saveFeedback(feedback);
    setRejected(true);
    setShowRejectForm(false);
  };

  const copyScript = () => {
    if (!script) return;
    const text = [
      `# ${script.title}`,
      `Duration: ${script.duration}`,
      `\n🎬 HOOK:\n${script.hook}`,
      ...script.sections.map(s => `\n## ${s.heading} (${s.duration})\n${s.script}`),
      `\n📣 CALL TO ACTION:\n${script.callToAction}`,
    ].join('\n');
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Video Content</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            Live presenter scripts and AI video briefs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
          <button className={`tab ${tab === 'live' ? 'active' : ''}`} onClick={() => setTab('live')}>🎙 Live Script</button>
          <button className={`tab ${tab === 'ai' ? 'active' : ''}`} onClick={() => setTab('ai')}>🤖 AI Video Brief</button>
        </div>
      </div>

      {/* Source story */}
      {selectedNews ? (
        <div className="card" style={{ borderColor: 'var(--accent)', background: 'var(--accent-glow)' }}>
          <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--accent-light)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Source Story
          </p>
          <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px' }}>{selectedNews.title}</p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" onClick={() => generate(tab === 'live' ? 'script' : 'ai_video_brief')} disabled={loading}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Generating…</> : `✨ Generate ${tab === 'live' ? 'Script' : 'AI Brief'}`}
            </button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🎬</p>
          <p style={{ margin: 0 }}>Select a story from Live Radar to generate a script</p>
        </div>
      )}

      {error && (
        <div style={{ padding: '14px', background: 'var(--urgent-bg)', border: '1px solid var(--urgent)', borderRadius: '10px', color: '#f87171', fontSize: '14px' }}>
          ⚠ {error}
        </div>
      )}

      {/* Live Script */}
      {script && tab === 'live' && !rejected && (
        <div className="card animate-slide-in" style={{ borderColor: approved ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>{script.title}</h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span>⏱ {script.duration}</span>
                <span>🔑 {script.keywords.join(', ')}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className="btn-primary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={copyScript}>
                {copied ? '✓ Copied' : '📋 Copy'}
              </button>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', borderColor: approved ? 'var(--accent)' : '', color: approved ? 'var(--accent-light)' : '' }}
                onClick={() => setApproved(true)}
              >
                {approved ? '✓ Approved' : '✓ Approve'}
              </button>
              <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => setShowRejectForm(true)}>
                ✕ Reject
              </button>
            </div>
          </div>

          {/* Hook */}
          <div style={{ padding: '14px', background: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'var(--accent-light)', fontWeight: 700, textTransform: 'uppercase' }}>🎬 Opening Hook</p>
            <p style={{ margin: 0, fontSize: '15px', fontStyle: 'italic', lineHeight: 1.6 }}>"{script.hook}"</p>
          </div>

          {/* Sections */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {script.sections.map((section, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: '10px', overflow: 'hidden' }}>
                <button
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}
                  onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                >
                  <span>{section.heading}</span>
                  <span style={{ display: 'flex', gap: '12px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>⏱ {section.duration}</span>
                    <span>{expandedSection === i ? '▲' : '▼'}</span>
                  </span>
                </button>
                {expandedSection === i && (
                  <div style={{ padding: '14px', background: 'var(--bg-card)' }}>
                    <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{section.script}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ padding: '14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px', marginTop: '12px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>📣 Call to Action</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6 }}>{script.callToAction}</p>
          </div>

          {/* Reject form */}
          {showRejectForm && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Why are you rejecting this script? (Claude will learn from your feedback)
              </p>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Script is too dry, needs more energy. Avoid cricket jargon in intro."
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ marginBottom: '8px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-danger" disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>Confirm Rejection</button>
                <button className="btn-secondary" onClick={() => setShowRejectForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* AI Video Brief */}
      {aiBrief && tab === 'ai' && !rejected && (
        <div className="card animate-slide-in" style={{ borderColor: approved ? 'var(--accent)' : 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{aiBrief.title}</h3>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', borderColor: approved ? 'var(--accent)' : '', color: approved ? 'var(--accent-light)' : '' }}
                onClick={() => setApproved(true)}
              >
                {approved ? '✓ Approved' : '✓ Approve'}
              </button>
              <button className="btn-danger" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => setShowRejectForm(true)}>
                ✕ Reject
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <InfoBlock icon="🎨" label="Visual Style" text={aiBrief.visualStyle} />
            <InfoBlock icon="🖼" label="Thumbnail Concept" text={aiBrief.thumbnail} />
            <InfoBlock icon="🕐" label="Best Posting Time" text={aiBrief.postingTime} />
            <InfoBlock icon="📱" label="Platforms" text={aiBrief.platforms.join(', ')} />
          </div>

          {aiBrief.onScreenText.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>📺 On-Screen Text</p>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {aiBrief.onScreenText.map((text, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '13px' }}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '12px', padding: '14px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '10px' }}>
            <p style={{ margin: '0 0 6px', fontSize: '11px', color: '#60a5fa', fontWeight: 700, textTransform: 'uppercase' }}>🎙 Voiceover Script</p>
            <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7 }}>{aiBrief.voiceover}</p>
          </div>

          {showRejectForm && (
            <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Why are you rejecting this brief? (Claude will learn)
              </p>
              <textarea
                className="input"
                rows={3}
                placeholder="e.g. Wrong visual style, posting time doesn't make sense for our audience…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                style={{ marginBottom: '8px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn-danger" disabled={!rejectReason.trim()} onClick={handleRejectConfirm}>Confirm Rejection</button>
                <button className="btn-secondary" onClick={() => setShowRejectForm(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {rejected && (
        <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
          <p>Feedback saved. Claude will learn from this for future generations.</p>
          <button className="btn-secondary" onClick={() => generate(tab === 'live' ? 'script' : 'ai_video_brief')} disabled={loading}>
            ↻ Regenerate
          </button>
        </div>
      )}
    </div>
  );
}

function InfoBlock({ icon, label, text }: { icon: string; label: string; text: string }) {
  return (
    <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{icon} {label}</p>
      <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
