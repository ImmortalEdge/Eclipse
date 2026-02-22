'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';

export interface Source {
    name: string;
    shortName: string;
    favicon: string;
    title: string;
    summary: string;
    date: string;
    url: string;
}

export interface CitationData {
    id: string;
    sources: Source[];
}

interface CitationProps {
    data: CitationData;
}

/**
 * Citation Component
 * High-fidelity inline citation system with portal-based hover previews.
 */
export default function Citation({ data }: CitationProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const chipRef = useRef<HTMLSpanElement>(null);
    const tooltipId = useId();

    const updatePosition = () => {
        if (chipRef.current) {
            const rect = chipRef.current.getBoundingClientRect();
            setCoords({
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    };

    const toggleVisible = (open: boolean) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            if (open) {
                updatePosition();
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        }, open ? 150 : 300); // 300ms grace period to travel between chip and tooltip
    };

    const handleMouseEnter = () => toggleVisible(true);
    const handleMouseLeave = () => toggleVisible(false);

    useEffect(() => {
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, []);

    // Removal of redundant effect

    const primarySource = data.sources[0];
    const hasMultiple = data.sources.length > 1;

    return (
        <span className="inline-block align-baseline mx-0.5 select-none">
            <span
                ref={chipRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-describedby={tooltipId}
                className="inline-flex items-center gap-1.5 px-2 py-[2px] rounded-md bg-white/[0.08] border border-white/[0.12] hover:border-[#F5A623]/40 transition-colors cursor-pointer"
            >
                {primarySource?.favicon && (
                    <img
                        src={primarySource.favicon}
                        alt=""
                        className="w-3 h-3 rounded-[2px] opacity-70"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                )}
                <span className="text-[11px] text-white/70 font-medium">
                    {primarySource?.shortName || primarySource?.name}
                    {hasMultiple && (
                        <span className="text-[#F5A623] ml-1">
                            +{data.sources.length - 1}
                        </span>
                    )}
                </span>
            </span>

            {typeof document !== 'undefined' &&
                createPortal(
                    <AnimatePresence>
                        {isVisible && (
                            <TooltipPortal
                                id={tooltipId}
                                coords={coords}
                                sources={data.sources}
                                onMouseEnter={() => toggleVisible(true)}
                                onMouseLeave={() => toggleVisible(false)}
                            />
                        )}
                    </AnimatePresence>,
                    document.body
                )}
        </span>
    );
}

function TooltipPortal({ id, coords, sources, onMouseEnter, onMouseLeave }: any) {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        if (tooltipRef.current) {
            const rect = tooltipRef.current.getBoundingClientRect();
            // If the tooltip would go off the top of the viewport, flip it below the chip
            if (coords.top - rect.height - 12 < window.scrollY) {
                setIsFlipped(true);
            }
        }
    }, [coords.top]);

    const yOffset = isFlipped ? 28 : -(70 + (sources.length > 1 ? sources.length * 40 : 100)); // Dynamic offset
    // Precise calculation for centered position
    const tooltipStyle: React.CSSProperties = {
        position: 'absolute',
        top: isFlipped ? coords.top + 24 : coords.top, // Snap to chip
        left: coords.left + coords.width / 2,
        transform: 'translateX(-50%)',
        zIndex: 9999,
        pointerEvents: 'auto',
    };

    return (
        <div
            id={id}
            role="tooltip"
            ref={tooltipRef}
            style={tooltipStyle}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <motion.div
                initial={{ opacity: 0, y: isFlipped ? -4 : 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isFlipped ? -4 : 4 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                    width: '280px',
                    backgroundColor: '#1c1917',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(245,166,35,0.08)',
                    position: 'relative',
                    transform: isFlipped ? 'translateY(8px)' : 'translateY(-100%) translateY(-8px)',
                }}
            >
                {/* Visual Arrow */}
                <div
                    style={{
                        position: 'absolute',
                        [isFlipped ? 'top' : 'bottom']: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%) rotate(45deg)',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#1c1917',
                        borderBottom: isFlipped ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderRight: isFlipped ? 'none' : '1px solid rgba(255,255,255,0.1)',
                        borderTop: isFlipped ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        borderLeft: isFlipped ? '1px solid rgba(255,255,255,0.1)' : 'none',
                    }}
                />

                <div className="flex flex-col gap-2">
                    {sources.length === 1 ? (
                        <SingleSourceView source={sources[0]} />
                    ) : (
                        <MultipleSourceView sources={sources} />
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function SingleSourceView({ source }: { source: Source }) {
    return (
        <div className="flex flex-col">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img
                        src={source.favicon}
                        className="w-4 h-4 rounded-[4px]"
                        alt=""
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <span className="text-[13px] font-semibold text-white">
                        {source.name}
                    </span>
                </div>
                <ExternalLink size={12} className="text-white/30" />
            </div>

            {source.title && (
                <h4 className="text-[12px] font-medium text-white/90 leading-[1.4] mt-2 line-clamp-2">
                    {source.title}
                </h4>
            )}

            {source.summary && (
                <p className="text-[11px] text-white/50 leading-[1.5] mt-1 line-clamp-3">
                    {source.summary}
                </p>
            )}

            <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-white/30">{source.date}</span>
                <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/link flex items-center gap-1 text-[11px] text-[#F5A623] hover:underline"
                >
                    View source <ArrowRight size={10} className="group-hover/link:translate-x-0.5 transition-transform" />
                </a>
            </div>
        </div>
    );
}

function MultipleSourceView({ sources }: { sources: Source[] }) {
    return (
        <div className="flex flex-col">
            <div className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-2">
                Multiple Sources
            </div>
            <div className="space-y-0.5">
                {sources.map((source, i) => (
                    <a
                        key={i}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between py-2 px-1 hover:bg-white/[0.04] rounded-md transition-colors group/row border-b border-white/[0.06] last:border-0"
                    >
                        <div className="flex items-center gap-2">
                            <img
                                src={source.favicon}
                                className="w-3.5 h-3.5 rounded-[4px] opacity-70 group-hover/row:opacity-100"
                                alt=""
                            />
                            <span className="text-[12px] text-white/70 group-hover/row:text-white transition-colors">
                                {source.name}
                            </span>
                        </div>
                        <ExternalLink size={10} className="text-white/20 group-hover/row:text-white/50" />
                    </a>
                ))}
            </div>
        </div>
    );
}
