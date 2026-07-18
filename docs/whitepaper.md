---
title: "EML 2026：面向 AI Agent 的高密度語意附加程式語言"
subtitle: "從 MVP 轉譯器到 EML 可觀測執行層的技術白皮書"
version: "EML-LANG-2026-MVP-Whitepaper-v0.1"
date: "2026-06-20"
author: "Neo.K（許筌崴）"
organization: "EveMissLab（一言諾科技有限公司）"
status: "draft / MVP technical whitepaper"
type: "technical-whitepaper / product-architecture / language-spec-draft"
keywords:
  - EML
  - Efficient New Language
  - Semantic Overlay
  - Py+
  - C+++
  - EML Trace
  - EML Studio
  - EML Symbol Palette
  - AI-readable code
  - Agent-native programming
  - Logic Crystallization
  - Temporal Loop
  - Bug Immunity
---

# EML 2026：面向 AI Agent 的高密度語意附加程式語言

## 副標題：從 MVP 轉譯器到 EML 可觀測執行層的技術白皮書

**作者**：Neo.K（許筌崴）  
**機構**：EveMissLab（一言諾科技有限公司）  
**版本**：EML-LANG-2026-MVP-Whitepaper-v0.1  
**日期**：2026-06-20  
**文件性質**：技術白皮書 / MVP 架構說明 / 開源前設計綱領  
**核心定位**：EML 不是單一新語言，而是一套可被 Python、C++、AI Agent、編輯器與執行觀測系統共同採用的語意附加程式設計協議。

---

> **2026-07-18 文件邊界修訂**：本文保留工程演進史，但 EML 的可執行語法以
> `EML-LANG-2026-v1.0` 與 EBNF 為準；遺失的 EML 1.5 語義以
> `EML-AI-SEMANTIC-SPEC-v1.5.md` 為準。文中出現的舊產品名、協議名與研究框架只代表
> 歷史介面或相容標識，不是理解 EML 的前置依賴。EML 的語義定義必須能在 EML 內部自足。

## 摘要

EML（Efficient New Language）是一套面向人類與 AI Agent 共同編程場景的高密度語意附加程式語言／語言增益層。它的核心不是單純發明更多符號，也不是以符號壓縮替代所有傳統語法，而是將「語意附加」（Semantic Overlay）設計為可解析、可轉譯、可視覺化、可回放、可驗證的工程協議。

早期 EML 文件已提出右上角符號、Py⁺、C⁺⁺⁺、資訊密度、冷熱分離、邏輯結晶化、十二種迴圈、時間迴圈、BUG 免疫與動態編譯器等概念。這些概念構成 EML 的長期理論邊界，但若直接以 Ultimate 形態開發，MVP 會被過度宏大的系統目標壓垮。因此，本白皮書重新定義 EML 2026 的工程化起點：**先完成一個可跑、可測、可展示、可被 Agent 接手的最小閉環**。

EML MVP 的最小閉環為：

```text
EML / Py⁺ 符號態程式碼
    ↓
Tokenizer + Parser
    ↓
Normalized EML AST
    ↓
Rule-based Transpiler
    ↓
Python 可執行程式碼
    ↓
Round-trip / Unit Tests
    ↓
EML Trace System / EML Workbench 可觀測展示
```

在此閉環中，EML 不是先追求「完整新語言」，而是先建立「符號態程式碼 ↔ 標準語言 ↔ 執行結果 ↔ 可視化狀態 ↔ AI Agent 協作」的通路。第一版應以 Py⁺ 為主，C⁺⁺⁺、Logic Crystallization、Temporal Loop、BUG Immunity 與 Dynamic Compiler 則作為後續階段逐步納入。

本白皮書的結論是：EML 的第一個可商業化與可開源形態，不應是終極語言本體，而應是 **AI-readable symbolic programming layer + human-adaptive projection editor + observable execution interface**。它的真正價值不只是壓縮程式碼，而是讓程式碼、語義、工具、Agent 與執行狀態之間形成可交換的共同結構。

---

## 0. 版本重寫說明：為何需要 2026 新版白皮書

### EML 自足邊界

本版只以 EML 自身的語義、語法、執行投影與工具元件定義系統。舊計畫中的外部理論名、
產品名與伴生專案名不再作為前置條件；相同職責改用 EML 原生名稱描述。宿主語言是可替換的
輸出目標，治理文件是獨立政策，兩者都不是理解 EML 語義的依賴。

EML 現有文件大致可分成三類：

1. **早期完整技術與商業整合文件**：提供語意附加、Py⁺、C⁺⁺⁺、商業化與技術手冊的初始集合。
2. **EML 1.5 技術白皮書**：強調語意附加、資訊密度、冷熱數據分離、邏輯結晶化、EML Symbol Palette、EML Workbench、EML module stratification 等核心概念。
3. **EML 1.5 Ultimate 文件**：將 EML 推進到時間感知、自動修復、動態演化、BUG 免疫、十二種迴圈與動態編譯器的範式層級。
4. **EML-PLAN-2026 工程計畫書**：把上述概念重新落成六個月工程路線，並指出 EML Trace System 已可作為視覺化基礎設施。

這些文件並非互相衝突，而是處於不同抽象層：

```text
理論層：語意附加、資訊密度、機器優先、人類適配
    ↓
範式層：冷熱分離、邏輯結晶化、十二種迴圈、時間迴圈、BUG 免疫
    ↓
工程層：Py⁺ 轉譯器、CLI、測試框架、EML Workbench、EML Symbol Palette、EML Trace System CTS
    ↓
產品層：MVP 開源工具鏈、Agent 協作開發環境、可視化語言工作台
```

新版白皮書的任務，是把這四層重新折疊成一份可交付的技術文件：既保留 EML 的範式野心，又明確回答「第一版到底做什麼」。

因此，本文件採取一個新的定位：

> EML 2026 的第一目標不是證明所有終極能力，而是建立一個可被人類使用、可被 AI Agent 理解、可被標準語言執行、可被 EML Trace System 觀測的最小語意閉環。

---

## 1. 核心定位：EML 不是替代語言，而是語意附加協議

### 1.1 名稱與定位修正

EML 的唯一正式名稱是 **Efficient New Language**（高效新語言）。早期曾使用
「Efficient Meta-Language」作為工作名稱；該名稱已廢止，不得被 AI 或文件當成現行全名。
EML 仍具有可覆蓋宿主語言的語意附加特性，但這是設計能力，不是另一個正式名稱。

- EML 可以覆蓋在 Python 上，形成 Py⁺。
- EML 可以覆蓋在 C++ 上，形成 C⁺⁺⁺。
- EML 可以覆蓋在數學、物理、AI、遊戲、資料科學等領域語法之上，形成領域符號集。
- EML 可以被編輯器投影成人類易讀形式，也可以被 Agent 直接解析成機器友好的語義結構。

因此，EML 不是「又一個需要重建整個生態的新語言」，而是：

```text
一套語意附加規則
+ 一套符號到語義的映射表
+ 一套轉譯器與驗證器
+ 一套人類/AI 雙態編輯器
+ 一套執行狀態可觀測接口
```

這個定位非常重要。若把 EML 當成完全獨立語言，第一版就必須處理套件、生態、標準庫、debugger、LSP、formatter、runtime、部署與學習曲線，成本過高。若把 EML 當成語言增益層，第一版只需把高價值語法壓縮與語義映射跑通，便能立即接上既有語言生態。

### 1.2 EML 的三句話定義

**給開發者的定義**：  
EML 是一套可以把高頻程式意圖壓縮為符號化表示，再轉譯回標準語言的語法增益層。

**給 AI Agent 的定義**：  
EML 是一套穩定的語義標記協議，讓 Agent 不只讀自然語言註解，而能讀到可結構化解析的操作意圖、資料流、依賴關係與執行策略。

**給產品的定義**：  
EML 是一個從符號編程、雙態編輯、AI 轉換、執行觀測到自動修復的漸進式工具鏈。

### 1.3 三個設計原則

#### 原則一：Optional Enhancement，可選增益

EML 不要求所有程式碼都符號化。符號化應優先出現在高收益區域：

- 數學計算
- 資料處理
- 矩陣與張量操作
- 迴圈與聚合操作
- 明確的函數呼叫與指派
- 可被 AI 或編譯器穩定識別的重複邏輯

對於複雜業務流程、臨時腳本、自然語言註解、人類需要保留完整脈絡的模組，EML 可以保持低介入。

#### 原則二：Machine-first, Human-adaptive，機器優先但人類適配

EML 的符號態首先服務機器解析、AI 學習、轉譯器處理與狀態觀測。但人類不應被迫直接承受所有符號密度。人類需要的是投影工具：

```text
符號態：Σ(i², i∈[1:N]) ⇒ r
展開態：r = sum(i**2 for i in range(1, N + 1))
說明態：計算 1 到 N 的平方和，並將結果指派給 r。
```

EML Workbench 的本質就是這種「雙態／三態投影」：同一段程式可以被機器看成壓縮符號，被人類看成可讀程式，被教學或審查場景看成自然語言解釋。

#### 原則三：Round-trip first，先驗證再擴張

EML 的可信度不來自概念宣稱，而來自 round-trip：

```text
EML → Python → execute/test → Python equivalent check → EML metadata preserved
```

任何符號一旦無法穩定轉譯、無法測試、無法回放，就不應進入 MVP 核心語法。這也是第一版必須限制在 14 個測試案例左右的原因：小而穩，勝過大而虛。

---

## 2. MVP 的邊界：第一版做什麼，不做什麼

### 2.1 MVP 的一句話目標

> 在本地環境中輸入一段 EML/Py⁺ 符號態程式碼，系統能將其解析為標準 AST，轉譯成可執行 Python，執行測試並在 EML Workbench/EML Trace System 介面中展示符號、展開碼、依賴與執行結果。

### 2.2 MVP 必做功能

#### 1. Py⁺ 最小語法集

第一版只支援可明確轉譯的語法：

| 類型 | EML/Py⁺ | Python |
|---|---|---|
| 賦值 | `x^+100` | `x = 100` |
| 輸出 | `x^0` | `print(x)` |
| 求和 | `Σ(i², i∈[1:N])` | `sum(i**2 for i in range(1, N+1))` |
| 矩陣轉置 | `m^T` | `np.transpose(m)` |
| 條件 | `x>40 ? A : B` | `A if x > 40 else B` |
| 指派 | `f(x) => y` | `y = f(x)` |
| 加法賦值 | `x^+10` | `x += 10` |
| 減法賦值 | `x^-5` | `x -= 5` |
| 乘法賦值 | `x^*2` | `x *= 2` |
| 區間 | `i∈[1:10]` | `range(1, 11)` |
| 累積求和 | `Σ(i, i∈[1:10])` | `sum(i for i in range(1, 11))` |
| 矩陣定義 | `<M>(data)` | `np.array(data)` |
| 函式呼叫 | `f^+(x,y) => r` | `r = f(x, y)` |
| 列表定義 | `list^+[1,2,3]` | `lst = [1, 2, 3]` |

第一版可以使用 ASCII 替代表達，避免 Unicode 輸入阻塞開發：

```text
x^+100       ≈ x⁺¹⁰⁰
x^0          ≈ x⁰
m^T          ≈ mᵀ
SUM(i^2, i in [1:N]) ≈ Σ(i², i∈[1:N])
```

#### 2. Tokenizer + Parser

MVP 不需要完整編譯器，但必須有明確解析流程：

```text
source.eml
  → tokens
  → parse tree
  → normalized EML AST
  → Python AST / Python source
```

若第一版直接用 regex 拼接，短期能 demo，但很快會失控。建議 MVP 至少建立簡化 AST：

```json
{
  "type": "SumExpression",
  "body": { "type": "Power", "base": "i", "exp": 2 },
  "iterator": "i",
  "range": { "start": 1, "end": "N", "inclusive": true }
}
```

AST 是 EML 後續接上 EML Trace System、AI Agent、CTS、依賴圖與邏輯結晶化的共同基礎。

#### 3. Rule-based Transpiler

第一版轉譯器應採規則型，而非直接依賴 LLM。原因很簡單：

- 規則型可測試。
- 規則型可重現。
- 規則型可做 round-trip。
- 規則型可作為未來 AI 轉譯器的監督標準。

LLM 應放在 Python→EML 壓縮建議與人類互動層，不應放在第一版 EML→Python 的核心正向轉譯鏈。

#### 4. CLI

最小命令：

```bash
eml parse examples/sum.eml
eml transpile examples/sum.eml --target python
eml run examples/sum.eml
eml test
eml explain examples/sum.eml
```

CLI 是 MVP 的工程脊椎。即使 EML Workbench 還不完整，CLI 也能讓 Agent、自動測試、CI/CD 與文件範例先跑起來。

#### 5. Test Suite

第一版測試要覆蓋三層：

```text
語法測試：EML source 是否能 parse
轉譯測試：EML AST 是否能生成預期 Python
執行測試：生成 Python 是否產生預期輸出
```

每個測試案例應保存四個檔案：

```text
case_001_assign.eml
case_001_assign.expected.py
case_001_assign.expected.json   # AST 或 metadata
case_001_assign.test.json       # input/output fixture
```

#### 6. EML Workbench 最小雙態視圖

MVP 不需要完整 IDE，只需要一個最小雙態視圖：

```text
左側：EML/Py⁺ 符號態
右側：Python 展開態
下方：AST / 說明 / 測試結果
```

這個介面是 EML 的展示核心。EML 的說服力不只在語法，而在「一鍵切換後人類立刻看懂」。

#### 7. EML Trace System CTS 對接

EML MVP 應能輸出最小 CTS：

```json
{
  "symbolTable": {
    "Σ": { "meaning": "sum", "target": "python.sum" },
    "^0": { "meaning": "print", "target": "python.print" }
  },
  "commentTable": {
    "node_001": "計算平方和"
  },
  "crossRefTable": {
    "r": ["Σ(i², i∈[1:N])"]
  }
}
```

這讓 EML Trace System 不只是展示執行結果，而能展示語義對應、符號依賴與執行 trace。

### 2.3 MVP 暫不做功能

為了避免第一版失控，以下功能應明確排除：

- 不做完整獨立語言 runtime。
- 不做完整 C⁺⁺⁺。
- 不做 AI 模型訓練版 Logic Crystallization。
- 不做全自動 BUG 修復。
- 不做完整十二種迴圈 runtime。
- 不做複雜型別系統。
- 不做大規模套件管理器。
- 不承諾所有 Python 語法都可 Python→EML 反向壓縮。

這些功能不是不要，而是後移。MVP 的勝利條件是「第一條閉環可跑」，不是「第一次就做完 EML Ultimate」。

---

## 3. EML 自足系統架構

### 3.1 分層架構

EML 2026 的工程分層如下：

```text
┌──────────────────────────────────────────────┐
│ Human / Agent Interaction Layer               │
│ EML Workbench, EML Symbol Palette, AI Convert Assistant  │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ EML Language Layer                            │
│ symbols, overlays, grammar, AST, metadata     │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ Transpilation Layer                           │
│ EML/Py⁺ → Python, future C⁺⁺⁺ → C++           │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ Execution Layer                               │
│ Python runtime, future native runtime         │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ Observability Layer                           │
│ EML runtime trace, CTS, state snapshot           │
└───────────────────────┬──────────────────────┘
                        ↓
┌──────────────────────────────────────────────┐
│ Agent Collaboration Layer                     │
│ explain, refactor, compress, verify, repair   │
└──────────────────────────────────────────────┘
```

這套分層讓 EML 不必一次完成所有能力。只要每層有最小接口，就能逐步擴張。

### 3.2 EML Trace System 的角色

EML Trace System 是 EML 內建的「執行真相層」，不是外部專案依賴。EML 語言層負責表達
語義；EML Trace System 負責記錄實際發生過什麼。

對應關係：

| EML Trace System 元件 | EML 角色 |
|---|---|
| `symbolTable` | EML 符號到語義的映射 |
| `commentTable` | EML AST 節點的人類說明 |
| `crossRefTable` | 變數、函數、符號之間的依賴圖 |
| P0 UI | EML Workbench 的視覺基底 |
| P5 VMSnapshot | Runtime 狀態與執行 trace |
| P5 AI Agent Interface | Agent 讀取狀態、建議壓縮與修復的接口 |

EML 的可觀測核心閉環：

```text
符號態程式碼
  → 轉譯成標準語言
  → 執行
  → 產生 trace
  → EML Trace System 視覺化
  → Agent 讀取 trace
  → 建議語義壓縮 / 修復 / 重構
  → 回寫 EML
```

這使 EML 的定位從「更短的語法」升級為「AI 可讀、可執行、可回放的程式語義界面」。

### 3.3 EML Workbench 的角色

EML Workbench 是 EML 的人類適配層。沒有 EML Workbench，EML 很容易被誤解成「符號太多、難以輸入、難以閱讀」。有了 EML Workbench，EML 變成可切換視角的投影系統。

最小功能：

```text
EML View：符號態
Python View：展開態
Explain View：自然語言說明
AST View：結構化節點
Trace View：EML Trace System 執行狀態
```

使用者不必永遠看符號。使用者可以在需要壓縮時看符號，在需要審查時看 Python，在需要教學或交接時看 explain，在需要 debug 時看 trace。

### 3.4 EML Symbol Palette 的角色

EML Symbol Palette 不是第一版的核心阻塞項。MVP 可以先用 ASCII 替代符號輸入。但 EML Symbol Palette 會決定 EML 的長期使用體驗。

第一版 EML Symbol Palette 可做成瀏覽器／編輯器浮動符號盤：

```text
Ctrl + Space → 符號面板
輸入 sum → Σ(...)
輸入 transpose → ^T / ᵀ
輸入 out → ^0 / ⁰
輸入 inrange → i∈[1:N]
```

EML Symbol Palette 的核心不是炫技，而是降低符號輸入摩擦。

---

## 4. 語言核心：語意附加與符號態 AST

### 4.1 語意附加的本質

語意附加不是單純把 `print(x)` 寫成 `x⁰`。真正的重點是將操作意圖貼近資料本身：

```text
x⁰
```

這不是「少打幾個字」而已，而是將 `x` 的當下操作狀態標記為 output。對人類而言，它是簡寫；對機器而言，它是結構化 metadata；對 Agent 而言，它是可解讀的意圖節點。

傳統語言常把資料、操作與控制流分散在線性文本中。EML 嘗試把它們重新局部綁定：

```text
資料節點 + 附加操作 + 指派/流向
```

因此 EML 的基本語義單元不是字符，而是：

```text
SemanticUnit = BaseToken + OverlayOperator + FlowRelation + ContextMetadata
```

### 4.2 EML AST 節點設計

最小 AST 類型：

```ts
type EMLNode =
  | AssignmentNode
  | OutputNode
  | SumNode
  | RangeNode
  | MatrixNode
  | TransposeNode
  | ConditionalNode
  | FunctionCallNode
  | AugmentedAssignNode
  | ListNode
```

範例：

```eml
Σ(i², i∈[1:N]) => r
r^0
```

對應 AST：

```json
{
  "type": "Program",
  "body": [
    {
      "type": "Assignment",
      "target": "r",
      "value": {
        "type": "Sum",
        "expr": { "type": "Power", "base": "i", "exp": 2 },
        "iterator": "i",
        "range": { "type": "Range", "start": 1, "end": "N", "inclusiveEnd": true }
      }
    },
    {
      "type": "Output",
      "value": "r"
    }
  ]
}
```

對應 Python：

```python
r = sum(i**2 for i in range(1, N + 1))
print(r)
```

### 4.3 符號表格式

MVP 應建立 `eml-symbols.json`：

```json
{
  "^0": {
    "name": "output",
    "category": "control",
    "python": "print({value})",
    "description": "輸出或顯示指定值"
  },
  "Σ": {
    "name": "summation",
    "category": "algebraic",
    "python": "sum({expr} for {iter} in {range})",
    "description": "對指定範圍執行求和"
  },
  "∈": {
    "name": "in_range",
    "category": "range",
    "python": "range({start}, {end_plus_one})",
    "description": "表示迭代變數屬於某個閉區間"
  }
}
```

符號表是 EML 的核心資產。未來社群可以提交領域符號庫，但 MVP 先維持小集合。

### 4.4 符號衝突與命名空間

EML 必須避免不同領域對同一符號的含義衝突。建議採命名空間：

```text
core.Σ        # 基礎求和
math.∂        # 偏微分
linear.ᵀ      # 矩陣轉置
ai.∇          # 梯度
game.actor⁺   # 遊戲 Actor 操作
```

在使用者視圖中可以顯示短符號；在 AST/CTS 中必須保存完整 namespace。

---

## 5. Py⁺：第一個落地目標

### 5.1 為何先做 Py⁺

Python 是最適合 EML MVP 的宿主語言，理由不是它最快，而是它最容易完成閉環：

- 語法簡潔，與 EML 壓縮目標衝突較少。
- `ast`、`tokenize`、`pytest` 等工具成熟。
- 科學計算、AI、資料處理場景天然需要數學符號。
- 轉譯後可立即執行，不需編譯器後端。
- Agent 較容易理解 Python 展開態。

C⁺⁺⁺ 更有產業衝擊力，但第一版直接做 C⁺⁺⁺ 會被 Clang、LLVM、UE5、template、memory model、build system 拖慢。Py⁺ 是正確第一步。

### 5.2 Py⁺ 的語法策略

Py⁺ 不應改寫整個 Python，而應允許嵌入式符號增益：

```python
N = 100
result = Σ(i², i∈[1:N])
result⁰
```

或 ASCII 版本：

```python
N = 100
result = SUM(i^2, i in [1:N])
OUT(result)
```

第一版可以同時支援兩種形式：

- **Unicode Form**：更接近 EML 願景，適合展示與高密度寫法。
- **ASCII Form**：更容易輸入、測試與跨平台。

轉譯器內部統一成同一 AST。

### 5.3 Py⁺ 的最小範例

EML/Py⁺：

```eml
N^+100
Σ(i², i∈[1:N]) => r
r^0
```

Python：

```python
N = 100
r = sum(i**2 for i in range(1, N + 1))
print(r)
```

執行輸出：

```text
338350
```

這個範例雖小，但它打通了 EML 的核心：賦值、範圍、迭代、平方、聚合、指派、輸出。

### 5.4 Python→EML 反向轉換

Python→EML 不應作為 MVP 的核心可靠鏈路，而應作為 AI assisted compression：

```text
標準 Python
  → AI 建議可壓縮片段
  → 人類確認
  → 生成 EML/Py⁺
  → round-trip validator 檢查
```

這避免 LLM 任意改寫程式語義。反向轉換不應直接覆寫原始碼，而應產生 diff 或建議。

---

## 6. AI Agent 協作：EML 作為 Agent 可讀語言

### 6.1 為何 EML 對 Agent 有意義

AI Agent 讀傳統程式碼時，常需要從冗長語法中推回意圖。EML 的符號態若設計正確，能把意圖前置：

```text
Σ → 聚合
∈ → 迭代範圍
^0 → 輸出
=> → 資料流向
@cold → 可結晶化純邏輯
@hot → 動態狀態
@temporal_loop → 時間等待語義
```

這些標記能讓 Agent 更快理解：

- 哪段是數學計算。
- 哪段是 I/O。
- 哪段可快取。
- 哪段需要觀測。
- 哪段適合壓縮。
- 哪段涉及時間等待或人類確認。

### 6.2 Agent 可用的 EML metadata

每個 EML AST 節點可以提供：

```json
{
  "nodeId": "node_sum_001",
  "semanticType": "aggregation.sum",
  "source": "Σ(i², i∈[1:N])",
  "targetLanguage": "python",
  "equivalentCode": "sum(i**2 for i in range(1, N + 1))",
  "dependencies": ["i", "N"],
  "risk": "low",
  "testRequired": true
}
```

Agent 不必猜測這段 code 在做什麼，可以直接基於 metadata 生成解釋、測試、重構建議或錯誤檢查。

### 6.3 Agent 操作邊界

MVP 應保留人類審查權：

- Agent 可以建議 EML 壓縮，但不能未經確認覆寫核心檔案。
- Agent 可以生成測試，但測試結果必須保存。
- Agent 可以指出符號歧義，但符號表修改需由人類接受。
- Agent 可以做 Python→EML 建議，但必須通過 round-trip validator。

這點與 EML Validation/EML Trace System 的精神一致：Agent 可以執行，但執行要有 trace；Agent 可以修改，但修改要能 diff review；Agent 可以推理，但推理要能回到證據。

---

## 7. 冷熱分離與邏輯結晶化：MVP 後的第一個強化方向

### 7.1 冷邏輯與熱狀態

EML 1.5 的關鍵概念之一，是將程式拆成冷邏輯與熱狀態：

```text
Cold Logic：純函數、固定算法、數學公式、靜態配置
Hot State：I/O、使用者互動、事件、全域狀態、外部 API
```

這個概念非常適合 EML，因為語意附加可以把冷熱標記直接附著於節點：

```python
@cold
def square_sum(N):
    return Σ(i², i∈[1:N])

@hot
def read_user_input():
    return input()
```

### 7.2 MVP 中如何保留接口

MVP 不必真的完成 AI 驅動結晶化，但應保留標記：

```text
@cold：表示可快取、可預編譯、可作純函數檢查
@hot：表示不可任意快取，需保留動態狀態與副作用
```

第一版可做簡單靜態檢查：

- `@cold` 函數內若出現 `open`, `input`, `requests`, `global`, DB 寫入，給警告。
- `@cold` 函數輸入相同時，輸出可快取。
- `@hot` 節點進入 EML Trace System trace。

### 7.3 規則型結晶化

完整 Logic Crystallization 的 AI 模型訓練成本高，不適合作為 MVP 阻塞項。第一版可做規則型結晶化：

```text
純函數 AST hash
  → 檢查是否已編譯/快取
  → 若已存在，直接使用 cached result / cached bytecode
  → 若不存在，正常轉譯並保存 metadata
```

這雖然不是終極版本，但已能展示「冷邏輯不必反覆理解」的概念。

---

## 8. 時間迴圈、BUG 免疫與 Dynamic Compiler：後續路線的工程降階

### 8.1 Ultimate 概念不應消失，但要降階落地

EML Ultimate 提出的時間迴圈、BUG 免疫、十二種迴圈、動態編譯器等概念，是 EML 的長期差異化來源。但 MVP 不應直接宣稱全部實現。正確方法是降階：

```text
Ultimate 概念 → MVP 中的 metadata / stub / interface / demo case
```

### 8.2 時間迴圈的 MVP 降階

Ultimate 版時間迴圈的完整目標，是讓程式能暫停、等待條件成熟、保存狀態並恢復執行。MVP 可先做成 `asyncio` wrapper：

```python
@temporal_loop(max_wait=3600, check_interval=60)
async def wait_for_confirmation():
    await temporal_wait(user_confirmed)
    return deploy()
```

MVP 不必做複雜狀態機，只需展示：

- 不 busy wait。
- 有 max_wait。
- 有 check_interval。
- 有 timeout_action。
- 有 EML Trace System trace。

### 8.3 BUG 免疫的 MVP 降階

完整 BUG 免疫系統包含五級分類、自動修復、形式化驗證。MVP 可先做分類與記錄：

```text
CRITICAL：停止執行，要求人工介入
MAJOR：標記失敗，提供修復建議
MINOR：記錄並繼續
TRIVIAL：只記錄
COSMETIC：忽略或提示
```

第一版不應自動改 code，只應提供：

- 錯誤分類。
- 受影響節點。
- EML source 對應位置。
- Python 展開碼對應位置。
- 建議測試或修復方向。

自動修復可以作為 Phase 3/4 的功能。

### 8.4 十二種迴圈的 MVP 降階

第一版不需要完整迴圈分類 runtime，但可以在 AST metadata 中保留 `loopKind`：

```json
{
  "type": "Loop",
  "loopKind": "algebraic_sum",
  "source": "Σ(i², i∈[1:N])",
  "deterministic": true,
  "terminating": true
}
```

未來再擴展到：

- 基本重複迴圈
- 條件迴圈
- 代數迴圈
- 事件迴圈
- 收斂迴圈
- 遞歸迴圈
- 分形迴圈
- 量子迴圈
- 混沌迴圈
- 螺旋迴圈
- 演化迴圈
- 時間迴圈

### 8.5 Dynamic Compiler 的 MVP 降階

完整 Dynamic Compiler 包含 FDCS 深度軸、MSSP 分類與動態探針注入。MVP 可做三個簡化分數：

```text
callFrequency：調用頻率
riskLevel：錯誤影響
dependencyDepth：依賴深度
```

合成：

```text
Importance = w1 * callFrequency + w2 * riskLevel + w3 * dependencyDepth
```

這足以決定：

- 是否加入 trace。
- 是否要求測試。
- 是否允許 Agent 自動重構。
- 是否需要人工確認。

---

## 9. 開發路線：六個月版本切分

### Phase 0：核心語法與 Py⁺ 轉譯器

目標：完成最小語法規範、符號表、AST、轉譯器、CLI、14 個測試案例。

交付物：

```text
eml-grammar.md
eml-symbols.json
packages/parser/
packages/transpiler-python/
packages/cli/
examples/phase0/
tests/phase0/
```

完成標準：

```text
eml test 全部通過
eml run examples/sum.eml 正常輸出
eml transpile 生成可讀 Python
每個符號都有符號表定義
每個案例都有 AST snapshot
```

### Phase 1：EML Workbench 與 AI 雙向轉換

目標：建立人類可見展示層與 Python→EML 建議系統。

交付物：

```text
EML Workbench minimal UI
EML View / Python View / AST View
eml-ai-converter prototype
round-trip validator
EML Symbol Palette prototype
```

完成標準：

```text
使用者可在左側寫 EML，右側看到 Python
AI 可對 Python 片段提出 EML 壓縮建議
所有建議必須經 validator
```

### Phase 2：冷熱分離與規則型結晶化

目標：加入 `@cold` / `@hot`、靜態副作用檢查、AST 快取與簡化深度軸。

交付物：

```text
cold-hot annotations
pure function checker
AST cache
basic crystallization engine
importance analyzer
```

完成標準：

```text
@cold 函數可被快取
@cold 內副作用可被警告
importance score 可輸出到 CTS
```

### Phase 3：時間迴圈與 BUG 分類

目標：完成 `@temporal_loop` 最小 runtime、DelayedDecisionQueue、BUG 五級分類記錄。

交付物：

```text
temporal-loop-runtime
DelayedDecisionQueue
bug-classifier-v1
EML Trace System trace integration
```

完成標準：

```text
時間迴圈不 busy wait
超時可處理
錯誤可分類並映射回 EML source
```

### Phase 4：C⁺⁺⁺ 原型與迴圈分類器

目標：開始 C⁺⁺⁺ 概念驗證與迴圈分類 metadata。

交付物：

```text
c-plus-plus-plus prototype
loop classifier metadata
Clang/LibTooling feasibility notes
UE5-oriented demo snippets
```

完成標準：

```text
至少 3 個 C⁺⁺⁺ demo 可轉為 C++
至少 3 種 loopKind 可被 AST 標記
```

### Phase 5：統一入口與開源發布

目標：形成 EML 統一入口、文件、範例與 GitHub 發布。

交付物：

```text
EML.exe / eml desktop launcher
EML Workbench + EML Symbol Palette + EML Trace System minimal integration
EML-LANG-2026-v1.0.md
README.md
LICENSE
SECURITY.md
examples/
docs/
```

完成標準：

```text
新使用者可按 README 跑通 demo
Agent 可按 docs 接手 repo
所有示範都有測試與截圖/trace
```

---

## 10. Repo 結構建議

建議初版 repo：

```text
eml/
├─ README.md
├─ LICENSE
├─ SECURITY.md
├─ package.json
├─ pnpm-workspace.yaml
├─ docs/
│  ├─ EML-LANG-2026-MVP-Whitepaper-v0.1.md
│  ├─ eml-grammar.md
│  ├─ eml-symbols.md
│  ├─ architecture.md
│  ├─ roadmap.md
│  └─ agent-handoff.md
├─ packages/
│  ├─ parser/
│  ├─ transpiler-python/
│  ├─ cli/
│  ├─ cts-generator/
│  ├─ cogni-editor/
│  └─ nova-ime/
├─ examples/
│  ├─ phase0-basic/
│  ├─ phase1-editor/
│  └─ phase2-cold-hot/
├─ tests/
│  ├─ parser/
│  ├─ transpiler-python/
│  ├─ fixtures/
│  └─ snapshots/
└─ phosphor/
   ├─ adapters/
   └─ traces/
```

### 10.1 Agent handoff 文件

必須加入 `docs/agent-handoff.md`，讓未來 Agent 接手時知道：

```text
1. 不要先做 Ultimate。
2. 先跑 phase0 測試。
3. 不要破壞 eml-symbols.json 的穩定格式。
4. 任何 Python→EML 建議都必須 round-trip。
5. 任何修改都要附測試。
6. EML Trace System trace 是執行真相層，不是裝飾 UI。
```

這會大幅降低 Vibe Coding / Agent 開發中的上下文漂移。

---

## 11. 評估指標

### 11.1 語言壓縮指標

MVP 可先測：

```text
line_reduction = 1 - eml_lines / python_lines
char_reduction = 1 - eml_chars / python_chars
semantic_density = semantic_operations / chars
```

但白皮書應避免過度承諾。壓縮率會因程式類型而變化：數學密集型最高，業務流程最低。

### 11.2 可轉譯性指標

```text
parse_success_rate
transpile_success_rate
round_trip_equivalence_rate
unit_test_pass_rate
```

MVP 的核心 KPI 應是可轉譯性，不是符號數量。

### 11.3 Agent 可讀性指標

```text
agent_explanation_accuracy
agent_refactor_acceptance_rate
metadata_coverage
trace_to_source_mapping_success_rate
```

這些指標比「看起來很酷」更重要。EML 面向未來的關鍵，是 Agent 能否穩定讀懂並操作它。

### 11.4 人類可用性指標

```text
time_to_understand_symbolic_code
time_to_switch_to_expanded_code
manual_correction_rate
symbol_input_latency
```

EML 不能只對 AI 友好。若人類在工具層完全痛苦，語言不會被使用。因此 EML Workbench 與 EML Symbol Palette 是產品化必要條件。

---

## 12. 風險與對策

| 風險 | 說明 | 對策 |
|---|---|---|
| 符號歧義 | 同一符號在不同領域含義不同 | namespace + symbol table |
| 輸入困難 | Unicode 符號難打 | ASCII fallback + EML Symbol Palette |
| 過度宏大 | Ultimate 功能壓垮 MVP | phase gate + not-do list |
| LLM 不穩定 | Python→EML 可能改壞語義 | round-trip validator + human review |
| 缺少生態 | 新語言難推廣 | 先做 Py⁺ 增益層，不重建生態 |
| 性能宣稱未驗證 | 壓縮率不等於執行更快 | 明確區分理論壓縮與實測性能 |
| Agent 亂改 | 自動化導致破壞 | EML Trace System trace + diff review + policy |
| C⁺⁺⁺ 難度高 | Clang/UE5 整合成本大 | Phase 4 才開始，不阻塞 Py⁺ |

---

## 13. 商業與開源定位

### 13.1 第一個可展示產品

EML 的第一個產品不應是「新語言官網」而應是：

```text
一個可以打開、輸入 EML、看到 Python 展開、執行、trace、AI 解釋的本地工作台。
```

這會比單純發表語言規格更有說服力。

### 13.2 目標使用者

初期目標不是所有工程師，而是高密度語意場景使用者：

- AI Agent 開發者
- 資料科學 / 科學計算使用者
- 數學模型與演算法教學者
- Vibe Coding / AI 協作開發使用者
- 需要讀懂大型程式結構的研究者
- 對符號編程與程式壓縮有興趣的開源社群

### 13.3 開源策略

建議開源核心：

```text
parser
transpiler-python
symbol table
CLI
test cases
basic EML Workbench
```

保留可商業化模組：

```text
進階 EML Workbench
大型符號庫管理
團隊版 Agent workflow
EML Trace System deep integration
企業級 audit / policy / trace
AI-assisted compression service
```

### 13.4 專利與授權聲明

若涉及台灣專利保護，README 應清楚寫明：

```text
核心開源授權範圍
專利聲明範圍
商業使用條款
貢獻者授權協議
```

此處必須透明，否則開源社群會對採用成本產生疑慮。

---

## 14. EML 的自足邊界與可選整合

EML 必須先能獨立成立，再與任何工具、Agent 或平台整合。其必要結構只有：

```text
EML 語法與符號
    ↓
EML AST 與語意分析
    ↓
標準語言投影與執行
    ↓
EML trace、診斷與驗證
```

外部系統可選擇接入四種公開介面：

```text
編輯器介面：顯示符號、展開碼、AST 與診斷
Agent 介面：parse / transpile / interpret / trace / roundtrip
觀測介面：JSONL 執行事件
治理介面：授權、來源與使用政策
```

這些整合都不是 EML 的本體依賴。即使全部外部介面被移除，只要語法、AST、確定性轉譯、
驗證與錯誤報告仍存在，EML 就仍是完整可理解的語言層。

---

## 15. 結論：EML 的第一性工程命題

EML 的第一性命題可以表述為：

> 程式語言不只應服務人類書寫，也應服務 AI Agent 理解；不只應能執行，也應能把語義、狀態、依賴與修復策略暴露為可觀測結構。

在這個命題下，語意附加不是表面符號，而是程式語義的壓縮接口；EML trace 是執行真相層；
EML Studio 是人類與機器在不同視角間切換的投影介面；EML 符號面板降低高密度語意輸入的
摩擦；Logic Crystallization、Temporal Loop 與 BUG Immunity 則是 EML 長期走向自適應程式
語言的進化路線。介面可以替換，EML 語義本身不可依賴介面才能成立。

但第一版必須克制。真正可落地的路線不是一次完成終極語言，而是先完成：

```text
14 個語法案例
+ Py⁺ 轉譯器
+ CLI
+ 測試框架
+ 雙態視圖
+ CTS 輸出
+ EML Trace System trace
+ Agent 可讀 metadata
```

這個 MVP 一旦跑通，EML 就不再只是概念，而會變成一條可持續擴張的語言工程路徑。

最終形態可以很大，但起點必須很硬：

```text
寫得出來。
轉得過去。
跑得起來。
測得通過。
看得懂。
追得回來。
Agent 接得住。
```

這就是 EML 2026 的開發起點。

---

## Appendix A：Phase 0 測試案例清單

```text
01_assign:        x^+100           → x = 100
02_output:        x^0              → print(x)
03_sum_square:    Σ(i²,i∈[1:N])    → sum(i**2 for i in range(1,N+1))
04_transpose:     m^T              → np.transpose(m)
05_condition:     x>40 ? A : B     → A if x > 40 else B
06_bind:          f(x) => y        → y = f(x)
07_add_assign:    x^+10            → x += 10
08_sub_assign:    x^-5             → x -= 5
09_mul_assign:    x^*2             → x *= 2
10_range:         i∈[1:10]         → range(1, 11)
11_sum_range:     Σ(i,i∈[1:10])    → sum(i for i in range(1,11))
12_matrix:        <M>(data)        → np.array(data)
13_call:          f^+(x,y)=>r      → r = f(x, y)
14_list:          list^+[1,2,3]    → lst = [1,2,3]
```

---

## Appendix B：最小 CLI 規格

```bash
# 解析 EML 並輸出 AST
eml parse examples/sum.eml --json

# 轉譯成 Python
eml transpile examples/sum.eml --target python --out build/sum.py

# 直接執行
eml run examples/sum.eml

# 解釋符號含義
eml explain examples/sum.eml

# 跑測試
eml test

# 生成 EML Trace System-compatible CTS
eml cts examples/sum.eml --out build/sum.cts.json
```

---

## Appendix C：最小 CTS 範例

```json
{
  "file": "examples/sum.eml",
  "symbols": {
    "Σ": {
      "type": "aggregation",
      "meaning": "summation",
      "target": "python.sum"
    },
    "∈": {
      "type": "range_relation",
      "meaning": "iterator belongs to range"
    },
    "^0": {
      "type": "output",
      "meaning": "print/display"
    }
  },
  "nodes": [
    {
      "id": "node_001",
      "source": "Σ(i², i∈[1:N]) => r",
      "python": "r = sum(i**2 for i in range(1, N + 1))",
      "dependencies": ["i", "N"],
      "semanticType": "algebraic.sum"
    },
    {
      "id": "node_002",
      "source": "r^0",
      "python": "print(r)",
      "dependencies": ["r"],
      "semanticType": "control.output"
    }
  ]
}
```

---

## Appendix D：Agent 接手提示

```text
你正在接手 EML MVP。
請不要先實作 Ultimate 功能。
請先跑通 Phase 0 的 14 個案例。
任何新符號都必須加入 eml-symbols.json。
任何轉譯規則都必須有 AST snapshot 與 Python expected output。
Python→EML 只能作為建議，不得直接覆寫。
EML Trace System CTS 是必要輸出，不是額外功能。
EML Workbench 的第一目標是雙態視圖，不是完整 IDE。
```

---

## References / 前置文件

1. Neo.K.《高效新語言完整技術與商業整合文件》.
2. Neo.K.《高效新語言（EML）1.5：語意附加驅動的程式設計範式革新》, 2025.
3. Neo.K.《EML 1.5 終極版：時間感知的自適應程式語言範式》, 2026.
4. Neo.K.《EML 工程計畫書：高效新語言（Efficient New Language）漸進實現路線》, EML-PLAN-2026-v0.1, 2026-06-11.
5. EveMissLab EML project notes, EML-EAI-2026 series.

---

*End of EML-LANG-2026-MVP-Whitepaper-v0.1.*
