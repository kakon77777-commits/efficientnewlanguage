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
6. **真實語料驗證** — 於真實 Python 專案量測壓縮率／round-trip 等價率（白皮書 §11 KPI）。**2026-07-16
   第一次正式量測**：5 個真實未修改 Python 檔案跑 `eml compress`，5/5 失敗，根因是反向 Python→EML
   從未擴充涵蓋 Phase 6/7 的區塊敘述句（`if`/`while`/`for`/`def`/`class`/`try`）——`py-lexer.ts` 完全
   沒有 COLON/INDENT/DEDENT token。Neo 確認投入擴充，**同日完成 Phase A**（`if`/`elif`/`else`、
   `while`、`for...in` + 共用的 INDENT/DEDENT 詞法/區塊解析基礎設施；`break`/`continue`、dict/set/
   subscript、attribute/import、try/except/raise、`def`/`class` 明確排在後續輪次，未在本輪嘗試）。
   同一批 5 個檔案重新量測：**仍是 5/5 未完全成功**（符合預期——每個檔案都同時用到至少一個本輪仍
   排除在外的語法），但失敗位置明顯後移，證明真實進展：`Calculate_age`（原第 6 行 → 現第 48 行，
   卡在 `%` 字串格式化運算子，已 lex/parse 完整個檔案的 def/if/for/return 結構）、
   `Duplicate_files_remover`（原第 7 行 → 現第 22 行，卡在 `{}` dict 字面量）；另外 3 個檔案（
   `Leap_Year_Checker`、`Decimal_to_binary_convertor`、`text_to_morse_code`）因為它們的排除語法
   （`%`／`try`／`{`）剛好出現在檔案最前面、比任何 if/while/for 都早，本輪暫時看不到改善，這是
   誠實的量測結果，不是回歸。另外用一個全新、只用 if/while/for 的小片段做了完整 CLI 端到端驗證
   （`eml compress` → `eml roundtrip` → `eml run`，輸出與真實 Python 逐位元組一致）。589 測試
   （原 565）。**同日再完成 Phase B1**：`break`/`continue` 也雙向轉譯了——反向解析器在 Phase A
   的正確性修復中已經需要正確辨識這兩個關鍵字（否則會靜默誤譯成毫無意義的變數參照），所以這輪只需
   把 `eml-emitter.ts` 剩下的兩個 throw-stub 換成真正輸出，是低風險的小追加，不是獨立大工程。594
   測試（原 589）。**同日再完成 Phase B2**：dict/set 字面量 + subscript 也雙向轉譯了，含 `AssignTarget`
   擴充（`d[k] = v`／`d[k] += v`）——這是本輪唯一真正精細的改動：反向解析器原本用「NAME 後面立刻跟
   ASSIGN」的雙 token 預判來偵測賦值句，只能認出裸變數；改成「先解析完整運算式，再檢查後面是不是賦值
   符號」，才能同時認出 `d[k] = v`。同一批 5 個檔案再重新量測，過程中誠實發現一件事：`text_to_morse_
   code` 這個真實檔案的 dict 字面量是寫成多行的，而 EML 的正向/反向 lexer 從 Phase 0 開始就從沒支援過
   跨行的括號類字面量（`[...]`/`{...}`/呼叫的`(...)`）——這是全語言層級的既有邊界，不是 Phase B2 的
   缺陷（本 repo 目前所有範例的清單/字典字面量都是寫在同一行），本輪確認發現但不嘗試修，需要的話是
   獨立一輪跨兩個方向的大工程。`Duplicate_files_remover` 則有真實進展：從卡在 `{` 的 lexer 錯誤變成
   卡在 `def hashFile` 的 parser 錯誤（第 22 行→第 7 行），證明 dict 字面量本身現在真的能完整 lex/
   parse 過去了，剩下卡住的是 `def`（Phase E 範圍）。另外用一個全新、dict tally 迴圈的小片段做了完整
   CLI 端到端驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出與真實 Python 逐位元組一致）。605
   測試（原 594）。**同日再完成 Phase C**：attribute access（含 `math.sqrt(x)` 這類 attribute-callee
   call、以及 `obj.attr = v`／`obj.attr += v` 賦值目標）+ 單一裸模組 `import module` 敘述句也雙向轉譯
   了。`AssignTarget` 再擴充一步到 `Identifier | Subscript | Attribute`，終於對齊正向解析器自己原本
   就有的完整型別。`import` 的處理刻意分兩層：只有「後面剛好跟著一個裸模組名稱、然後就是敘述句邊界」
   這個精確形狀才會被解析成真正的節點；`import numpy as np`／`import os.path`／`from x import y` 這
   類無法對應到 EML 語法的形式，維持原本靜默跳過的既有行為（不是回歸）。同一批 5 個檔案再重新量測：
   完全沒有變化（符合預期——這 5 個檔案沒有一個是卡在 attribute/import 上）。另外用一個全新、
   `import math` + `math.sqrt(x)` 的小片段做了完整 CLI 端到端驗證通過。611 測試（原 605）。
   **同日再完成 Phase D**：`try`/`except`/`finally` + `raise` 也雙向轉譯了。`bound` 作用域的處理刻意
   比 if/elif/else 更保守，照抄正向語意分析器自己的既有邏輯：try 主體跟每個 except handler 各自拿到
   一份「絕不合併回外層」的獨立複本（因為 try 主體可能執行到一半就失敗，究竟哪個部分真的跑完是條件式
   的），只有 finally 共用同一份活的作用域（不複製）——因為 finally 一定會無條件執行，跟 Phase A
   while/for 用的邏輯一樣。動工前先驗證（不是憑空猜）抓到一個真的 bug：Python 的 `pass`（`except`/
   `try` 內常需要，因為 `parseBlock()` 本來就要求非空區塊）跟 Phase A 修復前的 `break`/`continue`
   有一模一樣的靜默誤譯漏洞——EML 完全沒有「無操作敘述句」的節點，所以改成明確辨識 `pass` 並直接
   報錯拒絕，而不是新增一個無操作能力（範圍外的另一個功能）。同一批 5 個檔案再重新量測，這次真的有
   具體進展：`Decimal_to_binary_convertor` 從卡在第 1 行的 `try:` 一路推進到第 3 行的 `if` 條件式，
   卡在 `or` 布林運算子（目前任何一輪都還不支援，是另一個既有、非本輪範圍的缺口）。另外用一個全新、
   迴圈內 try/except/finally 的片段做了完整 CLI 端到端驗證通過。620 測試（原 611）。反向方向現在只
   剩 `def`/`class` 還沒做。**同日再完成 Phase E1**：函式定義 + `return` 也雙向轉譯了（僅
   `@cold`/中性子集）。動工前先直接讀正向程式碼驗證（不是憑空猜），抓到兩個關鍵、非顯而易見的發現：
   ① `@cold` 跟 `@hot` 在正向 emitter 裡完全不對稱——`@cold` 會輸出真正的 `@functools.cache`
   decorator，但 `@hot` 只會輸出一行**註解**（`# @hot: dynamic state — not cached`），而反向 lexer
   從來不會 tokenize 註解，所以 `@hot` 是**永久性、結構上不可回復**的資訊遺失，跟 `async`/`await`
   屬於同一類「永久性 forward-only」而非「暫緩」的缺口——本輪明確把這點寫進文件，不是含糊帶過。
   ② `import functools` 是正向語意分析器自動合成的樣板碼（只要程式裡有非 async 的 `@cold` 函式就會
   自動加這行 import，跟使用者是否自己寫了 import 完全無關），所以反向解析器把這個精確形狀的裸
   `import functools` 特別跳過、不當成真正的 `ImportStatement` 節點保留——否則重新正向轉譯一次會讓
   這行 import 出現兩次（一次來自還原的敘述句，一次來自看到 `@cold` 又自動合成的那次）。函式主體也
   引入了一個全新、比之前任何區塊敘述句都嚴格的 `bound` 作用域規則：函式拿到一份全新、只用自己參數
   名稱預先綁定的獨立作用域（完全不複製外層的 `bound`）——這是第一個「雙向都隔離」的敘述句：不只是
   內部宣告的名稱不會外洩（if/try 早就是這樣），外層的名稱也不會滲透進來（if/while/for/try 從來不需要
   這條規則，因為它們都不是呼叫邊界）。同一批 5 個檔案再重新量測，`Duplicate_files_remover` 有真實
   進展：從卡在 `def hashFile`（第 7 行）推進到 `with open(...) as file:`（第 11 行）——`with`/
   context manager 是全新、本輪範圍外的另一個缺口，證明 `def` 本身現在真的能完整處理過去了；其餘 4
   個檔案因為排除語法（`%`／`or`／多行 dict 字面量）都出現在檔案更前面，本輪暫時看不到改善，這是誠實
   的量測結果。另外用一個全新、含遞迴 `@cold` 函式的片段（`factorial`）做了完整 CLI 端到端驗證通過
   （並確認還原後的 EML 沒有多出一行 `import functools`）。632 測試（原 620）。反向方向現在只剩
   `class` 還沒做（`@hot` 則是函式支援範圍內永久性、非暫緩的例外）。**2026-07-17 完成 Phase E2
   （最後一輪）**：`class`（最小可行 OOP）也雙向轉譯了，收尾整個反向轉譯器工程——Phase 0–7 所有能
   往返的語法現在全部往返了。動工前直接驗證 AST + 正向解析器：`ClassDef` 就只是
   `{ name, body }`——沒有基底類別、沒有 decorator，方法就是普通的巢狀 `FunctionDef`
   節點、`self` 就是普通的第一個參數，正向解析器自己的 `parseClassDef()` 也證實了這個對稱性
   （body 用跟其他區塊敘述句一樣的通用 `parseBlock()`，「只能放方法或賦值」這條限制是語意分析階段
   才加的，不是文法層級）——所以這輪幾乎不需要新邏輯：一個 `class Name:` 開頭 + emitter 裡一份
   全新、class-local 的 `bound` 作用域（巢狀方法本身不需要額外處理，因為 `FunctionDef` 自己的
   case 本來就會建立自己的全新作用域，不管外面傳進來的是什麼）。這是整個系列裡最小的一輪，比 B1
   還小。過程中重新驗證 Phase E1 的一個舊測試時，發現一個值得訂正的細節：`@hot`
   的往返失敗其實是**靜默的不一致（mismatch）**，不是拋出的反向解析錯誤——反向 lexer 本來就會
   丟掉註解，所以會把被拔掉 decorator 的 Python 順利解析成一個中性函式，資訊遺失只會在比較
   python1／python2 文字時才顯現出來；Phase E1 原本的描述（「不會收斂到不動點」）本身沒錯，但沒有
   講清楚實際機制，這輪把它說得更精確。全新 `BankAccount`（deposit/withdraw + 餘額)片段做了完整
   CLI 端到端驗證（`eml compress` → `eml roundtrip` → `eml run`，120 == 120，輸出與真實 Python
   逐位元組一致）。637 測試（原 632)。重新量測同 5 個真實檔案：完全沒有變化（符合預期，5 個檔案
   沒有一個是卡在 `class` 上）。**反向 Python→EML 轉譯器工程至此完整收尾**——只剩
   `@temporal_loop`／`async`／`await`（永久單向)跟 `@hot`（函式支援範圍內永久性例外)留在轉譯不變式
   之外。詳見 `docs/agent-handoff.md`「Phase 8 — reverse Python→EML, Phase A + B1 + B2 + C + D +
   E1 + E2」章節。
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

## Phase 9：語言本體擴充（real-corpus language gaps）

反向 Python→EML 轉譯器工程（Phase 8 的 B-6 項目，Phase A 到 E2）2026-07-17 完整收尾後，重新量測同一批
5 個真實 Python 檔案發現：`Decimal_to_binary_convertor` 跟 `Leap_Year_Checker` 卡住的不是反向轉譯器的
缺陷，而是 **EML 語言本體目前就沒有的語法**（正向、反向都沒有）——`and`/`or` 布林運算子、數值取模
`%`、字串格式化（`%` 格式化 + `.format()`，兩套不同機制）、三引號字串 `"""..."""`、`print(x, end="")`
關鍵字參數、`with`/context manager、跨行括號類字面量。這是全新的一個 roadmap 分類：**擴充語言本體
（雙向都要做），不只是反向工程**，跟 Phase 8 的 B-6 性質不同。Neo 選擇從最小的開始、一項一項來。

1. **`and`/`or` 布林組合子 — 已完成 2026-07-17。** 新增 `LogicalExpression`（`{op:'and'|'or', left,
   right}`）AST 節點，貫穿正向 lexer/parser/emitter、6 個語意分析 walker（`semantic.ts`/`purity.ts`
   ×2/`importance.ts`/`loop-classifier.ts`/`cts-generator`）、反向 parser/emitter、直譯器、C⁺⁺⁺
   prototype backend——比任何一輪單向反向轉譯器工程觸及的檔案都多，因為這是一個全新的 Expression
   型別要貫穿兩個方向 + 每一層分析，不是單向的反向轉譯階段。動工前先用一個 Explore agent + 直接驗證
   每一份 precedence table，畫出精確的觸點地圖（3 份獨立、各自維護的 precedence()/child() 複本要
   一致改號；3 個 walker 有 `default:` 兜底、不是編譯期強制，屬於「靜默漏掉不報錯」的高風險類型）。
   **關鍵語意（直接對照真實 Python 執行驗證，不是憑空假設）**：`and`/`or` 回傳的是**其中一個運算元**，
   不是永遠回傳布林值（`0 and 5` 回傳 `0`，不是 `False`），而且是真短路——直譯器的實作是求值一次
   `left`、依真假分支，`right` 不需要時真的不會被求值（用一個「若真的被求值就會報錯」的呼叫式驗證過）。
   C⁺⁺⁺ prototype 這輪對應到 `&&`/`||`——會永遠回傳 bool，是這個 backend 刻意、已記錄的簡化，但
   「藏在 and/or 後面的自我遞迴」（`f() and f()`）仍然正確被 `expressionCallsName`（不是編譯期強制
   的 walker）攔下，沒有變成生成壞掉 C++ 的破口。`∧`/`∨` 是額外接受的 Unicode 顯示形式（比照 `∈`→`in`
   的既有慣例）。662 測試（原 637）。CLI 端到端驗證（`eml run` 一個全新的迴圈+布林條件片段）+ 重新
   量測同 5 個真實檔案：`Decimal_to_binary_convertor` 從卡在 `or`（第 3 行）推進到第 7 行的
   `bin(dec)[2:]`——這是全新、不同的缺口（Python 的**序列切片**語法，跟 EML 自己的 `[a:b]` 區間字面量
   是不同語意，正向反向都還沒有），證明 `and`/`or` 本身現在真的完整可用；`Leap_Year_Checker` 沒有變化
   （符合預期——`%` 在同一行比 `and`/`or` 更早出現，lexer 階段就先擋下來了）。詳見
   `docs/EML-LANG-2026-v1.0.md` §5.8、`docs/reverse-transpiler-feasibility.md`（方法論沿用自反向
   轉譯器工程）。
2. **數值取模 `%` — 已完成 2026-07-17。** 跟 `and`/`or` 不同，`%` 重用既有的 `Binary` 節點（只是
   把 `BinaryOperator` 擴充加一個 `'%'`），不是新的 Expression 型別——動工前先逐一直接讀過 6 個語意
   分析 walker + `OverlayAssign` 的解析邏輯，證實它們全部已經對任何 `BinaryOperator` 通用處理，
   **零改動**；真正需要動工的只有兩個方向各自的 lexer/parser（新 token）+ 3 份 emitter 各自的
   `nonAssoc` 判斷（`%` 跟 `-`/`/` 一樣是非結合律，`a % (b % c)` 一定要保留括號，否則會靜默改變分組
   語意）。**關鍵語意直接對照真實安裝的 Python（3.14.5）驗證，不是憑空假設**：Python 的 `%` 是
   **floor-mod**（結果取除數的正負號：`-7 % 3 == 2`），跟 JS／C++ 原生 `%`（取被除數正負號，同樣式子
   會是 `-1`）不同——`@eml/interp` 用 `((a % b) + b) % b` 這個技巧把 JS 的截斷取模轉成 Python 的
   floor-mod（bigint、float 兩條路徑都驗證過好幾組正負號組合，包括浮點數）；取模除以零丟出
   `ZeroDivisionError('division by zero')`，這個訊息文字對 int/float 都一樣（也是直接測真實 Python
   才確認的，不是照抄 `/` 既有的依型別分訊息邏輯）。字串的 `%`（printf 風格格式化）刻意排除在外，
   直譯器遇到會 defer 成 `Unsupported`，不是拋錯或算出錯的結果。C⁺⁺⁺ prototype 這輪加了一個字面量
   層級的防護：`%` 的運算元如果是明顯的非整數字面量（例如 `1.5 % 2`），直接 `E_CPP_UNSUPPORTED`
   拒絕——因為 C++ 的 `%` 是整數限定，套用在 `double` 上是編譯錯誤，這點跟本來就相容 int/float 的
   `/` 不一樣；非字面量（變數）的浮點數運算元仍抓不到，跟 `/` 既有的型別無知是同一類、已記錄的缺口。
   677 測試（原 662）。全新的閏年判斷片段（`%` + 既有的 `and`/`or`）做了 CLI 端到端驗證（`eml run`
   輸出 50，與真實 Python 逐位元組一致）。重新量測同 5 個真實檔案，**兩個卡在 `%` 的檔案都有具體
   進展**：`Leap_Year_Checker` 從卡在 `%`（第 3 行）推進到第 4 行的三引號字串 `"""..."""`——正好對應
   已知的項目 4；`Calculate_age` 從卡在 `%`（第 48 行）推進到第 21 行的 `(not leap_year)`——**這是
   本輪重新量測才意外發現的全新缺口**：`not`（布林一元反轉運算子），原本被 `%` 擋在前面所以從沒被
   量測到過，規模很小（跟 `and`/`or` 同一類，只是一元不是二元），列為新的候選項目（見下方項目 8）。
   詳見 `docs/EML-LANG-2026-v1.0.md` §5.2、`docs/agent-handoff.md`「Phase 9」章節。
3. **字串格式化（`%` 格式化 + `.format()`）** — 分兩個子項目，兩套獨立機制。
   - **3a. 元組字面量 + `%` 格式化 — 已完成 2026-07-18。** 重新檢視 `Calculate_age` 第 48 行才發現
     這行其實一次卡了三個獨立缺口：`%` 格式化運算子本身、一個**元組（tuple）字面量**
     `(name, year)`（EML 之前完全沒有元組型別，只有 List/Dict/Set）、以及 `print(..., end="")`
     具名參數（已編號的項目 5）。檢查另外兩個用到 `.format()` 的語料行
     （`Decimal_to_binary_convertor` 第 7 行、`Leap_Year_Checker` 第 7/12 行）證實 `.format()`
     本身目前 5 個真實語料檔案都還沒有任何一個真的走到——兩者都被更前面、不相關的缺口擋住（一個是
     Python 切片 `bin(dec)[2:]`，一個是項目 4 的三引號字串）。於是這輪範圍收斂成真正被語料觸及的
     一半：元組字面量 + `%` 格式化本身，列為 3a；`.format()` 列為 3b，等哪個語料檔案真的先走到它再做。
     全新 `TupleLiteral` AST 節點（形狀照抄 `ListLiteral`），最有意思的一塊是正向/反向解析器的
     `(` 消歧邏輯——`(x)` 沒有逗號時維持原本單純的分組語意（不是 1 元組，跟真實 Python 完全一致），
     只有帶逗號才是元組（`(x,)` 是真正的單元素元組，`()` 是空元組），這個消歧規則本身不需要新增任何
     詞法 token（`(`/`)`/`,` 呼叫參數早就有了），也不需要重新編號優先權表（元組跟 List 一樣落在最緊的
     atom 分層，3 份 emitter 的 `precedence()` 都是 default 分支，這系列少數不用動優先權的一輪）。
     **直譯器這邊做了真正的語意，不是應付了事**：`%` 格式化實作了 printf 風格的 mini-language 子集
     （`%s`/`%d`/`%f`/`%%`），`%d` 對浮點數會**朝零截斷**、`%f` 預設 6 位小數、引數個數不符與跨型別
     錯誤都直接對照真實安裝的 Python 驗證訊息文字（`not enough arguments for format string`、
     `not all arguments converted during string formatting`、`unsupported operand type(s) for %:
     '<type>' and 'str'`、`%d format: a real number is required, not <type>`）。**元組值本身刻意
     縮小範圍**：只做了語料真正需要、且「免費」的部分（真值判斷、相等性——元組跟同元素的 list 永遠不
     相等，這點跟真實 Python 一致——`in` 成員測試、`for` 迭代、下標讀取、`str()`/`repr()`），刻意
     **不做**元組的算術（`+`/`*`）、大小比較（`<`/`>`）、可雜湊性（能不能當 dict/set 的 key）——這些
     語料完全用不到，而且都已經有安全的、會直接報錯而非算錯的既有預設行為頂著，誠實記錄為已知缺口而
     非草率的部分實作。C⁺⁺⁺ prototype 對元組字面量直接整體拒絕（`E_CPP_UNSUPPORTED`，這個純數值
     prototype 完全沒有元組或字串格式化模型），藏在元組裡的自我遞迴仍被既有的遞迴前置檢查正確攔下
     （用專門測試鎖住，斷言的是「Recursive function」這個特定訊息，而不只是元組本身也會觸發的通用
     拒絕訊息，因為兩者都會呈現同一個 `E_CPP_UNSUPPORTED` 代碼）。724 測試（原 696）。全新
     `Calculate_age`-風格片段（`name`/`year` 搭配 `%s`/`%d`）做了完整 CLI 端到端驗證（`eml run`
     輸出跟真實 Python 逐位元組一致）。重新量測同 5 個真實檔案，**誠實結果**：`Calculate_age`
     從卡在 `(name, year)` 元組/`%`格式化本身，推進到**同一行**的 `end=""` 具名參數（項目 5，還沒做）
     ——這輪讓這個檔案的卡點往前推進，但沒有讓它整個跑通；其餘 4 個檔案完全沒變化，符合預期。詳見
     `docs/agent-handoff.md`「Phase 9」章節、`docs/cpp-feasibility.md`、
     `docs/EML-LANG-2026-v1.0.md` §5.10。
   - **3b. `.format()` 方法呼叫 — 2026-07-18 查證：其實已經能用，不需要另外實作。** 這輪做項目 4
     （三引號字串）的語料重新量測時，`Leap_Year_Checker` 推進到 `.format()` 那行，順手查證才發現：
     `"...".format(x)` 本質上就是一個普通的 attribute-call（`Attribute` + `Call`，Phase 7c 就有的
     通用機制），所以正向解析、正向 emit、反向往返，現在**全部零新程式碼就已經能動**——直接測試
     `year = 2000; msg = "{0} is a leap year!!".format(year); print(msg)` 完整 compress + roundtrip
     都乾淨通過。跟 numpy 的 `<M>`/`^T` 是同一類：純 JS 直譯器本身不模擬它的內部語意（`interpret()`
     回報 `unsupported: ["call value.format()"]`），`eml run` 遇到這種情況會 defer 給真實 Python
     子行程執行——這是既有、已經被接受的既定模式，不是缺口。`Leap_Year_Checker` 這個真實檔案本身
     還沒完整跑通的原因，其實跟 `.format()` 無關，是它把 `.format()` 呼叫結果直接丟給 `print(...)`
     （沒有先綁定變數）——命中 EML 自己既有、刻意設計的限制（`^0` 的運算元必須是裸變數，見
     `docs/EML-LANG-2026-v1.0.md` §5.3），不是新發現的語言缺口。這是設計上的既定限制還是要放寬，
     交給 Neo 判斷；不主動排入下一輪工程。
4. **三引號字串 `"""..."""` — 已完成 2026-07-18。** `Leap_Year_Checker` 的 3 段裸字串 docstring
   卡點。動工前直接讀過程式碼確認：`StringLiteral` AST 本身沒有引號風格欄位，正向/反向解析器、3 份
   emitter、7 個語意分析 walker、直譯器全都已經把字串當成不透明的 JS 字串通用處理——這輪**純粹是
   lexer 層級的擴充，零 AST/parser/emitter/walker 改動**（跟項目 1/2/8/3a 那種要貫穿全分析層的新
   Expression 型別完全不同類，是這條 Phase 9 支線目前最輕量的一輪）。正向（`packages/parser/src/
   lexer.ts`）+ 反向（`packages/transpiler-eml/src/py-lexer.ts`）的字串詞法分支都改成：先檢查目前
   位置是否為 3 個連續引號字元（`'''`或`"""`，共用同一個 `at()` helper），是的話走三引號路徑（消耗到
   下一個 3 連續引號字元為止），否則維持原本單引號路徑；兩條路徑共用同一份跳脫字元處理邏輯（抽成一個
   小的 `readEscape()` closure），避免兩份逐字複製的跳脫映射表以後各自漂移。**動工前直接驗證（不是
   假設）一個關鍵正確性問題**：多行三引號字串內容裡的換行字元，會不會被縮排敏感的 lexer 誤判成
   INDENT/DEDENT？答案是不會——字串讀取迴圈自己呼叫 `advance()` 消耗掉包含換行在內的每個字元，外層
   dispatch 迴圈的縮排偵測只在自己那條專門的 `c === '\n'` 分支才會觸發，而字串迴圈跑完前根本不會把
   控制權交還給外層——這個保證今天已經套用在「一般字串裡混進一個裸換行字元」這種既有、罕見情況上，
   三引號字串沿用同一套保證。696 → 734 測試（+10）。全新 docstring 片段做了完整 CLI 端到端驗證
   （`eml run` 輸出跟真實 Python 逐位元組一致）。重新量測同 5 個真實檔案：`Leap_Year_Checker` 完全
   推進過 3 段 docstring，卡點換到 `print("...".format(year))`——追查後發現這其實不是新缺口，見上方
   項目 3b 的說明（`.format()` 本身已經能用，卡點是既有的 `^0` 裸變數限制）；其餘 4 個檔案完全沒有
   變化，符合預期。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.11。
5. **`print(x, end="")` 等關鍵字參數** — 待做，EML 目前完全沒有具名參數呼叫的語法概念。
6. **`with` / context manager** — 待做，目前發現規模最大最複雜的一項，牽涉 `__enter__`/`__exit__`
   資源管理執行語意，不只是語法。
7. **跨行括號類字面量** — 待做，全語言層級的既有邊界（Phase B2 發現，非任何一輪的缺陷）。
8. **`not` 布林一元反轉運算子 — 已完成 2026-07-17。** 2026-07-17 量測 `%` 進展時意外發現
   （`Calculate_age` 第 21 行 `(not leap_year)`，之前一直被 `%` 擋在更前面沒被量測到過）。跟
   `and`/`or` 同一類（新 Expression 節點,要貫穿雙向 + 全分析層),但有兩個地方跟 `and`/`or` 不一樣：
   （1）`not` 永遠回傳真正的布林值（不像 `and`/`or` 回傳運算元本身)——直譯器這邊反而更簡單；（2）
   `not` 需要**全新的 precedence 分層**（介於 `and` 跟比較運算之間),這是這條 Phase 9 支線第四次
   改精度分層。**動工前用具體案例推演發現一個真實、容易漏掉的跨語言正確性風險**：Python 的 `not`
   比比較運算鬆（`not x > 5` 等於 `not (x > 5)`),但 C++ 的 `!` 比比較運算緊很多（`!x > 5` 在真的
   C++ 裡會解析成 `(!x) > 5`)——沿用共用的 precedence 機制（原本就是照 Python 自己的優先序設計)會
   靜默生出長得對、語意卻錯的 C++。修法：C++ 這邊的 `not` case 完全繞過共用的 precedence 機制,
   永遠把運算元包上括號（`!(...)`)——正確性優先於最精簡括號,比 `%` 的字面量防護更嚴格,因為這裡
   算錯不是編譯失敗,是靜默算出錯的布林結果。**另外自己寫測試時抓到一個真的 bug**：`¬` 的 Unicode
   顯示形式如果比照 `∧`/`∨` 用「前後都留空格」的替換方式,會在 `¬` 出現在行首時（EML 允許,因為
   `not` 是前綴運算子)插入一個多餘的前導空格,把縮排敏感的 lexer 弄壞——`∧`/`∨` 因為是中綴運算子,
   永遠不會出現在行首,所以從沒踩到這個問題;修成只留後面空格。696 測試（原 677)。全新的
   `not`+`and`+`%` 綜合片段（閏年計數,`(y % 4 == 0) and (not (y % 100 == 0)) or (y % 400 == 0)`)
   做了完整 CLI 端到端驗證(`eml run` 輸出 50,與真實 Python 逐位元組一致)。重新量測同 5 個真實檔案：
   `Calculate_age` 從卡在 `not`（第 21 行)推進到第 48 行的 `(name, year)` 元組字面量（見上方項目 3
   的子細節,自然接續到下一個已知項目);其餘 4 個檔案沒有變化,符合預期。詳見
   `docs/EML-LANG-2026-v1.0.md` §5.9、`docs/cpp-feasibility.md`、`docs/agent-handoff.md`
   「Phase 9」章節。

