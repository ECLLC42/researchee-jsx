import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { nanoid } from 'nanoid';
import { searchPubMed } from '@/lib/utils/pubmed';
import { extractKeywords } from '@/lib/utils/keywords';
import { uploadResearchData } from '@/lib/utils/storage';
import { OCCUPATION_PROMPTS, type Occupation } from '@/lib/utils/openai';
import type { Article } from '@/lib/types';

export const maxDuration = 300;
export const runtime = 'edge';
export const preferredRegion = ['iad1'];

// For non-search prompts (if needed)
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
  console.log('[Chat API] POST request started');
  try {
    const { messages, occupation = 'Researcher', responseLength = 'standard' } = await req.json();
    console.log('[Chat API] Request payload:', { messages, occupation, responseLength });
    
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

    if (withSearch) {
      console.log('[Chat API] With search enabled. Extracting keywords...');
      const keywords = await extractKeywords(userMessage);
      console.log('[Chat API] Extracted keywords:', keywords);
      
      let allArticles: Article[] = [];

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

      console.log('[Chat API] Initiating chat completion with research prompts');
      // Build the research prompt using your occupation-specific prompt and the research data
      const researchPrompt = `${OCCUPATION_PROMPTS[occupationType]}

Consider these relevant academic sources to support your analysis:
${
  allArticles.length > 0 
    ? allArticles.map(a => {
        const abstractSnippet = a.abstract ? a.abstract.slice(0, 150) + '...' : 'No abstract available';
        return `- ${a.authors[0]} et al. (${a.published}) - "${a.title}"
   Summary: ${abstractSnippet}`;
      }).join('\n')
    : 'No sources found.'
}

Drawing from ${allArticles.length > 0 ? 'these sources and ' : ''}your expertise, please address:

${userMessage}`;
      
      // Combine previous conversation with the new research prompt
      const fullPrompt = [
        ...conversationHistory,
        {
          role: 'user',
          content: researchPrompt
        }
      ];
      
      console.log('[Chat API] Full prompt sent to OpenAI:', JSON.stringify(fullPrompt, null, 2));
      
      const result = streamText({
        model: openai('o3-mini'),
        messages: fullPrompt,
      });
      
      // Return the stream using the SDK helper and include custom headers
      return result.toDataStreamResponse({
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Question-ID': questionId,
          'X-Study-Count': allArticles.length.toString(),
          'X-Search-Enabled': 'true'
        }
      });
    } else {
      console.log('[Chat API] With search disabled. Processing basic prompt...');
      const basicPrompt = [
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage
        }
      ];
      console.log('[Chat API] Full prompt sent to OpenAI (basic):', JSON.stringify(basicPrompt, null, 2));
      
      const result = streamText({
        model: openai('o3-mini'),
        messages: basicPrompt,
      });
      
      return result.toDataStreamResponse();
    }
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return new Response('data: {"error": "Internal Server Error"}\n\n', {
      status: 500,
      headers: { 'Content-Type': 'text/event-stream' }
    });
  }
}