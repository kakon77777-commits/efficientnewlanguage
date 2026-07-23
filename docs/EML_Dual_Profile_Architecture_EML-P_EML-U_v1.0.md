---
title: "EML 雙版本架構：實用執行版與通用語意原始版"
subtitle: "EML-P / EML-U 雙軌發展、相容性與工程路線"
document_id: "EML-DUAL-PROFILE-ARCHITECTURE-2026-v1.0"
version: "v1.0"
date: "2026-07-23"
author: "Neo.K（許筌崴）"
organization: "EveMissLab／一言諾科技有限公司"
status: "normative architecture decision"
language: "zh-TW"
keywords:
  - EML
  - EML-P
  - EML-U
  - Practical Profile
  - Universal Semantic Profile
  - Semantic Compression
  - Symbolic Programming
  - Multi-Host Adapter
  - AI-Native Language
---

# EML 雙版本架構：實用執行版與通用語意原始版

## EML-P / EML-U 雙軌發展、相容性與工程路線

**作者：** Neo.K（許筌崴）  
**機構：** EveMissLab／一言諾科技有限公司  
**文件編號：** EML-DUAL-PROFILE-ARCHITECTURE-2026-v1.0  
**版本：** v1.0  
**日期：** 2026-07-23  
**狀態：** 正式架構決策文件

---

## 摘要

EML 最初被提出時，核心並非單純縮短 Python 程式碼，也不是建立一組有限的特殊符號，而是希望形成一套可以附著於既有語言、資料、工作流與其他符號載體之上的通用語意系統。

然而，在工程化過程中，為了優先完成可解析、可轉譯、可執行、可測試與可驗證的最小閉環，EML 逐步形成了以 Python 為主要宿主、以線性文字語法為主、以少量低歧義符號為核心的保守版本。這個版本在工程上是成功的，但其範圍比原始 EML 理論更窄。

若直接以目前的保守版本取代原始 EML，將造成原始通用語意附加、二維表示、高密度符號、跨宿主語意與 AI 原生意圖壓縮等能力被永久遺失。反之，若現在立即要求工程系統完整實現原始 EML，則會同時面臨符號歧義、編輯器複雜度、除錯成本、使用門檻、宿主適配與驗證困難。

因此，本文件正式採用**雙版本架構**：

1. **EML-P：Practical Execution Profile**
   - 中文名稱：**EML 實用執行版**
   - 目標：先做到能用、好用、可執行、可驗證與可商用。
   - 現行 GitHub、網站、Workbench、CLI、LSP、MCP、Python 轉譯器與 C++ 原型，全部歸入 EML-P。

2. **EML-U：Universal Semantic Profile**
   - 中文名稱：**EML 通用語意原始版**
   - 目標：保存並逐步恢復原始 EML 的通用語意附加、高密度符號、二維語法、跨媒介、跨宿主與 AI 原生能力。
   - 不以當前工程可用性為唯一限制，但必須保持理論嚴謹、語意可驗證與可降級。

兩者的基本關係為：

$$
\mathrm{EML\text{-}P}
\subseteq
\mathrm{EML\text{-}U}
$$

EML-P 是 EML-U 的穩定、線性、低歧義、工程化子集；EML-U 是完整 EML 的長期架構與研究空間。

本文件的核心決策是：

> **現在先完成 EML-P，使其成為真正可用的語言與工具鏈；同時將 EML-U 獨立保存，不再讓保守實作反過來覆蓋原始 EML。**

---

# 0. 架構決策

## 0.1 正式決策

自本文件起，EML 不再被視為只有一個單一版本，而是分為兩個正式 Profile：

```text
EML
├── EML-P：Practical Execution Profile
└── EML-U：Universal Semantic Profile
```

其中：

- EML-P 優先施工；
- EML-U 優先保存、形式化與實驗；
- EML-P 的所有正式語法都必須能被 EML-U 理解；
- EML-U 不必全部能立即轉換為 EML-P；
- 無法降級的 EML-U 語意必須被明確保留為 metadata 或 unsupported，不得靜默遺失。

## 0.2 為什麼必須拆成兩個版本

EML 同時承擔兩種互相拉扯的需求：

### 工程需求

- 語法穩定；
- 可解析；
- 可執行；
- 可測試；
- 可除錯；
- 可學習；
- 可整合既有 IDE；
- 可部署；
- 可商用。

### 原始研究需求

- 高密度語意壓縮；
- 符號自由組合；
- 右上、左上、上下等多位置附加；
- 二維與非線性語法；
- 通用語意附加；
- 跨語言；
- 跨媒介；
- AI 原生；
- 意圖級壓縮；
- 多種投影與自適應表示。

若把兩者綁在同一個表面語法上，將出現兩種結果之一：

1. 為了可用性而永久壓縮原始願景；
2. 為了完整願景而使工程版本無法穩定落地。

雙版本架構用來解除這個衝突。

---

# 1. EML-P：實用執行版

## 1.1 正式定義

> **EML-P 是 EML 的穩定、線性、低歧義、可執行 Profile。它以實際可用性、確定性、可測試性、可除錯性與既有語言互操作為優先。**

## 1.2 核心目標

EML-P 的優先順序如下：

1. 可以安裝；
2. 可以啟動；
3. 可以寫；
4. 可以解析；
5. 可以轉譯；
6. 可以執行；
7. 可以測試；
8. 可以除錯；
9. 可以往返驗證；
10. 可以整合編輯器；
11. 可以提供 AI Agent 使用；
12. 可以逐步進入實際專案。

EML-P 不以最少字元為最高目標，而以**最小充分實用性**為目標。

## 1.3 EML-P 的設計原則

### 原則一：保守不等於沒有壓縮

EML-P 仍然必須保留具有高收益、低歧義的符號壓縮。

例如：

```eml
N^+100
Σ(i^2, i in [1:N]) => r
r^0
```

相較於：

```python
N += 100
r = sum(i ** 2 for i in range(1, N + 1))
print(r)
```

仍然具有明顯壓縮。

### 原則二：符號必須可解釋

每個 EML-P 符號必須具備：

- 唯一或高度穩定的核心語意；
- 明確語法位置；
- 明確結合優先序；
- 明確輸入與輸出；
- 明確錯誤；
- 明確宿主投影；
- 明確測試。

### 原則三：可讀性優先於極端縮短

EML-P 不追求 code golf。

採用一個符號前，應評估：

$$
V(s)
=
G_{\mathrm{compression}}
+
G_{\mathrm{semantic}}
+
G_{\mathrm{workflow}}
-
C_{\mathrm{ambiguity}}
-
C_{\mathrm{learning}}
-
C_{\mathrm{debug}}
$$

其中：

- $G_{\mathrm{compression}}$：字元與結構壓縮收益；
- $G_{\mathrm{semantic}}$：語意表達增益；
- $G_{\mathrm{workflow}}$：實際編輯與執行效率；
- $C_{\mathrm{ambiguity}}$：歧義成本；
- $C_{\mathrm{learning}}$：學習成本；
- $C_{\mathrm{debug}}$：除錯成本。

只有當 $V(s)$ 顯著為正時，該符號才應進入 EML-P。

### 原則四：線性文字為正式交換格式

EML-P 的正式語法應維持：

- 可存為純文字；
- 可 Git diff；
- 可 CLI 操作；
- 可跨平台；
- 可被傳統 parser 解析；
- 可用 ASCII fallback；
- Unicode 可作為顯示與輸入層。

### 原則五：確定性核心不可依賴 LLM

EML-P 的核心鏈：

```text
normalize
→ lex
→ parse
→ semantic analysis
→ emit
→ validate
→ execute
→ trace
```

必須是確定性的。

AI 可以建議，但不得取代 parser、驗證器與測試閘門。

---

# 2. EML-U：通用語意原始版

## 2.1 正式定義

> **EML-U 是 EML 原始理論的完整 Profile。它以通用語意附加、高密度符號、結構壓縮、意圖壓縮、非線性表示、跨宿主與 AI 原生協作為核心。**

## 2.2 EML-U 保留的原始能力

EML-U 必須保留：

- 右上角語意附加；
- 左上、右下、左下等多位置附加；
- 上方與下方語意層；
- 二維語法；
- 非線性閱讀順序；
- 圖式結構；
- 語意圖；
- 多層符號；
- 結構折疊；
- 意圖節點；
- 宿主中立 Semantic IR；
- 多宿主投影；
- 自然語言附加；
- 資料欄位附加；
- 工作流節點附加；
- 多媒體時間與空間附加；
- AI 自適應顯示；
- 領域專用語意包；
- 多種閱讀者投影。

## 2.3 EML-U 不受 EML-P 表面語法限制

EML-U 可以存在以下形式：

```text
線性符號
二維符號
語意節點
圖形連線
折疊區塊
視覺附加
語意 metadata
結構化 JSON
Agent Graph
```

EML-U 的本體不等於某一種顯示方式。

## 2.4 EML-U 的工程約束

雖然 EML-U 可以更激進，但仍不得失去：

- 語意識別；
- 來源追蹤；
- 作用域；
- 權限；
- 約束；
- 可驗證性；
- 可降級性；
- 版本控制；
- 明確 unsupported；
- 明確 implementation status。

EML-U 不是自由符號塗鴉，而是比 EML-P 更高階的語意系統。

---

# 3. 兩個版本的關係

## 3.1 子集關係

正式關係為：

$$
\mathrm{EML\text{-}P}
\subseteq
\mathrm{EML\text{-}U}
$$

這表示：

- 每個 EML-P 程式都應具有 EML-U 語意表示；
- EML-U 可以包含 EML-P 尚未支援的語意；
- EML-P 是穩定執行子集；
- EML-U 是完整語意超集。

## 3.2 投影關係

EML-P 可被視為 EML-U 的一種線性投影：

$$
\Pi_P:
\mathrm{EML\text{-}U}
\rightarrow
\mathrm{EML\text{-}P}
\cup
\mathrm{Metadata}
\cup
\mathrm{Unsupported}
$$

對任意 EML-U 結構：

1. 可以完整降級者，轉為 EML-P；
2. 不能執行但可保存者，轉為 EML-P + metadata；
3. 無法安全表達者，明確標示 unsupported。

## 3.3 不允許靜默遺失

例如 EML-U 中存在：

```text
多層右上附加
二維分支
視覺因果連線
動態權限
語意信心
```

若 EML-P 無法表示，不得只留下表面程式碼而刪除其他語意。

必須輸出：

```json
{
  "status": "partial_projection",
  "preserved": ["core_operation"],
  "metadata": ["confidence", "authority"],
  "unsupported": ["two_dimensional_branch"]
}
```

## 3.4 版本依賴方向

允許：

```text
EML-U 理解 EML-P
EML-U 匯入 EML-P
EML-U 生成 EML-P
```

不允許：

```text
EML-P 規格反過來刪除 EML-U 理論
EML-P parser 能力定義 EML-U 的全部邊界
```

---

# 4. 現有專案的重新定位

## 4.1 現行系統歸入 EML-P

目前下列項目全部正式歸類為 EML-P：

| 現有項目 | 新定位 |
|---|---|
| EML 文字語法 | EML-P Canonical Text |
| Unicode 符號形式 | EML-P Display Projection |
| Python 轉譯器 | EML-P Python Adapter |
| Python 反向轉譯 | EML-P Reverse Adapter |
| C++ 原型 | EML-P C++ Adapter Prototype |
| Workbench | EML-P Workbench |
| Symbol Palette | EML-P Symbol Palette |
| CLI | EML-P CLI |
| LSP | EML-P Language Server |
| MCP | EML-P Agent Interface |
| REST Tools | EML-P API |
| Trace | EML-P Execution Observation |
| Round-trip | EML-P Faithfulness Validation |
| Crystallization | EML-P Optimization Metadata |
| BUG classifier | EML-P Diagnostics |

## 4.2 通用語意文件歸入 EML-U

下列內容歸入 EML-U：

- 通用語意附加；
- 任意宿主物件；
- 右上角完整語意系統；
- Anchor Model；
- Semantic Registry v2；
- Semantic Graph；
- 多位置投影；
- 自然語言；
- 工作流；
- 資料；
- 多媒體；
- AI 動態投影；
- 高密度結構壓縮；
- 意圖節點；
- 二維語法。

## 4.3 網站命名調整

網站應明確區分：

```text
EML-P Workbench
EML-P Language Reference
EML-P API
EML-P Symbol Palette

EML-U Research
EML-U Semantic Overlay
EML-U Experimental Projection
```

目前 `/app` 應定位為：

> **EML-P Workbench**

而不是完整 EML 通用語意編輯器。

---

# 5. EML-P 的符號策略

## 5.1 現有符號保留

第一批保留符號：

| 符號 | 語意 |
|---|---|
| `^0` | 輸出 |
| `^+` | 初始化／加法式賦值 |
| `^+=` | 加法複合賦值 |
| `^-` | 減法複合賦值 |
| `^*` | 乘法複合賦值 |
| `^/` | 除法複合賦值 |
| `^T` | 轉置 |
| `Σ` | 求和 |
| `∈` | 成員／區間 |
| `=>` | 結果綁定 |
| `?:` | 條件運算 |
| `<M>` | 矩陣建立 |
| `@cold` | 冷邏輯 |
| `@hot` | 熱狀態 |
| `@temporal_loop` | 時間迴圈 |
| `await` | 非同步等待 |

## 5.2 第二批建議符號

EML-P 可考慮加入高收益資料流符號：

| 候選 | 語意 | 風險 |
|---|---|---|
| `?` | filter／guard | 與三元條件衝突，需語境規則 |
| `->` | map／transform／flow | 語意可能過寬 |
| `|>` | pipeline | 相對成熟，風險較低 |
| `!!` | assert／verify | 與其他語言慣例可能衝突 |
| `@retry` | 重試策略 | 低歧義 |
| `@verify` | 驗證策略 | 低歧義 |
| `@parallel` | 並行提示 | 必須避免假承諾 |
| `@memo` | 記憶化 | 與 `@cold` 關係需明確 |
| `@pure` | 純函數 | 低歧義 |
| `@effect` | 副作用聲明 | 低歧義 |

## 5.3 EML-P 不應立即採用的能力

暫不進入 EML-P：

- 任意位置附加；
- 多層上下標；
- 自動生成新符號；
- 無需 schema 的自定義符號；
- 二維流程圖即程式；
- 依使用者視線改變語法；
- AI 即時改寫核心語意；
- 同一符號依模型猜測不同意思；
- 無明確降級規則的視覺結構；
- 大量領域專屬符號直接進核心。

這些應留在 EML-U。

---

# 6. EML-P 的壓縮目標

## 6.1 四類壓縮

EML-P 應逐步處理：

1. 字元壓縮；
2. 語法壓縮；
3. 結構壓縮；
4. 操作流程壓縮。

但不立即承擔完整意圖壓縮。

## 6.2 字元壓縮

例如：

```python
print(result)
```

轉為：

```eml
result^0
```

## 6.3 語法壓縮

例如：

```python
r = sum(i ** 2 for i in range(1, N + 1))
```

轉為：

```eml
Σ(i^2, i in [1:N]) => r
```

## 6.4 結構壓縮

未來 EML-P 應允許低歧義 pipeline：

```eml
users
|> filter(active and age >= 18)
|> map(normalize_user)
=> valid_users
```

這比直接建立完全二維符號更保守，但已能壓縮大量重複 control flow。

## 6.5 不追求單純最短

EML-P 的壓縮率不應只計算字元，而應同時考慮：

$$
C_{\mathrm{effective}}
=
\alpha C_{\mathrm{chars}}
+
\beta C_{\mathrm{tokens}}
+
\gamma C_{\mathrm{structure}}
+
\delta C_{\mathrm{intent}}
-
\lambda A_{\mathrm{ambiguity}}
$$

其中：

- $C_{\mathrm{chars}}$：字元減少；
- $C_{\mathrm{tokens}}$：模型 Token 減少；
- $C_{\mathrm{structure}}$：控制結構減少；
- $C_{\mathrm{intent}}$：意圖保留；
- $A_{\mathrm{ambiguity}}$：歧義成本。

EML-P 中，$\lambda$ 應較高，也就是對歧義採保守態度。

---

# 7. EML-P Workbench 路線

## 7.1 目前定位

Workbench 是：

> EML-P 的線性程式編輯、轉譯、執行、追蹤與測試介面。

## 7.2 近期優先項目

### A. 編輯體驗

- Monaco／CodeMirror 類正式編輯器；
- syntax highlighting；
- diagnostics；
- hover explain；
- completion；
- go-to-definition；
- rename；
- formatting；
- bracket matching；
- multi-file project；
- search；
- command palette。

### B. 符號輸入

現有 Symbol Palette 保留，但升級為：

- 可分類；
- 可搜尋；
- 顯示輸入形式；
- 顯示展開結果；
- 顯示使用例；
- 顯示支援宿主；
- 顯示穩定性；
- 顯示快捷鍵；
- 顯示語意說明。

### C. 多投影

同一份 EML-P 顯示：

- ASCII；
- Unicode；
- Python；
- C++；
- AST；
- trace；
- explain；
- diagnostics。

### D. 壓縮分析

新增：

```text
原始宿主字元數
EML-P 字元數
原始 Token 估算
EML-P Token 估算
結構節點數
Round-trip 狀態
可讀性警告
```

## 7.3 不在近期實作

Workbench 暫時不做：

- 全域通用 overlay；
- 任意文件語意附加；
- 二維語法畫布；
- 多媒體 anchor；
- AI 自動生成符號。

這些留給 EML-U 實驗工具。

---

# 8. EML-P 工程路線

## Phase P0：定位修正

1. README 改為 EML-P Reference Implementation。
2. Workbench 改名 EML-P Workbench。
3. Symbol Palette 不再稱為完整語意附加。
4. Python 改稱 reference adapter。
5. EML-U 文件獨立列出。

## Phase P1：實用編輯器

1. 導入正式程式碼編輯器核心。
2. 完成 syntax highlighting。
3. 完成 diagnostics inline display。
4. 完成 hover explain。
5. 完成 completion。
6. 完成 format。
7. 支援多檔案。

## Phase P2：高收益語法糖

1. 評估 pipeline；
2. 評估 filter；
3. 評估 map；
4. 評估 verify；
5. 評估 retry；
6. 評估 parallel hint；
7. 建立語法收益測試；
8. 建立歧義測試。

## Phase P3：多宿主實用化

1. Python adapter 完整化；
2. C++ adapter 擴充；
3. JavaScript／TypeScript adapter MVP；
4. capability matrix；
5. unsupported 明確報告；
6. cross-host conformance tests。

## Phase P4：真實專案驗證

至少測試：

- CLI 工具；
- 資料清理；
- API client；
- 小型 Web 後端；
- 遊戲邏輯；
- 數學計算；
- Agent 工具；
- 自動化腳本。

## Phase P5：發佈與生態

- npm package；
- VS Code extension；
- standalone executable；
- GitHub templates；
- examples；
- documentation；
- playground；
- conformance suite；
- migration guide。

---

# 9. EML-U 保存與研究路線

## Phase U0：理論封存

1. 保存所有原始 EML 文件；
2. 建立版本時間線；
3. 標記原始概念；
4. 區分已實作與未實作；
5. 不再讓 EML-P 文件覆蓋 EML-U。

## Phase U1：語意本體

1. Semantic ID；
2. Anchor Model；
3. Overlay Node；
4. Projection；
5. Policy；
6. Provenance；
7. Semantic Graph。

## Phase U2：二維與多位置語法

1. 右上角；
2. 左上角；
3. 上下層；
4. 二維流程；
5. 多層附加；
6. 折疊節點；
7. Graph projection。

## Phase U3：跨宿主

1. 程式碼；
2. 自然語言；
3. 表格；
4. JSON；
5. 工作流；
6. 圖像；
7. 音訊；
8. 影片；
9. 遊戲世界。

## Phase U4：AI 原生介面

1. Agent semantic graph；
2. intent compression；
3. adaptive projection；
4. semantic negotiation；
5. human／AI dual view；
6. dynamic symbol recommendation；
7. formal validation gates。

---

# 10. 版本與命名規則

## 10.1 版本號

建議：

```text
EML-P 1.x
EML-U 0.x Experimental
```

EML-P 可優先進入穩定版本。

EML-U 在語意本體與降級規則穩定前保持 experimental。

## 10.2 檔案副檔名

建議：

```text
*.eml       EML-P Canonical Text
*.emlu      EML-U Experimental Text Projection
*.eml.json  EML Semantic IR／Overlay
```

也可在未來重新評估，但目前先避免 EML-U 與 EML-P 混用。

## 10.3 Package 命名

```text
@eml/p-core
@eml/p-parser
@eml/p-python
@eml/p-cpp
@eml/p-workbench

@eml/u-semantic
@eml/u-overlay
@eml/u-projection
@eml/u-anchor
@eml/u-research
```

若現有 package 不適合立即改名，可先透過文件與 export alias 過渡。

---

# 11. 相容性規範

## 11.1 EML-P 穩定性

EML-P 正式語法：

- 不得任意改義；
- 不得因 EML-U 實驗而破壞；
- 需經過 deprecation；
- 需提供 migration；
- 需維持 round-trip；
- 需維持測試。

## 11.2 EML-U 實驗性

EML-U 可以：

- 更換投影；
- 新增符號；
- 嘗試二維語法；
- 引入新語意節點；
- 測試新宿主；
- 測試 AI 介面。

但每次變更必須保存：

- version；
- semantic ID；
- migration；
- compatibility notes；
- degradation behavior。

## 11.3 互通格式

建議共同使用：

```json
{
  "eml_family": "EML",
  "profile": "P",
  "version": "1.0",
  "semantic_ir_version": "2.0"
}
```

或：

```json
{
  "eml_family": "EML",
  "profile": "U",
  "version": "0.2",
  "semantic_ir_version": "2.0"
}
```

---

# 12. 產品策略

## 12.1 EML-P 對外產品

EML-P 適合作為：

- 開發者工具；
- 教學語言；
- AI Agent 程式中介；
- Python 高密度前端；
- 多語言轉譯工具；
- 可觀測執行環境；
- 符號程式工作台；
- API／MCP 服務；
- 企業規則與工作流工具的基礎。

## 12.2 EML-U 對外研究

EML-U 適合作為：

- 語意計算研究；
- AI 原生語言研究；
- 高密度符號介面；
- 二維語法；
- 多媒介語意附加；
- 人類／AI 雙視圖；
- 通用意圖表示；
- 未來編譯器與工作流研究。

## 12.3 商業優先順序

近期：

```text
EML-P 可用性
>
EML-P 安裝與編輯器
>
EML-P 真實案例
>
EML-P 多宿主
>
EML-U 實驗工具
```

這不代表 EML-U 次要，而是代表 EML-U 不應承受近期產品交付壓力。

---

# 13. 驗收標準

## 13.1 EML-P 驗收

EML-P 必須能：

- 安裝；
- 啟動；
- 開啟專案；
- 編寫；
- 自動完成；
- 顯示錯誤；
- 轉譯；
- 執行；
- 測試；
- trace；
- round-trip；
- 輸出至少兩種宿主；
- 提供 AI 工具接口。

## 13.2 EML-U 驗收

EML-U 第一階段不要求完整執行，但必須：

- 保存原始語意；
- 使用宿主中立 semantic ID；
- 具有 anchor；
- 具有作用域；
- 具有投影；
- 具有降級結果；
- 明確標示 unsupported；
- 不依賴單一宿主語言；
- 可被 Agent 讀取。

## 13.3 雙版本驗收

以下敘述必須成立：

1. 現有 EML-P 不再宣稱等於全部 EML；
2. EML-U 不再被現行 parser 邊界覆蓋；
3. EML-P 程式可進入 EML-U IR；
4. EML-U 降級不會靜默丟失；
5. 文件與網站清楚區分兩個版本；
6. Symbol Palette 與 Semantic Overlay 清楚區分；
7. Python 是 adapter，不是全部 EML；
8. EML-P 仍持續進行有效壓縮。

---

# 14. Agent 接手指令

```text
你正在接手 EML 雙版本架構。

最高優先規則：

1. EML-P 是目前優先施工的實用執行版。
2. EML-U 是原始通用語意版，不得刪除或降格。
3. 所有現行 parser、transpiler、Workbench、CLI、LSP、MCP 歸入 EML-P。
4. EML-P 的核心目標是可用、可執行、可測試、可除錯。
5. EML-P 可以保守，但不得停止符號與結構壓縮。
6. 新語法進入 EML-P 前必須評估壓縮收益、歧義、學習與除錯成本。
7. EML-U 可實驗二維、多位置、通用語意與 AI 原生能力。
8. EML-P 必須是 EML-U 的穩定子集。
9. EML-U 降級到 EML-P 時不得靜默遺失語意。
10. 不得再把 Python 參考實作寫成 EML 的本體。

第一輪任務：

A. 修改 README，正式引入 EML-P／EML-U。
B. 將現行網站與 Workbench 標示為 EML-P。
C. 將目前符號入口標示為 EML-P Symbol Palette。
D. 建立 docs/EML-P-PROFILE.md。
E. 建立 docs/EML-U-PROFILE.md。
F. 建立 docs/EML-P-EML-U-COMPATIBILITY.md。
G. 保持所有既有測試通過。
H. 不在本輪大規模重構 parser。
I. 先完成 EML-P 的安裝、編輯、診斷與真實案例。
J. 將 EML-U 相關工程放在獨立 experimental 目錄。
```

---

# 15. 最終結論

EML 不需要在「可以使用」與「忠於原始願景」之間二選一。

正確方法是：

```text
EML-P
    解決現在可以用什麼

EML-U
    保存未來完整可以成為什麼
```

EML-P 接受工程現實：

- 線性；
- 低歧義；
- Python 優先；
- 容易測試；
- 容易整合；
- 逐步增加符號；
- 逐步增加宿主。

EML-U 保存原始 EML：

- 通用語意附加；
- 高密度符號；
- 二維結構；
- 多位置投影；
- 跨宿主；
- 跨媒介；
- AI 原生；
- 意圖級壓縮。

兩者並不互相否定。

$$
\boxed{
\mathrm{EML}
=
\mathrm{EML\text{-}P}
+
\mathrm{EML\text{-}U}
}
$$

其中：

$$
\mathrm{EML\text{-}P}
=
\text{穩定可執行子集}
$$

而：

$$
\mathrm{EML\text{-}U}
=
\text{完整通用語意超集}
$$

近期應先把 EML-P 做成真正能使用的產品；未來再讓 EML-U 在完整理論、語意中介表示與新型編輯器成熟後逐步實現。

這樣既不會再次讓 MVP 取代原始 EML，也不會因追求終極版本而使目前系統失去落地能力。

---

## 附錄 A：快速對照表

| 項目 | EML-P | EML-U |
|---|---|---|
| 核心目標 | 可用、可執行 | 通用、高密度 |
| 語法 | 線性文字 | 線性、二維、圖式 |
| 穩定性 | 高 | 實驗性 |
| Python | 主要 adapter | 其中一個 adapter |
| 符號 | 少量高收益 | 可擴展語意系統 |
| 編輯器 | 傳統 IDE 強化 | 新型語意介面 |
| 右上角 | 符號顯示／輸入 | 完整語意附加位置 |
| AI | 建議與工具調用 | 原生語意協作者 |
| Round-trip | 必須 | 視投影能力而定 |
| 商用優先 | 高 | 中長期 |
| 多媒體 | 不優先 | 正式範圍 |
| 意圖壓縮 | 有限 | 核心目標 |
| 宿主中立 IR | 可逐步接入 | 必須 |

## 附錄 B：推薦文件結構

```text
docs/
  EML-DUAL-PROFILE-ARCHITECTURE.md
  EML-P-PROFILE.md
  EML-P-LANGUAGE-SPEC.md
  EML-P-ROADMAP.md
  EML-P-SYMBOL-ADMISSION.md

  EML-U-PROFILE.md
  EML-U-SEMANTIC-CORE.md
  EML-U-OVERLAY-MODEL.md
  EML-U-PROJECTION-MODEL.md
  EML-U-ROADMAP.md

  EML-P-EML-U-COMPATIBILITY.md
  EML-HISTORY-AND-SOURCE-INDEX.md
```

## 附錄 C：短版對外說明

### 中文

> EML 採雙版本架構。EML-P 是目前優先完成的實用執行版，強調可用、可測試、可轉譯與可整合；EML-U 是原始通用語意版，保存高密度符號、語意附加、二維表示與 AI 原生能力。EML-P 是 EML-U 的穩定子集。

### English

> EML follows a dual-profile architecture. EML-P is the practical execution profile focused on usability, deterministic transpilation, testing, debugging, and integration. EML-U is the universal semantic profile preserving the original vision of semantic overlays, high-density symbolic representation, multidimensional syntax, and AI-native interaction. EML-P is a stable subset of EML-U.

---

**文件結束**
