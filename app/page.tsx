'use client';

import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import BottomSearch from '@/components/BottomSearch';
import ConversationalVoiceUI from '@/components/ConversationalVoiceUI';
import AIResult from '@/components/AIResult';
import ResearchProcess from '@/components/ResearchProcess';
import CognitivePath from '@/components/CognitivePath';
import MagneticButton from '@/components/MagneticButton';
import ArchivePage from '@/components/ArchivePage';
import { saveToHistory, getHistoryItem } from '@/lib/history';
import EclipseLogo from '@/components/EclipseLogo';
import OnboardingLanguageScreen from '@/components/OnboardingLanguageScreen';
import LanguageSettings from '@/components/LanguageSettings';
import { useLanguage } from '@/components/LanguageProvider';
import { SearchResult } from '../lib/search';
import { LLMResponse } from '../lib/llm';
import {
  LucideIcon,
  LayoutGrid,
  Zap,
  ArrowUp,
  Microscope,
  Clock,
  Triangle,
  ArrowRight,
  Plus,
  ChevronDown,
  Globe,
  Radar,
  Mic,
  X,
  FileText,
  Search,
  Sparkles,
  History,
  Settings,
  Info,
} from 'lucide-react';
import { initSpeechRecognition } from '@/lib/voice';
import SearchSuggestions from '@/components/SearchSuggestions';

interface FinalResult {
  query: string;
  results: SearchResult[];
  answer: LLMResponse;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content?: string;
  query?: string;
  result?: FinalResult | null;
  streamEvents?: any[];
  streamingText?: string;
  loading?: boolean;
  mode?: string;
}

interface Session {
  id: string;
  title: string;
  mode: "fast" | "research_extreme" | "deep";
  createdAt: string;
  messages: Message[];
}

export default function Home() {
  const { t, language, hasSelectedLanguage, isRTL } = useLanguage();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [detectedUrls, setDetectedUrls] = useState<Array<{url: string; domain: string; content?: any}>>([]);
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [mode, setMode] = useState('fast');
  const [selectedModel, setSelectedModel] = useState('Grok 4.1 Fast');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'archive'>('home');
  const [isTyping, setIsTyping] = useState(false);
  const [isVoiceUIOpen, setIsVoiceUIOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLanguageSettings, setShowLanguageSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || null;
  const loading = activeSession?.messages.some(m => m.loading) || false;

  useEffect(() => {
    const saved = localStorage.getItem('eclipse_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to parse sessions", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sessions.length > 0 || (typeof window !== 'undefined' && localStorage.getItem('eclipse_sessions'))) {
      localStorage.setItem('eclipse_sessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSessionId, activeSession?.messages.length, activeSession?.messages[activeSession?.messages.length - 1]?.streamEvents?.length]);

  // URL detection function
  const isURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  const extractDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  };

  const fetchUrlContent = async (url: string) => {
    setIsFetchingUrl(true);
    setUrlError(null);
    try {
      const res = await fetch('/api/fetch-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.error) {
        setUrlError(data.error);
        return null;
      }
      return data;
    } catch (e) {
      setUrlError('Could not fetch URL');
      return null;
    } finally {
      setIsFetchingUrl(false);
    }
  };

  const handleQueryChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setQuery(text);
    
    // Check for URLs
    const words = text.split(/\s+/);
    const urls = words.filter(isURL);
    
    if (urls.length > 0) {
      // Get new URLs that aren't already detected
      const newUrls = urls.filter(url => !detectedUrls.some(d => d.url === url));
      
      for (const url of newUrls) {
        if (detectedUrls.length >= 3) break; // Max 3 URLs
        const content = await fetchUrlContent(url);
        if (content) {
          setDetectedUrls(prev => [...prev, { url, domain: extractDomain(url), content }]);
          // Clear the URL from query and update placeholder
          const newQuery = text.replace(url, '').trim();
          setQuery(newQuery);
        }
      }
    }
  };

  const removeUrl = (urlToRemove: string) => {
    setDetectedUrls(prev => prev.filter(d => d.url !== urlToRemove));
  };
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
    };
    const handleEscape = (e: Event) => {
      const event = e as unknown as KeyboardEvent;
      if (event.key === 'Escape') {
        setShowModeDropdown(false);
      }
    };

    if (showModeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showModeDropdown]);

  // Handle typing/idle detection for glow effect
  useEffect(() => {
    const handleKeyDown = () => {
      setIsTyping(true);

      // Clear existing timeout
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }

      // Set new timeout to mark as idle after 2 seconds of no typing
      idleTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (idleTimeoutRef.current) {
        clearTimeout(idleTimeoutRef.current);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        setQuery(transcript);
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('STT error:', event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) { }
    };
  }, []);

  const handleSTT = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    } else {
      try {
        setIsListening(true);
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Failed to start recognition', e);
        setIsListening(false);
      }
    }
  };

  const handleSearch = async (searchQuery?: string, queryMode?: string) => {
    const q = searchQuery || query;
    if (!q.trim() && detectedUrls.length === 0) return;

    const useMode = queryMode || mode;
    let currentSessionId = activeSessionId;
    let newSessions = [...sessions];
    
    // Build query with URL context
    let finalQuery = q;
    let urlContext = '';
    
    if (detectedUrls.length > 0) {
      const urlsWithContent = detectedUrls.filter(u => u.content);
      if (urlsWithContent.length > 0) {
        urlContext = urlsWithContent.map(u => 
          `Title: ${u.content.title}\nURL: ${u.url}\nContent: ${u.content.body.slice(0, 2000)}`
        ).join('\n\n---\n\n');
        
        // If no question asked, auto-prompt for summary
        if (!q.trim()) {
          finalQuery = 'Summarize this page';
        }
        
        finalQuery = `The user has shared this webpage:\n\n${urlContext}\n\nUser question: ${finalQuery}\n\nAnswer based on the webpage content. Be specific and cite details from the page.`;
      }
    }

    // 1. Determine Session
    if (!currentSessionId) {
      const newSession: Session = {
        id: Date.now().toString(),
        title: q.length > 30 ? q.substring(0, 30) + '...' : q,
        mode: useMode as any,
        createdAt: new Date().toISOString(),
        messages: []
      };
      newSessions = [newSession, ...newSessions];
      setSessions(newSessions);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
    }

    // Add User Message
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: q };
    const assistantMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      query: q,
      loading: true,
      streamEvents: [],
      result: null,
      mode: useMode
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        return { ...s, messages: [...s.messages, userMsg, assistantMsg] };
      }
      return s;
    }));

    setQuery('');
    
    // Clear URLs after search
    setDetectedUrls([]);
    setUrlError(null);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: finalQuery, mode: useMode, model: selectedModel, language: language })
      });

      if (!response.body) throw new Error('No readable stream');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            // Update assistant message state
            setSessions(prev => prev.map(s => {
              if (s.id === currentSessionId) {
                const newMessages = s.messages.map(m => {
                  if (m.id === assistantMsg.id) {
                    const updatedEvents = [...(m.streamEvents || []), data];
                    let updatedResult = m.result;
                    // Accumulate raw LLM tokens for live preview
                    let updatedStreamingText = m.streamingText || '';
                    if (data.event === 'answer_token') {
                      updatedStreamingText += data.token;
                    }

                    if (data.event === 'result') {
                      updatedResult = {
                        ...data,
                        answer: {
                          ...data.answer,
                          segments: data.answer.segments || [],
                          longFormAnswerSegments: data.answer.longFormAnswerSegments || [],
                          cards: data.answer.cards || [],
                          followUps: data.answer.followUps || []
                        }
                      };

                      // PERSIST TO ARCHIVE
                      saveToHistory({
                        query: q,
                        resultUrl: `/search?q=${encodeURIComponent(q)}`,
                        sources: (updatedResult.results || []).map((r: any) => ({
                          name: r.title,
                          shortName: new URL(r.url).hostname.split('.')[0].toUpperCase(),
                          favicon: `https://www.google.com/s2/favicons?domain=${new URL(r.url).hostname}&sz=32`,
                          url: r.url
                        })),
                        result: updatedResult
                      });
                    }
                    return { ...m, streamEvents: updatedEvents, streamingText: updatedStreamingText, result: updatedResult, loading: data.event !== 'complete' && m.loading };
                  }
                  return m;
                });
                return { ...s, messages: newMessages };
              }
              return s;
            }));
          }
        }
      }

      // Mark complete
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMsg.id ? { ...m, loading: false } : m)
          };
        }
        return s;
      }));

    } catch (error) {
      console.error('Search error:', error);
      setSessions(prev => prev.map(s => {
        if (s.id === currentSessionId) {
          return {
            ...s,
            messages: s.messages.map(m => m.id === assistantMsg.id ? {
              ...m,
              loading: false,
              result: {
                query: q,
                answer: {
                  segments: [{ text: 'Generation failed. Ensure connections are healthy.' }],
                  keyInsight: 'Connection Error',
                  cards: [],
                  followUps: [],
                  longFormAnswerSegments: [{ text: "System unable to coalesce intelligence at this time." }]
                },
                results: []
              }
            } : m)
          };
        }
        return s;
      }));
    }
  };

  const handleVoiceSearch = async (query: string, conversationContext: any[]): Promise<string | null> => {
    if (!query.trim()) return null;

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          mode: 'fast',
          model: selectedModel,
          context: conversationContext
        })
      });

      if (!response.ok) throw new Error('Search failed');

      // Read the response to extract the final answer
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let finalAnswer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));

            // Accumulate answer tokens
            if (data.event === 'answer_token') {
              finalAnswer += data.token;
            } else if (data.event === 'result') {
              // Get the final answer from the result
              if (data.answer?.segments?.length > 0) {
                finalAnswer = data.answer.segments.map((s: any) => s.text).join(' ');
              }
            }
          }
        }
      }

      return finalAnswer || 'No answer found';
    } catch (error) {
      console.error('Voice search error:', error);
      return null;
    }
  };

  // Listen for selection menu search events
  useEffect(() => {
    const handleSelectionSearch = (e: any) => {
      const { text, mode } = e.detail;
      if (text) {
        handleSearch(text, mode);
      }
    };

    document.addEventListener('eclipse-search-selection', handleSelectionSearch);
    return () => {
      document.removeEventListener('eclipse-search-selection', handleSelectionSearch);
    };
  }, [handleSearch]);

  const handleSuggestionSelect = (suggestion: string) => {
    setQuery(suggestion);
    // Keep focus on the textarea
  };

  const resetSearch = () => {
    setActiveSessionId(null);
    setQuery('');
    setMode('fast');
    setCurrentView('home');
  };

  const focusModes = [
    { id: 'fast', label: 'Velocity', description: 'Fast, concise answers', icon: Zap },
    { id: 'research_extreme', label: 'Research', description: 'Deep multi-source analysis', icon: Globe },
    { id: 'deep', label: 'DEEP', description: 'Generative UI layout', icon: LayoutGrid },
  ];

  const suggestions = [

  ];

  return (
    <>
      {/* Language Onboarding - shown only on first visit */}
      <AnimatePresence>
        {!hasSelectedLanguage && <OnboardingLanguageScreen />}
      </AnimatePresence>

      <div className="flex h-screen bg-black text-white selection:bg-orange-500/30 font-sans overflow-hidden">
      <Sidebar
        onNew={resetSearch}
        onHistory={() => setCurrentView('archive')}
        onModeChange={(m) => {
          setMode(m);
          setCurrentView('home');
        }}
        currentView={currentView}
        currentMode={mode as 'fast' | 'research_extreme' | 'deep'}
        onOpenLanguageSettings={() => setShowLanguageSettings(true)}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto pl-[50px]">
        <AnimatePresence mode="wait">
          {currentView === 'archive' ? (
            <ArchivePage
              key="archive"
              onOpenItem={(id) => {
                const historyItem = getHistoryItem(id);
                if (historyItem && historyItem.result) {
                  const newSession: Session = {
                    id: Date.now().toString(),
                    title: historyItem.query.length > 30 ? historyItem.query.substring(0, 30) + '...' : historyItem.query,
                    mode: 'fast',
                    createdAt: historyItem.timestamp,
                    messages: [
                      { id: '1', role: 'user', content: historyItem.query },
                      {
                        id: '2',
                        role: 'assistant',
                        query: historyItem.query,
                        result: historyItem.result,
                        loading: false,
                        streamEvents: [],
                        mode: 'fast'
                      }
                    ]
                  };
                  setSessions(prev => [newSession, ...prev]);
                  setActiveSessionId(newSession.id);
                  setCurrentView('home');
                }
              }}
              onClose={() => setCurrentView('home')}
            />
          ) : (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col relative"
            >
              {(!activeSessionId || activeSession?.messages.length === 0) && (
                <>
                  <div className={`eclipse-glow ${isTyping ? 'hidden' : ''}`} />
                  <div className={`eclipse-ring ${isTyping ? 'hidden' : ''}`} />
                </>
              )}

              {!activeSessionId ? (
                <>
                  <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-6 relative z-10 w-full">
                    <div className="w-full max-w-4xl flex flex-col items-center">
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8, ease: 'easeOut' }}
                        className="flex flex-col items-center gap-1 mb-2"
                      >
                        <span className="text-[10px] font-bold text-[#e08b3a] tracking-[0.5em] uppercase opacity-70">
                          {t.intelligenceHorizon || "Intelligence Horizon"}
                        </span>
                      </motion.div>

                      <h1 className="text-[140px] text-zinc-100 text-center font-[family-name:var(--font-instrument-serif)] italic tracking-tighter leading-none mb-8 opacity-95 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(224,139,58,0.1)]">
                        Eclipse
                      </h1>

                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
                        className="text-[32px] font-[family-name:var(--font-instrument-serif)] italic text-center mb-6 tracking-tight text-[rgba(255,255,255,0.85)]"
                        style={{ letterSpacing: '-0.02em' }}
                      >

                      </motion.div>

                      <div className="w-full max-w-[640px] relative" style={{ background: 'rgba(18,15,12,0.95)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'visible', position: 'relative' }}>
                        {/* Gradient glow effect */}
                        <div 
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-16 pointer-events-none"
                          style={{
                            background: 'radial-gradient(ellipse at center, rgba(224,139,58,0.4) 0%, rgba(245,166,35,0.2) 40%, transparent 70%)',
                            filter: 'blur(20px)',
                            zIndex: -1,
                          }}
                        />
                        
                        {/* URL Chips */}
                        {detectedUrls.length > 0 && (
                          <div className="flex flex-wrap gap-2 px-5 pt-4 pb-2">
                            {detectedUrls.map((urlData, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                                style={{
                                  background: 'rgba(245,166,35,0.08)',
                                  border: '1px solid rgba(245,166,35,0.2)',
                                }}
                              >
                                <Globe size={12} style={{ color: 'rgba(245,166,35,0.8)' }} />
                                <span style={{ color: 'rgba(255,255,255,0.6)' }}>{urlData.domain}</span>
                                {isFetchingUrl && index === detectedUrls.length - 1 ? (
                                  <span style={{ color: 'rgba(245,166,35,0.6)', fontSize: '10px' }}>{t.searching || 'Reading...'}</span>
                                ) : (
                                  <button
                                    onClick={() => removeUrl(urlData.url)}
                                    className="ml-1 hover:opacity-70 transition-opacity"
                                    style={{ color: 'rgba(255,255,255,0.4)' }}
                                  >
                                    <X size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {urlError && (
                          <div className="px-5 pt-2 text-xs" style={{ color: 'rgba(245,166,35,0.8)' }}>
                            {urlError}
                          </div>
                        )}
                        
                        <textarea
                          value={query}
                          onChange={handleQueryChange}
                          onFocus={() => setIsSearchFocused(true)}
                          onBlur={() => setTimeout(() => setIsSearchFocused(false), 150)}
                          onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(); } }}
                          placeholder={detectedUrls.length > 0 ? (t.askAnything || "Ask anything about this page...") : (t.placeholder || "Deconstruct intelligence...")}
                          className="w-full bg-transparent border-none outline-none text-white text-[16px] px-5 py-5 font-[family-name:var(--font-instrument-serif)] italic leading-relaxed tracking-tight resize-none transition-all relative z-10"
                          style={{
                            color: '#ffffff',
                            minHeight: '56px',
                            padding: '18px 20px 12px 20px',
                            caretColor: 'rgba(245,166,35,0.6)'
                          }}
                        />
                        <style jsx>{`
                        textarea::placeholder {
                          color: rgba(255,255,255,0.2) !important;
                        }
                      `}</style>

                        <div className="flex items-center justify-between px-3 pb-3 relative z-20">
                          <div className="flex items-center gap-2">
                            {/* File Upload Button */}
                            <MagneticButton
                              onClick={() => document.getElementById('file-upload')?.click()}
                              className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-medium transition-all"
                              distance={20}
                              strength={0.15}
                              style={{
                                background: 'rgba(255,255,255,0.06)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'rgba(255,255,255,0.65)',
                              }}
                            >
                              <Plus size={16} />
                            </MagneticButton>
                            <input
                              id="file-upload"
                              type="file"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                  console.log('Files selected:', Array.from(files).map(f => f.name));
                                  // TODO: Handle file upload
                                }
                              }}
                            />

                            <div className="relative" ref={modeDropdownRef}>
                              <div
                                style={{
                                  background: 'rgba(255,255,255,0.06)',
                                  borderRadius: '9999px',
                                  border: '1px solid rgba(255,255,255,0.1)',
                                  color: 'rgba(255,255,255,0.65)',
                                }}
                              >
                                <MagneticButton
                                  onClick={() => setShowModeDropdown(!showModeDropdown)}
                                  className="px-3 py-2 text-[11px] font-medium uppercase tracking-[0.12em] transition-all flex items-center gap-2"
                                  distance={25}
                                  strength={0.2}
                                >
                                  {mode === 'fast' ? <Zap size={12} className="opacity-80" /> : mode === 'research_extreme' ? <Globe size={12} className="opacity-80" /> : <LayoutGrid size={12} className="opacity-80" />}
                                  <span>{mode === 'fast' ? (t.velocity || 'Velocity') : mode === 'research_extreme' ? (t.research || 'Research') : 'DEEP'}</span>
                                  <ChevronDown size={10} className={`ml-0 opacity-40 transition-transform duration-300 ${showModeDropdown ? 'rotate-180' : ''}`} />
                                </MagneticButton>
                              </div>

                              <AnimatePresence>
                                {showModeDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, translateY: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, translateY: 0, scale: 1 }}
                                    exit={{ opacity: 0, translateY: 8, scale: 0.95 }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className="absolute bottom-full left-0 mb-3 rounded-2xl p-2 z-50 backdrop-blur-xl"
                                    style={{
                                      background: 'linear-gradient(135deg, rgba(20,18,14,0.95) 0%, rgba(25,22,18,0.95) 100%)',
                                      border: '1px solid rgba(224,139,58,0.2)',
                                      boxShadow: '0 8px 32px rgba(224,139,58,0.15), inset 0 1px 1px rgba(255,255,255,0.1)',
                                      width: 'fit-content',
                                      minWidth: '200px',
                                      maxWidth: '240px'
                                    }}
                                  >
                                    {focusModes.map((fm, idx) => {
                                      const IconComponent = fm.icon;
                                      const isActive = mode === fm.id;
                                      return (
                                        <button
                                          key={fm.id}
                                          onClick={() => {
                                            setMode(fm.id);
                                            setShowModeDropdown(false);
                                          }}
                                          className="w-full text-left transition-all duration-200"
                                          style={{
                                            padding: '12px 14px',
                                            marginBottom: idx < focusModes.length - 1 ? '4px' : '0',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            position: 'relative',
                                            background: isActive ? 'linear-gradient(135deg, rgba(224,139,58,0.15) 0%, rgba(224,139,58,0.08) 100%)' : 'transparent',
                                            border: isActive ? '1px solid rgba(224,139,58,0.3)' : '1px solid transparent',
                                          }}
                                          onMouseEnter={(e) => {
                                            if (!isActive) {
                                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                                              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(224,139,58,0.2)';
                                            }
                                          }}
                                          onMouseLeave={(e) => {
                                            if (!isActive) {
                                              (e.currentTarget as HTMLElement).style.background = 'transparent';
                                              (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                                            }
                                          }}
                                        >
                                          <IconComponent
                                            size={14}
                                            style={{
                                              color: isActive ? '#e08b3a' : 'rgba(255,255,255,0.35)',
                                              flexShrink: 0
                                            }}
                                          />
                                          <div className="flex flex-col flex-1 min-w-0">
                                            <span
                                              style={{
                                                fontSize: '12px',
                                                letterSpacing: '0.1em',
                                                fontWeight: 600,
                                                textTransform: 'uppercase',
                                                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                                              }}
                                            >
                                              {fm.label}
                                            </span>
                                            <span
                                              style={{
                                                fontSize: '10px',
                                                letterSpacing: '0.05em',
                                                color: isActive ? 'rgba(224,139,58,0.8)' : 'rgba(255,255,255,0.3)',
                                                marginTop: '2px'
                                              }}
                                            >
                                              {fm.description}
                                            </span>
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            position: 'relative', zIndex: 30, flexShrink: 0
                          }}>

                            {/* MIC / STT */}
                            <button type="button" onClick={handleSTT}
                              style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: 'radial-gradient(circle at 35% 30%, rgba(180,160,255,0.22) 0%, rgba(10,8,7,0.96) 72%)',
                                border: '1px solid rgba(180,160,255,0.25)',
                                cursor: 'pointer', flexShrink: 0,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: isListening
                                  ? '0 0 28px rgba(180,160,255,0.35)'
                                  : 'none',
                                transition: 'all 200ms ease',
                              }}>
                              <Mic size={16} color="rgba(255,255,255,0.75)" />
                            </button>

                            {/* SMART SEND */}
                            <button type="button"
                              onClick={() => {
                                if (query.trim()) {
                                  handleSearch();
                                } else {
                                  setIsVoiceUIOpen(true);
                                }
                              }}
                              style={{
                                width: 44, height: 44, borderRadius: '50%',
                                background: query.trim().length > 0
                                  ? 'radial-gradient(circle at 38% 32%, rgba(245,166,35,0.38) 0%, rgba(10,8,7,0.97) 68%)'
                                  : 'radial-gradient(circle at 38% 32%, rgba(245,166,35,0.18) 0%, rgba(10,8,7,0.97) 68%)',
                                border: `1px solid rgba(245,166,35,${query.trim().length > 0 ? 0.5 : 0.2})`,
                                cursor: 'pointer', flexShrink: 0,
                                display: 'flex', alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: query.trim().length > 0
                                  ? '0 0 28px rgba(245,166,35,0.25)'
                                  : '0 0 16px rgba(245,166,35,0.08)',
                                transition: 'all 200ms ease',
                              }}>
                              {query.trim().length > 0
                                ? <ArrowUp size={17} color="rgba(255,255,255,0.95)" />
                                : <div style={{
                                  display: 'flex', alignItems: 'flex-end',
                                  gap: '3px', height: '18px'
                                }}>
                                  {[
                                    { dur: '0.7s', delay: '0s' },
                                    { dur: '0.5s', delay: '0.15s' },
                                    { dur: '0.9s', delay: '0.3s' },
                                  ].map((b, i) => (
                                    <div key={i} style={{
                                      width: '3px', borderRadius: '999px',
                                      background: 'rgba(245,166,35,0.85)',
                                      animation: `barPulse ${b.dur} ease-in-out ${b.delay} infinite alternate`,
                                    }} />
                                  ))}
                                </div>
                              }
                            </button>
                          </div>
                        </div>

                        {/* Search Suggestions Dropdown */}
                        <SearchSuggestions
                          query={query}
                          onSelect={handleSuggestionSelect}
                          isVisible={isSearchFocused}
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-[640px]">
                        {suggestions.map((s, i) => (
                          <MagneticButton
                            key={i}
                            onClick={() => handleSearch(s)}
                            className="group transition-all duration-150"
                            distance={12}
                            strength={0.1}
                            style={{
                              padding: '6px 14px',
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.07)',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              color: 'rgba(255,255,255,0.5)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
                              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                            }}
                          >
                            <span style={{ color: 'rgba(245,166,35,0.6)', fontSize: '10px' }}>✦</span>
                            {s}
                          </MagneticButton>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ConversationalVoiceUI
                    isOpen={isVoiceUIOpen}
                    onClose={() => setIsVoiceUIOpen(false)}
                    onSearch={handleVoiceSearch}
                    loading={loading}
                    t={t}
                  />
                </>
              ) : (
                <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col pt-20 pb-40 px-4 md:px-8">
                  <div className="flex flex-col gap-4">
                    {activeSession?.messages.map((m) => (
                      <div key={m.id} className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
                        {m.role === 'user' ? (
                          <div className="flex justify-end pr-8">
                            <div className="glass px-10 py-6 rounded-[32px] rounded-tr-sm border border-[#222222] shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-w-[85%]">
                              <p className="text-zinc-100 text-[22px] font-medium leading-tight font-[family-name:var(--font-instrument-serif)] italic tracking-tight">
                                {m.content}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            {m.loading && (!m.result) ? (
                              <div className="w-full flex justify-start pl-12 py-6">
                                <CognitivePath
                                  mode={m.mode as any || 'fast'}
                                  sources={m.streamEvents?.find(e => e.event === 'sources_found')?.sources || []}
                                  streamingText={m.streamingText || ''}
                                  steps={[
                                    {
                                      id: 'intent',
                                      label: 'Deconstructing intent...',
                                      status: m.streamEvents?.some(e => e.event === 'subquery') ? 'complete' : 'active'
                                    },
                                    {
                                      id: 'searching',
                                      label: 'Searching signals across the expanse...',
                                      status: m.streamEvents?.some(e => e.event === 'analysis_started')
                                        ? 'complete'
                                        : m.streamEvents?.some(e => e.event === 'subquery' || e.event === 'sources_found')
                                          ? 'active'
                                          : 'pending',
                                      queries: m.streamEvents?.filter(e => e.event === 'subquery').map(e => e.query)
                                    },
                                    {
                                      id: 'synthesizing',
                                      label: 'Synthesizing atmospheric report...',
                                      status: m.streamEvents?.some(e => e.event === 'analysis_started') ? 'active' : 'pending'
                                    }
                                  ]} />
                              </div>
                            ) : (
                              m.result && (
                                <div className="w-full">
                                  <AIResult result={m.result} onSearch={handleSearch} isStreaming={!!m.loading} />
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} className="h-20" />
                  </div>

                  <div className="fixed bottom-0 left-[50px] right-0 p-10 pointer-events-none flex justify-center z-50">
                    <div className="w-full max-w-2xl pointer-events-auto">
                      <BottomSearch
                        onSearch={handleSearch}
                        loading={loading}
                        onReset={resetSearch}
                        onOpenVoiceUI={() => setIsVoiceUIOpen(true)}
                        isSearchFocused={query.length > 0}
                      />
                    </div>
                  </div>

                  <ConversationalVoiceUI
                    isOpen={isVoiceUIOpen}
                    onClose={() => setIsVoiceUIOpen(false)}
                    onSearch={handleVoiceSearch}
                    loading={loading}
                    t={t}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <LanguageSettings
        isOpen={showLanguageSettings}
        onClose={() => setShowLanguageSettings(false)}
      />
    </div>
    </>
  );
}
