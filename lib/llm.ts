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

export async function generateAnswer(
  query: string,
  context: SearchResult[],
  modelName: string = 'mistral:latest',
  mode: string = 'fast',
  onToken?: (token: string) => void
): Promise<LLMResponse> {


  const isResearch = mode === 'research_extreme';

  const systemPrompt = isResearch
    ? `Research Scientist: Provide deep analysis with cross-validated claims. Structure: Overview, Context, Key Findings, Data, Analysis, Conclusion. Use LaTeX and Markdown Tables. Output ONLY valid JSON—no markdown fences.`
    : `Research Assistant: Provide concise, accurate summary. Focus on key data with bullet points. Output ONLY valid JSON—no markdown fences.`;

  const userPrompt = `Query: ${query} (${mode})\n\nSources:\n${context.slice(0, 8).map(c => `${c.title}: ${c.content.substring(0, 300)}`).join('\n---\n')}\n\nRespond with this JSON (adapt content length to ${isResearch ? '500-700 words total' : '200-300 words'}):
{
  "segments": [{"text": "Key statement", "source": {"name": "Title", "domain": "example.com", "url": "http://...", "title": "...", "summary": "brief evidence", "date": "Feb 2026"}}],
  "keyInsight": "3-4 sentence synthesis of main discovery",
  "cards": [{"label": "Category", "value": "2-3 sentence explanation", "type": "info"}],
  "followUps": ["Related question 1", "Related question 2"],
  "longFormAnswerSegments": [{"text": "Technical analysis...", "source": {...}}]
}`; 
             "url": "...",
             "title": "...",
             "summary": "...",
             "date": "..."
           } 
         }
      ],
      "needsFinance": boolean,
      "company": { ... },
      "chartData": [ ... ]
    }
    
    CRITICAL RULES:
    - NEVER use bracketed numbers like [1] or [2].
    - NEVER output a "References" section.
    - Sources MUST be objects within segments.
    - "summary" in source should be specific to why this source supports the current text.
  `;

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

    // Strip markdown fences in case the model wraps its JSON output
    const cleaned = fullResponse
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
        console.error('Raw Response preview:', fullResponse.slice(0, 500));
        
        // Try to extract segments array if possible
        const segmentsMatch = cleaned.match(/"segments"\s*:\s*\[([\s\S]*?)\](?=\s*,|\s*\})/);
        const extractedText = segmentsMatch 
          ? `AI Response (partial): ${cleaned.substring(0, 300)}...` 
          : cleaned.substring(0, 500);
        
        // Return a valid response with the extracted content
        return {
          segments: [{
            text: extractedText,
            source: {
              name: 'AI Provider',
              domain: 'api.ai',
              url: 'http://api.ai'
            }
          }],
          keyInsight: 'Response received but partially truncated. Increase API token limit.',
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
