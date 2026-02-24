import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force Turbopack to ignore the static import by using a dynamic one inside the function
export const dynamic = 'force-dynamic';

async function parsePDF(buffer: Buffer) {
    // Dynamic import avoids static "export default" check during build
    const pdfModule: any = await import('pdf-parse');
    const pdf = pdfModule.default || pdfModule;
    return pdf(buffer);
}

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        });

        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: 400 });
        }

        const contentType = response.headers.get('content-type') || '';

        if (contentType.includes('application/pdf')) {
            const buffer = await response.arrayBuffer();
            const data = await parsePDF(Buffer.from(buffer));
            return NextResponse.json({
                title: url.split('/').pop() || 'PDF Document',
                body: (data.text || '').slice(0, 10000),
                url,
                isPdf: true
            });
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Remove unwanted elements
        $('script, style, nav, footer, header, aside, iframe, noscript').remove();

        const title = $('title').text() || $('h1').first().text() || 'Untitled Page';
        const description = $('meta[name="description"]').attr('content') ||
            $('meta[property="og:description"]').attr('content') || '';

        let body = $('article').text() || $('main').text() || $('body').text();
        body = body.replace(/\s+/g, ' ').trim().slice(0, 10000);

        return NextResponse.json({
            title,
            description,
            body,
            url,
            isPdf: false
        });

    } catch (error: any) {
        console.error('Fetch URL Error:', error);
        return NextResponse.json({ error: 'Eclipse could not read this page' }, { status: 500 });
    }
}
