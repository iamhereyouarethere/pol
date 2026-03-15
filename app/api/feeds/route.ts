import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { LIVE_RADAR_FEEDS, URGENCY_KEYWORDS, FeedItem } from '@/lib/feedConfig';
import crypto from 'crypto';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'ForzaCricket/1.0 (+https://forzacricket.com)',
  },
});

function isUrgent(title: string, content?: string): boolean {
  const text = `${title} ${content || ''}`.toLowerCase();
  return URGENCY_KEYWORDS.some(kw => text.includes(kw));
}

async function fetchFeed(feedConfig: typeof LIVE_RADAR_FEEDS[0]): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(feedConfig.url);
    return (feed.items || []).slice(0, 10).map(item => ({
      id: crypto.createHash('md5').update(item.link || item.title || Math.random().toString()).digest('hex'),
      title: item.title || 'No title',
      link: item.link || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: feedConfig.source,
      label: feedConfig.label,
      isUrgent: isUrgent(item.title || '', item.contentSnippet || item.content || ''),
      summary: item.contentSnippet?.slice(0, 200) || '',
    }));
  } catch {
    return [];
  }
}

export async function GET() {
  const results = await Promise.allSettled(LIVE_RADAR_FEEDS.map(fetchFeed));
  const allItems: FeedItem[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  // Sort: urgent first, then by date
  allItems.sort((a, b) => {
    if (a.isUrgent && !b.isUrgent) return -1;
    if (!a.isUrgent && b.isUrgent) return 1;
    return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
  });

  // Deduplicate by title similarity
  const seen = new Set<string>();
  const deduplicated = allItems.filter(item => {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return NextResponse.json({ items: deduplicated.slice(0, 60), fetchedAt: new Date().toISOString() });
}
