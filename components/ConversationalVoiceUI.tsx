'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic } from 'lucide-react';
import { initSpeechRecognition, speak, stopSpeech } from '@/lib/voice';

interface ConversationMessage {
  role: 'user' | 'eclipse';
  text: string;
}

interface ConversationalVoiceUIProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, context: ConversationMessage[]) => Promise<string | null>;
  loading: boolean;
  t?: any;
}

// Solar System Component
function SolarSystem({ isListening, amplitude, status, t }: { isListening: boolean; amplitude: number; status: 'idle' | 'listening' | 'thinking' | 'speaking'; t: any }) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random stars
  const stars = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 2 + 1,
    animationDuration: `${Math.random() * 2 + 2}s`,
    animationDelay: `${Math.random() * 2}s`
  }));

  const getSunScale = () => {
    if (isListening && amplitude > 0.3) {
      return 1 + amplitude * 0.5;
    }
    return 1;
  };

  const getSunGlow = () => {
    if (isListening && amplitude > 0.3) {
      return `
        0 0 ${40 + amplitude * 60}px rgba(255,200,50,${0.8 + amplitude * 0.2}),
        0 0 ${80 + amplitude * 80}px rgba(245,166,35,${0.4 + amplitude * 0.3}),
        0 0 ${120 + amplitude * 100}px rgba(245,166,35,${0.15 + amplitude * 0.2})
      `;
    }
    return `
      0 0 40px rgba(255,200,50,0.8),
      0 0 80px rgba(245,166,35,0.4),
      0 0 120px rgba(245,166,35,0.15)
    `;
  };

  const getOrbitSpeed = (baseDuration: number) => {
    if (status === 'listening') return baseDuration / 1.5;
    if (status === 'thinking') return baseDuration * 2;
    return baseDuration;
  };

  const getOrbitOpacity = () => {
    if (isListening && amplitude > 0.3) return 0.15;
    return 0.06;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-[320px] h-[320px] mx-auto"
      style={{
        opacity: status === 'thinking' ? 0.7 : 1,
        filter: status === 'thinking' ? 'sepia(0.2)' : 'none'
      }}
    >
      {/* Orbit Rings */}
      <div 
        className="absolute border border-white/10 rounded-full"
        style={{
          width: '120px',
          height: '120px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: getOrbitOpacity()
        }}
      />
      <div 
        className="absolute border border-white/10 rounded-full"
        style={{
          width: '200px',
          height: '200px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: getOrbitOpacity()
        }}
      />
      <div 
        className="absolute border border-white/10 rounded-full"
        style={{
          width: '290px',
          height: '290px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: getOrbitOpacity()
        }}
      />

      {/* Sun */}
      <div
        className="absolute rounded-full"
        style={{
          width: '48px',
          height: '48px',
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${getSunScale()})`,
          background: 'radial-gradient(circle at 40% 35%, #fff7e6 0%, #FFD166 30%, #F5A623 60%, rgba(200,100,10,0.4) 100%)',
          boxShadow: getSunGlow(),
          animation: 'sunPulse 3s ease-in-out infinite'
        }}
      />

      {/* Mercury */}
      <div
        className="absolute rounded-full"
        style={{
          width: '120px',
          height: '120px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `orbit ${getOrbitSpeed(4)}s linear infinite`
        }}
      >
        <div
          className="absolute rounded-full bg-gray-400"
          style={{
            width: '8px',
            height: '8px',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            boxShadow: '0 0 10px rgba(180,180,180,0.4)',
            animation: `counterRotate ${getOrbitSpeed(4)}s linear infinite reverse`
          }}
        />
      </div>

      {/* Earth with Moon */}
      <div
        className="absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `orbit ${getOrbitSpeed(8)}s linear infinite`
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: '13px',
            height: '13px',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4a9eff',
            boxShadow: isListening && amplitude > 0.3 
              ? '0 0 20px rgba(74,158,255,0.8)' 
              : '0 0 10px rgba(74,158,255,0.5)',
            animation: `counterRotate ${getOrbitSpeed(8)}s linear infinite reverse`
          }}
        >
          {/* Moon */}
          <div
            className="absolute rounded-full bg-white/60"
            style={{
              width: '5px',
              height: '5px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'moonOrbit 2s linear infinite'
            }}
          />
        </div>
      </div>

      {/* Jupiter */}
      <div
        className="absolute rounded-full"
        style={{
          width: '290px',
          height: '290px',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: `orbit ${getOrbitSpeed(14)}s linear infinite`
        }}
      >
        <div
          className="absolute rounded-full"
          style={{
            width: '20px',
            height: '20px',
            top: '0',
            left: '50%',
            transform: `translateX(-50%) scale(${isListening && amplitude > 0.3 ? 1 + amplitude * 0.2 : 1})`,
            backgroundColor: '#C8860A',
            boxShadow: '0 0 15px rgba(200,134,10,0.5)',
            animation: `counterRotate ${getOrbitSpeed(14)}s linear infinite reverse`,
            position: 'relative'
          }}
        >
          {/* Jupiter bands */}
          <div 
            className="absolute w-full h-0.5"
            style={{
              top: '30%',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}
          />
          <div 
            className="absolute w-full h-0.5"
            style={{
              top: '60%',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}
          />
        </div>
      </div>

      {/* Ambient Stars */}
      {stars.map(star => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            left: star.left,
            top: star.top,
            opacity: status === 'speaking' ? 0.6 : 0.3,
            animation: `twinkle ${star.animationDuration} ease-in-out infinite`,
            animationDelay: star.animationDelay
          }}
        />
      ))}

      <style jsx>{`
        @keyframes sunPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.08); }
        }
        
        @keyframes orbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        
        @keyframes counterRotate {
          from { transform: translateX(-50%) rotate(0deg); }
          to { transform: translateX(-50%) rotate(360deg); }
        }
        
        @keyframes moonOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg) translateX(12px) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg) translateX(12px) rotate(-360deg); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

export default function ConversationalVoiceUI({
  isOpen,
  onClose,
  onSearch,
  t,
}: ConversationalVoiceUIProps) {
  const [state, setState] = useState<'listening' | 'thinking' | 'speaking' | 'idle'>('idle');
  const [conversation, setConversation] = useState<ConversationMessage[]>([]);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [amplitude, setAmplitude] = useState(0);
  const recognitionRef = useRef<any>(null);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const recognition = initSpeechRecognition();
    if (!recognition) {
      console.error('Speech recognition not supported');
      onClose();
      return;
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');

      setCurrentTranscript(transcript);

      if (event.results[0].isFinal) {
        handleVoiceQuery(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted' && event.error !== 'no-speech') {
        console.warn('STT error:', event.error);
      }
    };

    recognition.onend = () => {
      if (state === 'listening') {
        setState('idle');
      }
    };

    recognitionRef.current = recognition;

    setTimeout(() => {
      setState('listening');
      setCurrentTranscript('');
      try {
        recognition.start();
      } catch (e) {
        console.warn('Failed to start recognition', e);
      }
    }, 100);

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isOpen]);

  // Audio amplitude measurement
  useEffect(() => {
    if (!isOpen || state !== 'listening') {
      setAmplitude(0);
      return;
    }

    let animationId: number;
    const ctxAudio = (window.AudioContext || (window as any).webkitAudioContext) ? 
      new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    
    if (ctxAudio) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          const src = ctxAudio.createMediaStreamSource(stream);
          const analyser = ctxAudio.createAnalyser();
          analyser.fftSize = 1024;
          src.connect(analyser);
          const dataArr = new Uint8Array(analyser.frequencyBinCount);
          
          const update = () => {
            analyser.getByteFrequencyData(dataArr);
            const avg = dataArr.reduce((a, b) => a + b, 0) / dataArr.length;
            setAmplitude(avg / 128);
            animationId = requestAnimationFrame(update);
          };
          update();
        })
        .catch(e => console.warn('mic access failed', e));
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isOpen, state]);

  const handleVoiceQuery = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return;

    setState('thinking');
    setCurrentTranscript('');

    const userMessage: ConversationMessage = {
      role: 'user',
      text: transcript,
    };

    const newConversation = [...conversation, userMessage];
    setConversation(newConversation);

    try {
      const response = await onSearch(transcript, newConversation);

      if (response) {
        const eclipseMessage: ConversationMessage = {
          role: 'eclipse',
          text: response,
        };

        setConversation([...newConversation, eclipseMessage]);

        setState('speaking');
        isSpeakingRef.current = true;

        try {
          await speak(response);
        } catch (e) {
          console.warn('TTS failed:', e);
        } finally {
          isSpeakingRef.current = false;
          setState('listening');
          setCurrentTranscript('');
          try {
            if (recognitionRef.current) {
              recognitionRef.current.start();
            }
          } catch (e) {
            setState('idle');
          }
        }
      } else {
        setState('listening');
        try {
          if (recognitionRef.current) {
            recognitionRef.current.start();
          }
        } catch (e) {
          setState('idle');
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
      setState('listening');
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (e) {
        setState('idle');
      }
    }
  }, [conversation, onSearch]);

  const handleSTT = () => {
    if (!recognitionRef.current) return;

    if (state === 'listening') {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      setState('idle');
    } else {
      try {
        setState('listening');
        recognitionRef.current.start();
      } catch (e) {
        setState('idle');
      }
    }
  };

  const handleClose = () => {
    stopSpeech();
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    setState('idle');
    setConversation([]);
    setCurrentTranscript('');
    onClose();
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Generate background stars
  const backgroundStars = Array.from({ length: 25 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    size: Math.random() * 1 + 1
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#090807' }}
        >
          {/* Background Star Field */}
          {backgroundStars.map(star => (
            <div
              key={star.id}
              className="absolute rounded-full bg-white"
              style={{
                width: `${star.size}px`,
                height: `${star.size}px`,
                left: star.left,
                top: star.top,
                opacity: 0.15
              }}
            />
          ))}

          {/* Solar System */}
          <div className="relative">
            <SolarSystem 
              isListening={state === 'listening'} 
              amplitude={amplitude} 
              status={state}
              t={t}
            />
          </div>

          {/* Status Text */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 text-center"
          >
            <p
              className="text-sm tracking-wide"
              style={{ color: '#e08b3a' }}
            >
              {state === 'listening' && !currentTranscript && (t.listening || 'LISTENING...')}
              {state === 'listening' && currentTranscript && currentTranscript}
              {state === 'thinking' && (t.thinking || 'Thinking...')}
              {state === 'speaking' && (t.speaking || 'Speaking...')}
              {state === 'idle' && (t.tapMicrophone || 'Tap microphone to start')}
            </p>
          </motion.div>

          {/* End Session */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleClose}
            className="mt-4 text-xs tracking-wider transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255, 255, 255, 0.4)' }}
          >
            {(t.endSession || 'End Session')}
          </motion.button>

          {/* Bottom Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="absolute bottom-12 flex items-center gap-4"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
              aria-label="Close"
            >
              <X size={20} style={{ color: 'rgba(255, 255, 255, 0.6)' }} />
            </button>

            {/* Mic Button */}
            <button
              onClick={handleSTT}
              className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
              style={{
                backgroundColor: state === 'listening' 
                  ? 'rgba(224, 139, 58, 0.15)' 
                  : 'rgba(255, 255, 255, 0.08)',
                border: state === 'listening'
                  ? '1px solid rgba(224, 139, 58, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              }}
              aria-label="Toggle microphone"
            >
              <Mic 
                size={20} 
                style={{ 
                  color: state === 'listening' ? '#e08b3a' : 'rgba(255, 255, 255, 0.6)' 
                }} 
              />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
