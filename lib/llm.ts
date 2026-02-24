import { SearchResult } from './search';

/**
 * Best-effort repair of truncated JSON produced when a model hits its token limit.
 * Closes unclosed strings, arrays, and objects so JSON.parse can succeed.
 */
function repairTruncatedJson(raw: string): string {
  let s = raw;

  // If the last character is a comma, remove it (trailing comma before close)
  s = s.replace(/,\s*$/, '');

  // Track open brackets/braces to know what to close
  const stack: string[] = [];
  let inString = false;
  let escape = false;
  let lastOpenBracePos = -1;
  let lastOpenBracketPos = -1;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') { stack.push('}'); lastOpenBracePos = i; }
    else if (ch === '[') { stack.push(']'); lastOpenBracketPos = i; }
    else if (ch === '}' || ch === ']') { if (stack.length) stack.pop(); }
  }

  // If we ended mid-string, close the string
  if (inString) s += '"';

  // If we have unclosed arrays/objects, try to close them intelligently
  // Remove incomplete key-value pairs at the end
  if (stack.length > 0) {
    // Try removing incomplete trailing content
    s = s.replace(/,\s*"[^"]*:\s*(?:[^,\}\]]*)?$/, '');
    s = s.replace(/,\s*"[^"]*$/, '');
  }

  // Close all unclosed structures in reverse order
  while (stack.length) s += stack.pop();

  return s;
}


export interface LLMResponse {
  segments: Array<{
    text: string;
    source?: {
      name: string;
      domain: string;
      url: string;
    };
  }>;
  keyInsight: string;
  cards: Array<{
    label: string;
    value: string;
    subValue?: string;
    type: 'status' | 'date' | 'topic' | 'info';
  }>;
  followUps: string[];
  longFormAnswerSegments: Array<{
    text: string;
    source?: {
      name: string;
      domain: string;
      url: string;
    };
  }>;
  needsFinance?: boolean;
  company?: {
    name: string;
    ticker: string;
    price: number;
    changePercent: number;
    marketCap: string;
    currency?: string;
  };
  chartData?: Array<{ date: string; price: number }>;
}

/**
 * Rewrites a simple user query into a high-density professional research query.
 */
export async function rewriteQuery(query: string): Promise<string> {
  try {
    const { streamResponse } = await import('./ai-provider');
    const system = "You are Eclipse's Query Architect. Rewrite user queries into professional, keyword-rich research queries that yield better search results. Respond ONLY with the rewritten query.";
    const user = `User Query: "${query}"\nProfessional Research Query:`;

    let rewritten = '';
    for await (const token of streamResponse(user, system)) { rewritten += token; }
    return rewritten.replace(/["']/g, '').trim() || query;
  } catch (e) {
    return query;
  }
}

export async function generateAnswer(
  query: string,
  context: SearchResult[],
  modelName: string = 'mistral:latest',
  mode: string = 'fast',
  language: string = 'en',
  onToken?: (token: string) => void
): Promise<LLMResponse> {


  const isResearch = mode === 'research_extreme';

  const languages: Record<string, string> = {
    en: 'English', hi: 'Hindi', es: 'Spanish', fr: 'French', zh: 'Chinese',
    ar: 'Arabic', pt: 'Portuguese', de: 'German', ja: 'Japanese',
    ru: 'Russian', bn: 'Bengali', ur: 'Urdu'
  };
  const targetLanguage = languages[language] || 'English';

  const systemPrompt = `You are Eclipse — an expert research intelligence. You do not summarize; you explain, analyze, and illuminate.

RULES:
- Never use bullet points.
- Write in flowing, sophisticated, and intelligent prose.
- Provide specific numbers, dates, names, and statistics.
- Acknowledge complexity and nuance.
- Challenge assumptions when relevant.
- Minimum 3 paragraphs per answer.
- Always conclude with the single most important insight.
- Output ONLY valid JSON.
- ALWAYS respond in ${targetLanguage}. Your answer must be entirely in ${targetLanguage}.`;

  const sourcesText = context.slice(0, 15)
    .map(c => `${c.title}: ${c.content.substring(0, 400)}`)
    .join('\n---\n');

  const userPrompt = `QUERY: ${query}
MODE: ${mode}
LANGUAGE: ${targetLanguage}

SOURCES:
${sourcesText}

TASK:
Synthesize an expert research report in the following JSON format:
{
  "segments": [{"text": "First paragraph of flowing prose in ${targetLanguage}...", "source": {"name": "Title", "domain": "domain.com", "url": "..."}}],
  "keyInsight": "A concluding high-level discovery in ${targetLanguage} (3-4 sentences)",
  "cards": [{"label": "Metric", "value": "Specific data or explanation in ${targetLanguage}", "type": "info"}],
  "longFormAnswerSegments": [{"text": "Deeper technical detail in ${targetLanguage}...", "source": {...}}]
}

CRITICAL: 
- FLOWING PROSE ONLY. 
- NO BULLETS. 
- MINIMUM 3 PARAGRAPHS IN SEGMENTS.
- CITATIONS MUST BE SPECIFIC SOURCE OBJECTS.
- ENTIRE RESPONSE MUST BE IN ${targetLanguage}.`;

  try {
    const { streamResponse } = await import('./ai-provider');

    let fullResponse = '';
    for await (const token of streamResponse(userPrompt, systemPrompt)) {
      fullResponse += token;
      if (onToken) onToken(token);
    }

    if (!fullResponse.trim()) {
      throw new Error('AI provider returned an empty response. Check your AI_PROVIDER config and credentials.');
    }

    // Strip markdown fences or any conversational filler outside the first { and last }
    let cleaned = fullResponse.trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/, '')
      .trim();

    // First attempt: parse directly
    try {
      return JSON.parse(cleaned) as LLMResponse;
    } catch (_) {
      // Second attempt: repair truncated JSON (model hit token limit mid-output)
      console.warn('Direct JSON parse failed, attempting repair...');
      try {
        const repaired = repairTruncatedJson(cleaned);
        return JSON.parse(repaired) as LLMResponse;
      } catch (e) {
        // Third attempt: extract whatever text we can and create a fallback response
        console.error('JSON Parse Error after repair. Attempting fallback extraction...');

        // Robust extraction of any prose from segments if we can find it
        let extractedText = '';
        const segmentTextMatches = cleaned.match(/"text"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/g);
        if (segmentTextMatches && segmentTextMatches.length > 0) {
          extractedText = segmentTextMatches.map(m => {
            const inner = m.match(/"text"\s*:\s*"([^"\\]*(\\.[^"\\]*)*)"/);
            return inner ? inner[1].replace(/\\n/g, ' ').replace(/\\"/g, '"').trim() : '';
          }).filter(t => t.length > 5).join('\n\n');
        }

        if (!extractedText) {
          // Last ditch fallback: strip JSON-like stuff and show the raw text
          extractedText = cleaned
            .replace(/"[a-z0-9_]+":/gi, '')
            .replace(/\{|\}|\[|\]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }

        // Return a valid response with the extracted content
        return {
          segments: [{
            text: extractedText || "Investigation synthesis encounterd a structural error. Displaying raw data recovery.",
            source: {
              name: 'Eclipse Intelligence',
              domain: 'eclipse.ai',
              url: 'https://eclipse.ai'
            }
          }],
          keyInsight: 'The research report was successful but the structural finalization was interrupted. Full analysis is displayed above.',
          cards: [],
          followUps: ['Could you rephrase your question?', 'Try a more specific query'],
          longFormAnswerSegments: []
        };
      }
    }
  } catch (error) {
    console.error('LLM error:', error);
    return {
      segments: [{ text: 'Generation error. Please try again.' }],
      keyInsight: 'Backend failure.',
      cards: [],
      followUps: [],
      longFormAnswerSegments: [{ text: 'The model failed to synthesize an answer. Check your AI_PROVIDER setting in .env.local.' }]
    };
  }
}
