import type { Article, Occupation } from '@/lib/types/index';

interface ResearchData {
  question: string;
  optimizedQuestion: string;
  keywords: string[];
  articles: Article[];
  timestamp: string;
  occupation: Occupation;
  answer: string;
  citations: Article[];
}

// In-memory storage for development
const researchStore = new Map<string, ResearchData>();

export async function uploadResearchData(
  questionId: string,
  data: ResearchData
): Promise<string> {
  try {
    // Add timeout of 5 minutes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000);
    console.log(`[Storage] Storing research data for ID: ${questionId}`);
    researchStore.set(questionId, data);
    console.log(`[Storage] Current store size: ${researchStore.size}`);
    clearTimeout(timeoutId);
    return `memory://${questionId}`;
  } catch (error) {
    console.error('[Storage] Error uploading research data:', error);
    throw error;
  }
}

export async function getResearchData(questionId: string): Promise<ResearchData> {
  try {
    console.log(`[Storage] Fetching research data for ID: ${questionId}`);
    const data = researchStore.get(questionId);
    if (!data) {
      console.warn(`[Storage] No data found for ID: ${questionId}`);
      return {
        question: '',
        optimizedQuestion: '',
        keywords: [],
        articles: [],
        timestamp: new Date().toISOString(),
        occupation: 'Researcher' as Occupation,
        answer: '',
        citations: []
      };
    }
    return data;
  } catch (error) {
    console.error('[Storage] Error getting research data:', error);
    throw error;
  }
}

export const FOLDERS = {
  HISTORY: 'history',
  CITATIONS: 'citations',
  RESEARCH: 'research'
} as const;

// Also export the ResearchData type for use in other files
export type { ResearchData };