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

  return (
    <div className="border-t border-gray-800 bg-gray-950 p-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:gap-4 space-y-2 md:space-y-0 mb-2">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Role:</label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value as Occupation)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200"
            >
              <option value="Researcher">Researcher</option>
              <option value="PhD Physician">Physician</option>
              <option value="Psychologist">Psychologist</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-400">Response Length:</label>
            <select
              value={responseLength}
              onChange={(e) => setResponseLength(e.target.value as ResponseLength)}
              className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200"
            >
              <option value="standard">Standard (~500-1000 words)</option>
              <option value="extended">Extended (~1000-2000 words)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setWithSearch(!withSearch)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
              withSearch 
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
            className="w-full p-4 pr-12 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-200 placeholder-gray-500"
            rows={1}
            disabled={disabled}
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`absolute right-2 bottom-2 flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium ${
              disabled || !input.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            <PaperAirplaneIcon className="w-4 h-4" />
            Send
          </button>
        </div>
      </form>
    </div>
  );
} 