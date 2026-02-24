'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    MoreHorizontal,
    Link as LinkIcon,
    Trash2,
    ExternalLink,
    X,
    Clock,
    History
} from 'lucide-react';
import EclipseLogo from './EclipseLogo';
import { useLanguage } from './LanguageProvider';
import {
    format,
    isToday,
    isYesterday,
    isThisWeek,
    isThisMonth,
    startOfMonth,
    parseISO
} from 'date-fns';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface HistoryItem {
    id: string;
    query: string;
    timestamp: string; // ISO string
    sources: Array<{
        name: string;
        shortName: string;
        favicon: string;
        url: string;
    }>;
    resultUrl: string;
    result?: any; // Full search result data
}

interface ArchivePageProps {
    onOpenItem: (id: string) => void;
    onClose: () => void;
}

const HISTORY_KEY = 'eclipse_history';

/**
 * Expanse Archive - Chronicles of Investigation
 */

export default function ArchivePage({ onOpenItem, onClose }: ArchivePageProps) {
    const { t } = useLanguage();
    const [searchQuery, setSearchQuery] = useState('');
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setHistory(parsed.sort((a: any, b: any) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ));
            } catch (e) {
                console.error("Failed to parse history archive", e);
            }
        }
    }, []);

    const filteredHistory = useMemo(() => {
        if (!searchQuery.trim()) return history;
        const q = searchQuery.toLowerCase();
        return history.filter(item =>
            item.query.toLowerCase().includes(q) ||
            item.sources.some(s => s.name.toLowerCase().includes(q))
        );
    }, [history, searchQuery]);

    const groupedHistory = useMemo(() => {
        const groups: { [key: string]: HistoryItem[] } = {};

        filteredHistory.forEach(item => {
            const date = parseISO(item.timestamp);
            let label = '';

            if (isToday(date)) label = 'Today';
            else if (isYesterday(date)) label = 'Yesterday';
            else if (isThisWeek(date)) label = 'This Week';
            else if (isThisMonth(date)) label = 'This Month';
            else label = format(date, 'MMMM yyyy');

            if (!groups[label]) groups[label] = [];
            groups[label].push(item);
        });

        return Object.entries(groups);
    }, [filteredHistory]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const updated = history.filter(item => item.id !== id);
        setHistory(updated);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        setMenuOpenId(null);
    };

    const handleCopyLink = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(url);
        setMenuOpenId(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-[#0c0c0c] flex"
        >
            {/* The sidebar is expected to be persistent in the layout, but for standalone Archive view: */}
            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth" ref={containerRef}>
                <div className="max-w-[720px] mx-auto px-6 py-16 md:ml-24 lg:ml-32 w-full">

                    {/* Header */}
                    <header className="mb-8">
                        <div className="flex items-center justify-between mb-2">
                            {/* PLACEMENT 6: Still logo breadcrumb — navigates home */}
                            <button
                                onClick={onClose}
                                className="flex items-center gap-3 group border-none bg-transparent outline-none cursor-pointer p-0"
                                title="Eclipse — Home"
                                style={{ overflow: 'visible', transition: 'transform 150ms ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                            >
                                <EclipseLogo size={24} animate={false} loop={false} />
                            </button>
                            <h1 className="text-[28px] text-white font-[family-name:var(--font-instrument-serif)] italic leading-tight">
                                {t.research || 'Expanse Archive'}
                            </h1>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                            >
                                <X size={20} className="text-zinc-500 group-hover:text-white" />
                            </button>
                        </div>
                        <p className="text-[11px] font-bold text-white/35 uppercase tracking-[0.15em]">
                            Your intelligence history
                        </p>
                    </header>

                    {/* Filter Bar */}
                    <div className="relative mb-10 group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-[#F5A623]/60 transition-colors">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t.placeholder || "Search your archive..."}
                            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-12 py-3 text-[14px] text-white placeholder-white/20 focus:outline-none focus:border-[#F5A623]/30 transition-all font-sans"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Empty State */}
                    {history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 opacity-80">
                            <div className="relative w-32 h-32 mb-8">
                                <div className="absolute inset-0 border border-[#F5A623]/20 rounded-full animate-[pulse_4s_infinite]" />
                                <div className="absolute inset-4 border border-[#F5A623]/10 rounded-full" />
                                <History className="absolute inset-0 m-auto text-[#F5A623]/40" size={40} />
                            </div>
                            <h2 className="text-18px text-white font-[family-name:var(--font-instrument-serif)] italic mb-2">
                                No searches yet
                            </h2>
                            <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.15em]">
                                Your intelligence history will appear here
                            </p>
                        </div>
                    ) : filteredHistory.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <h2 className="text-18px text-white font-[family-name:var(--font-instrument-serif)] italic mb-2">
                                No results for "{searchQuery}"
                            </h2>
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-[11px] font-bold text-[#F5A623] uppercase tracking-[0.15em] hover:underline"
                            >
                                Clear search
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12">
                            {groupedHistory.map(([group, items], groupIndex) => (
                                <section key={group} className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-[11px] font-black text-white/25 uppercase tracking-[0.15rem] whitespace-nowrap">
                                            {group}
                                        </h3>
                                        <div className="h-px flex-1 bg-white/[0.06]" />
                                    </div>
                                    <div className="space-y-1">
                                        {items.map((item, i) => (
                                            <ArchiveItem
                                                key={item.id}
                                                item={item}
                                                index={i}
                                                isMenuOpen={menuOpenId === item.id}
                                                onMenuToggle={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                                                onDelete={handleDelete}
                                                onCopyLink={handleCopyLink}
                                                onClick={() => onOpenItem(item.id)}
                                            />
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

function ArchiveItem({ item, index, isMenuOpen, onMenuToggle, onDelete, onCopyLink, onClick }: any) {
    const timestamp = parseISO(item.timestamp);
    const displayTime = isToday(timestamp)
        ? format(timestamp, 'h:mm a')
        : format(timestamp, 'MMM d');

    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={onClick}
            className="group relative flex items-center justify-between p-4 hover:bg-white/[0.03] rounded-xl cursor-pointer transition-all duration-150 border border-transparent hover:border-white/[0.04]"
        >
            <div className="flex-1 min-w-0 pr-8">
                <h4 className="text-[16px] text-white/90 font-[family-name:var(--font-instrument-serif)] italic leading-snug mb-3 truncate group-hover:text-white transition-colors">
                    {item.query}
                </h4>
                <div className="flex items-center gap-2">
                    {item.sources.slice(0, 4).map((s: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-white/[0.06] rounded-md border border-white/[0.04]">
                            <img
                                src={s.favicon}
                                className="w-3 h-3 rounded-[2px] grayscale opacity-60"
                                alt=""
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                            />
                            <span className="text-[10px] text-white/40 group-hover:text-white/60 font-medium tracking-tight">
                                {s.shortName || s.name.split(' ')[0]}
                            </span>
                        </div>
                    ))}
                    {item.sources.length > 4 && (
                        <span className="text-[10px] font-bold text-[#F5A623]/60 tracking-tight">
                            +{item.sources.length - 4} more
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4 shrink-0 relative">
                <span className="text-[11px] text-zinc-600 group-hover:text-zinc-500 font-medium">
                    {displayTime}
                </span>

                <button
                    onClick={(e) => { e.stopPropagation(); onMenuToggle(); }}
                    className="p-2 opacity-0 group-hover:opacity-100 focus:opacity-100 text-white/40 hover:text-white transition-all"
                >
                    <MoreHorizontal size={16} />
                </button>

                <AnimatePresence>
                    {isMenuOpen && (
                        <>
                            {/* Backdrop to close menu */}
                            <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); onMenuToggle(); }} />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-36 bg-[#1c1917] border border-white/[0.08] rounded-lg p-1.5 shadow-2xl z-20"
                            >
                                <button
                                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors text-left"
                                >
                                    <ExternalLink size={14} /> Open
                                </button>
                                <button
                                    onClick={(e) => onCopyLink(item.resultUrl, e)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-zinc-300 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors text-left"
                                >
                                    <LinkIcon size={14} /> Copy link
                                </button>
                                <div className="h-px bg-white/[0.06] my-1" />
                                <button
                                    onClick={(e) => onDelete(item.id, e)}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-[12px] text-red-500 hover:bg-red-500/10 rounded-md transition-colors text-left"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
