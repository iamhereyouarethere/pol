import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { COMPETITOR_FEEDS, CompetitorItem } from '@/lib/feedConfig';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'ForzaCricket/1.0 (+https://forzacricket.com)',
  },
  customFields: {
    item: [
      ['media:group', 'mediaGroup'],
      ['yt:videoId', 'ytVideoId'],
      ['yt:channelId', 'ytChannelId'],
    ],
  },
});

function detectYTFormat(title: string, link: string): 'YT Short' | 'Long Form' {
  const text = `${title} ${link}`.toLowerCase();
  if (text.includes('shorts') || text.includes('#shorts') || text.includes('/shorts/')) {
    return 'YT Short';
  }
  return 'Long Form';
}

async function fetchCompetitorFeed(
  feedConfig: { url: string; competitor: string; label: string; type: 'website' | 'twitter' | 'youtube' }
): Promise<CompetitorItem[]> {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).slice(0, 8).map(item => {
      const link = item.link || '';
      const title = item.title || 'No title';
      const base: CompetitorItem = {
        id: crypto.createHash('md5').update(link || title || Math.random().toString()).digest('hex'),
        title,
        link,
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        competitor: feedConfig.competitor,
        type: feedConfig.type,
        label: feedConfig.label,
      };
      if (feedConfig.type === 'youtube') {
        base.ytFormat = detectYTFormat(title, link);
      }
      return base;
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const allFeedConfigs = [
    ...COMPETITOR_FEEDS.website,
    ...COMPETITOR_FEEDS.twitter,
    ...COMPETITOR_FEEDS.youtube,
  ];

  const results = await Promise.allSettled(allFeedConfigs.map(fetchCompetitorFeed));
  const allItems: CompetitorItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Sort by date
  allItems.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Deduplicate
  const seen = new Set<string>();
  const deduplicated = allItems.filter(item => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ items: deduplicated.slice(0, 80), fetchedAt: new Date().toISOString() });
}
