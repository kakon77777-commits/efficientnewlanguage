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
| B-6 | 真實語料驗證（壓縮率/往返等價率 KPI） | `█░░░░` 1 | Tic-Tac-Toe + Number Guessing Game 兩個移植是非正式的前兩步，白皮書 §11 的正式量測還沒做。 |
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

## 工作日誌（新到舊）

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

roadmap 自己的建議優先序：**A-1（已完成）→ C-8（已完成）→ E-11 開放核心定價**。目前排在最前面等待
決定的是 **E-11：開放核心定價分層**（明確免費 vs 商業界線與定價）——這需要 Neo 的商業判斷，非工程可
單方面決定，暫不主動動工。順帶完成了 B-5（公開 conformance suite MVP）。次要候選（皆為純工程、
不需要商業判斷或品牌素材）：A-3 好裝好跑（npm 發佈/`npx eml`，注意實際 `npm publish` 需要 Neo
明確授權）、多做幾個真實移植案例（B-6/A-4，目前 2 個）、B-5 的 fuzz/property testing 缺口。
