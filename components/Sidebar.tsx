'use client';

import {
    Plus,
    History,
    Zap,
    Microscope,
} from 'lucide-react';
import EclipseLogo from './EclipseLogo';

interface SidebarProps {
    onNew: () => void;
    onHistory: () => void;
    onModeChange: (mode: string) => void;
    currentView: 'home' | 'archive';
}

export default function Sidebar({ onNew, onHistory, onModeChange, currentView }: SidebarProps) {
    const items = [
        { icon: Plus, label: 'Initiate', onClick: onNew, active: false },
        { icon: History, label: 'Archive', onClick: onHistory, active: currentView === 'archive' },
        { icon: Zap, label: 'Velocity', onClick: () => onModeChange?.('fast'), active: false },
        { icon: Microscope, label: 'Infinite Spectrum', onClick: () => onModeChange?.('research_extreme'), active: false },
    ];

    return (
        <>
            <aside className="fixed left-0 top-0 bottom-0 w-[50px] bg-black border-r border-zinc-900/50 flex flex-col items-center py-4 z-[60] shadow-2xl">
                {/* Logo — top anchor, always still, navigates home */}
                <button
                    onClick={onNew}
                    className="mb-6 flex items-center justify-center cursor-pointer border-none bg-transparent outline-none"
                    title="Eclipse — Home"
                    style={{ overflow: 'visible' }}
                >
                    <EclipseLogo size={28} animate={false} loop={false} />
                </button>

                {/* Top Icons */}
                <div className="flex flex-col gap-6">
                    {items.map((item, i) => (
                        <button
                            key={i}
                            onClick={item.onClick}
                            className={`cursor-pointer transition-all p-2.5 rounded-xl flex items-center justify-center group relative border-none bg-transparent outline-none ${item.active ? 'text-[#e08b3a] bg-[#e08b3a]/10 shadow-[0_0_15px_rgba(224,139,58,0.1)]' : 'text-zinc-700 hover:text-[rgba(255,160,50,0.8)] hover:bg-[rgba(255,160,50,0.05)]'}`}
                            title={item.label}
                        >
                            <item.icon size={20} strokeWidth={1.2} className="transition-transform group-hover:scale-110" />
                            <div className="absolute left-[60px] px-3 py-1.5 bg-[#0d0d0e] border border-[#e08b3a]/20 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-[#e08b3a] opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-[-10px] group-hover:translate-x-0 whitespace-nowrap z-[70] shadow-2xl">
                                {item.label}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Bottom Icons */}
                <div className="mt-auto flex flex-col gap-6 mb-6 items-center">
                    <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-[10px] font-bold text-zinc-600 shadow-lg cursor-pointer hover:border-[#e08b3a]/30 hover:text-zinc-400 transition-all active:scale-95 group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#e08b3a]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="relative z-10">YG</span>
                    </div>
                </div>
            </aside>
        </>
    );
}
