'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import { initSpeechRecognition } from '@/lib/voice';

interface STTButtonProps {
  onTranscript: (text: string) => void;
  isFocused: boolean;
}

export default function STTButton({ onTranscript, isFocused }: STTButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);
  const pulseRef = useRef<boolean>(false);

  useEffect(() => {
    const recognition = initSpeechRecognition();
    if (!recognition) {
      setSupported(false);
      return;
    }

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');

      if (event.results[0].isFinal) {
        onTranscript(transcript);
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
      } catch (e) {}
    };
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
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

  if (!supported) return null;

  return (
    <motion.button
      type="button"
      onClick={toggleListening}
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
      style={{
        background: isListening
          ? 'rgba(180, 160, 255, 0.2)'
          : 'rgba(180, 160, 255, 0.1)',
        border: '1px solid rgba(180, 160, 255, 0.25)',
        boxShadow: isListening 
          ? '0 0 16px rgba(180, 160, 255, 0.2)'
          : 'none',
        cursor: 'pointer',
        zIndex: 10,
      }}
      animate={isListening ? { scale: [1, 0.95, 1.05, 1] } : { scale: 1 }}
      transition={isListening ? { duration: 0.6, repeat: Infinity } : { duration: 0.2 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label="Voice input"
    >
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            border: '1px solid rgba(180,160,255,0.4)',
            boxShadow: '0 0 20px rgba(180,160,255,0.2)'
          }}
          animate={{ scale: [1, 1.1], opacity: [0.8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
      <Mic size={15} className="text-white" style={{ opacity: 0.7 }} />
    </motion.button>
  );
}
