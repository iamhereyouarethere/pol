export const LIVE_RADAR_FEEDS = [
  { url: 'http://www.reddit.com/r/cricket/.rss', label: 'Reddit r/cricket', source: 'reddit' },
  { url: 'http://www.reddit.com/r/IndiaCricket/.rss', label: 'Reddit r/IndiaCricket', source: 'reddit' },
  { url: 'http://www.reddit.com/r/cricketworldcup/.rss', label: 'Reddit r/cricketworldcup', source: 'reddit' },
  { url: 'http://www.reddit.com/r/ipl/.rss', label: 'Reddit r/IPL', source: 'reddit' },
  { url: 'https://news.google.com/rss/search?q=cricket', label: 'Google News: Cricket', source: 'google' },
  { url: 'https://news.google.com/rss/search?q=IPL', label: 'Google News: IPL', source: 'google' },
  { url: 'https://news.google.com/rss/search?q=IndianPremierLeague', label: 'Google News: Indian Premier League', source: 'google' },
  { url: 'https://news.google.com/rss/search?q=cricketindia', label: 'Google News: Cricket India', source: 'google' },
  { url: 'http://timesofindia.indiatimes.com/rssfeeds/54829575.cms', label: 'Times of India Cricket', source: 'toi' },
];

export const COMPETITOR_FEEDS = {
  website: [
    { url: 'https://www.cricbuzz.com/cricket-news/rss', competitor: 'Cricbuzz', label: 'Cricbuzz Website', type: 'website' as const },
    { url: 'https://www.crictracker.com/feed/', competitor: 'Crictracker', label: 'Crictracker Website', type: 'website' as const },
    { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', competitor: 'ESPN Cricinfo', label: 'ESPN Cricinfo Website', type: 'website' as const },
    { url: 'https://www.espncricinfo.com/rss/content/story/feeds/6.xml', competitor: 'ESPN Cricinfo', label: 'ESPN Cricinfo Stories', type: 'website' as const },
    { url: 'https://news.google.com/rss/search?q=sportskeeda+cricket', competitor: 'Sportskeeda Cricket', label: 'Sportskeeda Cricket', type: 'website' as const },
  ],
  twitter: [
    { url: 'https://nitter.net/ESPNcricinfo/rss', competitor: 'ESPN Cricinfo', label: 'ESPN Cricinfo X (Nitter)', type: 'twitter' as const },
    { url: 'https://rsshub.app/twitter/user/ESPNcricinfo', competitor: 'ESPN Cricinfo', label: 'ESPN Cricinfo X (RSSHub)', type: 'twitter' as const },
    { url: 'https://nitter.net/cricbuzz/rss', competitor: 'Cricbuzz', label: 'Cricbuzz X (Nitter)', type: 'twitter' as const },
    { url: 'https://rsshub.app/twitter/user/cricbuzz', competitor: 'Cricbuzz', label: 'Cricbuzz X (RSSHub)', type: 'twitter' as const },
    { url: 'https://nitter.net/Cricketracker/rss', competitor: 'Crictracker', label: 'Crictracker X (Nitter)', type: 'twitter' as const },
    { url: 'https://rsshub.app/twitter/user/Cricketracker', competitor: 'Crictracker', label: 'Crictracker X (RSSHub)', type: 'twitter' as const },
  ],
  youtube: [
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCSRQXk5yErn4e14vN76upOw', competitor: 'Cricbuzz', label: 'Cricbuzz YouTube', type: 'youtube' as const },
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCujuVKmt_utAQZJghxlRMIQ', competitor: 'ESPN Cricinfo', label: 'ESPN Cricinfo YouTube', type: 'youtube' as const },
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC5oTaFLOFlLNeAJt_dt5rBw', competitor: 'Sportskeeda Cricket', label: 'Sportskeeda Cricket YouTube', type: 'youtube' as const },
    { url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCNB3EZTFZhVTwvEoo1Cw3Dg', competitor: 'Crictracker', label: 'Crictracker YouTube', type: 'youtube' as const },
  ],
};

export const COMPETITORS = ['Cricbuzz', 'ESPN Cricinfo', 'Sportskeeda Cricket', 'Crictracker'];

export const URGENCY_KEYWORDS = [
  'breaking', 'injury', 'injured', 'retired', 'retires', 'suspended', 'suspension',
  'banned', 'ban', 'dies', 'dead', 'death', 'arrested', 'controversy', 'scandal',
  'emergency', 'shock', 'sacked', 'fired', 'quit', 'resigns', 'resigned', 'selected',
  'dropped', 'replaced', 'recalled', 'debutant', 'debut', 'record', 'hat-trick',
  'century', '100', 'five-wicket', '5-wicket', 'odi', 'test', 't20', 'ipl', 'wc',
];

export type FeedItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  source: string;
  label: string;
  isUrgent: boolean;
  summary?: string;
};

export type CompetitorItem = {
  id: string;
  title: string;
  link: string;
  pubDate: string;
  competitor: string;
  type: 'website' | 'twitter' | 'youtube';
  label: string;
  ytFormat?: 'Long Form' | 'YT Short';
};
