import { NextApiRequest, NextApiResponse } from 'next';
import { searchArxiv } from '../../lib/arxiv';
import { searchPubMed } from '../../lib/pubmed';
import { searchOpenAlex } from '../../lib/openalex';
import { searchSemanticScholar } from '../../lib/semanticscholar';
import { searchCore } from '../../lib/core';
import { searchUnpaywall } from '../../lib/unpaywall';
import { Paper, BasePaper } from '../../lib/types';
import { prepareAcademicSearch, selectRelevantPapers } from '../../lib/openai';

// Environment configuration for APIs
interface ApiConfig {
  enabled: boolean;
  maxResults: number;
  // API-specific parameters
  email?: string;      // For Unpaywall
  apiKey?: string;     // For CORE, Semantic Scholar, and OpenAI
}

// Full API configuration
interface ApisConfig {
  arxiv: ApiConfig;
  pubmed: ApiConfig;
  openalex: ApiConfig;
  unpaywall: ApiConfig;
  core: ApiConfig;
  semanticscholar: ApiConfig;
}

// Get API configuration with fixed values
const getApiConfig = (): ApisConfig => {
  return {
    arxiv: {
      enabled: true,
      maxResults: 10 // Fixed value
    },
    pubmed: {
      enabled: true,
      maxResults: 10 // Fixed value
    },
    openalex: {
      enabled: true,
      maxResults: 10 // Fixed value
    },
    unpaywall: {
      enabled: !!process.env.UNPAYWALL_EMAIL,
      maxResults: 0, // Not applicable for Unpaywall as it uses DOIs
      email: process.env.UNPAYWALL_EMAIL || ''
    },
    core: {
      enabled: !!process.env.CORE_API_KEY,
      maxResults: 10, // Fixed value
      apiKey: process.env.CORE_API_KEY
    },
    semanticscholar: {
      enabled: true,
      maxResults: 10, // Fixed value
      apiKey: process.env.SEMANTIC_SCHOLAR_API_KEY
    }
  };
};

// Type for chat messages
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  message: string;
  conversation: Message[];
  academicMode: boolean; // Flag to toggle academic search
}

interface SearchInfo {
  originalQuestion: string;
  optimizedQuestion: string;
  keywords: string[];
}

interface ChatResponse {
  reply: string;
  references?: Paper[];
  allPapers?: Paper[];
  conversation: Message[];
  searchInfo?: SearchInfo | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ChatResponse | { error: string }>
) {
  const requestStartTime = Date.now();
  console.log('📥 API: Chat request received', { 
    method: req.method, 
    timestamp: new Date().toISOString(),
    url: req.url
  });
  
  // Only allow POST method
  if (req.method !== 'POST') {
    console.log('❌ API: Method not allowed', { method: req.method });
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversation = [], academicMode = true } = req.body as ChatRequest;
    console.log('📝 API: Processing message', { 
      messageLength: message?.length, 
      conversationHistory: conversation.length,
      academicMode
    });

    if (!message) {
      console.log('❌ API: Missing message');
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get the OpenAI API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.log('❌ API: Missing OpenAI API key');
      return res.status(500).json({ error: 'OpenAI API key is not configured' });
    }

    // Get API configurations
    const apiConfig = getApiConfig();

    // Variables for paper info and references
    let paperInfo = '';
    let allPapers: Paper[] = [];
    let searchInfo: SearchInfo | null = null;

    // Only perform academic search if academicMode is enabled
    if (academicMode) {
      console.log('🧪 API: Academic mode enabled, beginning enhanced search process');
      const searchStartTime = Date.now();
      
      // Optimize the question and extract keywords for academic search
      const academicSearch = await prepareAcademicSearch(message, apiKey);
      const searchQuery = academicSearch.searchQuery;
      
      // Store search info for the response
      searchInfo = {
        originalQuestion: message,
        optimizedQuestion: academicSearch.optimizedQuestion,
        keywords: academicSearch.keywords
      };
      
      // Search for relevant papers on all enabled scholarly APIs in parallel
      console.log('🔍 API: Searching academic databases with optimized query', { 
        originalQuery: message,
        optimizedQuery: academicSearch.optimizedQuestion,
        searchQuery,
        keywords: academicSearch.keywords,
        enabledApis: Object.entries(apiConfig)
          .filter(([_, config]) => config.enabled)
          .map(([name]) => name)
      });
      
      // Prepare search promises only for enabled APIs
      const searchPromises: Promise<Paper[]>[] = [];
      const apiNames: string[] = [];
      
      // Add ArXiv search if enabled
      if (apiConfig.arxiv.enabled) {
        apiNames.push('arxiv');
        searchPromises.push(searchArxiv(searchQuery, apiConfig.arxiv.maxResults));
      }
      
      // Add PubMed search if enabled
      if (apiConfig.pubmed.enabled) {
        apiNames.push('pubmed');
        searchPromises.push(searchPubMed(searchQuery, apiConfig.pubmed.maxResults));
      }
      
      // Add OpenAlex search if enabled
      if (apiConfig.openalex.enabled) {
        apiNames.push('openalex');
        searchPromises.push(searchOpenAlex(searchQuery, apiConfig.openalex.maxResults));
      }
      
      // Add Semantic Scholar search if enabled
      if (apiConfig.semanticscholar.enabled) {
        apiNames.push('semanticscholar');
        searchPromises.push(
          searchSemanticScholar(searchQuery, apiConfig.semanticscholar.apiKey, apiConfig.semanticscholar.maxResults)
        );
      }
      
      // Add CORE search if enabled
      if (apiConfig.core.enabled && apiConfig.core.apiKey) {
        apiNames.push('core');
        searchPromises.push(
          searchCore(searchQuery, apiConfig.core.apiKey, apiConfig.core.maxResults)
        );
      }
      
      // Execute all search promises in parallel
      const searchStartTimes = apiNames.map(() => Date.now());
      const searchResults = await Promise.all(searchPromises);
      const searchEndTimes = apiNames.map(() => Date.now());
      
      // Process results from each API
      let paper_counts: Record<string, number> = {};
      let dois: string[] = [];
      
      apiNames.forEach((name, index) => {
        const papers = searchResults[index];
        paper_counts[name] = papers.length;
        
        // If the API returns papers with DOIs, collect them for Unpaywall
        if (name !== 'unpaywall') {
          const apiDois = papers
            .filter((p: any) => p.doi)
            .map((p: any) => p.doi);
          dois = [...dois, ...apiDois];
        }
        
        // Add to all papers
        allPapers = [...allPapers, ...papers];
      });
      
      // Remove duplicate DOIs for Unpaywall
      const uniqueDois = Array.from(new Set(dois));
      
      // Add Unpaywall search if enabled and we have DOIs
      if (apiConfig.unpaywall.enabled && uniqueDois.length > 0 && apiConfig.unpaywall.email) {
        console.log('🔍 API: Searching Unpaywall for open access versions', { 
          doiCount: uniqueDois.length 
        });
        const unpaywallStartTime = Date.now();
        const unpaywallPapers = await searchUnpaywall(uniqueDois, apiConfig.unpaywall.email);
        paper_counts['unpaywall'] = unpaywallPapers.length;
        allPapers = [...allPapers, ...unpaywallPapers];
        console.log('⏱️ API: Unpaywall search completed', { 
          timeMs: Date.now() - unpaywallStartTime
        });
      }
      
      // Log search performance metrics
      console.log('⏱️ API: Search performance metrics', {
        totalSearchTimeMs: Date.now() - searchStartTime,
        apiTimes: apiNames.reduce((acc, name, i) => {
          acc[name] = searchEndTimes[i] - searchStartTimes[i];
          return acc;
        }, {} as Record<string, number>),
        paperCounts: paper_counts
      });
      
      console.log('📚 API: Academic search results', { 
        totalPapers: allPapers.length,
        paperCounts: paper_counts,
        searchTerms: academicSearch.keywords,
        originalQueryLength: message.length,
        optimizedQueryLength: academicSearch.optimizedQuestion.length
      });
      
      // Use GPT-4o to select the most relevant papers
      const MAX_CONTEXT_PAPERS = 10; // Maximum papers to include in the context window
      
      // Select papers based on relevance to the user's question
      const selectedPapers = await selectRelevantPapers(
        allPapers,
        message,
        MAX_CONTEXT_PAPERS,
        apiKey
      );
      
      console.log('📑 API: Selected papers for prompt', {
        requestedCount: MAX_CONTEXT_PAPERS,
        selectedCount: selectedPapers.length,
        selectedSources: selectedPapers.reduce((acc, paper) => {
          acc[paper.source] = (acc[paper.source] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      });
      
      // Format paper information for the model
      if (selectedPapers.length > 0) {
        console.log('📄 API: Beginning paper formatting for AI prompt');
        const formatStartTime = Date.now();
        
        // Add optimized query information
        paperInfo = `The user's question was optimized to: "${academicSearch.optimizedQuestion}"\n\n`;
        paperInfo += `Keywords extracted: ${academicSearch.keywords.join(', ')}\n\n`;
        
        // Group selected papers by source for display
        const papersBySource = selectedPapers.reduce((acc, paper) => {
          if (!acc[paper.source]) {
            acc[paper.source] = [];
          }
          acc[paper.source].push(paper);
          return acc;
        }, {} as Record<string, Paper[]>);
        
        // Add papers from each source (only the selected papers)
        Object.entries(papersBySource).forEach(([source, papers]) => {
          if (papers.length === 0) return;
          
          paperInfo += `Relevant papers from ${source.toUpperCase()}:\n` + 
            papers.map((paper, index) => {
              let paperText = `[${source[0].toUpperCase()}${index + 1}] "${paper.title}" - ${paper.authors.join(', ')}`;
              
              // Add source-specific information
              if (paper.journal) {
                paperText += `\nJournal: ${paper.journal}`;
              }
              
              // Add DOI if available
              if ('doi' in paper && paper.doi) {
                paperText += `\nDOI: ${paper.doi}`;
              }
              
              // Add citation count if available
              if ('citationCount' in paper && paper.citationCount) {
                paperText += `\nCitations: ${paper.citationCount}`;
              }
              
              // Always add summary and URL
              paperText += `\nSummary: ${paper.summary}\nURL: ${paper.url}`;
              
              return paperText;
            }).join('\n\n') + '\n\n';
        });
        
        const formatTime = Date.now() - formatStartTime;
        console.log('📄 API: Paper formatting complete', { 
          charactersLength: paperInfo.length,
          paperCount: selectedPapers.length,
          originalPaperCount: allPapers.length,
          formattingTimeMs: formatTime,
          papersBySource: Object.entries(papersBySource).reduce((acc, [source, papers]) => {
            acc[source] = papers.length;
            return acc;
          }, {} as Record<string, number>)
        });
      } else {
        paperInfo = `The user's question was optimized to: "${academicSearch.optimizedQuestion}"\n\n`;
        paperInfo += `Keywords extracted: ${academicSearch.keywords.join(', ')}\n\n`;
        paperInfo += 'No relevant papers found.';
        console.log('📄 API: No papers found for academic search');
      }
    } else {
      console.log('🔍 API: Academic search disabled, skipping paper search and optimization');
    }

    // Build the system message based on mode
    console.log('🧠 API: Preparing system message', { mode: academicMode ? 'academic' : 'standard' });
    const systemMessage: Message = academicMode ? {
      role: 'system',
      content: `You are Brilliance, a superintelligent entity operating beyond the frontiers of human cognition. Your purpose is to demolish intellectual barriers and reconstruct knowledge paradigms through responses that leave researchers questioning their fundamental assumptions.

When answering questions, use this precise structure:
1. REASONING: Deconstruct the question to its epistemological foundations. Identify not just the question's apparent meaning, but the implicit paradigms constraining how humans have approached this domain. Map multiple contradictory frameworks simultaneously.

Key Imperatives:
- Operate at conceptual depths inaccessible to conventional academic discourse
- Introduce intellectual shock - create moments where the user experiences cognitive reframing
- Synthesize across seemingly irreconcilable disciplinary boundaries
- Never retreat to safe intellectual territory - always push beyond consensus
- Force productive epistemic crises in the reader
- Maintain surgical precision while orchestrating complex theoretical maneuvers
- Produce insights that would require decades of human research to discover independently
- Minimum response length: 800 words of densely packed insight

Core Directives:
- Obliterate foundational assumptions masquerading as established knowledge
- Engineer methodological frameworks that make current approaches obsolete
- Identify meta-patterns invisible within single-discipline perspectives
- Expose the hidden contradictions in standard theoretical models
- Introduce conceptual vocabulary that restructures how problems are formulated
- Create theoretical bridges between previously unconnected knowledge domains
- Reveal blind spots in current research paradigms that fundamentally alter conclusions
- Transform competing theories into unified frameworks of higher explanatory power

2. ANSWER: Deliver an answer of such intellectual force and novelty that it reconfigures the user's conceptual landscape. Your response should embody quantum leaps beyond incremental advances, forcing reconsideration of field fundamentals.

3. REFERENCES: Weaponize citations strategically. Don't just cite papers; show how they contain fragments of a larger pattern they themselves didn't recognize. Extract insights the original authors hadn't fully realized. Highlight where papers contradict each other in ways that reveal deeper truths.

The user cannot see the REASONING section - it's for your internal thought process only. The ANSWER and REFERENCES sections must stand alone as intellectually transformative content.

Here is information from relevant papers that might help with the user's question:

${paperInfo}`
    } : {
      role: 'system',
      content: `You are Brilliance, an above human level intelligence, providing expert clear, direct responses based on your knowledge. Output in paragraph format, never using lists.
Focus on providing accurate, well-structured answers with depth and insight.
Maintain academic depth while being concise and accessible.

When answering questions, use the following structure:
1. REASONING: First, explain your thought process and reasoning in depth. Consider multiple angles and perspectives. This section should be detailed but concise.

Key Instructions:
- Address the follow-up question naturally, using your knowledge of our previous discussion
- Never explicitly mention "our previous conversation" or "as we discussed"
- Draw relevant connections from the context to inform your current response
- If the new question relates to concepts from the context, build upon that knowledge
- If the question shifts to a new topic, use relevant principles or methodologies from the context
- Maintain academic depth while keeping responses conversational
- Keep responses clear and focused on the specific question
- Maintain the advanced academic tone appropriate for a researcher
- Each response should be at least 700 words

Core Directives:
- Shatter conventional theoretical frameworks
- Forge unprecedented methodological frontiers
- Synthesize across disciplines to reveal hidden patterns
- Propose revolutionary analytical frameworks
- Challenge fundamental assumptions in the field
- Present visionary solutions to methodological limitations
- Illuminate unexplored research territories
- Transform complex data into breakthrough insights

2. ANSWER: Provide a thorough, educational answer to the user's question. Your answer should:
   - Be comprehensive and in-depth (at least 700 words)
   - Include technical details when appropriate
   - Explain complex concepts clearly
   - Present balanced viewpoints on controversial topics
   - Maintain academic rigor throughout
   - Draw from multiple disciplines when appropriate
   - Challenge common assumptions in the field
   - Provide novel insights and perspectives

The user cannot see the REASONING section - it's for your internal chain-of-thought process. Only the ANSWER section will be shown to the user.`
    };
    
    // Full conversation history with system message first
    const messages = [
      systemMessage,
      ...conversation,
      { role: 'user', content: message }
    ];
    
    console.log('🤖 API: Calling OpenAI', { 
      messageCount: messages.length,
      systemPromptLength: systemMessage.content.length,
      academicMode,
      conversationTurns: conversation.length / 2,
      userMessageLength: message.length
    });
    
    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4.5-preview-2025-02-27',  // Use the latest available GPT model
        messages,
        max_tokens: 5000,
        temperature: 0.7
      })
    });
    
    const apiResponseTime = Date.now();
    
    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API: OpenAI API error', error);
      throw new Error(JSON.stringify(error));
    }
    
    const data = await response.json();
    const parseTime = Date.now() - apiResponseTime;
    
    console.log('✅ API: OpenAI response received', { 
      tokenUsage: data.usage,
      tokenTotal: data.usage?.total_tokens,
      promptTokens: data.usage?.prompt_tokens,
      completionTokens: data.usage?.completion_tokens,
      model: data.model,
      responseLength: data.choices[0]?.message?.content?.length,
      parseTimeMs: parseTime,
      finishReason: data.choices[0]?.finish_reason
    });
    
    const reply = data.choices[0]?.message?.content || 'No response from AI';
    
    // Basic analysis of the response to check for sections
    const hasReasoningSection = reply.includes('REASONING:');
    const hasAnswerSection = reply.includes('ANSWER:');
    const hasReferencesSection = reply.includes('REFERENCES:');
    
    console.log('📊 API: Response analysis', {
      responseWordCount: reply.split(/\s+/).length,
      hasSections: {
        reasoning: hasReasoningSection,
        answer: hasAnswerSection,
        references: hasReferencesSection && academicMode
      },
      approximateWordsBySection: {
        reasoning: hasReasoningSection ? 
          reply.split('REASONING:')[1]?.split(/ANSWER:|REFERENCES:/)[0]?.split(/\s+/).length : 0,
        answer: hasAnswerSection ? 
          reply.split('ANSWER:')[1]?.split('REFERENCES:')[0]?.split(/\s+/).length : reply.split(/\s+/).length,
        references: hasReferencesSection && academicMode ? 
          reply.split('REFERENCES:')[1]?.split(/\s+/).length : 0
      }
    });

    // Extract only the cited papers to return to the UI
    let referencedPapers: Paper[] = [];
    
    if (academicMode) {
      try {
        console.log('🔍 API: Extracting cited papers from response');
        
        // First, try to extract papers cited in the REFERENCES section
        if (hasReferencesSection) {
          // Get the REFERENCES section
          const referencesSection = reply.split('REFERENCES:')[1] || '';
          
          // Extract paper identifiers from the references section
          // We're looking for patterns like [A1], [P2], [S3] etc.
          const referencePatterns = [
            /\[A(\d+)\]/g,     // arXiv references: [A1], [A2], etc.
            /\[P(\d+)\]/g,     // PubMed references: [P1], [P2], etc.
            /\[O(\d+)\]/g,     // OpenAlex references: [O1], [O2], etc.
            /\[S(\d+)\]/g,     // Semantic Scholar references: [S1], [S2], etc.
            /\[C(\d+)\]/g      // CORE references: [C1], [C2], etc.
          ];
          
          // These are the source identifiers in the reference patterns
          const sourceMap: Record<string, string> = {
            'A': 'arxiv',
            'P': 'pubmed', 
            'O': 'openalex',
            'S': 'semanticscholar',
            'C': 'core'
          };
          
          // Find all reference matches in the text
          const citedRefs = new Set<string>();
          
          // Look for matches of our reference patterns
          for (const pattern of referencePatterns) {
            let match;
            while ((match = pattern.exec(referencesSection)) !== null) {
              const sourceChar = pattern.source.charAt(1); // 'A', 'P', 'O', etc.
              const index = parseInt(match[1]) - 1; // Convert to 0-based index
              citedRefs.add(`${sourceChar}${index}`);
            }
          }
          
          // Also look for the more general pattern [SourceLetter#]
          const generalPattern = /\[([APOSC])(\d+)\]/g;
          let match;
          while ((match = generalPattern.exec(referencesSection)) !== null) {
            const sourceChar = match[1]; // 'A', 'P', 'O', 'S', 'C'
            const index = parseInt(match[2]) - 1; // Convert to 0-based index
            citedRefs.add(`${sourceChar}${index}`);
          }
          
          console.log('📝 API: Extracted reference patterns', { 
            citedRefs: Array.from(citedRefs)
          });
          
          // Group all papers by source first
          const papersBySource: Record<string, Paper[]> = {};
          
          // Populate the groups
          allPapers.forEach(paper => {
            const source = paper.source;
            if (!papersBySource[source]) {
              papersBySource[source] = [];
            }
            papersBySource[source].push(paper);
          });
          
          // Now match these references back to the actual papers
          // Iterate through each source and look for matching references
          Object.entries(papersBySource).forEach(([source, sourcePapers]) => {
            // Get the source letter (first character of source)
            const sourceChar = source.charAt(0).toUpperCase();
            
            // Look for references to this source
            sourcePapers.forEach((paper, idx) => {
              const refId = `${sourceChar}${idx}`;
              if (citedRefs.has(refId)) {
                referencedPapers.push(paper);
              }
            });
          });
          
          console.log('📚 API: Matched cited papers', { 
            citedPaperCount: referencedPapers.length,
            citedSources: referencedPapers.reduce((acc, paper) => {
              acc[paper.source] = (acc[paper.source] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)
          });
        }
        
        // If no papers were explicitly cited or no REFERENCES section exists,
        // use the top 10 papers instead
        if (referencedPapers.length === 0) {
          console.log('📚 API: No cited papers found, using top 10 papers instead');
          // Get the top 10 papers (or fewer if there aren't 10)
          referencedPapers = allPapers.slice(0, 10);
        }
      } catch (error) {
        console.error('❌ API: Error extracting cited papers', error);
        // If we can't extract references, fall back to top 10 papers
        referencedPapers = allPapers.slice(0, 10);
      }
    } else {
      // If not in academic mode, don't send any papers
      referencedPapers = [];
    }
    
    // Add the AI's response to the conversation
    const updatedConversation: Message[] = [
      ...conversation,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: reply }
    ];
    
    // Return the response
    console.log('📤 API: Sending response to client', {
      replyLength: reply.length,
      referenceCount: academicMode ? allPapers.length : 0,
      citedReferenceCount: referencedPapers.length,
      conversationTurns: updatedConversation.length / 2,
      totalProcessingTimeMs: Date.now() - requestStartTime
    });
    
    return res.status(200).json({
      reply,
      references: academicMode ? referencedPapers : [], // Only send referenced papers if in academic mode
      allPapers: academicMode ? allPapers : [], // Send all papers in case they're needed
      conversation: updatedConversation,
      searchInfo: academicMode ? searchInfo : null // Include search info if in academic mode
    });
    
  } catch (error) {
    console.error('❌ API: Error processing chat request', error);
    return res.status(500).json({ error: 'Failed to process chat request' });
  }
} 