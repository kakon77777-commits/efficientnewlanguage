/**
 * Pure tool logic for the EML MCP server — mirrors the site's `/ai/tools/*`
 * REST API's design exactly (same envelope, same 7 tools, same limits) so the
 * two agent surfaces don't diverge. Zero `@modelcontextprotocol/sdk` imports:
 * every function here is `(source) => Envelope`, fully vitest-testable without
 * a protocol connection. `server.ts` is the only file that adapts these onto
 * `McpServer`.
 */
import { createHash, randomUUID } from 'node:crypto';
import type { Diagnostic } from '@eml/types';
import { transpileEmlToPython } from '@eml/transpiler-python';
import { transpilePythonToEml, roundTripFromEml } from '@eml/transpiler-eml';
import { interpret } from '@eml/interp';
import { toJsonl, summarize, findAnomalies } from '@eml/trace';
import {
  MAX_SOURCE_LENGTH,
  MAX_NESTING,
  MAX_EXPONENT,
  MAX_STEPS,
  rawNestingDepth,
  complexityError,
  sanitizeError,
  type ToolErr,
} from './guards';

export type { ToolErr } from './guards';

export const VERSION = {
  eml_lang: 'EML-LANG-2026-v1.0',
  eml_impl: '0.1.0',
  ai_layer_version: '0.1.0',
  tool_version: '0.1.0',
} as const;

export const TOOL_NAMES = [
  'eml.parse',
  'eml.transpile_python',
  'eml.transpile_eml',
  'eml.interpret',
  'eml.trace',
  'eml.roundtrip',
] as const;

const LIMITS = {
  max_source_length: MAX_SOURCE_LENGTH,
  max_nesting_depth: MAX_NESTING,
  max_exponent: MAX_EXPONENT,
  max_eval_steps: MAX_STEPS,
  allow_network: false,
  allow_filesystem: false,
  allow_shell: false,
  arbitrary_code_execution: false,
} as const;

export interface Envelope {
  ok: boolean;
  tool: string;
  version: typeof VERSION;
  input_hash: string;
  result: object | null;
  warnings: ToolErr[];
  errors: ToolErr[];
  trace_id: string;
}

function inputHash(source: string): string {
  return `sha256:${createHash('sha256').update(source).digest('hex')}`;
}

function newTraceId(): string {
  return `eml-trace-${randomUUID()}`;
}

function envelope(
  tool: string,
  input_hash: string,
  trace_id: string,
  ok: boolean,
  result: object | null,
  errors: ToolErr[],
  warnings: ToolErr[],
): Envelope {
  return { ok, tool, version: VERSION, input_hash, result, warnings, errors, trace_id };
}

function errorEnvelope(tool: string, trace_id: string, input_hash: string, errors: ToolErr[]): Envelope {
  return { ok: false, tool, version: VERSION, input_hash, result: null, warnings: [], errors, trace_id };
}

function diagToErr(d: Diagnostic): ToolErr {
  return {
    code: d.code,
    message: d.message,
    position: d.span ? { line: d.span.line, column: d.span.column } : undefined,
    recoverable: d.severity !== 'error',
  };
}

interface Preflight {
  trace_id: string;
  input_hash: string;
  blocked: Envelope | null;
}

/** Shared guard: source-length cap, then raw nesting depth. Same order and
 *  same codes as the REST worker's `handleTool()`. */
function preflight(tool: string, source: string): Preflight {
  const trace_id = newTraceId();
  const input_hash = inputHash(source);
  if (source.length > MAX_SOURCE_LENGTH) {
    return {
      trace_id,
      input_hash,
      blocked: errorEnvelope(tool, trace_id, input_hash, [
        { code: 'E_PAYLOAD_TOO_LARGE', message: `"source" exceeds the ${MAX_SOURCE_LENGTH}-character limit.`, recoverable: false },
      ]),
    };
  }
  if (rawNestingDepth(source) > MAX_NESTING) {
    return {
      trace_id,
      input_hash,
      blocked: errorEnvelope(tool, trace_id, input_hash, [
        { code: 'E_RESOURCE_LIMIT', message: `nesting depth exceeds the ${MAX_NESTING} limit`, recoverable: false },
      ]),
    };
  }
  return { trace_id, input_hash, blocked: null };
}

/** Pre-evaluation complexity check for interpret/trace, run only when the
 *  program compiles (a program that fails to compile can't run away — its
 *  diagnostics are a normal ok:false result, not a resource-limit rejection). */
function complexityGuard(tool: string, source: string, trace_id: string, input_hash: string): Envelope | null {
  const pre = transpileEmlToPython(source);
  if (!pre.ok) return null;
  const reason = complexityError(pre.ast);
  if (!reason) return null;
  return errorEnvelope(tool, trace_id, input_hash, [{ code: 'E_RESOURCE_LIMIT', message: reason, recoverable: false }]);
}

export function parse(source: string): Envelope {
  const tool = 'eml.parse';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const t = transpileEmlToPython(source);
    const errors = t.diagnostics.filter((d) => d.severity === 'error').map(diagToErr);
    const warnings = t.diagnostics.filter((d) => d.severity === 'warning').map(diagToErr);
    const result = { ast: t.ast, normalized: t.normalized, tokenCount: t.tokens.length };
    return envelope(tool, input_hash, trace_id, t.ok, result, errors, warnings);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function transpilePython(source: string): Envelope {
  const tool = 'eml.transpile_python';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const t = transpileEmlToPython(source);
    const errors = t.diagnostics.filter((d) => d.severity === 'error').map(diagToErr);
    const warnings = t.diagnostics.filter((d) => d.severity === 'warning').map(diagToErr);
    const result = {
      python: t.python,
      imports: t.imports,
      metadata: {
        symbolsUsed: t.metadata.symbolsUsed,
        declaredNames: t.metadata.declaredNames,
        emlLines: t.metadata.emlLines,
        pythonLines: t.metadata.pythonLines,
      },
    };
    return envelope(tool, input_hash, trace_id, t.ok, result, errors, warnings);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function transpileEml(source: string): Envelope {
  const tool = 'eml.transpile_eml';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const r = transpilePythonToEml(source);
    const errors: ToolErr[] = r.ok ? [] : [{ code: 'E_PARSE', message: r.error || 'reverse Python->EML failed', recoverable: true }];
    return envelope(tool, input_hash, trace_id, r.ok, { eml: r.eml }, errors, []);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function interpretTool(source: string): Envelope {
  const tool = 'eml.interpret';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const guardHit = complexityGuard(tool, source, trace_id, input_hash);
    if (guardHit) return guardHit;
    const i = interpret(source, { maxSteps: MAX_STEPS });
    const errors = i.diagnostics.filter((d) => d.severity === 'error').map(diagToErr);
    if (i.error) errors.push({ code: i.error.type || 'E_RUNTIME', message: i.error.message, recoverable: false });
    const result = { output: i.output, outputLines: i.outputLines, unsupported: i.unsupported, eventCount: i.events.length };
    return envelope(tool, input_hash, trace_id, i.ok, result, errors, []);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function traceTool(source: string): Envelope {
  const tool = 'eml.trace';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const guardHit = complexityGuard(tool, source, trace_id, input_hash);
    if (guardHit) return guardHit;
    const i = interpret(source, { maxSteps: MAX_STEPS });
    const anomalies = findAnomalies(i.events);
    const errors = i.diagnostics.filter((d) => d.severity === 'error').map(diagToErr);
    if (i.error) errors.push({ code: i.error.type || 'E_RUNTIME', message: i.error.message, recoverable: false });
    const result = { jsonl: toJsonl(i.events), summary: summarize(i.events), anomalies, eventCount: i.events.length };
    return envelope(tool, input_hash, trace_id, i.ok, result, errors, []);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function roundtrip(source: string): Envelope {
  const tool = 'eml.roundtrip';
  const pre = preflight(tool, source);
  if (pre.blocked) return pre.blocked;
  const { trace_id, input_hash } = pre;
  try {
    const r = roundTripFromEml(source);
    // Errors/warnings stay [] for this tool always — failure is communicated
    // purely via result.ok/result.message, matching the REST tool's behavior.
    return envelope(tool, input_hash, trace_id, r.ok, { ok: r.ok, steps: r.steps, message: r.message }, [], []);
  } catch (err) {
    return errorEnvelope(tool, trace_id, input_hash, [sanitizeError(err)]);
  }
}

export function health(): Envelope {
  const tool = 'eml.tools/health';
  const trace_id = newTraceId();
  const result = {
    status: 'healthy',
    version: VERSION,
    trace_proto: 'phosphor-jsonl-v1',
    tools: TOOL_NAMES,
    limits: LIMITS,
  };
  return envelope(tool, '', trace_id, true, result, [], []);
}
