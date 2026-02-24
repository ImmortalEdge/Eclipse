import {
    TrendingUp,
    Target,
    Globe,
    Clock,
    Calendar,
    ExternalLink,
    Info,
    CornerDownRight,
    Share2,
    Download,
    Copy,
    RotateCcw,
    ThumbsUp,
    ThumbsDown,
    MoreHorizontal,
    X,
    Layers,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight,
    TrendingDown,
    Activity,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useMemo, useEffect } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import KnowledgeStack from './KnowledgeStack';
import StackedCards from './StackedCards';
import Citation, { CitationData } from './Citation';
import CalculatorWidget from './CalculatorWidget';
import NearbyMapWidget from './NearbyMapWidget';
import StockWidget from './StockWidget';
import EclipseLogo from './EclipseLogo';
import DeepModeRenderer from './DeepModeRenderer';
import { detectCalculatorIntent, parseExpression, CalcResult } from '@/lib/calculator';
import { detectNearbyIntent, NearbyIntent } from '@/lib/map';
import { detectStockIntent, StockDetectResult } from '@/lib/stock';

import { useLanguage } from './LanguageProvider';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';

const SourceBadge = ({ source }: { source: any }) => {
    if (!source) return null;

    const citationData: CitationData = {
        id: `cit-${Math.random().toString(36).substr(2, 9)}`,
        sources: [
            {
                name: source.name || source.domain,
                shortName: source.domain?.split('.')[0]?.toUpperCase() || source.name?.substr(0, 3)?.toUpperCase(),
                favicon: `https://www.google.com/s2/favicons?domain=${source.domain || new URL(source.url).hostname}&sz=64`,
                title: source.title || 'Source Context',
                summary: source.summary || 'No technical summary provided for this archive entry.',
                date: source.date || 'Spectral Data',
                url: source.url
            }
        ]
    };

    return <Citation data={citationData} />;
};

import { useIsMobile } from '@/lib/hooks';

export default function AIResult({ result, onSearch, isStreaming = false }: { result: any; onSearch?: (query: string) => void; isStreaming?: boolean }) {
    const { t } = useLanguage();
    const [showSources, setShowSources] = useState(false);
    const [calcData, setCalcData] = useState<CalcResult | null>(null);
    const [nearbyData, setNearbyData] = useState<NearbyIntent | null>(null);
    const [stockData, setStockData] = useState<StockDetectResult | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const { query, answer, results } = result || {};

    // Scroll to top when answer finishes loading
    useEffect(() => {
        if (answer && !isStreaming && containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [answer, isStreaming]);

    useEffect(() => {
        if (!query) {
            setCalcData(null);
            setNearbyData(null);
            setStockData(null);
            return;
        }

        // Extract actual user question (not the URL-augmented query)
        const userQuestion = query.includes('User question:') 
            ? query.split('User question:')[1].trim() 
            : query;

        // 1. Check for Calculator Intent
        if (detectCalculatorIntent(userQuestion)) {
            const parsed = parseExpression(userQuestion);
            setCalcData(parsed);
            setNearbyData(null);
            setStockData(null);
            return;
        }

        // 2. Check for Stock Intent (only on user question, not URL content)
        const stock = detectStockIntent(userQuestion);
        if (stock.isStock) {
            setStockData(stock);
            setCalcData(null);
            setNearbyData(null);
            return;
        }

        // 3. Check for Nearby/Map Intent
        const nearby = detectNearbyIntent(userQuestion);
        if (nearby.isNearby) {
            setNearbyData(nearby);
            setCalcData(null);
            setStockData(null);
            return;
        }

        // 4. Reset if no widget intent detected
        setCalcData(null);
        setNearbyData(null);
        setStockData(null);
    }, [query]);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !isExpanded) return;

        const handleWheel = (e: WheelEvent) => {
            const scrollAmount = e.deltaY;
            if (scrollAmount === 0) return;

            const isAtStart = container.scrollLeft <= 0;
            const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;

            if ((scrollAmount < 0 && !isAtStart) || (scrollAmount > 0 && !isAtEnd)) {
                e.preventDefault();
                container.scrollLeft += scrollAmount;
            }
        };

        container.addEventListener('wheel', handleWheel, { passive: false });
        return () => container.removeEventListener('wheel', handleWheel);
    }, [isExpanded]);

    const isMobile = useIsMobile();

    const segments = answer?.segments || [];
    const longFormAnswerSegments = answer?.longFormAnswerSegments || [];
    const keyInsight = answer?.keyInsight || "Analyzing results...";
    const cards = answer?.cards || [];
    const followUps = answer?.followUps || [];

    if (isMobile) {
        return (
            <div ref={containerRef} className="p-4 pb-[140px] w-full max-w-[100vw] overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 relative flex flex-col pt-4">
                {/* Mobile Editorial Title */}
                <h1 className="text-[28px] font-[family-name:var(--font-instrument-serif)] italic text-white mb-6 leading-[1.15] tracking-tight">
                    {query?.includes('USER QUESTION:') ? query.split('USER QUESTION:')[1].trim() : query}
                </h1>

                {/* Mobile Sources Horizontal Scroll */}
                <div className="mb-8 -mx-4">
                    <div className="flex items-center gap-2 px-4 mb-4">
                        <div className="p-1 bg-[#f5a623]/10 rounded border border-[#f5a623]/20">
                            <Layers size={10} className="text-[#f5a623]" />
                        </div>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Origins Captured</span>
                    </div>
                    <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {results?.map((source: any, i: number) => (
                            <a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-full rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4 flex flex-col gap-2 shadow-xl backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center shrink-0">
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=32`}
                                            alt=""
                                            className="w-3 h-3 grayscale opacity-60"
                                        />
                                    </div>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase truncate">
                                        {new URL(source.url).hostname.replace('www.', '')}
                                    </span>
                                </div>
                                <h3 className="text-[12px] font-medium text-white/90 line-clamp-2 leading-tight font-[family-name:var(--font-instrument-serif)] italic">
                                    {source.title}
                                </h3>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Intelligence Core (Moved up on Mobile for Focus) */}
                <div className="mb-8">
                    <div className="glass-morphic bg-[#0b0b0b]/60 border border-[#e08b3a]/20 rounded-xl p-4 relative overflow-hidden w-full">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-[#e08b3a]/5 blur-[60px] rounded-full -mr-24 -mt-24" />
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-1 px-1.5 bg-[#e08b3a]/10 rounded border border-[#e08b3a]/20">
                                <TrendingUp size={10} className="text-[#e08b3a]" />
                            </div>
                            <span className="text-[9px] font-black text-[#e08b3a] tracking-[0.3em] uppercase">Intelligence Core</span>
                        </div>
                        <div className="text-zinc-100 text-[18px] leading-[1.4] font-medium font-[family-name:var(--font-instrument-serif)] italic">
                            {keyInsight}
                        </div>
                    </div>
                </div>

                {/* Mobile Prose Synthesis */}
                <div className="prose-editorial text-zinc-200 text-[15px] leading-[1.8] mb-12 space-y-4 word-break break-word overflow-wrap-break-word">
                    {segments.map((s: any, i: number) => (
                        <p key={i} className="mb-2">
                            {s.text}
                            <SourceBadge source={s.source} />
                        </p>
                    ))}
                </div>

                {/* Charts/Widgets Placeholder Fix */}
                {(calcData || nearbyData || stockData) && (
                    <div className="mb-8 w-full overflow-x-auto no-scrollbar">
                        {/* Widgets would render here if active, forced 100% width via globals.css or local styles if possible */}
                    </div>
                )}

                {/* Long-form Answer */}
                {longFormAnswerSegments.length > 0 && (
                    <div className="prose-editorial text-zinc-400 text-[15px] leading-[1.8] mb-12 space-y-6 word-break break-word overflow-wrap-break-word">
                        {longFormAnswerSegments.map((s: any, i: number) => (
                            <div key={i} className="mb-2">
                                {s.text}
                                <SourceBadge source={s.source} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/[0.05]">
                    <div className="flex gap-4 text-zinc-500">
                        <button onClick={() => navigator.clipboard.writeText(query)}><Share2 size={16} /></button>
                        <button onClick={() => onSearch?.(query)}><RotateCcw size={16} /></button>
                        <button onClick={() => navigator.clipboard.writeText(answer?.segments?.map((s: any) => s.text).join(' '))}><Copy size={16} /></button>
                    </div>
                    <div className="flex gap-4 text-zinc-500">
                        <ThumbsUp size={16} />
                        <ThumbsDown size={16} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700 relative w-full max-w-3xl mx-auto">

            {/* Top Sources Carousel Section */}
            <div className="mb-6 w-full">
                <div
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between mb-4 px-1 cursor-pointer group"
                >
                    <div className="flex items-center gap-3">
                        {/* PLACEMENT 5: Logo pulses while streaming, stills when done */}
                        <div style={{ overflow: 'visible' }}>
                            <EclipseLogo
                                size={20}
                                animate={isStreaming}
                                loop={isStreaming}
                            />
                        </div>
                        <div className="p-1.5 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                            <Layers size={16} className={`text-zinc-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Origins</span>
                            <span className="text-[9px] font-medium text-zinc-600 uppercase tracking-tight">Gathered from {results?.length || 0} locations</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center -gap-1">
                            {results?.slice(0, 5).map((s: any, i: number) => (
                                <div key={i} className={`w-5 h-5 rounded-full border-2 border-zinc-950 bg-zinc-900 flex items-center justify-center overflow-hidden ${i !== 0 ? '-ml-2' : ''}`}>
                                    <img
                                        src={`https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32`}
                                        alt=""
                                        className="w-3 h-3 grayscale opacity-50"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowSources(true); }}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest group/all"
                            >
                                {(t.sources || 'View all')} <ChevronRight size={12} className="group-hover/all:translate-x-0.5 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                            className="overflow-hidden"
                        >
                            <div
                                ref={scrollRef}
                                className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x no-scrollbar"
                                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            >
                                <style jsx>{`
                                    .no-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                `}</style>
                                {results?.map((source: any, i: number) => (
                                    <motion.a
                                        key={i}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="flex-shrink-0 w-64 snap-start group"
                                    >
                                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden mb-3 bg-zinc-900 border border-zinc-800/50 group-hover:border-zinc-700 transition-colors">
                                            {source.img_src ? (
                                                <img
                                                    src={source.img_src}
                                                    alt=""
                                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                                                    onError={(e) => {
                                                        (e.target as any).style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 p-6">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=128`}
                                                        alt=""
                                                        className="w-10 h-10 rounded-lg shadow-2xl opacity-40 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                                                    />
                                                </div>
                                            )}
                                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="text-[8px] font-bold text-white uppercase tracking-tighter flex items-center gap-1">
                                                    <ExternalLink size={8} /> Open Source
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=32`}
                                                    alt=""
                                                    className="w-3 h-3 rounded-full grayscale group-hover:grayscale-0 transition-all"
                                                />
                                                <span className="text-[9px] font-bold text-zinc-500 uppercase truncate">
                                                    {new URL(source.url).hostname.replace('www.', '')}
                                                </span>
                                            </div>
                                            <h3 className="text-xs font-semibold text-zinc-200 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                                                {source.title}
                                            </h3>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Computational Intelligence Widget */}
            <AnimatePresence>
                {calcData && (
                    <CalculatorWidget
                        data={calcData}
                        onClose={() => setCalcData(null)}
                    />
                )}
            </AnimatePresence>

            {/* Nearby Places Intelligence Widget */}
            <AnimatePresence>
                {nearbyData && (
                    <NearbyMapWidget
                        intent={nearbyData}
                        onClose={() => setNearbyData(null)}
                    />
                )}
            </AnimatePresence>

            {/* Stock Widget */}
            <AnimatePresence>
                {stockData && (
                    <StockWidget
                        ticker={stockData.ticker}
                    />
                )}
            </AnimatePresence>

            {!calcData && !nearbyData && !stockData && (
                <h1 className="text-[32px] md:text-[40px] font-bold text-white mb-8 tracking-tight leading-tight">
                    {query?.includes('USER QUESTION:') ? query.split('USER QUESTION:')[1].trim() : query}
                </h1>
            )}

            {/* DEEP mode: if AI returned a layout, render DeepModeRenderer */}
            {answer?.layout ? (
                <div className="mb-8">
                    <DeepModeRenderer summary={answer.summary || answer.keyInsight || keyInsight} components={answer.layout.components || answer.layout?.components || []} loading={isStreaming} />
                </div>
            ) : (
                <>
                    {/* Summary Box */}
                    <div className="prose prose-invert max-w-none mb-12">
                        <div className="text-zinc-300 text-[16px] md:text-[17px] leading-relaxed font-sans">
                            {segments.map((s: any, i: number) => (
                                <span key={i} className="inline mr-1">
                                    {s.text}
                                    <SourceBadge source={s.source} />
                                </span>
                            ))}
                        </div>
                    </div>
                </>
            )}


            {/* Intelligence Core & Stack - Relocated to follow summary for maximum impact */}
            {!answer?.layout && (
                <div className="mt-8 mb-12">
                    <div className="bg-[#0b0b0b] border border-[#e08b3a]/20 rounded-[32px] p-8 mb-8 relative overflow-hidden group shadow-[0_0_40px_rgba(224,139,58,0.03)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#e08b3a]/5 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:bg-[#e08b3a]/10 transition-colors duration-1000" />
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#e08b3a]/3 blur-[60px] rounded-full -ml-16 -mb-16" />

                        <div className="flex items-center gap-3 mb-6 relative z-10">
                            <div className="p-1.5 bg-[#e08b3a]/10 rounded-lg">
                                <TrendingUp size={12} className="text-[#e08b3a] stroke-[3]" />
                            </div>
                            <span className="text-[10px] font-black text-[#e08b3a] tracking-[0.4em] uppercase">Intelligence Core</span>
                        </div>
                        <div className="text-zinc-100 text-[20px] md:text-[24px] leading-[1.4] font-medium max-w-[95%] relative z-10 font-[family-name:var(--font-instrument-serif)] italic transition-all duration-700">
                            {keyInsight || "Synthesizing atmospheric insights..."}
                        </div>
                    </div>

                    <div className="mb-4">
                        <KnowledgeStack results={results || []} />
                    </div>
                </div>
            )}

            {/* Detailed Long-form Answer */}
            {longFormAnswerSegments.length > 0 && (
                <div className="mb-12 prose prose-invert max-w-none">
                    <div className="text-zinc-400 text-[16px] leading-[1.7] font-sans h-auto">
                        {longFormAnswerSegments.map((s: any, i: number) => (
                            <div key={i} className="mb-4 last:mb-0">
                                {s.text}
                                <SourceBadge source={s.source} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom section spacing cleanup */}

            {/* Action Bar & Source Count - Premium Layout */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900 px-1">
                <div className="flex items-center gap-5 text-zinc-500">
                    <button
                        onClick={() => {
                            const url = typeof window !== 'undefined' ? window.location.href : '';
                            navigator.clipboard.writeText(`Ecplise Investigation: ${query}\n${url}`);
                        }}
                        className="hover:text-zinc-300 transition-all active:scale-95"
                        title="Share Investigation"
                    >
                        <Share2 size={18} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `eclipse_investigation_${Date.now()}.json`;
                            a.click();
                        }}
                        className="hover:text-zinc-300 transition-all active:scale-95"
                        title="Download Research"
                    >
                        <Download size={18} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => {
                            const text = result.answer.longFormAnswerSegments.map((s: any) => s.text).join('\n');
                            navigator.clipboard.writeText(text);
                        }}
                        className="hover:text-zinc-300 transition-all active:scale-95"
                        title="Copy Synthesis"
                    >
                        <Copy size={18} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={() => onSearch?.(query)}
                        className="hover:text-zinc-300 transition-all active:scale-95"
                        title="Re-synthesize"
                    >
                        <RotateCcw size={18} strokeWidth={1.5} />
                    </button>
                </div>

                <button
                    onClick={() => setShowSources(true)}
                    className="flex items-center -gap-1 bg-zinc-900/40 rounded-full border border-zinc-800/60 px-4 py-1.5 hover:bg-[#F5A623]/10 hover:border-[#F5A623]/30 transition-all cursor-pointer group active:scale-95 outline-none shadow-lg"
                >
                    <div className="flex mr-2">
                        {results?.slice(0, 3).map((s: any, i: number) => (
                            <div key={i} className={`w-4 h-4 rounded-full border border-zinc-950 bg-zinc-800 flex items-center justify-center overflow-hidden ${i !== 0 ? '-ml-1.5' : ''}`}>
                                <img
                                    src={`https://www.google.com/s2/favicons?domain=${new URL(s.url).hostname}&sz=32`}
                                    alt=""
                                    className="w-2.5 h-2.5 grayscale opacity-50"
                                />
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 tracking-tight lowercase group-hover:text-[#F5A623] transition-colors">
                        {results?.length || 0} origins
                    </span>
                </button>

                <div className="flex items-center gap-4 text-zinc-500">
                    <button className="hover:text-[#F5A623] transition-all active:scale-90"><ThumbsUp size={18} strokeWidth={1.5} /></button>
                    <button className="hover:text-zinc-400 transition-all active:scale-90"><ThumbsDown size={18} strokeWidth={1.5} /></button>
                    <button className="hover:text-zinc-300 transition-all active:scale-90"><MoreHorizontal size={18} strokeWidth={1.5} /></button>
                </div>
            </div>


            {/* Sources Panel - High-fidelity Right Slide-over */}
            <AnimatePresence>
                {showSources && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowSources(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-[4px] z-[199]"
                        />
                        <motion.div
                            initial={{ x: 450, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 450, opacity: 0 }}
                            transition={{ type: "spring", damping: 30, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-[450px] bg-[#0c0c0c] border-l border-white/[0.05] shadow-[-30px_0_80px_rgba(0,0,0,0.8)] z-[200] overflow-hidden flex flex-col glass"
                        >
                            {/* Panel Header - Re-engineered Zenith */}
                            <div className="px-10 py-12 border-b border-white/[0.04] flex items-center justify-between bg-[#0c0c0c]/90 backdrop-blur-3xl sticky top-0 z-20">
                                <div className="flex items-center gap-5">
                                    <div className="relative group">
                                        <div className="absolute inset-0 bg-white blur-xl opacity-5 group-hover:opacity-10 transition-opacity duration-700" />
                                        <div className="relative w-14 h-14 rounded-[20px] bg-[#0d0d0e] border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-white/20 transition-all duration-500">
                                            <Globe size={22} className="text-zinc-200 drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="text-[14px] font-black text-white uppercase tracking-[0.35em] leading-tight mb-2">
                                            Intelligence Origins
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-[#F5A623] animate-pulse" />
                                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest opacity-60">
                                                Archival Synchronicity • {results?.length || 0} Nodes
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowSources(false)}
                                    className="p-3.5 hover:bg-white/5 rounded-2xl text-zinc-500 hover:text-white transition-all group border border-white/[0.03] hover:border-[#F5A623]/30 active:scale-95 shadow-lg"
                                >
                                    <X size={22} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
                                </button>
                            </div>

                            {/* Sources List */}
                            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
                                {results?.map((source: any, i: number) => (
                                    <motion.a
                                        key={i}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col gap-4 p-5 hover:bg-white/[0.03] rounded-[24px] transition-all border border-transparent hover:border-white/[0.05] group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ExternalLink size={14} className="text-zinc-500" />
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center overflow-hidden group-hover:border-[#F5A623]/30 transition-colors">
                                                <img
                                                    src={`https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=64`}
                                                    alt=""
                                                    className="w-4 h-4 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] group-hover:text-zinc-400 transition-colors">
                                                    {new URL(source.url).hostname.replace('www.', '')}
                                                </span>
                                                <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">Archival Fragment</span>
                                            </div>
                                        </div>

                                        <h4 className="text-[18px] font-medium text-white/90 group-hover:text-white transition-colors leading-[1.3] font-[family-name:var(--font-instrument-serif)] italic">
                                            {source.title}
                                        </h4>

                                        {source.content && (
                                            <p className="text-[12px] text-zinc-500 line-clamp-3 leading-relaxed group-hover:text-zinc-400 transition-colors">
                                                {source.content}
                                            </p>
                                        )}
                                    </motion.a>
                                ))}
                            </div>

                            {/* Panel Footer */}
                            <div className="p-8 border-t border-white/[0.04] bg-zinc-900/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                                        Total Fragments: {results?.length || 0}
                                    </span>
                                    <div className="flex gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#F5A623] shadow-[0_0_10px_rgba(245,166,35,0.4)]" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
