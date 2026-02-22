export async function* streamResponse(
    query: string,
    systemPrompt: string
): AsyncGenerator<string> {
    const provider = process.env.AI_PROVIDER || 'groq';

    if (provider === 'groq') {
        yield* streamGroq(query, systemPrompt);
    } else if (provider === 'ollama') {
        yield* streamOllama(query, systemPrompt);
    } else {
        throw new Error(
            `Unknown AI_PROVIDER: ${provider}. 
       Use 'groq' or 'ollama'`
        );
    }
}

// GROQ PROVIDER
async function* streamGroq(
    query: string,
    systemPrompt: string
): AsyncGenerator<string> {
    const Groq = (await import('groq-sdk')).default;
    const client = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    const stream = await client.chat.completions.create({
        model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query }
        ],
        stream: true,
        max_tokens: 16384,
        temperature: 0.3
    });

    for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content;
        if (token) yield token;
    }
}

// OLLAMA PROVIDER
async function* streamOllama(
    query: string,
    systemPrompt: string
): AsyncGenerator<string> {
    const res = await fetch(
        `${process.env.OLLAMA_URL}/api/chat`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: process.env.OLLAMA_MODEL || 'mistral:latest',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                stream: true
            })
        }
    );

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder
            .decode(value)
            .split('\n')
            .filter(Boolean);

        for (const line of lines) {
            try {
                const json = JSON.parse(line);
                const token = json.message?.content;
                if (token) yield token;
            } catch { }
        }
    }
}
