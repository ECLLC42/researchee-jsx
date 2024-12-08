import { createContext, useContext, ReactNode } from 'react';
import type { ResearchData, Article, Occupation } from '../types';

interface ResearchContextType {
  currentResearch: ResearchData | null;
  setCurrentResearch: (data: ResearchData | null) => void;
  isLoading: boolean;
  error: string | null;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export function ResearchProvider({ children }: { children: ReactNode }) {
  // Implementation here
}

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
}; 