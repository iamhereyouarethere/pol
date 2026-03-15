'use client';
import { useState, useEffect, useCallback } from 'react';
import { FeedItem } from '@/lib/feedConfig';

interface Props {
  onSelectNews: (item: FeedItem) => void;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function SourceBadge({ source }: { source: string }) {
  const cls = source === 'reddit' ? 'badge-reddit' : source === 'google' ? 'badge-google' : 'badge-toi';
  const label = source === 'reddit' ? 'Reddit' : source === 'google' ? 'Google' : 'TOI';
  return <span className={`badge ${cls}`}>{label}</span>;
}

export default function LiveRadar({ onSelectNews }: Props) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'urgent'>('all');
  const [search, setSearch] = useState('');

  const fetchFeeds = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/feeds');
      const data = await res.json();
      setItems(data.items || []);
      setLastFetch(data.fetchedAt || '');
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeeds();
    const interval = setInterval(fetchFeeds, 5 * 60 * 1000); // refresh every 5 min
    return () => clearInterval(interval);
  }, [fetchFeeds]);

  const filtered = items.filter(item => {
    if (filter === 'urgent' && !item.isUrgent) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const urgentCount = items.filter(i => i.isUrgent).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Live Radar</h2>
            <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
              {lastFetch ? `Updated ${timeAgo(lastFetch)}` : 'Loading…'}
              {' · '}
              {items.length} stories
              {urgentCount > 0 && (
                <span style={{ color: '#f87171', marginLeft: '6px' }}>· {urgentCount} urgent</span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            className="input"
            style={{ width: '200px' }}
            placeholder="Search news…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
          <button className={`tab ${filter === 'urgent' ? 'active' : ''}`} onClick={() => setFilter('urgent')}
            style={filter !== 'urgent' ? { color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' } : {}}>
            🔥 Urgent {urgentCount > 0 && `(${urgentCount})`}
          </button>
          <button className="btn-secondary" onClick={fetchFeeds} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '↻'} Refresh
          </button>
        </div>
      </div>

      {/* Items */}
      {loading && items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Scanning live feeds…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          No stories found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(item => (
            <div
              key={item.id}
              className={`card ${item.isUrgent ? 'card-urgent animate-pulse-urgent' : ''} animate-slide-in`}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                    {item.isUrgent && <span className="badge badge-urgent">🔴 Breaking</span>}
                    <SourceBadge source={item.source} />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.label}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
                      {timeAgo(item.pubDate)}
                    </span>
                  </div>
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '15px', lineHeight: 1.4 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {item.title}
                  </a>
                  {item.summary && (
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {item.summary}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                  <button
                    className="btn-primary"
                    style={{ fontSize: '12px', padding: '6px 10px', whiteSpace: 'nowrap' }}
                    onClick={() => onSelectNews(item)}
                  >
                    ✍ Generate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
