import type {
  Cts,
  CtsNode,
  CtsSymbolEntry,
  CtsFunction,
  CtsLoop,
  Program,
  Statement,
  Expression,
} from '@eml/types';
import { EML_SYMBOLS } from '@eml/symbols';
import { emitStatement, aliasIdentifier } from '@eml/transpiler-python';

/** The producing (right-hand-side) expression text, dropping a trailing `=> target`. */
function producingExpression(statementSource: string): string {
  const idx = statementSource.indexOf('=>');
  return idx >= 0 ? statementSource.slice(0, idx).trim() : statementSource;
}

export interface CtsInput {
  fileName: string;
  /** ASCII-canonical source (for slicing node spans). */
  normalized: string;
  /** Resolved program (post semantic analysis). */
  program: Program;
  /** EML symbols encountered, from the semantic result. */
  symbolsUsed: string[];
  /** Per-function cold/hot + crystallization + importance metadata (Phase 2). */
  functions?: CtsFunction[];
  /** Per-loop kind + determinism/termination metadata (Phase 4). */
  loops?: CtsLoop[];
}

const COMMENT_BY_TYPE: Record<string, string> = {
  'control.output': '輸出指定值',
  'algebraic.sum': '對區間求和',
  'binding.assignment': '變數指派',
  'binding.augmented': '複合賦值',
  'binding.call': '函式呼叫並指派',
  'list.literal': '建立列表',
  'dict.literal': '建立字典',
  'set.literal': '建立集合',
  'linear.matrix': '建立矩陣／陣列',
  'linear.transpose': '矩陣轉置',
  'control.conditional': '條件運算式',
  'range.membership': '範圍成員判斷',
  'function.cold': '冷邏輯函數（可快取純函數）',
  'function.hot': '熱狀態函數（動態狀態）',
  'function.def': '函數定義',
  'control.temporal': '時間迴圈（等待條件成熟，不 busy wait）',
  'control.return': '回傳值',
  'control.if': '條件分支（if/elif/else）',
  'control.while': 'while 迴圈',
  'control.for': 'for 迴圈（走訪可疊代對象）',
  'control.break': '跳出迴圈',
  'control.continue': '跳到下一次迴圈',
  'control.import': '匯入模組',
  'control.try': '例外處理（try/except/finally）',
  'control.raise': '拋出例外',
  'class.def': '類別定義',
  expression: '運算式',
};

function collectIdents(expr: Expression, acc: Set<string>): void {
  switch (expr.type) {
    case 'Identifier':
      acc.add(expr.name);
      break;
    case 'NumberLiteral':
    case 'StringLiteral':
      break;
    case 'Power':
      collectIdents(expr.base, acc);
      collectIdents(expr.exponent, acc);
      break;
    case 'Binary':
    case 'Comparison':
      collectIdents(expr.left, acc);
      collectIdents(expr.right, acc);
      break;
    case 'Conditional':
      collectIdents(expr.test, acc);
      collectIdents(expr.consequent, acc);
      collectIdents(expr.alternate, acc);
      break;
    case 'Range':
      collectIdents(expr.start, acc);
      collectIdents(expr.end, acc);
      break;
    case 'Sum':
      collectIdents(expr.expr, acc);
      collectIdents(expr.range, acc);
      break;
    case 'Membership':
      collectIdents(expr.element, acc);
      collectIdents(expr.collection, acc);
      break;
    case 'Call':
      if (expr.callee.type === 'Identifier') acc.add(expr.callee.name);
      else collectIdents(expr.callee, acc); // Attribute callee -> its object identifier
      for (const a of expr.args) collectIdents(a, acc);
      break;
    case 'Matrix':
      collectIdents(expr.data, acc);
      break;
    case 'Transpose':
      collectIdents(expr.operand, acc);
      break;
    case 'List':
      for (const e of expr.elements) collectIdents(e, acc);
      break;
    case 'Await':
      collectIdents(expr.argument, acc);
      break;
    case 'Dict':
      for (const e of expr.entries) {
        collectIdents(e.key, acc);
        collectIdents(e.value, acc);
      }
      break;
    case 'Set':
      for (const e of expr.elements) collectIdents(e, acc);
      break;
    case 'Subscript':
      collectIdents(expr.object, acc);
      collectIdents(expr.index, acc);
      break;
    case 'Attribute':
      collectIdents(expr.object, acc);
      break;
  }
}

function semanticTypeOf(stmt: Statement): string {
  switch (stmt.type) {
    case 'Output':
      return 'control.output';
    case 'AugmentedAssign':
      return 'binding.augmented';
    case 'Assignment':
      switch (stmt.value.type) {
        case 'Sum':
          return 'algebraic.sum';
        case 'Call':
          return 'binding.call';
        case 'List':
          return 'list.literal';
        case 'Dict':
          return 'dict.literal';
        case 'Set':
          return 'set.literal';
        case 'Matrix':
          return 'linear.matrix';
        case 'Transpose':
          return 'linear.transpose';
        default:
          return 'binding.assignment';
      }
    case 'ExpressionStatement':
      switch (stmt.expression.type) {
        case 'Conditional':
          return 'control.conditional';
        case 'Membership':
          return 'range.membership';
        case 'Transpose':
          return 'linear.transpose';
        case 'Matrix':
          return 'linear.matrix';
        case 'Sum':
          return 'algebraic.sum';
        default:
          return 'expression';
      }
    case 'FunctionDef':
      if (stmt.decorators.some((d) => d.name === 'temporal_loop')) return 'control.temporal';
      return stmt.temperature === 'cold'
        ? 'function.cold'
        : stmt.temperature === 'hot'
          ? 'function.hot'
          : 'function.def';
    case 'Return':
      return 'control.return';
    case 'OverlayAssign':
      return 'binding.assignment';
    case 'If':
      return 'control.if';
    case 'While':
      return 'control.while';
    case 'ForIn':
      return 'control.for';
    case 'Break':
      return 'control.break';
    case 'Continue':
      return 'control.continue';
    case 'Import':
      return 'control.import';
    case 'Try':
      return 'control.try';
    case 'Raise':
      return 'control.raise';
    case 'ClassDef':
      return 'class.def';
  }
}

function statementValue(stmt: Statement): Expression | null {
  switch (stmt.type) {
    case 'Assignment':
    case 'AugmentedAssign':
    case 'OverlayAssign':
      return stmt.value;
    case 'Output':
      return stmt.value;
    case 'ExpressionStatement':
      return stmt.expression;
    case 'Return':
      return stmt.value ?? null;
    case 'FunctionDef':
      return null;
    case 'If':
      return stmt.test;
    case 'While':
      return stmt.test;
    case 'ForIn':
      return stmt.iterable;
    case 'Break':
    case 'Continue':
    case 'Import':
    case 'Try':
    case 'ClassDef':
      return null;
    case 'Raise':
      return stmt.exception ?? null;
  }
}

function bindingTarget(stmt: Statement): string | null {
  switch (stmt.type) {
    case 'Assignment':
    case 'AugmentedAssign':
      // A Subscript target (Phase 7b: `d[k] = v`) mutates an existing object
      // rather than binding a name — no cross-ref entry for it.
      return stmt.target.type === 'Identifier' ? stmt.target.name : null;
    case 'OverlayAssign':
      return stmt.target.name;
    default:
      return null;
  }
}

export function generateCts(input: CtsInput): Cts {
  const { fileName, normalized, program, symbolsUsed, functions = [], loops = [] } = input;

  const symbols: Record<string, CtsSymbolEntry> = {};
  for (const s of symbolsUsed) {
    const def = EML_SYMBOLS[s];
    if (!def) continue;
    symbols[s] = { type: def.category, meaning: def.name, target: def.python };
  }

  const nodes: CtsNode[] = [];
  const commentTable: Record<string, string> = {};
  const crossRefTable: Record<string, string[]> = {};

  program.body.forEach((stmt, i) => {
    const id = `node_${String(i + 1).padStart(3, '0')}`;
    const source =
      stmt.span !== undefined
        ? normalized.slice(stmt.span.start, stmt.span.end).trim()
        : '';
    const python = emitStatement(stmt);

    const value = statementValue(stmt);
    const deps = new Set<string>();
    if (value) collectIdents(value, deps);

    const semanticType = semanticTypeOf(stmt);
    // Dependencies use emitted (aliased) Python names so they cross-reference
    // the `python` field; node.source keeps the raw EML.
    nodes.push({ id, source, python, dependencies: [...deps].map(aliasIdentifier), semanticType });
    commentTable[id] = COMMENT_BY_TYPE[semanticType] ?? '運算式';

    const target = bindingTarget(stmt);
    if (target) {
      // crossRefTable maps the emitted identifier -> the producing expression(s).
      (crossRefTable[aliasIdentifier(target)] ??= []).push(producingExpression(source));
    }
  });

  return { file: fileName, symbols, nodes, functions, loops, commentTable, crossRefTable };
}
