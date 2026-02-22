import { NextRequest, NextResponse } from 'next/server';
import { generateStackCardSchema } from '@/lib/knowledge-stack';

export async function POST(req: NextRequest) {
    try {
        const { result } = await req.json();
        if (!result) return NextResponse.json({ error: 'Missing result' }, { status: 400 });

        const schema = await generateStackCardSchema(result);
        return NextResponse.json(schema);
    } catch (error) {
        console.error('API Error generating stack card:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
