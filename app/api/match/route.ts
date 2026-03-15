import { NextResponse } from 'next/server';

// This endpoint fetches live match data from a public cricket API
// Using cricapi.com - user needs to add CRICAPI_KEY to .env.local
// Falls back to showing placeholder if no key is provided

export async function GET() {
  const apiKey = process.env.CRICAPI_KEY;

  if (!apiKey) {
    return NextResponse.json({
      matches: [],
      message: 'Add CRICAPI_KEY to .env.local to enable live match data. Get a free key at cricapi.com',
    });
  }

  try {
    const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();

    if (data.status !== 'success') {
      return NextResponse.json({ matches: [], message: data.status });
    }

    const matches = (data.data || []).slice(0, 6).map((m: Record<string, unknown>) => ({
      id: m.id,
      name: m.name,
      status: m.status,
      venue: m.venue,
      date: m.date,
      teams: m.teams,
      score: m.score,
      matchType: m.matchType,
    }));

    return NextResponse.json({ matches, fetchedAt: new Date().toISOString() });
  } catch {
    return NextResponse.json({ matches: [], message: 'Failed to fetch match data' });
  }
}
