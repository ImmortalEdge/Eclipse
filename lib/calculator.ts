import { create, all } from 'mathjs';

const math = create(all);

export interface CalcResult {
    expression: string;
    result: number | string;
    type: 'standard' | 'percentage' | 'interest' | 'currency';
    secondaryInfo?: string;
    details?: any;
}

export function detectCalculatorIntent(query: string): boolean {
    const q = query.toLowerCase().trim();

    // Direct math expressions (numbers and operators)
    if (/^[\d\s+\-*/().^%sqrt]+$/.test(q) && /[+\-*/^%]/.test(q)) return true;

    // Percentage patterns
    if (/\b\d+\s*%\s*of\s*\d+/.test(q)) return true;
    if (/what is\s*\d+\s*(percent|%)\s*of\s*\d+/.test(q)) return true;

    // Currency math
    if (/[$\xA3\u20AC\xA5]\s*\d+/.test(q) && /[+\-*/]/.test(q)) return true;

    // Compound interest
    if (/\bcompound interest\b/.test(q) && /\d+/.test(q)) return true;

    // Common math words
    if (/^(sqrt|abs|log|sin|cos|tan)\(.*\)$/.test(q)) return true;

    return false;
}

export function parseExpression(query: string): CalcResult | null {
    const q = query.toLowerCase().trim();

    // Percentage Mode: "20% of 850"
    let match = q.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s*of\s*(\d+(?:\.\d+)?)/);
    if (match) {
        const rate = parseFloat(match[1]);
        const base = parseFloat(match[2]);
        const res = (rate / 100) * base;
        return {
            expression: `${rate}% of ${base}`,
            result: res,
            type: 'percentage',
            secondaryInfo: `${rate}% rate on ${base}. ${base - res} remaining.`,
            details: { rate, base, remaining: base - res }
        };
    }

    // Compound Interest Mode: "compound interest 5000 at 7% for 10 years"
    if (q.includes('compound interest')) {
        const principalMatch = q.match(/(\d+(?:\.\d+)?)/);
        const rateMatch = q.match(/at\s*(\d+(?:\.\d+)?)\s*%/);
        const timeMatch = q.match(/for\s*(\d+)\s*years/);

        if (principalMatch && rateMatch && timeMatch) {
            const p = parseFloat(principalMatch[1]);
            const r = parseFloat(rateMatch[1]) / 100;
            const t = parseFloat(timeMatch[1]);
            const res = p * Math.pow(1 + r, t);
            return {
                expression: `Compound Interest: $${p}`,
                result: res,
                type: 'interest',
                details: { principal: p, rate: r * 100, years: t, interest: res - p }
            };
        }
    }

    // Currency math cleanup
    let cleanEx = query.replace(/[$\xA3\u20AC\xA5]/g, '').trim();
    const hasCurrency = /[$\xA3\u20AC\xA5]/.test(query);
    const symbol = query.match(/[$\xA3\u20AC\xA5]/)?.[0] || '';

    try {
        // Basic mathjs evaluation
        const res = math.evaluate(cleanEx);
        if (typeof res === 'number' || typeof res === 'object') {
            const numRes = typeof res === 'number' ? res : (res as any).value || 0;
            return {
                expression: cleanEx,
                result: numRes,
                type: hasCurrency ? 'currency' : 'standard',
                details: { symbol }
            };
        }
    } catch (e) {
        return null;
    }

    return null;
}
