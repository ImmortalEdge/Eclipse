'use client';

import {
    Search,
    Lightbulb,
    ChevronDown,
    FileText,
    Globe,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResearchProcess({ query, events }: { query: string, events: any[] }) {
    const [activeTab, setActiveTab] = useState<'process' | 'sources'>('process');
    const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);

    const subqueries = events.filter(e => e.event === 'subquery').map(e => e.query);
    const sourcesEvent = events.find(e => e.event === 'sources_found');
    const analysisStarted = events.some(e => e.event === 'analysis_started');
    const isComplete = events.some(e => e.event === 'complete');

    const progress = isComplete ? 100 : analysisStarted ? 85 : sourcesEvent ? 60 : subqueries.length > 0 ? 35 : events.length > 0 ? 15 : 0;
    const progressText = isComplete ? 'Convergence Achieved' : analysisStarted ? 'Coalescing Intelligence' : sourcesEvent ? 'Analyzing Signals' : subqueries.length > 0 ? 'Expanding Expanse' : 'Initiating Genesis';

    return (
        <div className="w-full max-w-xl mx-auto mt-2 p-6 bg-[#111111] border border-[#222222] rounded-2xl shadow-2xl">
            {/* Tabs / Header */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('process')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'process' ? 'bg-zinc-800/30 border border-zinc-700/50 text-white' : 'hover:bg-zinc-900 border border-transparent text-zinc-500'}`}
                >
                    <FlaskConical size={14} className={activeTab === 'process' ? 'text-zinc-400' : 'text-zinc-600'} />
                    <span>Cognitive Path</span>
                    <span className="text-zinc-500 font-normal opacity-50">{events.length}</span>
                </button>
                <button
                    onClick={() => setActiveTab('sources')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'sources' ? 'bg-zinc-800/30 border border-zinc-700/50 text-white' : 'hover:bg-zinc-900 border border-transparent text-zinc-500'}`}
                >
                    <Globe size={14} className={activeTab === 'sources' ? 'text-zinc-400' : 'text-zinc-600'} />
                    <span>Expanse</span>
                    <span className="text-zinc-600 font-normal opacity-50">{sourcesEvent?.count || 0}</span>
                </button>
            </div>

            <div className="space-y-6">
                {activeTab === 'process' ? (
                    <>
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3 px-1">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e08b3a]">{progressText}</span>
                                <span className="text-[10px] font-bold text-zinc-600 tabular-nums">{progress}% synchronized</span>
                            </div>

                            <div className="h-[3px] w-full bg-zinc-900 rounded-full overflow-hidden relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e08b3a]/20 via-[#e08b3a] to-[#e08b3a]/20 shadow-[0_0_15px_rgba(224,139,58,0.5)] transition-all duration-1000"
                                />
                            </div>

                            {/* Spectral Waveform */}
                            {!isComplete && (
                                <div className="flex items-center justify-center gap-[3px] h-4 mt-4 opacity-40">
                                    {[0.6, 1.2, 0.8, 1.5, 0.5, 1.1, 0.9, 1.3, 0.7, 1.4, 0.6, 1.0].map((amplitude, i) => (
                                        <motion.div
                                            key={i}
                                            animate={{
                                                height: [4, 12 * amplitude, 4],
                                                opacity: [0.3, 1, 0.3]
                                            }}
                                            transition={{
                                                duration: 0.8 + (i % 3) * 0.2,
                                                repeat: Infinity,
                                                delay: i * 0.08,
                                                ease: "easeInOut"
                                            }}
                                            className="w-[1.5px] bg-[#e08b3a] rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Thinking Step Card */}
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:bg-zinc-900/50 group">
                            <button
                                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                                        <Lightbulb size={14} className={isThinkingExpanded ? 'text-amber-400' : 'text-zinc-600'} />
                                    </div>
                                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest italic font-[family-name:var(--font-instrument-serif)]">Deconstructing intent</span>
                                </div>
                                <ChevronDown size={14} className={`text-zinc-600 transition-transform duration-300 ${isThinkingExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isThinkingExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-4 mt-4 border-t border-zinc-800/50">
                                            <div className="text-[9px] font-black text-[#e08b3a]/60 uppercase tracking-[0.3em] mb-3">Intelligence Genesis</div>
                                            <p className="text-[11px] leading-relaxed text-zinc-400 font-sans italic opacity-80 pl-2 border-l border-[#e08b3a]/20">
                                                "Mapping conceptual vectors for <span className="text-zinc-100">"{query}"</span>.
                                                Initiating multi-threaded traversal across temporal and specialized research nodes.
                                                Awaiting signal convergence..."
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Searching Step Card */}
                        <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 transition-all hover:bg-zinc-900/50">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-zinc-900 rounded-lg">
                                        {!sourcesEvent ? (
                                            <Loader2 size={14} className="text-zinc-500 animate-spin" />
                                        ) : (
                                            <Search size={14} className="text-zinc-400" />
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Signal Discovery</span>
                                        <span className="text-[11px] text-zinc-300 font-medium truncate max-w-[250px]">{query}</span>
                                    </div>
                                </div>
                                <div className="text-[9px] font-bold text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md uppercase tracking-tighter">
                                    {subqueries.length} nodes
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6 ml-1">
                                <AnimatePresence>
                                    {subqueries.map((q, i) => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={i}
                                            className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800/80 rounded-full text-[10px] text-zinc-300 font-bold tracking-tight flex items-center gap-2 capitalize"
                                        >
                                            <div className="w-1 h-1 rounded-full bg-zinc-600" />
                                            {q.toLowerCase()}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {sourcesEvent && (
                                <div className="space-y-2 mt-4 pt-4 border-t border-zinc-800/50">
                                    <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4">Origins Detected</div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {sourcesEvent.sources.slice(0, 4).map((url: string, i: number) => {
                                            const domain = new URL(url).hostname.replace('www.', '');
                                            return (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={i}
                                                    className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/50 border border-zinc-900/80 group/source"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-[9px] font-black text-zinc-600 group-hover/source:text-white transition-colors">
                                                            <img
                                                                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
                                                                className="w-3 h-3 grayscale opacity-40 group-hover/source:opacity-100 group-hover/source:grayscale-0 transition-all"
                                                                alt=""
                                                            />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-zinc-500 group-hover/source:text-zinc-300 transition-colors uppercase tracking-tight">{domain}</span>
                                                    </div>
                                                    <ArrowUpRight size={10} className="text-zinc-800 group-hover/source:text-zinc-500 transition-colors" />
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                    {sourcesEvent.count > 4 && (
                                        <div
                                            onClick={() => setActiveTab('sources')}
                                            className="text-[9px] font-bold text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer pt-2 flex items-center gap-2 pl-2"
                                        >
                                            <div className="flex -space-x-1">
                                                {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-950" />)}
                                            </div>
                                            <span>Explore {sourcesEvent.count - 4} additional origins in the expanse</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Analysis Step Card */}
                        <div className={`bg-zinc-900/30 border ${analysisStarted ? 'border-[#e08b3a]/30 shadow-[0_0_20px_rgba(224,139,58,0.05)]' : 'border-zinc-800/50'} rounded-2xl p-5 transition-all`}>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-zinc-900 rounded-lg">
                                    {isComplete ? (
                                        <FileText size={14} className="text-emerald-500" />
                                    ) : analysisStarted ? (
                                        <Loader2 size={14} className="text-[#e08b3a] animate-spin" />
                                    ) : (
                                        <FileText size={14} className="text-zinc-800" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${analysisStarted ? 'text-[#e08b3a]' : 'text-zinc-600'}`}>Intelligence Synthesis</span>
                                    <span className={`text-[11px] font-medium tracking-wide ${analysisStarted ? 'text-zinc-300' : 'text-zinc-500'}`}>
                                        {isComplete ? 'Report Convergence Achieved' : analysisStarted ? 'Synthesizing Atmospheric Deep Report...' : 'Awaiting Data Finalization...'}
                                    </span>
                                </div>
                            </div>


                        </div>
                    </>
                ) : (
                    /* Sources View */
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: { transition: { staggerChildren: 0.05 } }
                        }}
                        className="space-y-3 max-h-[400px] overflow-y-auto overscroll-contain pr-2 custom-scrollbar"
                    >
                        {sourcesEvent && sourcesEvent.sources.length > 0 ? (
                            sourcesEvent.sources.map((url: string, i: number) => {
                                const domain = new URL(url).hostname.replace('www.', '');
                                return (
                                    <motion.a
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        key={i}
                                        variants={{
                                            hidden: { opacity: 0, x: -10 },
                                            visible: { opacity: 1, x: 0 }
                                        }}
                                        whileHover={{ x: 4 }}
                                        className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/60 rounded-xl hover:bg-zinc-800/40 hover:border-zinc-700/60 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-amber-500/0 group-hover:bg-amber-500/40 transition-all" />

                                        <div className="flex items-center gap-4">
                                            <div className="w-9 h-9 rounded-lg bg-zinc-800/80 flex items-center justify-center text-[11px] font-black text-zinc-500 uppercase tracking-tighter border border-zinc-700/30 group-hover:text-amber-500/80 transition-colors">
                                                {domain[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-zinc-300 group-hover:text-white transition-colors">{domain}</span>
                                                <span className="text-[9px] text-zinc-600 font-medium truncate max-w-[220px] tracking-tight">{url}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-500">Visit Origin</span>
                                                <ArrowUpRight size={10} className="text-zinc-500" />
                                            </div>
                                            <Globe size={14} className="text-zinc-700 group-hover:text-amber-500/60 transition-colors" />
                                        </div>
                                    </motion.a>
                                );
                            })
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="p-4 bg-zinc-900/50 rounded-full border border-zinc-800/50 mb-4">
                                    <Globe size={32} className="text-zinc-800" />
                                </div>
                                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">Archival Expanse Empty</h4>
                                <p className="text-zinc-700 text-[11px] italic mt-2">The cognitive path has not yet intersected with external origins...</p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

function FlaskConical(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M10 2v7.5" />
            <path d="M14 2v7.5" />
            <path d="M8.5 2h7" />
            <path d="M14 9.5a2 2 0 1 1-4 0" />
            <path d="M5.52 19h12.96a2 2 0 0 0 1.9-2.6L16 9h-8L4.12 16.4a2 2 0 0 0 1.4 2.6z" />
        </svg>
    );
}
