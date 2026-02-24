'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';
import { useLanguage } from './LanguageProvider';
import EclipseLogo from './EclipseLogo';

export default function OnboardingLanguageScreen() {
  const { language, setLanguage, t, setHasSelectedLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [isHovering, setIsHovering] = useState<LanguageCode | null>(null);

  const selectedLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);

  const handleContinue = () => {
    setLanguage(selectedLang);
    setHasSelectedLanguage(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: '#09080f' }}
    >
      <div className="flex flex-col items-center max-w-[480px] w-full px-6">
        {/* Eclipse Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <EclipseLogo size={32} />
        </motion.div>

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            color: 'rgba(255,255,255,0.3)',
            marginBottom: '32px',
          }}
        >
          {t.chooseLanguage || 'CHOOSE YOUR LANGUAGE'}
        </motion.p>

        {/* Language Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px',
            width: '100%',
            maxWidth: '480px',
          }}
        >
          {SUPPORTED_LANGUAGES.map((lang, index) => {
            const isSelected = selectedLang === lang.code;
            const isHovered = isHovering === lang.code;

            return (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + index * 0.03, duration: 0.3 }}
                onClick={() => setSelectedLang(lang.code)}
                onMouseEnter={() => setIsHovering(lang.code)}
                onMouseLeave={() => setIsHovering(null)}
                style={{
                  background: isSelected
                    ? 'rgba(245,166,35,0.08)'
                    : isHovered
                    ? 'rgba(255,255,255,0.05)'
                    : 'rgba(255,255,255,0.03)',
                  border: isSelected
                    ? '1px solid rgba(245,166,35,0.35)'
                    : isHovered
                    ? '1px solid rgba(255,255,255,0.12)'
                    : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 150ms ease',
                  boxShadow: isSelected
                    ? '0 0 20px rgba(245,166,35,0.08)'
                    : 'none',
                  textAlign: lang.rtl ? 'right' : 'left',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                    fontWeight: 500,
                    lineHeight: 1.3,
                  }}
                >
                  {lang.nativeName}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: isSelected ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.3)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  {lang.englishName}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Continue Button */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          onClick={handleContinue}
          style={{
            marginTop: '32px',
            width: '100%',
            maxWidth: '480px',
            padding: '14px',
            background: 'rgba(245,166,35,0.12)',
            border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: '12px',
            fontSize: '13px',
            letterSpacing: '0.1em',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            textTransform: 'uppercase',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(245,166,35,0.18)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(245,166,35,0.12)';
          }}
        >
          {t.continueWith || 'Continue with'} {selectedLanguageInfo?.nativeName}
        </motion.button>
      </div>
    </motion.div>
  );
}
