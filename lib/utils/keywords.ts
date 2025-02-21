import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

const KEYWORD_EXTRACTION_PROMPT = `You are an expert in extracting core search terms relevant to academic research.
Extract EXACTLY 3-4 single words most crucial to the topic. Make sure they are relevant to the users question.
Avoid general, meta, or stop words. These words will be put into a pubmed search query, so make sure they are appropriate.
Output format: 'word1, word2, word3[, word4]'`;

export async function extractKeywords(optimizedQuestion: string): Promise<string[]> {
  try {
    const completion: Awaited<ReturnType<typeof openai.chat.completions.create>> = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: KEYWORD_EXTRACTION_PROMPT
        },
        {
          role: "user",
          content: `Extract keywords from: ${optimizedQuestion}`
        }
      ],
      model: "o3-mini"
    });
    
    const content = completion.choices[0].message.content;
    if (!content) return [];

    const keywords = content.split(',').map((w: string) => w.trim());
    return keywords.slice(0, 4); // Limit to 4 keywords
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
} 