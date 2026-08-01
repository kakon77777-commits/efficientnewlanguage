# EML 雙 AI 並行研發協作架構  
## EML-P／EML-U Parallel Agent Development Protocol v1.0

**文件編號：** EML-PU-PARALLEL-AGENT-PROTOCOL-2026-v1.0  
**日期：** 2026-07-23  
**作者：** Neo.K（許筌崴）  
**組織：** EveMissLab／一言諾科技有限公司  
**文件狀態：** 架構決策／本地 Agent 交接規範  
**適用範圍：** EML-P、EML-U、共享語意層、網站展示、測試語料、AI 學習與商業展示  

---

# 0. 文件目的

本文件用於正式確立 EML 的雙軌並行研發模式：

- **EML-P：Practical Execution Profile／實用執行版**
- **EML-U：Universal Semantic Profile／通用語意原始版**

兩者可以由兩個獨立 AI Agent 同時推進。

本文件不是將 EML 拆成兩套互不相干的語言，也不是重新開始設計 EML。其目的在於修正過去將完整 EML 1.0～1.5 路線壓縮為單一 Python 工程 MVP 的問題，並建立一個能同時容納：

- 可執行工程；
- 大量案例與測試；
- AI 學習與 Token 壓縮；
- 原始本體論；
- 通用語意附加；
- 未來多語言、多媒介與 AI-native 使用；

的長期架構。

核心關係如下：

$$
\mathrm{EML\text{-}P}\subseteq\mathrm{EML\text{-}U}
$$

EML-P 是 EML-U 中目前可執行、可測試、可展示、可量化的一個實用 Profile。

EML-U 定義更完整的語意空間、原始脈絡與未來方向；它不得被目前 EML-P 的 parser、runtime 或 Python adapter 限制。

---

# 1. 架構決策摘要

EML 不再採用「先完成 EML-P，之後才開始 EML-U」的完全串行模式。

正式採用：

```text
EML-P 持續施工
＋
EML-U 低速但持續建構
＋
共享語意層定期對齊
```

兩個 Agent 可以同時工作，但不得自由修改同一套核心規範。

推薦總體結構：

```text
                         EML
                          │
                ┌─────────┴─────────┐
                │                   │
             EML-P               EML-U
        實用執行與實證層       通用語意與本體層
                │                   │
                └─────────┬─────────┘
                          │
             Shared Semantic Governance
       Registry / Mapping / Invariants / Decision Log
```

---

# 2. 為什麼現在可以並行

目前 EML-P 已經具有相對明確的工程方向：

- Python 為 canonical adapter；
- 確定性 transpilation；
- parser、AST、semantic pass、emitter；
- interpreter、trace、round-trip；
- 大量案例與測試；
- 逐步擴張 corpus；
- 從案例中發現高頻意圖；
- 測量字元與 Token 壓縮；
- 建立 AI 學習資料；
- 作為技術展示與商業展示。

EML-P 當前主要工作已由「定義它是什麼」轉為：

```text
案例擴張
→ 測試
→ 分類
→ 分範疇
→ 分層
→ 壓縮測量
→ AI 學習
→ 商業展示
```

這條線偏工程、實證、資料與產品。

EML-U 的主要工作則是：

```text
原始脈絡復原
→ 本體論分層
→ 通用語意單元
→ 二維與多位置附加
→ Host-neutral Semantic IR
→ 多語言／多媒介投影
→ 與 EML-P 的降階映射
```

兩條線的日常任務並不完全重疊，因此可以由不同 Agent 平行施工。

---

# 3. EML-P 定義

## 3.1 正式名稱

**EML-P：Practical Execution Profile**  
中文：**EML 實用執行版**

## 3.2 核心目標

EML-P 的目標不是代表全部 EML，而是建立一個：

- 真正可用；
- 可執行；
- 可測試；
- 可除錯；
- 可逆轉換；
- 可量化壓縮；
- 可供 AI 學習；
- 可供產品展示；

的穩定工程 Profile。

## 3.3 EML-P 當前主要內容

```text
EML-P
├── Syntax
├── Symbol Catalog
├── Parser
├── AST
├── Semantic Analysis
├── Python Adapter
├── C++ Prototype Adapter
├── Interpreter
├── Trace
├── Round-trip
├── Corpus
├── Benchmarks
├── Workbench
├── CLI / LSP / MCP
└── Commercial Demonstrations
```

## 3.4 EML-P 的主要判準

EML-P 每一項新能力都必須回答：

1. 是否有真實案例？
2. 是否降低字元或 Token？
3. 是否降低 AI 生成與理解成本？
4. 是否具有穩定、低歧義的語法？
5. 是否能 deterministic transpile？
6. 是否能測試？
7. 是否能 round-trip，或明確標示不可逆原因？
8. 是否能被 Workbench 與 Agent 使用？
9. 是否具有技術展示或商業展示價值？

## 3.5 EML-P 不等於 Python 語法糖

Python 是 EML-P 的第一個 canonical adapter，但不得因此宣稱：

```text
Python 的邊界 = EML 的邊界
```

正確關係是：

```text
EML-P Semantic Subset
        ↓
Python Adapter
```

而不是：

```text
Python Grammar
        ↓
換成少量符號
```

EML-P 應從大量案例中逐步抽象出高頻語意單元，而不是無限補齊 Python 表面語法。

---

# 4. EML-U 定義

## 4.1 正式名稱

**EML-U：Universal Semantic Profile**  
中文：**EML 通用語意原始版**

## 4.2 核心定位

EML-U 保存並延續 EML 1.0～1.5 原始路線中的完整方向，包括但不限於：

- 通用語意附加；
- 基底內容與附加語意分離；
- 右上角或多位置語意符號；
- 二維與多維語法；
- 語意疊加；
- 冷／熱／時間／狀態／BUG／驗證／修復；
- Host-neutral Semantic IR；
- 多程式語言投影；
- 自然語言、資料、工作流、圖像與多媒介；
- AI-native 表達；
- 高密度語意壓縮；
- 未來能源、算力與 Token 節省。

## 4.3 EML-U 不受目前實作限制

以下推論一律禁止：

```text
目前 parser 不支援
→ EML-U 不存在此能力
```

```text
目前 Python adapter 無法表示
→ EML-U 不應定義此語意
```

```text
目前沒有測試
→ 此概念不屬於 EML
```

正確做法是將能力標記為：

- implemented；
- tested；
- partial；
- specified；
- experimental；
- conceptual；
- planned；
- deprecated。

「是否已實作」只表示工程狀態，不表示本體存在資格。

## 4.4 EML-U 的主要判準

EML-U 每一項能力都必須回答：

1. 它代表什麼通用語意？
2. 它屬於哪一個本體層或語意範疇？
3. 是否能跨宿主語言成立？
4. 是否能跨文本、資料、工作流或多媒介成立？
5. 它與既有語意是否重複？
6. 它是否能降階至 EML-P？
7. 無法降階時，遺失的是什麼？
8. 是否存在歧義或位置衝突？
9. 是否適合 AI 學習、生成與執行？
10. 是否具有壓縮與能源效益？

---

# 5. 雙 Agent 正式分工

## 5.1 AI-P：實用執行與案例工程 Agent

AI-P 主要負責 EML-P。

### 核心職責

- 收集真實程式案例；
- 建立 Python → EML → Python 測試；
- 擴大 corpus；
- 建立正例、反例與邊界案例；
- 測量字元壓縮率；
- 測量 tokenizer 壓縮率；
- 測量 AST／結構壓縮；
- 測量 AI 理解與生成穩定度；
- 找出高頻程式意圖；
- 提議低歧義、高收益符號；
- 改進 parser、semantic pass、emitter；
- 改進 interpreter、trace、round-trip；
- 建立 Workbench；
- 建立 Agent 使用資料；
- 建立商業技術展示；
- 將案例逐步分類、分範疇、分層。

### AI-P 不得做的事

- 不得把 EML-P 宣稱為完整 EML；
- 不得用目前 parser 限制否定 EML-U；
- 不得自行修改 EML-U 的本體定義；
- 不得把 Python 相容率當成唯一目標；
- 不得因為某能力未實作就從 EML 歷史或架構中刪除；
- 不得靜默改變既有符號語意；
- 不得在沒有 benchmark 的情況下宣稱 Token 節省；
- 不得把測試通過等同於本體正確。

---

## 5.2 AI-U：通用語意與原始架構 Agent

AI-U 主要負責 EML-U。

### 核心職責

- 復原 EML 1.0～1.5 完整脈絡；
- 區分原始設計、工程 MVP 與後續補充；
- 建立本體層、語意層、表示層、投影層與執行層；
- 定義通用語意原子；
- 定義語意組合規則；
- 研究右上角與多位置附加；
- 研究二維／多維語法；
- 建立 Host-neutral Semantic IR；
- 建立跨語言、跨媒介投影；
- 建立 EML-U → EML-P 降階規則；
- 建立能力狀態分類；
- 建立概念展示區與未來展望；
- 吸收 EML-P corpus 的實證結果；
- 判斷 EML-P 發現的模式是否應上升為通用語意。

### AI-U 不得做的事

- 不得把 conceptual 能力宣稱為 EML-P 已實作；
- 不得直接修改 EML-P parser 或 production runtime；
- 不得未經實證就大量發明符號；
- 不得把抽象完整性置於可理解性與可映射性之上；
- 不得忽略 EML-P 的真實案例與 benchmark；
- 不得自行覆蓋既有 EML-P 符號語意；
- 不得要求 EML-P 立即實作所有 EML-U 能力；
- 不得把 EML-U 寫成無法降階、無法驗證的純概念集合。

---

# 6. 共享協調層

兩個 Agent 不得只靠對話歷史同步。

所有關鍵狀態必須持久化到 repository。

推薦結構：

```text
docs/
├── eml-p/
│   ├── EML-P-PROFILE.md
│   ├── SYNTAX.md
│   ├── CORPUS-PLAN.md
│   ├── BENCHMARKS.md
│   ├── IMPLEMENTATION-STATUS.md
│   └── WORKBENCH.md
│
├── eml-u/
│   ├── EML-U-PROFILE.md
│   ├── HISTORICAL-CONTEXT.md
│   ├── ONTOLOGY.md
│   ├── SEMANTIC-PRIMITIVES.md
│   ├── SPATIAL-OVERLAY.md
│   ├── UNIVERSAL-IR.md
│   └── FUTURE-ROADMAP.md
│
└── shared/
    ├── EML-INVARIANTS.md
    ├── EML-CAPABILITY-REGISTRY.md
    ├── EML-P-U-MAPPING.md
    ├── EML-DECISION-LOG.md
    ├── EML-CONFLICT-REGISTER.md
    └── EML-AGENT-HANDOFF.md
```

程式碼可採：

```text
packages/
├── eml-p-core/
├── eml-p-python/
├── eml-p-workbench/
├── eml-u-experimental/
├── semantic-ir/
└── shared-registry/
```

EML-U 初期不必直接建立 production package；可先置於：

```text
experiments/eml-u/
```

或：

```text
packages/eml-u-experimental/
```

避免概念原型被誤認為正式 runtime。

---

# 7. 必須建立的共享文件

## 7.1 `EML-INVARIANTS.md`

此文件記錄不可破壞的總原則。

最低內容：

```md
1. EML-P 是 EML-U 的可執行 Profile。
2. EML-P 的實作限制不得被宣稱為 EML-U 的本體限制。
3. EML-U 的概念能力不得被宣稱為 EML-P 已支援。
4. 不得靜默丟失語意。
5. 同一符號不得在不同 Profile 中無標記地改義。
6. 所有降階都必須標示 lossless、lossy、metadata-only 或 unsupported。
7. Python 是 EML-P 的第一 adapter，不是 EML 的本體。
8. 測試定義目前實作真實，不定義完整本體真實。
9. 歷史脈絡不得被新 MVP 規格自動覆蓋。
10. 重大共享變更必須進入 Decision Log。
```

---

## 7.2 `EML-CAPABILITY-REGISTRY.md`

每項能力需具有唯一 ID。

建議欄位：

```yaml
id: EML-CAP-OUTPUT-001
name: output
profile:
  - EML-P
  - EML-U
semantic_category: externalization
surface_forms:
  eml_p: "^0"
  eml_u:
    - spatial-upper-right-output
status:
  specified: true
  implemented: true
  tested: true
  experimental: false
mapping:
  python: "print(value)"
  cpp: "std::cout << value"
loss_model: lossless
notes: ""
```

允許狀態：

```text
implemented
tested
partial
specified
experimental
conceptual
planned
deprecated
rejected
```

---

## 7.3 `EML-P-U-MAPPING.md`

此文件記錄 EML-P 與 EML-U 的對應。

範例：

| EML-P 構造 | EML-U 通用語意 | 映射類型 | 狀態 |
|---|---|---|---|
| `x^0` | externalize / output | lossless | implemented |
| `Σ` | aggregate / reduce | subset | implemented |
| `@cold` | stable / memoizable semantic state | partial | implemented |
| `@hot` | dynamic / non-crystallized state | partial | implemented marker |
| `@temporal_loop` | temporal maturation / delayed condition | partial | implemented |
| `^T` | structural transform / transpose | domain-specific | implemented |
| 右上附加 | spatial semantic attachment | no P equivalent | conceptual |
| 多位置符號 | multi-axis semantic overlay | no P equivalent | conceptual |
| 通用 IR | host-neutral semantic representation | shared target | planned |

---

## 7.4 `EML-DECISION-LOG.md`

每項重大決策必須記錄：

```yaml
decision_id: EML-DEC-2026-001
date: 2026-07-23
title: Adopt dual-profile architecture
decision: EML-P and EML-U proceed in parallel
reason:
  - preserve original EML ontology
  - retain practical executable profile
  - prevent MVP from redefining the whole language
affects:
  eml_p: true
  eml_u: true
  shared: true
approved_by: Neo.K
status: accepted
```

---

## 7.5 `EML-CONFLICT-REGISTER.md`

Agent 遇到以下問題不得自行解決：

- 歷史文件與現行規格衝突；
- 同一符號多義；
- P 與 U 對同一能力分類不同；
- 新能力可能破壞 round-trip；
- 新能力可能造成 silent semantic loss；
- shared IR schema 需要 breaking change；
- 原始設計與實際案例互相矛盾。

必須記錄：

```text
衝突內容
涉及文件
涉及程式碼
P 的觀點
U 的觀點
可選方案
風險
建議
等待 Neo.K 決策
```

---

# 8. 權威層級

過去的主要錯誤，是將 parser、測試與目前實作提升為完整 EML 的唯一真實來源。

新的權威層級必須分開。

## 8.1 本體與歷史權威

回答：

> EML 是什麼？原始路線是什麼？

來源：

```text
EML 1.0～1.5 原始文件
EML-U Profile
EML Historical Context
Ontology / Semantic Primitives
```

## 8.2 Profile 權威

回答：

> EML-P 或 EML-U 各自承諾什麼？

來源：

```text
EML-P-PROFILE.md
EML-U-PROFILE.md
EML-P-U-MAPPING.md
```

## 8.3 語法權威

回答：

> 目前 EML-P parser 接受什麼？

來源：

```text
EML-P language specification
EBNF
symbol registry
conformance tests
```

## 8.4 實作權威

回答：

> 程式目前真正做到什麼？

來源：

```text
source code
tests
benchmark output
implementation status
```

## 8.5 產品與網站權威

回答：

> 使用者目前在網站上能看到與使用什麼？

來源：

```text
/app
Workbench
public docs
release notes
```

這五層不得再壓成單一「single source of truth」。

每一層都可以有自己的權威文件，但不得跨層越權。

---

# 9. 雙向提案流程

## 9.1 EML-U → EML-P：Semantic Proposal

AI-U 發現一項通用語意時，不得直接要求 AI-P 實作。

必須提交：

```text
Semantic Proposal
├── 語意定義
├── 本體分類
├── 使用情境
├── 跨語言證據
├── 可能表面形式
├── 歧義分析
├── 降階方式
├── 語意遺失模型
└── 建議實證案例
```

AI-P 接著負責：

- 搜集真實案例；
- 測試頻率；
- 測試壓縮；
- 測試 parser 可行性；
- 測試 AI 學習穩定度；
- 判斷是否進入 EML-P。

結果只能是：

```text
accepted-for-P
experimental-in-P
remain-in-U
rejected
needs-more-data
```

---

## 9.2 EML-P → EML-U：Empirical Pattern Proposal

AI-P 從 corpus 中發現高頻結構時，提交：

```text
Empirical Pattern
├── 真實案例數
├── 來源範疇
├── 字元頻率
├── Token 頻率
├── 現行展開
├── 建議壓縮
├── 歧義
├── 執行成本
└── 是否跨語言
```

AI-U 接著判斷：

- 是否是一個真正通用語意；
- 是否只是 Python 慣用法；
- 是否已被既有語意原子涵蓋；
- 是否應合併；
- 是否應提升到 EML-U；
- 是否只留在 EML-P adapter 層。

結果只能是：

```text
promote-to-U
P-only
adapter-specific
merge-with-existing
reject-as-surface-pattern
needs-more-analysis
```

---

# 10. EML-P 的實證與壓縮研究

EML-P 的案例工作不只是補測試。

每個 corpus 應逐步產出以下資料：

## 10.1 基本壓縮

$$
C_{\text{char}}
=
1-
\frac{\text{EML characters}}
{\text{source characters}}
$$

## 10.2 Token 壓縮

$$
C_{\text{token}}
=
1-
\frac{\text{EML tokens}}
{\text{source tokens}}
$$

必須針對實際使用的 tokenizer 測量，不得只用字元數代替。

## 10.3 結構壓縮

可測量：

- AST node 數；
- tree depth；
- repeated structure；
- boilerplate reduction；
- semantic operation count。

## 10.4 AI 使用效益

測試：

- AI 能否從 EML 正確還原意圖；
- AI 是否需要較少上下文；
- AI 生成錯誤率；
- AI 修改既有程式時的穩定度；
- few-shot 範例數需求；
- 推理與執行 Token；
- 多輪修正次數；
- 同一任務的能源與時間代理指標。

## 10.5 商業展示效益

展示項目：

- 原程式與 EML 對照；
- Token 節省；
- 可逆轉換；
- 即時 trace；
- AI 生成；
- 多案例批次轉換；
- corpus dashboard；
- 語意分類；
- 未來 EML-U 概念區。

---

# 11. EML-U 的本體分層

EML-U 初期至少區分以下層：

```text
L0  Base Carrier Layer
    原始文本、程式、資料、圖像、工作流

L1  Attachment Layer
    右上角、旁註、多位置、標記與語意附加

L2  Semantic Primitive Layer
    行為、狀態、時間、條件、聚合、輸出、驗證、修復等

L3  Composition Layer
    語意組合、作用域、依賴、優先序與衝突

L4  Universal IR Layer
    Host-neutral semantic representation

L5  Profile Projection Layer
    EML-P、其他語言 Profile、媒介 Profile

L6  Adapter Layer
    Python、C++、Rust、Java、自然語言、資料工作流等

L7  Runtime / Agent Layer
    執行、推理、工具調用、驗證、追蹤與自我修復
```

EML-U 不得將這些層重新壓回單一符號表。

---

# 12. 降階與語意遺失模型

所有 EML-U → EML-P 轉換必須分類：

## 12.1 Lossless

完整保留語意。

```text
EML-U semantic output
→ EML-P ^0
```

## 12.2 Subset

只保留較窄子集。

```text
通用 aggregation
→ EML-P Σ numeric summation
```

## 12.3 Metadata-only

執行語意無法完整表達，但可保留 metadata。

```text
空間位置語意
→ linear EML-P + metadata
```

## 12.4 Lossy

可以轉換，但會失去部分語意。

必須產生 warning 與 loss report。

## 12.5 Unsupported

不得猜測，不得靜默刪除。

```text
Unsupported EML-U construct
→ explicit diagnostic
```

正式原則：

$$
\mathrm{EML\text{-}U}
\rightarrow
\mathrm{EML\text{-}P}
\cup
\mathrm{Metadata}
\cup
\mathrm{Unsupported}
$$

禁止 silent semantic loss。

---

# 13. Git 與工作區策略

推薦使用獨立 branch 或 worktree。

```text
main
├── eml-p/development
├── eml-u/research
└── shared/governance
```

## 13.1 AI-P 可直接修改

```text
packages/eml-p-*
tests/eml-p/
corpus/
benchmarks/
docs/eml-p/
```

## 13.2 AI-U 可直接修改

```text
docs/eml-u/
experiments/eml-u/
packages/eml-u-experimental/
```

## 13.3 需要協調的區域

```text
docs/shared/
packages/semantic-ir/
packages/shared-registry/
root README
public website navigation
```

任何 shared breaking change 必須：

1. 建立 Decision Log；
2. 更新 Mapping；
3. 更新 Capability Registry；
4. 雙方檢查；
5. 由 Neo.K 或指定協調者批准。

---

# 14. 同步節奏

建議採用「持續施工＋里程碑交叉審查」。

## 14.1 AI-P 持續輸出

- 新案例；
- 新測試；
- 新 benchmark；
- 新壓縮數據；
- 新高頻模式；
- parser 或 Workbench 改進；
- 商業展示進度。

## 14.2 AI-U 持續輸出

- 原始脈絡復原；
- 本體分類；
- 語意原子；
- P/U 映射；
- Universal IR 草案；
- 空間附加原型；
- 概念展示區內容。

## 14.3 同步觸發條件

以下情況必須同步：

- P 新增符號；
- U 新增通用語意原子；
- shared IR 改變；
- 同一概念出現重複定義；
- 需要 breaking change；
- corpus 發現現有本體分類錯誤；
- U 無法降階到 P；
- P 出現大量 adapter-specific 補洞；
- 網站可能誤導使用者。

不必固定每天同步；以里程碑與重大變更為主。

---

# 15. 網站定位

`/app` 目前以 EML-P 為主要可用產品。

建議結構：

```text
/app
├── EML-P Workbench
├── EML-P Symbol Palette
├── Examples
├── Trace
├── Round-trip
├── Benchmarks
├── AI Use
└── EML-U
    ├── Original Context
    ├── Universal Semantic Vision
    ├── Spatial Overlay
    ├── Semantic IR
    ├── Future Profiles
    └── Research Status
```

EML-U 區初期必須明確標示：

```text
原始脈絡
概念架構
研究中
未來方向
非當前 EML-P 可執行能力清單
```

EML-P 區必須明確標示：

```text
目前可用
可測試
可執行
不代表全部 EML
```

---

# 16. 目前階段的首輪任務

## 16.1 AI-P 首輪任務

1. 保持現有案例與測試擴張。
2. 建立 corpus 分類標籤。
3. 建立字元／Token／AST 壓縮 benchmark。
4. 區分 Python parity 工作與真正 EML 壓縮工作。
5. 建立高頻意圖排行榜。
6. 檢查哪些現行符號只有視覺壓縮，哪些有 Token 壓縮。
7. 整理 Workbench 使用流程。
8. 建立 AI few-shot 測試集。
9. 將網站主產品明確標為 EML-P。
10. 不改動 EML-U 的本體文件。

## 16.2 AI-U 首輪任務

1. 整理 EML 1.0～1.5 歷史時間線。
2. 建立 `HISTORICAL-CONTEXT.md`。
3. 建立 `EML-U-PROFILE.md`。
4. 建立初版本體層級。
5. 建立初版 Semantic Primitive Registry。
6. 整理右上角與多位置語意附加。
7. 建立 Universal IR 最小 schema 草案。
8. 建立 EML-U → EML-P 映射初稿。
9. 在網站概念區建立簡要介紹。
10. 不修改 EML-P production parser。

## 16.3 Shared 首輪任務

1. 建立 `EML-INVARIANTS.md`。
2. 建立 `EML-CAPABILITY-REGISTRY.md`。
3. 建立 `EML-P-U-MAPPING.md`。
4. 建立 `EML-DECISION-LOG.md`。
5. 建立 `EML-CONFLICT-REGISTER.md`。
6. 更新 root README 的雙 Profile 定位。

---

# 17. Agent 啟動提示詞

以下內容可直接提供給新的本地 Agent。

```text
你正在負責 EML 雙 Profile 架構中的一條獨立工作線。

首先完整閱讀：

1. docs/shared/EML-INVARIANTS.md
2. docs/shared/EML-CAPABILITY-REGISTRY.md
3. docs/shared/EML-P-U-MAPPING.md
4. docs/shared/EML-DECISION-LOG.md
5. 本工作線對應的 Profile 文件
6. git status、最近 commit 與現行測試狀態

EML-P 是目前可執行、可測試的實用 Profile。
EML-U 是完整通用語意空間、原始脈絡與未來架構。
EML-P ⊆ EML-U。

不得用 EML-P 的 parser 或 runtime 限制否定 EML-U。
不得把 EML-U 的 conceptual 能力宣稱為 EML-P 已支援。
不得靜默改義、刪除或降階語意。
不得自行解決跨 Profile 衝突，必須寫入 Conflict Register。

開始工作前先輸出：

A. 你所負責的 Profile
B. 你將閱讀的文件
C. 當前任務邊界
D. 不可破壞的不變量
E. 預計修改的檔案
F. 驗收方式

完成工作後更新：

1. Implementation / Research Status
2. Capability Registry
3. P-U Mapping（若有影響）
4. Decision Log（若為重大決策）
5. Agent Handoff
6. 測試或研究結果

禁止在未更新共享文件的情況下完成重大架構變更。
```

---

# 18. AI-P 專用啟動提示詞

```text
你是 AI-P，負責 EML-P Practical Execution Profile。

你的主要目標是：
案例、測試、壓縮、可執行性、AI 學習、Workbench 與商業展示。

你可以修改：
- packages/eml-p-*
- tests/eml-p/
- corpus/
- benchmarks/
- docs/eml-p/

你不得：
- 把 EML-P 宣稱為完整 EML
- 用 Python 或 parser 邊界否定 EML-U
- 自行修改 EML-U 本體
- 只追求 Python parity 而忽略語意壓縮
- 未測量就宣稱 Token 節省

每次新增能力必須附：
真實案例、語法理由、壓縮數據、歧義分析、測試、映射狀態。
```

---

# 19. AI-U 專用啟動提示詞

```text
你是 AI-U，負責 EML-U Universal Semantic Profile。

你的主要目標是：
復原 EML 1.0～1.5、建立本體分層、通用語意原子、
空間附加、Universal IR、跨語言／跨媒介投影與 P/U 映射。

你可以修改：
- docs/eml-u/
- experiments/eml-u/
- packages/eml-u-experimental/

你不得：
- 將 conceptual 能力宣稱為 EML-P 已實作
- 直接修改 EML-P production parser
- 未經實證大量發明符號
- 忽略 EML-P corpus 與 benchmark
- 靜默改變既有 EML-P 符號語意

每項新概念必須附：
語意定義、本體分類、跨域理由、映射方式、語意遺失模型、
實作狀態與可驗證研究問題。
```

---

# 20. 成功標準

## 20.1 EML-P 成功標準

- corpus 持續增加；
- round-trip 與 execution truth 穩定；
- 壓縮指標可重現；
- AI 學習效益可測量；
- Workbench 可實際使用；
- 符號新增有案例與數據支持；
- Python parity 不再掩蓋 EML 的語意目標；
- 商業展示能清楚說明價值；
- 文件、實作與網站一致。

## 20.2 EML-U 成功標準

- EML 1.0～1.5 脈絡可追溯；
- 本體層與工程層明確分離；
- 語意原子具有唯一 ID；
- 空間附加有形式化模型；
- Universal IR 有最小可測 schema；
- P/U 映射覆蓋率持續提高；
- 概念能力不再被 parser 邊界吞掉；
- 不會把未實作內容包裝成已實作；
- 能吸收 EML-P 的實證結果；
- 能逐步產生新的可執行 Profile。

## 20.3 共享層成功標準

- 重大決策可追溯；
- 衝突不再由 Agent 自行猜測；
- 不再發生 MVP 取得完整本體權威；
- 不再發生網站切片被誤認為完整 EML；
- 所有降階都有明確語意遺失分類；
- P 與 U 可以獨立推進又能定期會合。

---

# 21. 核心原則

EML-P 的發展方向是：

```text
從案例向上歸納
```

EML-U 的發展方向是：

```text
從本體向下分解
```

兩者透過共享 registry、mapping、invariants 與 decision log 會合。

形式化地說：

$$
\text{EML-P Empirical Discovery}
\rightleftarrows
\text{EML-U Ontological Abstraction}
$$

EML-P 提供：

- 頻率；
- 壓縮；
- 語料；
- 可執行性；
- AI 學習；
- 實際產品價值。

EML-U 提供：

- 分類；
- 範疇；
- 本體；
- 通用性；
- 語意一致性；
- 未來投影能力。

最終不是由一方取代另一方，而是形成：

$$
\boxed{
\text{實證工程}
+
\text{通用本體}
+
\text{共享治理}
}
$$

---

# 22. 最終架構決議

自本文件起，EML 正式採取雙 AI 並行研發模式。

1. EML-P 可持續擴張案例、測試、壓縮研究、AI 學習與商業展示。
2. EML-U 可同步進行原始脈絡復原、本體分層、通用語意與未來架構。
3. 兩邊不得自由改動同一核心。
4. 所有共享變更必須經過 registry、mapping、decision log 與 conflict register。
5. EML-P 的工程成熟度不得再覆蓋 EML-U 的本體地位。
6. EML-U 的完整性不得被包裝成 EML-P 的現成功能。
7. 兩邊必須以可追溯、可降階、可測試與不靜默遺失語意為共同原則。

最簡潔的總結是：

> **EML-P 負責讓 EML 現在可以被使用；EML-U 負責確保 EML 未來不會被現在的實作邊界永久縮窄。**

而雙 AI 的目的不是把專案分裂，而是讓：

> **一個 Agent 持續把 EML 做實，另一個 Agent 持續把 EML 做完整。**
