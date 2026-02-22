'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { StackCardSchema } from '@/lib/knowledge-stack';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const schemaCache = new Map<string, StackCardSchema>();

async function fetchStackSchema(result: any): Promise<StackCardSchema> {
    const resultId = result.id || result.url;
    if (schemaCache.has(resultId)) return schemaCache.get(resultId)!;

    const res = await fetch('/api/generate-stack-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
    });
    if (!res.ok) throw new Error('Failed');
    const schema = await res.json();
    schemaCache.set(resultId, schema);
    return schema;
}

function StackCardRenderer({
    schema,
    index,
    total,
    isActive
}: {
    schema: StackCardSchema;
    index: number;
    total: number;
    isActive: boolean;
}) {
    const getStyles = (idx: number) => {
        // Only show up to 3 cards in the stack view
        if (idx === 0) return { scale: 1, opacity: 1, y: 0, zIndex: 10 };
        if (idx === 1) return { scale: 0.97, opacity: 0.6, y: 12, zIndex: 5 };
        if (idx === 2) return { scale: 0.94, opacity: 0.35, y: 24, zIndex: 2 };
        return { scale: 0.9, opacity: 0, y: 36, zIndex: 0 };
    };

    const styles = getStyles(index);
    const headlineSize = {
        large: 'text-[19px]',
        medium: 'text-[16px]',
        small: 'text-[14px]',
    }[schema.headlineSize];

    return (
        <motion.div
            initial={false}
            animate={{
                scale: styles.scale,
                opacity: styles.opacity,
                y: styles.y,
                zIndex: styles.zIndex,
                pointerEvents: isActive ? 'auto' : 'none'
            }}
            transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                mass: 0.8
            }}
            className={cn(
                "absolute top-0 left-0 w-full min-h-[140px] max-h-[200px] bg-[#0c0c0c] border border-white/10 rounded-[14px] p-[20px_22px] flex flex-col justify-between overflow-hidden",
                isActive && "shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(245,166,35,0.03)]",
                schema.hasAccent && "border-l-2 border-l-[#F5A623]",
                !isActive && "select-none"
            )}
        >
            <div className={cn("transition-opacity duration-300", !isActive && "opacity-40")}>
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#F5A623]/60 mb-3">
                    {schema.label}
                </div>
                <h2 className={cn(
                    "text-white leading-[1.3] font-[family-name:var(--font-instrument-serif)] italic mb-2 line-clamp-2",
                    headlineSize
                )}>
                    {schema.headline}
                </h2>
                <p className="text-[13px] text-zinc-400 leading-[1.5] line-clamp-2 overflow-hidden mb-3">
                    {schema.body}
                </p>
            </div>
            <div className={cn("flex justify-end transition-opacity duration-300", !isActive && "opacity-0")}>
                <a
                    href={schema.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[9px] font-black text-white/30 hover:text-[#F5A623] transition-colors uppercase tracking-widest flex items-center gap-1.5"
                >
                    {schema.source}
                </a>
            </div>
        </motion.div>
    );
}

const SkeletonCard = ({ index }: { index: number }) => {
    const getStyles = (idx: number) => {
        if (idx === 0) return { scale: 1, opacity: 1, y: 0, zIndex: 3 };
        if (idx === 1) return { scale: 0.97, opacity: 0.6, y: 8, zIndex: 2 };
        if (idx === 2) return { scale: 0.94, opacity: 0.35, y: 16, zIndex: 1 };
        return { scale: 0.91, opacity: 0, y: 24, zIndex: 0 };
    };
    const styles = getStyles(index);

    return (
        <div
            style={{
                transform: `scale(${styles.scale}) translateY(${styles.y}px)`,
                opacity: styles.opacity,
                zIndex: styles.zIndex
            }}
            className="absolute top-0 left-0 w-full h-[150px] bg-[#1a1714] border border-white/[0.08] rounded-[14px] overflow-hidden"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-shimmer" />
        </div>
    );
};

export default function KnowledgeStack({ results }: { results: any[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [schemas, setSchemas] = useState<(StackCardSchema | null)[]>([]);
    const scrollAccumulator = useRef(0);
    const lastScrollTime = useRef(0);
    const stackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadAll = async () => {
            const topResults = results.slice(0, 3);
            const newSchemas = new Array(topResults.length).fill(null);
            setSchemas(newSchemas);

            topResults.forEach(async (res, i) => {
                try {
                    const s = await fetchStackSchema(res);
                    setSchemas(prev => {
                        const up = [...prev];
                        if (i < up.length) up[i] = s;
                        return up;
                    });
                } catch (e) {
                    console.error('Failed to load stack card:', e);
                    // Provide client-side recovery if API is unreachable
                    setSchemas(prev => {
                        const up = [...prev];
                        if (i < up.length) {
                            up[i] = {
                                label: "ARCHIVAL NODE",
                                headline: res.title || "Technical Fragment",
                                headlineSize: "medium",
                                body: "Discovery in progress. Investigating archival signals via backup protocols.",
                                source: "eclipse.internal",
                                sourceUrl: res.url,
                                hasAccent: false
                            };
                        }
                        return up;
                    });
                }
            });
        };
        loadAll();
    }, [results]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScrollTime.current < 200) return;

        if (e.deltaY > 20) {
            setCurrentIndex(prev => Math.min(prev + 1, schemas.length - 1));
            lastScrollTime.current = now;
        } else if (e.deltaY < -20) {
            setCurrentIndex(prev => Math.max(0, prev - 1));
            lastScrollTime.current = now;
        }
    }, [schemas.length]);

    useEffect(() => {
        const el = stackRef.current;
        if (!el) return;
        el.addEventListener('wheel', handleWheel, { passive: false });
        return () => el.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    const swipeHandlers = useRef<{ startY: number }>({ startY: 0 });

    const handleTouchStart = (e: React.TouchEvent) => {
        swipeHandlers.current.startY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endY = e.changedTouches[0].clientY;
        const diff = swipeHandlers.current.startY - endY;
        if (Math.abs(diff) > 50) {
            if (diff > 0) setCurrentIndex(prev => Math.min(prev + 1, schemas.length - 1));
            else setCurrentIndex(prev => Math.max(prev - 1, 0));
        }
    };

    if (results.length === 0) return null;

    return (
        <div className="flex flex-col w-full">
            {/* Minimalist Archival Header */}
            <div className="flex items-center justify-between mb-6 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#f5a623] shadow-[0_0_8px_rgba(245,166,35,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                        Knowledge Stack
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        {schemas.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-[1.5px] rounded-full transition-all duration-300",
                                    i === currentIndex ? "w-6 bg-[#f5a623]" : "w-2 bg-white/10"
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 tracking-tighter">
                        {currentIndex + 1} <span className="opacity-30">/</span> {schemas.length}
                    </span>
                </div>
            </div>

            <div
                ref={stackRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full h-[220px] cursor-ns-resize perspective-1000"
            >
                <div className="absolute -inset-10 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,166,35,0.02)_0%,_transparent_70%)] pointer-events-none" />

                <AnimatePresence initial={false}>
                    {schemas.map((schema, i) => {
                        const relIndex = i - currentIndex;
                        if (relIndex < 0) {
                            if (relIndex === -1) {
                                return (
                                    <motion.div
                                        key={`exit-${i}`}
                                        initial={{ opacity: 1, scale: 1, y: 0 }}
                                        animate={{ opacity: 0, scale: 0.98, y: -20 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.28, ease: "easeOut" }}
                                        className="absolute inset-0 pointer-events-none"
                                    >
                                        {schema && <StackCardRenderer schema={schema} index={0} total={schemas.length} isActive={false} />}
                                    </motion.div>
                                );
                            }
                            return null;
                        }
                        if (relIndex > 4) return null;

                        return schema ? (
                            <StackCardRenderer
                                key={i}
                                schema={schema}
                                index={relIndex}
                                total={schemas.length}
                                isActive={relIndex === 0}
                            />
                        ) : (
                            <SkeletonCard key={`skel-${i}`} index={relIndex} />
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
