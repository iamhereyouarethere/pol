'use client';
import { useState, useEffect } from 'react';

interface Match {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  teams: string[];
  score: { r?: number; w?: number; o?: number; inning?: string }[];
  matchType: string;
}

export default function MatchInfo() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/match');
        const data = await res.json();
        setMatches(data.matches || []);
        setMessage(data.message || '');
      } catch {
        setMessage('Failed to load match data');
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
    const interval = setInterval(fetchMatches, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Match Info</h2>
        <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>Live and upcoming cricket matches</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Fetching live scores…</p>
        </div>
      ) : message && matches.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🏏</p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>{message}</p>
          <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '10px', textAlign: 'left', fontSize: '13px', color: 'var(--text-muted)' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Setup Instructions:</p>
            <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 2 }}>
              <li>Visit <a href="https://cricapi.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)' }}>cricapi.com</a> and get a free API key</li>
              <li>Add <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>CRICAPI_KEY=your_key</code> to your <code style={{ background: 'var(--bg-card)', padding: '2px 6px', borderRadius: '4px' }}>.env.local</code> file</li>
              <li>Restart the dev server</li>
            </ol>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No live matches at the moment
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
          {matches.map(match => (
            <div key={match.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span className="badge" style={{
                  background: match.status.toLowerCase().includes('live') || match.status.toLowerCase().includes('progress')
                    ? 'rgba(22,163,74,0.2)' : 'rgba(100,116,139,0.2)',
                  color: match.status.toLowerCase().includes('live') || match.status.toLowerCase().includes('progress')
                    ? 'var(--accent-light)' : 'var(--text-muted)',
                  border: '1px solid currentColor',
                }}>
                  {match.status.toLowerCase().includes('live') ? '● LIVE' : match.matchType?.toUpperCase() || 'MATCH'}
                </span>
              </div>
              <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '15px' }}>{match.name}</p>
              {match.venue && (
                <p style={{ margin: '0 0 6px', fontSize: '12px', color: 'var(--text-muted)' }}>📍 {match.venue}</p>
              )}
              {match.score && match.score.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px' }}>
                  {match.score.map((s, i) => (
                    <div key={i} style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                      {s.inning && <span style={{ marginRight: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>{s.inning}:</span>}
                      <span style={{ fontWeight: 600 }}>
                        {s.r !== undefined ? `${s.r}` : ''}
                        {s.w !== undefined ? `/${s.w}` : ''}
                        {s.o !== undefined ? ` (${s.o} ov)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>{match.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
