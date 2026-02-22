'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Search, Globe } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import EclipseLogo from './EclipseLogo';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface Step {
    id: string;
    label: string;
    status: 'pending' | 'active' | 'complete';
    queries?: string[];
}

interface CognitivePathProps {
    steps: Step[];
    mode: 'fast' | 'research_extreme';
    sources?: any[];
    streamingText?: string;
}

/** Extract a readable preview from the raw JSON token stream */
function extractReadablePreview(raw: string): string {
    if (!raw) return '';

    // Try to pull text from "keyInsight" first — it's usually first and readable
    const insightMatch = raw.match(/"keyInsight"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
    if (insightMatch) {
        return insightMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
    }

    // Next try first segment text
    const segMatch = raw.match(/"text"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
    if (segMatch) {
        const t = segMatch[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim();
        if (t.length > 20) return t;
    }

    // Fallback: strip JSON noise and show raw chars if they look like prose
    const stripped = raw
        .replace(/\{|\}|\[|\]/g, '')
        .replace(/"[a-zA-Z_]+"\s*:/g, '')
        .replace(/\\[nrt"\\]/g, ' ')
        .replace(/[",]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // Only show if it looks like real words (avg word length reasonable)
    const words = stripped.split(' ').filter(w => /^[a-zA-Z]/.test(w));
    if (words.length >= 6) return words.slice(0, 60).join(' ');

    return '';
}

/** Deduplicate sources by hostname, returning unique domain rows with count */
function deduplicateSources(sources: any[]): Array<{ url: string; domain: string; count: number }> {
    const map = new Map<string, { url: string; domain: string; count: number }>();
    for (const source of sources) {
        const url = typeof source === 'string' ? source : source.url;
        try {
            const domain = new URL(url).hostname.replace('www.', '');
            if (map.has(domain)) {
                map.get(domain)!.count++;
            } else {
                map.set(domain, { url, domain, count: 1 });
            }
        } catch { /* skip invalid URLs */ }
    }
    return Array.from(map.values());
}

export default function CognitivePath({ steps, mode, sources = [], streamingText = '' }: CognitivePathProps) {
    const completedSteps = useMemo(() => steps.filter(s => s.status === 'complete'), [steps]);
    const activeStep = useMemo(() => steps.find(s => s.status === 'active'), [steps]);
    const isExtreme = mode === 'research_extreme';

    const isSynthesizing = activeStep?.id === 'synthesizing';
    const preview = useMemo(() => extractReadablePreview(streamingText), [streamingText]);
    const uniqueSources = useMemo(() => deduplicateSources(sources), [sources]);

    if (!isExtreme) {
        // ── VELOCITY MODE ──
        return (
            <div className="flex flex-col gap-4 py-2 px-6 w-full max-w-lg select-none">
                <AnimatePresence mode="wait">
                    {activeStep && (
                        <motion.div
                            key={activeStep.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="flex items-center gap-4"
                        >
                            <div className="flex items-center justify-center w-5 h-5" style={{ overflow: 'visible' }}>
                                <EclipseLogo size={16} animate={true} loop={true} />
                            </div>
                            <span className="text-[14px] font-medium text-zinc-100 tracking-tight italic font-[family-name:var(--font-instrument-serif)]">
                                {activeStep.label}
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {activeStep?.queries && activeStep.queries.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-9">
                        {activeStep.queries.slice(-2).map((q, i) => (
                            <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                                className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">
                                / {q}
                            </motion.span>
                        ))}
                    </div>
                )}

                {/* Live streaming preview below synthesizing step */}
                <AnimatePresence>
                    {isSynthesizing && preview && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-2 pl-9"
                        >
                            <StreamingPreview text={preview} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Skeleton when no preview yet + synthesizing */}
                {isSynthesizing && !preview && <SynthesisSkeleton className="pl-9 mt-2" />}
            </div>
        );
    }

    // ── INFINITE SPECTRUM MODE ──
    return (
        <div className="relative pl-8 py-4 w-full max-w-xl select-none">
            {/* Timeline line */}
            <div className="absolute left-[13px] top-6 bottom-4 w-[1px] bg-zinc-800" />

            {/* Completed steps header */}
            {completedSteps.length > 0 && (
                <div className="flex items-center gap-2 mb-6 -ml-2 px-2 py-1">
                    <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                        ✓ {completedSteps.length} {completedSteps.length === 1 ? 'step' : 'steps'} completed
                    </span>
                </div>
            )}

            <div className="space-y-8">
                {/* Active Step */}
                {activeStep && (
                    <motion.div
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative"
                    >
                        {/* EclipseLogo on active step */}
                        <div className="absolute -left-[23px] top-[0px] z-10" style={{ overflow: 'visible' }}>
                            <EclipseLogo size={16} animate={true} loop={true} />
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Step label */}
                            <span className="text-[15px] font-semibold text-white tracking-tight leading-snug">
                                {activeStep.label}
                            </span>

                            {/* SEARCHING sub-layer */}
                            {activeStep.queries && activeStep.queries.length > 0 && (
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e08b3a]/60">
                                        <Search size={10} />
                                        Searching
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <AnimatePresence mode="popLayout">
                                            {activeStep.queries.slice(-3).map((query, idx, arr) => {
                                                const isLast = idx === arr.length - 1;
                                                return (
                                                    <motion.div
                                                        key={query}
                                                        layout
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: isLast ? 1 : 0.4, x: 0 }}
                                                        exit={{ opacity: 0, x: 10 }}
                                                        className="flex items-center gap-3"
                                                    >
                                                        <div className="flex items-center justify-center w-4">
                                                            {isLast ? (
                                                                <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shadow-[0_0_8px_rgba(245,166,35,0.8)] animate-pulse" />
                                                            ) : (
                                                                <div className="w-1 h-[1px] bg-zinc-800" />
                                                            )}
                                                        </div>
                                                        <span className={cn(
                                                            "text-[14px] leading-none tracking-tight font-[family-name:var(--font-instrument-serif)] italic",
                                                            isLast ? "text-zinc-100 font-medium" : "text-zinc-500"
                                                        )}>
                                                            {query}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {/* REVIEWING SOURCES — no card border, flows naturally */}
                            {uniqueSources.length > 0 && (
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e08b3a]/60">
                                        <Globe size={10} />
                                        Reviewing sources
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        {uniqueSources.map((s, i) => (
                                            <motion.div
                                                key={s.domain}
                                                initial={{ opacity: 0, x: -6 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="flex items-center gap-3"
                                            >
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                                                    className="w-3.5 h-3.5 grayscale opacity-40 shrink-0"
                                                    alt=""
                                                />
                                                <span className="text-[12px] text-zinc-400 truncate">
                                                    {s.domain}
                                                    {s.count > 1 && (
                                                        <span className="ml-1.5 text-[10px] text-zinc-600 font-bold">×{s.count}</span>
                                                    )}
                                                </span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Live synthesizing preview — the big upgrade */}
                            <AnimatePresence>
                                {isSynthesizing && preview && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#e08b3a]/60">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] animate-pulse" />
                                            Coalescing
                                        </div>
                                        <StreamingPreview text={preview} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Skeleton while synthesizing but no tokens yet */}
                            {isSynthesizing && !preview && <SynthesisSkeleton />}
                        </div>
                    </motion.div>
                )}

                {/* All done */}
                {steps.every(s => s.status === 'complete') && (
                    <div className="flex items-center gap-4 py-2 mt-4 opacity-40 border-t border-zinc-900">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Coalescence achieved</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/** Pulsing skeleton cards shown while waiting for first tokens */
function SynthesisSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={cn('flex flex-col gap-2 mt-1 animate-pulse', className)}>
            <div className="h-[10px] w-[90%] rounded-full bg-zinc-800/70" />
            <div className="h-[10px] w-[75%] rounded-full bg-zinc-800/50" />
            <div className="h-[10px] w-[55%] rounded-full bg-zinc-800/30" />
        </div>
    );
}

/** Renders streaming text with a blinking cursor at the end */
function StreamingPreview({ text }: { text: string }) {
    return (
        <p className="text-[13px] leading-relaxed text-zinc-300 font-[family-name:var(--font-instrument-serif)] italic tracking-tight max-w-lg">
            {text}
            <span className="inline-block w-[2px] h-[13px] bg-[#f5a623] ml-0.5 align-middle animate-[blink_1s_step-end_infinite]" />
            <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
        </p>
    );
}
