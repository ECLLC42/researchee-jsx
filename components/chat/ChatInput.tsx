'use client';

import { PaperAirplaneIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { useState, useRef, useEffect } from 'react';
import type { Occupation } from '@/lib/types';

interface ChatInputProps {
  onSend: (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      withSearch: boolean;
      searchSource: 'pubmed' | 'arxiv' | 'both';
    }
  }) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  saveSessionButton?: React.ReactNode;
}

export default function ChatInput({ 
  onSend, 
  input, 
  handleInputChange, 
  disabled,
  saveSessionButton
}: ChatInputProps) {
  const [occupation, setOccupation] = useState<Occupation>('Researcher');
  const [withSearch, setWithSearch] = useState(true);
  const [searchSource, setSearchSource] = useState<'pubmed' | 'arxiv' | 'both'>('both');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(e, {
        data: {
          occupation,
          withSearch,
          searchSource
        }
      });
      // Clear the textarea
      const textarea = e.currentTarget.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
        // Trigger resize
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    // Fix iOS keyboard issues
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return (
    <div className="w-full bg-gray-950/80 backdrop-blur-sm rounded-xl border border-gray-800">
      <div className="w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-wrap sm:flex-nowrap justify-between gap-2">
            <div className="relative w-[calc(50%-4px)] sm:w-auto sm:flex-1">
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value as Occupation)}
                className="bg-gray-800/90 border border-gray-700 rounded-lg pl-3 pr-8 py-2.5 text-gray-200 
                  appearance-none w-full hover:border-blue-500/40 focus:border-blue-500/60 
                  transition-colors text-center text-sm h-12"
              >
                <option value="Researcher">🔬 Researcher</option>
                <option value="PhD Physician">👨‍⚕️ PhD Physician</option>
                <option value="Psychologist">🧠 Psychologist</option>
              </select>
            </div>

            <div className="relative w-[calc(50%-4px)] sm:w-auto sm:flex-1">
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={searchSource}
                onChange={(e) => setSearchSource(e.target.value as 'pubmed' | 'arxiv' | 'both')}
                className="bg-gray-800/90 border border-gray-700 rounded-lg pl-3 pr-8 py-2.5 text-gray-200 
                  appearance-none w-full hover:border-blue-500/40 focus:border-blue-500/60 
                  transition-colors text-center text-sm h-12"
              >
                <option value="both">🔍 Both APIs</option>
                <option value="pubmed">🏥 PubMed</option>
                <option value="arxiv">📚 arXiv</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setWithSearch(!withSearch)}
              className={`w-[calc(50%-4px)] sm:w-auto sm:flex-1 flex items-center justify-center gap-1 rounded-lg border h-12
                ${withSearch 
                  ? 'bg-blue-600/30 border-blue-500/50 text-blue-300 hover:bg-blue-600/40'
                  : 'bg-gray-800/90 border-gray-700 text-gray-400 hover:bg-gray-700/90'
                } transition-all duration-200`}
            >
              {withSearch ? '🔍' : '🚫'} 
              <span className="text-sm">
                {withSearch ? 'Search On' : 'Search Off'}
              </span>
            </button>
            
            <div className="w-[calc(50%-4px)] sm:w-auto sm:flex-1 h-12 flex items-center justify-center">
              {saveSessionButton}
            </div>
          </div>

          <div className="relative bg-gray-900/70 rounded-xl shadow-lg border-2 border-purple-600/40 hover:border-purple-500/60 focus-within:border-purple-400/80 transition-all duration-200">
            <textarea
              ref={textareaRef}
              name="message"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a research question..."
              className="w-full max-h-32 p-5 pr-14 bg-transparent border-0 resize-none 
                focus:ring-0 focus:outline-none text-gray-200 placeholder-gray-400
                min-h-[44px] rounded-none text-lg"
              rows={1}
              disabled={disabled}
              style={{ minHeight: '48px' }}
            />
            <button
              type="submit"
              disabled={disabled || !input.trim()}
              className={`absolute right-3 bottom-3 p-2.5 rounded-lg min-h-[44px] min-w-[44px]
                ${disabled || !input.trim()
                  ? 'bg-gray-800/80 text-gray-500'
                  : 'bg-purple-600 text-white hover:bg-purple-500 active:scale-95'
                } transition-all duration-200 shadow-lg`}
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 