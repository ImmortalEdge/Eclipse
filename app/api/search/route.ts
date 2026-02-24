// Eclipse Backend v1.1 - Relative Path Resolution
import { NextRequest, NextResponse } from 'next/server';
import { searchSearxng } from '../../../lib/search';
import { generateAnswer } from '../../../lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const { query, mode, model, language = 'en' } = await request.json();

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            let isClosed = false;
            const sendEvent = (event: string, data: any) => {
                if (isClosed) return;
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, ...data })}\n\n`));
                } catch (e) {
                    isClosed = true;
                }
            };

            request.signal.addEventListener('abort', () => {
                isClosed = true;
                try { controller.close(); } catch (e) { }
            });

            try {
                const isResearch = mode === 'research_extreme';
                const isDeep = mode === 'deep';

                sendEvent('search_started', { query, mode });
                sendEvent('status', { message: 'Analyzing query intent...' });

                const { rewriteQuery } = await import('../../../lib/llm');
                const professionalQuery = await rewriteQuery(query);

                if (isResearch) {
                    // RESEARCH EXTREME PIPELINE
                    sendEvent('status', { message: 'Initiating multi-step research loop...' });

                    const subQueries = [
                        professionalQuery,
                        `${professionalQuery} technical analysis data statistics`,
                        `${professionalQuery} expert opinions counter-arguments`
                    ];

                    let allResults: any[] = [];
                    for (const sq of subQueries) {
                        sendEvent('subquery', { query: sq });
                        const r = await searchSearxng(sq, { extreme: true, language });
                        allResults = [...allResults, ...r];
                    }

                    const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values()).slice(0, 25);
                    sendEvent('sources_found', { count: uniqueResults.length, sources: uniqueResults.map(r => r.url) });
                    sendEvent('analysis_started', { message: 'Cross-validating 25+ sources for Research Extreme report...' });

                    const answer = await generateAnswer(query, uniqueResults, model, 'research_extreme', language, (token) => sendEvent('answer_token', { token }));
                    sendEvent('result', { query, results: uniqueResults, answer });

                } else {
                    // STANDARD & DEEP PIPELINE (Enhanced with multi-angle retrieval)
                    sendEvent('status', { message: 'Breaking query into research dimensions...' });

                    const subQueries = [
                        professionalQuery,
                        `${professionalQuery} context background`
                    ];

                    let allResults: any[] = [];
                    for (const sq of subQueries) {
                        sendEvent('subquery', { query: sq });
                        const r = await searchSearxng(sq, { extreme: false, language });
                        allResults = [...allResults, ...r];
                    }

                    const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values()).slice(0, 15);
                    sendEvent('sources_found', { count: uniqueResults.length, sources: uniqueResults.map(r => r.url) });

                    if (isDeep) {
                        sendEvent('analysis_started', { message: 'Synthesizing Generative UI Research Report...' });
                        try {
                            const { streamResponse } = await import('../../../lib/ai-provider');
                            const deepSystem = `You are Eclipse's Research & Generative UI Engine (DEEP Mode). 
Your task is to analyze search results and synthesize a high-density, multi-layered report.

STRUCTURE REQUIREMENTS:
1. summary: A high-level 2-3 paragraph "Intelligence Core" summary.
2. research_sections: An array of detailed text sections. 
   - MINIMUM 2 sections.
   - Each section must be 150+ words of real sentences (no bullets).
   - Total research text must exceed 400 words.
   - Topics: "WHAT WE FOUND", "DEEPER CONTEXT", "KEY IMPLICATIONS".
   - IF SOURCES CONFLICT, explicitly state "Sources conflict on this — here's what each side says...".
3. components: An array of visual widgets (2-4 items).

LIBRARY SPECIFICATION (Valid components):
- stat_row: { stats: Array<{label, value, note?}> }
- comparison_table: { title, items: string[], rows: Array<{label, values: string[], winner?: number}> }
- bar_chart: { title, items: Array<{label, value}> }
- timeline: { title, events: Array<{date, title, description?}> }
- pro_con: { title, pros: string[], cons: string[] }
- quote_block: { text, author, citation? }

JSON SCHEMA:
{
  "summary": "concise string",
  "research_sections": [ { "title": "UPPERCASE TITLE", "body": "Detailed paragraphs..." } ],
  "components": [ { "type": "type_name", "data": { ... } } ]
}

Return ONLY raw JSON. No markdown. No conversational filler. Provide deep, expert-level research.`;

                            const serialized = uniqueResults.map(r => ({ title: r.title, url: r.url, snippet: r.content?.substring(0, 600) || '' }));

                            const deepUser = `QUERY: ${query}
SEARCH RESULTS: ${JSON.stringify(serialized)}

AS RESEARCH ENGINE:
1. Write 2-3 paragraph summary.
2. Write 2-3 high-word-count Research Sections (Expert depth). Give specific dates and numbers.
3. Select and populate 2-4 visual components.
4. Total research text must be at least 400 words.
5. Respond ONLY with valid JSON.`;

                            let full = '';
                            for await (const token of streamResponse(deepUser, deepSystem)) {
                                full += token;
                                sendEvent('answer_token', { token });
                            }

                            let cleaned = full.trim();
                            const firstBrace = cleaned.indexOf('{');
                            const lastBrace = cleaned.lastIndexOf('}');
                            if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                                cleaned = cleaned.substring(firstBrace, lastBrace + 1);
                            }
                            cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
                            const repairTruncatedJson = (raw: string) => {
                                let s = raw.replace(/,\s*$/, '');
                                let inString = false;
                                let escape = false;
                                const stack: string[] = [];
                                for (let i = 0; i < s.length; i++) {
                                    const ch = s[i];
                                    if (escape) { escape = false; continue; }
                                    if (ch === '\\' && inString) { escape = true; continue; }
                                    if (ch === '"') { inString = !inString; continue; }
                                    if (inString) continue;
                                    if (ch === '{') stack.push('}');
                                    else if (ch === '[') stack.push(']');
                                    else if (ch === '}' || ch === ']') if (stack.length) stack.pop();
                                }
                                if (inString) s += '"';
                                while (stack.length) s += stack.pop();
                                return s;
                            };

                            let layout: any = null;
                            try {
                                layout = JSON.parse(cleaned);
                            } catch (e) {
                                try {
                                    const repaired = repairTruncatedJson(cleaned);
                                    layout = JSON.parse(repaired);
                                } catch (err) {
                                    layout = null;
                                }
                            }

                            if (layout) {
                                sendEvent('deep_result', { query, results: uniqueResults, layout });
                                sendEvent('result', { query, results: uniqueResults, answer: { summary: layout.summary || '', layout, research_sections: layout.research_sections || [] } });
                            } else {
                                const answer = await generateAnswer(query, uniqueResults, model, 'fast', language, (token) => sendEvent('answer_token', { token }));
                                sendEvent('result', { query, results: uniqueResults, answer });
                            }
                        } catch (error) {
                            const answer = await generateAnswer(query, uniqueResults, model, 'fast', language, (token) => sendEvent('answer_token', { token }));
                            sendEvent('result', { query, results: uniqueResults, answer });
                        }
                    } else {
                        sendEvent('analysis_started', { message: 'Synthesizing expert analysis...' });
                        const answer = await generateAnswer(query, uniqueResults, model, 'fast', language, (token) => sendEvent('answer_token', { token }));
                        sendEvent('result', { query, results: uniqueResults, answer });
                    }
                }

                sendEvent('complete', {});
                if (!isClosed) {
                    isClosed = true;
                    controller.close();
                }
            } catch (error: any) {
                console.error('Search API error:', error);
                sendEvent('error', { message: error.message });
                if (!isClosed) {
                    isClosed = true;
                    controller.close();
                }
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
