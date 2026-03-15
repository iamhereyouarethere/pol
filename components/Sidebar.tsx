'use client';

type Section = 'radar' | 'match' | 'competitors' | 'tweets' | 'scripts' | 'settings';

interface Props {
  active: Section;
  onChange: (s: Section) => void;
  urgentCount: number;
}

const NAV: { id: Section; icon: string; label: string }[] = [
  { id: 'radar', icon: '📡', label: 'Live Radar' },
  { id: 'match', icon: '🏏', label: 'Match Info' },
  { id: 'competitors', icon: '🔍', label: 'Competitor Watch' },
  { id: 'tweets', icon: '✍', label: 'Ready Tweets' },
  { id: 'scripts', icon: '🎬', label: 'Video Scripts' },
  { id: 'settings', icon: '⚙', label: 'Settings' },
];

export default function Sidebar({ active, onChange, urgentCount }: Props) {
  return (
    <aside style={{
      width: '220px',
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 12px',
      height: '100vh',
      position: 'sticky',
      top: 0,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '28px', paddingLeft: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{
            width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 900
          }}>F</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)', lineHeight: 1 }}>Forza Cricket</div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Content Machine</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {NAV.map(item => (
          <button
            key={item.id}
            className={`nav-item ${active === item.id ? 'active' : ''}`}
            onClick={() => onChange(item.id)}
          >
            <span style={{ fontSize: '16px' }}>{item.icon}</span>
            <span>{item.label}</span>
            {item.id === 'radar' && urgentCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: 'var(--urgent)', color: 'white',
                borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: 700
              }}>
                {urgentCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Status indicator */}
      <div style={{ paddingLeft: '4px', paddingBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 6px var(--accent)' }} />
          Live · Auto-refresh 5m
        </div>
      </div>
    </aside>
  );
}
