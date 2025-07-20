import { NextResponse } from 'next/server';
import { filterRelevantArticles } from '@/lib/utils/relevance';
import type { Article } from '@/lib/types/index';

export const maxDuration = 300;
export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(req: Request) {
  console.log('[Relevance API] POST request started');
  try {
    const { messages, articles } = await req.json();
    console.log('[Relevance API] Received messages:', messages);
    console.log('[Relevance API] Processing articles:', articles.length);
    
    // Extract the query from the last user message
    const query = messages[messages.length - 1].content;
    
    // Filter relevant articles
    const relevantArticles = filterRelevantArticles(query, articles);
    console.log('[Relevance API] Filtered to relevant articles:', relevantArticles.length);

    // Send request to OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.9,
        max_tokens: 750,
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      }),
    });

    if (!response.ok) {
      console.error('[Relevance API] OpenAI API responded with non-OK status:', response.status);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Relevance API] OpenAI Response:', data);
    
    return NextResponse.json({ 
      completion: data,
      relevantArticles 
    });
  } catch (error) {
    console.error('[Relevance API] Error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
} 