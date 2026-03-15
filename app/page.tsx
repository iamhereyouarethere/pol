'use client';
import { useState, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import LiveRadar from '@/components/LiveRadar';
import MatchInfo from '@/components/MatchInfo';
import CompetitorWatch from '@/components/CompetitorWatch';
import ReadyTweets from '@/components/ReadyTweets';
import LiveVideoScripts from '@/components/LiveVideoScripts';
import Settings from '@/components/Settings';
import { FeedItem } from '@/lib/feedConfig';

type Section = 'radar' | 'match' | 'competitors' | 'tweets' | 'scripts' | 'settings';

export default function Home() {
  const [activeSection, setActiveSection] = useState<Section>('radar');
  const [selectedNews, setSelectedNews] = useState<FeedItem | null>(null);
  const [urgentCount, setUrgentCount] = useState(0);

  const handleSelectNews = useCallback((item: FeedItem) => {
    setSelectedNews(item);
    // Navigate to tweets by default; user can switch to scripts from there
    setActiveSection('tweets');
  }, []);

  const handleRadarLoad = useCallback((count: number) => {
    setUrgentCount(count);
  }, []);

  const sectionTitles: Record<Section, string> = {
    radar: 'Live Radar',
    match: 'Match Info',
    competitors: 'Competitor Watch',
    tweets: 'Ready Tweets',
    scripts: 'Video Scripts',
    settings: 'Settings',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar active={activeSection} onChange={setActiveSection} urgentCount={urgentCount} />

      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px' }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Forza Cricket</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{sectionTitles[activeSection]}</span>

          {/* Selected news chip */}
          {selectedNews && (activeSection === 'tweets' || activeSection === 'scripts') && (
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Working on:</span>
              <div style={{
                maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                padding: '4px 10px', background: 'var(--accent-glow)', border: '1px solid rgba(22,163,74,0.2)',
                borderRadius: '6px', fontSize: '12px', color: 'var(--accent-light)',
              }}>
                {selectedNews.title}
              </div>
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '16px', padding: '0 4px' }}
                onClick={() => setSelectedNews(null)}
                title="Clear selection"
              >×</button>
            </div>
          )}
        </div>

        {/* Section switcher for content generation */}
        {(activeSection === 'tweets' || activeSection === 'scripts') && (
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '10px', width: 'fit-content' }}>
            <button className={`tab ${activeSection === 'tweets' ? 'active' : ''}`} onClick={() => setActiveSection('tweets')}>
              ✍ Ready Tweets
            </button>
            <button className={`tab ${activeSection === 'scripts' ? 'active' : ''}`} onClick={() => setActiveSection('scripts')}>
              🎬 Video Scripts
            </button>
          </div>
        )}

        {/* Content */}
        {activeSection === 'radar' && (
          <LiveRadar
            onSelectNews={handleSelectNews}
          />
        )}
        {activeSection === 'match' && <MatchInfo />}
        {activeSection === 'competitors' && <CompetitorWatch />}
        {activeSection === 'tweets' && <ReadyTweets selectedNews={selectedNews} />}
        {activeSection === 'scripts' && <LiveVideoScripts selectedNews={selectedNews} />}
        {activeSection === 'settings' && <Settings />}
      </main>
    </div>
  );
}
