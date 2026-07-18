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
5. **`print(x, end="")` 等關鍵字參數 — 已完成 2026-07-18（純反向,刻意不設計新正向語法）。**
   跟前面每一輪都不一樣的地方：這是 Phase 9 支線第一次真的需要發明全新的 EML 具體語法才能完整支援——
   `^0` 目前只認裸變數,是刻意的設計,不像 `and`/`or`/`%`/`not`/元組/三引號字串那樣都是延伸 Python
   本來就有的語法。這個語法設計決定直接問過 Neo（用 AskUserQuestion,不是自己片面決定）：
   **只做反向、不設計新正向語法**——反向轉譯器認得 `print(x, end=...)`,但正向 EML 永遠沒有語法能
   表達自訂的 print 結尾,而且刻意不新增。後果（動工前就先追蹤過整條 pipeline 確認,不是事後才發現）：
   `eml compress` 對 `Calculate_age` 那一行還是會失敗——但失敗點從一個難懂的 parser 內部斷言
   （`Expected RPAREN but found ASSIGN`）變成一句清楚、誠實的「EML cannot express print's 'end'
   keyword argument」,跟 `await`/`async`/C++ 版的 numpy 拒絕是同一套「寧可清楚拒絕也不要靜默誤譯」
   的紀律。**範圍比一開始估的小很多**：直接追蹤過哪個 AST 會真的帶著這個新欄位,只有反向解析器
   （產生）跟反向 EML emitter（唯一會檢查、丟錯的地方）會碰到——`roundTripFromPython` 的 pipeline
   是 py-parse → eml-emitter（一丟錯整條就停在這）→（只有沒丟錯才會）重新走一次正向 parse →
   語意分析 → 正向 Python emitter,所以正向解析器/emitter、直譯器、7 個語意分析 walker、C++ 後端
   全都**零改動**——直接讀過每一個 `case 'Output'` 的程式碼逐一確認過,不是只憑追蹤結果假設。
   另一個研究階段發現的簡化：`print(...)` 這輪拿到一個**專屬的敘述句層級解析函式**
   （`parsePrintStatement()`）,照抄這個檔案本來就有的 `sum(...)`/`range(...)`/`np....` 特殊辨識
   慣例——而不是去改共用的 `parseArgs()`（文法裡每一個呼叫都會經過的地方）去容忍具名參數語法。
   這讓共用的 `FunctionCall` AST 型別（12 個檔案在用）完全不用動,範圍比通用具名參數功能小很多,
   而且精準對應語料真正需要的東西（就只有 `print` 的 `end=`,沒有更多）。刻意設計得很嚴格：
   只認「恰好一個位置參數,後面可以接恰好一個 `, end = 運算式`」,`print(a, b)`（多個位置參數）、
   `print(x, sep=",")`（其他關鍵字）都會直接丟出清楚的 `PyParseError`,不會靜默誤解析。744 測試
   （原 734）。CLI 端到端驗證：新的清楚錯誤訊息確實取代了舊的難懂 parser 斷言。重新量測同 5 個
   真實檔案：`Calculate_age` 仍然沒有完整通過 `eml compress`（這是設計上就預期、可接受的結果,
   不是遺憾）,但失敗點現在精準落在這個刻意設計的限制上；其餘 4 個檔案沒有變化。詳見
   `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.3。
6. **`with` / context manager — 已完成 2026-07-19。** 這條 Phase 9 支線最後一項未動工的項目，也是
   原本標記「規模最大最複雜、牽涉 `__enter__`/`__exit__` 資源管理執行語意」的一項。動工前先把
   `Duplicate_files_remover` 整個檔案從第 11 行（`with`）逐行追蹤到 EOF，誠實確認一個關鍵事實：
   **光做 `with` 沒辦法讓這個檔案完整通過 `eml compress`**——第 12-17 行（讀 buffer、`while(len(buf)
   > 0):`）都用既有機制能直接解析，但第 26 行 `filelist = [f for f in os.listdir() if
   os.path.isfile(f)]` 是一個**列表推導式（list comprehension）**——這是全新、之前從未被發現、從未
   編號過的缺口（搜過 `docs/` 裡「comprehension」字樣，零匹配；因為這個檔案的量測每次都卡在第 11 行
   的 `with`，從沒真正走到第 26 行過）。於是這輪範圍就做 `with` 本身；列表推導式列為新的候選項目，
   誠實記錄而非直接動手做掉（見下方）。也確認過：就算 `with` + 列表推導式都做了，這個檔案的 `eml
   run`（真正執行）還是會 defer——第 10 行 `hasher = hashlib.md5()` 命中直譯器既有的「未綁定模組
   attribute 呼叫」`Unsupported` defer（跟 `.format()`/numpy 同一類），而 `open(...)` 本身命中的是
   硬性 `NameError`（比 attribute 呼叫的軟性 `Unsupported`處理更嚴格一點的不一致，這輪只記錄不修）。
   **設計上照抄 Phase 7d（`try`/`except`/`finally`）的先例**：EML 自己的 `with` 具體語法就是 Python
   關鍵字語法原文照搬（不像 `^` sigil 系統，這點跟 `try`/`except` 一致），直譯器做**真正的**
   `__enter__`/`__exit__` 協定派送（重用 Phase 7e 既有的 `findMethod`/`runMethodBody`，不是另起爐灶）
   ——對象是使用者自訂類別的 instance，跟真實 Python 協定完全一致，連檢查順序都直接對照真實安裝的
   Python 驗證過（`__exit__` 缺失比 `__enter__` 缺失更早被檢查到，兩者都沒有時報「missed __exit__
   method」）；`__exit__` 回傳真值會抑制正在傳播的例外，也直接測真實 Python 驗證過
   （`with Suppress(): raise ...` 之後不會有例外）。759 測試（原 744）。全新的
   `__enter__`/`__exit__` + 例外抑制片段做了完整 CLI 端到端驗證（`eml run` 輸出跟真實 Python 逐
   位元組一致，含抑制例外的分支）。重新量測同 5 個真實檔案：`Duplicate_files_remover` 完全推進過
   `with`（第 11 行），卡點換到第 26 行的列表推導式（全新、未編號的缺口）；其餘 4 個檔案沒有變化。
   詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md`「Phase 9 item 6」小節。
   **新發現、尚未編號的候選項目：列表推導式 `[expr for x in iterable if cond]`**——EML 目前完全沒有
   任何形式的一般列表推導式語法（`Σ(...)` 只對應 `sum(x for i in range(...))`，且限定只能對
   `range(...)` 迭代），這是 `Duplicate_files_remover` 現在唯一剩下的卡點，值得排進下一輪或提醒 Neo
   決定優先序。
7. **跨行括號類字面量 — 已完成 2026-07-19。這是 Phase 9 支線最後一個原本就有編號的項目。** 動工前先
   跟另外兩個未編號候選（Python 切片語法、列表推導式）比較過真實規模再選：那兩個都需要發明全新的
   `Expression` AST 節點,貫穿這個專案每次新增運算式型別都要付出的「整條垂直切面」——7 個語意分析
   walker + 直譯器 + 3 份 emitter（跟 `Tuple`/`Not` 同一類工程量）。項目 7 經直接完整讀過兩個 lexer
   確認**純粹是 lexer 層級,零 AST/parser/語意 walker/直譯器/emitter 改動**——跟項目 4（三引號字串）
   同一類,是三個候選裡最小的。**根本原因,直接讀過兩個 lexer 的完整 dispatch 迴圈確認,不是假設**：
   `packages/parser/src/lexer.ts` 跟 `packages/transpiler-eml/src/py-lexer.ts` 都完全沒有任何
   括號深度追蹤——每個 `\n` 一律變成 `NEWLINE` token,下一個非空白行一律跑縮排偵測邏輯,完全不管
   是不是還在一個沒閉合的括號裡面。兩個 lexer 都加了一個 `bracketDepth` 計數器（遇到開括號
   `(`/`[`/`{` 時 +1,對應的閉括號時 -1),換行處理跟縮排偵測整段都改成只在 `bracketDepth === 0`
   時才真的觸發——跟真實 Python 的隱式續行規則完全一致。**動工過程中意外發現、順手一起修的小
   問題**：測試這個功能對照真實語料檔案時,發現 `text_to_morse_code` 的字典字面量最後一個 entry
   結尾就是一個 trailing comma（`"z": "--..",` 後面直接接 `}`）,這是真實世界 Python 常見寫法,
   純粹的括號深度修復還是無法讓這個檔案完整通過——於是同一輪也補上了 trailing comma 支援（`[1,
   2,]`、`{k: v,}`、`f(a, b,)`,單行、多行字面量都適用）,因為這個缺口小到跟本輪主題緊密耦合
   （多行字面量幾乎必然搭配 trailing comma),不像其他幾個發現的獨立缺口那樣另外記錄延後處理。
   770 測試（原 759)。全新多行字典字面量片段做了完整 CLI 端到端驗證（`eml run` 輸出跟真實
   Python 逐位元組一致)。重新量測同 5 個真實檔案，**誠實、真實的進展**：`text_to_morse_code`
   從卡在第 2 行（多行字典開頭)一路推進到第 38 行 `for i in range(length):`——揭露了**第三個
   本輪意外發現、之前從未被發現過的缺口**：反向解析器的 `range(...)` 辨識目前只支援兩個參數的
   形式（`range(a, b)`),不支援 Python 常見的單參數簡寫 `range(n)`（隱含起點 0)。這是全新、
   誠實記錄而非動手修掉的發現，跟另外兩個未編號候選一起列在下方；其餘 4 個檔案沒有變化。詳見
   `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.12。
   **這是 Phase 9 支線所有原本編號項目（1-8）全部完成的時刻**——反向方向現在只剩三個從未編號的
   獨立候選：Python 切片語法（`bin(dec)[2:]`,`Decimal_to_binary_convertor` 卡住的地方,中等規模,
   需要新的 `SliceExpression` AST 節點 + 貫穿全分析層)、列表推導式（`[expr for x in iterable if
   cond]`,`Duplicate_files_remover` 卡住的地方,中至大規模,需要新的 AST 節點 + 從零設計 `if`
   過濾子句文法,這個專案裡沒有任何先例)、以及這輪發現的 `range(n)` 單參數簡寫（`text_to_morse_
   code` 現在卡住的地方,規模看起來很小,只需要放寬 `parseRangeCall()` 的參數數量要求）。三者都
   還沒動工,優先序、要不要投入,都需要 Neo 決定。

8. **`range(n)` 單參數簡寫（未編號候選，同日完成 2026-07-19）。** 直接比較過三個未編號候選的真實
   規模後選的：Python 切片語法、列表推導式都需要發明全新 `Expression` AST 節點、貫穿整條垂直切面
   （7 個語意分析 walker + 直譯器 + 3 份 emitter，跟 `Tuple`/`Not` 同一類工程量）；`range(n)` 經
   直接讀過反向解析器確認是這整條 Phase 9 支線裡規模最小的修復——**完全重用既有的 `RangeExpression`
   AST 節點**（`range(n)` 產生的節點形狀跟 `range(0, n)` 一模一樣，只是隱含起點是字面量 `0`），
   不需要新 token、不需要碰語意分析 walker、不需要碰任何 emitter、不需要碰直譯器——只改了
   `parseRangeCall()` 這一個函式。**跟 `range(a, b)` 一樣是純反向**：正向 EML 本來就沒有
   `range(...)` 呼叫語法（直接用自己的 `[a:b]` 區間字面量），所以這個修復也不需要碰正向那一側。
   刻意只做單參數 + 既有兩參數形式，不做三參數的 step 形式——EML 自己的 `[a:b]` 區間本來就沒有
   step 概念，而且掃過全部 5 個真實語料檔案的 `range(...)` 呼叫，確認沒有任何一個用到三參數形式。
   776 測試（原 770）。全新 `range(5)` 求和片段做了完整 CLI 端到端驗證（`eml compress` →
   `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組一致）。**重新量測同 5 個真實檔案發現
   一個重要的里程碑**：`text_to_morse_code`——這個 Phase 9 語言擴充支線追蹤至今的 5 個真實 B-6
   語料檔案之一——**第一次完整通過 `eml roundtrip`（`python == canonical` 往返不動點達成）**！
   繼上一輪的跨行括號字面量修復之後，這輪的 `range(n)` 修復接連清掉了這個檔案剩下的兩個缺口，
   讓它成為整個 Phase 9 支線裡第一個真正完整通過 B-6 KPI 的真實語料檔案。其餘 4 個檔案（
   `Calculate_age`、`Decimal_to_binary_convertor`、`Duplicate_files_remover`、`Leap_Year_Checker`）
   仍然各自卡在自己已知的缺口上，沒有變化。反向方向現在只剩兩個未編號的獨立候選：Python 切片語法
   跟列表推導式，兩者都還沒動工，優先序、要不要投入，都需要 Neo 決定。詳見 `docs/agent-handoff.md`
   「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §9。

9. **Python 切片語法（未編號候選，2026-07-19 完成，雙向）。** 直接抓了真實語料
   （`Python-World/python-mini-projects` 的 `decimal_to_binary.py`）確認：`Decimal_to_binary_convertor`
   唯一需要的形式是 `bin(dec)[2:]`——只有起點、沒有終點、沒有 step。跟列表推導式比較過規模後選的
   （列表推導式還需要從零設計 `if` 過濾子句文法，這個專案裡沒有任何先例；切片只需要兩個可省略的
   子運算式）。**設計決定交給 Neo（AskUserQuestion）**：正向 EML 的 postfix `obj[...]` 原本完全沒有
   冒號偵測（只會 `parseExpression()` 單一運算式），這個文法位置是空的、沒有衝突風險——Neo 選擇
   **雙向都做**，正向 EML 也學會 `obj[a:b]`／`obj[a:]`／`obj[:b]`／`obj[:]`，不只反向轉譯器認得。
   新增 `SliceExpression` AST 節點（`start`/`stop` 皆可省略）——**沒有重用既有的 `RangeExpression`**：
   Range 的 `start`/`end` 都是必填（每個消費者都假設有具體邊界），切片的邊界本來就可省略，且語意
   本質不同（切片是從既有序列取子序列，Range 是產生一串整數給迭代用）。貫穿完整的垂直切面：7 個
   語意分析 walker（含兩個非窮盡、有 `default:` 或 void 回傳、不會被編譯器強制的 walker，都手動
   補上並用專屬測試驗證，不是只靠型別檢查）+ 直譯器（`sliceGet`/`clampSliceBound` 對字串/列表/元組
   做真正的 Python 切片語意，含負索引、越界永不丟 `IndexError`——只 clamp，這是切片跟一般 subscript
   索引的關鍵語意差異）+ 3 份 emitter（含 C⁺⁺⁺ 原型的拒絕分支）。切片賦值（`lst[a:b] = ...`，真實
   Python 支援但語意是拼接、不是單值覆寫）刻意排除在外，直譯器遇到時丟 `Unsupported`（延後給真實
   Python），不是靜默誤處理。798 測試（原 776）。全新的字串/列表切片、負索引、越界 clamp 片段都做了
   完整 CLI 端到端驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組
   一致）。**重新量測同 5 個真實檔案，誠實結果**：`Decimal_to_binary_convertor` 的切片本身已完全
   解除——`eml compress` 不再卡在 `bin(dec)[2:]`——但**沒有達成第二個完整通過**（跟規劃時的樂觀
   預期不同）：該行 `print("Binary: {}".format(bin(dec)[2:]))` 是把切片結果包進 `.format()` 再直接
   `print()`，命中一個完全獨立、早就存在的既有限制——EML 的 `^0` 輸出只能印裸變數，不能表達
   `print(<運算式>)`（跟 `Calculate_age` 卡住的 `print(x, end=...)` 同一類、同一個既有缺口）。
   `Leap_Year_Checker` 的卡點也是同一個既有限制（不是切片）。`Duplicate_files_remover` 仍卡在列表
   推導式；`text_to_morse_code` 維持上一輪的完整通過，沒有回歸。反向方向現在只剩一個未編號的獨立
   候選：列表推導式，是否投入、何時投入需要 Neo 決定。詳見 `docs/agent-handoff.md`「Phase 9」章節、
   `docs/EML-LANG-2026-v1.0.md` §9。

10. **列表推導式 `[expr for x in iterable if cond]`（未編號候選，2026-07-19 完成，雙向）——這是整條
    Phase 9 語言擴充支線裡最後一個未編號的獨立候選，做完之後這條支線再無已知、未動工的候選。**
    正好一個 `for` 子句、一個可省略的 `if` 過濾子句——不支援巢狀推導式、不支援多個過濾子句（沒有語料
    證據支持）。**設計決定交給 Neo（AskUserQuestion）**：正向 EML 的括號文法原本完全沒有 for/if
    關鍵字（不像切片那輪有現成的 `:` 慣用語可改用），但 EML 本來就一直直接沿用 Python 控制流關鍵字
    原文（`for...in`、`if/elif/else`、`try/except`、`with`、`class` 全都是），所以把這個也當同一類
    「照抄 Python 關鍵字」處理，跟 `print` 的 `end=`（真的需要發明全新 EML 具體語法）不同類——Neo
    選擇**雙向都做**。新增 `ListComprehension` AST 節點——**跟既有的 `SumExpression`（Σ）共用同一個
    關鍵先例**：Σ 的迭代變數從來沒有被任何語意分析 walker 宣告進任何作用域，直接讓目標語言自己的
    不外洩 generator/comprehension 語意接手——列表推導式的 `iterator` 也是同樣處理，不需要發明新的
    作用域機制。但**不能只是 Σ 模型的語法糖**：`SumExpression.range` 型別鎖定 `RangeExpression`，
    Σ 只能對數字區間迭代；真實語料需要對 `os.listdir()`（一個函式呼叫）迭代，是真正全新的能力——
    直譯器的 `iterableItems()`（`ForIn` 已經在用）本來就泛化到 list/tuple/str，直接重用即可。
    **反向側精度層級需要小心**：反向 parser 自己的三元運算式是真實 Python 的 `a if t else b`
    （用 `if`/`else` 關鍵字），所以推導式的 `iterable`/`condition` 子運算式必須用比三元運算式低一級
    的精度解析（`parseOr()`，不是完整 `parseExpr()`），否則會把過濾子句自己的 `if` 誤吃成三元運算式
    的 `if`；正向側沒有這個問題，因為正向 EML 自己的三元運算式用 `?`/`:`，跟 `if` 關鍵字完全無關。
    貫穿 7 個語意分析 walker（比照 Sum 既有寫法，遞迴 `expr`/`iterable`/`condition`，永遠不碰
    `iterator`）+ 直譯器（`evalListComp` 幾乎照抄 `evalSum`，只是用 `iterableItems()` 取代
    `rangeInts()`、收集成列表而非累加求和，外加可省略的過濾檢查）+ 3 份 emitter（C⁺⁺⁺ 原型拒絕，
    跟 Σ 本身有支援不同——Σ 只產生純量，推導式產生動態大小的過濾/映射結果，超出這個純數值原型的
    範圍）。813 測試（原 798）。全新的轉換/過濾/字串迭代片段都做了完整 CLI 端到端驗證（`eml
    compress` → `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組一致）。**驗證了迭代變數
    真的不會外洩**：推導式結束後讀取該變數會丟 `NameError`，跟真實 Python 3 的推導式作用域規則
    完全一致。**誠實重新量測同 5 個真實檔案**：`Duplicate_files_remover` 的列表推導式本身已完全
    解除——`eml compress` 完整重建到 `print("Deleted Files")` 那行才停——但**沒有達成完整通過**：
    卡點換成同一類既有限制的另一個實例（`print("Deleted Files")` 直接印字串字面量，不是裸變數）。
    其餘 3 個仍卡在的檔案（`Calculate_age`、`Decimal_to_binary_convertor`、`Leap_Year_Checker`）也
    都沒有變化，卡點同樣都是這個既有限制的不同實例；`text_to_morse_code` 維持完整通過，沒有回歸。
    **這條 Phase 9 支線目前所有已知、已發現的獨立候選（編號 1-8 + 未編號的 `range(n)`、切片語法、
    列表推導式）現在全部收尾**——反向方向沒有任何已知未動工的語言缺口候選。**唯一浮現、值得記錄
    但這輪刻意不動手的觀察**：剩下卡住的 4 個檔案，卡點現在全部歸結到同一個根因——EML 的 `^0`
    輸出只能印裸變數，不能表達任何運算式/呼叫/字面量。要不要投入放寬這個限制、放寬到什麼程度，
    是全新的語言設計決定，需要 Neo 之後判斷，這輪不主動擴大範圍。詳見 `docs/agent-handoff.md`
    「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.14、§9。

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

---

## Core 語法放寬：`^0` 輸出支援任意運算式 — 已完成 2026-07-19（同日再一輪，非 Phase 9 編號項目）

Phase 9 語言擴充支線（編號 1-8 + 未編號的 `range(n)`、切片語法、列表推導式）全部收尾後，重新量測同 5
個真實檔案發現：剩下卡住的 4 個檔案卡點全部歸結到同一個根因——EML 的 `^0` 輸出敘述句原本規定運算元
「必須是裸變數」（`OutputStatement ::= Identifier "^0"`，語言規格 §5.3 的既有 EBNF），這是一條寫在
Core 文法裡、從很早期就存在的既有規則，不是這條 Phase 9 支線本身發現的缺口——因此故意不當成又一個
Phase 9 編號項目，而是獨立列為 Core 語法本身的放寬。Neo 確認投入這一輪，並選擇先做這個（範圍小、
規模明確），把規模大很多的 EML-APL/Nova Operator IR 橋接工程留給獨立的未來專案。

**直接研究把風險評估整個翻轉成正面**：這條限制實際上只在兩個地方被強制執行，不是散落各處：
- **反向**（`packages/transpiler-eml/src/py-parser.ts` 的 `parsePrintStatement()`）本來就用
  `this.parseExpr()`（泛用運算式）解析 `print(<任意運算式>, end=...)` 的 value——真實語料的
  print 敘述句其實早就能產生 `Output{value: <任意 Expression>}` 的 AST，沒有型別限制。
- 限制**只**由 **`eml-emitter.ts` 的 `Output` case**（`if (stmt.value.type !== 'Identifier') throw
  ...`，把 AST 轉回 EML 文字時的檢查）跟**正向 parser**（`OutputStatement` 唯一的建構點,只在
  `this.check('IDENT') && this.peek(1).type === 'CARET'` 的窄 lookahead 才會觸發）兩處強制。
- **AST**（`OutputStatement.value: Expression`，型別本來就是泛用的）、**正向 Python emitter**
  （`` `print(${emitExpression(stmt.value)})` ``）、**直譯器**（`evalExpr(stmt.value, scope)`）、
  **全部 7 個語意分析 walker**，全部本來就把 `Output.value` 當一般 `Expression` 處理，逐一讀過
  每一個 `Output`/`^0` case 確認零識別符特定邏輯——**這些全部零改動**。

**正向 parser 的放寬風險很低,不是重新設計,因為文法裡本來就有一個現成的巧妙讓步**：
`parsePower()`（`packages/parser/src/parser.ts`）本來就有 `Number(n.value) !== 0` 的判斷式——`CARET`
緊接著字面數字 `0` 永遠不會被當成次方運算,不管在整條 precedence chain 的哪個深度都一樣。這代表
`parseStatement()` fallback 裡既有的 `this.parseExpression()`（跟純 `ExpressionStatement`、`=>`
賦值、複合賦值共用的同一條路徑）解析完任意運算式之後，尾隨的 `CARET NUMBER('0')` 永遠不會被吃掉，
不管運算式長什麼樣子。在這個既有 `parseExpression()` 呼叫後面加一個「偵測尾隨 `^0`」的檢查，是一個
小、可加、不會有語意衝突的動作，不是重新設計敘述句 dispatch。既有的窄快速路徑（`IDENT` 緊接
`CARET`）完全沒動，`x^0` 這種最常見的寫法零回歸風險；新檢查只在沒命中那條快速路徑的複合運算式
才會觸發。

**這也讓「任意運算式」（而非只放寬到語料需要的那幾種型別）變成零額外成本的自然範圍**——限縮成白名單
反而需要*額外*程式碼（型別檢查去拒絕其他型別），沒有任何好處，因為現有的消歧邏輯本來就對任何運算式
形狀一視同仁。

**透過 `roundTripFromPython` 的實際管線（`packages/transpiler-eml/src/index.ts`）確認兩處修正都是
必要的，不是可選的**——跟項目 5 的 `print(end=)`（刻意永遠只做反向）不同：`roundTripFromPython`
反向解析後，先用 `eml-emitter.ts` 產生 EML 文字，再**用正向 parser 重新解析那段 EML 文字**
（`transpileEmlToPython`），比對它重新產生的 Python 跟 canonical Python 是否一致。如果只放寬
`eml-emitter.ts`（讓它能寫出 `EXPR^0` 文字）而沒教正向 parser 讀懂,第三步會用一個全新的
「forward EML->Python failed」錯誤失敗，而不是成功。這輪雙向都做是語料 KPI 真的要往前推進的必要
條件，不是錦上添花。

**修正**：兩個檔案各改一小段。`packages/parser/src/parser.ts` 的 `parseStatement()` fallback（既有
`const expr = this.parseExpression();` 之後，跟既有的 `ARROW`/複合賦值檢查並列）新增尾隨 `^0` 偵測；
`packages/transpiler-eml/src/eml-emitter.ts` 的 `Output` case 移除 `stmt.value.type !== 'Identifier'`
的 throw，一律 emit `${emitEmlExpression(stmt.value)}^0`（既有的 `stmt.end !== undefined` 檢查維持
在前面不動——項目 5 的永久限制）。11 個新測試（`tests/phase9-output-any-expression.test.ts`），
外加修正 2 個既有測試檔案裡斷言舊限制的測試（`tests/reverse-regression.test.ts` 刪掉一個現在已經
可表達的案例；`tests/phase9-slice.test.ts` 把一個原本斷言「仍會失敗」的測試翻轉成「現在完整通過」）。
823 測試（原 813）。全新的字串字面量/呼叫運算式/`%`格式化運算式直接輸出片段都做了完整 CLI 端到端
驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組一致）。

**重新量測同 5 個真實檔案，達成一個重要里程碑**：`Decimal_to_binary_convertor`、
`Duplicate_files_remover`、`Leap_Year_Checker` **全部新達成完整的 `eml roundtrip` 通過**，加上原本就
通過的 `text_to_morse_code`——**5 個追蹤中的真實 B-6 語料檔案，現在有 4 個完整通過**，比兩輪前的
1 個大幅躍進。`Calculate_age` 仍卡住，而且完全符合預期：它的第一個 print 敘述句同時有「非裸變數
value」（這輪修好了）跟「`end=""` 具名參數」（項目 5 既有的永久限制，這輪沒動）兩個問題，
`eml-emitter.ts` 先檢查 `end` 才檢查 value 型別，所以這個檔案的卡點完全沒變——用一個專屬的回歸測試
鎖住「這輪沒有不小心動到項目 5 的決定」。詳見 `docs/agent-handoff.md`「Core 語法放寬」章節、
`docs/EML-LANG-2026-v1.0.md` §5.3、§9。

---

## Core 語法放寬（續）：`print(x, end=...)` 支援正向語法 `EXPR^0(END_EXPR)` — 已完成 2026-07-19（同日再一輪）— 5/5 全部通過

`^0` 放寬那輪之後，`Calculate_age` 是唯一剩下卡住的檔案，卡點就是項目 5（`print(x, end=...)`）—— 這
是一個 Neo 之前明確決定過的**永久、單向限制**：問過直接不決定發明正向語法。這輪 Neo 主動要求重新
研究這個決定，因為切片/列表推導式那幾輪的動能顯示很多「看起來麻煩」的限制其實都可以用小範圍修正
解決。**直接研究（Explore agent + 我自己後續補查）確認這是可以做的，不是撞牆**：正向 EML 完全沒有
一般性的具名參數呼叫語法（`parseArgs()` 純位置參數；decorator 的具名參數是完全獨立的機制），所以
不需要為了 `end=` 發明整個語言的具名參數系統，範圍可以完全收在 `^0` 自己的專屬文法裡。確認零衝突
風險：`^0` 消耗完 `CARET NUMBER('0')` 後，下一個 token 現在規定必須是 NEWLINE/DEDENT/EOF，所以
`^0` 後面接 `LPAREN` 現在保證是既有的 parse error，不會跟任何現有程式衝突。

**設計決定交給 Neo（AskUserQuestion）**：新語法選了 `EXPR^0(END_EXPR)`（終結符運算式接在 `^0`
後面的括號裡，例如 `msg^0("")`），而不是逗號分隔的 `EXPR^0, END_EXPR`——視覺上最不會跟任何東西
混淆，也呼應專案裡已有的「括號 = 緊接在 sigil 後面的額外資訊欄位」慣用語（`^+(...)`）。

**直譯器的修正比原本預估的小很多**：`packages/interp/src/index.ts` 的 `write(text)`（把文字塞進
`out: string[]`）整個檔案裡只有**一個**呼叫點——就在 `Output` case 裡。`finalize()` 原本統一對
`out` 裡每一筆補上 `\n`。因為只有一個呼叫者，把換行符號的決定權移進 `write(text, end = '\n')`
自己（直接 push `text + end`），`finalize()` 簡化成單純 `out.join('')`，是一個約 4 行的小修正，
不是「結構性重寫」——對所有既有程式（永遠只用預設 `'\n'`）輸出逐位元組不變。

**修正**：正向 parser（`parser.ts`）在兩個既有的 `Output` 建構點（`IDENT`+`CARET` 快速路徑 + 這個
支線稍早新增的通用 `EXPR^0` fallback）都加上一個新的 `parseOptionalOutputEnd()` 共用 helper，解析
`^0` 後面可省略的 `(END_EXPR)`；`eml-emitter.ts` 的 `Output` case 改成 emit `end` 而非拋錯；正向
Python emitter 加上 `, end=${...}`；直譯器如上述小改；C++ 後端明確拒絕帶 `end` 的 Output（`end`
現在正向可達，之前不可能出現在 C++ 路徑）+ `statementCallsName` 補上 `end` 的遞迴檢查；4 個語意
分析 walker（`semantic.ts`、`purity.ts` 兩處、`importance.ts`、`loop-classifier.ts`）+
`cts-generator.ts` 的 deps 收集都補上對 `stmt.end` 的遞迴。12 個新測試（`tests/
phase9-output-end.test.ts`），外加修正 2 個既有測試檔案裡斷言舊「永久限制」的測試（`tests/
phase9-print-end.test.ts` 4 個測試從「預期失敗」翻轉成「現在完整通過」；`tests/
phase9-output-any-expression.test.ts` 1 個「Calculate_age 仍卡住」的回歸測試翻轉成「現在完整
通過」）。835 測試（原 823）。全新的自訂終結符片段（兩個 print 接續在同一行）做了完整 CLI 端到端
驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組一致）。

**重新量測同 5 個真實檔案，達成整條 B-6 語料追蹤工程裡最大的里程碑**：`Calculate_age` **完整通過
`eml roundtrip`**，加上原本就通過的 `Decimal_to_binary_convertor`、`Duplicate_files_remover`、
`Leap_Year_Checker`、`text_to_morse_code`——**5 個追蹤中的真實 B-6 語料檔案，現在全部（5/5）完整
通過**。這是這整個語言擴充+ B-6 語料追蹤工程開工以來，第一次達成語料庫的全數通過。詳見
`docs/agent-handoff.md`「Core 語法放寬（續）」章節、`docs/EML-LANG-2026-v1.0.md` §5.3、§9。

