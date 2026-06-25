# eml-grammar.md

> **Superseded by [`EML-LANG-2026-v1.0.md`](EML-LANG-2026-v1.0.md) (v1.0, normative).**
> This v0.1 draft remains as Phase-0 background and rationale; where it disagrees with the v1.0
> spec (e.g. its EBNF predates decorator arguments / `async` / `await` / `^/`), the v1.0 spec wins.

# EML / Py⁺ MVP 語法規範 v0.1

**Project:** EML 2026 MVP
**Component:** Grammar + Symbol Specification
**File:** `eml-grammar.md`
**Status:** MVP Draft / 開發可用版
**Target Runtime:** Python 3.10+
**Primary Transpilation Target:** EML / Py⁺ → Python
**Purpose:** 定義 EML MVP 第一階段可實作、可測試、可轉譯的最小語法集合。

---

## 0. 本文件定位

本文件是 EML MVP 的第一份工程規格，用於指導以下元件開發：

1. `eml-symbols.json`：符號表與語意映射。
2. `py-plus-transcriber.ts`：EML / Py⁺ → Python 轉譯器。
3. `eml-cli`：命令列工具。
4. `eml-tests`：MVP 測試案例。
5. Cogni-Editor：符號態 / Python 展開態雙態視圖。
6. PHOSPHOR CTS：`symbolTable`、`commentTable`、`crossRefTable` 生成。

MVP 的目標是先建立一個可以執行的語法閉環：

```text
EML / Py⁺ Source
    ↓
Tokenizer
    ↓
Parser
    ↓
Normalized EML AST
    ↓
Python Transpiler
    ↓
Python Source
    ↓
Python Runtime
    ↓
Test / CTS / Editor Projection
```

---

## 1. 設計原則

### 1.1 MVP 優先

EML 的長期目標是高密度、機器友好、AI 協作式程式語言增益層。但 MVP 不追求一次完成全部語言能力，而是優先完成：

* 可輸入。
* 可解析。
* 可轉譯。
* 可測試。
* 可視覺化。
* 可被 Agent 修改。

### 1.2 ASCII Canonical Form 優先

EML 理論上允許右上角符號，例如：

```eml
x⁺¹⁰⁰
r₁⁰
mᵀ
```

但 MVP 的轉譯器以 ASCII canonical form 作為主要輸入格式：

```eml
x^+100
r1^0
m^T
```

原因：

1. 降低 tokenizer 複雜度。
2. 避免輸入法與 Unicode normalization 問題。
3. 方便 Git diff、測試、CI、Agent 編輯。
4. 允許 Nova IME / Cogni-Editor 在 UI 層做 Unicode 投影。

### 1.3 Unicode Display Form 作為投影層

| 語意        | ASCII Canonical      | Unicode Display  |
| --------- | -------------------- | ---------------- |
| 賦值 / 加法附加 | `x^+100`             | `x⁺¹⁰⁰`          |
| 輸出        | `x^0`                | `x⁰`             |
| 矩陣轉置      | `m^T`                | `mᵀ`             |
| 求和        | `Σ(i^2, i in [1:N])` | `Σ(i², i∈[1:N])` |

MVP parser 可以選擇支援部分 Unicode，但所有測試案例必須有 ASCII canonical equivalent。

---

## 2. 核心語法總覽

| 類型           | 範例                   | Python 輸出                          |
| ------------ | -------------------- | ---------------------------------- |
| 變數初始化 / 加法附加 | `x^+100`             | `x = 100` 或 `x += 100`             |
| 減法附加         | `x^-5`               | `x -= 5`                           |
| 乘法附加         | `x^*2`               | `x *= 2`                           |
| 輸出           | `x^0`                | `print(x)`                         |
| 指派           | `expr => y`          | `y = expr`                         |
| 條件           | `x > 40 ? A : B`     | `A if x > 40 else B`               |
| 求和           | `Σ(i^2, i in [1:N])` | `sum(i**2 for i in range(1, N+1))` |
| 區間           | `[1:10]`             | `range(1, 11)`                     |
| 矩陣定義         | `<M>(data)`          | `np.array(data)`                   |
| 矩陣轉置         | `m^T`                | `np.transpose(m)`                  |
| 函式呼叫         | `f^+(x,y) => r`      | `r = f(x, y)`                      |
| 列表定義         | `list^+[1,2,3]`      | `lst = [1, 2, 3]`                  |
| 函數定義         | `def f(x):` + 縮排區塊  | `def f(x):` + 縮排區塊                  |
| 回傳           | `return expr`        | `return expr`                      |
| 冷邏輯（可快取純函數）  | `@cold`              | `@functools.cache`                 |
| 熱狀態（動態／副作用）  | `@hot`               | `# @hot`（標記，不快取）                    |

---

## 3. EBNF 語法核心

```ebnf
Program ::= { Statement Newline? }

Statement ::= AssignmentStatement
            | OverlayStatement
            | OutputStatement
            | ExpressionStatement
            | FunctionDefinition   (* Phase 2 *)
            | ReturnStatement      (* Phase 2, 僅限函數內 *)
            | EmptyStatement

FunctionDefinition ::= { Decorator Newline } "def" Identifier "(" [ ParameterList ] ")" ":" Newline Block

Decorator ::= "@" Identifier            (* @cold | @hot 具語意；其他僅保留為註解 *)

ParameterList ::= Identifier { "," Identifier }

Block ::= Indent { Statement Newline } Dedent

ReturnStatement ::= "return" [ Expression ]

AssignmentStatement ::= Expression AssignArrow Identifier

AssignArrow ::= "=>" | "⇒"

OverlayStatement ::= Identifier OverlaySuffix
                   | Identifier OverlaySuffix ArgumentList
                   | Identifier OverlaySuffix ListLiteral

OverlaySuffix ::= "^" OverlayOperator OverlayPayload?

OverlayOperator ::= "+" | "-" | "*" | "/" | "0" | "T"

OverlayPayload ::= Number | Identifier

Expression ::= ConditionalExpression

ConditionalExpression ::= ComparisonExpression [ "?" Expression ":" Expression ]

ComparisonExpression ::= AdditiveExpression [ ComparisonOperator AdditiveExpression ]

ComparisonOperator ::= ">" | "<" | ">=" | "<=" | "==" | "!=" | "=" | "≠" | "≥" | "≤"

AdditiveExpression ::= MultiplicativeExpression { ("+" | "-") MultiplicativeExpression }

MultiplicativeExpression ::= PowerExpression { ("*" | "/") PowerExpression }

PowerExpression ::= PrimaryExpression [ "^" Number ]
                  | PrimaryExpression "²"

PrimaryExpression ::= Identifier
                    | Number
                    | String
                    | FunctionCall
                    | SumExpression
                    | MatrixExpression
                    | ListLiteral
                    | RangeExpression
                    | "(" Expression ")"

FunctionCall ::= Identifier "(" [ ArgumentList ] ")"
               | Identifier "^+" "(" [ ArgumentList ] ")"

ArgumentList ::= Expression { "," Expression }

SumExpression ::= "Σ" "(" Expression "," IteratorClause ")"

IteratorClause ::= Identifier InOperator RangeExpression

InOperator ::= "in" | "∈"

RangeExpression ::= "[" Expression ":" Expression "]"

MatrixExpression ::= "<M>" "(" Expression ")"
                   | "⟨M⟩" "(" Expression ")"

ListLiteral ::= "[" [ ArgumentList ] "]"
```

---

## 4. Overlay 語意規則

### 4.1 `^+n`：初始化 / 加法附加

```eml
x^+100
```

此語法存在語意歧義：

1. 如果 `x` 尚未在 symbol table 中出現，視為初始化。
2. 如果 `x` 已經存在，視為加法賦值。

```python
# x 未定義
x = 100

# x 已定義
x += 100
```

MVP 必須使用 symbol table 做 disambiguation。

### 4.2 `^-n`：減法附加

```eml
x^-5
```

輸出：

```python
x -= 5
```

### 4.3 `^*n`：乘法附加

```eml
x^*2
```

輸出：

```python
x *= 2
```

### 4.4 `^0`：輸出

```eml
x^0
```

輸出：

```python
print(x)
```

### 4.5 `^T`：矩陣轉置

```eml
m^T
```

輸出：

```python
np.transpose(m)
```

### 4.6 `^+(args)`：函式呼叫附加

```eml
f^+(x,y) => r
```

輸出：

```python
r = f(x, y)
```

此處 `^+` 不表示加法，而表示「啟動 / 調用」。MVP parser 必須根據後方是否接 `(` 判定。

---

## 5. MVP 14 個測試案例

| Case | Input                | Output                             |
| ---- | -------------------- | ---------------------------------- |
| 01   | `x^+100`             | `x = 100`                          |
| 02   | `x^0`                | `print(x)`                         |
| 03   | `Σ(i^2, i in [1:N])` | `sum(i**2 for i in range(1, N+1))` |
| 04   | `m^T`                | `np.transpose(m)`                  |
| 05   | `x > 40 ? A : B`     | `A if x > 40 else B`               |
| 06   | `f(x) => y`          | `y = f(x)`                         |
| 07   | `x^+10`              | `x += 10`                          |
| 08   | `x^-5`               | `x -= 5`                           |
| 09   | `x^*2`               | `x *= 2`                           |
| 10   | `i in [1:10]`        | `i in range(1, 11)`                |
| 11   | `Σ(i, i in [1:10])`  | `sum(i for i in range(1, 11))`     |
| 12   | `<M>(data)`          | `np.array(data)`                   |
| 13   | `f^+(x,y) => r`      | `r = f(x, y)`                      |
| 14   | `list^+[1,2,3]`      | `lst = [1, 2, 3]`                  |

---

## 6. 函數定義與冷熱分離（Phase 2 擴充）

Phase 2 為 EML 加入函數定義，並把 EML 1.5 的「冷熱分離」語意附加到函數節點上
（白皮書 §7）。函數採 Python 風格 `def` + 顯著縮排（建議用空白），body 內可使用
任何 EML overlay 運算式；以 `@cold` / `@hot` 裝飾器標記溫度。

```eml id="p2cold"
@cold
def square_sum(N):
    Σ(i^2, i in [1:N]) => r
    return r

square_sum(100) => total
total^0
```

轉譯為：

```python id="p2coldpy"
import functools

@functools.cache
def square_sum(N):
    r = sum(i**2 for i in range(1, N+1))
    return r

total = square_sum(100)
print(total)
```

### 6.1 縮排與區塊

* 行首空白具語意：縮排增加 → 進入區塊（INDENT）；縮排減少 → 離開區塊（DEDENT）。
* 空白行與註解行不影響縮排層級。
* 不一致的縮排（dedent 到不存在的層級）為詞法錯誤 `E_LEX`。
* 建議使用空白縮排；tab 以單一欄寬計算。

### 6.2 溫度語意（@cold / @hot）

| 裝飾器     | 語意                         | Python 對應                    |
| ------- | -------------------------- | ---------------------------- |
| `@cold` | 純邏輯、可快取、可結晶化               | `@functools.cache`           |
| `@hot`  | 含 I/O／副作用／動態狀態，不可任意快取      | `# @hot`（標記註解，不加快取）          |

* `@cold` 會自動收集 `import functools`。
* `@cold` 純函數檢查是**跨函數（interprocedural）**的：若函數本身含副作用
  （`print`、`open`、`input`、`requests`、`eval`、`exec`、`^0` 輸出，或
  `time`/`random` 等非決定性呼叫），**或**（遞移地）呼叫了 `@hot` 函數或其他帶
  副作用的函數，就會發出警告 `W_COLD_SIDE_EFFECT`（不阻擋轉譯）。使用者自定義
  函數會遮蔽同名內建（其純度由跨函數分析判定，不誤判為內建副作用）。
* 同時標記 `@cold` 與 `@hot` → 警告 `W_TEMP_CONFLICT`，以 `@cold` 為準。
* 未知裝飾器 → 警告 `W_UNKNOWN_DECORATOR`，僅以註解形式保留。
* 函數名稱與內建遮蔽別名衝突（例如命名為 `list`）→ 錯誤 `E_ALIAS_COLLISION`
  （否則 `def` 會被改名為 `lst` 但呼叫點仍指向 Python 內建，靜默誤譯）。
* 同一作用域重複定義同名函數 → 警告 `W_FN_REDECLARED`。

### 6.3 規則型結晶化與 importance

* **結晶化（AST cache）**：每個函數以「參數 + body」的結構雜湊為鍵（與名稱無關）。
  相同冷邏輯重複出現時標記為 cache hit（白皮書 §7.3）；輸出 Python 不受影響。
* **importance**：`score = w1·callFrequency + w2·riskLevel + w3·dependencyDepth`
  （白皮書 §8.5 降階版），輸出到 CTS 的 `functions[]`。

> 反向（Python→EML）在 Phase 2 維持 statement 層級，函數為單向構造，不參與
> round-trip 不變式。

### 6.4 時間迴圈（Phase 3，白皮書 §8.2）

`@temporal_loop` 讓函數能等待條件成熟而**不 busy wait**。採 Python 風格：帶
**關鍵字參數**的裝飾器 + `async def` + `await temporal_wait(...)`。

```eml id="p3temporal"
@temporal_loop(max_wait=3600, check_interval=60, timeout_action="return")
async def wait_for_confirmation(flag):
    await temporal_wait(flag)
    return flag
```

* 裝飾器參數：`max_wait`、`check_interval`、`timeout_action`（`"raise"` 預設／`"return"`）。未知參數 → 警告 `W_TEMPORAL_ARG`。
* `@temporal_loop` 需配 `async def`，否則 → 警告 `W_TEMPORAL_NOT_ASYNC`。
* 轉譯時，若程式用到 `@temporal_loop`，會注入一段**自包含的 asyncio 執行期**
  （`DelayedDecisionQueue` / `temporal_loop` / `temporal_wait` / `run_temporal`），
  使 `eml run` 仍是可直接執行的獨立 Python。
* 執行期以 `phosphor-jsonl-v1` 發出 `eml:temporal:start/wait/resolved/timeout/done`
  事件到 stderr（解耦，PHOSPHOR/NOEMA 可讀）。
* `run_temporal(fn, args…)` 在頂層驅動非同步函數（= `asyncio.run`），便於 demo。
* 與函數一樣為**單向構造**（反向 Python→EML 不支援 async/await）。

### 6.5 迴圈分類 metadata（Phase 4，白皮書 §8.4）

「十二種迴圈」的 MVP 降階：不做 runtime，只在分析時為每個迴圈型構造標上
`loopKind` 與 `deterministic`／`terminating` 旗標，輸出到 CTS 的 `loops[]`
（`eml explain` / `eml cts` 可見）。目前可標記的種類：

| 構造 | loopKind | deterministic | terminating |
| --- | --- | --- | --- |
| `Σ(...)` | `algebraic_sum` | 是 | 是 |
| `i in [a:b]`（區間迭代） | `basic_repeat` | 是 | 是 |
| `@temporal_loop` 函數 | `temporal` | 否 | 是（max_wait 上界） |
| 自我／互相遞歸函數 | `recursive` | 是 | 否（無法靜態證明終止） |

旗標為粗略的結構性啟發式（非形式化證明）；未來再擴展到事件／收斂／演化等其餘迴圈種類。

---

## 7. 結論

EML MVP 的第一步不是創造一個完整新語言，而是創造一個穩定、可測試、可被 AI Agent 操作的語意附加層。

本語法規範採用以下策略：

```text
先 ASCII canonical
再 Unicode projection

先 14 個可跑案例
再擴展語法系統

先 Python transpilation
再多語言後端

先規則型 AST
再 AI 壓縮與結晶化
```
