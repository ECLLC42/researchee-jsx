'use client';

import { PaperAirplaneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useState, useRef, useEffect } from 'react';
import type { Occupation, ResponseLength } from '@/lib/types';

interface ChatInputProps {
  onSend: (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
    }
  }) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}

export default function ChatInput({ 
  onSend, 
  input, 
  handleInputChange, 
  disabled 
}: ChatInputProps) {
  const [occupation, setOccupation] = useState<Occupation>('Researcher');
  const [responseLength, setResponseLength] = useState<ResponseLength>('standard');
  const [withSearch, setWithSearch] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(e, {
        data: {
          occupation,
          responseLength
        }
      });
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
    <div className="border-t border-gray-800 bg-gray-950 p-4 pb-[env(safe-area-inset-bottom)]">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-4">
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value as Occupation)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-3 text-gray-200 
              appearance-none w-full sm:w-auto"
          >
            <option value="Researcher">Researcher</option>
            <option value="PhD Physician">Physician</option>
            <option value="Psychologist">Psychologist</option>
          </select>

          <select
            value={responseLength}
            onChange={(e) => setResponseLength(e.target.value as ResponseLength)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-3 text-gray-200 
              appearance-none w-full sm:w-auto"
          >
            <option value="standard">Standard (500-1000 words)</option>
            <option value="extended">Extended (1000-2000 words)</option>
          </select>

          <button
            type="button"
            onClick={() => setWithSearch(!withSearch)}
            className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg border w-full sm:w-auto
              ${withSearch 
                ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                : 'bg-gray-800 border-gray-700 text-gray-400'
              } transition-colors duration-200`}
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            {withSearch ? 'Search Enabled' : 'Search Disabled'}
          </button>
        </div>

        <div className="relative bg-gray-900 rounded-lg shadow-lg border border-gray-800">
          <textarea
            ref={textareaRef}
            name="message"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a research question..."
            className="flex-1 max-h-32 p-4 pr-12 bg-transparent border-0 resize-none 
              focus:ring-0 focus:outline-none text-gray-200 placeholder-gray-500
              min-h-[44px] rounded-none"
            rows={1}
            disabled={disabled}
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`absolute right-2 bottom-3 p-2 rounded-lg min-h-[44px] min-w-[44px]
              ${disabled || !input.trim()
                ? 'bg-gray-800 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-500'
              } transition-colors duration-200`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
} 