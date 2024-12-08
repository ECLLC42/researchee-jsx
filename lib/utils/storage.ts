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
    // Store in memory
    researchStore.set(questionId, data);
    return `memory://${questionId}`;
  } catch (error) {
    console.error('Error uploading research data:', error);
    throw error;
  }
}

export async function getResearchData(questionId: string): Promise<ResearchData> {
  try {
    // Get from memory
    const data = researchStore.get(questionId);
    if (!data) {
      throw new Error(`Research data not found for ID: ${questionId}`);
    }
    return data;
  } catch (error) {
    console.error('Error getting research data:', error);
    throw error;
  }
}

export const FOLDERS = {
  HISTORY: 'history',
  CITATIONS: 'citations',
  RESEARCH: 'research'
} as const;