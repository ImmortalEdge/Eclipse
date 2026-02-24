export interface SearchResult {
    title: string;
    content: string;
    url: string;
    img_src?: string;
}

export interface SearchOptions {
    site?: string;
    engine?: string;
    extreme?: boolean;
}

export async function searchSearxng(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const { site, engine, extreme } = options;
    const SEARXNG_URL = process.env.SEARXNG_URL || 'http://localhost:8080';
    const url = new URL(`${SEARXNG_URL}/search`);

    // Apply site modifier if present
    const fullQuery = site ? `site:${site} ${query}` : query;

    url.searchParams.set('q', fullQuery);
    url.searchParams.set('format', 'json');

    // Increase results for extreme mode
    const limit = extreme ? 15 : 8;

    if (engine) {
        url.searchParams.set('engines', engine);
    }

    try {
        const response = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json',
                'Referer': SEARXNG_URL
            }
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`SearXNG request failed. URL: ${url.toString()}, Status: ${response.status}, Response: ${errorText}`);
            throw new Error(`SearXNG error: ${response.statusText}`);
        }
        const data = await response.json();
        return (data.results || []).slice(0, limit).map((result: any) => ({
            title: result.title,
            content: result.content,
            url: result.url,
            img_src: result.img_src || result.thumbnail
        }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}
