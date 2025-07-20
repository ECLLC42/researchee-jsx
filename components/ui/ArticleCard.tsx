'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import type { Article } from '@/lib/types/index';

export type ArticleCardProps = Article;

export function ArticleCard({ 
  title, 
  authors, 
  published, 
  abstract, 
  url,
  source  // Add source prop
}: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const safeAbstract = typeof abstract === 'string' && abstract.trim() !== '' 
    ? abstract 
    : 'No abstract available.';
  const sentences = safeAbstract.split('.').map(s => s.trim()).filter(Boolean);
  const previewAbstract = sentences.slice(0, 3).join('. ') + (sentences.length > 3 ? '.' : '');
  
  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all">
      <div className="flex justify-between items-start mb-2">
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex-1"
        >
          <h3 className="text-lg font-medium text-blue-400 hover:text-blue-300">
            {title}
          </h3>
        </a>
        <span className="text-xs text-gray-400 ml-2">
          {source}
        </span>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        {authors.join(', ')} ({published})
      </div>
      
      <div className="text-gray-300">
        {isExpanded ? safeAbstract : previewAbstract}
      </div>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 flex items-center text-sm text-gray-400 hover:text-gray-300"
      >
        {isExpanded ? (
          <>
            <ChevronUpIcon className="w-4 h-4 mr-1" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDownIcon className="w-4 h-4 mr-1" />
            Read More
          </>
        )}
      </button>
    </div>
  );
} 