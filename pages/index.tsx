import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import { Paper } from '../lib/types';
import { 
  isPubMedPaper, 
  isArxivPaper, 
  isOpenAlexPaper, 
  isSemanticScholarPaper, 
  isCorePaper,
  isUnpaywallPaper
} from '../lib/types';

// Define message type
interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Component for displaying a single message
const ChatMessage = ({ message }: { message: Message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>
      <div className="message-content">
        {message.content.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </div>
  );
};

// Component to display a single paper
const PaperCard = ({ paper, index }: { paper: Paper, index: number }) => {
  const isPubMed = isPubMedPaper(paper);
  
  return (
    <div className={`paper-card ${isPubMed ? 'pubmed-paper' : 'arxiv-paper'}`}>
      <div className="paper-source">
        {isPubMed ? '🔬 PubMed' : '📚 arXiv'}
      </div>
      <h4>{paper.title}</h4>
      <p><strong>Authors:</strong> {paper.authors.join(', ')}</p>
      
      {isPubMed && (
        <p><strong>Journal:</strong> {paper.journal}</p>
      )}
      
      <p><strong>Published:</strong> {new Date(paper.published).toLocaleDateString()}</p>
      <p className="paper-summary">{paper.summary.substring(0, 200)}...</p>
      <a href={paper.url} target="_blank" rel="noopener noreferrer">
        Read More
      </a>
    </div>
  );
};

// Component to display paper references
const PaperReferences = ({ papers, allPapers }: { papers: Paper[], allPapers: Paper[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'arxiv' | 'pubmed' | 'openalex' | 'semanticscholar' | 'core'>('all');
  const [showAll, setShowAll] = useState(false);
  
  // Determine which papers to display
  const displayPapers = showAll ? allPapers : papers;
  
  const arxivPapers = displayPapers.filter(isArxivPaper);
  const pubmedPapers = displayPapers.filter(isPubMedPaper);
  const openalexPapers = displayPapers.filter(isOpenAlexPaper);
  const semanticscholarPapers = displayPapers.filter(isSemanticScholarPaper);
  const corePapers = displayPapers.filter(isCorePaper);
  
  useEffect(() => {
    console.log('📚 UI: Rendering paper references', { 
      citedCount: papers.length,
      totalCount: allPapers.length,
      showingAll: showAll,
      activeTab
    });
  }, [papers, allPapers, showAll, activeTab]);
  
  if ((!papers || papers.length === 0) && (!allPapers || allPapers.length === 0)) return null;
  
  // Filter papers based on active tab
  const filteredPapers = activeTab === 'all' 
    ? displayPapers 
    : activeTab === 'arxiv' 
      ? arxivPapers 
      : activeTab === 'pubmed'
        ? pubmedPapers
        : activeTab === 'openalex'
          ? openalexPapers
          : activeTab === 'semanticscholar'
            ? semanticscholarPapers
            : corePapers;
  
  return (
    <div className="paper-references">
      <div 
        className="references-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h3>
          {showAll 
            ? `All Papers (${allPapers.length})` 
            : `Cited Papers (${papers.length})`}
        </h3>
        <div className="header-controls">
          <label className="show-all-toggle">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => {
                e.stopPropagation();
                setShowAll(e.target.checked);
              }}
            />
            <span>Show All Papers</span>
          </label>
          <button className="toggle-button">
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="references-content">
          <div className="paper-tabs">
            <button 
              className={`tab ${activeTab === 'all' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('all');
              }}
            >
              All ({displayPapers.length})
            </button>
            {arxivPapers.length > 0 && (
              <button 
                className={`tab ${activeTab === 'arxiv' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('arxiv');
                }}
              >
                arXiv ({arxivPapers.length})
              </button>
            )}
            {pubmedPapers.length > 0 && (
              <button 
                className={`tab ${activeTab === 'pubmed' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('pubmed');
                }}
              >
                PubMed ({pubmedPapers.length})
              </button>
            )}
            {openalexPapers.length > 0 && (
              <button 
                className={`tab ${activeTab === 'openalex' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('openalex');
                }}
              >
                OpenAlex ({openalexPapers.length})
              </button>
            )}
            {semanticscholarPapers.length > 0 && (
              <button 
                className={`tab ${activeTab === 'semanticscholar' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('semanticscholar');
                }}
              >
                Semantic Scholar ({semanticscholarPapers.length})
              </button>
            )}
            {corePapers.length > 0 && (
              <button 
                className={`tab ${activeTab === 'core' ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab('core');
                }}
              >
                CORE ({corePapers.length})
              </button>
            )}
          </div>
          
          <div className="papers-list">
            {filteredPapers.map((paper, index) => (
              <PaperCard 
                key={`paper-${paper.source}-${index}`} 
                paper={paper} 
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [references, setReferences] = useState<Paper[]>([]);
  const [academicModeEnabled, setAcademicModeEnabled] = useState(true);
  const [allPapers, setAllPapers] = useState<Paper[]>([]);
  const [showAllPapers, setShowAllPapers] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    console.log('🏠 UI: Home component mounted');
    return () => {
      console.log('🏠 UI: Home component unmounted');
    };
  }, []);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    console.log('💬 UI: Messages updated', { count: messages.length });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;
    
    console.log('🔤 UI: User submitted message', { messageLength: inputMessage.length });
    
    // Add user message to the chat
    const userMessage: Message = { role: 'user', content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    console.log('🔄 UI: Sending API request to /api/chat');
    
    try {
      // Send request to the API
      const startTime = Date.now();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversation: messages,
          academicMode: academicModeEnabled
        }),
      });
      
      const endTime = Date.now();
      console.log('⏱️ UI: API request completed', { 
        timeMs: endTime - startTime,
        status: response.status
      });
      
      if (!response.ok) {
        console.error('❌ UI: API request failed', { status: response.status });
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      console.log('📩 UI: Response data received', { 
        replyLength: data.reply.length,
        citedReferenceCount: data.references?.length || 0,
        totalReferenceCount: data.allPapers?.length || 0,
        citedSources: data.references?.reduce((acc: Record<string, number>, p: Paper) => {
          acc[p.source] = (acc[p.source] || 0) + 1;
          return acc;
        }, {})
      });
      
      // Add assistant message to the chat
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: data.reply 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setReferences(data.references || []);
      setAllPapers(data.allPapers || []);
      
    } catch (error) {
      console.error('❌ UI: Error sending message', error);
      
      // Add error message
      const errorMessage: Message = { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing your request. Please try again.' 
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      console.log('✅ UI: Request handling complete');
      setIsLoading(false);
    }
  };
  
  // Toggle academic mode handler
  const toggleAcademicMode = () => {
    setAcademicModeEnabled(prev => !prev);
    // Clear references when turning off academic mode
    if (academicModeEnabled) {
      setReferences([]);
    }
  };
  
  return (
    <div className="container">
      <Head>
        <title>ArXiv & PubMed Chat</title>
        <meta name="description" content="Chat with AI powered by arXiv and PubMed papers" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="main">
        <h1 className="title">Research Chat</h1>
        <p className="subtitle">Powered by arXiv and PubMed</p>
        
        <div className="mode-toggle">
          <label className="toggle-label">
            <span className={academicModeEnabled ? 'active' : ''}>
              {academicModeEnabled ? '🔬 Academic Mode' : '💬 Chat Mode'}
            </span>
            <div className="toggle-switch-container">
              <input
                type="checkbox"
                checked={academicModeEnabled}
                onChange={toggleAcademicMode}
                className="toggle-input"
              />
              <div className="toggle-switch"></div>
            </div>
          </label>
        </div>
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                {/* Removed the welcome message as requested */}
              </div>
            ) : (
              messages.map((msg, index) => (
                <ChatMessage key={`msg-${index}`} message={msg} />
              ))
            )}
            {isLoading && (
              <div className="loading-message">
                <div className="loading-indicator">
                  <span>.</span><span>.</span><span>.</span>
                </div>
                <p>
                  {academicModeEnabled 
                    ? 'Searching arXiv, PubMed and thinking...' 
                    : 'Thinking...'}
                </p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                if (e.target.value.length % 10 === 0 && e.target.value.length > 0) {
                  console.log('⌨️ UI: User typing', { length: e.target.value.length });
                }
              }}
              placeholder={academicModeEnabled 
                ? "Ask about a research topic..." 
                : "Ask me anything..."
              }
              disabled={isLoading}
              className="message-input"
            />
            <button 
              type="submit" 
              disabled={isLoading || !inputMessage.trim()}
              className="send-button"
              onClick={() => console.log('🔘 UI: Send button clicked')}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
        </div>
        
        {references.length > 0 && academicModeEnabled && 
          <PaperReferences papers={references} allPapers={allPapers} />
        }
      </main>
      
      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .main {
          padding: 2rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        
        .title {
          margin: 0;
          line-height: 1.15;
          font-size: 2.5rem;
          text-align: center;
        }
        
        .subtitle {
          margin: 0.5rem 0 2rem;
          text-align: center;
          color: #666;
          font-size: 1.1rem;
        }
        
        .chat-container {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 60vh;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          background-color: #f9f9f9;
        }
        
        .welcome-message {
          text-align: center;
          color: #666;
          margin: auto 0;
        }
        
        .message {
          display: flex;
          margin-bottom: 1rem;
          max-width: 80%;
        }
        
        .user-message {
          align-self: flex-end;
          flex-direction: row-reverse;
        }
        
        .assistant-message {
          align-self: flex-start;
        }
        
        .message-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 0.5rem;
          font-size: 1.2rem;
        }
        
        .message-content {
          padding: 0.75rem 1rem;
          border-radius: 18px;
          background-color: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        
        .user-message .message-content {
          background-color: #0070f3;
          color: white;
        }
        
        .input-form {
          display: flex;
          padding: 1rem;
          border-top: 1px solid #eaeaea;
          background-color: white;
        }
        
        .message-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid #eaeaea;
          border-radius: 24px;
          margin-right: 0.5rem;
          font-size: 1rem;
        }
        
        .send-button {
          padding: 0.75rem 1.5rem;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 24px;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .send-button:hover:not(:disabled) {
          background-color: #0051cc;
        }
        
        .send-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .loading-message {
          align-self: center;
          text-align: center;
          color: #666;
          margin: 1rem 0;
        }
        
        .loading-indicator {
          display: flex;
          justify-content: center;
        }
        
        .loading-indicator span {
          animation: loading 1s infinite;
          font-size: 2rem;
          margin: 0 0.2rem;
        }
        
        .loading-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .loading-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes loading {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
        
        .paper-references {
          margin-top: 2rem;
          padding: 0;
          border: 1px solid #eaeaea;
          border-radius: 10px;
          overflow: hidden;
        }
        
        .references-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          cursor: pointer;
          background-color: #f5f5f5;
          border-bottom: isExpanded ? '1px solid #eaeaea' : 'none';
          transition: background-color 0.2s;
        }
        
        .references-header:hover {
          background-color: #eaeaea;
        }
        
        .references-header h3 {
          margin: 0;
        }
        
        .references-content {
          padding: 1rem;
          animation: fadeIn 0.3s ease-in-out;
        }
        
        .toggle-button {
          background: none;
          border: none;
          color: #666;
          font-size: 1rem;
          cursor: pointer;
          padding: 0.3rem 0.5rem;
          transition: all 0.2s;
        }
        
        .toggle-button:hover {
          color: #0070f3;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .paper-tabs {
          display: flex;
          margin-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        
        .tab {
          padding: 0.5rem 1rem;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #666;
          transition: all 0.2s;
        }
        
        .tab:hover {
          color: #0070f3;
        }
        
        .tab.active {
          color: #0070f3;
          border-bottom: 2px solid #0070f3;
        }
        
        .papers-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .paper-card {
          position: relative;
          padding: 1.5rem 1rem 1rem;
          border: 1px solid #eaeaea;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .paper-source {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.3rem 0.6rem;
          font-size: 0.8rem;
          border-bottom-left-radius: 5px;
        }
        
        .arxiv-paper .paper-source {
          background-color: #f0f7ff;
          color: #0070f3;
        }
        
        .pubmed-paper .paper-source {
          background-color: #f0fff5;
          color: #00a36f;
        }
        
        .arxiv-paper {
          border-top: 3px solid #0070f3;
        }
        
        .pubmed-paper {
          border-top: 3px solid #00a36f;
        }
        
        .paper-card h4 {
          margin-top: 0;
          color: #333;
        }
        
        .arxiv-paper h4 {
          color: #0070f3;
        }
        
        .pubmed-paper h4 {
          color: #00a36f;
        }
        
        .paper-summary {
          margin-bottom: 0.5rem;
          color: #444;
          font-size: 0.9rem;
        }
        
        .paper-card a {
          display: inline-block;
          margin-top: 0.5rem;
          text-decoration: none;
        }
        
        .arxiv-paper a {
          color: #0070f3;
        }
        
        .pubmed-paper a {
          color: #00a36f;
        }
        
        .paper-card a:hover {
          text-decoration: underline;
        }
        
        .mode-toggle {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }
        
        .toggle-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          user-select: none;
          gap: 0.5rem;
        }
        
        .toggle-label span {
          font-size: 0.9rem;
          color: #666;
          transition: color 0.3s;
          width: 120px;
          text-align: right;
        }
        
        .toggle-label span.active {
          color: #0070f3;
          font-weight: 500;
        }
        
        .toggle-switch-container {
          position: relative;
          width: 50px;
          height: 26px;
        }
        
        .toggle-input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .toggle-switch {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 34px;
        }
        
        .toggle-switch:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 4px;
          bottom: 4px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }
        
        input:checked + .toggle-switch {
          background-color: #0070f3;
        }
        
        input:checked + .toggle-switch:before {
          transform: translateX(24px);
        }
        
        .mode-hint {
          font-style: italic;
          color: #666;
          font-size: 0.9rem;
          margin-top: 1rem;
        }
        
        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .show-all-toggle {
          display: flex;
          align-items: center;
          font-size: 0.8rem;
          cursor: pointer;
          user-select: none;
        }
        
        .show-all-toggle input {
          margin-right: 0.5rem;
        }
      `}</style>
      
      <style jsx global>{`
        html, body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen,
            Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif;
        }
        
        * {
          box-sizing: border-box;
        }
        
        p {
          margin: 0.5rem 0;
        }
      `}</style>
    </div>
  );
} 