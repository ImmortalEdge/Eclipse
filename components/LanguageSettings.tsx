'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode } from '@/lib/i18n';
import { useLanguage } from './LanguageProvider';

interface LanguageSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageSettings({ isOpen, onClose }: LanguageSettingsProps) {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LanguageCode>(language);
  const [isHovering, setIsHovering] = useState<LanguageCode | null>(null);

  const handleLanguageSelect = (langCode: LanguageCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
          >
            <div
              className="relative w-full max-w-[520px] max-h-[80vh] overflow-y-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(18,15,12,0.98) 0%, rgba(25,22,18,0.98) 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ background: 'rgba(245,166,35,0.1)' }}
                  >
                    <Globe size={18} style={{ color: 'rgba(245,166,35,0.8)' }} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      Language
                    </h2>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255,255,255,0.4)',
                        marginTop: '2px',
                      }}
                    >
                      Current: {currentLanguage?.flag} {currentLanguage?.nativeName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Language Grid */}
              <div className="p-5">
                <p
                  style={{
                    fontSize: '11px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.15em',
                    color: 'rgba(255,255,255,0.3)',
                    marginBottom: '16px',
                  }}
                >
                  {t.chooseLanguage || 'CHOOSE YOUR LANGUAGE'}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                  }}
                >
                  {SUPPORTED_LANGUAGES.map((lang) => {
                    const isSelected = selectedLang === lang.code;
                    const isHovered = isHovering === lang.code;

                    return (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
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
                          borderRadius: '10px',
                          padding: '12px 10px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '3px',
                          transition: 'all 150ms ease',
                          boxShadow: isSelected
                            ? '0 0 16px rgba(245,166,35,0.06)'
                            : 'none',
                          textAlign: lang.rtl ? 'right' : 'left',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '16px',
                            marginBottom: '2px',
                          }}
                        >
                          {lang.flag}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: isSelected ? 'white' : 'rgba(255,255,255,0.8)',
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {lang.nativeName}
                        </span>
                        <span
                          style={{
                            fontSize: '9px',
                            color: isSelected ? 'rgba(245,166,35,0.6)' : 'rgba(255,255,255,0.3)',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {lang.englishName}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div
                className="p-5 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(245,166,35,0.12)',
                    border: '1px solid rgba(245,166,35,0.3)',
                    borderRadius: '10px',
                    fontSize: '13px',
                    letterSpacing: '0.08em',
                    color: 'rgba(255,255,255,0.85)',
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
                  {t.continueWith || 'Continue with'} {currentLanguage?.nativeName}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
