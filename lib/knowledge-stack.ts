export interface StackCardSchema {
    label: string;
    headline: string;
    headlineSize: 'large' | 'medium' | 'small';
    body: string;
    source: string;
    sourceUrl: string;
    hasAccent: boolean;
    accentReason?: string;
}

export async function generateStackCardSchema(result: any): Promise<StackCardSchema> {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const modelToUse = 'mistral:latest';

    const systemPrompt = `You are writing knowledge cards for Eclipse, a dark editorial AI search engine.
Given a search result, generate a card schema.

Rules:
- Label must be creative and specific to THIS result (1-5 words, e.g. "CINEMATIC EXPLORATION")
- Headline must be the most compelling angle, not just the article title. Use Eclipse serif voice.
- Body is max 2 sentences, no filler. Hard 2 line limit in UI.
- Never use generic labels like 'ARTICLE' or 'RESULT'.
- Only set hasAccent true if genuinely significant (award winning, historically important, scientifically groundbreaking, breaking news).
- Source is domain name only (e.g. archinect.com), never full URL.
- Never include dates or author names unless extraordinary.`;

    const rawData = JSON.stringify({
        title: result.title,
        summary: result.content || result.snippet,
        url: result.url,
        metadata: result.metadata || {}
    });

    const prompt = `${systemPrompt}\n\nRaw result: ${rawData}\n\nReturn ONLY valid JSON.
{
  "label": "Creative Label",
  "headline": "Compelling Headline",
  "headlineSize": "large | medium | small",
  "body": "Max 2 technical sentences",
  "source": "domain.com",
  "sourceUrl": "original_url",
  "hasAccent": boolean,
  "accentReason": "optional reason"
}`;

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelToUse,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.4 },
                format: 'json'
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            throw new Error(`Ollama returned ${response.status}`);
        }

        const data = await response.json();
        return JSON.parse(data.response) as StackCardSchema;
    } catch (error) {
        // Silent fail - return fallback without logging (Ollama expected to be optional)
        let domain = 'archive.org';
        try {
            if (result && result.url) {
                domain = new URL(result.url).hostname.replace('www.', '');
            }
        } catch (e) { }

        return {
            label: "ARCHIVAL FRAGMENT",
            headline: result?.title?.substring(0, 60) || "Untitled Fragment",
            headlineSize: "medium",
            body: result?.content?.substring(0, 120) || "Data retrieval in progress. Analyzing technical signals...",
            source: domain,
            sourceUrl: result?.url || '#',
            hasAccent: false
        };
    }
}
