import { Home, Clock, Plus, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileTabBarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'search', icon: Plus, label: 'Search/New' },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'settings', icon: Settings, label: 'Settings' }
];

export default function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 h-[56px] bg-[rgba(10,8,7,0.97)] backdrop-blur-[20px] border-t border-[rgba(255,255,255,0.07)] flex z-[9999] px-2 pb-[env(safe-area-inset-bottom)]">
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className="flex-1 flex flex-col items-center justify-center gap-[3px] cursor-pointer"
                    >
                        <Icon
                            size={20}
                            className={`transition-colors duration-300 ${isActive ? 'text-[#F5A623]' : 'text-white/25'}`}
                        />
                        <span className={`text-[9px] uppercase tracking-[0.1em] transition-colors duration-300 ${isActive ? 'text-[rgba(245,166,35,0.8)]' : 'text-white/20'}`}>
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
