import type { Message } from 'ai';

// Chat Types
export interface ChatMessage {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata?: {
    articles?: Article[];
    originalQuestion?: string;
    keywords?: string[];
    occupation?: Occupation;
    questionId?: string;
  };
}

// Article Types
export interface Article {
  title: string;
  authors: string[];
  published: string;
  abstract: string;
  url: string;
  source: string;
}

// Blob Storage Types
export interface BlobResponse {
  url: string;
  pathname: string;
}

// Research Types
export interface ResearchData {
  id: string;
  question: string;
  optimizedQuestion: string;
  keywords: string[];
  articles: Article[];
  timestamp: string;
  occupation: Occupation;
  answer: string;
  citations: Article[];
}

// User Types
export type Occupation = "Researcher" | "PhD Physician" | "Psychologist";
export type ResponseLength = "standard" | "extended";

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Search Types
export interface SearchResult {
  articles: Article[];
  keywords: string[];
  optimizedQuestion: string;
}

export interface ExtendedMessage extends Message {
  metadata?: {
    articles?: Article[];
    originalQuestion?: string;
    keywords?: string[];
    occupation?: string;
    questionId?: string;
  };
} 