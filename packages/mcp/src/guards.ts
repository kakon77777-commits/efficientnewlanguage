/**
 * Resource guards mirroring the site's `/ai/tools/*` REST worker
 * (D:\Ai\網站群\高效新語言\新版\worker\index.ts, a separate repo) so both agent
 * surfaces — REST for arbitrary HTTP clients, MCP for AI agents — enforce the
 * same limits on the same underlying toolchain. Reimplemented fresh here since
 * that worker can't be imported across repos.
 */

export const MAX_SOURCE_LENGTH = 20_000;
// Integer arithmetic in @eml/interp is arbitrary-precision, so a tiny program
// can request an astronomically large number (e.g. r ** 1e9) and exhaust
// CPU/memory — these caps are enforced statically before evaluation.
export const MAX_NESTING = 256; // raw bracket/paren depth, checked before parse (bounds parser recursion)
export const MAX_EXPONENT = 4096; // largest literal power exponent
export const MAX_GROWTH_LOG2 = 20; // log2 of the cumulative integer-magnitude multiplier (interpret/trace)
export const MAX_RANGE_SPAN = 5_000_000; // largest literal inclusive-range span
export const MAX_STEPS = 2_000_000; // interpreter evaluation-step budget (loop iterations + calls)

export interface ToolErr {
  code: string;
  message: string;
  position?: { line: number; column: number };
  recoverable?: boolean;
}

/** Cheap pre-parse guard: maximum bracket/paren nesting in the raw source. The
 *  recursive-descent parser has no depth limit, so deeply nested input would
 *  overflow the stack (a RangeError); reject it up front with a clean code. */
export function rawNestingDepth(s: string): number {
  let depth = 0;
  let max = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(' || c === '[' || c === '{') {
      if (++depth > max) max = depth;
    } else if (c === ')' || c === ']' || c === '}') {
      if (depth > 0) depth--;
    }
  }
  return max;
}

/** Static magnitude guard for the executing tools (interpret/trace). Integer
 *  arithmetic is exact (BigInt), so bound the cumulative bit-growth from
 *  powers and self-multiplication before evaluating. Returns a reason string
 *  when the program is rejected, or null when it's within bounds. */
export function complexityError(ast: unknown): string | null {
  let growthLog2 = 0;
  let reason: string | null = null;
  const isNumLit = (n: any): boolean => n && n.type === 'NumberLiteral';
  const visit = (node: any, depth: number): void => {
    if (reason || !node || typeof node !== 'object') return;
    if (depth > MAX_NESTING) {
      reason = 'expression nesting too deep';
      return;
    }
    const ty = node.type;
    if (ty === 'Power' && isNumLit(node.exponent)) {
      const e = Math.abs(node.exponent.value);
      if (e > MAX_EXPONENT) {
        reason = `exponent ${e} exceeds the ${MAX_EXPONENT} limit`;
        return;
      }
      growthLog2 += Math.log2(Math.max(2, e));
    } else if ((ty === 'AugmentedAssign' || ty === 'OverlayAssign') && node.op === '*' && !isNumLit(node.value)) {
      growthLog2 += 1; // x *= <non-constant> can square a growing value
    } else if (ty === 'Binary' && node.op === '*' && !isNumLit(node.left) && !isNumLit(node.right)) {
      growthLog2 += 1;
    } else if (ty === 'Range' && isNumLit(node.start) && isNumLit(node.end)) {
      if (Math.abs(node.end.value - node.start.value) > MAX_RANGE_SPAN) {
        reason = 'range span exceeds the sandbox limit';
        return;
      }
    }
    if (growthLog2 > MAX_GROWTH_LOG2) {
      reason = 'integer magnitude exceeds the sandbox limit';
      return;
    }
    for (const k in node) {
      const v = node[k];
      if (Array.isArray(v)) {
        for (const x of v) visit(x, depth + 1);
      } else if (v && typeof v === 'object') {
        visit(v, depth + 1);
      }
    }
  };
  visit(ast, 0);
  return reason;
}

/** Never echo raw host-engine messages (V8 "Maximum call stack size exceeded",
 *  "Maximum BigInt size exceeded") to clients — map them to a stable domain code. */
export function sanitizeError(err: unknown): ToolErr {
  const msg = err instanceof Error ? err.message : String(err);
  if (err instanceof RangeError || /call stack|BigInt|too large|Maximum/i.test(msg)) {
    return { code: 'E_RESOURCE_LIMIT', message: 'input too complex or computed result too large', recoverable: false };
  }
  return { code: 'E_INTERNAL', message: 'internal error while processing source', recoverable: false };
}
