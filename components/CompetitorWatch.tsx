'use client';
import { useState, useEffect, useCallback } from 'react';
import { CompetitorItem, COMPETITORS } from '@/lib/feedConfig';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function TypeBadge({ type, ytFormat }: { type: string; ytFormat?: string }) {
  if (type === 'youtube') {
    return ytFormat === 'YT Short'
      ? <span className="badge badge-short">▶ YT Short</span>
      : <span className="badge badge-longform">▶ Long Form</span>;
  }
  if (type === 'twitter') return <span className="badge badge-twitter">𝕏 X</span>;
  return <span className="badge badge-website">🌐 Website</span>;
}

function CompetitorBadge({ name }: { name: string }) {
  const colors: Record<string, string> = {
    'Cricbuzz': 'rgba(234,179,8,0.15)',
    'ESPN Cricinfo': 'rgba(59,130,246,0.15)',
    'Sportskeeda Cricket': 'rgba(249,115,22,0.15)',
    'Crictracker': 'rgba(168,85,247,0.15)',
  };
  const textColors: Record<string, string> = {
    'Cricbuzz': '#facc15',
    'ESPN Cricinfo': '#60a5fa',
    'Sportskeeda Cricket': '#fb923c',
    'Crictracker': '#c084fc',
  };
  return (
    <span className="badge" style={{ background: colors[name] || 'var(--bg-hover)', color: textColors[name] || 'var(--text-secondary)', border: `1px solid ${textColors[name] || 'var(--border)'}40` }}>
      {name}
    </span>
  );
}

export default function CompetitorWatch() {
  const [items, setItems] = useState<CompetitorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState('');
  const [viewMode, setViewMode] = useState<'all' | 'by-source' | 'by-competitor'>('all');
  const [filterCompetitor, setFilterCompetitor] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');

  const fetchCompetitors = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/competitors');
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
    fetchCompetitors();
    const interval = setInterval(fetchCompetitors, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCompetitors]);

  const filtered = items.filter(item => {
    if (filterCompetitor !== 'all' && item.competitor !== filterCompetitor) return false;
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (search && !item.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const renderItem = (item: CompetitorItem) => (
    <div key={item.id} className="card animate-slide-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <CompetitorBadge name={item.competitor} />
            <TypeBadge type={item.type} ytFormat={item.ytFormat} />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
              {timeAgo(item.pubDate)}
            </span>
          </div>
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px', lineHeight: 1.4 }}
          >
            {item.title}
          </a>
        </div>
      </div>
    </div>
  );

  const groupByCompetitor = () => {
    const groups: Record<string, CompetitorItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.competitor]) groups[item.competitor] = [];
      groups[item.competitor].push(item);
    });
    return groups;
  };

  const groupByType = () => {
    const groups: Record<string, CompetitorItem[]> = {};
    filtered.forEach(item => {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    });
    return groups;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>Competitor Watch</h2>
          <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
            {lastFetch ? `Updated ${timeAgo(lastFetch)}` : 'Loading…'} · {items.length} items tracked
          </p>
        </div>
        <button className="btn-secondary" onClick={fetchCompetitors} disabled={loading}>
          {loading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : '↻'} Refresh
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input"
          style={{ width: '180px' }}
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px' }}>
          {(['all', 'by-competitor', 'by-source'] as const).map(mode => (
            <button key={mode} className={`tab ${viewMode === mode ? 'active' : ''}`} onClick={() => setViewMode(mode)}>
              {mode === 'all' ? 'All' : mode === 'by-competitor' ? 'By Competitor' : 'By Source'}
            </button>
          ))}
        </div>
        <select
          className="input"
          style={{ width: '160px' }}
          value={filterCompetitor}
          onChange={e => setFilterCompetitor(e.target.value)}
        >
          <option value="all">All Competitors</option>
          {COMPETITORS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          className="input"
          style={{ width: '130px' }}
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="all">All Platforms</option>
          <option value="website">Website</option>
          <option value="twitter">X / Twitter</option>
          <option value="youtube">YouTube</option>
        </select>
      </div>

      {/* Content */}
      {loading && items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Tracking competitors…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No items found</div>
      ) : viewMode === 'all' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(renderItem)}
        </div>
      ) : viewMode === 'by-competitor' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupByCompetitor()).map(([competitor, citems]) => (
            <div key={competitor}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <CompetitorBadge name={competitor} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{citems.length} items</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {citems.map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {Object.entries(groupByType()).map(([type, citems]) => (
            <div key={type}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <TypeBadge type={type} />
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{citems.length} items</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {citems.map(renderItem)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
