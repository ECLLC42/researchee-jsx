'use client';

import { PaperAirplaneIcon, ChevronDownIcon, Cog6ToothIcon } from '@heroicons/react/24/solid';
import { useState, useRef, useEffect } from 'react';
import type { Occupation, ResponseLength } from '@/lib/types/index';

interface ChatInputProps {
  onSend: (e: React.FormEvent<HTMLFormElement>, options?: { 
    data?: {
      occupation: Occupation;
      responseLength: ResponseLength;
      withSearch: boolean;
      searchSource: 'pubmed' | 'arxiv' | 'both';
      showReasoning?: boolean;
    }
  }) => void;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
  currentOccupation?: Occupation;
  currentResponseLength?: ResponseLength;
  currentShowReasoning?: boolean;
  onOccupationChange?: (occupation: Occupation) => void;
  onResponseLengthChange?: (responseLength: ResponseLength) => void;
  onShowReasoningChange?: (showReasoning: boolean) => void;
}

export default function ChatInput({ 
  onSend, 
  input, 
  handleInputChange, 
  disabled,
  currentOccupation = 'Researcher',
  currentResponseLength = 'standard',
  currentShowReasoning = false,
  onOccupationChange,
  onResponseLengthChange,
  onShowReasoningChange
}: ChatInputProps) {
  const [occupation, setOccupation] = useState<Occupation>(currentOccupation);
  const [responseLength, setResponseLength] = useState<ResponseLength>(currentResponseLength);
  const [withSearch, setWithSearch] = useState(true);
  const [searchSource, setSearchSource] = useState<'pubmed' | 'arxiv' | 'both'>('both');
  const [showReasoning, setShowReasoning] = useState(currentShowReasoning);
  const [showSettings, setShowSettings] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync with external state
  useEffect(() => {
    setOccupation(currentOccupation);
  }, [currentOccupation]);

  useEffect(() => {
    setResponseLength(currentResponseLength);
  }, [currentResponseLength]);

  useEffect(() => {
    setShowReasoning(currentShowReasoning);
  }, [currentShowReasoning]);

  const handleOccupationChange = (newOccupation: Occupation) => {
    setOccupation(newOccupation);
    onOccupationChange?.(newOccupation);
  };

  const handleResponseLengthChange = (newResponseLength: ResponseLength) => {
    setResponseLength(newResponseLength);
    onResponseLengthChange?.(newResponseLength);
  };

  const handleShowReasoningChange = (newShowReasoning: boolean) => {
    setShowReasoning(newShowReasoning);
    onShowReasoningChange?.(newShowReasoning);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(e, {
        data: {
          occupation,
          responseLength,
          withSearch,
          searchSource,
          showReasoning
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  return (
    <div className="w-full bg-gray-900/95 backdrop-blur-sm border-t border-gray-800">
      <div className="px-4 py-4">
        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Expert Type
                </label>
                <select
                  value={occupation}
                  onChange={(e) => handleOccupationChange(e.target.value as Occupation)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Researcher">🔬 Researcher</option>
                  <option value="PhD Physician">👨‍⚕️ Physician</option>
                  <option value="Psychologist">🧠 Psychologist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Search Source
                </label>
                <select
                  value={searchSource}
                  onChange={(e) => setSearchSource(e.target.value as 'pubmed' | 'arxiv' | 'both')}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="both">🔍 Both APIs</option>
                  <option value="pubmed">🏥 PubMed</option>
                  <option value="arxiv">📚 arXiv</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Response Length
                </label>
                <select
                  value={responseLength}
                  onChange={(e) => handleResponseLengthChange(e.target.value as ResponseLength)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="standard">Standard</option>
                  <option value="extended">Extended</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Search Mode
                </label>
                <button
                  type="button"
                  onClick={() => setWithSearch(!withSearch)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    withSearch 
                      ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300 hover:bg-blue-600/30'
                      : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {withSearch ? '🔍 Enabled' : '🚫 Disabled'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Show Reasoning
                </label>
                <button
                  type="button"
                  onClick={() => handleShowReasoningChange(!showReasoning)}
                  className={`w-full px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    showReasoning 
                      ? 'bg-purple-600/20 border border-purple-500/50 text-purple-300 hover:bg-purple-600/30'
                      : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {showReasoning ? '🧠 Enabled' : '🚫 Disabled'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Settings Toggle */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-lg transition-colors ${
              showSettings 
                ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300'
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
            title="Chat Settings"
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              name="message"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask a research question..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-12 text-gray-200 placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              rows={1}
              disabled={disabled}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Character count */}
            {input.length > 0 && (
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                {input.length}
              </div>
            )}
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`p-3 rounded-lg transition-all duration-200 ${
              disabled || !input.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-lg'
            }`}
            title="Send message"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </form>

        {/* Quick Status */}
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Expert: {occupation}</span>
            <span>Search: {withSearch ? 'On' : 'Off'}</span>
            {withSearch && <span>Source: {searchSource}</span>}
            <span>Reasoning: {showReasoning ? 'On' : 'Off'}</span>
          </div>
          <span>Press Enter to send, Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
} 