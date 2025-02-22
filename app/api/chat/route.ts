import OpenAI from 'openai';
import { nanoid } from 'nanoid';
import { searchPubMed } from '@/lib/utils/pubmed';
import { extractKeywords } from '@/lib/utils/keywords';
import { uploadResearchData } from '@/lib/utils/storage';
import { OCCUPATION_PROMPTS, type Occupation } from '@/lib/utils/openai';

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const maxDuration = 60;  // 60 second timeout

export async function POST(req: Request) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 58000); // Abort just before timeout

  try {
    const { messages, occupation = 'Researcher', responseLength = 'standard' } = await req.json();
    const userMessage = messages[messages.length - 1].content;
    const questionId = nanoid();

    // Add type assertion for occupation
    const occupationType = occupation as Occupation;

    // Extract keywords and search PubMed
    const keywords = await extractKeywords(userMessage);
    const articles = await searchPubMed(keywords);

    // Store research data
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

    // Set token limit based on response length
    const max_completion_tokens = responseLength === 'extended' ? 3800 : 1800;

    // Replace streaming with regular completion
    const completion = await openaiClient.chat.completions.create({
      model: 'o3-mini',
      messages: [
        { 
          role: 'user',
          content: `${OCCUPATION_PROMPTS[occupationType]}

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
5. Ensure all text remains white for readability

Format your response using:
**Bold** for key terms and concepts

Add TWO blank lines before each header (##)
Add ONE blank line between paragraphs
Add ONE blank line before and after bullet point lists
Add ONE blank line before and after quotes
Add ONE blank line before and after citations

Use bullet points with "-" for lists
Use > for important quotes

Format citations as (Author et al., Year)
Form your response as a narrative, not as a list of bullet points or sources. Provide a clear, cohesive answer at an above PhD level.

${userMessage}`
        },
        {
          role: 'system',
          content: `Available articles for reference (cite those you use):
${articles.map(a => `- ${a.authors[0]} et al. (${a.published}) - "${a.title}"`).join('\n')}`
        }
      ],
    }, { signal: controller.signal });  // Add abort signal

    // Log the full response so you can debug what's coming back from OpenAI.
    console.log('OpenAI API response:', JSON.stringify(completion, null, 2));

    clearTimeout(timeoutId);
    const response = new Response(completion.choices[0].message.content);
    response.headers.set('X-Question-ID', questionId);
    return response;

  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      return new Response('Request timeout', { status: 408 });
    }
    console.error('Chat API error:', JSON.stringify(error, null, 2));
    if ((error as any).response) {
      console.error('Error response:', JSON.stringify((error as any).response, null, 2));
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}