'use client';
import { useState } from 'react';

const FEEDBACK_KEYS = ['forza_tweet_feedback', 'forza_script_feedback'];

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const clearFeedback = (key: string) => {
    localStorage.removeItem(key);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const clearAllFeedback = () => {
    FEEDBACK_KEYS.forEach(k => localStorage.removeItem(k));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const getFeedbackCount = (key: string): number => {
    if (typeof window === 'undefined') return 0;
    try { return JSON.parse(localStorage.getItem(key) || '[]').length; }
    catch { return 0; }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Settings</h2>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
          Configure your Forza Cricket Content Machine
        </p>
      </div>

      {/* API Keys */}
      <Section title="🔑 API Keys" subtitle="Add your API keys to .env.local file in the project root">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <EnvRow
            name="ANTHROPIC_API_KEY"
            desc="Required for tweet and script generation. Get from console.anthropic.com"
            link="https://console.anthropic.com"
          />
          <EnvRow
            name="CRICAPI_KEY"
            desc="Optional. For live match scores. Free tier available at cricapi.com"
            link="https://cricapi.com"
          />
        </div>
        <div style={{ marginTop: '16px', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Example .env.local:</p>
          <pre style={{ margin: 0, fontFamily: 'monospace', lineHeight: 1.8, color: 'var(--accent-light)' }}>
{`ANTHROPIC_API_KEY=sk-ant-...
CRICAPI_KEY=your_key_here`}
          </pre>
        </div>
      </Section>

      {/* AI Learning */}
      <Section title="🧠 AI Learning & Feedback" subtitle="Claude learns from your rejections to improve future content">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <FeedbackRow
            label="Tweet Feedback"
            count={getFeedbackCount('forza_tweet_feedback')}
            onClear={() => clearFeedback('forza_tweet_feedback')}
          />
          <FeedbackRow
            label="Script Feedback"
            count={getFeedbackCount('forza_script_feedback')}
            onClear={() => clearFeedback('forza_script_feedback')}
          />
        </div>
        <div style={{ marginTop: '12px' }}>
          <button className="btn-danger" onClick={clearAllFeedback}>Clear All Feedback</button>
          {saved && <span style={{ marginLeft: '12px', fontSize: '13px', color: 'var(--accent-light)' }}>✓ Cleared</span>}
        </div>
        <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
          Note: Feedback is stored locally in your browser. Clearing it resets Claude's learning for content generation.
        </p>
      </Section>

      {/* Feed config info */}
      <Section title="📡 Live Feeds" subtitle="RSS feeds powering the Live Radar (auto-refreshes every 5 minutes)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          {[
            'Reddit r/cricket, r/IndiaCricket, r/cricketworldcup, r/ipl',
            'Google News: cricket, IPL, IndianPremierLeague, cricketindia',
            'Times of India Cricket',
          ].map((feed, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)', marginTop: '2px' }}>●</span>
              <span>{feed}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Competitor config */}
      <Section title="🔍 Competitor Watch" subtitle="Tracking competitors across platforms">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
          {[
            { competitor: 'Cricbuzz', platforms: ['Website RSS', 'X (Nitter)', 'YouTube'] },
            { competitor: 'ESPN Cricinfo', platforms: ['Website RSS', 'X (Nitter)', 'YouTube'] },
            { competitor: 'Sportskeeda Cricket', platforms: ['Google News', 'YouTube'] },
            { competitor: 'Crictracker', platforms: ['Website RSS', 'X (Nitter)', 'YouTube'] },
          ].map(({ competitor, platforms }) => (
            <div key={competitor} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontWeight: 600, width: '160px', color: 'var(--text-secondary)' }}>{competitor}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {platforms.map(p => (
                  <span key={p} className="badge badge-website" style={{ fontSize: '10px' }}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* About */}
      <Section title="ℹ️ About" subtitle="">
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          <strong style={{ color: 'var(--text-primary)' }}>Forza Cricket Content Machine</strong> — Built with Next.js, Claude AI, and live RSS feeds.
          <br />
          Powered by <strong style={{ color: 'var(--accent-light)' }}>Claude Sonnet 4.6</strong> for content generation.
          <br /><br />
          Content is generated fresh based on live news. The rejection feedback system teaches Claude your brand voice over time.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700 }}>{title}</h3>
      {subtitle && <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'var(--text-muted)' }}>{subtitle}</p>}
      <div className="card">{children}</div>
    </div>
  );
}

function EnvRow({ name, desc, link }: { name: string; desc: string; link: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <div style={{ flex: 1 }}>
        <code style={{ fontSize: '13px', color: 'var(--accent-light)', fontFamily: 'monospace', fontWeight: 600 }}>{name}</code>
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</p>
      </div>
      <a href={link} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}>
        Get Key ↗
      </a>
    </div>
  );
}

function FeedbackRow({ label, count, onClear }: { label: string; count: number; onClear: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
      <div>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{label}</span>
        <span style={{ marginLeft: '8px', fontSize: '12px', color: count > 0 ? 'var(--accent-light)' : 'var(--text-muted)' }}>
          {count} entries stored
        </span>
      </div>
      {count > 0 && (
        <button className="btn-danger" style={{ fontSize: '11px', padding: '4px 10px' }} onClick={onClear}>Clear</button>
      )}
    </div>
  );
}
