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

---

## Phase 6：控制流程語法（if/elif/else, while, for...in）— 已完成

實戰驗證發現：Phase 0–5 雖然「MVP 完成度已高」，但語法本身仍缺少 `if`/`while`/`for`、`class`、
`try/except`、dict/set 字面量、使用者 `import` —— 今天能寫的 EML 程式實際上只限於算術/加總/矩陣/
cold-hot 函式管線，**還不是一個能表達一般用途程式的語言**。在投入下面「Phase 7 商用化/實用層」
（LSP、編輯器外掛、npm 發佈等）之前，先把這個更根本的缺口補上。

本輪只加最小可行的控制流程集合：`if/elif/else`、`while`、`for...in`。Dict/set 字面量、
`try/except`、`class`、使用者 `import`、`break`/`continue` 明確排除在本輪之外（延後，非拒絕），
延續專案自己的漸進式 MVP 哲學（「先 14 個可跑案例，再擴展語法系統」）。

- AST 新增 `IfStatement`/`WhileStatement`/`ForInStatement`（`elif` 以巢狀 `IfStatement` 表示,
  對齊 Python 自己的 `ast.If` chaining）。
- Parser 重用既有的 `parseBlock()`/INDENT-DEDENT 機制（原本只給 `def` 用）。
- Semantic pass 的分支作用域修正：`if`/`elif`/`else` 各分支需各自 clone scope 解析再合併回去，
  否則會把只在某一分支宣告的變數誤判成另一分支「已宣告」，導致實際執行時的 `NameError`。
  `while`/`for` 不需要這個處理（非互斥的 0+ 次執行，沿用同一個 live scope）。
- `purity.ts`/`importance.ts`/`loop-classifier.ts` 都需要新增遞迴（這些是非窮盡檢查的
  `void` traversal，編譯器不會提醒），否則藏在分支/迴圈內的副作用會讓 `@cold` 函式被誤判為
  可快取。
- `@eml/interp` 加上真正的分支/迴圈執行語意；C⁺⁺⁺ 與反向 Python→EML 本輪維持 fail-loud
  （非本輪目標）。
- 363 個測試（原 305 + 新增 golden fixtures 16–20 + `tests/phase6-control-flow.test.ts` +
  7 個直譯器 execution-truth 案例 + 3 個新 `examples/phase6-control-flow/` 範例）。

詳見 `docs/agent-handoff.md`「Phase 6」章節與 `docs/EML-LANG-2026-v1.0.md` §6a（附加式變更,
未破壞 v1.0 凍結的既有語意）。

---

## Phase 7：商用化與實用層（Commercialization）

Phase 0–6 已完成：語言（含 Phase 6 控制流程）、雙向轉譯、冷熱/結晶化、時間迴圈、loopKind/C⁺⁺⁺、執行真相直譯器 + PHOSPHOR trace、CLI、Cogni-Editor、`EML-LANG-2026-v1.0` 規格、363 測試、Apache-2.0 開源、以及工程版 + 華麗版雙站。MVP 完成度已高。

Phase 7 的命題不是「再加語言功能」，而是把強 MVP 推進到**真正可商用、可實用**：**先讓人能用 → 再讓 AI 能用 → 再讓它能賺。**

### A. 實用化（降低採用門檻）
1. **LSP 語言伺服器** — hover 顯示 Python 展開、即時診斷、跳轉、inline trace（「能在真專案用」的最大解鎖）。
2. **編輯器外掛** — 將 Cogni-Editor 化為 VS Code / JetBrains extension（語法、Nova IME、一鍵 transpile/trace）。
3. **好裝好跑** — `@eml/*` 發佈到 npm、`npx eml`、單檔 `eml` 執行檔（Node SEA）、Python 端 runtime helper。
4. **擴大支援子集** — 從 Python 子集往真實程式碼覆蓋率推進（更多語法/後端落地，而非僅 prototype）。

### B. 可信度規模化
5. **公開 conformance suite + fuzz / property testing** — 將 round-trip 與 execution-truth 閘控放大為可被外部驗證的標準。
6. **真實語料驗證** — 於真實 Python 專案量測壓縮率／round-trip 等價率（白皮書 §11 KPI）。
7. **AI 路徑安全/沙箱強化** — suggest/compress 服務化前的硬化。

### C. AI / Agent 層（核心差異化與商業楔子）
8. **MCP server / Agent 工具** — 讓 AI agent 能讀寫 EML、消費 phosphor trace。
9. **AI 輔助壓縮即服務** — validator 閘控過的 Python→EML 壓縮 API（白皮書 §13 保留商業模組）。

### D. PHOSPHOR / 可觀測性（往企業走）
10. **trace → 企業稽核/政策/合規層**（execution-truth 作為 audit/policy 基礎）。

### E. 商業模式與生態
11. **開放核心切線落地** — 明確免費 vs 商業（進階編輯器、團隊 Agent 工作流、企業稽核、AI 服務、大型符號庫管理）與定價分層。
12. **CLA + 貢獻指南 + 公開 roadmap** — 接住外部貢獻（Apache 已就位）。
13. **發表與內容** — 技術社群發表、教學、案例、符號庫社群包。
14. **北極星指標** — 例如「agent 成功以 EML 完成任務的比率」或真實專案壓縮/等價率，用以導向後續取捨。

### 建議優先序（先挑三個）
**A‑1 LSP（實用門檻）→ C‑8 MCP/Agent 工具（差異化變現）→ E‑11 開放核心定價（商業模式）。**

> 完成標準（Phase 7）：開發者可在自己的編輯器中以 EML 工作；AI agent 可透過工具讀寫 EML 與其 trace；開放核心與商業模組界線清楚、可定價。

