// Eclipse Backend v1.1 - Relative Path Resolution
import { NextRequest, NextResponse } from 'next/server';
import { searchSearxng } from '../../../lib/search';
import { generateAnswer } from '../../../lib/llm';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const { query, mode, model } = await request.json();

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

                sendEvent('search_started', { query, mode });

                if (isResearch) {
                    // RESEARCH EXTREME PIPELINE
                    sendEvent('status', { message: 'Initiating multi-step research loop...' });

                    // Round 1: Primary Search
                    sendEvent('subquery', { query: query });
                    const r1 = await searchSearxng(query, { extreme: true });

                    // Round 2: Expansion
                    const expansionQuery = `${query} technical details analysis`;
                    sendEvent('subquery', { query: expansionQuery });
                    const r2 = await searchSearxng(expansionQuery, { extreme: true });

                    // Round 3: Counter-perspectives or Specific Data
                    const dataQuery = `${query} data statistics 2024 2025`;
                    sendEvent('subquery', { query: dataQuery });
                    const r3 = await searchSearxng(dataQuery, { extreme: true });

                    // Combine and deduplicate
                    const allResults = [...r1, ...r2, ...r3];
                    const uniqueResults = Array.from(new Map(allResults.map(r => [r.url, r])).values()).slice(0, 25);

                    sendEvent('sources_found', { count: uniqueResults.length, sources: uniqueResults.map(r => r.url) });
                    sendEvent('analysis_started', { message: 'Cross-validating 25+ sources for Research Extreme report...' });

                    const answer = await generateAnswer(query, uniqueResults, model, 'research_extreme',
                        (token) => sendEvent('answer_token', { token })
                    );

                    sendEvent('result', { query, results: uniqueResults, answer });
                } else {
                    // FAST PIPELINE
                    sendEvent('status', { message: 'Executing high-speed retrieval...' });
                    sendEvent('subquery', { query: query });

                    const results = await searchSearxng(query, { extreme: false });
                    const topResults = results.slice(0, 8);

                    sendEvent('sources_found', { count: topResults.length, sources: topResults.map(r => r.url) });
                    sendEvent('analysis_started', { message: 'Synthesizing fast response...' });

                    const answer = await generateAnswer(query, topResults, model, 'fast',
                        (token) => sendEvent('answer_token', { token })
                    );

                    sendEvent('result', { query, results: topResults, answer });
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
