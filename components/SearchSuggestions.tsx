'use client';

import { Search } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';

interface SearchSuggestionsProps {
  query: string;
  onSelect: (suggestion: string) => void;
  isVisible: boolean;
}

export default function SearchSuggestions({ 
  query, 
  onSelect, 
  isVisible
}: SearchSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced fetch function
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/suggestions?q=${encodeURIComponent(searchQuery)}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      
      const data = await response.json();
      const suggestionsList = Array.isArray(data) ? data.slice(0, 6) : [];
      setSuggestions(suggestionsList);
      setHighlightedIndex(-1);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching suggestions:', error);
      }
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSuggestions(query);
    }, 200);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, fetchSuggestions]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHighlightedIndex(-1);
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isVisible || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          onSelect(suggestions[highlightedIndex]);
          setHighlightedIndex(-1);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          const index = highlightedIndex === -1 ? 0 : highlightedIndex;
          onSelect(suggestions[index]);
          setHighlightedIndex(-1);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setHighlightedIndex(-1);
        break;
    }
  }, [isVisible, suggestions, highlightedIndex, onSelect]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onSelect(suggestion);
    setHighlightedIndex(-1);
  };

  // Highlight matching text
  const highlightMatch = (suggestion: string, query: string) => {
    if (!query) return suggestion;
    
    const idx = suggestion.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return suggestion;
    
    return (
      <>
        <span style={{color: 'rgba(255,255,255,0.4)'}}>
          {suggestion.slice(0, idx)}
        </span>
        <span style={{color: 'white', fontWeight: 600}}>
          {suggestion.slice(idx, idx + query.length)}
        </span>
        <span style={{color: 'rgba(255,255,255,0.4)'}}>
          {suggestion.slice(idx + query.length)}
        </span>
      </>
    );
  };

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-[6px] z-[1000]"
      style={{
        backgroundColor: '#1a1714',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
        boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        padding: '6px',
        animation: 'fadeInUp 120ms ease-out',
      }}
    >
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      
      {suggestions.map((suggestion, index) => (
        <div
          key={suggestion}
          onClick={() => handleSuggestionClick(suggestion)}
          className={`flex items-center gap-3 cursor-pointer transition-all duration-100 ${
            highlightedIndex === index
              ? 'bg-white/6 border-l-2 border-[#f5a623]/50'
              : 'hover:bg-white/5'
          }`}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            color: highlightedIndex === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.65)',
            backgroundColor: highlightedIndex === index ? 'rgba(255,255,255,0.06)' : 'transparent',
          }}
          onMouseEnter={() => setHighlightedIndex(index)}
          onMouseLeave={() => setHighlightedIndex(-1)}
        >
          <Search 
            size={13} 
            className="flex-shrink-0"
            style={{
              color: highlightedIndex === index 
                ? 'rgba(245,166,35,0.5)' 
                : 'rgba(255,255,255,0.2)'
            }}
          />
          <span className="flex-1 truncate">
            {highlightMatch(suggestion, query)}
          </span>
        </div>
      ))}
    </div>
  );
}
