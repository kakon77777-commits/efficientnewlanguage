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
| 9-3 | 字串格式化（`%` 格式化 + `.format()`） | `░░░░░` 0 | 未開始，兩套獨立機制。 |
| 9-4 | 三引號字串 `"""..."""` | `░░░░░` 0 | 未開始；`Leap_Year_Checker` 目前卡在這。 |
| 9-5 | `print(x, end="")` 等關鍵字參數 | `░░░░░` 0 | 未開始，EML 目前無具名參數呼叫語法。 |
| 9-6 | `with` / context manager | `░░░░░` 0 | 未開始，目前發現規模最大最複雜的一項（牽涉執行語意，非僅語法）。 |
| 9-7 | 跨行括號類字面量 | `░░░░░` 0 | 未開始，全語言層級既有邊界（Phase B2 發現）。 |
| 9-8 | `not` 布林一元反轉運算子 | `░░░░░` 0 | 未開始。2026-07-17 量測 9-2 時意外發現（`Calculate_age` 第 21 行 `(not leap_year)`，之前被 `%` 擋在更前面沒被量測到）。規模應該很小，跟 9-1 同一套機制（短路/真值反轉），只是一元不是二元。 |

---

## 工作日誌（新到舊）

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
缺口，新增為項目 9-8）。反向方向現在只剩 **項目 3-8 待做**：字串格式化（`%`格式化 + `.format()`，
兩套機制）、三引號字串（`Leap_Year_Checker` 目前卡在這）、`print(x, end="")` 等關鍵字參數、
`with`/context manager（目前發現規模最大最複雜的一項）、跨行括號類字面量（全語言層級，非 Phase
制）、`not` 一元布林反轉（規模應該很小，跟項目 1 同一套機制）。這些要投入到什麼程度、下一項選哪
個，都需要 Neo 決定——`not` 規模最小，是最直接的候選。次要候選（皆為純工程、不需要商業判斷或品牌
素材）：A-3 好裝好跑（npm 發佈/`npx eml`，注意實際 `npm publish` 需要 Neo 明確授權）、多做幾個真實
移植案例（A-4，目前 2 個)、B-5 的 fuzz/property testing 缺口。E-11 開放核心定價需要商業判斷，非
工程可單方面決定，暫不主動動工。
