import { NextRequest, NextResponse } from 'next/server';
import { generateCardSchemaFromLLM } from '@/lib/generative-card';

export async function POST(req: NextRequest) {
    try {
        const { result } = await req.json();
        if (!result) {
            return NextResponse.json({ error: 'Missing result data' }, { status: 400 });
        }

        const schema = await generateCardSchemaFromLLM(result);
        return NextResponse.json(schema);
    } catch (error) {
        console.error('API Error generating card:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
