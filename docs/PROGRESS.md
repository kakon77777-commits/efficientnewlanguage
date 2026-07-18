# EML 進度光譜表 — 工作單備錄

**這份文件是什麼**：EML 專案的即時進度儀表板。跟 `docs/roadmap.md`（規劃「要做什麼、為什麼」）分工——這份文件只回答「現在做到哪、還剩多少」，每完成或更新一次工作就同步一次，不是寫完就放著的靜態文件。

**為什麼值得這樣維護**：EML 是公司的核心主力專案。不是因為它現在最賺錢，而是因為它是技術力的展示與獨特品牌的核心——這是一個長期方案，是最需要打磨、最值得做到完美的專案。進度追蹤本身也是這種「認真打磨」態度的一部分。

---

## 光譜量尺

每個項目用 5 格光譜標示目前所在階段：

| 光譜 | 階段 | 意義 |
|---|---|---|
| `░░░░░` | 0 未開始 | 尚未動工，可能連規劃都還沒開始 |
| `█░░░░` | 1 探索中 | 研究/找方向中，還沒有可展示的產出 |
| `██░░░` | 2 進行中 | 已經在寫，架構或範圍已定，尚未收斂 |
| `███░░` | 3 MVP 完成 | 核心功能跑得起來、有測試把關，但範圍/打磨還有明確缺口 |
| `████░` | 4 打磨中 | MVP 之後的擴展/上架/硬化工作進行中 |
| `█████` | 5 完成 | 已上線／已發佈／已達成完成標準 |

---

## 語言本體（Phase 0–7）

| 項目 | 光譜 | 備註 |
|---|---|---|
| Phase 0–7：完整語法 + 雙向轉譯 + 冷熱/結晶化 + 時間迴圈 + 執行真相直譯器 + CTS + C⁺⁺⁺ 原型 | `█████` 5 | 538 測試全綠，已 commit + push + 網站部署上線。詳見 `docs/agent-handoff.md` 各 Phase 章節。 |

## Phase 8 — 商用化與實用層（`docs/roadmap.md` 對照編號）

### A. 實用化（降低採用門檻）

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| A-1 | LSP 語言伺服器 | `███░░` 3 | MVP 完成 2026-07-14（`@eml/lsp` + 最小 VS Code 外掛，診斷/hover/completion）。缺口：跳轉定義、inline trace、Unicode 位置精確度、npm 包裝、Marketplace 上架。 |
| A-2 | 編輯器外掛打磨 | `█░░░░` 1 | 目前只有 A-1 附帶的「證明能動」雛形（無 icon、無上架、無 inline trace）。真正打磨未開始。 |
| A-3 | 好裝好跑（npm / `npx eml` / SEA 執行檔） | `░░░░░` 0 | 未開始。 |
| A-4 | 擴大支援子集（真實程式碼覆蓋率） | `█░░░░` 1 | 兩個真實移植案例（Tic-Tac-Toe 2026-07-14、Number Guessing Game 2026-07-16，後者是程序式非 class 風格，互補前者）當資料點，但還不是系統性的語料驗證。 |

### B. 可信度規模化

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| B-5 | 公開 conformance suite / fuzz testing | `███░░` 3 | MVP 完成 2026-07-16。`docs/conformance.md` 把既有兩層閘控（fixtures 精確文字對照 + examples 執行真相對照）包裝成外部可驗證文件，`pnpm eml test` 免 vitest 即可跑。缺口：fuzz/property testing 未做。 |
| B-6 | 真實語料驗證（壓縮率/往返等價率 KPI） | `████░` 4 | 2026-07-16 第一次正式量測發現反向 Python→EML 完全不支援區塊敘述句（詳見工作日誌），Neo 確認投入，同日完成 **Phase A**（if/elif/else、while、for...in）+ **Phase B1**（break/continue）+ **Phase B2**（dict/set 字面量 + subscript）+ **Phase C**（attribute access + `import module`）+ **Phase D**（try/except/finally + raise，`bound` 作用域刻意比 if/elif/else 更保守，照抄正向語意分析器自己的既有邏輯；順帶抓到 `pass` 跟 Phase A 修復前的 break/continue 一模一樣的靜默誤譯漏洞並修掉）。反向方向現在只剩 `def`/`class` 沒做。重新量測同 5 個真實檔案，這次有具體進展：`Decimal_to_binary_convertor` 從卡在第 1 行的 `try:` 一路推進到第 3 行卡在 `or` 布林運算子（另一個既有、非本輪範圍的缺口）。過程中也誠實發現一個全語言層級的既有邊界（非任何一輪的缺陷）：EML 從 Phase 0 開始就沒支援過跨行的括號類字面量。從「探索中」升到「MVP 完成」——反向方向的語法覆蓋已經非常完整，只剩 def/class 這個最後、最大的一塊（Phase E）。**同日再完成 Phase E1**：函式定義 + `return`（僅 `@cold`/中性子集）也雙向轉譯了。動工前先驗證出兩個關鍵發現：`@cold`/`@hot` 在正向 emitter 裡不對稱（`@cold` 是真 decorator，`@hot` 只是註解，而註解永遠不會被反向 lexer tokenize）——**`@hot` 是永久性、非暫緩的往返缺口**，跟 `async`/`await` 同一類；`import functools` 是正向語意分析器自動合成的樣板碼，反向解析器需特別跳過以免重複轉譯後多出一行。函式主體引入第一個「雙向都隔離」的 `bound` 作用域規則。重新量測同 5 個真實檔案：`Duplicate_files_remover` 從卡在 `def hashFile`（第 7 行）推進到 `with open(...) as file:`（第 11 行）——`with` 是全新、範圍外的另一個缺口，證明 `def` 現在真的能完整處理過去了。632 測試（原 620）。反向方向現在只剩 `class` 沒做（`@hot` 是函式支援範圍內的永久性例外，不是缺口）。**2026-07-17 完成 Phase E2（最後一輪）**：`class`（最小可行 OOP）也雙向轉譯了，**收尾整個反向 Python→EML 轉譯器工程**——Phase 0–7 所有能往返的語法現在全部往返了，這是全系列最小的一輪（`ClassDef` 只是 `{ name, body }`，方法就是普通巢狀 `FunctionDef`，幾乎不需要新邏輯）。過程中訂正了 Phase E1 一個描述不夠精確的地方：`@hot` 的往返失敗其實是靜默的不一致（mismatch），不是拋出的解析錯誤。637 測試（原 632）。**從「MVP 完成」升到「打磨中」**——原因是：反向轉譯器本身的工程範圍已經完整封頂（沒有任何 Phase 0–7 語法還缺），但 B-6 這個 KPI 本身（真實語料能不能完整跑過 `eml compress`）還卡在另一層——這 5 個真實檔案目前的缺口（`%`、`or`、`with`、跨行字面量）**不是反向轉譯器的缺陷，而是 EML 語言本體目前就沒有的語法**（正向也沒有），要讓真實語料真的通過，需要的是語言本體擴充，不是這個系列的工程範圍；等 Neo 決定要不要往那個方向投入。 |
| B-7 | AI 路徑（`eml suggest`）服務化前的安全/沙箱強化 | `░░░░░` 0 | 未開始（Phase 1 當時的 adversarial review 已經硬化過核心驗證器，但這裡指的是「服務化」前的額外強化）。 |

### C. AI / Agent 層（roadmap 認定的核心差異化）

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| C-8 | MCP server / Agent 工具 | `█████` 5 | 完成 2026-07-16。`@eml/mcp` 7 個工具（parse/transpile_python/transpile_eml/interpret/trace/roundtrip/health），鏡像網站 `/ai/tools/*` REST API 的 envelope/限制/錯誤語意，repo 根目錄 `.mcp.json` 已接上。559 測試（含 in-process protocol 整合測試 + 真實 stdio entry point 手動驗證）。roadmap 建議的第二優先，已完成。 |
| C-9 | AI 輔助壓縮即服務（付費 API） | `░░░░░` 0 | 未開始。 |

### D. PHOSPHOR / 可觀測性

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| D-10 | trace → 企業稽核/政策/合規層 | `░░░░░` 0 | 未開始。 |

### E. 商業模式與生態

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| E-11 | 開放核心定價分層 | `░░░░░` 0 | 未開始。roadmap 建議的第三優先。 |
| E-12 | CLA + 貢獻指南 | `░░░░░` 0 | 未開始（Apache-2.0 授權本身已經就位，CLA 文件/流程尚未）。 |
| E-13 | 技術社群發表/教學/案例內容 | `░░░░░` 0 | 未開始。 |
| E-14 | 北極星指標定義 | `░░░░░` 0 | 未開始。 |

---

## Phase 9 — 語言本體擴充（real-corpus language gaps，`docs/roadmap.md` 對照編號）

反向轉譯器工程（Phase 8 B-6）收尾後發現的新分類：B-6 那 5 個真實檔案卡住的部分缺口是 **EML 語言
本體本身就沒有的語法**（雙向都沒有），不是反向工程的缺陷，需要另一輪、雙向都要動工的擴充。

| # | 項目 | 光譜 | 備註 |
|---|---|---|---|
| 9-1 | `and`/`or` 布林組合子 | `█████` 5 | 完成 2026-07-17。全新 `LogicalExpression` AST 節點貫穿正向 lexer/parser/emitter + 6 個語意分析 walker + 反向 parser/emitter + 直譯器 + C⁺⁺⁺ prototype——比任何一輪反向轉譯器工程觸及的檔案都多，因為這是雙向 + 全分析層都要貫穿的新 Expression 型別。3 份獨立維護的 precedence table 要一致改號；3 個 walker 有非編譯期強制的 `default:` 兜底（跟 Phase 3b 漏掉 `Await` 同一類風險），都補上並用真測試鎖住。關鍵語意直接對照真實 Python 執行驗證：`and`/`or` 回傳的是運算元本身（不是永遠布林值），且是真短路，直譯器用「求值一次 left、依真假分支、right 不需要就真的不求值」實作，用一個「若被求值就會報錯」的呼叫式驗證過。C⁺⁺⁺ prototype 對應到 `&&`/`||`（記錄為已知簡化），但「藏在 and/or 後面的自我遞迴」仍正確被攔下，沒有變成生成壞 C++ 的破口。662 測試（原 637）。CLI 端到端驗證 + 重新量測同 5 個真實檔案：`Decimal_to_binary_convertor` 從卡在 `or`（第 3 行）推進到第 7 行的 `bin(dec)[2:]`——全新缺口（Python 序列切片，跟 EML 自己的 `[a:b]` 區間字面量是不同語意），證明 `and`/`or` 本身現在真的完整可用；`Leap_Year_Checker` 沒變化（符合預期，`%` 同行更早出現）。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.8。 |
| 9-2 | 數值取模 `%` | `█████` 5 | 完成 2026-07-17。跟 9-1 不同，`%` 重用既有 `Binary` 節點（只是擴充 `BinaryOperator`），不是新 Expression 型別——動工前直接讀過 6 個語意分析 walker + `OverlayAssign` 解析邏輯，證實全部已通用處理，零改動。真正的工作集中在兩個方向的 lexer/parser 新 token + 3 份 emitter 的 `nonAssoc` 判斷（`%` 跟 `-`/`/` 一樣非結合律）。**關鍵語意直接對照真實安裝的 Python（3.14.5）驗證**：Python `%` 是 floor-mod（取除數正負號，`-7 % 3 == 2`），跟 JS/C++ 原生 `%`（取被除數正負號，同式子是 `-1`）不同，`@eml/interp` 用 `((a % b) + b) % b` 技巧轉換；取模除以零丟 `ZeroDivisionError('division by zero')`（int/float 同一訊息，也是直接測真實 Python 才確認）。字串 `%`（printf 格式化）defer 成 `Unsupported`，不是拋錯或算錯。C⁺⁺⁺ prototype 加了字面量層級防護（非整數字面量直接 `E_CPP_UNSUPPORTED`，因為 C++ `%` 是整數限定）。677 測試（原 662）。全新閏年片段 CLI 端到端驗證通過（輸出 50，與真實 Python 一致）。重新量測同 5 個真實檔案，**兩個卡在 `%` 的檔案都有具體進展**：`Leap_Year_Checker` 推進到第 4 行三引號字串（對應項目 9-4）；`Calculate_age` 推進到第 21 行 `(not leap_year)`——**這輪意外發現的全新缺口**（`not` 一元布林反轉，之前被 `%` 擋住從沒量測到），列為新項目 9-8。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.2。 |
| 9-3a | 元組字面量 + `%` 格式化 | `█████` 5 | 完成 2026-07-18。重新檢視 `Calculate_age` 第 48 行才發現這行一次卡了 3 個獨立缺口：`%` 格式化本身、元組字面量 `(name, year)`（EML 之前完全沒有元組型別）、`print(..., end="")` 具名參數（項目 9-5）。確認 `.format()`（另一套機制，見 9-3b）目前 5 個真實語料檔案都還沒有任何一個真的走到，於是收斂範圍成語料真正觸及的一半。全新 `TupleLiteral` AST 節點（照抄 `ListLiteral` 形狀），零新詞法 token、零優先權重新編號（元組跟 List 一樣是 atom 分層）——這系列少見的輕量一輪；唯一真正新邏輯是正向/反向解析器 `(` 的消歧（`(x)` 沒逗號維持單純分組、`(x,)` 才是真元組，跟真實 Python 一致）。直譯器做了真正的語意：printf 風格 `%s`/`%d`/`%f`/`%%` mini-language，`%d` 對浮點數朝零截斷，所有錯誤訊息都直接對照真實 Python 驗證；元組值本身刻意只做語料需要且「免費」的部分（真值/相等性/`in`/`for`/下標讀取/`str`/`repr`），刻意不做算術/大小比較/可雜湊性（誠實記錄為已知缺口，非草率部分實作）。C⁺⁺⁺ 對元組整體拒絕（`E_CPP_UNSUPPORTED`），藏在元組裡的自我遞迴仍被既有前置檢查正確攔下。724 測試（原 696）。CLI 端到端驗證通過。重新量測同 5 個真實檔案：`Calculate_age` 從卡在元組/`%`格式化本身，推進到**同一行**的 `end=""`（項目 9-5，還沒做）——誠實記錄「往前推進但沒整個跑通」；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/cpp-feasibility.md`、`docs/EML-LANG-2026-v1.0.md` §5.10。 |
| 9-3b | `.format()` 方法呼叫 | `█████` 5 | **2026-07-18 查證：其實已經能用，不需要另外實作。** 這輪做項目 9-4 的語料重新量測時意外發現：`.format()` 本質上就是一個普通 attribute-call（Phase 7c 通用機制），零新程式碼正向解析、正向 emit、反向往返全都已經能動（直接測試驗證過）。跟 numpy `<M>`/`^T` 同一類，純 JS 直譯器不模擬其內部語意（`unsupported`），`eml run` defer 給真實 Python 執行——既有已接受模式，不是缺口。`Leap_Year_Checker` 真正卡點跟 `.format()` 無關，是既有的 `^0` 裸變數限制，非新語言缺口。 |
| 9-4 | 三引號字串 `"""..."""` | `█████` 5 | 完成 2026-07-18。動工前直接讀過程式碼確認：`StringLiteral` AST 沒有引號風格欄位，正向/反向解析器、3 份 emitter、7 個語意分析 walker、直譯器全都已經通用處理字串——這輪純粹是 lexer 層級擴充，零 AST/parser/emitter/walker 改動，是這條 Phase 9 支線目前最輕量的一輪。兩個 lexer 的字串分支都新增「目前位置是否為 3 個連續同種引號字元」的檢查，是的話走三引號路徑，否則維持原本單引號路徑，兩條路徑共用同一份跳脫字元處理邏輯。**動工前直接驗證（不是假設）**：多行三引號字串內容的換行字元不會被縮排敏感的 lexer 誤判成 INDENT/DEDENT——字串讀取迴圈自己消耗掉每個字元（含換行），外層的縮排偵測邏輯只在自己專屬的换行分支才會觸發，字串迴圈跑完前根本不會把控制權交還給外層。734 測試（原 724）。全新 docstring 片段 CLI 端到端驗證通過。重新量測同 5 個真實檔案：`Leap_Year_Checker` 完全推進過 3 段 docstring，卡點換到 `.format()` 那行——追查後發現這不是新缺口（見上方 9-3b）；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.11。 |
| 9-5 | `print(x, end="")` 等關鍵字參數 | `█████` 5 | 完成 2026-07-18（純反向，刻意不設計新正向語法——直接問過 Neo，不是自己決定）。這是第一個真的需要發明全新 EML 具體語法的項目（`^0` 只認裸變數是刻意設計），選擇反向轉譯器認得 `print(x, end=...)`、但正向 EML 永遠沒有語法表達自訂結尾。後果：`eml compress` 對 `Calculate_age` 那行還是失敗，但失敗點從難懂的 parser 斷言變成清楚誠實的訊息，跟 `await`/`async`/C++ 版 numpy 同一套紀律。範圍比預估小很多：只有反向解析器（產生 `end` 欄位）+ 反向 EML emitter（唯一會檢查、丟錯的地方）需要動，正向解析器/emitter、直譯器、7 個語意分析 walker、C++ 後端全部零改動（逐一讀過 12 個 `case 'Output'` 現場確認過）。`print(...)` 拿到專屬解析函式（照抄 `sum`/`range`/`np` 的既有慣例），不改共用的 `parseArgs()`，共用的 `FunctionCall` 型別（12 檔案在用）完全不用動。744 測試（原 734）。CLI 端到端驗證通過。重新量測同 5 個真實檔案：`Calculate_age` 仍未完整通過 `eml compress`（設計上預期、可接受的結果），但失敗點精準落在刻意設計的限制上；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.3。 |
| 9-6 | `with` / context manager | `█████` 5 | 完成 2026-07-19。動工前先把 `Duplicate_files_remover` 從第 11 行（`with`）逐行追蹤到 EOF，誠實確認：光做 `with` 沒辦法讓這個檔案完整通過 `eml compress`——第 26 行 `[f for f in os.listdir() if os.path.isfile(f)]` 是一個全新、之前從未被發現的**列表推導式**缺口（因為量測每次都卡在第 11 行，從沒真正走到過第 26 行），這輪範圍就做 `with` 本身，列表推導式列為新的未編號候選項目。照抄 Phase 7d（`try`/`except`）先例：EML 具體語法就是 Python 關鍵字語法原文照搬，直譯器做真正的 `__enter__`/`__exit__` 協定派送（重用 Phase 7e 既有的 `findMethod`/`runMethodBody`），連檢查順序（`__exit__` 比 `__enter__` 先檢查）跟例外抑制語意都直接對照真實安裝的 Python 驗證過。759 測試（原 744）。CLI 端到端驗證通過（含例外抑制分支）。重新量測同 5 個真實檔案：`Duplicate_files_remover` 完全推進過 `with`，卡點換到第 26 行列表推導式；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md`「Phase 9 item 6」小節。 |
| 9-7 | 跨行括號類字面量 | `█████` 5 | 完成 2026-07-19，Phase 9 支線最後一個原本有編號的項目。跟另外兩個未編號候選（Python 切片語法、列表推導式）比較過規模後選的：那兩個都要發明新 `Expression` AST 節點、貫穿 7 個語意分析 walker + 直譯器 + 3 份 emitter，項目 7 直接讀過兩個 lexer 確認純 lexer 層級、零 AST/parser/walker/emitter 改動，跟項目 4 同一類，三個裡最小。根本原因：兩個 lexer 都完全沒有括號深度追蹤，加了 `bracketDepth` 計數器，換行處理跟縮排偵測只在深度 0 時才觸發。動工中順手發現、一起修的小問題：測真實語料時發現 `text_to_morse_code` 字典最後一個 entry 有 trailing comma，純括號深度修復還不夠，於是同一輪也補上 trailing comma 支援（單行、多行都適用）——夠小、夠緊密耦合才收進來，不像其他發現另外記錄。770 測試（原 759）。CLI 端到端驗證通過。重新量測同 5 個真實檔案：`text_to_morse_code` 從第 2 行一路推進到第 38 行 `for i in range(length):`——揭露第三個本輪意外發現的缺口：反向 `range(...)` 辨識只支援兩參數形式，不支援 Python 常見的單參數簡寫 `range(n)`。誠實記錄、不動手修。其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.12。 |
| 9-8 | `not` 布林一元反轉運算子 | `█████` 5 | 完成 2026-07-17。跟 9-1 同一套機制家族（全新 `NotExpression` AST 節點，貫穿正向 lexer/parser/emitter + 7 個語意分析 walker——比 9-1 的 6 個多一個，因為 `cts-generator` 這輪從一開始就知道要補——+ 反向 parser + 直譯器），但兩點不同：Python 的 `not`永遠回傳真正的布林值（不像 `and`/`or`回傳運算元本身，這點更簡單），而且需要一個全新的優先權層級（這個系列第 4 次重新編號 3 份獨立 precedence table）。**這輪最關鍵的發現**：C++ 的 `!` 比較運算子的優先權順序跟 Python 的 `not` 完全相反——Python `not x > 5` 意思是 `not (x > 5)`（`not` 比較鬆），但真實 C++ 的 `!x > 5` 會解析成 `(!x) > 5`（`!` 比較緊）；沿用共用的 precedence 機制會靜默生成語法看起來合理、語意卻錯誤的 C++，所以 C++ 後端的 `Not` case 直接跳過 `child()`/`precedence()`，永遠把運算元包進括號（`!(...)`），用一個專門測試鎖住「`not x > 5` 必須生成 `!(x > 5)`，不能是錯的 `!x > 5`」。另外在自己寫測試時抓到一個真的 bug：`¬`Unicode 符號如果照抄 `∧`/`∨`的雙邊空格替換會在 `¬`出現在行首時插入多餘的縮排空格，讓縮排式 lexer 誤判——修成只留右邊空格。696 測試（原 677）。CLI 端到端驗證（閏年計數+否定片段，輸出 50 與真實 Python 一致）+ 重新量測同 5 個真實檔案：`Calculate_age` 從卡在 `not`（第 21 行）推進到第 48 行的 `(name, year)`元組字面量，是項目 9-3 的子細節（已在上方記錄），不是新缺口。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/cpp-feasibility.md`、`docs/EML-LANG-2026-v1.0.md` §5.9。 |

---

## 工作日誌（新到舊）

- **2026-07-19** — 完成 **Core 語法放寬（續）：`print(x, end=...)` 支援正向語法
  `EXPR^0(END_EXPR)`——達成整條 B-6 語料追蹤工程裡最大的里程碑：**5 個追蹤中的真實語料檔案，
  現在全部（5/5）完整通過**。`^0` 放寬那輪之後，`Calculate_age` 是唯一剩下卡住的檔案，卡點就是
  項目 5——Neo 之前明確決定過的永久、單向限制。Neo 主動要求重新研究這個決定，並提出：如果真的
  很麻煩，就該公告成已知問題，不要默默放著。**直接研究（Explore agent + 我自己補查）確認這是
  可以做的，不是撞牆**：正向 EML 完全沒有一般性的具名參數呼叫語法（`parseArgs()` 純位置參數，
  decorator 的具名參數是獨立機制），所以不需要為 `end=` 發明整個語言的具名參數系統；`^0` 消耗完
  `CARET NUMBER('0')` 後，下一個 token 規定必須是 NEWLINE/DEDENT/EOF，所以 `^0` 後面接 `LPAREN`
  現在保證是既有的 parse error，零衝突風險。**設計決定交給 Neo（AskUserQuestion）**：新語法選了
  `EXPR^0(END_EXPR)`（例如 `msg^0("")`），呼應既有的 `^+(...)` 慣用語。**直譯器修正比預估小很多**：
  `write()` 整個檔案只有一個呼叫點，把換行符號決定權移進 `write(text, end)` 自己、`finalize()`
  簡化成 `out.join('')`，約 4 行小修正，對既有程式輸出逐位元組不變。兩個檔案各加一小段（parser
  共用 helper 解析可省略的 `(END_EXPR)`、eml-emitter 改成 emit 而非拋錯）+ 正向 Python emitter/
  直譯器/C++ 後端拒絕/4 個 walker + cts-generator 都補上對 `end` 的處理。抓到並修正 2 個既有測試
  檔案裡斷言「永久限制」的測試（`phase9-print-end.test.ts` 4 個測試翻轉、`phase9-output-any-
  expression.test.ts` 1 個回歸測試翻轉）。12 個新測試，835 測試（原 823）。全新的自訂終結符片段
  做了完整 CLI 端到端驗證。**重新量測同 5 個真實檔案**：`Calculate_age` 完整通過，加上原本就通過
  的其餘 4 個——**5/5 全部完整通過 `eml roundtrip`**，這是整個語言擴充+ B-6 語料追蹤工程開工以來
  第一次達成語料庫全數通過。詳見 `docs/agent-handoff.md`「Core 語法放寬（續）」章節、
  `docs/EML-LANG-2026-v1.0.md` §5.3、§9。
- **2026-07-19** — 完成 **Core 語法放寬：`^0` 輸出支援任意運算式**（不是 Phase 9 編號項目——這條
  規則寫在語言 Core 文法裡，比 Phase 9 支線本身還早存在）。Phase 9 支線全部收尾後重新量測，發現
  剩下卡住的 4 個檔案卡點全部歸結到同一個根因：EML 的 `^0` 原本規定運算元必須是裸變數
  （`OutputStatement ::= Identifier "^0"`）。Neo 確認先做這個（範圍小、明確），EML-APL/Nova
  Operator IR 橋接（同日稍早審閱過的白皮書+封存包，見記憶）留給獨立的未來專案。**直接研究把風險
  評估整個翻轉成正面**：限制其實只在兩處強制（`eml-emitter.ts` 的型別檢查 + 正向 parser 唯一的
  `OutputStatement` 建構點），AST/正向 Python emitter/直譯器/全部 7 個 walker 本來就把 `Output.value`
  當一般運算式處理，零改動。**關鍵發現**：`parsePower()` 本來就有 `Number(n.value) !== 0` 的既有
  讓步——`CARET` 緊接字面 `0` 永遠不會被吃成次方運算，不管深度多深——這代表既有的
  `parseExpression()` fallback 解析完任意運算式後，尾隨的 `^0` 永遠不會被吃掉，讓正向 parser 的
  放寬變成小、安全的加法，不是重新設計；也讓「任意運算式」比「只放寬語料需要的幾種型別」還更省
  程式碼（白名單反而要多寫拒絕邏輯）。透過 `roundTripFromPython` 實際管線確認雙向都做是必要的，
  不是可選的（跟項目 5 的 `print(end=)` 不同）。兩個檔案各改一小段（`parser.ts` 新增尾隨 `^0`
  偵測、`eml-emitter.ts` 移除型別檢查）。修正過程中抓到 2 個既有測試斷言舊限制（一個直接刪掉，
  一個從「預期失敗」翻轉成「現在完整通過」）。11 個新測試，823 測試（原 813）。全新的字串字面量/
  呼叫/`%`格式化直接輸出片段做了完整 CLI 端到端驗證。**重新量測同 5 個真實檔案，達成重要里程碑**：
  `Decimal_to_binary_convertor`、`Duplicate_files_remover`、`Leap_Year_Checker` 全部新達成完整通過，
  加上 `text_to_morse_code`——**5 個追蹤檔案現在有 4 個完整通過**，比兩輪前的 1 個大幅躍進。
  `Calculate_age` 仍卡住，完全符合預期：第一個 print 同時有非裸變數 value（這輪修好）跟 `end=""`
  （項目 5 既有永久限制，這輪沒動）兩個問題，`eml-emitter.ts` 先檢查 `end` 才檢查型別，卡點沒變，
  用專屬回歸測試鎖住。詳見 `docs/agent-handoff.md`「Core 語法放寬」章節、
  `docs/EML-LANG-2026-v1.0.md` §5.3、§9。
- **2026-07-19** — 完成**未編號候選：列表推導式 `[expr for x in iterable if cond]`，雙向——
  這是整條 Phase 9 語言擴充支線裡最後一個未編號的獨立候選，做完之後這條支線已知的候選全部收尾**。
  直接重新抓了真實語料（`Python-World/python-mini-projects` 的 `duplicatefileremover.py`）確認
  `Duplicate_files_remover` 唯一需要的形式是 `filelist = [f for f in os.listdir() if
  os.path.isfile(f)]`——一個 `for` 子句、一個 `if` 過濾子句、不轉換綁定變數，刻意只做這個形狀
  （不支援巢狀推導式、不支援多個過濾子句，沒有語料證據）。**設計決定交給 Neo（AskUserQuestion）**：
  正向 EML 的括號文法原本沒有 for/if 關鍵字（不像切片有現成的 `:` 慣用語），但 EML 本來就一直
  直接沿用 Python 控制流關鍵字原文（`for...in`、`if/elif/else`、`try/except`、`with`、`class`），
  所以這個也當同一類處理，跟 `print` 的 `end=`（真的要發明全新語法）不同類——Neo 選擇**雙向都做**。
  新增 `ListComprehension` AST 節點——**跟既有的 `SumExpression`（Σ）共用同一個關鍵先例**：Σ 的
  迭代變數從來沒被任何語意分析 walker 宣告進任何作用域，直接讓目標語言自己的不外洩 generator/
  comprehension 語意接手，列表推導式的 `iterator` 也是同樣處理，不需要發明新作用域機制。但**不是
  只是 Σ 模型的語法糖**：`SumExpression.range` 型別鎖定 `RangeExpression`，Σ 只能對數字區間迭代；
  真實語料要對 `os.listdir()`（函式呼叫）迭代，是真正全新的能力——直譯器的 `iterableItems()`
  （`ForIn` 已經在用）本來就泛化到 list/tuple/str，直接重用。**反向側精度層級需要小心**：反向
  parser 自己的三元運算式是真實 Python 的 `a if t else b`（用 `if`/`else` 關鍵字），所以推導式的
  `iterable`/`condition` 子運算式必須用比三元運算式低一級的精度解析（`parseOr()`），否則會把過濾
  子句自己的 `if` 誤吃成三元運算式的 `if`；正向側沒有這個問題，因為正向 EML 三元運算式用 `?`/`:`。
  貫穿 7 個語意分析 walker（比照 Sum 既有寫法，遞迴 `expr`/`iterable`/`condition`，永遠不碰
  `iterator`；動工中重新確認 `pnpm typecheck` 只抓到直譯器一個編譯錯誤，7 個 walker 全部手動補上）+
  直譯器（`evalListComp` 幾乎照抄 `evalSum`，只是用 `iterableItems()` 取代 `rangeInts()`）+ 3 份
  emitter（C⁺⁺⁺ 原型拒絕，跟 Σ 本身有支援不同）。813 測試（原 798），第一次跑就全過，沒有意外。
  全新的轉換/過濾/字串迭代片段做了完整 CLI 端到端驗證（`eml compress` → `eml roundtrip` → `eml
  run`，輸出跟真實 Python 逐位元組一致）。**驗證了迭代變數真的不會外洩**：推導式結束後讀取該變數
  會丟 `NameError`，跟真實 Python 3 完全一致。**誠實重新量測同 5 個真實檔案**：
  `Duplicate_files_remover` 的列表推導式本身已完全解除——`eml compress` 完整重建到
  `print("Deleted Files")` 那行才停——但**沒有達成完整通過**：卡點換成同一類既有限制的另一個實例
  （直接印字串字面量，不是裸變數）。其餘 3 個仍卡住的檔案沒有變化，卡點也都是這個既有限制的不同
  實例；`text_to_morse_code` 維持完整通過，沒有回歸。**這條 Phase 9 支線目前所有已知、已發現的
  獨立候選（編號 1-8 + 未編號的 `range(n)`、切片語法、列表推導式）現在全部收尾**——反向方向沒有
  任何已知未動工的語言缺口候選。**值得記錄但這輪刻意不動手的觀察**：剩下卡住的 4 個檔案，卡點
  現在全部歸結到同一個根因——EML 的 `^0` 輸出只能印裸變數。要不要投入放寬這個限制、放寬到什麼
  程度，是全新的語言設計決定，需要 Neo 之後判斷。詳見 `docs/agent-handoff.md`「Phase 9」章節、
  `docs/EML-LANG-2026-v1.0.md` §5.14。
- **2026-07-19** — 完成**未編號候選：Python 切片語法（`obj[a:b]`），雙向**。直接抓了真實語料
  （`Python-World/python-mini-projects` 的 `decimal_to_binary.py`）確認 `Decimal_to_binary_convertor`
  唯一需要的形式是 `bin(dec)[2:]`——只有起點。跟列表推導式比較過規模後選的：列表推導式還要從零
  設計 `if` 過濾子句文法（這個專案裡沒有先例）+ 一個不能外洩迴圈變數的全新作用域規則，切片只需要
  兩個可省略的子運算式，是較小的候選。**設計決定交給 Neo（AskUserQuestion）**：正向 EML 的 postfix
  `obj[...]` 原本完全沒有冒號偵測，這個文法位置是空的、沒有衝突風險——Neo 選擇**雙向都做**，正向
  EML 也學會 `obj[a:b]`／`obj[a:]`／`obj[:b]`／`obj[:]`。新增 `SliceExpression` AST 節點（`start`/
  `stop` 皆可省略）——**沒有重用既有的 `RangeExpression`**：Range 的邊界都必填、語意也不同（切片是
  從既有序列取子序列，Range 是產生一串整數給迭代用）。貫穿 7 個語意分析 walker + 直譯器 + 3 份
  emitter。**動工中發現一個值得記住的風險**：這 7 個 walker 裡有兩個是**非窮盡的**（`purity.ts`
  的 `collectCallsExpr` 有 `default:` 分支，另外幾個是 void 回傳、TypeScript 不會強制窮盡）——
  `pnpm typecheck` 在只做完 AST/parser/emitter 之後只抓到 1 個編譯錯誤（直譯器的 `evalExpr`），這
  7 個 walker 完全沒被編譯器攔到，漏加 `case 'Slice'` 會是靜默的分析缺口、不是編譯錯誤，所以每個
  都手動補上，風險較高的那個（`collectCallsExpr`）額外寫了專屬測試鎖住（把遞迴呼叫藏進切片邊界裡，
  斷言 C++ 後端真的抓到「Recursive function」而不是漏抓後才卡在「Subscript access」）。直譯器的
  `sliceGet` 做真正的 Python 切片語意（負索引、越界永遠 clamp、不丟 `IndexError`——這是切片跟一般
  subscript 索引的關鍵語意差異）。切片賦值（`lst[a:b] = ...`）刻意排除，直譯器遇到時丟
  `Unsupported`，不是靜默誤處理。798 測試（原 776）。全新字串/列表切片、負索引、越界 clamp 片段做
  了完整 CLI 端到端驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組
  一致）——過程中抓到一個測試方法上的失誤並修正：`eml run <file>` 一律把 `<file>` 當作 EML 原始碼
  解析（走 `transpileEmlToPython`），不是真實 Python，直接餵一個 `.py` 檔案進去不會乾淨報錯，而是
  靜默把裸 `=` 解析成別的東西；真正吃真實 `.py` 檔案的是 `eml compress`／`eml roundtrip`。**誠實
  重新量測同 5 個真實檔案**：`Decimal_to_binary_convertor` 的切片本身完全解除——`eml compress` 不
  再卡在 `bin(dec)[2:]`——但**沒有達成第二個完整通過**（跟規劃時的樂觀預期不同）：卡點那一行把切片
  結果包進 `.format()` 再直接 `print()`，命中一個完全獨立、早就存在的既有限制——EML 的 `^0` 只能
  印裸變數，不能表達 `print(<運算式>)`（跟 `Calculate_age` 卡住的 `print(x, end=...)` 同一類）。
  `Leap_Year_Checker` 卡點也是同一個既有限制，跟切片無關。`Duplicate_files_remover` 仍卡在列表
  推導式；`text_to_morse_code` 維持上一輪的完整通過，沒有回歸。反向方向現在只剩**一個**未編號的
  獨立候選：列表推導式。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md`
  §5.13、§9。
- **2026-07-19** — 完成**未編號候選：`range(n)` 單參數簡寫**，並達成**一個重要里程碑：
  `text_to_morse_code` 第一次完整通過 `eml roundtrip`（往返不動點達成，`python == canonical`）**
  ——這是 Phase 9 語言擴充支線追蹤至今的 5 個真實 B-6 語料檔案裡，第一個真正完整通過的。直接比較過
  三個未編號候選的真實規模後選的：Python 切片語法、列表推導式都需要發明全新 `Expression` AST
  節點、貫穿整條垂直切面（7 個語意分析 walker + 直譯器 + 3 份 emitter）；`range(n)` 經直接讀過
  反向解析器確認是整條 Phase 9 支線裡規模最小的修復——完全重用既有的 `RangeExpression` AST 節點
  （`range(n)` 產生的節點形狀跟 `range(0, n)` 一模一樣，只是隱含起點是字面量 `0`），不需要新
  token、不碰語意分析 walker、不碰任何 emitter、不碰直譯器，只改了 `parseRangeCall()` 這一個
  函式。跟 `range(a, b)` 一樣是純反向（正向 EML 本來就用自己的 `[a:b]` 區間字面量，沒有
  `range(...)` 呼叫語法）。刻意只做單參數 + 既有兩參數形式，不做三參數 step 形式——EML 自己的
  `[a:b]` 區間本來就沒有 step 概念，掃過全部 5 個真實語料檔案確認沒有任何一個用到三參數形式。
  776 測試（原 770）。全新 `range(5)` 求和片段做了完整 CLI 端到端驗證（`eml compress` →
  `eml roundtrip` → `eml run`，輸出跟真實 Python 逐位元組一致）。重新量測同 5 個真實檔案：
  繼上一輪的跨行括號字面量修復之後，這輪的 `range(n)` 修復接連清掉了 `text_to_morse_code` 剩下
  的兩個缺口，讓它成為整個 Phase 9 支線裡第一個真正完整通過 B-6 KPI 的真實語料檔案；其餘 4 個
  檔案（`Calculate_age`、`Decimal_to_binary_convertor`、`Duplicate_files_remover`、
  `Leap_Year_Checker`）仍然各自卡在自己已知的缺口上，沒有變化。反向方向現在只剩兩個未編號的獨立
  候選：Python 切片語法跟列表推導式，兩者都還沒動工。詳見 `docs/agent-handoff.md`「Phase 9」
  章節、`docs/EML-LANG-2026-v1.0.md` §9。
- **2026-07-19** — 完成 **Phase 9 項目 7：跨行括號類字面量**——這是 Phase 9 支線**最後一個原本就
  有編號的項目**，做完之後項目 1-8 全部收尾。動工前先跟另外兩個未編號候選（Python 切片語法、
  列表推導式）比較過真實規模再選：那兩個都需要發明全新的 `Expression` AST 節點，貫穿這個專案每次
  新增運算式型別都要付出的整條垂直切面——7 個語意分析 walker + 直譯器 + 3 份 emitter（跟 `Tuple`/
  `Not` 同一類工程量）。項目 7 經直接完整讀過兩個 lexer 確認**純粹是 lexer 層級，零 AST/parser/
  語意 walker/直譯器/emitter 改動**，跟項目 4（三引號字串）同一類，是三個候選裡最小的。**根本原因，
  直接讀過兩個 lexer 的完整 dispatch 迴圈確認，不是假設**：`packages/parser/src/lexer.ts` 跟
  `packages/transpiler-eml/src/py-lexer.ts` 都完全沒有任何括號深度追蹤——每個 `\n` 一律變成
  `NEWLINE` token，下一個非空白行一律跑縮排偵測邏輯，完全不管是不是還在一個沒閉合的括號裡面。
  兩個 lexer 都加了一個 `bracketDepth` 計數器（遇到開括號時 +1，對應閉括號時 -1），換行處理跟
  縮排偵測整段都改成只在 `bracketDepth === 0` 時才真的觸發——跟真實 Python 的隱式續行規則完全一致。
  **動工過程中意外發現、順手一起修的小問題**：測試這個功能對照真實語料檔案時，發現
  `text_to_morse_code` 的字典字面量最後一個 entry 結尾就是一個 trailing comma（`"z": "--..",`
  後面直接接 `}`），這是真實世界 Python 常見寫法，純粹的括號深度修復還是無法讓這個檔案完整通過——
  於是同一輪也補上了 trailing comma 支援（`[1, 2,]`、`{k: v,}`、`f(a, b,)`，單行、多行字面量都
  適用），因為這個缺口小到跟本輪主題緊密耦合（多行字面量幾乎必然搭配 trailing comma），不像其他
  發現的獨立缺口那樣另外記錄延後處理——這是判斷取捨、不是偷偷擴大範圍，每份文件都明確寫出來。
  770 測試（原 759）。全新多行字典字面量片段做了完整 CLI 端到端驗證（`eml run` 輸出跟真實 Python
  逐位元組一致）。重新量測同 5 個真實檔案，**誠實、真實的進展**：`text_to_morse_code` 從卡在第 2
  行（多行字典開頭）一路推進到第 38 行 `for i in range(length):`——揭露了**第三個本輪意外發現、
  之前從未被發現過的缺口**：反向解析器的 `range(...)` 辨識目前只支援兩個參數的形式
  （`range(a, b)`），不支援 Python 常見的單參數簡寫 `range(n)`（隱含起點 0）。誠實記錄而非動手
  修掉，跟另外兩個未編號候選一起列在下方；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`
  「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.12。
- **2026-07-19** — 完成 **Phase 9 項目 6：`with` / context manager**——這條支線最後一個未動工的
  項目，原本標記「規模最大最複雜、牽涉 `__enter__`/`__exit__` 資源管理執行語意，不只是語法」。
  動工前先把 `Duplicate_files_remover` 從第 11 行（`with open(filename, 'rb') as file:`）逐行追蹤
  到 EOF 才動手，誠實確認一個關鍵事實：**光做 `with` 沒辦法讓這個檔案完整通過 `eml compress`**——
  第 12-17 行（讀 buffer、`while(len(buf) > 0):`）都用既有機制能直接解析，但第 26 行
  `filelist = [f for f in os.listdir() if os.path.isfile(f)]` 是一個**列表推導式（list
  comprehension）**——這是全新、之前從未被發現、從未編號過的缺口（搜過 `docs/` 裡「comprehension」
  字樣，零匹配；因為這個檔案的量測每次都卡在第 11 行的 `with`，從沒真正走到第 26 行過）。於是這輪
  範圍就做 `with` 本身；列表推導式列為新的候選項目，誠實記錄而非直接動手做掉。也確認過：就算
  `with` + 列表推導式都做了，這個檔案的 `eml run`（真正執行）還是會 defer——第 10 行
  `hasher = hashlib.md5()` 命中直譯器既有的「未綁定模組 attribute 呼叫」`Unsupported` defer（跟
  `.format()`/numpy 同一類），而 `open(...)` 本身命中的是硬性 `NameError`（比 attribute 呼叫的軟性
  `Unsupported` 處理更嚴格一點的不一致，這輪只記錄不修）。**設計上照抄 Phase 7d（`try`/`except`/
  `finally`）的先例**：動工前先完整讀過 Phase 7d 的實作，確認 EML 自己的 `with` 具體語法就是
  Python 關鍵字語法原文照搬（不像 `^` sigil 系統，這點跟 `try`/`except` 一致）；直譯器做**真正的**
  `__enter__`/`__exit__` 協定派送（重用 Phase 7e 既有的 `findMethod`/`runMethodBody`，不是另起
  爐灶）——對象是使用者自訂類別的 instance，跟真實 Python 協定完全一致，連檢查順序都直接對照真實
  安裝的 Python 驗證過（`__exit__` 缺失比 `__enter__` 缺失更早被檢查到,兩者都沒有時報「missed
  __exit__ method」）；`__exit__` 回傳真值會抑制正在傳播的例外,也直接測真實 Python 驗證過
  （`with Suppress(): raise ...` 之後不會有例外）。動工前也確認過一個容易忽略的細節：類別本體驗證
  本來就不限制方法名稱（包括雙底線名稱),只是「除了 `__init__` 以外沒有任何 dunder 會被自動派送」
  ——`with` 是這個類別系統第一次真的自動派送 `__enter__`/`__exit__` 這兩個 dunder。也發現了 C++
  prototype 後端一個之前沒特別記錄的事實：`emitCppStatement` 本來就完全不支援任何 Python 層級的
  控制流敘述句（`if`/`while`/`for`/`try` 全部都在既有的拒絕清單裡),只支援運算式層級的 Σ 迴圈——
  `with` 只是加入這個既有清單,不是開先例。759 測試（原 744)。全新的 `__enter__`/`__exit__` + 例外
  抑制片段做了完整 CLI 端到端驗證（`eml run` 輸出跟真實 Python 逐位元組一致,含抑制例外的分支)。
  重新量測同 5 個真實檔案：`Duplicate_files_remover` 完全推進過 `with`（第 11 行),卡點換到第 26
  行的列表推導式（全新、未編號的缺口);其餘 4 個檔案沒有變化,符合預期。詳見 `docs/agent-
  handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md`「Phase 9 item 6」小節、
  `docs/roadmap.md`(列表推導式已記錄為新候選項目)。
- **2026-07-18** — 完成 **Phase 9 項目 5：`print(x, end="")` 等關鍵字參數**（純反向，刻意不設計
  新正向語法）。這是 Phase 9 支線第一次真的碰到需要發明全新 EML 具體語法才能完整支援的項目——
  跟前面每一輪（`and`/`or`/`%`/`not`/元組/三引號字串）都不一樣，那些全部都是延伸 Python 本來就有
  的語法，這次 `^0` 只認裸變數是刻意的語言設計，沒有現成的東西可以延伸。**這個語法設計決定直接用
  AskUserQuestion 問過 Neo，不是自己片面決定**：三個選項（只做反向不設計新語法 / 設計新的正向
  sigil 語法 / 先跳過項目 5 改做項目 6 或 7）中，Neo 選了「只做反向、不設計新正向語法」。後果
  （動工前就先追蹤過整條 pipeline 確認）：`eml compress` 對 `Calculate_age` 那一行還是會失敗——
  但失敗點從一個難懂的 parser 內部斷言（`Expected RPAREN but found ASSIGN`）變成一句清楚、誠實的
  「EML cannot express print's 'end' keyword argument」，跟 `await`/`async`/C++ 版 numpy 的拒絕
  同一套「寧可清楚拒絕也不要靜默誤譯」紀律。**範圍比一開始估的小很多**：直接追蹤過哪個 AST 會真的
  帶著這個新欄位，只有反向解析器（產生）跟反向 EML emitter（唯一會檢查、丟錯的地方）會碰到——
  `roundTripFromPython` 的 pipeline 一旦 eml-emitter 丟錯就整條停在那裡，正向解析器/emitter、
  直譯器、7 個語意分析 walker、C++ 後端全部**零改動**——逐一讀過全部 12 個 `case 'Output'` 現場
  確認過，不是只憑追蹤結果假設。另一個研究階段發現的簡化：`print(...)` 這輪拿到一個**專屬的敘述句
  層級解析函式**，照抄這個檔案本來就有的 `sum(...)`/`range(...)`/`np....` 特殊辨識慣例，而不是去改
  共用的 `parseArgs()`（文法裡每個呼叫都會經過），讓共用的 `FunctionCall` AST 型別（12 個檔案在用）
  完全不用動。刻意設計得很嚴格：只認「恰好一個位置參數，後面可以接恰好一個 `, end = 運算式`」，
  `print(a, b)`、`print(x, sep=",")` 都直接丟出清楚的解析錯誤，不會靜默誤解析。744 測試（原 734）。
  CLI 端到端驗證：新的清楚錯誤訊息確實取代了舊的難懂 parser 斷言。重新量測同 5 個真實檔案：
  `Calculate_age` 仍然沒有完整通過 `eml compress`（這是設計上就預期、可接受的結果，不是遺憾），
  但失敗點現在精準落在這個刻意設計的限制上；其餘 4 個檔案沒有變化。詳見 `docs/agent-handoff.md`
  「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.3。
- **2026-07-18** — 完成 **Phase 9 項目 4：三引號字串**，並意外查證出**項目 3b（`.format()`）其實
  已經能用、不需要另外實作**。動工前先跟項目 5（`print(x, end="")` 具名參數）比較過真實規模再選：
  項目 5 需要動共用的 `parseArgs()`（文法裡每個呼叫都會經過）、直譯器輸出緩衝模型要動真正的架構
  （`write()` 目前把換行符延後到 `finalize()` 統一補上，不是逐次呼叫時處理）、還要動 3 份 emitter
  三種不同行為；項目 4 動工前直接讀過程式碼確認是**純 lexer 層級擴充，零 AST/parser/emitter/
  walker 改動**——`StringLiteral` AST 沒有引號風格欄位，正向/反向解析器、3 份 emitter、7 個語意
  分析 walker、直譯器全都已經通用處理字串；一個裸字串當成整條敘述句（Python docstring 慣例）
  也早就是合法文法，不用改。兩個 lexer 的字串分支都加了「目前位置是否為 3 個連續同種引號字元」的
  檢查，兩條路徑共用同一份跳脫字元處理邏輯（抽成共用 closure，避免兩份跳脫映射表以後各自漂移）。
  **動工前直接驗證（不是假設）**一個關鍵正確性問題：多行字串內容裡的換行字元會不會被縮排敏感的
  lexer 誤判成 INDENT/DEDENT？答案是不會——字串讀取迴圈自己消耗掉每個字元（含換行），外層的縮排
  偵測邏輯只在自己專屬的換行分支才會觸發，字串迴圈跑完前根本不會把控制權交還給外層——這個保證
  今天已經套用在「一般字串裡混進一個裸換行字元」這種既有情況上，三引號字串沿用同一套保證，用兩個
  lexer 各自的專門測試鎖住（直接數 INDENT/DEDENT token 數量，不只是整合層級的往返測試）。734 測試
  （原 724）。全新 docstring 片段做了完整 CLI 端到端驗證。重新量測同 5 個真實檔案：
  `Leap_Year_Checker` 完全推進過 3 段 docstring，卡點換到 `print("{0} is a leap year!!"
  .format(year))`——**這輪最有意思的意外發現**：追查這個新卡點才發現 `.format()` 本質上就是一個
  普通的 attribute-call（Phase 7c 就有的通用機制），直接測試
  `year = 2000; msg = "{0} is a leap year!!".format(year); print(msg)` 完整 compress + roundtrip
  都乾淨通過，零新程式碼——這推翻了項目 3a 那輪自己寫下的「`.format()` 還沒被任何語料檔案真的走到」
  的說法，需要訂正而不是放著不管。跟 numpy 的 `<M>`/`^T` 是同一類：純 JS 直譯器不模擬它的內部語意
  （直接測試確認 `interpret()` 回報 `unsupported: ["call value.format()"]`），`eml run` 遇到這種
  情況會 defer 給真實 Python 子行程執行——既有、已被接受的既定模式，不是缺口。`Leap_Year_Checker`
  真正沒跑通的原因跟 `.format()` 無關，是它把 `.format()` 呼叫結果直接丟給 `print(...)`（沒有先
  綁定變數），命中 EML 自己既有、刻意設計的「`^0` 運算元必須是裸變數」限制——不是新發現的語言缺口，
  是否要放寬這個既定限制，留給 Neo 判斷。其餘 4 個檔案完全沒有變化，符合預期。詳見
  `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.11、
  `docs/roadmap.md`（項目 3b 的說明已訂正）。
- **2026-07-18** — 完成 **Phase 9 項目 3a：元組字面量 + `%` 字串格式化**。重新檢視 `Calculate_age`
  第 48 行（`"%s's age is %d years or " % (name, year), end=""`）才發現這行其實一次卡了 3 個獨立
  缺口：`%` 格式化運算子本身、一個**元組（tuple）字面量** `(name, year)`（EML 之前完全沒有元組
  型別，只有 List/Dict/Set）、以及 `print(..., end="")` 具名參數（已編號的項目 9-5）。順手檢查另外
  兩個用到 `.format()` 的語料行（`Decimal_to_binary_convertor` 第 7 行、`Leap_Year_Checker` 第
  7/12 行），證實 `.format()` 本身目前 5 個真實語料檔案都還沒有任何一個真的走到——都被更前面、
  不相關的缺口擋住（一個是 Python 切片 `bin(dec)[2:]`，一個是項目 9-4 的三引號字串）。於是這輪
  範圍收斂成語料真正觸及的一半：元組字面量 + `%` 格式化列為 9-3a；`.format()` 列為 9-3b，等哪個
  語料檔案真的先走到它再排。全新 `TupleLiteral` AST 節點（形狀照抄 `ListLiteral`）——**零新詞法
  token**（`(`/`)`/`,` 呼叫參數早就有了）、**零優先權重新編號**（元組跟 List 一樣落在最緊的 atom
  分層，3 份 emitter 的 `precedence()` 都是 default 分支）——這系列少見的輕量一輪。唯一真正新邏輯
  是正向（`parser.ts`）+ 反向（`py-parser.ts`）解析器 `(` 的消歧：`(x)` 沒有逗號時維持原本單純的
  分組語意（不是 1 元組，跟真實 Python 完全一致），只有帶逗號才是元組（`(x,)` 是真正的單元素元組，
  `()` 是空元組）。**直譯器這邊做了真正的語意，不是應付了事**：全新 `percentFormat()` 函式實作
  printf 風格 mini-language 子集（`%s`/`%d`/`%f`/`%%`），`%d` 對浮點數朝零截斷、`%f` 預設 6 位
  小數，引數個數不符與跨型別錯誤都直接對照真實安裝的 Python 驗證訊息文字（`not enough arguments
  for format string`、`not all arguments converted during string formatting`、`unsupported operand
  type(s) for %: '<type>' and 'str'`、`%d format: a real number is required, not <type>`）。**元組值
  本身刻意縮小範圍**：只做語料真正需要、且「免費」的部分（真值判斷、相等性——元組跟同元素的 list
  永遠不相等，跟真實 Python 一致——`in` 成員測試、`for` 迭代、下標讀取、`str()`/`repr()`），刻意
  不做元組的算術（`+`/`*`）、大小比較（`<`/`>`）、可雜湊性——這些語料完全用不到，且都已經有安全的
  既有預設行為頂著（會直接報錯，不會算錯），誠實記錄為已知缺口而非草率的部分實作。C⁺⁺⁺ prototype
  對元組字面量直接整體拒絕（`E_CPP_UNSUPPORTED`，這個純數值 prototype 完全沒有元組或字串格式化
  模型），藏在元組裡的自我遞迴仍被既有的遞迴前置檢查正確攔下（用專門測試斷言的是「Recursive
  function」這個特定訊息，不只是元組本身也會觸發的通用拒絕訊息，因為兩者都會呈現同一個
  `E_CPP_UNSUPPORTED` 代碼）。過程中也發現 `tests/phase9-modulo.test.ts` 一個舊測試假設過期了
  （原本斷言字串 `%` 一律 defer 成 Unsupported，現在是真的實作了）——修正而非刪除，改成斷言新的、
  更精確的真實 Python 行為（`"hi" % 5` 這個「格式字串沒有任何指示符」的案例，現在正確丟出
  `not all arguments converted during string formatting`），跟這個專案先前修 `@hot`/`COLDHOT`
  過期測試假設用的是同一套「修正而非刪除」的紀律。724 測試（原 696）。全新 `Calculate_age`-風格
  片段（`name`/`year` 搭配 `%s`/`%d`）做了完整 CLI 端到端驗證（`eml run` 輸出跟真實 Python 逐
  位元組一致）。重新量測同 5 個真實檔案，**誠實結果**：`Calculate_age` 從卡在元組/`%`格式化本身，
  推進到**同一行**的 `end=""` 具名參數（項目 9-5，還沒做）——這輪讓這個檔案的卡點往前推進，但沒有
  讓它整個跑通；其餘 4 個檔案完全沒變化，符合預期。另外也再次確認：`and`/`or` 那輪發現、至今從未
  編號的 Python 序列切片缺口（`Decimal_to_binary_convertor` 卡在的 `bin(dec)[2:]`）依然沒有對應的
  Phase 9 項目編號，值得提醒 Neo 之後排項目時留意。詳見 `docs/agent-handoff.md`「Phase 9」章節、
  `docs/cpp-feasibility.md`、`docs/EML-LANG-2026-v1.0.md` §5.10。
- **2026-07-17** — 完成 **Phase 9 項目 8：`not` 布林一元反轉運算子**。項目 2（`%`）重新量測時意外
  發現的缺口，這輪補上——跟項目 1（`and`/`or`）同一套機制家族：全新 `NotExpression` AST 節點（照抄
  既有 `TransposeExpression` 的單運算元形狀，不是 `LogicalExpression` 的雙運算元形狀），貫穿正向
  lexer/parser/emitter + **7 個**語意分析 walker（比項目 1 的 6 個多一個——`cts-generator` 這輪從
  一開始研究階段就抓出來，不是漏掉才補）+ 反向 parser + 直譯器。跟 `and`/`or`的兩個關鍵差異：
  Python 的 `not` 永遠回傳真正的布林值（不像 `and`/`or`回傳運算元本身，這點更簡單）；需要一個全新的
  優先權層級——這個系列**第 4 次**重新編號 3 份獨立維護的 precedence table（緊到鬆：conditional=1、
  or=2、and=3、**not=4（新）**、comparison/membership=5、加減=6、乘除模=7、次方=8、atom=9）。
  **這輪動工前先用具體例子推演過、不是憑空假設的關鍵發現**：C++ 的 `!` 運算子優先權順序跟 Python 的
  `not` 剛好相反——Python `not x > 5` 意思是 `not (x > 5)`（`not` 比較鬆，比較運算子比較緊），但
  真實 C++ 的 `!x > 5` 會解析成 `(!x) > 5`（`!` 比較緊）。3 份 emitter 共用的 `precedence()`/
  `child()` 機制對 Python/EML 兩個 emitter 是對的（兩者都真的遵循 Python 自己的優先權），但如果
  C++ 後端也照搬，會靜默生成文字看起來合理、語意卻是錯的 C++——所以 C++ 後端的 `Not` case 直接跳過
  `child()`/`precedence()` 整套機制，永遠把運算元包進括號（`!(...)`），寧可多括號也要正確。用一個
  專門測試鎖住這個關鍵案例：`not x > 5` 必須生成 `!(x > 5)`，明確斷言不能是錯的 `!x > 5`。記錄在
  `docs/cpp-feasibility.md`「Known divergences」，並註明比 `%` 那條防護更嚴格——這裡優先權錯了是
  靜默算出**錯的布林值**，不是編譯失敗。過程中在自己寫的測試裡抓到另一個真的 bug：`¬`這個 Unicode
  符號如果照抄 `∧`/`∨`的雙邊空格替換規則（`normalizer.ts`），會在 `¬`是一行開頭字元時（例如
  `¬x => r`）插入一個多餘的**行首**空格，讓縮排式 lexer 誤判成一層意外縮排，報出
  `Unexpected token INDENT`——根源是 `∧`/`∨`永遠是中綴運算子、文法上不會出現在行首，所以從沒踩到這個
  問題，但 `¬`是前綴運算子、合法文法下真的可能是一行的第一個字元。修法：`¬`只補右邊空格
  （`'not '`），不補左邊。696 測試（原 677）。全新閏年計數+否定片段做了完整 CLI 端到端驗證（`eml
  run` 輸出 50，與真實 Python 一致）。重新量測同 5 個真實檔案：`Calculate_age`——這輪鎖定的目標
  檔案——從卡在 `not`（第 21 行）推進到第 48 行的 `(name, year)`，是一個**元組（tuple）字面量**
  出現在 `%`格式化字串的右邊——這是已知項目 9-3（字串格式化）的子細節，不是全新缺口，已經記錄在上面
  9-3 那列而非另開新項目。詳見 `docs/agent-handoff.md`「Phase 9」章節、`docs/cpp-feasibility.md`、
  `docs/EML-LANG-2026-v1.0.md` §5.9。
- **2026-07-17** — 完成 **Phase 9 項目 2：數值取模 `%`**。跟項目 1（`and`/`or`）不同，`%` 重用既有
  的 `Binary` 節點（只是把 `BinaryOperator` 型別加一個 `'%'`），不是新的 Expression 型別——動工前先
  逐一直接讀過 6 個語意分析 walker（`semantic.ts`／`purity.ts` ×2／`importance.ts`／
  `loop-classifier.ts`／`cts-generator`）+ `OverlayAssign` 的解析邏輯，證實它們全部已經對任何
  `BinaryOperator` 通用處理——**零改動**。真正需要動工的集中在：兩個方向各自的 lexer/parser（新
  token）+ 3 份 emitter 各自的 `nonAssoc` 判斷（`%` 跟 `-`/`/` 一樣是非結合律，`a % (b % c)`
  一定要保留括號）。**關鍵語意直接對照真實安裝的 Python（3.14.5）驗證，不是憑空假設**：Python 的
  `%` 是 **floor-mod**（結果取除數的正負號：`-7 % 3 == 2`），跟 JS／C++ 原生 `%`（取被除數正負號，
  同一式子會是 `-1`）不同——`@eml/interp` 用 `((a % b) + b) % b` 這個技巧把 JS 的截斷取模轉成
  Python 的 floor-mod（bigint、float 兩條路徑都驗證過好幾組正負號組合，包括浮點數）；取模除以零
  丟出 `ZeroDivisionError('division by zero')`，這個訊息文字對 int/float 都一樣（也是直接測真實
  Python 才確認，不是照抄 `/` 既有的依型別分訊息邏輯）。字串的 `%`（printf 風格格式化）刻意排除在
  外，直譯器遇到會 defer 成 `Unsupported`，不是拋錯或算出錯的結果。C⁺⁺⁺ prototype 這輪加了一個
  字面量層級的防護：`%` 的運算元如果是明顯的非整數字面量（例如 `1.5 % 2`），直接
  `E_CPP_UNSUPPORTED` 拒絕——因為 C++ 的 `%` 是整數限定，套用在 `double` 上是編譯錯誤，這點跟本來
  就相容 int/float 的 `/` 不一樣；非字面量（變數）的浮點數運算元仍抓不到，跟 `/` 既有的型別無知是
  同一類、已記錄的缺口。677 測試（原 662）。全新的閏年判斷片段（`%` + 既有的 `and`/`or`，
  `((y % 4 == 0) and (y % 100 != 0)) or (y % 400 == 0)`）做了完整 CLI 端到端驗證（`eml run` 輸出
  50，與真實 Python 逐位元組一致）。重新量測同 5 個真實檔案，**兩個卡在 `%` 的檔案都有具體
  進展**：`Leap_Year_Checker` 從卡在 `%`（第 3 行）推進到第 4 行的三引號字串
  `"""..."""`——正好對應已知的項目 9-4；`Calculate_age` 從卡在 `%`（第 48 行）推進到第 21 行的
  `(not leap_year)`——**這是本輪重新量測才意外發現的全新缺口**：Python 的 `not`
  一元布林反轉運算子，原本被 `%` 擋在前面所以從沒被量測到過，規模應該很小（跟 `and`/`or`
  同一套機制，只是一元不是二元），列為新的候選項目 9-8，誠實記錄發現而不是含糊帶過。詳見
  `docs/agent-handoff.md`「Phase 9」章節、`docs/EML-LANG-2026-v1.0.md` §5.2。
- **2026-07-17** — 完成 **Phase 9 項目 1：`and`/`or` 布林組合子**。反向轉譯器工程收尾後重新量測 5
  個真實檔案，發現 `Decimal_to_binary_convertor`／`Leap_Year_Checker` 卡住的是 EML 語言本體本身就
  沒有的語法（雙向都沒有），不是反向轉譯器的缺陷——新開一個 roadmap 分類（Phase 9：語言本體擴充，
  雙向都要動工，跟 Phase 8 B-6 性質不同）。Neo 選擇從最小的一項開始，一項一項來。新增全新
  `LogicalExpression` AST 節點，貫穿正向 lexer/parser/emitter、6 個語意分析 walker（`semantic.ts`／
  `purity.ts` ×2／`importance.ts`／`loop-classifier.ts`／`cts-generator`）、反向 parser/emitter、
  直譯器、C⁺⁺⁺ prototype——比任何一輪單向反向轉譯器工程觸及的檔案都多。動工前先用 Explore agent +
  直接驗證每一份 precedence table，畫出精確觸點地圖：3 份獨立維護的 precedence()/child() 複本要
  一致改號（緊、鬆：conditional=1、or=2、and=3、comparison/membership=4、加減=5、乘除=6、次方=7、
  atom=8）；3 個 walker 有非編譯期強制的 `default:` 兜底——跟 Phase 3b 當年漏掉 `Await` case 同一類
  風險，都補上並用真測試鎖住（不是憑空信任）。**關鍵語意直接對照真實 Python 執行驗證，不是憑空
  假設**：`and`/`or` 回傳的是其中一個運算元本身，不是永遠布林值（`0 and 5` 回傳 `0`，不是
  `False`），而且是真短路——直譯器實作成求值一次 left、依真假分支、right 不需要時真的不求值，用
  一個「若真的被求值就會報錯」的呼叫式驗證過。C⁺⁺⁺ prototype 這輪對應到 `&&`/`||`（永遠回傳
  bool，記錄為已知簡化），但「藏在 and/or 後面的自我遞迴」（`f() and f()`）仍正確被攔下，沒有變成
  生成壞掉 C++ 的破口——這是這輪發現最危險的一個點，因為它的兜底邏輯（`default: return false`）
  也不是編譯期強制的。`∧`/`∨` 額外接受為 Unicode 顯示形式（比照 `∈`→`in` 既有慣例）。過程中也在
  自己寫的測試裡抓到一個真的 bug：一版「real Python execution parity」測試表用了自我參照的斷言
  （永遠為真，沒測到任何東西），改成逐一手算的預期值。662 測試（原 637）。全新迴圈+布林條件片段
  （`(i > 5 and i < 15) or i == 20`）做了完整 CLI 端到端驗證（`eml run` 輸出 10，與真實 Python
  逐位元組一致）。重新量測同 5 個真實檔案：**誠實且具體的進展**——`Decimal_to_binary_convertor`
  從卡在 `or`（第 3 行）推進到第 7 行的 `bin(dec)[2:]`——這是全新、不同的缺口（Python 的**序列
  切片**語法，跟 EML 自己的 `[a:b]` 區間字面量是不同語意，正向反向都還沒有），證明 `and`/`or`
  本身現在真的完整可用；`Leap_Year_Checker` 沒有變化（符合預期——`%` 在同一行比 `and`/`or` 更早
  出現，lexer 階段就先擋下來了，不是回歸）。詳見 `docs/agent-handoff.md`「Phase 9」章節、
  `docs/EML-LANG-2026-v1.0.md` §5.8。
- **2026-07-17** — 完成反向 Python→EML **Phase E2（最後一輪）**：`class`（最小可行 OOP)也雙向
  轉譯了，**收尾整個反向轉譯器工程**——Phase 0–7 所有能往返的語法現在全部往返了。動工前先直接驗證
  AST + 正向解析器：`ClassDef` 就只是 `{ name, body }`——沒有基底類別、沒有 decorator，方法就是
  普通的巢狀 `FunctionDef` 節點、`self` 就是普通的第一個參數，正向解析器自己的 `parseClassDef()`
  也證實了這個對稱性（body 用跟其他區塊敘述句一樣的通用 `parseBlock()`，「只能放方法或賦值」這條
  限制是語意分析階段才加的，不是文法層級)——所以這輪幾乎不需要新邏輯：一個 `class Name:` 開頭 +
  emitter 裡一份全新、class-local 的 `bound` 作用域（巢狀方法本身不需要額外處理，因為
  `FunctionDef` 自己的 case 本來就會建立自己的全新作用域)。這是整個系列裡最小的一輪，比 B1 還小。
  過程中重新驗證 Phase E1 的一個舊測試（`tests/mcp-logic.test.ts` 拿 `class` 當「保證會在反向失敗」
  的範例)時，發現一個值得訂正的細節：**`@hot` 的往返失敗其實是靜默的不一致（mismatch），不是拋出
  的反向解析錯誤**——反向 lexer 本來就會丟掉註解，所以會把被拔掉 decorator 的 Python 順利解析成
  一個中性函式，資訊遺失只會在比較 python1／python2 文字時才顯現出來；Phase E1 原本「不會收斂到
  不動點」的描述本身沒錯，但沒講清楚實際機制，這輪把它說得更精確，§9/§11 也同步訂正。全新
  `BankAccount`（deposit/withdraw + 餘額)片段做了完整 CLI 端到端驗證（`eml compress` → `eml
  roundtrip` → `eml run`，120 == 120，輸出與真實 Python 逐位元組一致）。637 測試（原 632）。重新
  量測同 5 個真實檔案：完全沒有變化（符合預期，5 個檔案沒有一個卡在 `class` 上，缺口仍是
  `%`／`or`／`with`／跨行 dict 字面量）。**反向 Python→EML 轉譯器工程至此完整收尾**——只剩
  `@temporal_loop`／`async`／`await`（永久單向)跟 `@hot`（函式支援範圍內永久性例外)留在轉譯不變式
  之外；B-6 這個 KPI 本身要讓真實語料完整通過，卡的是 EML 語言本體目前就沒有的語法（`%`/`or`/
  `with`/跨行字面量，正向也沒有)，不是反向轉譯器的缺陷，需要 Neo 決定要不要投入語言本體擴充。詳見
  `docs/agent-handoff.md`「Phase 8 — reverse Python→EML, Phase A + B1 + B2 + C + D + E1 + E2」章節。
- **2026-07-16** — 完成反向 Python→EML **Phase E1**：函式定義 + `return` 也雙向轉譯了（僅
  `@cold`/中性子集；`class` 明確排在獨立的未來 Phase E2）。詞法層只需新增一個 `AT`（`@`）token——
  自 Phase B2 的 `LBRACE`/`RBRACE` 以來第一個真正全新的 token。**動工前先直接讀正向原始碼驗證（不是
  憑空猜），抓到兩個關鍵、影響深遠的發現**：① `@cold` 跟 `@hot` 在正向 emitter（`packages/
  transpiler-python/src/emitter.ts`）裡完全不對稱——`@cold` 輸出真正的 `@functools.cache` decorator，
  但 `@hot` 只輸出一行**註解**（`# @hot: dynamic state — not cached`），而反向 lexer 從來不會
  tokenize 註解，所以 **`@hot` 是永久性、結構上不可回復的資訊遺失，不是「還沒做」，跟 `async`/
  `await` 屬於同一類**——本輪明確把這點寫進 §9/§11，不是含糊帶過或當成跟 `class` 一樣的暫緩缺口。
  ② `import functools` 是正向語意分析器（`packages/transpiler-python/src/semantic.ts` 約第 596 行）
  自動合成的樣板碼，只要程式裡有非 async 的 `@cold` 函式就會自動加這行 import，跟使用者是否自己寫了
  import 完全無關——所以反向解析器把這個精確形狀的裸 `import functools` 特別跳過，不當成真正的
  `ImportStatement` 節點保留，否則重新正向轉譯一次會讓這行 import 出現兩次。函式主體也引入了本輪
  唯一真正精細的作用域改動：函式拿到一份全新、只用自己參數名稱預先綁定的獨立 `bound` 作用域（完全
  不複製外層作用域）——這是第一個「雙向都隔離」的敘述句（不只是內部宣告的名稱不會外洩，外層的名稱
  也不會滲透進來），因為函式是第一個真正的呼叫邊界。同一批 5 個真實檔案再重新量測，`Duplicate_files_
  remover` 有真實進展：從卡在 `def hashFile`（第 7 行）推進到 `with open(filename, 'rb') as file:`
  （第 11 行）——`with`/context manager 是全新、本輪範圍外的另一個缺口，證明 `def` 本身現在真的能
  完整 lex/parse 過去了；另外 4 個檔案（`%`／`or`／多行 dict 字面量）沒有變化，符合預期。另外用一個
  全新、含遞迴 `@cold` 函式（`factorial`）的片段做了完整 CLI 端到端驗證（`eml compress` → `eml
  roundtrip` → `eml run`，153 == 153，輸出與真實 Python 逐位元組一致，並確認還原後的 EML 沒有多出
  一行 `import functools`）。632 測試（原 620）。反向方向現在只剩 `class` 沒做（`@hot` 是函式支援
  範圍內永久性、非暫緩的例外）。詳見 `docs/agent-handoff.md`「Phase 8 — reverse Python→EML,
  Phase A + B1 + B2 + C + D + E1」章節。
- **2026-07-16** — 完成反向 Python→EML **Phase D**：`try`/`except`/`finally` + `raise` 也雙向轉譯
  了，詞法層完全不用改（`try`/`except`/`finally`/`raise`/`as` 都只是 NAME token，跟這幾輪的既有
  慣例一樣）。`bound` 作用域的處理刻意比 if/elif/else 更保守——照抄正向語意分析器自己既有的邏輯：
  try 主體跟每個 except handler 各自拿到一份「絕不合併回外層」的獨立複本（因為 try 主體可能執行到
  一半就失敗，究竟哪個部分真的跑完是條件式的，each except handler clone 的是「try 之前」的原始
  作用域，不是 try 主體的複本），只有 finally 共用同一份活的作用域（不複製）——因為 finally 一定會
  無條件執行，跟 Phase A while/for 用的邏輯一樣，用一組「try 內宣告的變數事後不能用／finally 內
  宣告的變數事後可以用」的測試鎖住這個設計。**動工前先驗證（不是憑空猜）抓到一個真的 bug**：Python
  的 `pass`（`except`/`try` 內常需要，因為 `parseBlock()` 本來就要求非空區塊）跟 Phase A 修復前的
  `break`/`continue` 有一模一樣的靜默誤譯漏洞——EML 完全沒有「無操作敘述句」的 AST 節點，所以改成
  明確辨識 `pass` 並直接報錯拒絕，而不是新增一個無操作能力（那會是另一個範圍外的功能）。同一批 5
  個真實檔案再重新量測，這次真的有具體進展：`Decimal_to_binary_convertor`（原本卡在第 1 行的
  `try:` 本身）一路推進到第 3 行的 `if menu < 1 or menu > 2:`，卡在 `or` 布林運算子——這是任何一輪
  都還沒支援過的既有缺口，不是 Phase D 的問題。另外 4 個檔案完全沒變化，符合預期。另外用一個全新、
  迴圈內 try/except/finally 的片段做了完整 CLI 端到端驗證（`eml compress` → `eml roundtrip` →
  `eml run`，輸出與真實 Python 逐位元組一致）。620 測試（原 611）。反向方向現在只剩 `def`/`class`
  沒做——這是最後、範圍也最大的一塊（Phase E）。詳見 `docs/agent-handoff.md`「Phase 8 —
  reverse Python→EML, Phase A + B1 + B2 + C + D」章節。
- **2026-07-16** — 完成反向 Python→EML **Phase C**：attribute access（含 `math.sqrt(x)` 這類
  attribute-callee call、以及 `obj.attr = v`／`obj.attr += v` 賦值目標）+ 單一裸模組 `import module`
  敘述句也雙向轉譯了。詞法層完全不用改（`.` 從 Phase 0 就有，原本只給 `np.array`/`np.transpose` 這個
  硬編碼特例用，繼續維持優先權不受影響）。`AssignTarget` 再擴充一步到 `Identifier | Subscript |
  Attribute`——這不是隨意決定，是照著正向解析器自己的 phase 歸屬做的：正向解析器的型別註解顯示
  `Attribute` 本來就是在正向 Phase 7c（不是 7e/class）就加進 `AssignTarget` 的，所以這輪也照樣把
  attribute 賦值目標一起做掉，沒有刻意窄化範圍。`import` 的處理刻意分兩層：只有「後面剛好跟著一個
  裸模組名稱、然後就是敘述句邊界」這個精確形狀才會被解析成真正的節點（在 `parseStatement()` 裡辨識
  ，所以巢狀區塊內也適用，不只頂層）；`import numpy as np`／`import os.path`／`from x import y` 這類
  無法對應到 EML 語法的形式，維持 `parseProgram()` 原本頂層靜態跳過的既有行為（用新的
  `isBareImport()` 判斷式把兩層邏輯串起來），保住原本就通過的「ignores import lines」測試不被破壞。
  過程中自己寫測試時抓到一個小失誤（不是實作問題）：`print(obj.value)` 因為 EML 的 `^0` 輸出本來就
  規定只能接裸變數（既有、跟這輪無關的文件化限制），要先綁定變數再印——跟 Phase B2 dict/subscript
  測試用的手法一樣。同一批 5 個真實檔案再重新量測：這輪完全沒變化（符合預期，5 個檔案沒有一個卡在
  attribute/import 上），另外用一個全新的 `import math` + `math.sqrt(x)` 片段做了完整 CLI 端到端
  驗證（`eml compress` → `eml roundtrip` → `eml run`，輸出與真實 Python 逐位元組一致）。611 測試
  （原 605）。詳見 `docs/agent-handoff.md`「Phase 8 — reverse Python→EML, Phase A + B1 + B2 + C」
  章節。
- **2026-07-16** — 完成反向 Python→EML **Phase B2**：dict/set 字面量 + subscript 也雙向轉譯了，
  含本輪唯一真正精細的改動——`AssignTarget` 擴充。反向解析器原本用「NAME 後面立刻跟 ASSIGN」的雙
  token 預判偵測賦值句，只能認出裸變數；改成「先解析完整運算式，再檢查後面是不是賦值符號」，才能
  同時認出 `d[k] = v`（對照正向解析器自己 `parseAssignTargetChain()` vs `toAssignTarget()` 的既有
  拆分方式）。另一個容易忽略的語法區分：subscript 的複合賦值（`d[k] += v`）用的是真正的 `+=` 運算子
  文字，不是 bare-identifier 專用的 `^+` 記號（那個記號的宣告/累加二義性對容器元素不適用）；全新賦值
  一律用箭頭形式（`v => d[k]`），因為 `^+` 本來就無法拼出 subscript 目標。順便清掉一個發現的小冗餘
  （原本 List 字面量有自己的特殊分支，其實跟直接呼叫 `emitEmlExpression` 結果一模一樣，統一成
  `isInlineLiteral` 幫手函式同時涵蓋 List/Dict/Set）。重新對 5 個真實檔案量測時，誠實發現一個全語言
  層級的既有邊界，不是這輪造成的：EML 從 Phase 0 開始，正向反向都從沒支援過跨行的括號類字面量（
  `text_to_morse_code` 這個真實檔案的 dict 字面量剛好寫成多行）——本 repo 目前所有範例的清單/字典
  字面量都寫在同一行，這次是第一次靠真實外部程式碼具體看到這個邊界，本輪確認發現但不嘗試修（要修
  是跨兩個方向、影響所有括號類型的獨立大工程）。`Duplicate_files_remover` 有真實進展：從卡在 dict
  字面量的 lexer 錯誤（第 22 行）變成卡在 `def hashFile` 的 parser 錯誤（第 7 行），證明 dict 字面量
  本身現在真的能完整 lex/parse 過去。605 測試（原 594）。詳見 `docs/agent-handoff.md`「Phase 8 —
  reverse Python→EML, Phase A + B1 + B2」章節。
- **2026-07-16** — 完成反向 Python→EML **Phase B1**：`break`/`continue` 也雙向轉譯了。因為 Phase A
  的正確性修復已經讓解析器能正確辨識這兩個關鍵字（否則會靜默誤譯，見下一則工作日誌），這輪只需把
  `eml-emitter.ts` 剩下的 2 個 throw-stub 換成 `return 'break'`/`return 'continue'`，是低風險小追加
  ，不是獨立大工程。`tests/reverse-blocks.test.ts` 原本兩個「break/continue 仍應失敗」的回歸測試
  改寫成正向的 round-trip 測試；fixtures 21（while+break）、22（for+continue）也隨 `tests/
  bidirectional.test.ts` 排除清單縮小而自動變成可雙向轉譯。594 測試（原 589）。詳見
  `docs/agent-handoff.md`「Phase 8 — reverse Python→EML, Phase A + B1」章節。
- **2026-07-16** — 完成反向 Python→EML **Phase A**：`if`/`elif`/`else`、`while`、`for...in` 現在
  可以雙向轉譯了。`py-lexer.ts` 新增 COLON + INDENT/DEDENT 詞法（照搬正向 lexer 的縮排堆疊演算法）
  、`py-parser.ts` 從「每行一句」改成能解析縮排區塊、`eml-emitter.ts` 把 12 個現成 throw-stub 中的
  3 個（If/While/ForIn）換成真正的縮排輸出。過程中靠 round-trip 測試本身抓到兩個真實的正確性
  bug（不是我憑空猜的，是測試直接跑出 mismatch）：(1) `break`/`continue` 原本會被靜默誤譯成毫無
  意義的「參照一個叫 break 的變數」而不是報錯失敗——因為所有其他還不支援的關鍵字後面剛好都跟著
  會讓解析失敗的東西，只有 break/continue 這兩個「單獨一個詞就結束」的關鍵字會意外拼出一個「合法
  但荒謬」的敘述句；(2) 迴圈內重新賦值一個已宣告的變數（例如費氏數列的 `a = b`）原本會誤用 `^+`
  記號（正向解析器會誤讀成累加而非重新賦值）——這是個潛伏 bug，跟這輪工作本身無關，只是先前 14 個
  fixture 從沒有任何變數被賦值兩次過，一有迴圈就會被踩到。另外設計並驗證了 if/elif/else 分支感知
  的 `bound` 集合合併規則（只有窮盡式 if/else 每個分支都宣告的變數，才會在區塊後被視為已綁定）。
  589 測試（原 565）。真實 CLI 端到端驗證（`eml compress`→`eml roundtrip`→`eml run`，輸出與真實
  Python 逐位元組一致）+ 重新對 B-6 那 5 個真實檔案量測（誠實結果：仍 5/5 未完全成功，但 2 個檔案
  失敗位置明顯後移，證明真實進展）。`break`/`continue`/dict/set/subscript/attribute/import/
  try/except/raise/`def`/`class` 明確排在後續輪次，未在本輪嘗試。詳見 `docs/agent-handoff.md`
  「Phase 8 — reverse Python→EML, Phase A」章節、`docs/EML-LANG-2026-v1.0.md` §9/§11 新增的附錄。
- **2026-07-16** — B-6 第一次正式量測（非移植，而是對「未修改的真實 Python」直接跑 `eml compress`）：
  從 Python-World/python-mini-projects 另外抓 5 個真實檔案（Leap_Year_Checker、Calculate_age、
  text_to_morse_code、Decimal_to_binary_convertor、Duplicate_files_remover），全部原樣（不修改）跑
  `eml compress`。**結果 5/5 失敗**，且全部卡在檔案前幾行的 `if`/`def` 敘述句——追查後確認反向
  Python→EML 的 `py-lexer.ts` 完全沒有 COLON/INDENT/DEDENT 這幾種 token，也就是說反向方向從來沒有
  擴充過涵蓋任何區塊敘述句（`if`/`while`/`for`/`def`/`class`/`try`），只涵蓋 Phase 0-5 原始 14 個
  單行敘述句對照表。這件事其實規格 §11 早就寫了（Phase 6/7 附錄都明講 reverse 本輪 fail-loud），
  但直到這次真的餵真實程式碼進去，才第一次具體看到後果：幾乎任何真實、非瑣碎的 Python 程式都會
  在很前面就失敗，不是邊緣案例。已誠實記錄為 B-6 的量測結果，沒有嘗試自行動工擴充反向 lexer/parser
  ——這是一個跨兩個 Phase 規模的工程（等於要把 Phase 6/7 的整套區塊解析機制在反向再做一次），範圍
  太大，留給 Neo 決定是否列為下一個優先。
- **2026-07-16** — 完成 Phase 8 B-5：公開 conformance suite（MVP）。`docs/conformance.md` 把既有
  兩層閘控（`tests/fixtures/` 29 個逐構造精確文字對照 + `examples/` 執行真相對照）包裝成外部可驗證
  的文件，不需要讀懂這個 repo 內部 vitest 佈局。過程中抓到一個真正的設計錯誤：原本想給 `eml test`
  加 `--run` 對每個 fixture 額外跑一次真實 Python，結果一跑就有 6 個失敗——才發現這些 fixture 本來
  就是故意的單一構造對照片段（Appendix B「14 個案例」），不是完整可執行程式，於是整個 `--run` 想法
  撤回而非硬湊特例。新增 `tests/cli-conformance.test.ts`，真正 spawn `eml test` CLI process（不是
  只呼叫內部函式）驗證文件所述行為屬實。565 測試（原 562）。
- **2026-07-16** — 第二個真實移植案例：Number Guessing Game（`examples/mvp-number-guessing-game/`，
  來源 Python-World/python-mini-projects，MIT 授權）。程序式（非 class）風格，與 Tic-Tac-Toe 互補
  ——for/break、if/elif/else 分支值帶出、`^+1` overlay-assign 累加、字串+`str()`混合型別串接。原始
  `random.randint()`/`input()` 改為固定序列（同 Tic-Tac-Toe 的既有作法），`eml:equiv` 閘門對真實
  Python 逐位元組驗證通過。562 測試（原 559，examples.test.ts +2、interp.test.ts +1）。**附註**：
  全量測試跑時偶爾看到 `tests/ai-converter.test.ts` 3 個測試因 5000ms 逾時失敗（這些測試會 spawn
  真實 python 子行程做驗證）——單獨跑、或給更長逾時都能穩定通過，判斷是當下機器負載（同時間這個
  資料夾可能有另一個 session 的 dev server 在跑）造成的既有環境脆弱性，與這次改動無關，未嘗試修改
  全域測試逾時設定（範圍外的決定）。
- **2026-07-16** — 完成 Phase 8 C-8：MCP server（`@eml/mcp`）。7 個工具完全鏡像網站
  `/ai/tools/*` REST API 的設計（同一套 envelope、同一批工具名、同一組資源限制常數），讓 REST
  與 MCP 兩個 agent 介面不會走岔。實作前先對照真實安裝的 `@modelcontextprotocol/sdk` `.d.ts`
  逐一驗證 API 簽章（`Client` 建構子、`callTool` 參數形狀、`registerTool` 的 Zod schema），而非
  照研究階段的猜測直接寫。除了 in-process protocol 測試外，另外手動對真實 stdio entry point
  送過一次原始 JSON-RPC handshake（`initialize` + `tools/list`）驗證真的能跑。559 測試（原
  538）。repo 根目錄新增 `.mcp.json`。roadmap 建議優先序三項中已完成兩項（A-1、C-8），只剩
  E-11。
- **2026-07-14** — 建立本文件。盤點當下進度：語言本體 5/5、A-1 LSP 3/5（MVP）、A-4/B-6 各 1/5（Tic-Tac-Toe 首個真實移植）、其餘 Phase 8 項目均 0/5。
- **2026-07-14** — 網站示範區新增 Tic-Tac-Toe 真實移植範例；順帶抓到並修好往返徽章的過期判斷邏輯（舊邏輯只認「有沒有函式」，漏掉 Phase 6/7 新增的一大票單向語法）。網站 repo commit `4e2bacf`，已驗證上線。
- **2026-07-14** — 完成 Tic-Tac-Toe 真實移植（`examples/mvp-tic-tac-toe/`）：MIT 授權的真實小專案，非我方為測試語法而寫，端到端驗證通過 `eml:equiv`。
- **2026-07-14** — 完成 Phase 8 A-1 LSP 語言伺服器 MVP：`@eml/lsp` + `packages/vscode-extension`，535 測試（含 in-process protocol 整合測試）。過程中修正一個真實的 span 邊界 bug（DEDENT token 吸收進前一個複合敘述句的 span，導致 hover 誤判成前一個敘述句）。語言 repo commit `e0d3463`（與 Tic-Tac-Toe 一起）。
- **2026-07-13** — Phase 7（語法完備化：break/continue、dict/set/subscript、attribute/import、try/except/raise、class）全部完成 + 文件 + 網站部署。538 測試（原 512）。commit `693f2dc`。
- **2026-07-12** — Phase 6（if/elif/else、while、for...in）完成 + 部署。commit `0a79139`。

---

## 下一步排隊中

roadmap 自己的建議優先序：**A-1（已完成）→ C-8（已完成）→ E-11 開放核心定價**。Neo 已確認投入反向
Python→EML 的區塊敘述句擴充，Phase A 到 Phase E2（`class`）全部交付——**反向 Python→EML 轉譯器
工程本身已經完整收尾**，Phase 0–7 所有能往返的語法現在全部往返了，只剩 `@temporal_loop`／
`async`／`await`（永久單向）跟 `@hot`（函式支援範圍內永久性例外）留在轉譯不變式之外，這兩者都不會
再被排進任何一輪。

但 B-6 這個 KPI 本身（真實語料能不能完整跑過 `eml compress`）還沒達成——這幾輪陸續發現的獨立候選項
都是 **EML 語言本體目前就沒有的語法（正向也沒有）**，不是反向轉譯器的缺陷，要讓真實語料真的通過需要
語言本體擴充。Neo 已確認投入，開了新的 **Phase 9（語言本體擴充）** roadmap 分類，並選擇「從最小的
開始、一項一項來」。**2026-07-17 完成 Phase 9 項目 1：`and`/`or` 布林組合子**（雙向 + 全分析層都
貫穿了）——重新量測後，`Decimal_to_binary_convertor` 進展到第 7 行的 `bin(dec)[2:]`（Python 序列
切片，全新缺口）。**同日再完成項目 2：數值取模 `%`**——重新量測後，`Leap_Year_Checker` 推進到第 4
行三引號字串（對應項目 9-4），`Calculate_age` 推進到第 21 行 `(not leap_year)`（意外發現的全新
缺口，當時新增為項目 9-8）。**同日再完成項目 8：`not` 布林一元反轉運算子**——重新量測後，
`Calculate_age` 從 `not`（第 21 行）推進到第 48 行的 `(name, year)`元組字面量，判定為項目 9-3
（字串格式化）的子細節，記錄在該項目而非另開新項目。**2026-07-18 完成項目 3a：元組字面量 +
`%` 字串格式化**（項目 3 拆成 3a/3b 兩個子項目，因為 `.format()` 目前 5 個真實檔案都還沒走到）——
重新量測後，`Calculate_age` 從卡在元組/`%`格式化本身，推進到**同一行**的 `end=""` 具名參數
（項目 9-5，還沒做）。**同日再完成項目 4：三引號字串**（跟項目 5 比較過真實規模後選的，項目 4
純 lexer 層級、零 AST/parser/emitter 改動，比項目 5 要動共用 `parseArgs()` + 直譯器輸出緩衝架構
輕量很多）——重新量測後，`Leap_Year_Checker` 完全推進過 3 段 docstring，卡點換到 `.format()` 那行，
追查後**意外查證出項目 3b（`.format()`）其實已經能用，不需要另外實作**（本質上是通用的
attribute-call，Phase 7c 早就支援；真正卡點是既有的 `^0` 裸變數限制，不是新語言缺口）——項目
3b 的狀態已訂正。**同日再完成項目 5：`print(x, end="")` 等關鍵字參數**（純反向，刻意不設計新
正向語法——這是第一個真的需要發明全新 EML 具體語法的項目，語法設計決定直接用 AskUserQuestion
問過 Neo：選了「只做反向、不設計新正向語法」）——重新量測後，`Calculate_age` 的解析現在完全推進過
元組/`%`格式化/具名參數語法本身，卡在刻意設計的「EML 沒有語法表達自訂 print 結尾」限制上，這是
設計上預期、可接受的結果，不是遺憾。**2026-07-19 完成項目 6：`with` / context manager**——動工前
先把 `Duplicate_files_remover` 從第 11 行逐行追蹤到 EOF，確認光做 `with` 沒辦法讓這個檔案完整通過，
第 26 行 `[f for f in os.listdir() if os.path.isfile(f)]` 是一個全新的**列表推導式**缺口，之前
從沒被量測到過。重新量測後，`Duplicate_files_remover` 完全推進過 `with`，卡點換到第 26 行的列表
推導式。**同日再完成項目 7：跨行括號類字面量**——這是 Phase 9 支線**最後一個原本就有編號的項目**，
做完之後項目 1-8 全部收尾。跟 Python 切片語法、列表推導式比較過規模後選的：那兩個都要發明新
`Expression` AST 節點、貫穿整條垂直切面，項目 7 純 lexer 層級、零 AST/parser/walker/emitter 改動，
三個裡最小。動工中意外發現、順手一起修的小問題：測真實語料時發現 `text_to_morse_code` 字典最後
一個 entry 有 trailing comma，純括號深度修復還不夠，於是同一輪也補上 trailing comma 支援。重新
量測後，`text_to_morse_code` 從第 2 行一路推進到第 38 行 `for i in range(length):`——揭露第三個
本輪意外發現的缺口：反向 `range(...)` 辨識只支援兩參數形式，不支援 Python 常見的單參數簡寫
`range(n)`。**Phase 9 支線所有原本編號項目（1-8）現在全部完成**——反向方向沒有任何編號項目待做。**同日
（2026-07-19）再完成這輪發現的未編號候選：`range(n)` 單參數簡寫**——跟切片語法、列表推導式比較過
規模後選的，確認是三者中最小的候選：完全重用既有的 `RangeExpression` AST 節點，零新 token、零
AST/語意層/emitter/直譯器改動，整個修正只在 `packages/transpiler-eml/src/py-parser.ts` 的
`parseRangeCall()` 一個函式裡（放寬成「先解析第一個運算式，看有沒有逗號」，沒逗號就補上隱含的
`0` 起點，重用既有的 `toInclusiveEnd()` helper）。6 個新測試全過。重新量測後，`text_to_morse_code`
從第 38 行的 `range(length)` 完全推進到 EOF——**達成一個重要里程碑：這是 Phase 9 語言擴充支線
開工以來，5 個追蹤中的真實語料檔案裡，第一個完整通過 `eml roundtrip`（`python == canonical` 
fixpoint）的檔案**，用 CLI 直接驗證（`eml compress` → `eml roundtrip` 顯示 `OK ✓`）。

**同日（2026-07-19）再完成這輪的未編號候選：Python 切片語法，雙向**——跟列表推導式比較過規模後選的
（列表推導式還要從零設計 `if` 過濾子句文法+不外洩迴圈變數的新作用域規則，切片只需要兩個可省略的子
運算式，較小）。新增 `SliceExpression` AST 節點（沒有重用 `RangeExpression`，因為 Range 邊界都必填、
語意也不同），貫穿 7 個語意分析 walker + 直譯器 + 3 份 emitter。**設計決定交給 Neo（AskUserQuestion）**：
正向 EML 的 postfix `obj[...]` 原本沒有冒號偵測，這個文法位置是空的，Neo 選擇雙向都做（`obj[a:b]`／
`obj[a:]`／`obj[:b]`／`obj[:]` 正向也支援）。**動工中發現一個值得記住的風險**：7 個 walker 裡有兩個
是非窮盡的（有 `default:` 分支或 void 回傳），`pnpm typecheck` 完全抓不到漏加的 `case`，每個都手動
補上並用專屬測試驗證。798 測試（原 776）。全新 CLI 端到端驗證通過。**誠實重新量測同 5 個真實檔案**：
`Decimal_to_binary_convertor` 的切片本身完全解除，但**沒有達成第二個完整通過**（跟規劃時的樂觀預期
不同）——卡點那一行把切片結果包進 `.format()` 再直接 `print()`，命中一個完全獨立、早就存在的既有
限制（EML 的 `^0` 只能印裸變數，跟 `Calculate_age` 卡住的 `print(x, end=...)` 同一類）。
`Leap_Year_Checker` 卡點也是同一個既有限制，跟切片無關；`Duplicate_files_remover` 仍卡在列表推導式；
`text_to_morse_code` 維持完整通過，沒有回歸。

**同日（2026-07-19）再完成這條支線最後一個未編號候選：列表推導式，雙向**——新增 `ListComprehension`
AST 節點，跟既有的 `SumExpression`（Σ）共用「迭代變數從不宣告進任何作用域，直接讓目標語言自己的
不外洩語意接手」這個關鍵先例，但 `iterable` 是真正泛型的運算式（不像 Σ 鎖定 `RangeExpression`），
對應真實語料要對 `os.listdir()` 迭代的全新需求。**設計決定交給 Neo（AskUserQuestion）**：正向 EML
本來就一直直接沿用 Python 控制流關鍵字原文（`for...in`、`if/elif/else`、`try/except`、`with`、
`class`），所以這個也當同一類處理，Neo 選擇雙向都做。813 測試（原 798），全新 CLI 端到端驗證通過，
且驗證了迭代變數真的不會外洩（讀取會丟 `NameError`，跟真實 Python 3 一致）。**誠實重新量測同 5 個
真實檔案**：`Duplicate_files_remover` 的列表推導式本身完全解除——`eml compress` 完整重建到
`print("Deleted Files")` 那行才停——但同樣**沒有達成完整通過**：卡點換成同一個既有限制
（EML 的 `^0` 只能印裸變數）的另一個實例（這次是直接印字串字面量）。其餘 3 個仍卡住的檔案沒有
變化；`text_to_morse_code` 維持完整通過。

**這條 Phase 9 支線目前所有已知、已發現的獨立候選（編號 1-8 + 未編號的 `range(n)`、切片語法、
列表推導式）現在全部收尾**——反向方向沒有任何已知未動工的語言缺口候選。剩下卡住的 4 個檔案當時
卡點全部歸結到同一個根因——EML 的 `^0` 輸出只能印裸變數，不能表達任何運算式/呼叫/字面量；要不要
放寬、放寬到什麼程度是全新的語言設計決定。

**同日（2026-07-19）再完成 Core 語法放寬：`^0` 輸出支援任意運算式（不是 Phase 9 編號項目）。**
Neo 確認先做這個（範圍小、明確），把規模大很多的 EML-APL/Nova Operator IR 橋接（同日稍早審閱過的
白皮書+封存包，見 `project-eml-apl-nova-bridge` 記憶）留給獨立的未來專案。直接研究發現限制只在
兩處強制（`eml-emitter.ts` 的型別檢查 + 正向 parser 唯一的 `OutputStatement` 建構點），AST/正向
Python emitter/直譯器/全部 7 個 walker 本來就把 `Output.value` 當一般運算式處理，零改動。關鍵
發現：`parsePower()` 本來就有 `Number(n.value) !== 0` 的既有讓步（`CARET` 緊接字面 `0` 永遠不會被
吃成次方運算），讓正向 parser 的放寬變成小、安全的加法，也讓「任意運算式」比「只放寬語料需要的
型別」更省成本。823 測試（原 813）。**重新量測同 5 個真實檔案，達成重要里程碑**：
`Decimal_to_binary_convertor`、`Duplicate_files_remover`、`Leap_Year_Checker` 全部新達成完整通過，
加上 `text_to_morse_code`——**5 個追蹤檔案現在有 4 個完整通過**，比兩輪前的 1 個大幅躍進。
`Calculate_age` 仍卡住（`end=""` 既有永久限制，這輪沒動，符合預期）。詳見
`docs/agent-handoff.md`「Core 語法放寬」章節、`docs/EML-LANG-2026-v1.0.md` §5.3、§9。

**同日（2026-07-19）再完成 Core 語法放寬（續）：`print(x, end=...)` 支援正向語法
`EXPR^0(END_EXPR)`，達成整條 B-6 語料追蹤工程裡最大的里程碑。** Neo 主動要求重新研究這個項目 5
既有的永久限制，並提出「如果真的很麻煩就該公告成已知問題」——直接研究後確認可以做（不需要一般性
具名參數呼叫語法，範圍收在 `^0` 自己的文法裡，零衝突風險），於是就直接動手做掉，沒有走到公告
未解問題那一步。835 測試（原 823）。**重新量測同 5 個真實檔案**：`Calculate_age` 完整通過，
加上原本就通過的其餘 4 個——**5 個追蹤中的真實 B-6 語料檔案，現在全部（5/5）完整通過
`eml roundtrip`**，這是整個語言擴充 + B-6 語料追蹤工程開工以來第一次達成語料庫全數通過。詳見
`docs/agent-handoff.md`「Core 語法放寬（續）」章節、`docs/EML-LANG-2026-v1.0.md` §5.3、§9。

**B-6 這個 KPI 本身現在已經達成**——5 個追蹤中的真實語料檔案全部完整通過 `eml compress`/
`eml roundtrip`。反向方向沒有任何已知未動工的語言缺口候選。次要候選（皆為純工程、不需要商業
判斷或品牌素材）：A-3 好裝好跑（npm 發佈/`npx eml`，注意實際 `npm publish` 需要 Neo 明確授權）、
多做幾個真實移植案例（A-4，目前 2 個)、B-5 的 fuzz/property testing 缺口、追蹤更多真實語料檔案
擴大 B-6 樣本數（目前只有 5 個）。E-11 開放核心定價需要商業判斷，非工程可單方面決定，暫不主動
動工。EML-APL/Nova Operator IR 橋接是全新的大型未來專案（見 `project-eml-apl-nova-bridge` 記憶），
明確尚未開工，等 Neo 之後決定。
