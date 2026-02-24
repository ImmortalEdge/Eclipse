'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import WaveformAnimation from './WaveformAnimation';

interface SmartSendButtonProps {
  hasText: boolean;
  loading: boolean;
  onSendSearch: (e: any) => void;
  onOpenVoiceUI: () => void;
}

export default function SmartSendButton({
  hasText,
  loading,
  onSendSearch,
  onOpenVoiceUI
}: SmartSendButtonProps) {
  const handleClick = () => {
    if (loading) return;
    if (hasText) {
      onSendSearch({ preventDefault: () => {} });
    } else {
      onOpenVoiceUI();
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative"
      style={{
        background: hasText
          ? 'rgba(245, 166, 35, 0.2)'
          : 'rgba(245, 166, 35, 0.1)',
        border: hasText
          ? '1px solid rgba(245, 166, 35, 0.5)'
          : '1px solid rgba(245, 166, 35, 0.3)',
        boxShadow: hasText
          ? '0 0 16px rgba(245, 166, 35, 0.25)'
          : 'none',
        opacity: loading ? 0.5 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
        zIndex: 10,
      }}
      animate={hasText ? { scale: 1 } : { scale: [0.98, 1.02, 1] }}
      transition={hasText ? { duration: 0.2 } : { duration: 2, repeat: Infinity }}
      whileHover={!loading ? { scale: 1.1 } : {}}
      whileTap={!loading ? { scale: 0.9 } : {}}
    >
      <AnimatePresence mode="wait">
        {hasText ? (
          <motion.div
            key="arrow"
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15 }}
          >
            <ArrowUp size={16} className="text-white" strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            key="wave"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <WaveformAnimation />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
