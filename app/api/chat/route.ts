import OpenAI from 'openai';
import { nanoid } from 'nanoid';
import { searchPubMed } from '@/lib/utils/pubmed';
import { extractKeywords } from '@/lib/utils/keywords';
import { uploadResearchData } from '@/lib/utils/storage';
import { OCCUPATION_PROMPTS, type Occupation } from '@/lib/utils/openai';
import type { Article } from '@/lib/types';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const runtime = 'edge';
export const preferredRegion = ['iad1'];
export const maxDuration = 300; // 5 minutes timeout

// Add a new constant for non-search prompts
const BASIC_PROMPTS: Record<Occupation, string> = {
  "Researcher": `You are a research expert providing clear, direct responses based on your knowledge.
    Focus on providing accurate, well-structured answers without citations.
    Maintain academic depth while being concise and accessible.`,
  
  "PhD Physician": `You are a medical expert providing clear, direct responses based on your knowledge.
    Focus on providing accurate, well-structured medical insights without citations.
    Maintain clinical depth while being concise and accessible.`,
  
  "Psychologist": `You are a psychology expert providing clear, direct responses based on your knowledge.
    Focus on providing accurate, well-structured psychological insights without citations.
    Maintain clinical depth while being concise and accessible.`
};

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 290000); // 4.8 minutes

  try {
    console.log('[Chat API] Received request');
    const { messages, occupation = 'Researcher', responseLength = 'standard' } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const withSearch = messages[messages.length - 1].metadata?.withSearch ?? true;
    const questionId = nanoid();
    const occupationType = occupation as Occupation;

    // Get previous conversation messages
    const conversationHistory = messages
      .slice(0, -1) // Exclude current message
      .map((m: { role: string; content: string }) => ({ 
        role: m.role, 
        content: m.content 
      }));

    let allArticles: Article[] = [];

    // Only perform search and use research prompts if search is enabled
    if (withSearch) {
      // Extract keywords and search both sources
      const keywords = await extractKeywords(userMessage);
      
      // Search PubMed
      try {
        const pubmedArticles = await searchPubMed(keywords);
        console.log(`[Articles] PubMed articles found: ${pubmedArticles.length}`);
        allArticles = [...pubmedArticles];
      } catch (error) {
        console.error('[Articles] PubMed search failed:', error);
      }

      // Search arXiv
      try {
        // For Edge Runtime, we can use Request.url to get the base URL
        const url = new URL(req.url);
        const arxivUrl = new URL('/api/arxiv', url.origin);
        arxivUrl.searchParams.set('q', keywords.join(' '));

        const arxivRes = await fetch(arxivUrl, { 
          headers: { 'Content-Type': 'application/json' }
        });

        if (arxivRes.ok) {
          const arxivArticles = await arxivRes.json();
          console.log(`[Articles] arXiv articles found: ${arxivArticles.length}`);
          allArticles = [...allArticles, ...arxivArticles];
        } else {
          console.warn('[Articles] arXiv search failed');
        }
      } catch (error) {
        console.error('[Articles] arXiv search failed:', error);
      }

      console.log(`[Articles] Total articles after merge: ${allArticles.length}`);

      // Proceed with chat completion even if no articles found
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

      // Create completion with research prompts and articles
      const completion = await openaiClient.chat.completions.create({
        model: 'o3-mini',
        messages: [
          ...conversationHistory,
          { 
            role: 'user',
            content: `${OCCUPATION_PROMPTS[occupationType]}
              ${allArticles.length > 0 ? `Consider these relevant academic sources to support your analysis:
              ${allArticles.map(a => `- ${a.authors[0]} et al. (${a.published}) - "${a.title}"`).join('\n')}` : ''}

              Drawing from ${allArticles.length > 0 ? 'these sources and ' : ''}your expertise, please address:

              ${userMessage}`
          }
        ],
        reasoning_effort: "high"
      } as any);

      // Return response with research headers
      const response = new Response(completion.choices[0].message.content);
      response.headers.set('X-Question-ID', questionId);
      response.headers.set('X-Study-Count', allArticles.length.toString());
      response.headers.set('X-Search-Enabled', 'true');

      clearTimeout(timeoutId); // Clear timeout on success
      return response;

    } else {
      // Simple completion with basic prompt
      const completion = await openaiClient.chat.completions.create({
        model: 'o3-mini',
        messages: [
          {
            role: 'system',
            content: BASIC_PROMPTS[occupationType]
          },
          ...conversationHistory,
          { role: 'user', content: userMessage }
        ],
        reasoning_effort: "high"
      } as any);

      return new Response(completion.choices[0].message.content);
    }

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    console.error('[Chat API] Error:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response('Request timeout', { status: 408 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}