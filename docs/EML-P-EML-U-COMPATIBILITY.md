# EML-P ↔ EML-U 相容性規範

> 來源：`EML_Dual_Profile_Architecture_EML-P_EML-U_v1.0.md` §3、§11。這份文件只講兩個 Profile 之間的關係——各自是什麼，見 `EML-P-PROFILE.md` 跟 `EML-U-PROFILE.md`。

## 正式關係：子集

$$
\mathrm{EML\text{-}P} \subseteq \mathrm{EML\text{-}U}
$$

- 每個 EML-P 程式都應具有 EML-U 語意表示；
- EML-U 可以包含 EML-P 尚未支援的語意；
- EML-P 是穩定執行子集；
- EML-U 是完整語意超集。

## 投影關係

EML-P 可被視為 EML-U 的一種線性投影：

$$
\Pi_P : \mathrm{EML\text{-}U} \rightarrow \mathrm{EML\text{-}P} \cup \mathrm{Metadata} \cup \mathrm{Unsupported}
$$

對任意 EML-U 結構：

1. 可以完整降級者，轉為 EML-P；
2. 不能執行但可保存者，轉為 EML-P + metadata；
3. 無法安全表達者，明確標示 unsupported。

## 不允許靜默遺失

例如 EML-U 中存在多層右上附加、二維分支、視覺因果連線、動態權限、語意信心等——若 EML-P 無法表示，**不得只留下表面程式碼而刪除其他語意**。必須輸出類似：

```json
{
  "status": "partial_projection",
  "preserved": ["core_operation"],
  "metadata": ["confidence", "authority"],
  "unsupported": ["two_dimensional_branch"]
}
```

這個結構化結果本身還沒有實作（EML-U 還在理論封存階段），但**任何未來把 EML-U 結構降級到 EML-P 的程式碼，都要遵守這個「明確回報，不悄悄丟掉」的規則**——這是這份文件現在就先立下的硬性要求，不等 EML-U 開始寫程式才補。

## 版本依賴方向

**允許：**
- EML-U 理解 EML-P
- EML-U 匯入 EML-P
- EML-U 生成 EML-P

**不允許：**
- EML-P 規格反過來刪除 EML-U 理論
- EML-P parser 能力定義 EML-U 的全部邊界（也就是：EML-U 的邊界不能被「目前 EML-P parser 恰好能解析什麼」反推定義——這正是這整套雙版本架構要修正的舊問題）

## 穩定性規則

**EML-P 穩定性：** EML-P 正式語法不得任意改義、不得因 EML-U 實驗而破壞、需要 deprecation 流程、需要 migration、需要維持 round-trip 跟既有測試全過。

**EML-U 實驗性：** EML-U 可以更換投影、新增符號、嘗試二維語法、引入新語意節點、測試新宿主、測試 AI 介面——但每次變更必須保存 version、semantic ID、migration、compatibility notes、degradation behavior。

## 互通格式（建議，EML-U 開始寫程式時採用）

```json
{ "eml_family": "EML", "profile": "P", "version": "1.0", "semantic_ir_version": "2.0" }
```

```json
{ "eml_family": "EML", "profile": "U", "version": "0.2", "semantic_ir_version": "2.0" }
```

## 驗收標準（雙版本，來自架構文件 §13.3）

以下敘述必須同時成立：

1. 現有 EML-P 不再宣稱等於全部 EML；
2. EML-U 不再被現行 parser 邊界覆蓋；
3. EML-P 程式可進入 EML-U IR；
4. EML-U 降級不會靜默丟失；
5. 文件與網站清楚區分兩個版本；
6. Symbol Palette 與 Semantic Overlay 清楚區分；
7. Python 是 adapter，不是全部 EML；
8. EML-P 仍持續進行有效壓縮。
