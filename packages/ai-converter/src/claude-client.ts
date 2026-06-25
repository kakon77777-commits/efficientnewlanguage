import Anthropic from '@anthropic-ai/sdk';
import type { LlmClient, RawSuggestion } from './types';

const SYSTEM = `You convert standard Python into EML/Py+ symbolic form. EML is a STRICT SUBSET — only these constructs exist:

  x^+100            -> x = 100 (first binding of x) / x += 100 (x already bound)
  x^-5 x^*2 x^/2    -> x -= 5 / x *= 2 / x /= 2
  x^0               -> print(x)              (x MUST be a bare identifier)
  Σ(<expr>, i in [a:b]) -> sum(<expr> for i in range(a, b+1))   (range is INCLUSIVE of b)
  i in [a:b]        -> i in range(a, b+1)
  <cond> ? A : B    -> A if <cond> else B
  f(x) => y         -> y = f(x)
  <expr> => target  -> target = <expr>
  <M>(data)         -> np.array(data)
  m^T               -> np.transpose(m)
  list^+[1,2,3]     -> lst = [1, 2, 3]
  i^2               -> i**2                   (exponent MUST be a numeric literal)

Rules:
- Use ONLY the constructs above. If a Python construct (for/while loops, if-blocks) can be rewritten with them (e.g. an accumulation loop over range -> Σ), do so. If it CANNOT be expressed, omit it — return fewer/zero suggestions rather than inventing syntax.
- Ranges are INCLUSIVE: Python range(1, n+1) is EML [1:n]; range(1, 11) is [1:10].
- For each suggestion provide: "eml" (the EML), "targetVariable" (the single variable whose value must be identical before and after), "testBindings" (1-3 strings, each a block of Python assignment lines giving concrete values to EVERY free variable so equivalence can be machine-checked by execution), "rationale", and "confidence" (high/medium/low).
- Prefer the most compact faithful EML. NEVER change program meaning.
Respond with JSON only.`;

const SCHEMA = {
  type: 'object',
  properties: {
    suggestions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          eml: { type: 'string' },
          targetVariable: { type: 'string' },
          testBindings: { type: 'array', items: { type: 'string' } },
          rationale: { type: 'string' },
          confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
        },
        required: ['eml', 'targetVariable', 'testBindings', 'rationale', 'confidence'],
        additionalProperties: false,
      },
    },
  },
  required: ['suggestions'],
  additionalProperties: false,
};

export interface ClaudeClientOptions {
  apiKey?: string;
  model?: string;
}

export class ClaudeClient implements LlmClient {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(options: ClaudeClientOptions = {}) {
    this.client = options.apiKey ? new Anthropic({ apiKey: options.apiKey }) : new Anthropic();
    this.model = options.model ?? 'claude-opus-4-8';
  }

  async suggest(python: string): Promise<RawSuggestion[]> {
    const res = await this.client.messages.create({
      // adaptive thinking shares the budget, so keep max_tokens generous to avoid
      // truncating the JSON mid-stream.
      model: this.model,
      max_tokens: 16000,
      thinking: { type: 'adaptive' },
      output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: `Compress this Python to EML:\n\n${python}` }],
    });
    if (res.stop_reason === 'max_tokens') {
      throw new Error(`LLM response truncated (max_tokens, request ${res._request_id ?? '?'}); increase budget`);
    }
    const textBlock = res.content.find((b) => b.type === 'text');
    const text = textBlock && 'text' in textBlock ? textBlock.text : '{}';
    try {
      const parsed = JSON.parse(text) as { suggestions?: RawSuggestion[] };
      return parsed.suggestions ?? [];
    } catch {
      return [];
    }
  }
}
