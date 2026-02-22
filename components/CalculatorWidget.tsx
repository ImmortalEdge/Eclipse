'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, ChevronDown, ChevronUp, Copy as CopyIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CalcResult } from '@/lib/calculator';
import { create, all } from 'mathjs';

const math = create(all);

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CalculatorWidgetProps {
    data: CalcResult;
    onClose: () => void;
}

const HISTORY_KEY = 'eclipse_calc_history';

export default function CalculatorWidget({ data, onClose }: CalculatorWidgetProps) {
    const [showKeypad, setShowKeypad] = useState(false);
    const [showCopied, setShowCopied] = useState(false);
    const [count, setCount] = useState(0);
    const [history, setHistory] = useState<{ ex: string, res: string }[]>([]);
    const [localEx, setLocalEx] = useState(data.expression);
    const [activeType, setActiveType] = useState(data.type);

    // Sync with prop data
    useEffect(() => {
        setLocalEx(data.expression);
        setActiveType(data.type);
        if (typeof data.result === 'number' && (data.result as number) < 1000000) {
            const step = (data.result as number) / 25;
            let current = 0;
            const interval = setInterval(() => {
                current += step;
                if (current >= (data.result as number)) {
                    setCount(data.result as number);
                    clearInterval(interval);
                } else {
                    setCount(current);
                }
            }, 16);
            return () => clearInterval(interval);
        } else {
            setCount(typeof data.result === 'number' ? (data.result as number) : 0);
        }
    }, [data]);

    // History management
    useEffect(() => {
        const saved = sessionStorage.getItem(HISTORY_KEY);
        const parsed = saved ? JSON.parse(saved) : [];

        // Add current if new
        const currentEntry = { ex: data.expression, res: formatResult(data.result, data.type, data.details?.symbol) };
        const exists = parsed.some((h: any) => h.ex === currentEntry.ex);

        if (!exists) {
            const newHist = [currentEntry, ...parsed].slice(0, 3);
            setHistory(newHist);
            sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHist));
        } else {
            setHistory(parsed.slice(0, 3));
        }
    }, [data]);

    function formatResult(res: number | string, type: string, symbol?: string) {
        if (typeof res !== 'number') return res;

        const formattedNum = res.toLocaleString(undefined, {
            maximumSignificantDigits: 6
        });

        if (type === 'currency' && symbol) {
            return `${symbol}${res.toFixed(2)}`;
        }
        if (type === 'interest') {
            return `$${res.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return formattedNum;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(count.toString());
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 1500);
    };

    const handleKey = (key: string) => {
        if (key === 'C') {
            setLocalEx('');
            setCount(0);
            return;
        }
        if (key === '=') {
            try {
                const clean = localEx
                    .replace(/÷/g, '/')
                    .replace(/×/g, '*')
                    .replace(/−/g, '-');
                const res = math.evaluate(clean);
                const numRes = typeof res === 'number' ? res : (res as any).value || 0;
                setCount(numRes);
                setLocalEx(numRes.toString());
                setActiveType('standard');

                // Update History
                const newEntry = { ex: localEx, res: formatResult(numRes, 'standard') };
                const saved = sessionStorage.getItem(HISTORY_KEY);
                const parsed = saved ? JSON.parse(saved) : [];
                const exists = parsed.some((h: any) => h.ex === newEntry.ex);
                if (!exists) {
                    const newHist = [newEntry, ...parsed].slice(0, 3);
                    setHistory(newHist);
                    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(newHist));
                }
            } catch (e) {
                setLocalEx('Error');
            }
            return;
        }
        if (key === '±') {
            try {
                const res = math.evaluate(`(${localEx}) * -1`);
                setCount(res);
                setLocalEx(res.toString());
            } catch (e) { }
            return;
        }
        if (key === '%') {
            try {
                const res = math.evaluate(`(${localEx}) / 100`);
                setCount(res);
                setLocalEx(res.toString());
            } catch (e) { }
            return;
        }

        setLocalEx(prev => {
            if (prev === '0' || prev === 'Error') return key;
            return prev + key;
        });
    };

    const keypad = [
        ['C', '±', '%', '÷'],
        ['7', '8', '9', '×'],
        ['4', '5', '6', '−'],
        ['1', '2', '3', '+'],
        ['0', '.', '=']
    ];

    return (
        <motion.div
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-[#0c0c0c] border border-white/10 border-l-2 border-l-[#F5A623] rounded-[24px] p-6 mb-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)] w-full max-w-[400px] relative overflow-hidden group mx-auto"
        >
            {/* Header Mini */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Calculator size={12} className="text-[#F5A623]" />
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Calculator</span>
                </div>
                <button onClick={onClose} className="text-white/10 hover:text-white transition-all">
                    <X size={14} />
                </button>
            </div>

            {/* Expression - Muted Above */}
            <div className="text-[13px] text-zinc-600 font-medium mb-1 truncate">
                {localEx || data.expression}
            </div>

            {/* Dominant Result Display */}
            <div className="relative mb-2">
                <div
                    onClick={handleCopy}
                    className="text-[64px] font-bold text-white tracking-tighter cursor-pointer overflow-hidden whitespace-nowrap active:scale-[0.98] transition-all font-sans leading-none"
                >
                    {formatResult(count, activeType, data.details?.symbol)}
                </div>

                <AnimatePresence>
                    {showCopied && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute right-0 -top-6 text-[#F5A623] text-[9px] font-black uppercase tracking-widest"
                        >
                            Copied
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Secondary Modes (Hidden if Keyboard active to save space) */}
            <AnimatePresence>
                {!showKeypad && (data.type === 'interest' || data.type === 'percentage') && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        {data.type === 'interest' && data.details && (
                            <div className="flex justify-between items-center py-2 text-[10px] font-bold uppercase tracking-wider text-white/20 border-t border-white/5">
                                <span>TERM: {data.details.years}Y</span>
                                <span className="text-[#F5A623]/60">EARNED: ${data.details.interest.toLocaleString()}</span>
                            </div>
                        )}
                        {data.type === 'percentage' && data.secondaryInfo && (
                            <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest py-2 border-t border-white/5 truncate">
                                {data.secondaryInfo}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keypad Toggle - Small Keyboard Icon Bottom Right */}
            <div className="flex justify-end mt-2">
                <button
                    onClick={() => setShowKeypad(!showKeypad)}
                    className={cn(
                        "p-2 rounded-lg transition-all active:scale-95",
                        showKeypad ? "bg-[#F5A623] text-[#0c0c0c]" : "bg-white/5 text-white/30 hover:text-white"
                    )}
                >
                    <Calculator size={16} />
                </button>
            </div>

            {/* Sliding Keypad */}
            <AnimatePresence>
                {showKeypad && (
                    <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 35 }}
                        className="overflow-hidden border-t border-white/5"
                    >
                        <div className="grid grid-cols-4 gap-2 pt-4">
                            {keypad.map((row, i) => (
                                <React.Fragment key={i}>
                                    {row.map((key) => {
                                        const isOperator = ['÷', '×', '−', '+'].includes(key);
                                        const isEquals = key === '=';
                                        const isClear = key === 'C';
                                        const isZero = key === '0';

                                        return (
                                            <motion.button
                                                key={key}
                                                whileTap={{ scale: 0.94 }}
                                                onClick={() => handleKey(key)}
                                                className={cn(
                                                    "h-11 rounded-[12px] text-[15px] transition-all flex items-center justify-center border font-bold",
                                                    isZero && "col-span-2",
                                                    isOperator ? "bg-transparent border-[#F5A623]/60 text-[#F5A623]" :
                                                        isEquals ? "bg-[#F5A623] border-[#F5A623] text-[#0c0c0c]" :
                                                            isClear ? "bg-zinc-900 border-white/5 text-white/40" :
                                                                "bg-zinc-900/40 border-white/5 text-white hover:bg-zinc-800"
                                                )}
                                            >
                                                {key}
                                            </motion.button>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
