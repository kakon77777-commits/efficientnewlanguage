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
cold-hot 函式管線，**還不是一個能表達一般用途程式的語言**。在投入「Phase 8 商用化/實用層」
（LSP、編輯器外掛、npm 發佈等）之前，先把這個更根本的缺口補上（Phase 7 補完，見下）。

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

## Phase 7：語法完備化（break/continue, dict/set/subscript, attribute/import, try/except/raise, class）— 已完成

Phase 6 補上了分支/迴圈，但使用者再次確認（連續強調兩次）：「繼續補語法。補到真正能寫一般用途程式。」
盤點後確認 Phase 6 仍缺 5 塊：跳出迴圈（`break`/`continue`）、鍵值集合（dict/set + subscript）、
屬性存取與使用者 `import`、例外處理（`try`/`except`/`finally`/`raise`）、使用者自訂型別（`class`）。
本輪依序（7a→7b→7c→7d→7e）補齊全部五塊，每塊都是完整垂直切片（AST/token/lexer/parser → Python
emission/semantic/purity/importance/loop-classifier/CTS → interpreter → tests），每塊完成後
`pnpm typecheck` + `pnpm test` 全綠才進下一塊。

- **共用基礎設施**：EML 原生沒有 `target = value` 語法（`=` 已被單獨佔用為相等比較）。解法是延伸既有
  `=>` 箭頭寫法的目標端，從「單一裸識別字」擴充為 `IDENT ('[' Expr ']' | '.' IDENT)*` 鏈式目標，讓
  `v => d[k]` / `v => self.x` 自然成立；目標優先的複合賦值（`d[k] += v`）則新增 `+=`/`-=`/`*=`/`/=`
  token。`AssignTarget` 型別漸進擴增（7b 加 Subscript、7c 加 Attribute），讓每次擴增都是可獨立驗證
  的小 diff。
- **7a（break/continue）**：比照既有 `return`-outside-function 的作法，語意層新增 `inLoop` 追蹤，
  產生 `E_BREAK_OUTSIDE_LOOP`/`E_CONTINUE_OUTSIDE_LOOP`；直譯器用 `BreakSignal`/`ContinueSignal`
  兩個訊號類別（風格對齊既有的 `ReturnSignal`/`Unsupported`）。
- **7b（dict/set 字面量 + subscript）**：`{k: v, ...}` 為 dict、`{v, ...}` 為 set（空 `{}` 依 Python
  慣例視為 dict）。**唯一真正細膩之處**：Python 視 `1`/`1.0`/`True` 為同一把 dict/set 鍵
  （`hash(1)==hash(1.0)==hash(True)`），新增 `canonicalKey()` 正規化數值型別以符合這個規則。
- **7c（屬性存取 + 使用者 `import`）**：`obj.attr`／`obj.method(args)`；`import module` 僅支援單一
  裸模組名稱（無 `from x import y`、無 `as`、無多層路徑）。直譯器對任何屬性呼叫/讀取一律回報
  `Unsupported`（與 numpy/temporal 現有機制相同）——真正的 instance 派發留給 7e。
- **7d（try/except/finally + raise）**：作用域處理是本輪最細膩的部分：`try` 主體可能執行到一半就
  拋出例外，因此比 if/else 的分支 clone 更需要保守——`try` 主體與每個 `except` handler 都各自 clone
  作用域（handler clone 的是「try 之前」的原始作用域，而非 try 主體的 clone）。直譯器完全依賴原生
  JS `try/finally` 實作 Python 的 `finally` 保證，無需手動追蹤「待處理例外」旗標。
- **7e（class，本輪份量最大單項）**：最小可行 OOP——無繼承、無 method decorator、除 `__init__`
  外無 dunder。**真正發現的正確性風險**：`fnRecords`（餵給 purity/importance/crystallization）是
  用裸函式名稱、全程式範圍地建立索引的——兩個無關類別各自定義 `__init__` 會互相碰撞。解法：新增
  `resolveMethod()`（平行於 `resolveFunction()`，但刻意不推入 `fnRecords`）——這個決策已用「暫時改
  回去、確認測試真的會失敗、再改回來」的方式驗證過是真的必要。直譯器新增本輪唯一的全新 PyVal
  變體：`{k:'class', ...}` / `{k:'instance', ..., attrs: Map}`。
- 512 個測試（原 363 + 每個子階段各自的測試檔 `phase7a`–`phase7e` + golden fixtures 21–29 +
  `interp.test.ts` 新增案例）。手寫的 CLI smoke test（class + for/continue + try/except，包在一起）
  通過 `eml trace --run` 的 `eml:equiv` 閘門，證明直譯器與真正 Python 逐位元組一致。

詳見 `docs/agent-handoff.md`「Phase 7」章節與 `docs/EML-LANG-2026-v1.0.md` §6b/§11（附加式變更，
未破壞 v1.0 凍結的既有語意）。

---

## Phase 8：商用化與實用層（Commercialization）

Phase 0–7 已完成：語言（含 Phase 6 控制流程 + Phase 7 語法完備化：break/continue、dict/set/subscript、
attribute/import、try/except/raise、class）、雙向轉譯、冷熱/結晶化、時間迴圈、loopKind/C⁺⁺⁺、執行
真相直譯器 + PHOSPHOR trace、CLI、Cogni-Editor、`EML-LANG-2026-v1.0` 規格、512 測試、Apache-2.0
開源、以及工程版 + 華麗版雙站。語言本身已可表達一般用途程式，MVP 完成度已高。

Phase 8 的命題不是「再加語言功能」，而是把強 MVP 推進到**真正可商用、可實用**：**先讓人能用 → 再讓 AI 能用 → 再讓它能賺。**

### A. 實用化（降低採用門檻）
1. **LSP 語言伺服器 — 已完成（MVP）2026-07-14。** `@eml/lsp`（`packages/lsp`，標準 `vscode-languageserver`/-textdocument，editor-agnostic）+ 最小 VS Code 外掛（`packages/vscode-extension`，dev prototype，非上架）。範圍：即時診斷（直接復用 `transpileEmlToPython` 的 `Diagnostic[]`）、hover 顯示游標所在敘述句的 Python 展開（復用既有 `emitStatement()`）、completion（`EML_SYMBOLS` + 20 個關鍵字）。明確排除本輪：跳轉/go-to-definition（需要語意分析器新增逐識別字宣告 span，非本輪範圍）、inline trace 視覺化（屬於「編輯器外掛」項目，非 LSP 伺服器本身）、Unicode 顯示形式（`Σ`/`∈`/`⇒`/`²`…）的診斷/hover 位置精確度（ASCII 標準形式優先，符合語言本身的規範立場）。535 測試（含一個真正的 protocol-level in-process 整合測試，證明 `vscode-languageserver` 連線真的能跑，不只是純邏輯單元測試）。詳見 `docs/agent-handoff.md`「Phase 8 — LSP」章節。
2. **編輯器外掛** — 將 Cogni-Editor 化為 VS Code / JetBrains extension（語法、Nova IME、一鍵 transpile/trace）。上面的 `packages/vscode-extension` 只是「證明能動」的最小雛形（無 icon、無上架準備、無 inline trace webview）——真正的外掛打磨仍是這一項的範圍。
3. **好裝好跑** — `@eml/*` 發佈到 npm、`npx eml`、單檔 `eml` 執行檔（Node SEA）、Python 端 runtime helper。
4. **擴大支援子集** — 從 Python 子集往真實程式碼覆蓋率推進（更多語法/後端落地，而非僅 prototype）。

### B. 可信度規模化
5. **公開 conformance suite + fuzz / property testing — 已完成（MVP）2026-07-16。** `docs/conformance.md`
   把既有的兩層閘控包裝成外部可驗證的標準：Layer 1 `tests/fixtures/`（29 個逐構造 EML→Python 精確
   文字對照，涵蓋 Phase 0–7 全部語法，`pnpm eml test` 免 vitest 即可外部執行）+ Layer 2 `examples/`
   （完整可執行程式的 `eml:equiv` 執行真相對照，`eml trace <file> --run`）。新增一個真正 spawn 真實
   CLI process 的測試（`tests/cli-conformance.test.ts`），證明 `eml test` 指令本身（非僅內部函式）
   確實如文件所述運作。fuzz/property testing 本輪未做（範圍外，留待未來）。詳見 `docs/conformance.md`。
6. **真實語料驗證** — 於真實 Python 專案量測壓縮率／round-trip 等價率（白皮書 §11 KPI）。
7. **AI 路徑安全/沙箱強化** — suggest/compress 服務化前的硬化。

### C. AI / Agent 層（核心差異化與商業楔子）
8. **MCP server / Agent 工具 — 已完成（MVP）2026-07-16。** `@eml/mcp`（`packages/mcp`）：7 個工具
   （`parse`/`transpile_python`/`transpile_eml`/`interpret`/`trace`/`roundtrip`/`health`），完全鏡像
   網站 `/ai/tools/*` REST API 的設計（同一套 envelope、同一批工具、同一組資源限制），讓 REST（給任意
   HTTP client）與 MCP（給 AI agent）兩個介面不會走岔。工具層錯誤（編譯失敗、round-trip 不一致）一律是
   正常的 `ok:false` 結果，不是 protocol-level 錯誤——讓 agent 能讀 `errors[]` 自行修正。repo 根目錄
   `.mcp.json` 已接上（Claude Code 可直接重連此 repo 使用 `mcp__eml__*` 工具）。559 測試（含一個真正
   在真實 stdio entry point 上手動驗證過的 in-process protocol 整合測試）。詳見
   `docs/agent-handoff.md`「Phase 8 — MCP」章節。
9. **AI 輔助壓縮即服務** — validator 閘控過的 Python→EML 壓縮 API（白皮書 §13 保留商業模組）。

### D. PHOSPHOR / 可觀測性（往企業走）
10. **trace → 企業稽核/政策/合規層**（execution-truth 作為 audit/policy 基礎）。

### E. 商業模式與生態
11. **開放核心切線落地** — 明確免費 vs 商業（進階編輯器、團隊 Agent 工作流、企業稽核、AI 服務、大型符號庫管理）與定價分層。
12. **CLA + 貢獻指南 + 公開 roadmap** — 接住外部貢獻（Apache 已就位）。
13. **發表與內容** — 技術社群發表、教學、案例、符號庫社群包。
14. **北極星指標** — 例如「agent 成功以 EML 完成任務的比率」或真實專案壓縮/等價率，用以導向後續取捨。

### 建議優先序（先挑三個）
**A‑1 LSP（實用門檻，已完成）→ C‑8 MCP/Agent 工具（差異化變現，已完成）→ E‑11 開放核心定價（商業模式）。**

> 完成標準（Phase 8）：開發者可在自己的編輯器中以 EML 工作；AI agent 可透過工具讀寫 EML 與其 trace；開放核心與商業模組界線清楚、可定價。

