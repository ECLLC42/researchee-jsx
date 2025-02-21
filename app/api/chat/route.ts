import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { nanoid } from 'nanoid';
import { searchPubMed } from '@/lib/utils/pubmed';
import { extractKeywords } from '@/lib/utils/keywords';
import { uploadResearchData } from '@/lib/utils/storage';
import { OCCUPATION_PROMPTS, type Occupation } from '@/lib/utils/openai';

const SYSTEM_PROMPT = (occupation: Occupation) => `${OCCUPATION_PROMPTS[occupation]}

Additional Instructions:
- Provide clear, focused responses
- Use (Author, Year) format for citations in-text
- Synthesize findings across multiple studies when possible
- Focus on evidence-based insights
- Format all text in white color

Required Response Format:
1. First provide your main response in white text
2. End EVERY response with a "Sources Used:" section in white text that lists ONLY the articles you specifically cited
3. Format each source as: "Author et al. (Year) - Title"
4. Only include sources you actually referenced in your response
5. Ensure all text remains white for readability`;

export async function POST(req: Request) {
  try {
    const { messages, occupation = 'Researcher', responseLength = 'standard' } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const questionId = nanoid();

    // 1. Extract keywords and search
    const keywords = await extractKeywords(userMessage);
    const articles = await searchPubMed(keywords);

    // 2. Store research data
    await uploadResearchData(questionId, {
      question: userMessage,
      optimizedQuestion: userMessage,
      keywords,
      articles,
      timestamp: new Date().toISOString(),
      occupation: 'Researcher',
      answer: '',
      citations: []
    });

    // 3. Generate response with streaming
    const maxTokens = responseLength === 'extended' ? 3800 : 1800;

    const stream = await streamText({
      model: openai('o3-mini'),
      reasoning_effort: 'high',
      messages: [
        { 
          role: 'user',
          content: `Format your response using:
- **Bold** for key terms and concepts
- Add TWO blank lines before each header (##)
- Add ONE blank line between paragraphs
- Add ONE blank line before and after bullet point lists
- Add ONE blank line before and after quotes
- Add ONE blank line before and after citations
- Use bullet points with "-" for lists
- Use > for important quotes
- Format citations as (Author et al., Year)
- Form your response as a narrative, not a list of bullet points or list of sources. Provide a clear and cohesive response at an above PhD level.

${userMessage}`
        },
        {
          role: 'system',
          content: `Available articles for reference (cite those you use):
${articles.map(a => `- ${a.authors[0]} et al. (${a.published}) - "${a.title}"`).join('\n')}`
        }
      ],
      maxTokens
    });

    const response = stream.toDataStreamResponse();
    response.headers.set('X-Question-ID', questionId);
    return response;

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// export const runtime = 'edge';
