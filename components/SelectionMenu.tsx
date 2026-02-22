'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Radar, Lightbulb, Copy, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function SelectionMenu() {
  const [selectedText, setSelectedText] = useState('');
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [copiedState, setCopiedState] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dispatch custom events for search actions
  const dispatchSearchEvent = (text: string, mode?: string) => {
    const event = new CustomEvent('eclipse-search-selection', {
      detail: { text, mode }
    });
    document.dispatchEvent(event);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();

    // Clear the timeout if it exists
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    if (!selection || selection.isCollapsed) {
      setIsVisible(false);
      return;
    }

    // Don't show menu for selections in inputs or textareas
    const focusedElement = document.activeElement;
    if (focusedElement instanceof HTMLInputElement || focusedElement instanceof HTMLTextAreaElement) {
      setIsVisible(false);
      return;
    }

    const text = selection.toString().trim();
    if (text.length < 3) {
      setIsVisible(false);
      return;
    }

    // Set timeout to prevent accidental triggers
    selectionTimeoutRef.current = setTimeout(() => {
      try {
        // Re-get selection inside timeout to ensure it's still valid
        const currentSelection = window.getSelection();
        
        if (!currentSelection || currentSelection.isCollapsed || currentSelection.rangeCount === 0) {
          setIsVisible(false);
          return;
        }

        const range = currentSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Calculate position with viewport bounds checking
        let x = rect.left + rect.width / 2;
        let y = rect.top + window.scrollY - 48;

        // Check if menu would be too close to top
        const menuHeight = 48; // Approximate menu height
        const topThreshold = 100;

        if (rect.top < topThreshold) {
          // Position below the selection instead
          y = rect.bottom + window.scrollY + 12;
        }

        // Ensure x stays within viewport (will adjust in CSS positioning)
        x = Math.max(100, Math.min(window.innerWidth - 100, x));

        setSelectedText(text);
        setMenuPosition({ x, y });
        setIsVisible(true);
      } catch (e) {
        console.error('Selection range error:', e);
        setIsVisible(false);
      }
    }, 200);
  }, []);

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
      setIsVisible(false);
    }
  }, []);

  const handleEscape = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, [handleSelection, handleClickOutside, handleEscape]);

  const handleSearch = (mode?: string) => {
    dispatchSearchEvent(selectedText, mode);
    setIsVisible(false);
    setSelectedText('');
    // Clear browser selection
    window.getSelection()?.removeAllRanges();
  };

  const handleExplain = () => {
    dispatchSearchEvent(`Explain this in simple terms: ${selectedText}`);
    setIsVisible(false);
    setSelectedText('');
    // Clear browser selection
    window.getSelection()?.removeAllRanges();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(selectedText);
      setCopiedState(true);
      setTimeout(() => setCopiedState(false), 1500);
      setIsVisible(false);
      setSelectedText('');
      // Clear browser selection
      window.getSelection()?.removeAllRanges();
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  if (!isMounted) return null;

  const menuContent = (
    <AnimatePresence>
      {isVisible && selectedText && (
        <motion.div
          ref={menuRef}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{
            duration: 0.15,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            transformOrigin: 'bottom center',
          }}
          className="select-none"
        >
          {/* Menu container */}
          <div
            style={{
              background: '#1a1714',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '999px',
              padding: '4px 6px',
              display: 'flex',
              flexDirection: 'row',
              gap: '2px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              alignItems: 'center',
            }}
          >
            {/* Copy Button */}
            <motion.button
              onClick={handleCopy}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.6)',
                transition: 'background 120ms ease',
              }}
              title="Copy selection"
            >
              {copiedState ? (
                <Check size={12} style={{ color: '#F5A623' }} />
              ) : (
                <Copy size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />
              )}
              <span>{copiedState ? 'Copied' : 'Copy'}</span>
            </motion.button>

            {/* Divider */}
            <div
              style={{
                width: '1px',
                height: '16px',
                background: 'rgba(255,255,255,0.08)',
                alignSelf: 'center',
              }}
            />

            {/* Search Button */}
            <motion.button
              onClick={() => handleSearch()}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: 'white',
                transition: 'background 120ms ease',
              }}
              title="Search in Eclipse"
            >
              <Search size={12} style={{ color: '#F5A623' }} />
              <span>Search</span>
            </motion.button>

            {/* Deep Search Button */}
            <motion.button
              onClick={() => handleSearch('deep_signal')}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: 'white',
                transition: 'background 120ms ease',
              }}
              title="Search with Deep Signal mode"
            >
              <Radar size={12} style={{ color: '#F5A623' }} />
              <span>Deep</span>
            </motion.button>

            {/* Explain Button */}
            <motion.button
              onClick={handleExplain}
              whileHover={{ background: 'rgba(255,255,255,0.08)' }}
              transition={{ duration: 0.12 }}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                letterSpacing: '0.08em',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                color: 'white',
                transition: 'background 120ms ease',
              }}
              title="Get AI explanation"
            >
              <Lightbulb size={12} style={{ color: '#F5A623' }} />
              <span>Explain</span>
            </motion.button>
          </div>

          {/* Arrow caret pointing down */}
          <div
            style={{
              position: 'absolute',
              bottom: '-5px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1a1714',
              zIndex: 10000,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Use Portal to render outside of overflow:hidden containers
  if (typeof document === 'undefined') return null;

  return createPortal(menuContent, document.body);
}
