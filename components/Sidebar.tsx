'use client';

import { Plus, History, Zap, Microscope, LayoutGrid, Globe } from 'lucide-react';
import EclipseLogo from './EclipseLogo';
import AccountPanel from './AccountPanel';
import { useLanguage } from './LanguageProvider';

type Mode = 'fast' | 'research_extreme' | 'deep';

interface SidebarProps {
  onNew: () => void;
  onHistory: () => void;
  onModeChange: (mode: Mode) => void;
  currentView: 'home' | 'archive';
  currentMode: Mode;
  onOpenLanguageSettings?: () => void;
}

export default function Sidebar({
  onNew,
  onHistory,
  onModeChange,
  currentView,
  currentMode,
  onOpenLanguageSettings,
}: SidebarProps) {
  const { language, t } = useLanguage();
  const items = [
    {
      icon: Plus,
      label: t.deconstruct || 'Initiate',
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
      label: t.velocity || 'Velocity',
      onClick: () => onModeChange('fast'),
      active: currentMode === 'fast',
    },
    {
      icon: Microscope,
      label: t.research || 'Infinite Spectrum',
      onClick: () => onModeChange('research_extreme'),
      active: currentMode === 'research_extreme',
    },
    {
      icon: LayoutGrid,
      label: t.deep || 'DEEP',
      onClick: () => onModeChange('deep'),
      active: currentMode === 'deep',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[50px] bg-black border-r border-zinc-900/50 flex flex-col items-center py-4 z-[60] shadow-2xl">
      
      {/* Logo */}
      <button
        onClick={onNew}
        className="mb-6 flex items-center justify-center bg-transparent border-none outline-none"
        title={t.deconstruct || 'Eclipse — Home'}
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

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col gap-4 mb-6 relative z-50">
        {/* Language Button */}
        <button
          onClick={() => {
            console.log('Language button clicked, calling handler:', onOpenLanguageSettings);
            onOpenLanguageSettings && onOpenLanguageSettings();
          }}
          className="relative p-2.5 rounded-xl flex items-center justify-center transition-all text-zinc-700 hover:text-[rgba(255,160,50,0.8)] hover:bg-[rgba(255,160,50,0.05)] active:scale-95"
          title={`Language: ${language.toUpperCase()}`}
          type="button"
        >
          <Globe size={20} strokeWidth={1.2} />
          <span className="absolute -bottom-1 text-[8px] font-bold uppercase tracking-wider">
            {language}
          </span>
        </button>

        <div className="relative z-50 pointer-events-auto">
          <AccountPanel />
        </div>
      </div>
    </aside>
  );
}