export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q');

    if (!q) {
        return Response.json([]);
    }

    try {
        const res = await fetch(
            `https://duckduckgo.com/ac/?q=${encodeURIComponent(q)}&type=list`
        );
        const data = await res.json();
        return Response.json(data[1] || []);
    } catch (error) {
        console.error('Suggestions API error:', error);
        return Response.json([]);
    }
}
