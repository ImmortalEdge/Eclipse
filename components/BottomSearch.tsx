'use client';

import {
    Plus,
    ArrowUp
} from 'lucide-react';
import { useState } from 'react';
import MagneticButton from './MagneticButton';

export default function BottomSearch({ onSearch, loading, onReset }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && !loading) {
            onSearch(query);
            setQuery('');
        }
    };

    return (
        <div className="w-full px-4">
            <form
                onSubmit={handleSubmit}
                className="glass rounded-[32px] p-2 flex items-center gap-3 shadow-[0_-10px_40px_rgba(224,139,58,0.05),0_25px_60px_rgba(0,0,0,0.6)] border border-white/5 focus-within:border-[#e08b3a]/30 transition-all duration-700 relative group"
            >
                <div className="absolute inset-x-12 -top-px h-px bg-gradient-to-r from-transparent via-[#e08b3a]/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <MagneticButton
                    type="button"
                    onClick={onReset}
                    className="p-2.5 text-zinc-600 hover:text-white transition-colors bg-zinc-900/30 rounded-full hover:bg-zinc-800 active:scale-95"
                    distance={15}
                    strength={0.15}
                >
                    <Plus size={18} strokeWidth={2} />
                </MagneticButton>

                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a follow-up..."
                    className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-800 text-[16px] px-3 py-2 font-sans"
                />

                <MagneticButton
                    type="submit"
                    disabled={loading || !query.trim()}
                    className={`p-3 rounded-full transition-all shadow-xl active:scale-90 disabled:opacity-20 ${loading ? 'bg-zinc-800' : 'bg-[#e08b3a] text-black hover:bg-[#f0a05a]'}`}
                    distance={25}
                    strength={0.2}
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <ArrowUp size={18} strokeWidth={3} />
                    )}
                </MagneticButton>
            </form>
        </div>
    );
}
