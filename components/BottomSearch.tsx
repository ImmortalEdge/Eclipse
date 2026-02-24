'use client';

import {
    Plus,
    Mic,
    ArrowUp
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import MagneticButton from './MagneticButton';
import { initSpeechRecognition } from '@/lib/voice';

export default function BottomSearch({ onSearch, loading, onReset, onOpenVoiceUI, isSearchFocused = false }) {
    const [query, setQuery] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [hasText, setHasText] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const recognition = initSpeechRecognition();
        if (!recognition) return;

        recognition.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((r: any) => r[0].transcript)
                .join('');

            if (event.results[0].isFinal) {
                setQuery(transcript);
                setHasText(transcript.trim().length > 0);
                setIsListening(false);
            }
        };

        recognition.onerror = (event: any) => {
            if (event.error !== 'aborted' && event.error !== 'no-speech') {
                console.warn('STT error:', event.error);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (e) {}
        };
    }, []);

    const handleSTT = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            try {
                recognitionRef.current.stop();
            } catch (e) {}
        } else {
            try {
                setIsListening(true);
                recognitionRef.current.start();
            } catch (e) {
                console.warn('Failed to start recognition', e);
                setIsListening(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim() && !loading) {
            onSearch(query);
            setQuery('');
            setHasText(false);
        }
    };

    const handleSearch = (searchQuery?: string) => {
        const q = searchQuery || inputValue;
        if (q.trim() && !loading) {
            onSearch(q);
            setInputValue('');
            setQuery('');
            setHasText(false);
        }
    };

    return (
        <div className="w-full px-4 relative">
            <form
                onSubmit={handleSubmit}
                className="glass rounded-[32px] p-2 flex items-center gap-3 shadow-[0_-10px_40px_rgba(224,139,58,0.05),0_25px_60px_rgba(0,0,0,0.6)] border border-white/5 focus-within:border-[#e08b3a]/30 transition-all duration-700 relative group"
            >
                <MagneticButton
                    type="button"
                    onClick={onReset}
                    className="p-2.5 text-zinc-600 hover:text-white transition-colors bg-zinc-900/30 rounded-full hover:bg-zinc-800 active:scale-95 relative z-10"
                    distance={15}
                    strength={0.15}
                >
                    <Plus size={18} strokeWidth={2} />
                </MagneticButton>

                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setHasText(e.target.value.trim().length > 0);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={(e) => {
                        // Don't hide suggestions immediately on blur to allow clicking suggestions
                        setTimeout(() => setIsFocused(false), 150);
                    }}
                    placeholder="Ask a follow-up..."
                    className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-800 text-[16px] px-3 py-2 font-sans relative z-10"
                />

                {/* Voice Buttons Container */}
                <div style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    position:'relative', zIndex:30, flexShrink:0
                }}>

                    {/* MIC / STT */}
                    <button type="button" onClick={handleSTT}
                        style={{
                            width:44, height:44, borderRadius:'50%',
                            background:'radial-gradient(circle at 35% 30%, rgba(180,160,255,0.22) 0%, rgba(10,8,7,0.96) 72%)',
                            border:'1px solid rgba(180,160,255,0.25)',
                            cursor:'pointer', flexShrink:0,
                            display:'flex', alignItems:'center',
                            justifyContent:'center',
                            boxShadow: isListening
                                ? '0 0 28px rgba(180,160,255,0.35)'
                                : 'none',
                            transition:'all 200ms ease',
                        }}>
                        <Mic size={16} color="rgba(255,255,255,0.75)" />
                    </button>

                    {/* SMART SEND */}
                    <button type="button"
                        onClick={hasText
                            ? () => handleSearch(inputValue)
                            : () => onOpenVoiceUI()}
                        style={{
                            width:44, height:44, borderRadius:'50%',
                            background: hasText
                                ? 'radial-gradient(circle at 38% 32%, rgba(245,166,35,0.38) 0%, rgba(10,8,7,0.97) 68%)'
                                : 'radial-gradient(circle at 38% 32%, rgba(245,166,35,0.18) 0%, rgba(10,8,7,0.97) 68%)',
                            border:`1px solid rgba(245,166,35,${hasText ? 0.5 : 0.2})`,
                            cursor:'pointer', flexShrink:0,
                            display:'flex', alignItems:'center',
                            justifyContent:'center',
                            boxShadow: hasText
                                ? '0 0 28px rgba(245,166,35,0.25)'
                                : '0 0 16px rgba(245,166,35,0.08)',
                            transition:'all 200ms ease',
                        }}>
                        {hasText
                            ? <ArrowUp size={17} color="rgba(255,255,255,0.95)" />
                            : <div style={{
                                    display:'flex', alignItems:'flex-end',
                                    gap:'3px', height:'18px'
                                }}>
                                {[
                                    {dur:'0.7s', delay:'0s'},
                                    {dur:'0.5s', delay:'0.15s'},
                                    {dur:'0.9s', delay:'0.3s'},
                                ].map((b,i) => (
                                    <div key={i} style={{
                                        width:'3px', borderRadius:'999px',
                                        background:'rgba(245,166,35,0.85)',
                                        animation:`barPulse ${b.dur} ease-in-out ${b.delay} infinite alternate`,
                                    }}/>
                                ))}
                            </div>
                        }
                    </button>
                </div>
            </form>
        </div>
    );
}
