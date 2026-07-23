# EML-P：實用執行版（Practical Execution Profile）

> 完整背景見 `EML_Dual_Profile_Architecture_EML-P_EML-U_v1.0.md`（正式架構決策文件）。本文件是該決策文件裡 EML-P 章節的獨立摘要，方便直接連結、不用每次都翻整份架構文件。

## 定義

> EML-P 是 EML 的穩定、線性、低歧義、可執行 Profile。它以實際可用性、確定性、可測試性、可除錯性與既有語言互操作為優先。

EML-P 跟 **EML-U（通用語意原始版，見 `EML-U-PROFILE.md`）** 的關係是子集：

$$
\mathrm{EML\text{-}P} \subseteq \mathrm{EML\text{-}U}
$$

EML-P 是這個 repo 現行的一切——`packages/parser`、`packages/transpiler-python`、`packages/transpiler-eml`、`packages/transpiler-cpp`、`packages/interp`、`packages/trace`、`packages/lsp`、`packages/mcp`、`packages/workbench`、`packages/cli`、案例語料庫（目前 59+ 個）、Web Terminal（瀏覽器直譯 + Pyodide + Cloudflare Sandbox）——**全部正式歸類為 EML-P**，繼續施工，沒有因為 EML-U 的存在而停下來或被重寫。

## 核心優先順序（12 項，由上到下）

1. 可以安裝
2. 可以啟動
3. 可以寫
4. 可以解析
5. 可以轉譯
6. 可以執行
7. 可以測試
8. 可以除錯
9. 可以往返驗證（round-trip）
10. 可以整合編輯器
11. 可以提供 AI Agent 使用
12. 可以逐步進入實際專案

EML-P 不以「最少字元」為最高目標，而以**最小充分實用性**為目標。

## 設計原則

**原則一：保守不等於沒有壓縮。** 例如 `N^+100 / Σ(i^2, i in [1:N]) => r / r^0` 相較於等價的 Python 三行，仍然是明顯的壓縮。

**原則二：符號必須可解釋。** 每個 EML-P 符號都要有：唯一/高度穩定的核心語意、明確語法位置、明確結合優先序、明確輸入輸出、明確錯誤、明確宿主投影、明確測試。

**原則三：可讀性優先於極端縮短。** 採用一個新符號前應評估：

$$
V(s) = G_{\text{compression}} + G_{\text{semantic}} + G_{\text{workflow}} - C_{\text{ambiguity}} - C_{\text{learning}} - C_{\text{debug}}
$$

只有 $V(s)$ 顯著為正時，該符號才進入 EML-P。這個公式是 Phase P2（見下）評估新符號候選時的實際判準。

**原則四：線性文字為正式交換格式。** 可存為純文字、可 Git diff、可 CLI 操作、可跨平台、可被傳統 parser 解析、可用 ASCII fallback、Unicode 只是顯示/輸入層。

**原則五：確定性核心不可依賴 LLM。** `normalize → lex → parse → semantic analysis → emit → validate → execute → trace` 這條鏈必須確定性；AI 可以建議，不能取代 parser、驗證器與測試閘門。

## 現行元件對照表

| 現有項目 | EML-P 正式名稱 |
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

## 現行符號表

`eml-symbols.json`（repo 根目錄）是 EML-P 現行符號表，21 個符號：`^0` `^+` `^+=` `^-` `^*` `^/` `^T` `Σ` `∈` `and` `or` `not` `[:]` `=>` `?:` `<M>` `list^+` `def` `@cold` `@hot` `@temporal_loop` `await`。這份清單穩定，新符號候選走下面 Phase P2 的評估流程，不會回頭悄悄改變既有 21 個符號的語意。

## 後續路線圖（這一輪不做，記錄供之後參考）

- **Phase P1：實用編輯器** — 導入正式編輯器核心（Monaco/CodeMirror 類）、syntax highlighting、inline diagnostics、hover explain、completion、rename、format、多檔案專案。
- **Phase P2：高收益語法糖評估** — 候選符號：`?`（filter/guard）、`->`（map/transform）、`|>`（pipeline）、`!!`（assert/verify）、`@retry`、`@verify`、`@parallel`、`@memo`、`@pure`、`@effect`。每個候選都要跑過 $V(s)$ 公式跟歧義測試才能進 Phase P1 之後的正式符號表。
- **Phase P3：多宿主實用化** — Python adapter 完整化、C++ adapter 擴充、JavaScript/TypeScript adapter MVP、capability matrix、明確 unsupported 報告、cross-host conformance tests。
- **Phase P4：真實專案驗證** — CLI 工具、資料清理、API client、小型 Web 後端、遊戲邏輯、數學計算、Agent 工具、自動化腳本，至少各跑一個真實案例。
- **Phase P5：發佈與生態** — npm package、VS Code extension、standalone executable、GitHub templates、playground、conformance suite、migration guide。
