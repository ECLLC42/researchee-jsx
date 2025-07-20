import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { extractKeywords } from '@/lib/utils/keywords';
import { searchPubMed } from '@/lib/utils/pubmed';
import { uploadResearchData } from '@/lib/utils/storage';
import { createResponseWithReasoning } from '@/lib/utils/openai';
import type { Article, Occupation } from '@/lib/types/index';

export const maxDuration = 300;
export const runtime = 'edge';

export async function POST(req: Request) {
  console.log('[Chat API] POST request started');
  try {
    const { messages, occupation = 'Researcher', responseLength = 'standard', showReasoning = false } = await req.json();
    console.log('[Chat API] Request payload:', { messages, occupation, responseLength, showReasoning });
    
    // Get the user's latest message and its metadata
    const userMessage = messages[messages.length - 1].content;
    const withSearch = messages[messages.length - 1].metadata?.withSearch ?? true;
    const questionId = nanoid();
    const occupationType = occupation as Occupation;
    const searchSource = messages[messages.length - 1].metadata?.searchSource ?? 'both';
    console.log('[Chat API] Selected search source:', searchSource);

    // Build conversation history (exclude the latest message)
    const conversationHistory = messages.slice(0, -1).map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content
    }));
    console.log('[Chat API] Conversation history length:', conversationHistory.length);

    let allArticles: Article[] = [];

    if (withSearch) {
      console.log('[Chat API] With search enabled. Extracting keywords...');
      const keywords = await extractKeywords(userMessage);
      console.log('[Chat API] Extracted keywords:', keywords);
      
      // Search PubMed if applicable
      if (searchSource === 'pubmed' || searchSource === 'both') {
        try {
          console.log('[Chat API] Searching PubMed...');
          const pubmedArticles = await searchPubMed(keywords);
          console.log('[Chat API] PubMed articles found:', pubmedArticles.length);
          allArticles = allArticles.concat(pubmedArticles);
        } catch (error) {
          console.error('[Chat API] PubMed search failed:', error);
        }
      }
      
      // Search arXiv if applicable
      if (searchSource === 'arxiv' || searchSource === 'both') {
        try {
          console.log('[Chat API] Searching arXiv...');
          const url = new URL(req.url);
          const arxivUrl = new URL('/api/arxiv', url.origin);
          arxivUrl.searchParams.set('q', keywords.join(' '));
          console.log('[Chat API] arXiv URL:', arxivUrl.toString());
  
          const arxivRes = await fetch(arxivUrl, { 
            headers: { 'Content-Type': 'application/json' }
          });
  
          if (arxivRes.ok) {
            const arxivData = await arxivRes.json();
            const arxivArticles = Array.isArray(arxivData.articles)
              ? arxivData.articles
              : (Array.isArray(arxivData) ? arxivData : []);
            console.log('[Chat API] arXiv articles found:', arxivArticles.length);
            allArticles = allArticles.concat(arxivArticles);
          } else {
            console.warn('[Chat API] arXiv search failed with status:', arxivRes.status);
          }
        } catch (error) {
          console.error('[Chat API] arXiv search failed:', error);
        }
      }
  
      console.log('[Chat API] Total articles after merge:', allArticles.length);

      console.log('[Chat API] Uploading research data with questionId:', questionId);
      await uploadResearchData(questionId, {
        question: userMessage,
        optimizedQuestion: userMessage,
        keywords,
        articles: allArticles,
        timestamp: new Date().toISOString(),
        occupation,
        answer: '',
        citations: []
      });
      console.log('[Chat API] Research data uploaded');
    }

    console.log('[Chat API] Creating response with reasoning...');
    const response = await createResponseWithReasoning(
      messages,
      occupationType,
      allArticles,
      showReasoning
    );

    console.log('[Chat API] Response created:', { 
      hasReasoning: !!response.reasoning, 
      contentLength: response.content.length 
    });

    // Set response headers
    const headers = new Headers();
    headers.set('X-Search-Enabled', withSearch.toString());
    if (withSearch) {
      headers.set('X-Question-ID', questionId);
      headers.set('X-Study-Count', allArticles.length.toString());
    }
    headers.set('X-Reasoning-Available', (!!response.reasoning).toString());

    return NextResponse.json(
      {
        id: nanoid(),
        role: 'assistant',
        content: response.content,
        metadata: {
          reasoning: response.reasoning,
          responseId: response.responseId,
          searchSource: withSearch ? searchSource : null,
          citations: allArticles.length > 0 ? allArticles.length : null
        }
      },
      { headers }
    );

  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}