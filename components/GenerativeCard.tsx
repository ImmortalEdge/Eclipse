'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ExternalLink, Info, Plus, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface CardSchema {
    label: string;
    headline: string;
    metadata: { key: string; value: string }[];
    body: string;
    bodySize: 'small' | 'medium' | 'large';
    bottomRow?: { type: 'chip' | 'link' | 'source'; label: string; url?: string; site?: string }[];
    hasAccent: boolean;
    visualWeight: 'light' | 'heavy';
}

const schemaCache = new Map<string, CardSchema>();

export async function generateCardSchema(result: any): Promise<CardSchema> {
    const resultId = result.id || result.url;
    if (schemaCache.has(resultId)) {
        return schemaCache.get(resultId)!;
    }

    const response = await fetch('/api/generate-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ result }),
    });

    if (!response.ok) {
        throw new Error('Failed to generate card schema');
    }

    const schema = await response.json();
    schemaCache.set(resultId, schema);
    return schema;
}

export function CardRenderer({ schema }: { schema: CardSchema }) {
    const isHeavy = schema.visualWeight === 'heavy';
    const headlineSize = {
        large: 'text-[22px]',
        medium: 'text-[18px]',
        small: 'text-[15px]',
    }[schema.bodySize];

    return (
        <div
            className={cn(
                'relative bg-[#1a1714] border border-white/[0.08] rounded-[16px] w-full overflow-hidden transition-all duration-500',
                schema.hasAccent && 'border-l-2 border-l-[#F5A623] shadow-[0_0_24px_rgba(245,166,35,0.08)]',
                isHeavy ? 'p-6' : 'p-5'
            )}
        >
            {schema.hasAccent && (
                <div className="absolute left-0 top-0 bottom-0 w-[40px] bg-gradient-to-r from-[#F5A623]/5 to-transparent pointer-events-none" />
            )}

            {/* Label */}
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 mb-3">
                {schema.label}
            </div>

            {/* Headline */}
            <h2 className={cn(
                'text-white leading-[1.2] font-[family-name:var(--font-instrument-serif)] italic mb-4',
                headlineSize
            )}>
                {schema.headline}
            </h2>

            {/* Metadata */}
            {schema.metadata.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                    {schema.metadata.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{item.key}</span>
                            <span className="text-[11px] font-medium text-white/45">{item.value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Body */}
            <p className={cn(
                'text-white/80 leading-relaxed transition-all',
                schema.bodySize === 'large' ? 'text-[15px]' : 'text-[13px]',
                isHeavy ? 'line-clamp-3' : 'line-clamp-2'
            )}>
                {schema.body}
            </p>

            {/* Bottom Row */}
            {schema.bottomRow && schema.bottomRow.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/[0.04]">
                    {schema.bottomRow.map((item, i) => {
                        if (item.type === 'chip') {
                            return (
                                <div key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-white/40 uppercase tracking-widest">
                                    {item.label}
                                </div>
                            );
                        }
                        if (item.type === 'link') {
                            return (
                                <a
                                    key={i}
                                    href={item.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[11px] font-medium text-[#F5A623] hover:underline"
                                >
                                    {item.label} <ArrowRight size={10} />
                                </a>
                            );
                        }
                        if (item.type === 'source') {
                            return (
                                <div key={i} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-black/40 border border-white/5">
                                    {item.site && (
                                        <img
                                            src={`https://www.google.com/s2/favicons?domain=${item.site}&sz=32`}
                                            alt=""
                                            className="w-3 h-3 rounded-sm opacity-60"
                                        />
                                    )}
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-tight">{item.label}</span>
                                </div>
                            )
                        }
                        return null;
                    })}
                </div>
            )}
        </div>
    );
}

const Skeleton = () => (
    <div className="w-full h-48 bg-[#1a1714] border border-white/[0.08] rounded-[16px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shift" />
    </div>
);

export default function GenerativeCard({ result }: { result: any }) {
    const [schema, setSchema] = useState<CardSchema | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadSchema = async () => {
            try {
                setLoading(true);
                const s = await generateCardSchema(result);
                if (isMounted) {
                    setSchema(s);
                    setLoading(false);
                }
            } catch (e) {
                console.error('Error generating card schema:', e);
                if (isMounted) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        loadSchema();
        return () => { isMounted = false; };
    }, [result]);

    if (loading) return <Skeleton />;
    if (error || !schema) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <CardRenderer schema={schema} />
        </motion.div>
    );
}
