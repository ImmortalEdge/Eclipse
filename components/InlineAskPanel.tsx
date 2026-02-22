'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Lightbulb } from 'lucide-react';
import EclipseLogo from './EclipseLogo';

interface InlineAskPanelProps {
  id: string;
  highlightedText: string;
  resultContext: string;
  onClose: () => void;
  onSearch: (question: string) => void;
}

interface SuggestedQuestion {
  text: string;
}

export default function InlineAskPanel({
  id,
  highlightedText,
  resultContext,
  onClose,
  onSearch,
}: InlineAskPanelProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate suggested questions on mount
  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        const response = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: highlightedText })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestedQuestions(data.questions || []);
        }
      } catch (e) {
        console.error('Failed to generate suggestions:', e);
      }
    };

    generateSuggestions();
  }, [highlightedText]);

  const handleSubmit = useCallback(async (q: string) => {
    if (!q.trim()) return;

    setQuestion(q);
    setIsLoading(false);
    setIsAnswering(true);
    setAnswer('');

    try {
      const response = await fetch('/api/inline-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          highlightedText,
          resultContext,
          question: q
        })
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
            try {
              const data = JSON.parse(line.slice(6));
              if (data.event === 'token') {
                setAnswer(prev => prev + data.token);
              } else if (data.event === 'complete') {
                setIsAnswering(false);
              }
            } catch (e) {
              console.error('Parse error:', e);
            }
          }
        }
      }

      setIsAnswering(false);
    } catch (error) {
      console.error('Ask panel error:', error);
      setAnswer('Unable to generate answer. Please try again.');
      setIsAnswering(false);
    }
  }, [highlightedText, resultContext]);

  const handleSuggestedClick = (suggestionText: string) => {
    setQuestion(suggestionText);
    inputRef.current?.focus();
    // Auto-submit after a brief delay to show selection
    setTimeout(() => {
      handleSubmit(suggestionText);
    }, 100);
  };

  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answer);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleSearch = () => {
    if (question) {
      onSearch(question);
    }
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 280,
        damping: 28,
      }}
      className="w-full rounded-2xl overflow-hidden mt-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-px" style={{ background: 'rgba(255,255,255,0.04)' }}>
        {/* LEFT PANEL — CONTEXT */}
        <div style={{ background: '#1a1714', padding: '20px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '12px'
          }}>
            Selected Passage
          </div>

          <div style={{
            fontFamily: 'var(--font-instrument-serif)',
            fontStyle: 'italic',
            fontSize: '15px',
            color: 'rgba(255,255,255,0.7)',
            borderLeft: '2px solid rgba(245,166,35,0.4)',
            paddingLeft: '14px',
            marginBottom: '16px',
            lineHeight: 1.6
          }}>
            "{highlightedText}"
          </div>

          <input
            ref={inputRef}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isAnswering) {
                handleSubmit(question);
              }
            }}
            placeholder="Ask anything about this..."
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '10px 14px',
              fontSize: '13px',
              color: 'white',
              fontFamily: 'inherit',
              transition: 'all 200ms ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(245,166,35,0.3)';
            }}
            onBlur={(e) => {
              (e.target as HTMLInputElement).style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          />

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && !question && (
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {suggestedQuestions.map((sq, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedClick(sq.text)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '8px',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.5)',
                    transition: 'color 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
                  }}
                >
                  <span style={{ color: '#F5A623', fontSize: '8px', marginTop: '4px' }}>●</span>
                  <span>{sq.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Send Button */}
          {question && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => handleSubmit(question)}
                disabled={isAnswering}
                style={{
                  flex: 1,
                  background: '#F5A623',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'black',
                  cursor: isAnswering ? 'not-allowed' : 'pointer',
                  opacity: isAnswering ? 0.6 : 1,
                  transition: 'all 150ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Send size={12} />
                Ask
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — AI ANSWER */}
        <div style={{ background: '#111009', padding: '20px', borderLeft: '1px solid rgba(255,255,255,0.06)', position: 'relative' }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            {isAnswering && <EclipseLogo size={14} animate loop />}
            <span style={{
              fontSize: '10px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#F5A623'
            }}>
              Eclipse Insight
            </span>
          </div>

          {/* Answer Content */}
          {isAnswering && !answer && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    height: '12px',
                    background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px',
                    width: `${100 - i * 15}%`
                  }}
                />
              ))}
            </div>
          )}

          {answer && (
            <div style={{
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.85)'
            }}>
              {answer}
            </div>
          )}

          {/* Actions */}
          {answer && !isAnswering && (
            <div style={{
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: '11px'
            }}>
              <button
                onClick={handleSearch}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#F5A623',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5C26C';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = '#F5A623';
                }}
              >
                Search this →
              </button>
              <button
                onClick={handleCopyAnswer}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.8)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
                }}
                title="Copy answer"
              >
                <Lightbulb size={14} />
              </button>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.3)',
              cursor: 'pointer',
              padding: '4px',
              transition: 'color 150ms ease',
              display: 'flex',
              alignItems: 'center'
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.7)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.3)';
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
