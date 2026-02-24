'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EclipseLogo from './EclipseLogo';
import { languages, useLanguage, LanguageCode } from '@/lib/i18n';

interface LanguageOnboardingProps {
    onComplete: () => void;
}

export default function LanguageOnboarding({ onComplete }: LanguageOnboardingProps) {
    const { language: currentLang, setLanguage, t } = useLanguage();
    const [selected, setSelected] = useState<LanguageCode>(currentLang);

    const handleSelect = (lang: LanguageCode) => {
        setSelected(lang);
    };

    const handleContinue = () => {
        setLanguage(selected);
        onComplete();
    };

    const selectedLang = languages.find(l => l.code === selected);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-[#09080f]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6"
        >
            <div className="flex flex-col items-center max-w-[480px] w-full">
                <div className="mb-4">
                    <EclipseLogo size={32} animate={false} loop={false} />
                </div>

                <div className="text-sm uppercase font-bold tracking-wider text-white/40 mb-6">
                    {t?.chooseLanguage || "CHANGE LANGUAGE"}
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 w-full">
                    {languages.map((lang) => {
                        const isSelected = selected === lang.code;
                        return (
                            <motion.button
                                key={lang.code}
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.96 }}
                                onClick={() => handleSelect(lang.code)}
                                className={`flex flex-col items-center justify-center gap-1 p-4 rounded-lg border-2 transition-all duration-200 text-center w-full
                                    ${isSelected
                                        ? 'bg-[#f5a623]/10 border-[#f5a623] shadow-lg shadow-[#f5a623]/20'
                                        : 'bg-white/[0.02] border-white/[0.15] hover:bg-white/[0.06] hover:border-white/25'
                                    }
                                `}
                            >
                                {lang.emoji && <span className="text-2xl mb-1">{lang.emoji}</span>}
                                <span className={`text-base font-semibold transition-colors
                                    ${isSelected ? 'text-white' : 'text-white/80'}`}
                                >
                                    {lang.nativeName}
                                </span>
                                <span className={`text-xs tracking-[0.08em] transition-colors
                                    ${isSelected ? 'text-[#f5a623]/70' : 'text-white/40'}`}
                                >
                                    {lang.name}
                                </span>
                            </motion.button>
                        );
                    })}
                </div>

                <motion.button
                    initial={false}
                    animate={{
                        opacity: selected ? 1 : 0.5,
                        y: selected ? 0 : 10
                    }}
                    disabled={!selected}
                    onClick={handleContinue}
                    className="mt-8 w-full p-3.5 bg-[#f5a623]/20 border border-[#f5a623]/40 rounded-lg text-sm font-semibold tracking-wide text-white/90 hover:bg-[#f5a623]/30 transition-all duration-200 active:scale-95"
                >
                    {selectedLang ? (t?.continue?.replace('English', selectedLang.nativeName) || `Continue with ${selectedLang.nativeName}`) : 'Continue'}
                </motion.button>
            </div>
        </motion.div>
    );
}
