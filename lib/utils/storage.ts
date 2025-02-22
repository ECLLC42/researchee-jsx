import type { Article } from '@/lib/types';

interface ResearchData {
  question: string;
  optimizedQuestion: string;
  keywords: string[];
  articles: Article[];
  timestamp: string;
  occupation: string;
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
    console.log(`[Storage] Storing research data for ID: ${questionId}`);
    researchStore.set(questionId, data);
    console.log(`[Storage] Current store size: ${researchStore.size}`);
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
        occupation: 'Researcher',
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