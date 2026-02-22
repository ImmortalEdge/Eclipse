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

export async function generateCardSchemaFromLLM(result: any): Promise<CardSchema> {
    const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
    const modelToUse = 'mistral:latest'; // Consistent with existing setup

    const systemPrompt = `You are designing a knowledge card for Eclipse, a dark-themed AI search engine with an editorial aesthetic.
Given this raw search result, design the card schema.
Be creative — don't use generic labels or obvious fields.
Find the most interesting angle on this result.
Only include metadata that is genuinely useful.
Decide if this result is significant enough to earn the amber accent treatment.
Return only valid JSON matching the CardSchema type.`;

    const rawData = JSON.stringify({
        rawTitle: result.title,
        rawSummary: result.content || result.snippet,
        rawMetadata: result.metadata || {},
        sources: [{ name: result.name || new URL(result.url).hostname, url: result.url }],
        timestamp: new Date().toISOString()
    });

    const prompt = `${systemPrompt}\n\nRaw result: ${rawData}\n\nJSON Structure: {
  "label": "CATEGORICAL LABEL (e.g. FILM, LOST CLASSIC, OSCAR WINNER)",
  "headline": "Compelling angle on the result (Serif voice)",
  "metadata": [{ "key": "Field Name", "value": "Fact" }],
  "body": "Detailed insight (1-3 lines)",
  "bodySize": "small | medium | large",
  "bottomRow": [{ "type": "chip | link | source", "label": "Text", "url": "optional", "site": "optional" }],
  "hasAccent": boolean (true if highly significant),
  "visualWeight": "light | heavy"
}`;

    try {
        const response = await fetch(`${OLLAMA_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: modelToUse,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.3 },
                format: 'json'
            })
        });

        if (!response.ok) throw new Error('Ollama failure');
        const data = await response.json();
        return JSON.parse(data.response) as CardSchema;
    } catch (error) {
        console.error('Schema generation error:', error);
        // Fallback schema
        return {
            label: "ARCHIVAL ORIGIN",
            headline: result.title || "Untitled Intelligence Fragment",
            metadata: [{ key: "Domain", value: new URL(result.url).hostname }],
            body: result.content?.substring(0, 150) + "..." || "No content available for synthesis.",
            bodySize: "medium",
            hasAccent: false,
            visualWeight: "light"
        };
    }
}
