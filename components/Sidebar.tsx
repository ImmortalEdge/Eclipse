'use client';

import { Plus, History, Zap, Microscope } from 'lucide-react';
import EclipseLogo from './EclipseLogo';

type Mode = 'fast' | 'research_extreme';

interface SidebarProps {
  onNew: () => void;
  onHistory: () => void;
  onModeChange: (mode: Mode) => void;
  currentView: 'home' | 'archive';
  currentMode: Mode;
}

export default function Sidebar({
  onNew,
  onHistory,
  onModeChange,
  currentView,
  currentMode,
}: SidebarProps) {
  const items = [
    {
      icon: Plus,
      label: 'Initiate',
      onClick: onNew,
      active: currentView === 'home',
    },
    {
      icon: History,
      label: 'Archive',
      onClick: onHistory,
      active: currentView === 'archive',
    },
    {
      icon: Zap,
      label: 'Velocity',
      onClick: () => onModeChange('fast'),
      active: currentMode === 'fast',
    },
    {
      icon: Microscope,
      label: 'Infinite Spectrum',
      onClick: () => onModeChange('research_extreme'),
      active: currentMode === 'research_extreme',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[50px] bg-black border-r border-zinc-900/50 flex flex-col items-center py-4 z-[60] shadow-2xl">
      
      {/* Logo */}
      <button
        onClick={onNew}
        className="mb-6 flex items-center justify-center bg-transparent border-none outline-none"
        title="Eclipse — Home"
      >
        <EclipseLogo size={28} animate={false} loop={false} />
      </button>

      {/* Top Icons */}
      <div className="flex flex-col gap-6">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={item.onClick}
            title={item.label}
            className={`relative p-2.5 rounded-xl flex items-center justify-center transition-all
              ${
                item.active
                  ? 'text-[#e08b3a] bg-[#e08b3a]/10 shadow-[0_0_15px_rgba(224,139,58,0.1)]'
                  : 'text-zinc-700 hover:text-[rgba(255,160,50,0.8)] hover:bg-[rgba(255,160,50,0.05)]'
              }
            `}
          >
            <item.icon size={20} strokeWidth={1.2} />
          </button>
        ))}
      </div>

      {/* Bottom Profile */}
      <div className="mt-auto mb-6">
        <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800/50 flex items-center justify-center text-[10px] font-bold text-zinc-600 shadow-lg transition-all hover:border-[#e08b3a]/30 hover:text-zinc-400">
          YG
        </div>
      </div>
    </aside>
  );
}