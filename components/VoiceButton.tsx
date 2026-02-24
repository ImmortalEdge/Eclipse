"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';

type Status = 'idle' | 'listening' | 'processing' | 'error';

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

export default function VoiceButton() {
  const [supported, setSupported] = useState(true);
  const [status, setStatus] = useState<Status>('idle');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const [levels, setLevels] = useState<number[]>([4, 4, 4, 4, 4]);
  const recognitionRef = useRef<any>(null);
  const audioAnalyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const ringsColor = 'rgba(180,160,255,0.4)';
  const btnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isTouchDevice) return setSupported(false);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = 'en-US';

    recog.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setLiveTranscript(transcript);

      if (event.results[0].isFinal) {
        setStatus('processing');
        injectIntoSearchBar(transcript);
        setLiveTranscript('');
        setTimeout(() => {
          setStatus('idle');
        }, 300);
      }
    };

    recog.onerror = (ev: any) => {
      if (ev.error === 'no-speech') {
        // Silent timeout — user didn't speak, just return to idle
        setStatus('idle');
      } else if (ev.error === 'not-allowed' || ev.error === 'permission-denied') {
        console.error('STT error:', ev.error);
        setStatus('error');
        setLiveTranscript('Microphone access denied');
        setTimeout(() => {
          setStatus('idle');
          setLiveTranscript('');
        }, 1800);
      } else if (ev.error !== 'aborted') {
        console.warn('STT error:', ev.error);
        setStatus('idle');
      }
    };

    recog.onend = () => {
      if (status === 'listening') setStatus('idle');
    };

    recognitionRef.current = recog;
    return () => {
      try { recog.stop(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // animate random levels when listening and no analyser
    let iv: any;
    if (status === 'listening' && !audioAnalyserRef.current) {
      iv = setInterval(() => {
        setLevels(() => Array.from({ length: 5 }).map(() => 4 + Math.round(Math.random() * 16)));
      }, 150);
    } else if (status !== 'listening') {
      setLevels([4, 4, 4, 4, 4]);
    }
    return () => clearInterval(iv);
  }, [status]);

  // removed keyboard hold-space handlers per user preference

  useEffect(() => {
    // position the voice button to the right of search bar, left of send button with floating gap
    const updatePos = () => {
      // check for follow-up input first (on answer page), then fall back to main input
      const followUpInput = document.querySelector('input[placeholder*="Ask a follow-up"]') as HTMLElement | null;
      const mainInput = document.querySelector('input[placeholder*="Deconstruct intelligence"]') as HTMLElement | null;
      const targetInput = followUpInput || mainInput;

      if (!targetInput) {
        setPosition(null);
        return;
      }
      // the send button is typically the last button in the parent container
      const parent = targetInput.parentElement?.parentElement || targetInput.parentElement;
      const sendBtn = Array.from(parent?.querySelectorAll('button') || []).pop() as HTMLElement | undefined;
      if (!sendBtn) {
        setPosition(null);
        return;
      }
      const rect = (sendBtn as HTMLElement).getBoundingClientRect();
      // position to the right of the send button with 12px spacing
      setPosition({ left: rect.right + 12, top: rect.top + rect.height / 2 });
    };

    updatePos();
    window.addEventListener('resize', updatePos);
    window.addEventListener('scroll', updatePos, true);
    const obs = new MutationObserver(() => updatePos());
    obs.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener('resize', updatePos);
      window.removeEventListener('scroll', updatePos, true);
      obs.disconnect();
    };
  }, []);

  // toggle a listening class on the search container for the orange wave effect
  useEffect(() => {
    // find whichever search container is active (follow-up or main)
    const followUpInput = document.querySelector('input[placeholder*="Ask a follow-up"]') as HTMLElement | null;
    const mainInput = document.querySelector('input[placeholder*="Deconstruct intelligence"]') as HTMLElement | null;
    const targetInput = followUpInput || mainInput;
    
    const container = targetInput?.parentElement as HTMLElement | null;
    if (!container) return;

    if (status === 'listening') {
      container.classList.add('search-listening');
      container.style.position = 'relative';
      
      // inject waveform dots into the input
      let dotsContainer = container.querySelector('.search-waveform-dots');
      if (!dotsContainer) {
        dotsContainer = document.createElement('div');
        dotsContainer.className = 'search-waveform-dots';
        for (let i = 0; i < 12; i++) {
          const dot = document.createElement('div');
          dot.className = 'waveform-dot';
          dot.style.animationDelay = `${i * 0.1}s`;
          dotsContainer.appendChild(dot);
        }
        container.appendChild(dotsContainer);
      }
    } else {
      container.classList.remove('search-listening');
      container.style.position = '';
      const dotsContainer = container.querySelector('.search-waveform-dots');
      if (dotsContainer) {
        dotsContainer.remove();
      }
    }
    return () => {
      container?.classList.remove('search-listening');
      container.style.position = '';
    };
  }, [status]);

  const startAnalyser = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      audioAnalyserRef.current = analyser;

      const data = new Uint8Array(analyser.frequencyBinCount);

      const loop = () => {
        analyser.getByteFrequencyData(data);
        const bandSize = Math.floor(data.length / 5);
        const newLevels = Array.from({ length: 5 }).map((_, i) => {
          const slice = data.slice(i * bandSize, (i + 1) * bandSize);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          return Math.max(4, Math.round((avg / 255) * 20));
        });
        setLevels(newLevels);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    } catch (e) {
      // ignore — fallback to random
      console.warn('Analyser failed', e);
    }
  };

  const stopAnalyser = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    if (audioAnalyserRef.current && audioAnalyserRef.current.context) {
      try { audioAnalyserRef.current.context.close(); } catch (e) {}
    }
    audioAnalyserRef.current = null;
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;
    setStatus('listening');
    setLiveTranscript('');
    try {
      await startAnalyser();
    } catch (e) {}
    try {
      recognitionRef.current.start();
      // fallback timeout for no speech
      setTimeout(() => {
        if (status === 'listening') {
          setLiveTranscript('No speech detected');
          setTimeout(() => { setLiveTranscript(''); setStatus('idle'); }, 1500);
        }
      }, 5000);
    } catch (e) {
      console.warn('Recognition start failed', e);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch (e) {}
    stopAnalyser();
    if (status === 'listening') setStatus('processing');
  };

  const injectIntoSearchBar = (text: string) => {
    const followUpInput = document.querySelector('input[placeholder*="Ask a follow-up"]') as HTMLInputElement | null;
    const mainInput = Array.from(document.querySelectorAll('input[type="text"]'))
      .find((el) => (el as HTMLInputElement).placeholder && (el as HTMLInputElement).placeholder.includes('Deconstruct')) as HTMLInputElement | undefined;

    const target = followUpInput || mainInput || document.querySelector('input[type="text"]') as HTMLInputElement | null;
    if (!target) return;
    target.focus();
    target.value = text;
    target.dispatchEvent(new Event('input', { bubbles: true }));
  };

  if (!supported) return null;

  return (
    <div>
      <div style={position ? { position: 'fixed', left: position.left, top: position.top, transform: 'translateY(-50%)', zIndex: 100 } : { position: 'fixed', left: 64, bottom: '50%', transform: 'translateY(50%)', zIndex: 100 }}>
        <div style={{ position: 'relative', width: 44, height: 44 }}>
          <AnimatePresence>
            {status === 'listening' && (
              <div style={{ position: 'absolute', inset: -24, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 1, opacity: 0.4 }}
                    animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.4, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      width: 44 + (i + 1) * 16,
                      height: 44 + (i + 1) * 16,
                      borderRadius: '50%',
                      border: `1px solid ${ringsColor}`,
                      boxSizing: 'border-box'
                    }}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>

          <motion.button
            ref={btnRef}
            onMouseEnter={() => { /* tooltip removed per request */ }}
            onMouseLeave={() => { /* tooltip removed per request */ }}
            onClick={() => {
              if (status === 'idle') startListening();
              else if (status === 'listening') stopListening();
            }}
            whileHover={{ scale: 1.06 }}
            animate={status === 'listening' ? { scale: [1, 0.9, 1.1, 1] } : { scale: 1 }}
            transition={status === 'listening' ? { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } : { type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${status === 'listening' ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.12)'}`,
              background: status === 'listening'
                ? 'linear-gradient(135deg, rgba(245,166,35,0.25) 0%, rgba(245,166,35,0.18) 40%, rgba(255,200,120,0.12) 100%)'
                  : 'linear-gradient(135deg, rgba(180, 160, 255, 0.15) 0%, rgba(255, 160, 200, 0.12) 40%, rgba(255, 200, 120, 0.1) 100%)',
              backdropFilter: 'blur(16px)',
              boxShadow: status === 'listening'
                ? '0 12px 48px rgba(245,166,35,0.12), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)'
                : '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
            aria-label="Voice search"
          >
            {status === 'processing' ? (
              <Loader2 size={18} className="animate-spin" color="rgba(255,255,255,0.95)" />
            ) : status === 'listening' ? (
              <MicOff size={18} color="rgba(255,255,255,1)" />
            ) : (
              <Mic size={18} color="rgba(255,255,255,0.6)" />
            )}
          </motion.button>

          {/* transcript pill removed per user request */}
        </div>
      </div>
    </div>
  );
}
