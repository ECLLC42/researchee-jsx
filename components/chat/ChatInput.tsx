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
    <div className="border-t border-gray-800 bg-gray-950/80 backdrop-blur-sm p-4 pb-12 mb-4 pb-[env(safe-area-inset-bottom)]">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
          <div className="w-full sm:w-auto text-center">
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value as Occupation)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 
                appearance-none w-full sm:w-auto mb-2 sm:mb-0 hover:border-gray-600 focus:border-blue-500/50
                transition-colors text-center"
            >
              <option value="Researcher">👨‍🔬 Researcher</option>
              <option value="PhD Physician">👨‍⚕️ Physician</option>
              <option value="Psychologist">🧠 Psychologist</option>
            </select>
          </div>

          <div className="w-full sm:w-auto text-center">
            <select
              value={responseLength}
              onChange={(e) => setResponseLength(e.target.value as ResponseLength)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-gray-200 
                appearance-none w-full sm:w-auto mb-2 sm:mb-0 hover:border-gray-600 focus:border-blue-500/50
                transition-colors text-center"
            >
              <option value="standard">📝 Standard</option>
              <option value="extended">�� Extended</option>
            </select>
          </div>

          <div className="w-full sm:w-auto text-center">
            <button
              type="button"
              onClick={() => setWithSearch(!withSearch)}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg border w-full sm:w-auto
                ${withSearch 
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-300 hover:bg-blue-500/30'
                  : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                } transition-all duration-200`}
            >
              {withSearch ? '🔍' : '🚫'} 
              <span className="hidden sm:inline">{withSearch ? 'Search Enabled' : 'Search Disabled'}</span>
              <span className="sm:hidden">{withSearch ? 'Search On' : 'Search Off'}</span>
            </button>
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
  );
} 