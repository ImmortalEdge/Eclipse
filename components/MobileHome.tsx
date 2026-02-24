'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Zap, ArrowRight, ArrowUp, Activity, Plus, Globe, Search, Clock, Settings, User, FileText, Image as ImageIcon, Table, X as CloseIcon } from 'lucide-react';
import EclipseLogo from './EclipseLogo';
import { useLanguage } from '@/lib/i18n';
import { initSpeechRecognition } from '@/lib/voice';

interface MobileHomeProps {
    query: string;
    setQuery: (q: string) => void;
    onSearch: (q: string, mode?: string) => void;
    activeMode: "fast" | "research_extreme" | "deep";
    setActiveMode: (mode: "fast" | "research_extreme" | "deep") => void;
    isTyping: boolean;
    onReset: () => void;
}


export default function MobileHome({
    query,
    setQuery,
    onSearch,
    activeMode,
    setActiveMode,
    isTyping,
    onReset
}: MobileHomeProps) {
    const { t, isRtl } = useLanguage();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [fileContexts, setFileContexts] = useState<any[]>([]);

    useEffect(() => {
        const recognition = initSpeechRecognition();
        if (!recognition) return;

        recognition.onresult = (event: any) => {
            const current = Array.from(event.results)
                .map((r: any) => r[0].transcript)
                .join('');
            setTranscript(current);

            if (event.results[0].isFinal) {
                setQuery(current);
                setIsListening(false);
                setTranscript('');
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setTranscript('');
        };

        recognition.onend = () => {
            setIsListening(false);
            setTranscript('');
        };

        recognitionRef.current = recognition;

        return () => {
            try {
                recognition.stop();
            } catch (e) { }
        };
    }, []);

    const readFile = async (file: File) => {
        if (file.type === 'text/plain' || file.name.endsWith('.md')) {
            return await file.text();
        }

        if (file.type === 'application/pdf') {
            try {
                const pdfjsLib = await import('pdfjs-dist');
                pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
                const buffer = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map((it: any) => it.str).join(' ') + '\n';
                }
                return text.slice(0, 8000);
            } catch (err) {
                return 'Error reading PDF.';
            }
        }

        if (file.type.startsWith('image/')) {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(file);
            });
        }

        if (file.name.endsWith('.csv')) {
            const text = await file.text();
            return text.slice(0, 6000);
        }

        return await file.text();
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        for (const file of Array.from(files)) {
            const id = Math.random().toString(36).substr(2, 9);
            setFileContexts(prev => [...prev, { id, name: file.name, type: file.type, size: (file.size / 1024 / 1024).toFixed(1) + ' MB', loading: true, content: '' }]);
            const content = await readFile(file);
            setFileContexts(prev => prev.map(f => f.id === id ? { ...f, content, loading: false } : f));
        }
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const triggerSearch = (searchQuery?: string) => {
        const q = searchQuery || query;
        if (q.trim() || fileContexts.length > 0) {
            let finalQuery = q;
            if (fileContexts.length > 0) {
                const fileContext = fileContexts
                    .map((f, i) => `FILE ${i + 1}: ${f.name} (${f.type})\nCONTENT:\n${f.content.slice(0, 3000)}`)
                    .join('\n---\n');
                finalQuery = `The user has attached ${fileContexts.length} file(s):\n\n${fileContext}\n\nAnswer using the file content as your primary source. Reference specific details from the files in your answer.\n\nUser Question: ${q || 'Analyze the files.'}`;
            }
            onSearch(finalQuery);
            setFileContexts([]);
        }
    };

    const handleSTT = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            setTranscript('');
        } else {
            setIsListening(true);
            setTranscript('...');
            recognitionRef.current.start();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (query.trim() || fileContexts.length > 0) triggerSearch(query);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#090807] flex flex-col items-center justify-center px-5 overflow-hidden">
            {/* Background Orbital Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="w-[360px] h-[360px] rounded-full border border-[rgba(245,166,35,0.12)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[rgba(245,166,35,0.06)]" />
            </div>

            {/* Center Content Stack */}
            <div className="relative z-10 flex flex-col items-center w-full -mt-20">
                <div className="mb-4">
                    <EclipseLogo size={32} />
                </div>

                <span className="text-[10px] font-bold tracking-[0.5em] text-[#e08b3a] uppercase mb-1 opacity-70">
                    {t?.velocity || "INTELLIGENCE HORIZON"}
                </span>

                <h1 className="text-[80px] text-zinc-100 text-center font-[family-name:var(--font-instrument-serif)] italic tracking-tighter leading-none mb-8 opacity-95 bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(224,139,58,0.1)]">
                    Eclipse
                </h1>

                {/* Mobile Search Bar */}
                <div className="w-full relative group">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,.txt,.md,.docx,.jpg,.jpeg,.png,.csv"
                        multiple
                        className="hidden"
                    />

                    {/* Live Transcript Preview */}
                    <AnimatePresence>
                        {isListening && transcript && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, x: "-50%" }}
                                animate={{ opacity: 1, y: 0, x: "-50%" }}
                                exit={{ opacity: 0, y: 10, x: "-50%" }}
                                className="absolute bottom-[calc(100%+8px)] left-1/2 bg-[rgba(14,12,10,0.95)] border border-[rgba(180,160,255,0.2)] rounded-xl px-4 py-2 text-[12px] text-white/70 italic max-w-xs shadow-2xl z-[60] backdrop-blur-md whitespace-nowrap overflow-hidden text-ellipsis pointer-events-none"
                            >
                                {transcript}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="w-full bg-[rgba(20,16,12,0.95)] border border-[rgba(255,255,255,0.08)] rounded-[20px] overflow-hidden relative shadow-2xl">
                        {/* File Chips */}
                        {fileContexts.length > 0 && (
                            <div className="flex flex-wrap gap-2 px-4 pt-4 mb-1">
                                {fileContexts.map((file) => (
                                    <div
                                        key={file.id}
                                        className="bg-[rgba(245,166,35,0.06)] border border-[rgba(245,166,35,0.2)] rounded-xl px-2.5 py-1.5 flex items-center gap-2 relative overflow-hidden shrink-0"
                                    >
                                        {file.type.startsWith('image/') ? (
                                            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                                {file.content ? (
                                                    <img src={file.content} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={13} className="text-[#F5A623]" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-md bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                                                {file.type === 'application/pdf' ? <FileText size={13} className="text-red-500/70" /> :
                                                    file.name.endsWith('.csv') ? <Table size={13} className="text-green-400/70" /> :
                                                        file.name.endsWith('.docx') ? <FileText size={13} className="text-blue-400/70" /> :
                                                            <FileText size={13} className="text-white/50" />}
                                            </div>
                                        )}
                                        <div className="flex flex-col max-w-[80px]">
                                            <span className="text-[10px] text-white/70 truncate leading-tight font-medium">{file.name}</span>
                                            <span className="text-[9px] text-white/30">{file.size}</span>
                                        </div>
                                        <button onClick={() => setFileContexts(prev => prev.filter(f => f.id !== file.id))} className="text-white/20 hover:text-white/70 ml-1">
                                            <CloseIcon size={12} />
                                        </button>
                                        {file.loading && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[rgba(245,166,35,0.2)]">
                                                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} className="h-full bg-[#F5A623]" transition={{ duration: 0.8, ease: "easeInOut" }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            ref={textareaRef}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={fileContexts.length > 0 ? "Ask anything about these files..." : (t?.placeholder || "Deconstruct intelligence...")}
                            className={`w-full bg-transparent border-none outline-none py-[18px] px-5 text-[16px] italic font-[family-name:var(--font-instrument-serif)] text-[rgba(255,255,255,0.85)] placeholder-[rgba(255,255,255,0.2)] resize-none min-h-[56px] max-h-[120px] relative z-20 ${isRtl ? 'text-right' : 'text-left'}`}
                            rows={1}
                            style={{ scrollbarWidth: 'none' }}
                        />

                        {/* Control Row */}
                        <div className="flex items-center justify-between px-3 pb-3 relative z-20">
                            {/* Mode Pill / Plus Button */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 relative"
                                >
                                    <Plus size={18} className={fileContexts.length > 0 ? "text-[#F5A623]" : ""} />
                                    {fileContexts.length > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#F5A623] rounded-full flex items-center justify-center text-[9px] text-white font-bold border border-black shadow-lg">
                                            {fileContexts.length}
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveMode(activeMode === 'fast' ? 'research_extreme' : 'fast')}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] tracking-[0.1em] text-white/60 font-medium uppercase"
                                >
                                    <Zap size={12} className={activeMode === 'research_extreme' ? 'text-[#F5A623]' : ''} />
                                    {activeMode === 'research_extreme' ? 'Research' : 'Velocity'}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSTT}
                                    style={{
                                        background: isListening ? 'radial-gradient(circle at 35% 30%, rgba(180,160,255,0.45) 0%, rgba(120,100,255,0.2) 50%, rgba(10,8,7,0.9) 80%)' : '',
                                        border: isListening ? '1px solid rgba(180,160,255,0.6)' : '',
                                        boxShadow: isListening ? '0 0 0 4px rgba(180,160,255,0.08), 0 0 24px rgba(180,160,255,0.3)' : ''
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative ${isListening ? '' : 'pastel-glass text-white/50'}`}
                                >
                                    {isListening && (
                                        <>
                                            <motion.div animate={{ scale: [1, 1.5], opacity: [0.6, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }} className="absolute inset-[-4px] rounded-full border border-[rgba(180,160,255,0.4)] z-[-1]" />
                                            <motion.div animate={{ opacity: [1, 0.3] }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} className="absolute top-[6px] right-[6px] w-[5px] h-[5px] rounded-full bg-[rgba(180,160,255,1)]" />
                                        </>
                                    )}
                                    <Mic size={18} className={isListening ? "text-white" : ""} />
                                </button>
                                <button
                                    onClick={() => (query.trim() || fileContexts.length > 0) && triggerSearch(query)}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${(query.trim() || fileContexts.length > 0) ? 'amber-glass text-white' : 'pastel-glass text-white/30'}`}
                                >
                                    {(query.trim() || fileContexts.length > 0) ? <ArrowUp size={18} /> : <Activity size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Amber Gradient Strip */}
                        <div className="absolute bottom-0 left-0 right-0 h-[44px] bg-gradient-to-r from-[rgba(140,55,8,0.3)] via-[rgba(245,130,20,0.5)] to-[rgba(110,38,4,0.2)] blur-[14px] pointer-events-none z-10" />
                    </div>
                </div>
            </div>
        </div>
    );
}
