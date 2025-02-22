import { NextResponse } from 'next/server';
import { checkArticleRelevance } from '@/lib/utils/relevance';
import type { PubMedArticle } from '@/lib/utils/pubmed';

export const runtime = 'edge'; // Use edge runtime for better performance

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500, // Reduce tokens to speed up response
        timeout: 15000, // 15 second timeout
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('[Relevance] Error:', error);
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    );
  }
} 