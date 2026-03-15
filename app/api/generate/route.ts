import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { type, newsItem, feedback } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
  }

  const feedbackContext = feedback && feedback.length > 0
    ? `\n\nPAST REJECTIONS TO LEARN FROM:\n${feedback.map((f: { reason: string; content: string }) =>
        `- Rejected: "${f.content.slice(0, 80)}..." | Reason: ${f.reason}`
      ).join('\n')}\n\nAvoid repeating these patterns.`
    : '';

  let prompt = '';

  if (type === 'tweets') {
    prompt = `You are a cricket content creator for Forza Cricket, a bold Indian cricket media brand competing with Cricbuzz and Cricinfo.

NEWS ITEM:
Title: ${newsItem.title}
Link: ${newsItem.link}
Summary: ${newsItem.summary || ''}
${feedbackContext}

Generate 3 high-engagement tweets about this cricket news. Each tweet should:
- Be under 280 characters
- Be punchy, opinionated, and engaging for Indian cricket fans
- Use relevant cricket terminology and local flavor
- Include 2-3 relevant hashtags
- Be ready to post immediately

Format your response as JSON:
{
  "tweets": [
    { "text": "tweet text here", "hashtags": ["#tag1", "#tag2"] },
    { "text": "tweet text here", "hashtags": ["#tag1", "#tag2"] },
    { "text": "tweet text here", "hashtags": ["#tag1", "#tag2"] }
  ]
}`;
  } else if (type === 'script') {
    prompt = `You are a cricket content creator for Forza Cricket, a bold Indian cricket media brand competing with Cricbuzz and Cricinfo.

NEWS ITEM:
Title: ${newsItem.title}
Link: ${newsItem.link}
Summary: ${newsItem.summary || ''}
${feedbackContext}

Generate a live video script (3-5 minutes) for a cricket presenter to deliver. The script should:
- Open with a strong hook that grabs attention
- Present the news with context and analysis
- Include talking points and opinions
- Be conversational and energetic for Indian cricket fans
- End with a call to action (like, subscribe, comment)
- Use [PAUSE], [LOOK AT CAMERA], [B-ROLL: description] stage directions

Format as JSON:
{
  "title": "Video title",
  "duration": "estimated duration",
  "hook": "opening line",
  "sections": [
    { "heading": "Section name", "script": "Full script text for this section", "duration": "30s" }
  ],
  "callToAction": "Closing CTA text",
  "keywords": ["keyword1", "keyword2"]
}`;
  } else if (type === 'ai_video_brief') {
    prompt = `You are a cricket content creator for Forza Cricket, an Indian cricket media brand.

NEWS ITEM:
Title: ${newsItem.title}
Summary: ${newsItem.summary || ''}
${feedbackContext}

Generate an AI video / social post brief for this cricket story. Include:
- A short punchy video title
- Visual style description
- On-screen text suggestions
- Voiceover script (30-60 seconds)
- Thumbnail concept
- Best posting time recommendation for Indian audience

Format as JSON:
{
  "title": "Video title",
  "visualStyle": "description of visual style and color palette",
  "onScreenText": ["text overlay 1", "text overlay 2"],
  "voiceover": "Full voiceover script",
  "thumbnail": "Thumbnail concept description",
  "postingTime": "Best time to post and why",
  "platforms": ["Instagram Reels", "YouTube Shorts", "X"]
}`;
  }

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to parse response', raw: responseText }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({ result: parsed, type });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
