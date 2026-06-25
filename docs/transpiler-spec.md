# EML / Py⁺ → Python 轉譯器工程規格 v0.1

> **語言參考已由 [`EML-LANG-2026-v1.0.md`](EML-LANG-2026-v1.0.md)（v1.0，normative）統一。**
> 本文件為 Phase-0 的管線／架構工程規格（lexer→parser→AST→semantic→emit→format），非語言參考。

第一階段轉譯器的任務不是完成完整程式語言，而是完成以下閉環：

```text id="1qh466"
EML / Py⁺ Source
    ↓
Unicode Normalizer
    ↓
Lexer
    ↓
Parser
    ↓
AST
    ↓
Semantic Analyzer
    ↓
Python Transpiler
    ↓
Python Formatter
    ↓
Python Source
    ↓
Golden Test / Run Test / CTS Export
```

MVP 必須至少跑通 14 個核心測試案例，並提供穩定 CLI：

```bash id="lffwkr"
eml transpile input.eml -o output.py
eml run input.eml
eml ast input.eml -o ast.json
eml cts input.eml -o cts.json
eml check input.eml
```

## 核心原則

同樣的 EML source 必須永遠產生同樣的 Python output。

轉譯器不得依賴 AI 即時生成核心語法結果。AI 可在未來作為輔助壓縮、修復、refactor 工具，但 v0.1 的核心轉譯必須是 deterministic rule-based transpilation。

## 高階流程

```ts id="d0em4j"
export function transpileEmlToPython(
  source: string,
  options?: TranspileOptions
): TranspileResult {
  const normalized = normalizeSource(source, options);
  const tokens = lex(normalized.code, options);
  const ast = parseProgram(tokens, options);
  const semantic = analyzeSemantics(ast, options);
  const python = emitPython(ast, semantic, options);
  const formatted = formatPython(python, options);

  return {
    ok: semantic.diagnostics.every(d => d.severity !== "error"),
    source,
    normalized,
    tokens,
    ast,
    semantic,
    python: formatted,
    diagnostics: semantic.diagnostics,
    metadata: buildTranspileMetadata(...)
  };
}
```

## 分層原則

| Layer             | Responsibility                            | 不應處理         |
| ----------------- | ----------------------------------------- | ------------ |
| Normalizer        | Unicode → ASCII canonical                 | 語法分析         |
| Lexer             | source → tokens                           | AST 結構       |
| Parser            | tokens → AST                              | symbol table |
| Semantic Analyzer | symbol resolution / imports / diagnostics | Python 字串輸出  |
| Python Transpiler | AST → Python fragments                    | tokenization |
| Formatter         | 穩定格式化                                     | 語意改寫         |
| CTS Generator     | AST + semantic → CTS                      | Python emit  |

## 成功標準

```text id="9z0066"
能讀 EML
能產 AST
能做語意判定
能輸出 Python
能執行
能測試
能產 CTS
能被 Agent 修改
```
