# EML 2026 MVP 開發路線圖 v0.1

EML MVP 第一階段不是要完成終極程式語言，而是要完成一個「可輸入、可解析、可轉譯、可執行、可測試、可展示、可被 AI Agent 接手」的語意附加轉譯器。

第一個閉環：

```text id="k4o9zi"
EML / Py⁺ source
    ↓
Unicode normalization
    ↓
Lexer
    ↓
Parser
    ↓
AST
    ↓
Semantic analyzer
    ↓
Python emitter
    ↓
Golden tests
    ↓
CLI demo
    ↓
CTS export
    ↓
Cogni-Editor / PHOSPHOR-ready data
```

## MVP 成功定義

以下指令可以成功：

```bash id="9qbl3o"
pnpm install
pnpm test
pnpm build
pnpm eml transpile examples/sum.eml -o examples/sum.py
pnpm eml run examples/sum.eml
pnpm eml ast examples/sum.eml -o examples/sum.ast.json
pnpm eml cts examples/sum.eml -o examples/sum.cts.json
```

最小 demo：

```eml id="ylgqj7"
N^+100
Σ(i^2, i in [1:N]) => r
r^0
```

輸出：

```text id="15d2a5"
338350
```

生成 Python：

```python id="i2r6ev"
N = 100
r = sum(i**2 for i in range(1, N+1))
print(r)
```

## 三 Agent 分工

| Agent   | 責任                                                                       |
| ------- | ------------------------------------------------------------------------ |
| Agent A | Normalizer、Lexer、Parser、AST、Parser tests                                 |
| Agent B | Semantic analyzer、Symbol table、Python emitter、Golden tests、Runtime tests |
| Agent C | CLI、CTS generator、Examples、README、CI、Demo script                         |

## 開發順序

```text id="9m4z55"
先轉譯器
再編輯器

先 Py⁺
再 C⁺⁺⁺

先 deterministic rules
再 AI converter

先 ASCII canonical
再 Unicode projection

先 CLI demo
再 IDE / Agent OS

先 14 cases
再 Ultimate features
```
