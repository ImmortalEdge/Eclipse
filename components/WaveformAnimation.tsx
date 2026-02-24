'use client';

import { motion } from 'framer-motion';

export default function WaveformAnimation() {
  const bars = [
    { duration: 0.8 },
    { duration: 0.6 },
    { duration: 1.0 }
  ];

  return (
    <div className="flex items-center justify-center gap-[3px]">
      {bars.map((bar, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          style={{
            background: 'rgba(245,166,35,0.7)',
            height: '4px'
          }}
          animate={{ height: ['4px', '16px'] }}
          transition={{
            duration: bar.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            repeatType: 'reverse'
          }}
        />
      ))}
    </div>
  );
}
