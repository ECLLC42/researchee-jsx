'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useResearch } from '@/lib/hooks/useResearch';
import { type Occupation } from '@/lib/utils/openai';

type ResponseLength = 'standard' | 'extended';

interface ChatInputProps {
  onSend: (e: React.FormEvent<HTMLFormElement>) => void;
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
  const { optimizeAndSearch, isOptimizing } = useResearch();
  const [withSearch, setWithSearch] = useState(true);
  const [occupation, setOccupation] = useState<Occupation>('Researcher');
  const [responseLength, setResponseLength] = useState<ResponseLength>('standard');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      const form = e.currentTarget;
      const formData = new FormData(form);
      formData.append('withSearch', String(withSearch));
      formData.append('occupation', occupation);
      formData.append('maxTokens', String(responseLength === 'standard' ? 1800 : 3800));
      onSend(e);
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
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-4">
          <select
            value={occupation}
            onChange={(e) => setOccupation(e.target.value as Occupation)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200"
          >
            <option value="Researcher">Researcher</option>
            <option value="PhD Physician">Physician</option>
            <option value="Psychologist">Psychologist</option>
          </select>

          <select
            value={responseLength}
            onChange={(e) => setResponseLength(e.target.value as ResponseLength)}
            className="bg-gray-900 border border-gray-800 rounded-lg px-3 py-2 text-gray-200"
          >
            <option value="standard">Standard (500-1000 words)</option>
            <option value="extended">Extended (1000-2000 words)</option>
          </select>

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
            Search {withSearch ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        <div className="relative flex items-end bg-gray-900 rounded-lg shadow-lg">
          <textarea
            ref={textareaRef}
            name="message"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a research question..."
            className="flex-1 max-h-32 p-4 pr-12 bg-transparent border-0 resize-none focus:ring-0 focus:outline-none text-gray-200 placeholder-gray-500"
            rows={1}
            disabled={disabled}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`absolute right-2 bottom-3 p-1.5 rounded-lg 
              ${disabled || !input.trim()
                ? 'bg-gray-800 text-gray-500'
                : 'bg-blue-600 text-white hover:bg-blue-500'
              } transition-colors duration-200`}
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
} 