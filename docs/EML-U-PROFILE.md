# EML-U：通用語意原始版（Universal Semantic Profile）

> 完整背景見兩份 2026-07-23 的架構文件：
> - `EML_Dual_Profile_Architecture_EML-P_EML-U_v1.0.md`（正式架構決策文件——EML-P/EML-U 雙版本切分本身）
> - `EML_Universal_Semantic_Overlay_2026_v2.0.md`（架構重置版——EML-U 的**深層形式模型**：§4 形式模型 $(H,A,S,R,P,X,O)$、§5 分層架構 Layer 0-7、§6 Canonical Semantic IR schema、附錄 B 的 TypeScript 介面草案）
>
> 本文件是這兩份文件裡 EML-U 章節的獨立摘要，方便直接連結。**做任何 EML-U 實際工程之前，先回去讀 `EML_Universal_Semantic_Overlay_2026_v2.0.md` 的完整形式模型**，這裡只列重點，不重複完整定義。

## 定義

> EML-U 是 EML 原始理論的完整 Profile。它以通用語意附加、高密度符號、結構壓縮、意圖壓縮、非線性表示、跨宿主與 AI 原生協作為核心。

$$
\mathrm{EML\text{-}P} \subseteq \mathrm{EML\text{-}U}
$$

EML-P（見 `EML-P-PROFILE.md`）是 EML-U 的穩定、線性、低歧義、工程化子集；EML-U 是完整 EML 的長期架構與研究空間。

## ⚠️ 現況：這是理論封存階段，還沒有任何實作

截至本文件建立時，**EML-U 沒有自己的程式碼、沒有獨立的 engineering 目錄**。EML-U 自己的 Phase U0（理論封存）都還沒開始：

1. 保存所有原始 EML 文件（`EML_Universal_Semantic_Overlay_2026_v2.0.md` §0.1 列了 12 份歷史文件，例如《高效新語言完整技術與商業整合文件》《EML 1.5 終極版：時間感知的自適應程式語言範式》等——這些文件目前的實際存放位置**還沒盤點確認**，可能在 Neo 自己的研究資料夾裡，不在這個 git repo 中）；
2. 建立版本時間線；
3. 標記原始概念哪些已實作、哪些未實作；
4. 不再讓 EML-P 的文件覆蓋 EML-U 的理論。

這四件事都不是這一輪的範圍，留給 EML-U 自己真正啟動時處理。

## EML-U 要保留的原始能力（現階段只是「不遺忘」，不是「已實作」）

- 右上角語意附加，以及左上、右下、左下等多位置附加
- 上方/下方語意層
- 二維語法、非線性閱讀順序
- 語意圖（Semantic Graph）
- 多層符號、結構折疊
- 意圖節點
- 宿主中立 Semantic IR
- 多宿主投影（同一語意 → Python / C++ / JS / 自然語言說明 / Agent JSON 等不同投影）
- 自然語言附加（例如「下週完成初版」附加 deadline 語意）
- 資料欄位附加（單位、型別、來源、隱私、品質等）
- 工作流節點附加（可重試、冪等、需人工確認、風險、成本等）
- 多媒體時間與空間附加（音訊、圖片、影片時間軸、3D 場景、遊戲世界）
- AI 自適應顯示、領域專用語意包、多種閱讀者投影

## EML-U 的工程約束（就算實驗性也要守住）

EML-U 可以比 EML-P 更激進（新符號、二維語法、新宿主、新語意節點都可以試），但不能失去：語意識別、來源追蹤（provenance）、作用域（scope）、權限、約束、可驗證性、可降級性、版本控制、明確 unsupported、明確 implementation status。EML-U 不是自由符號塗鴉，而是比 EML-P 更高階的語意系統。

## 降級關係（跟 EML-P 的橋樑，完整規則見 `EML-P-EML-U-COMPATIBILITY.md`）

$$
\Pi_P : \mathrm{EML\text{-}U} \rightarrow \mathrm{EML\text{-}P} \cup \mathrm{Metadata} \cup \mathrm{Unsupported}
$$

任何 EML-U 結構，能完整降級的轉成 EML-P；不能執行但能保存的轉成 EML-P + metadata；無法安全表達的明確標示 unsupported——**不允許靜默遺失**。

## 後續路線圖（EML-U 自己的 U0-U4，跟第一份文件裡「整個系統」的 U0-U6 是不同的編號，不要混用）

- **Phase U0：理論封存** — 上面「現況」列的 4 件事。
- **Phase U1：語意本體** — Semantic ID、Anchor Model、Overlay Node、Projection、Policy、Provenance、Semantic Graph（形式定義見 `EML_Universal_Semantic_Overlay_2026_v2.0.md` §4、附錄 B）。
- **Phase U2：二維與多位置語法** — 右上/左上/上下層、二維流程、多層附加、折疊節點、Graph projection。
- **Phase U3：跨宿主** — 程式碼、自然語言、表格、JSON、工作流、圖像、音訊、影片、遊戲世界。
- **Phase U4：AI 原生介面** — Agent semantic graph、intent compression、adaptive projection、semantic negotiation、human/AI dual view、dynamic symbol recommendation、formal validation gates。

按照雙版本文件 §14 的原則：**EML-U 相關工程未來應該放在獨立的 experimental 目錄**，不跟 EML-P 現行的 `packages/*` 混在一起。
