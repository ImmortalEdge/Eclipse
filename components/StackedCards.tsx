'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info as InfoIcon } from 'lucide-react';

/**
 * Card Data Structure
 */
export interface StackedCardData {
    id: string;
    label: string;
    content: string;
    subValue?: string;
    info?: string;
}

interface StackedCardsProps {
    cards: StackedCardData[];
}

/**
 * StackedCards Component
 * A horizontal scroll-triggered card stack for high-fidelity data exploration.
 */
export default function StackedCards({ cards }: StackedCardsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const lastScrollTime = useRef(0);
    const touchStart = useRef<number | null>(null);

    // Transition Constants
    const springConfig = { stiffness: 300, damping: 30 };
    const COOLDOWN = 400; // ms between scroll steps

    /**
     * Handle Index Changes with bounds
     */
    const goToNext = useCallback(() => {
        if (currentIndex < cards.length - 1) {
            const now = Date.now();
            if (now - lastScrollTime.current > COOLDOWN) {
                setCurrentIndex(prev => prev + 1);
                lastScrollTime.current = now;
            }
        }
    }, [currentIndex, cards.length]);

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) {
            const now = Date.now();
            if (now - lastScrollTime.current > COOLDOWN) {
                setCurrentIndex(prev => prev - 1);
                lastScrollTime.current = now;
            }
        }
    }, [currentIndex]);

    /**
     * Native Multi-Device Event Handlers
     */
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e: WheelEvent) => {
            // Prevent page scroll only during active animation or within bounds
            const isScrollingHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            const delta = isScrollingHorizontal ? e.deltaX : e.deltaY;

            if (delta > 0 && currentIndex < cards.length - 1) {
                e.preventDefault();
                goToNext();
            } else if (delta < 0 && currentIndex > 0) {
                e.preventDefault();
                goToPrev();
            }
        };

        // Passive: false is required to allow preventDefault()
        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [currentIndex, cards.length, goToNext, goToPrev]);

    /**
     * Mobile Touch Handlers
     */
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStart.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart.current === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const delta = touchStart.current - touchEnd;

        const swipeThreshold = 50;
        if (delta > swipeThreshold) {
            goToNext();
        } else if (delta < -swipeThreshold) {
            goToPrev();
        }

        touchStart.current = null;
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Stack Container */}
            <div
                ref={containerRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative w-full min-h-[260px] mb-8 cursor-ns-resize"
                style={{ paddingBottom: '32px' }}
            >
                <AnimatePresence mode="popLayout" initial={false}>
                    {cards.map((card, i) => {
                        // Calculate relative position to current index
                        const relIndex = i - currentIndex;

                        // Card is already peeled off
                        if (relIndex < 0) return null;

                        // Card is too far back
                        if (relIndex > 2 && i !== currentIndex) {
                            // Only render the next 3 cards for performance and visual layering
                            return null;
                        }

                        // Styles based on stack depth
                        const isFront = relIndex === 0;
                        const depth = relIndex;
                        const offset = depth * 8;
                        const scale = 1 - depth * 0.05;
                        const opacity = depth === 0 ? 1 : depth === 1 ? 0.85 : 0.65;

                        return (
                            <motion.div
                                key={card.id || i}
                                layout
                                initial={relIndex < 0 ? { opacity: 0, y: -40, scale: 1.05 } : { opacity: 0, scale: 0.85, y: 30 }}
                                animate={{
                                    zIndex: 50 - depth,
                                    x: offset,
                                    y: offset,
                                    scale: scale,
                                    opacity: opacity,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -80,
                                    scale: 1.05,
                                    transition: { duration: 0.4, ease: "easeOut" }
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    opacity: { duration: 0.3 }
                                }}
                                className={`absolute inset-x-0 top-0 rounded-2xl p-6 bg-[#1a1714] border border-white/10 backdrop-blur-3xl overflow-hidden min-h-[200px] flex flex-col justify-between`}
                            >

                                {/* Card Header */}
                                <div className="flex items-start justify-between relative z-10">
                                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">
                                        {card.label}
                                    </span>
                                    <button
                                        className="text-white/30 hover:text-white/60 transition-colors"
                                        title={card.info}
                                    >
                                        <InfoIcon size={14} strokeWidth={1.5} />
                                    </button>
                                </div>

                                {/* Card Body */}
                                <div className="mt-4 relative z-10">
                                    <p className="text-[18px] font-semibold text-white leading-[1.3] font-sans tracking-tight">
                                        {card.content}
                                    </p>
                                    {card.subValue && (
                                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-6 pt-4 border-t border-white/5">
                                            {card.subValue}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Scroll Indicator Dots */}
            <div className="flex items-center justify-center gap-2.5">
                {cards.map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            width: i === currentIndex ? 8 : 6,
                            height: i === currentIndex ? 8 : 6,
                            backgroundColor: i === currentIndex ? '#F5A623' : '#FFFFFF',
                            opacity: i === currentIndex ? 1 : 0.25,
                        }}
                        transition={springConfig}
                        className="rounded-full cursor-pointer"
                        onClick={() => setCurrentIndex(i)}
                    />
                ))}
            </div>
        </div>
    );
}
