---
title: "EML 2026：通用語意附加協議與多宿主投影架構"
subtitle: "從右上角語意附加、語意中介表示到跨語言／跨物件執行的總體重寫"
document_id: "EML-UNIVERSAL-SEMANTIC-OVERLAY-2026-v2.0"
version: "v2.0"
date: "2026-07-23"
author: "Neo.K（許筌崴）"
organization: "EveMissLab／一言諾科技有限公司"
status: "architecture reset / normative direction / agent-ready"
language: "zh-TW"
keywords:
  - EML
  - Efficient New Language
  - Efficient Meta-Language
  - Universal Semantic Overlay
  - Semantic IR
  - Right-Upper Attachment
  - Multi-Host Adapter
  - AI-Native Programming
  - Human-Adaptive Projection
  - Semantic Compression
---

# EML 2026：通用語意附加協議與多宿主投影架構

## 從右上角語意附加、語意中介表示到跨語言／跨物件執行的總體重寫

**作者：** Neo.K（許筌崴）  
**機構：** EveMissLab／一言諾科技有限公司  
**版本：** EML-UNIVERSAL-SEMANTIC-OVERLAY-2026-v2.0  
**日期：** 2026-07-23  
**文件狀態：** 架構重置版／後續工程主規格方向／可交付本地 Agent

---

## 摘要

EML 的原始核心從來不是「把 Python 寫得更短」，也不是「在編輯器右上角放一個符號選單」。EML 的原始問題是：線性字串、單一語法樹與固定宿主語言，是否足以承載人類、AI、編譯器、工作流與跨領域知識共同需要的高密度語意？

EML 的答案是**語意附加**。

語意附加允許一個既有符號、文字、程式節點、資料欄位、工作流節點或自然語言片段，在不破壞其原始載體的前提下，附著額外的操作、約束、關係、權限、時間、風險、觀測、執行與領域語意。早期文件以「右上角」作為最直觀的視覺入口，但右上角只是人類可見投影位置，不是 EML 的本體邊界。

2026 年工程 MVP 成功完成了 EML／Py⁺ 到 Python 的確定性轉譯、反向轉譯、AST、語意分析、測試、執行 trace、C++ 原型、LSP、MCP 與瀏覽器工作台。然而，工程實作逐漸把 EML 的通用語意附加縮窄為：

```text
EML 符號程式
    ↔
Python 子集
```

同時，工作台右上角入口實際上只是一個綁定單一文字輸入框的靜態符號面板。這個 MVP 並非錯誤；它是成功的第一個宿主適配器。但若讓它反過來定義 EML 本體，EML 就會從「通用語意附加協議」退化為「帶特殊符號的 Python 方言」。

本文件重新確立 EML 的總體架構：

```text
任意宿主物件
    +
可定位語意附加
    ↓
宿主中立語意圖／語意 IR
    ↓
確定性解析、驗證與政策閘門
    ↓
多宿主投影與多目標適配器
    ↓
執行、觀測、回放、轉譯與 AI 協作
```

新版 EML 不否定現有程式碼，而是重新安排其地位：

- 現行 EML 語法是 **EML Canonical Text Profile**；
- Python 轉譯器是 **Python Host Adapter**；
- C++ 轉譯器是 **C++ Host Adapter Prototype**；
- `eml-symbols.json` 應升級為宿主中立的 **Semantic Registry**；
- Workbench 的符號盤是 **Symbol Palette**，不是完整 Semantic Overlay；
- 右上角語意附加應成為選取內容、文件、專案、資料與工作流皆可使用的全域能力；
- 冷熱分離、時間迴圈、BUG 分級、自動修復與邏輯結晶化，應作為附加語意家族，而不是綁死在單一語言表面語法中。

EML 的正式核心因此被重寫為：

> **EML 是一套可將結構化語意附著於任意宿主物件，轉換為宿主中立語意表示，再透過可驗證適配器投影、轉譯、執行與觀測的通用協議。**

---

# 0. 本次重寫的來源範圍

本文件不是從單一 MVP 文件外推，而是重新彙整 EML 歷史理論、工程規格、現行程式碼與產品案例。

## 0.1 歷史核心文件

1. 《高效新語言完整技術與商業整合文件》
2. 《高效新語言（EML）1.5：語意附加驅動的程式設計範式革新》
3. 《EML 1.5 終極版：時間感知的自適應程式語言範式》
4. 《EML 工程計畫書：高效新語言漸進實現路線》
5. 《EML 2026：面向 AI Agent 的高密度語意附加程式語言》
6. 《EML 1.5 AI 語義規格：自足重寫版》
7. `eml-grammar.md`
8. `eml-transpiler-spec.md`
9. `eml-mvp-roadmap.md`
10. `EML Token 效率初步測試紀錄與正式測試計畫`
11. `EML Minimal Intent Challenge`
12. EML 普通話發音矯正系統中的多位置 overlay 實作規劃

## 0.2 現行工程來源

1. `README.md`
2. `docs/EML-LANG-2026-v1.0.md`
3. `docs/EML-AI-SEMANTIC-SPEC-v1.5.md`
4. `docs/PROGRESS.md`
5. `eml-symbols.json`
6. `packages/workbench/src/main.ts`
7. `packages/workbench/src/symbol-palette.ts`
8. `packages/transpiler-python`
9. `packages/transpiler-eml`
10. `packages/transpiler-cpp`
11. `packages/interp`
12. `packages/trace`
13. `packages/lsp`
14. `packages/mcp`
15. 網站 `/app`、`/ai/` 與 `/ai/tools/*`

## 0.3 來源之間的權威關係

本文件採用以下原則：

```text
歷史文件
    定義原始問題、語意附加本體與長期邊界

現行規格與測試
    定義目前真正可執行的 EML Canonical Text Profile

現行程式碼
    定義目前工程事實

本文件
    定義下一階段總體架構與遷移方向
```

歷史理論不能假裝已經實作；現行實作也不能反過來刪除歷史理論已明確定義的通用性。

---

# 1. 問題診斷：EML 在工程化中被縮成了什麼

## 1.1 現行 MVP 的成功

現行 EML 已完成一條非常重要的硬閉環：

```text
EML／Py⁺
    → normalize
    → lex
    → parse
    → AST
    → semantic analysis
    → Python emitter
    → execute／interpret
    → tests／trace／round-trip
```

這條閉環證明了幾件事：

- EML 符號不是純展示語法；
- EML 可以確定性解析；
- EML 可以產生穩定 AST；
- EML 可以與標準語言往返；
- EML 可以執行並產生可驗證 trace；
- AI 可以透過 MCP／REST 工具讀寫 EML；
- C++ 後端可以重用同一解析與語意鏈。

這些成果全部保留。

## 1.2 縮窄發生的位置

縮窄不是發生在 parser 是否正確，而是發生在**產品與架構的命名層**。

### 縮窄一：把參考宿主誤當成本體

原本應該是：

```text
EML Semantic Core
    ├── Python Adapter
    ├── C++ Adapter
    ├── JavaScript Adapter
    ├── Rust Adapter
    ├── SQL Adapter
    ├── Workflow Adapter
    └── Natural-Language Adapter
```

目前主要產品介面卻表現為：

```text
EML
    ↔
Python
```

Python 作為第一個參考實作是合理的；Python 成為 EML 的本體邊界則不合理。

### 縮窄二：把 Semantic Overlay 誤當成 Symbol Palette

現行工作台右上角的功能：

- 綁定單一 `textarea`；
- 搜尋固定的符號與片段；
- 將字串插入游標位置；
- 重新觸發 EML→Python render。

這是有用的符號輸入工具，但它不具備：

- 選取任意宿主物件；
- 建立語意節點；
- 保存 anchor；
- 指定作用域；
- 設定政策與權限；
- 建立跨語言 emitter；
- 將 overlay 保存為獨立資料；
- 在非 EML 文件中附加語意；
- 在專案、資料庫、工作流與自然語言上工作。

所以它的正確名稱應是：

> **EML Symbol Palette／EML 符號面板**

而不是完整的：

> **Universal Semantic Overlay／通用語意附加**

### 縮窄三：符號表直接保存 Python 模板

目前的註冊形式類似：

```json
{
  "Σ": {
    "name": "summation",
    "category": "algebraic",
    "python": "sum({expr} for {iter} in {range})"
  }
}
```

這會讓符號的語意依賴 Python emitter。

宿主中立版本應為：

```json
{
  "semantic_id": "eml.algebra.aggregate.sum",
  "surface_forms": ["Σ", "SUM"],
  "arity": 2,
  "semantic": {
    "operation": "aggregate",
    "monoid": "addition",
    "iterator_binding": true,
    "range_policy": "declared"
  },
  "effects": [],
  "emitters": {
    "python": "sum({expr} for {iter} in {range})",
    "cpp": "eml::sum({range}, [&](auto {iter}) { return {expr}; })",
    "javascript": "Array.from({range}).reduce((a,{iter}) => a + ({expr}), 0)"
  }
}
```

`python` 不應被刪除，而應從核心欄位移到 `emitters.python`。

---

# 2. EML 的重新定義

## 2.1 正式定義

> **EML（Efficient New Language／Efficient Meta-Language）是一套通用語意附加協議。它允許結構化語意附著於既有宿主物件，形成宿主中立的語意圖與語意中介表示，再由確定性適配器將其投影、轉譯、執行、驗證與觀測。**

## 2.2 三種相容名稱

歷史上 EML 有兩種英文展開。新版不強迫刪除其中之一，而採雙層解釋：

- **Efficient New Language**：對外品牌與歷史名稱；
- **Efficient Meta-Language**：工程架構名稱；
- **EML**：穩定正式縮寫。

可以表達為：

```text
Efficient New Language
    是 EML 對語言形態的長期願景

Efficient Meta-Language
    是 EML 對工程位置的精確描述
```

## 2.3 EML 不是什麼

EML 不是：

- Python 縮寫語法；
- 單一符號字典；
- 純 Unicode 語言；
- 只為節省字元的 code golf；
- 必須替代所有現有語言的新 runtime；
- 由 LLM 即時猜測語意的非確定性編譯器；
- 只能在文字右上角顯示的排版技巧；
- 只能用於程式碼的工具。

## 2.4 EML 是什麼

EML 同時是：

1. 語意附加規則；
2. 宿主物件定位協議；
3. 符號與語意註冊表；
4. 宿主中立語意 IR；
5. 多目標 emitter／adapter 框架；
6. 人類可見投影系統；
7. AI／Agent 可讀語意界面；
8. 確定性驗證與 round-trip 系統；
9. 執行觀測與 trace 接口；
10. 可選的高密度文字語法。

---

# 3. 右上角：位置不是本體，位置是投影

## 3.1 右上角的原始價值

右上角附加具有三個優點：

- 不破壞基礎符號；
- 人眼容易感知「主體＋附加操作」；
- 可把值、操作與控制資訊壓縮到同一視覺單位。

例如：

```text
x⁺¹⁰⁰
mᵀ
result⁰
```

其認知結構不是一串平面字元，而是：

```text
主體 x
    └── 右上附加：初始化／加法語意，payload = 100
```

## 3.2 右上角不是唯一位置

語意附加應支援多種投影位置：

| 位置 | 適合語意 |
|---|---|
| 右上角 | 操作、狀態、權重、輸出、轉置、版本 |
| 左上角 | 前置條件、來源、權限、信心 |
| 右下角 | 結果索引、局部標籤、輸出通道 |
| 左下角 | provenance、時間、資料來源 |
| 行內 | 可直接閱讀的操作語法 |
| 側邊 | 長說明、風險、政策、測試 |
| 上方／下方 | 音標、翻譯、發音、型別、單位 |
| 節點外圈 | 工作流狀態、可執行權限、依賴 |
| 圖層／圖譜 | 跨物件關係、因果、資料流 |

右上角應保留為 EML 最具辨識度的預設投影，但底層資料不能只保存「右上角字串」。

## 3.3 語意錨點

任意附加都必須指向一個錨點：

```json
{
  "anchor": {
    "host_id": "file://src/model.py",
    "object_type": "ast_node",
    "object_id": "node_0042",
    "span": {
      "start": 128,
      "end": 136
    },
    "selector": "function:square_sum/return/expr"
  }
}
```

錨點可以是：

- 字元；
- token；
- AST 節點；
- 函數；
- 類別；
- 文件段落；
- 表格欄位；
- JSON path；
- SQL column；
- 圖形節點；
- 工作流節點；
- API endpoint；
- 音訊時間區間；
- 圖像區域；
- 影片時間軸；
- 自然語言實體。

---

# 4. EML 通用形式模型

## 4.1 系統狀態

定義一個 EML 系統：

$$
\mathcal{E}
=
(H,A,S,R,P,X,O)
$$

其中：

- $H$：Host Artifacts，宿主物件集合；
- $A$：Anchors，對宿主物件的可重定位錨點；
- $S$：Semantic Nodes，語意附加節點；
- $R$：Relations，語意節點與宿主／其他節點的關係；
- $P$：Policies，權限、驗證、風險與作用域政策；
- $X$：Projections and Adapters，投影與宿主適配器；
- $O$：Observations，執行、轉譯與變更觀測流。

## 4.2 語意附加節點

每個語意附加節點定義為：

$$
s_i
=
(\mathrm{id},
\mathrm{type},
\mathrm{payload},
\mathrm{scope},
\mathrm{effects},
\mathrm{constraints},
\mathrm{policy},
\mathrm{provenance})
$$

語意節點不應直接等同於顯示符號。符號只是其 surface form。

例如 `mᵀ` 中：

```json
{
  "id": "sem_01J_TRANSPOSE",
  "type": "eml.linear.transpose",
  "payload": {
    "operand": "anchor:m"
  },
  "scope": "expression",
  "effects": [],
  "constraints": [
    "operand.rank >= 2"
  ],
  "policy": {
    "deterministic": true,
    "requires_review": false
  },
  "provenance": {
    "created_by": "human",
    "source": "unicode_projection"
  }
}
```

## 4.3 附加關係

語意節點與宿主錨點的關係定義為：

$$
a_{ij}
=
(\mathrm{anchor}_j,
\mathrm{semantic}_i,
\mathrm{relation},
\mathrm{position},
\mathrm{priority})
$$

其中 `relation` 可以是：

- `operates_on`
- `describes`
- `constrains`
- `observes`
- `authorizes`
- `transforms`
- `depends_on`
- `emits`
- `waits_for`
- `repairs`
- `classifies`

## 4.4 投影函數

語意本體到人類或宿主語言表面的投影為：

$$
\Pi_{h,v}
:
(S,A,R)
\rightarrow
\mathrm{Surface}_{h,v}
$$

其中：

- $h$ 是宿主；
- $v$ 是視圖模式。

同一語意可以有不同投影：

```text
Unicode View
mᵀ

ASCII Canonical View
m^T

Python View
np.transpose(m)

C++ View
eml::transpose(m)

Explain View
對矩陣 m 執行轉置。

Agent View
{"type":"eml.linear.transpose","operand":"m"}
```

## 4.5 適配器正確性

若語意節點 $s$ 被適配器 $X_h$ 投影到宿主程式 $p_h$，則最低正確性條件為：

$$
\operatorname{Meaning}(s)
\equiv
\operatorname{Meaning}(p_h)
$$

工程上不能只宣稱等價，而應透過：

- AST 對照；
- 型別與約束驗證；
- golden tests；
- property tests；
- round-trip；
- runtime equivalence；
- trace comparison；

逐步建立可信度。

---

# 5. 分層架構

## 5.1 Layer 0：Host Artifact Layer

宿主層保存原始物件，不要求它們改成 EML。

支援對象包括：

```text
程式碼
自然語言
數學式
資料表
JSON／YAML
SQL schema
工作流
API
圖形節點
音訊
影像
影片時間軸
知識圖譜
```

## 5.2 Layer 1：Anchor Layer

Anchor Layer 負責在宿主變動後重新定位語意。

需要支援：

- byte span；
- line／column；
- AST identity；
- structural selector；
- content hash；
- fuzzy relocation；
- parent／child path；
- version-aware mapping。

不能只保存游標位置，否則文件一修改，所有附加都會漂移。

## 5.3 Layer 2：Semantic Overlay Layer

這是 EML 的核心。

功能：

- 建立語意節點；
- 驗證語意型別；
- 解析 payload；
- 管理 namespace；
- 設定作用域；
- 設定 effects；
- 設定權限；
- 保存 provenance；
- 建立節點關係。

## 5.4 Layer 3：Semantic IR／Graph Layer

所有宿主輸入都正規化為統一語意表示。

建議同時保留：

1. **Tree IR**：適合編譯與局部轉譯；
2. **Graph IR**：適合跨節點依賴、資料流、因果、Agent 操作；
3. **Event IR**：適合執行 trace 與時間語意。

```text
Semantic Tree
    描述局部結構

Semantic Graph
    描述跨結構關係

Semantic Event Stream
    描述時間中的實際變化
```

## 5.5 Layer 4：Policy and Validation Layer

EML 不應讓任何語意附加自動取得執行權。

政策層至少處理：

- 是否只讀；
- 是否可轉譯；
- 是否可執行；
- 是否可修改宿主；
- 是否需要人工核准；
- 是否可跨檔案；
- 是否可發出外部 I/O；
- 是否涉及安全敏感操作；
- 是否需要測試通過；
- 是否需要 round-trip；
- 是否允許 AI 建議；
- 是否允許 AI 套用。

## 5.6 Layer 5：Adapter Layer

每個宿主適配器實作：

```text
parse_host
anchor_host
import_semantics
emit_host
validate_host
execute_host
observe_host
roundtrip_host
```

## 5.7 Layer 6：Projection Layer

Projection Layer 為人類與 Agent 提供不同視圖：

- Symbol View；
- Expanded Code View；
- Natural Language View；
- AST View；
- Semantic Graph View；
- Trace View；
- Risk View；
- Policy View；
- Diff View；
- Teaching View。

## 5.8 Layer 7：Agent Interface Layer

Agent 介面不是旁支，而是 EML 的主要使用面之一。

Agent 應能：

- 讀取宿主與 overlay；
- 搜尋語意節點；
- 提出新附加；
- 解釋符號；
- 轉譯；
- 產生測試；
- 比較不同宿主投影；
- 讀取 trace；
- 發現語意衝突；
- 提出修復候選；
- 在政策允許時套用變更。

---

# 6. EML Canonical Semantic IR

## 6.1 最小節點格式

```json
{
  "eml_version": "2.0",
  "semantic_id": "eml.control.output",
  "node_id": "sem_01",
  "anchor": {
    "host": "python",
    "artifact": "src/main.py",
    "selector": "function:main/statement:3/expression"
  },
  "relation": "operates_on",
  "position": "upper_right",
  "scope": "expression",
  "payload": {
    "channel": "stdout"
  },
  "effects": [
    "io.stdout"
  ],
  "constraints": [],
  "policy": {
    "deterministic": true,
    "execute": "allowed",
    "mutation": "none",
    "review": "not_required"
  },
  "provenance": {
    "author": "Neo.K",
    "created_at": "2026-07-23",
    "source": "human"
  }
}
```

## 6.2 宿主中立符號註冊表

建議建立 `eml-semantic-registry.json`：

```json
{
  "registry_version": "2.0",
  "entries": {
    "eml.control.output": {
      "namespaces": ["core", "control"],
      "surface_forms": {
        "unicode": ["⁰"],
        "ascii": ["^0"],
        "words": ["output", "print", "display"]
      },
      "schema": {
        "payload": {
          "channel": {
            "type": "string",
            "default": "stdout"
          }
        }
      },
      "effects": ["io.stdout"],
      "emitters": {
        "python": "print({operand})",
        "cpp": "std::cout << {operand}",
        "javascript": "console.log({operand})",
        "rust": "println!(\"{}\", {operand})"
      }
    }
  }
}
```

## 6.3 Surface Form 與 Semantic ID 分離

同一語意可以有多個符號：

```text
^0
⁰
OUT
print
display
```

同一符號在不同 namespace 也可能有不同語意。

因此解析必須依賴：

```text
namespace
+ host context
+ operand type
+ scope
+ explicit semantic_id
```

而不是只用字元本身猜測。

---

# 7. 通用宿主適配

## 7.1 程式語言宿主

第一階段應支援：

- EML Canonical Text；
- Python；
- C++；
- JavaScript／TypeScript；
- Rust；
- SQL；
- Shell。

每種語言不必一次支援全部語法，但必須遵守同一 adapter contract。

## 7.2 自然語言宿主

自然語言中的 EML 不應把整篇文章變成程式碼，而是附加可計算語意。

例如：

```text
「下週完成初版」
```

可以附加：

```json
{
  "semantic_id": "eml.temporal.deadline",
  "payload": {
    "time_expression": "next_week",
    "resolution": "calendar_context"
  }
}
```

又例如：

```text
「這是一個暫定結論」
```

可附加：

```json
{
  "semantic_id": "eml.epistemic.confidence",
  "payload": {
    "status": "provisional",
    "confidence": 0.62
  }
}
```

## 7.3 資料與表格宿主

對資料欄位可附加：

- 單位；
- 型別；
- 來源；
- 隱私；
- 品質；
- 更新頻率；
- 缺失值政策；
- 推導公式；
- 權限；
- 語意角色。

例如：

```json
{
  "anchor": "table:sales/column:revenue",
  "semantic_id": "eml.data.measure",
  "payload": {
    "unit": "TWD",
    "aggregation": "sum",
    "nullable": false
  }
}
```

## 7.4 工作流宿主

對工作流節點可附加：

- 可重試；
- 冪等；
- 需人工確認；
- 時間等待；
- 失敗回滾；
- 風險；
- 成本；
- 模型選擇；
- 資料權限。

這使 EML 從程式符號層延伸為 Agent 工作流的共同語意層。

## 7.5 多媒體宿主

EML overlay 可以附加於：

- 音訊區間：音素、聲調、發音動作；
- 圖片區域：物件、關係、編輯意圖；
- 影片時間軸：事件、鏡頭、字幕、風格；
- 3D 場景：物件屬性、碰撞、行為、LOD；
- 遊戲世界：實體狀態、任務、因果、權限。

這些 overlay 不一定立即可執行，但可成為 AI 與工具共用的結構化語意。

---

# 8. Workbench 的重新設計

## 8.1 目前元件重新命名

| 現行元件 | 新正式名稱 | 地位 |
|---|---|---|
| 右上角符號入口 | EML Symbol Palette | 快速輸入工具 |
| 左側 EML 輸入框 | Canonical Text Editor | EML 文字 profile |
| 右側 Python | Python Projection | Python adapter 輸出 |
| AST Tab | Syntax／Semantic Tree View | 結構投影 |
| Trace Tab | Execution Observation View | Event IR 投影 |
| Functions Tab | Function Semantic Profile | 冷熱／純度／重要性 |
| Meta Tab | Adapter Metadata View | 暫時宿主資訊 |

## 8.2 新增 Global Semantic Overlay

全域語意附加入口應作用於：

```text
目前選取
目前節點
目前文件
整個專案
工作區
外部資料物件
```

入口不應只插入字串，而應開啟語意面板：

```text
選擇語意
    ↓
選擇錨點與作用域
    ↓
填入 payload
    ↓
選擇投影位置
    ↓
選擇目標宿主／執行策略
    ↓
驗證
    ↓
保存 overlay
```

## 8.3 新介面模式

### 模式 A：符號輸入

適合快速寫 EML Canonical Text。

### 模式 B：語意附加

對既有 Python、C++、自然語言、工作流或資料建立 overlay。

### 模式 C：投影切換

在 Unicode、ASCII、宿主語言、自然語言、AST、Graph 間切換。

### 模式 D：語意檢查

顯示：

- 未解析 anchor；
- namespace 衝突；
- adapter 不支援；
- effect 未授權；
- payload 不完整；
- round-trip 不一致；
- 執行結果分歧。

## 8.4 專案層 overlay

建議新增：

```text
.eml/
  manifest.json
  registry.lock.json
  overlays/
    file-src-main.py.eml.json
    workflow-video-pipeline.eml.json
  graphs/
    semantic-graph.json
  traces/
    latest.jsonl
  policies/
    default-policy.json
```

原始宿主檔案可以保持不變；語意附加保存於 `.eml/`。

對需要可攜性的場景，也可選擇 inline encoding。

---

# 9. 現行程式碼的重新定位

## 9.1 保留項目

以下現有元件應完整保留：

- Unicode normalization；
- lexer；
- parser；
- AST；
- semantic analyzer；
- Python emitter；
- Python reverse parser／emitter；
- round-trip；
- interpreter；
- trace；
- diagnostics；
- cold／hot metadata；
- crystallization cache；
- temporal prototype；
- BUG classifier；
- C++ emitter；
- LSP；
- MCP；
- REST tools；
- conformance tests。

## 9.2 新套件分層建議

```text
packages/
  semantic-core/
  semantic-registry/
  anchor-model/
  overlay-store/
  policy-engine/
  projection-engine/

  profile-eml-text/
  adapter-python/
  adapter-cpp/
  adapter-javascript/
  adapter-rust/
  adapter-sql/
  adapter-workflow/
  adapter-natural-language/

  parser/
  interp/
  trace/
  lsp/
  mcp/
  workbench/
```

## 9.3 現行套件的遷移映射

| 現行套件 | 新位置 |
|---|---|
| `@eml/parser` | `profile-eml-text` + `semantic-core` |
| `@eml/transpiler-python` | `adapter-python` |
| `@eml/transpiler-eml` | `profile-eml-text` reverse projection |
| `@eml/transpiler-cpp` | `adapter-cpp` |
| `@eml/symbols` | `semantic-registry` |
| `@eml/interp` | `execution-engine`／Canonical Text interpreter |
| `@eml/trace` | `observation-core` |
| `@eml/lsp` | `profile-eml-text` editor integration |
| `@eml/mcp` | `agent-interface` |
| Workbench symbol palette | `symbol-input` |
| Workbench new overlay panel | `overlay-authoring` |

## 9.4 相容性要求

遷移不得破壞：

```bash
eml parse
eml transpile
eml run
eml cts
eml check
eml explain
eml compress
eml roundtrip
eml crystallize
eml bugs
eml trace
eml test
```

新架構應以兼容層重新實作這些命令。

---

# 10. CTS 的升級

現行 CTS 已包含 symbol、node、dependency 與 target code。新版建議改為 **Canonical Semantic Table／Graph**。

## 10.1 CTS v2 最小格式

```json
{
  "protocol": "eml-cts-v2",
  "artifact": {
    "host": "python",
    "uri": "src/main.py",
    "hash": "..."
  },
  "anchors": {},
  "semantic_nodes": {},
  "relations": [],
  "policies": {},
  "projections": {},
  "observations": []
}
```

## 10.2 CTS 不再綁定 Python

舊式：

```json
{
  "target": "python.sum"
}
```

新版：

```json
{
  "semantic_id": "eml.algebra.aggregate.sum",
  "available_projections": [
    "python",
    "cpp",
    "javascript",
    "explain",
    "unicode"
  ]
}
```

---

# 11. AI 與確定性核心

## 11.1 不變原則

LLM 不得悄悄進入確定性核心。

確定性核心包括：

```text
normalize
parse
semantic validation
policy validation
adapter selection
rule-based emission
test gates
round-trip comparison
trace recording
```

## 11.2 AI 可以做的事

AI 可以：

- 從宿主內容提出 overlay 候選；
- 建議 semantic ID；
- 補全 payload；
- 找出重複語意；
- 建議壓縮；
- 產生 adapter 草稿；
- 生成測試；
- 解釋語意圖；
- 提出修復候選；
- 協助 anchor relocation；
- 將自然語言意圖編譯成候選 IR。

## 11.3 AI 不可以單方面做的事

AI 不得：

- 未記錄地改變 semantic ID；
- 未經 policy gate 執行高風險 effect；
- 將 conceptual 能力假裝為 implemented；
- 在 round-trip 失敗時宣稱等價；
- 覆寫宿主而不保存 diff；
- 把低信心推測寫成確定語意；
- 自行發明未註冊符號並當作標準。

---

# 12. EML 1.5 能力如何回到通用架構

## 12.1 冷熱分離

冷熱不是 Python decorator 專屬語法，而是語意屬性：

```json
{
  "semantic_id": "eml.execution.temperature",
  "payload": {
    "class": "cold",
    "purity": "required",
    "cacheable": true
  }
}
```

它可以附加於：

- 函數；
- 工作流節點；
- 查詢；
- 模型呼叫；
- 資料轉換；
- 規則節點。

## 12.2 邏輯結晶化

結晶化是對穩定語意子圖的固定與快取：

$$
\operatorname{Crystal}(G_s)
=
(\operatorname{hash}(G_s), \operatorname{proof}, \operatorname{artifact})
$$

其中 $G_s$ 是可驗證、低變動、低副作用的語意子圖。

## 12.3 時間迴圈

時間迴圈應建模為語意與 runtime policy：

```json
{
  "semantic_id": "eml.temporal.wait_loop",
  "payload": {
    "condition": "approval.received",
    "check_interval": "PT60S",
    "max_wait": "PT1H",
    "timeout_action": "raise"
  }
}
```

它可以投影成：

- Python async；
- JavaScript Promise／timer；
- 工作流 sleep／resume；
- 任務排程器；
- 分散式事件訂閱。

## 12.4 BUG 五級分類

BUG 分類是診斷語意，不應只存在 CLI 顯示中：

```json
{
  "semantic_id": "eml.diagnostic.severity",
  "payload": {
    "level": "MAJOR",
    "action": "reject_result_and_propose_repair"
  }
}
```

## 12.5 自動修復

修復不是一條語法，而是一個受政策約束的候選變換：

$$
f
\rightarrow
\{f'_1,f'_2,\ldots,f'_k\}
\rightarrow
\operatorname{Validate}
\rightarrow
\operatorname{Approve}
\rightarrow
\operatorname{Apply}
$$

---

# 13. 多語言與多目標適配策略

## 13.1 Adapter Capability Matrix

每個 adapter 必須公開能力矩陣：

```json
{
  "adapter": "python",
  "version": "2.0",
  "capabilities": {
    "eml.algebra.aggregate.sum": "implemented",
    "eml.linear.transpose": "implemented",
    "eml.temporal.wait_loop": "partial",
    "eml.repair.apply": "unsupported"
  }
}
```

## 13.2 不允許靜默降級

若 adapter 不支援某語意：

- 必須明確報錯；
- 或明確保留為 metadata；
- 或要求另一 adapter／runtime；
- 不得生成看似可執行但語意不同的程式。

## 13.3 跨宿主 round-trip

新的 round-trip 不只比較文字，而比較語意：

$$
S
\rightarrow
P_h
\rightarrow
S'
$$

成功條件：

$$
\operatorname{Normalize}(S)
=
\operatorname{Normalize}(S')
$$

文字可以不同，語意圖必須在規定等價關係下相同。

---

# 14. 工程遷移路線

## Phase U0：名稱與界面校正

1. 將右上角現行功能改名為 `Symbol Palette`。
2. 在 UI 中明確標示 `Python Projection`。
3. README 增加：
   - Python 是第一個 reference adapter；
   - EML 本體是 universal semantic overlay；
   - Workbench 尚未完成 universal overlay authoring。
4. `eml-symbols.json` 標註為 v1 compatibility registry。

**完成條件：** 不改核心功能，但不再誤導產品定位。

## Phase U1：Semantic Registry v2

1. 建立宿主中立 `semantic_id`。
2. 將 Python 模板移入 `emitters.python`。
3. 建立 schema、effects、constraints、namespace。
4. 為現有符號建立 migration map。
5. 所有舊測試保持通過。

**完成條件：** 同一語意至少可註冊 Python 與 C++ emitter。

## Phase U2：Anchor Model 與 Overlay Store

1. 建立 anchor schema。
2. 支援文字 span 與 AST node。
3. 建立 `.eml/overlays/*.json`。
4. 支援文件修改後 relocation。
5. 建立 overlay diff。

**完成條件：** 不改宿主檔案也可保存語意附加。

## Phase U3：Workbench Global Overlay

1. 選取文字／AST 節點後建立 overlay。
2. 選擇位置、作用域、semantic ID、payload。
3. 顯示 Unicode／ASCII／Explain／Host projections。
4. 顯示 policy 與 adapter capability。
5. Symbol Palette 與 Overlay Authoring 分開。

**完成條件：** 可對普通 Python 檔案附加 `cold`、`output`、`risk` 等語意，而不先把整份檔案改寫成 EML。

## Phase U4：Multi-Host Adapter Contract

1. 抽象 adapter interface。
2. 遷移 Python 與 C++。
3. 新增 JavaScript／TypeScript MVP。
4. 建立 capability matrix。
5. 建立 cross-host semantic tests。

**完成條件：** 同一 Semantic IR 可以投影到至少三個程式宿主。

## Phase U5：Natural Language／Workflow Profiles

1. 支援段落與實體 anchor。
2. 支援 deadline、confidence、authority、dependency。
3. 支援工作流 wait、retry、approval、rollback。
4. 建立 Agent 操作工具。

**完成條件：** EML 不再只能用於程式碼。

## Phase U6：Advanced Semantic Families

重新接入：

- 冷熱分離；
- 邏輯結晶化；
- 時間迴圈；
- BUG 分級；
- 驗證式修復；
- 重要性；
- 觀測；
- 權限；
- 成本；
- 風險。

---

# 15. 驗收標準

## 15.1 定位驗收

以下敘述必須同時成立：

- EML 不是 Python 方言；
- Python 是 EML adapter；
- 右上角是預設投影，不是唯一結構；
- Symbol Palette 不是 Semantic Overlay；
- EML 可附加於非程式物件；
- EML 核心語意不保存為單一宿主模板；
- AI 建議與確定性驗證分離。

## 15.2 工程驗收

至少通過：

1. 舊 EML→Python 全部測試；
2. 舊 Python→EML round-trip；
3. C++ 原型測試；
4. Registry v1→v2 migration；
5. overlay anchor relocation；
6. Python、C++、JS 三宿主語意對照；
7. 未支援語意明確拒絕；
8. policy gate 測試；
9. overlay diff；
10. Semantic IR snapshot；
11. trace 對應 semantic node；
12. Agent API 權限測試。

## 15.3 產品驗收

使用者應能完成：

```text
開啟普通 Python
    ↓
選取一個函數
    ↓
附加 @cold 語意
    ↓
查看右上角符號投影
    ↓
查看自然語言說明
    ↓
查看 C++／JS 可用性
    ↓
執行 purity validation
    ↓
保存 overlay
```

而不是被迫先將整份 Python 轉為 EML。

---

# 16. 對外敘述

## 16.1 一句話

> EML is a universal semantic-overlay protocol that lets humans, agents, and tools attach structured meaning to existing code, data, language, and workflows—then project that meaning into executable and verifiable forms.

## 16.2 中文正式版

> EML 是一套通用語意附加協議，使人類、AI Agent 與工具能在既有程式、資料、語言與工作流上附著結構化語意，再將其投影為可執行、可驗證、可觀測的多種形式。

## 16.3 開發者版

> EML provides a host-neutral semantic IR, overlay registry, anchor model, and adapter framework. Python and C++ are reference adapters, not the boundary of the language.

## 16.4 一般使用者版

> 不必重寫原本的內容，EML 可以在既有文字、程式與流程上加上一層機器可理解、工具可執行的意思。

---

# 17. Agent 接手指令

```text
你正在接手 EML Universal Semantic Overlay v2.0。

最高優先原則：
1. 不得把 EML 等同於 Python 語法壓縮器。
2. 不得把 Symbol Palette 稱為完整 Semantic Overlay。
3. Python 是 reference adapter，不是 EML 本體。
4. 右上角是投影位置，不是底層唯一資料結構。
5. 所有核心語意必須使用 semantic_id 與宿主中立 schema。
6. emitter 必須位於 adapter 或 registry emitters 欄位。
7. AI 可以提出候選，但確定性驗證器與 policy gate 決定是否接受。
8. 不得破壞現行 parser、transpiler、round-trip、trace 與測試。
9. 新架構必須以兼容遷移完成，不得為重構而重寫所有既有功能。
10. 每個新能力必須標記 implemented／partial／conceptual／planned。

第一輪任務：
A. 將 Workbench 目前右上角功能正式命名為 Symbol Palette。
B. 建立 semantic-registry-v2.schema.json。
C. 將 eml-symbols.json 遷移為 host-neutral registry。
D. 定義 Anchor、Overlay、Policy、Projection、Adapter 五個 TypeScript interface。
E. 建立 .eml/overlay-store 最小範例。
F. 讓現有 Python 與 C++ emitter 通過新 adapter interface。
G. 保持全部既有測試通過。
H. 新增至少 20 個 universal overlay tests。
```

---

# 18. 最終判定

EML 現行 MVP 並沒有失敗。相反地，它已成功證明：

- 符號語法可以確定性執行；
- 語意可以進入 AST；
- 多方向轉譯可以 round-trip；
- 執行可以被 trace；
- Agent 可以透過工具協定操作；
- 同一 AST 可以開始支援多後端。

真正需要修正的是**層級誤認**：

```text
成功的 Python MVP
    不等於
EML 的全部本體
```

應將現有系統重新命名為：

> **EML Canonical Text Profile + Python Reference Adapter + Workbench MVP**

並在其上恢復真正的主系統：

> **EML Universal Semantic Overlay Protocol**

EML 的核心不在某一個符號、某一個程式語言或某一個編輯器。它的核心在於：

$$
\boxed{
\text{既有載體}
+
\text{可定位語意}
+
\text{宿主中立表示}
+
\text{可驗證投影}
}
$$

因此，右上角必須回來。

但它回來時，不應只是更多符號。

它應該成為一個通往整套語意附加系統的可見入口：符號可以在右上角顯示，語意可以在圖譜中流動，適配器可以把它轉為不同語言，Agent 可以理解它，驗證器可以檢查它，執行系統可以觀測它，而原始宿主仍然可以保持自身完整。

這才是 EML 原本的通用性。

---

# 附錄 A：核心語意家族建議

```text
eml.core.*
eml.assignment.*
eml.control.*
eml.algebra.*
eml.linear.*
eml.collection.*
eml.function.*
eml.type.*
eml.effect.*
eml.execution.*
eml.temperature.*
eml.crystal.*
eml.temporal.*
eml.diagnostic.*
eml.repair.*
eml.policy.*
eml.authority.*
eml.epistemic.*
eml.data.*
eml.workflow.*
eml.agent.*
eml.media.*
eml.domain.math.*
eml.domain.physics.*
eml.domain.ai.*
eml.domain.game.*
eml.domain.linguistics.*
```

# 附錄 B：最小 TypeScript 介面草案

```ts
export type ImplementationStatus =
  | 'implemented'
  | 'partial'
  | 'conceptual'
  | 'planned'
  | 'unsupported';

export interface EmlAnchor {
  hostId: string;
  artifactUri: string;
  objectType: string;
  objectId?: string;
  selector?: string;
  span?: {
    start: number;
    end: number;
    line?: number;
    column?: number;
  };
  contentHash?: string;
}

export interface EmlSemanticNode<TPayload = unknown> {
  nodeId: string;
  semanticId: string;
  payload: TPayload;
  scope: 'token' | 'expression' | 'statement' | 'block' | 'document' | 'project' | 'workspace';
  effects: string[];
  constraints: string[];
  status: ImplementationStatus;
  provenance: {
    source: 'human' | 'agent' | 'import' | 'inference';
    author?: string;
    confidence?: number;
    createdAt: string;
  };
}

export interface EmlOverlay {
  overlayId: string;
  anchor: EmlAnchor;
  semanticNode: EmlSemanticNode;
  relation: string;
  position:
    | 'upper_right'
    | 'upper_left'
    | 'lower_right'
    | 'lower_left'
    | 'inline'
    | 'side'
    | 'graph'
    | 'hidden';
  priority: number;
}

export interface EmlPolicy {
  policyId: string;
  execute: 'deny' | 'ask' | 'allow';
  mutate: 'deny' | 'ask' | 'allow';
  externalIo: 'deny' | 'ask' | 'allow';
  requireTests: boolean;
  requireRoundTrip: boolean;
  requireHumanReview: boolean;
}

export interface EmlAdapter {
  id: string;
  host: string;
  version: string;
  capabilities(): Record<string, ImplementationStatus>;
  importHost(source: string): Promise<unknown>;
  emit(nodes: EmlSemanticNode[], overlays: EmlOverlay[]): Promise<string>;
  validate(source: string): Promise<unknown>;
  roundTrip?(source: string): Promise<unknown>;
  execute?(source: string, policy: EmlPolicy): Promise<unknown>;
}
```

# 附錄 C：第一批 Registry v2 遷移對照

| 舊 surface | Semantic ID | 類型 |
|---|---|---|
| `^0`／`⁰` | `eml.control.output` | effectful operation |
| `^+` | `eml.assignment.init_or_add` | contextual assignment |
| `^+=` | `eml.assignment.add` | assignment |
| `^-` | `eml.assignment.subtract` | assignment |
| `^*` | `eml.assignment.multiply` | assignment |
| `^/` | `eml.assignment.divide` | assignment |
| `^T`／`ᵀ` | `eml.linear.transpose` | linear operation |
| `Σ` | `eml.algebra.aggregate.sum` | aggregation |
| `∈` | `eml.relation.membership.range` | relation |
| `=>`／`⇒` | `eml.assignment.bind_result` | binding |
| `?:` | `eml.control.conditional_expression` | control |
| `<M>`／`⟨M⟩` | `eml.linear.matrix_construct` | constructor |
| `list^+` | `eml.collection.list_construct` | constructor |
| `@cold` | `eml.execution.temperature.cold` | execution metadata |
| `@hot` | `eml.execution.temperature.hot` | execution metadata |
| `@temporal_loop` | `eml.temporal.wait_loop` | temporal policy |
| `await` | `eml.temporal.await` | temporal control |

# 附錄 D：來源索引

## 歷史理論

- 高效新語言完整技術與商業整合文件
- 高效新語言（EML）1.5：語意附加驅動的程式設計範式革新
- EML 1.5 終極版：時間感知的自適應程式語言範式
- EML 1.5 AI 語義規格：自足重寫版

## 工程規格

- EML-LANG-2026-MVP-Technical-Whitepaper-v0.1
- EML-PLAN-2026-v0.1
- eml-grammar.md
- eml-transpiler-spec.md
- eml-mvp-roadmap.md
- docs/EML-LANG-2026-v1.0.md
- docs/EML-AI-SEMANTIC-SPEC-v1.5.md
- docs/PROGRESS.md

## 現行實作

- README.md
- eml-symbols.json
- packages/workbench/src/main.ts
- packages/workbench/src/symbol-palette.ts
- packages/transpiler-python
- packages/transpiler-eml
- packages/transpiler-cpp
- packages/interp
- packages/trace
- packages/lsp
- packages/mcp
- 網站 `/app`
- 網站 `/ai/`
- 網站 `/ai/tools/*`

---

**文件結束**
