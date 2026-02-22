'use client';

import { useState, KeyboardEvent, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import BottomSearch from '@/components/BottomSearch';
import AIResult from '@/components/AIResult';
import ResearchProcess from '@/components/ResearchProcess';
import CognitivePath from '@/components/CognitivePath';
import MagneticButton from '@/components/MagneticButton';
import ArchivePage, { saveToHistory } from '@/components/ArchivePage';
import EclipseLogo from '@/components/EclipseLogo';
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
  Radar
} from 'lucide-react';

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
  mode: "fast" | "research_extreme";
  createdAt: string;
  messages: Message[];
}

export default function Home() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('fast');
  const [selectedModel, setSelectedModel] = useState('Grok 4.1 Fast');
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'archive'>('home');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const modeDropdownRef = useRef<HTMLDivElement>(null);

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

  // Handle closing dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modeDropdownRef.current && !modeDropdownRef.current.contains(e.target as Node)) {
        setShowModeDropdown(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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

  const handleSearch = async (searchQuery?: string, queryMode?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    const useMode = queryMode || mode;
    let currentSessionId = activeSessionId;
    let newSessions = [...sessions];

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

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, mode: useMode, model: selectedModel })
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
                        }))
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

  const resetSearch = () => {
    setActiveSessionId(null);
    setQuery('');
    setMode('fast');
    setCurrentView('home');
  };

  const focusModes = [
    { id: 'fast', label: 'Velocity', description: 'Fast, concise answers', icon: Zap },
    { id: 'research_extreme', label: 'Research', description: 'Deep multi-source analysis', icon: Globe },
  ];

  const suggestions = [

  ];

  return (
    <div className="flex h-screen bg-black text-white selection:bg-orange-500/30 font-sans overflow-hidden">
      <Sidebar
        onNew={resetSearch}
        onHistory={() => setCurrentView('archive')}
        onModeChange={(m) => {
          setMode(m);
          setCurrentView('home');
        }}
        currentView={currentView}
      />

      <main className="flex-1 flex flex-col relative overflow-y-auto pl-[50px]">
        <AnimatePresence mode="wait">
          {currentView === 'archive' ? (
            <ArchivePage
              key="archive"
              onOpenItem={(id) => {
                setActiveSessionId(id);
                setCurrentView('home');
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
                  <div className="eclipse-glow" />
                  <div className="eclipse-ring" />
                </>
              )}

              {!activeSessionId ? (
                <div className="flex-1 flex flex-col items-center justify-center -mt-20 px-6 relative z-10 w-full">
                  <div className="w-full max-w-4xl flex flex-col items-center">
                    {/* PLACEMENT 2: Homepage Hero Logo — animates once on mount */}
                    <div className="flex flex-col items-center gap-6 mb-2" style={{ overflow: 'visible' }}>
                      <EclipseLogo
                        key="homepage-hero"
                        size={72}
                        animate={true}
                        loop={false}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2, duration: 0.8, ease: 'easeOut' }}
                        className="flex flex-col items-center gap-1"
                      >
                        <span className="text-[10px] font-bold text-[#e08b3a] tracking-[0.5em] uppercase opacity-70">
                          Intelligence Horizon
                        </span>
                      </motion.div>
                    </div>

                    <h1 className="text-[140px] text-zinc-100 text-center font-[family-name:var(--font-instrument-serif)] italic tracking-tighter leading-none mb-6 opacity-95 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(224,139,58,0.1)]">
                      Eclipse
                    </h1>

                    <div className="w-full max-w-2xl bg-[#0d0d0e]/60 backdrop-blur-3xl border border-white/5 rounded-[32px] p-2 shadow-[0_30px_70px_rgba(0,0,0,0.7)] focus-within:border-[#e08b3a]/30 focus-within:shadow-[0_0_40px_rgba(224,139,58,0.08)] transition-all duration-700">
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); }}
                        placeholder="Deconstruct intelligence..."
                        className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-800 text-[18px] px-8 py-7 font-[family-name:var(--font-instrument-serif)] italic leading-tight tracking-tight shadow-[inset_0_0_15px_rgba(224,139,58,0.02)] rounded-[24px] focus:shadow-[inset_0_0_20px_rgba(224,139,58,0.05)] transition-all"
                      />

                      <div className="flex items-center justify-between px-3 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="relative" ref={modeDropdownRef}>
                            <MagneticButton
                              onClick={() => setShowModeDropdown(!showModeDropdown)}
                              className="px-3 py-2 rounded-full text-[11px] font-medium uppercase tracking-[0.08em] transition-all border flex items-center gap-2"
                              style={{
                                background: 'rgba(255,255,255,0.04)',
                                border: showModeDropdown ? '1px solid rgba(228, 221, 209, 0.3)' : '1px solid rgba(255,255,255,0.08)',
                                color: showModeDropdown ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                              }}
                              distance={25}
                              strength={0.2}
                            >
                              {mode === 'fast' ? <Zap size={12} className="opacity-80" /> : <Globe size={12} className="opacity-80" />}
                              <span>{mode === 'fast' ? 'Velocity' : 'Research'}</span>
                              <ChevronDown size={10} className={`ml-0 opacity-40 transition-transform duration-300 ${showModeDropdown ? 'rotate-180' : ''}`} />
                            </MagneticButton>

                            <AnimatePresence>
                              {showModeDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, translateY: 4 }}
                                  animate={{ opacity: 1, translateY: 0 }}
                                  exit={{ opacity: 0, translateY: 4 }}
                                  transition={{ duration: 0.15, ease: 'easeOut' }}
                                  className="absolute bottom-full left-0 mb-3 rounded-xl p-1.5 z-50 backdrop-blur-xl"
                                  style={{
                                    background: '#1a1714',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    width: 'fit-content',
                                    minWidth: '180px',
                                    maxWidth: '220px'
                                  }}
                                >
                                  {focusModes.map((fm) => {
                                    const IconComponent = fm.icon;
                                    const isActive = mode === fm.id;
                                    return (
                                      <button
                                        key={fm.id}
                                        onClick={() => {
                                          setMode(fm.id);
                                          setShowModeDropdown(false);
                                        }}
                                        className="w-full text-left transition-all duration-150"
                                        style={{
                                          padding: '10px 14px',
                                          borderRadius: '8px',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '10px',
                                          cursor: 'pointer',
                                          position: 'relative',
                                          background: 'transparent',
                                          borderLeft: isActive ? '2px solid #F5A623' : 'none',
                                          paddingLeft: isActive ? '12px' : '14px',
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isActive) {
                                            (e.currentTarget as HTMLElement).style.background = 'transparent';
                                          }
                                        }}
                                      >
                                        <IconComponent
                                          size={12}
                                          style={{
                                            color: isActive ? '#F5A623' : 'rgba(255,255,255,0.25)',
                                            flexShrink: 0
                                          }}
                                        />
                                        <div className="flex flex-col flex-1 min-w-0">
                                          <span
                                            style={{
                                              fontSize: '11px',
                                              letterSpacing: '0.12em',
                                              fontWeight: 500,
                                              textTransform: 'uppercase',
                                              color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                                            }}
                                          >
                                            {fm.label}
                                          </span>
                                          {isActive && fm.description && (
                                            <span
                                              style={{
                                                fontSize: '10px',
                                                letterSpacing: '0.05em',
                                                color: 'rgba(255,255,255,0.25)',
                                                marginTop: '2px'
                                              }}
                                            >
                                              {fm.description}
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        <MagneticButton
                          onClick={() => handleSearch()}
                          className="p-3.5 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all group"
                          distance={25}
                          strength={0.15}
                        >
                          <ArrowUp size={18} strokeWidth={3} className="group-hover:-translate-y-0.5 transition-transform" />
                        </MagneticButton>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10 max-w-xl">
                      {suggestions.map((s, i) => (
                        <MagneticButton
                          key={i}
                          onClick={() => handleSearch(s)}
                          className="px-4 py-2 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-[10px] text-zinc-500 font-bold tracking-tight hover:text-white hover:border-[#e08b3a]/40 hover:bg-gradient-to-br hover:from-[#e08b3a]/5 hover:to-transparent transition-all duration-300"
                          distance={15}
                          strength={0.12}
                        >
                          {s}
                        </MagneticButton>
                      ))}
                    </div>
                  </div>
                </div>
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
                                  <AIResult result={m.result} onSearch={handleSearch} isStreaming={false} />
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
                      />
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
