import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: "https://api.openai.com/v1"
});

const KEYWORD_EXTRACTION_PROMPT = `You are an expert in extracting core search terms relevant to academic research.
Extract EXACTLY 4-5 key search terms or phrases crucial to the topic. Include both specific and broader related terms.
Avoid general, meta, or stop words. These words will be put into a pubmed search query, so make sure they are appropriate.
Output format: 'term1, term2, term3, term4[, term5]'
Example: For "why do black holes emit hawking radiation", output might be:
"hawking radiation, black hole evaporation, quantum mechanics, thermal emission, spacetime"`;

export async function extractKeywords(optimizedQuestion: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `${KEYWORD_EXTRACTION_PROMPT}

Extract keywords from: ${optimizedQuestion}`
        }
      ],
      model: "o1-mini",
    } as any);
    
    const content = completion.choices[0].message.content;
    if (!content) return [];

    const keywords = content.split(',').map((w: string) => w.trim());
    // Remove leading/trailing quotes from each keyword and limit to 4 results
    return keywords.map(keyword => keyword.replace(/^"+|"+$/g, '').trim()).slice(0, 4);
  } catch (error) {
    console.error('Error extracting keywords:', error);
    throw error;
  }
} 