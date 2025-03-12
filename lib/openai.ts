/**
 * OpenAI utility functions for optimizing academic searches
 */

import { Paper } from './types';

/**
 * Optimizes a user question for academic search purposes
 * @param question The original user question
 * @param apiKey OpenAI API key
 * @returns The optimized question for academic search
 */
export async function optimizeQuestion(question: string, apiKey: string): Promise<string> {
  console.log('🧠 OpenAI: Optimizing question for academic search', { 
    questionLength: question.length,
    timestamp: new Date().toISOString()
  });
  
  try {
    const startTime = Date.now();
    console.log('📤 OpenAI: Sending optimization request');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.5-preview-2025-02-27',
        messages: [
          {
            role: 'system',
            content: `You are an academic search optimizer. Your task is to rewrite user questions to make them more effective for searching academic databases like arXiv and PubMed.

Guidelines:
- Identify and preserve the core academic concepts
- Remove conversational language and fillers
- Use precise academic terminology
- Format as a concise, clear question
- Focus on topics that would appear in academic literature
- Maintain the original intent of the question`
          },
          {
            role: 'user',
            content: `Please optimize this question for academic search: "${question}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log('⏱️ OpenAI: Optimization response received', { 
      responseTimeMs: responseTime,
      status: response.status 
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI: Optimization API error', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('📊 OpenAI: Optimization stats', { 
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      model: data.model
    });
    
    const optimizedQuestion = data.choices[0]?.message?.content.trim() || question;
    
    console.log('✅ OpenAI: Question optimized', { 
      original: question,
      optimized: optimizedQuestion,
      charDifference: optimizedQuestion.length - question.length,
      percentChange: Math.round((optimizedQuestion.length - question.length) / question.length * 100)
    });
    
    return optimizedQuestion;
  } catch (error) {
    console.error('❌ OpenAI: Error optimizing question', error);
    // Return the original question if optimization fails
    return question;
  }
}

/**
 * Extracts keywords from a question for academic search
 * @param question The user question (optimized or original)
 * @param apiKey OpenAI API key
 * @returns List of keywords suitable for academic search
 */
export async function extractKeywords(question: string, apiKey: string): Promise<string[]> {
  console.log('🔑 OpenAI: Extracting keywords for academic search', { 
    questionLength: question.length,
    timestamp: new Date().toISOString()
  });
  
  try {
    const startTime = Date.now();
    console.log('📤 OpenAI: Sending keyword extraction request');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.5-preview-2025-02-27',
        messages: [
          {
            role: 'system',
            content: `You are an academic keyword extractor. Your task is to identify the most important academic concepts and terms from a user's question that would be optimal for searching academic databases like arXiv and PubMed.

Guidelines:
- Extract 3-6 most relevant academic terms or concepts
- Focus on domain-specific terminology
- Include relevant scientific concepts and methodologies
- Use standard academic terminology
- Exclude common words and non-academic terms
- Each keyword may be a single word or a multi-word term if it represents a single concept
- Respond with ONLY the keywords as a JSON array with no additional text`
          },
          {
            role: 'user',
            content: `Extract academic search keywords from this question: "${question}"`
          }
        ],
        max_tokens: 200,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    const responseTime = Date.now() - startTime;
    console.log('⏱️ OpenAI: Keyword extraction response received', { 
      responseTimeMs: responseTime,
      status: response.status 
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI: Keyword extraction API error', errorData);
      throw new Error(`OpenAI API error: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('📊 OpenAI: Keyword extraction stats', { 
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      totalTokens: data.usage?.total_tokens,
      model: data.model
    });
    
    const responseContent = data.choices[0]?.message?.content || '{"keywords": []}';
    
    // Parse the JSON response
    const jsonResponse = JSON.parse(responseContent);
    const keywords = jsonResponse.keywords || [];
    
    console.log('✅ OpenAI: Keywords extracted', { 
      count: keywords.length,
      keywords,
      avgKeywordLength: keywords.length > 0 ? 
        Math.round(keywords.join(' ').length / keywords.length) : 0
    });
    
    return keywords;
  } catch (error) {
    console.error('❌ OpenAI: Error extracting keywords', error);
    // Return a simple array with the original question if extraction fails
    return [question];
  }
}

/**
 * Combined function to optimize a question and extract keywords
 * @param question The original user question
 * @param apiKey OpenAI API key
 * @returns Object containing optimized question and extracted keywords
 */
export async function prepareAcademicSearch(question: string, apiKey: string): Promise<{
  optimizedQuestion: string;
  keywords: string[];
  searchQuery: string;
}> {
  console.log('🔍 OpenAI: Beginning academic search preparation', {
    originalQuestion: question,
    timestamp: new Date().toISOString()
  });
  
  const startTime = Date.now();
  
  // First optimize the question
  const optimizedQuestion = await optimizeQuestion(question, apiKey);
  
  // Then extract keywords from the optimized question
  const keywords = await extractKeywords(optimizedQuestion, apiKey);
  
  // Create a search query string from the keywords
  const searchQuery = keywords.join(' ');
  
  const totalTime = Date.now() - startTime;
  console.log('✅ OpenAI: Academic search prepared', {
    timeMs: totalTime,
    originalQuestion: question,
    optimizedQuestion,
    keywords,
    searchQuery,
    keywordCount: keywords.length
  });
  
  return {
    optimizedQuestion,
    keywords,
    searchQuery
  };
}

/**
 * Ranks and selects the most relevant papers based on their titles
 * @param papers The full list of papers from all sources
 * @param userQuestion The original user question
 * @param maxPapers Maximum number of papers to select
 * @param apiKey OpenAI API key
 * @returns Selected papers for inclusion in the prompt
 */
export async function selectRelevantPapers(
  papers: Paper[],
  userQuestion: string,
  maxPapers: number = 10,
  apiKey: string
): Promise<Paper[]> {
  console.log('🧠 OpenAI: Ranking papers by relevance', { 
    totalPapers: papers.length,
    maxPapers,
    timestamp: new Date().toISOString()
  });
  
  if (papers.length <= maxPapers) {
    console.log('📚 OpenAI: Paper count already under limit, skipping selection', {
      paperCount: papers.length,
      maxPapers
    });
    return papers;
  }
  
  try {
    // Prepare the paper index data for the ranking
    const paperIndex: Record<string, Paper> = {};
    
    // Create a simple list of papers with just ID and title
    const paperTitles = papers.map((paper, index) => {
      const id = `paper_${index}`;
      paperIndex[id] = paper;
      
      // Extract additional metadata for better selection
      const metadata: string[] = [];
      
      // Add source
      metadata.push(`Source: ${paper.source.toUpperCase()}`);
      
      // Add authors (limited to first 3)
      if (paper.authors && paper.authors.length > 0) {
        const authorText = paper.authors.slice(0, 3).join(', ');
        metadata.push(`Authors: ${authorText}${paper.authors.length > 3 ? ', et al.' : ''}`);
      }
      
      // Add year if available
      if (paper.published) {
        const yearMatch = paper.published.match(/\b(19|20)\d{2}\b/);
        if (yearMatch) {
          metadata.push(`Year: ${yearMatch[0]}`);
        }
      }
      
      // Add citation count if available
      if ('citationCount' in paper && paper.citationCount) {
        metadata.push(`Citations: ${paper.citationCount}`);
      }
      
      return {
        id,
        title: paper.title,
        metadata: metadata.join(' | ')
      };
    });
    
    console.log('📄 OpenAI: Sending paper titles for relevance ranking');
    const startTime = Date.now();
    
    // Call OpenAI to rank the papers
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.5-preview-2025-02-27',
        messages: [
          {
            role: 'system',
            content: `You are a research paper relevance ranker. Your task is to identify which papers are most relevant to a user's question or research topic.

Given a list of papers (with titles and metadata) and a user question, select up to ${maxPapers} papers that are MOST relevant to answering the question.

Analyze the paper titles and metadata carefully. Look for:
1. Topical relevance - Does the paper directly address the question's subject matter?
2. Recency - Prefer newer papers unless older ones are canonical
3. Citation count - Consider papers with higher citation counts when available
4. Diversity - Select papers that cover different aspects of the question

Provide your response as a JSON array of paper IDs only, sorted by relevance (most relevant first):
\`\`\`json
{"selected_papers": ["paper_id1", "paper_id2", ...]}
\`\`\`

Only include the paper IDs in your response, nothing else.`
          },
          {
            role: 'user',
            content: `User question: "${userQuestion}"

Available papers:
${paperTitles.map((paper: { id: string, title: string, metadata: string }) => 
  `ID: ${paper.id}\nTitle: ${paper.title}\n${paper.metadata}`
).join('\n\n')}

Please select up to ${maxPapers} papers that are most relevant to the user's question.`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ OpenAI: Paper selection API error', errorData);
      // If API fails, return the papers in original order, capped at maxPapers
      return papers.slice(0, maxPapers);
    }
    
    const data = await response.json();
    console.log('⏱️ OpenAI: Paper selection completed', { 
      responseTimeMs: responseTime,
      tokensUsed: data.usage?.total_tokens
    });
    
    try {
      // Parse the response to get selected paper IDs
      const content = data.choices[0]?.message?.content || '{"selected_papers": []}';
      const jsonResponse = JSON.parse(content);
      const selectedIds = jsonResponse.selected_papers || [];
      
      if (selectedIds.length === 0) {
        console.log('⚠️ OpenAI: No papers selected, using original order');
        return papers.slice(0, maxPapers);
      }
      
      // Map back to the original papers, maintaining the selected order
      const selectedPapers = selectedIds
        .map((id: string) => paperIndex[id])
        .filter((paper: Paper | undefined) => paper !== undefined);
      
      console.log('✅ OpenAI: Papers selected by relevance', { 
        requestedCount: maxPapers,
        selectedCount: selectedPapers.length,
        selectedIds
      });
      
      // If we didn't get enough papers, add more from the original list
      if (selectedPapers.length < maxPapers) {
        const selectedPaperIds = new Set(selectedIds);
        const remainingPapers = papers.filter((_, index) => 
          !selectedPaperIds.has(`paper_${index}`)
        ).slice(0, maxPapers - selectedPapers.length);
        
        console.log('📚 OpenAI: Adding additional papers to meet quota', {
          additionalCount: remainingPapers.length
        });
        
        return [...selectedPapers, ...remainingPapers];
      }
      
      return selectedPapers;
    } catch (parseError) {
      console.error('❌ OpenAI: Error parsing paper selection response', parseError);
      // Fall back to original order if parsing fails
      return papers.slice(0, maxPapers);
    }
  } catch (error) {
    console.error('❌ OpenAI: Error selecting relevant papers', error);
    // Fall back to original order if the process fails
    return papers.slice(0, maxPapers);
  }
} 