# EML GitHub 單一儲存庫與雙 Agent Worktree 協作規範  
## Single Repository, Multi-Branch, Multi-Worktree Strategy v1.0

**文件編號：** EML-GIT-WORKTREE-STRATEGY-2026-v1.0  
**日期：** 2026-07-23  
**作者：** Neo.K（許筌崴）  
**組織：** EveMissLab／一言諾科技有限公司  
**文件狀態：** 架構決策／版本控制規範／本地 Agent 執行手冊  
**適用專案：** Efficient New Language（EML）  
**適用 Profile：** EML-P、EML-U、Shared Governance  

---

# 0. 決策摘要

EML 現階段正式採用：

```text
一個 GitHub Repository
＋
多個長期分支
＋
多個本地 Git Worktree
＋
兩個獨立 AI Agent
```

目前不採用：

```text
兩個獨立 GitHub Repository
```

也不採用：

```text
Fork
```

正式建議：

```text
Repository: efficientnewlanguage

Branches:
- main
- eml-p/development
- eml-u/research
- shared/governance
```

本地 Worktree：

```text
efficientnewlanguage/          主線與整合區
efficientnewlanguage-p/        EML-P Agent 工作區
efficientnewlanguage-u/        EML-U Agent 工作區
efficientnewlanguage-shared/   Shared Governance 工作區
```

核心理由：

$$
\mathrm{EML\text{-}P}\subseteq\mathrm{EML\text{-}U}
$$

EML-P 與 EML-U 不是兩個彼此獨立的產品，而是同一個 EML 架構中的不同 Profile。

因此目前最重要的不是把它們拆開，而是：

> **讓它們可以獨立施工，同時保有共享語意、共享映射、共享歷史與共享治理。**

---

# 1. 為什麼不是兩個 Repository

若現在拆成：

```text
efficientnewlanguage-p
efficientnewlanguage-u
```

短期看似乾淨，長期會立即產生同步問題。

例如：

```text
EML-P 新增符號
→ EML-U Capability Registry 需要更新

EML-U 新增語意原子
→ EML-P/U Mapping 需要更新

Universal IR 修改
→ 兩個 Repository 都需要同步

網站更新導航
→ 兩邊都可能被影響

README 修改定位
→ 需要決定哪一邊才代表完整 EML
```

這會重新產生過去最危險的問題：

```text
哪一份文件才是最新？
哪一份 Registry 才是正式？
哪一份 Mapping 才有權威？
哪一邊代表完整 EML？
```

目前 EML 最需要的是：

- 共用歷史；
- 共用本體；
- 共用映射；
- 共用決策紀錄；
- 共用網站；
- 共用 semantic registry；
- 共用部分測試與案例；
- 共用 release narrative。

因此現階段應維持單一 Repository。

---

# 2. 為什麼不是 Fork

Fork 適合：

- 外部貢獻者；
- 第三方衍生版本；
- 不同組織的權限隔離；
- 長期不一定會合併回上游；
- 不同授權；
- 不同產品與 release cycle；
- 公開版與私有版的強隔離。

EML-P 與 EML-U 並不符合這些條件。

兩者是同一專案中的兩個 Profile：

```text
EML-P
= 目前可執行、可測試、可展示的實用 Profile

EML-U
= 原始完整語意、本體架構與未來通用 Profile
```

使用 Fork 會造成：

- Issues 分裂；
- Pull Requests 跨 Fork；
- Actions 分裂；
- Secrets 分裂；
- Releases 分裂；
- Wiki／Projects 分裂；
- 文件版本落差；
- Agent 誤認為兩套獨立語言；
- Shared Registry 可能出現兩份來源；
- 上游／下游關係被錯誤套用。

因此 Fork 不適合作為目前的雙 Agent 協作方式。

---

# 3. 為什麼採用 Git Worktree

若兩個 Agent 共用同一個工作資料夾，只靠切換 branch，容易出現：

- Agent A 切換 branch 時影響 Agent B；
- 未提交變更阻止切換；
- build output 互相污染；
- node_modules、cache、coverage 混用；
- Agent 誤改另一條工作線檔案；
- 對話中斷後難以確認當前 branch；
- 多個終端機對同一 working tree 產生競爭；
- 暫存檔與測試結果互相覆蓋。

Git Worktree 可以讓同一個 Repository 同時擁有多個實體工作資料夾。

每一個工作區：

- 有自己的 branch；
- 有自己的檔案狀態；
- 有自己的未提交變更；
- 可以由不同 Agent 同時操作；
- 共用同一套 Git objects；
- 不需要複製完整 repository 歷史；
- 可以獨立安裝依賴與執行測試。

因此 Worktree 很適合：

```text
同一專案
＋
多條長期工作線
＋
多個本地 Agent
```

---

# 4. 正式 Branch 架構

## 4.1 `main`

定位：

```text
可整合
可發布
通過主要測試
文件與程式一致
```

`main` 不應作為 Agent 長期直接施工區。

允許：

- merge 經審查的 EML-P PR；
- merge 經審查的 EML-U PR；
- merge Shared Governance PR；
- release；
- hotfix；
- 最終網站部署。

不允許：

- 大量未規劃探索；
- 長期未完成重構；
- 無測試的新符號；
- 未標示狀態的 EML-U 概念；
- 直接讓兩個 Agent 同時修改。

---

## 4.2 `eml-p/development`

定位：

> EML-P 實用執行版的主要工程分支。

主要內容：

- parser；
- lexer；
- AST；
- semantic analysis；
- transpiler；
- Python adapter；
- C++ prototype；
- interpreter；
- trace；
- round-trip；
- corpus；
- benchmarks；
- Workbench；
- CLI／LSP／MCP；
- AI 學習資料；
- 商業展示。

主要 Agent：

```text
AI-P
```

主要驗收：

- 測試通過；
- corpus 擴張；
- benchmark 可重現；
- 無 silent semantic loss；
- 文件同步；
- 不破壞 P/U Mapping。

---

## 4.3 `eml-u/research`

定位：

> EML-U 通用語意原始版的主要研究分支。

主要內容：

- EML 1.0～1.5 歷史復原；
- 原始脈絡；
- 本體分層；
- 通用語意原子；
- 空間附加；
- 多位置語法；
- 二維／多維表示；
- Universal IR；
- 多語言投影；
- 多媒介投影；
- EML-U → EML-P 降階規則；
- 概念原型；
- 研究性展示。

主要 Agent：

```text
AI-U
```

主要驗收：

- 歷史脈絡可追溯；
- 概念有狀態標記；
- 不誤稱已實作；
- 不直接修改 production parser；
- 有 P/U Mapping；
- 有 loss model；
- 有本體分類；
- 不與既有符號無標記衝突。

---

## 4.4 `shared/governance`

定位：

> EML-P 與 EML-U 之間的共享治理與整合分支。

主要內容：

- `EML-INVARIANTS.md`；
- `EML-CAPABILITY-REGISTRY.md`；
- `EML-P-U-MAPPING.md`；
- `EML-DECISION-LOG.md`；
- `EML-CONFLICT-REGISTER.md`；
- shared Semantic IR；
- shared registry；
- root README；
- 網站共同導航；
- release positioning；
- breaking change proposal。

此分支不必由第三個 Agent 長期常駐。

可在需要時由：

- AI-P；
- AI-U；
- 審計 Agent；
- Neo.K；

進行短期協調。

---

# 5. 本地 Worktree 建立方式

以下命令假設目前已有本地 Repository：

```bash
cd path/to/efficientnewlanguage
```

首先確認主線：

```bash
git switch main
git pull origin main
```

建立分支：

```bash
git branch eml-p/development
git branch eml-u/research
git branch shared/governance
```

若遠端已存在分支，改用：

```bash
git fetch origin

git branch --track eml-p/development origin/eml-p/development
git branch --track eml-u/research origin/eml-u/research
git branch --track shared/governance origin/shared/governance
```

建立 Worktree：

```bash
git worktree add ../efficientnewlanguage-p eml-p/development
git worktree add ../efficientnewlanguage-u eml-u/research
git worktree add ../efficientnewlanguage-shared shared/governance
```

完成後：

```text
parent-directory/
├── efficientnewlanguage/
├── efficientnewlanguage-p/
├── efficientnewlanguage-u/
└── efficientnewlanguage-shared/
```

檢查：

```bash
git worktree list
```

預期可看到：

```text
.../efficientnewlanguage          [main]
.../efficientnewlanguage-p        [eml-p/development]
.../efficientnewlanguage-u        [eml-u/research]
.../efficientnewlanguage-shared   [shared/governance]
```

---

# 6. Windows PowerShell 範例

假設主 Repository 位於：

```text
D:\Projects\efficientnewlanguage
```

執行：

```powershell
cd D:\Projects\efficientnewlanguage

git switch main
git pull origin main

git branch eml-p/development
git branch eml-u/research
git branch shared/governance

git worktree add D:\Projects\efficientnewlanguage-p eml-p/development
git worktree add D:\Projects\efficientnewlanguage-u eml-u/research
git worktree add D:\Projects\efficientnewlanguage-shared shared/governance

git worktree list
```

之後可分別開啟三個終端機：

```powershell
cd D:\Projects\efficientnewlanguage-p
claude
```

```powershell
cd D:\Projects\efficientnewlanguage-u
claude
```

```powershell
cd D:\Projects\efficientnewlanguage-shared
claude
```

Shared 不需要常駐 Agent 時，可不啟動第三個工作階段。

---

# 7. 推薦 Repository 目錄結構

```text
efficientnewlanguage/
├── apps/
│   └── website/
│
├── packages/
│   ├── eml-p-core/
│   ├── eml-p-python/
│   ├── eml-p-cpp/
│   ├── eml-p-interpreter/
│   ├── eml-p-trace/
│   ├── eml-p-workbench/
│   ├── eml-u-experimental/
│   ├── semantic-ir/
│   └── shared-registry/
│
├── docs/
│   ├── eml-p/
│   │   ├── EML-P-PROFILE.md
│   │   ├── LANGUAGE-SPEC.md
│   │   ├── SYNTAX.md
│   │   ├── CORPUS-PLAN.md
│   │   ├── BENCHMARKS.md
│   │   └── IMPLEMENTATION-STATUS.md
│   │
│   ├── eml-u/
│   │   ├── EML-U-PROFILE.md
│   │   ├── HISTORICAL-CONTEXT.md
│   │   ├── ONTOLOGY.md
│   │   ├── SEMANTIC-PRIMITIVES.md
│   │   ├── SPATIAL-OVERLAY.md
│   │   ├── UNIVERSAL-IR.md
│   │   └── FUTURE-ROADMAP.md
│   │
│   └── shared/
│       ├── EML-INVARIANTS.md
│       ├── EML-CAPABILITY-REGISTRY.md
│       ├── EML-P-U-MAPPING.md
│       ├── EML-DECISION-LOG.md
│       ├── EML-CONFLICT-REGISTER.md
│       └── EML-AGENT-HANDOFF.md
│
├── corpus/
├── benchmarks/
├── experiments/
│   └── eml-u/
├── tests/
├── scripts/
├── README.md
└── CLAUDE.md
```

---

# 8. Agent 檔案權限邊界

## 8.1 AI-P 預設可修改

```text
packages/eml-p-*
docs/eml-p/
corpus/
benchmarks/
tests/eml-p/
apps/website/ 中的 EML-P 區域
```

AI-P 修改 shared 區域時必須：

1. 說明原因；
2. 更新 Decision Log；
3. 更新 P/U Mapping；
4. 建立獨立 commit；
5. 交由整合審查。

---

## 8.2 AI-U 預設可修改

```text
docs/eml-u/
experiments/eml-u/
packages/eml-u-experimental/
apps/website/ 中的 EML-U 區域
```

AI-U 不得直接修改：

```text
packages/eml-p-core/
production parser
production emitter
production interpreter
production release config
```

除非建立正式 Semantic Proposal，並由 EML-P 工作線接受。

---

## 8.3 Shared 區域

以下視為共享受控區：

```text
docs/shared/
packages/semantic-ir/
packages/shared-registry/
README.md
CLAUDE.md
apps/website/ 共同導航
release metadata
```

Shared 區域的 breaking change 必須由 Neo.K 或指定審核者批准。

---

# 9. Pull Request 流程

## 9.1 EML-P PR

來源：

```text
eml-p/development
```

目標：

```text
main
```

PR 最低內容：

```text
1. 本輪目標
2. 修改檔案
3. 新增案例
4. 新增測試
5. 壓縮數據
6. 是否影響 P/U Mapping
7. 是否影響 Shared Registry
8. 是否有 breaking change
9. 測試結果
10. 回滾方式
```

---

## 9.2 EML-U PR

來源：

```text
eml-u/research
```

目標：

```text
main
```

PR 最低內容：

```text
1. 新增或修正的概念
2. 歷史來源
3. 本體分類
4. 狀態：conceptual / specified / experimental
5. 是否有 prototype
6. 是否可映射至 EML-P
7. loss model
8. 是否影響符號語意
9. 是否影響 Universal IR
10. 是否需要 EML-P 後續實證
```

---

## 9.3 Shared PR

來源：

```text
shared/governance
```

目標：

```text
main
```

適用：

- P/U Mapping 更新；
- Capability Registry 更新；
- Invariants 更新；
- Universal IR breaking change；
- 網站整體定位；
- README 總定位；
- 版本命名；
- release governance。

---

# 10. 同步主線方式

每條長期分支必須定期吸收 `main`。

推薦：

```bash
git fetch origin
git merge origin/main
```

或團隊偏好 rebase 時：

```bash
git fetch origin
git rebase origin/main
```

但兩種策略必須固定，不應讓 Agent 自行混用。

建議現階段採 merge，因為：

- 歷史較容易追蹤；
- 對 Agent 較直觀；
- 不需頻繁重寫 commit；
- 對長期研究分支較安全；
- 衝突歷史可保留。

禁止：

```text
eml-p/development 直接 merge eml-u/research
```

也禁止：

```text
eml-u/research 直接 merge eml-p/development
```

正式路線：

```text
P branch → PR → main
U branch → PR → main
main → 定期同步回 P/U
```

---

# 11. Commit 規範

建議 prefix：

```text
feat(p):
fix(p):
test(p):
bench(p):
docs(p):

research(u):
spec(u):
proto(u):
docs(u):

shared:
mapping:
registry:
decision:
conflict:

site:
ci:
chore:
```

範例：

```text
feat(p): add corpus classifier for loop patterns
test(p): add round-trip cases for output expressions
bench(p): measure tokenizer compression on 500 samples

research(u): recover spatial overlay model from EML 1.2
spec(u): define semantic attachment primitive
proto(u): add experimental 2D overlay schema

mapping: map EML-P Σ to U aggregation primitive
registry: add CAP-AGGREGATE-001
decision: adopt loss-model classification
```

每個 commit 應盡量只處理一類變更。

禁止大型混合 commit：

```text
update everything
misc fixes
final
new version
```

---

# 12. `CLAUDE.md` 建議內容

Repository root 的 `CLAUDE.md` 應成為 Agent 路由與邊界文件，而不是塞入所有規格。

建議：

```md
# EML Agent Routing

## Profiles

- EML-P: Practical Execution Profile
- EML-U: Universal Semantic Profile
- EML-P is a currently executable subset of EML-U.

## Worktree Detection

Before any work:
1. Run `git branch --show-current`
2. Run `git status`
3. Identify current worktree
4. Read the corresponding profile instructions

## Branch Rules

### eml-p/development
Read:
- docs/eml-p/EML-P-PROFILE.md
- docs/shared/EML-INVARIANTS.md
- docs/shared/EML-P-U-MAPPING.md

Do not redefine EML-U.

### eml-u/research
Read:
- docs/eml-u/EML-U-PROFILE.md
- docs/eml-u/HISTORICAL-CONTEXT.md
- docs/shared/EML-INVARIANTS.md
- docs/shared/EML-P-U-MAPPING.md

Do not modify EML-P production runtime.

### shared/governance
Read all shared governance documents.
Do not make breaking changes without a decision record.

## Global Rules

- No silent semantic loss.
- Do not equate current implementation with complete ontology.
- Do not claim conceptual features are implemented.
- Record cross-profile conflicts instead of guessing.
```

---

# 13. Agent 啟動前檢查

每個 Agent 啟動後必須先執行：

```bash
git branch --show-current
git status
git log -5 --oneline
git worktree list
```

然後輸出：

```text
1. 目前 branch
2. 目前 worktree
3. 未提交變更
4. 最近五個 commit
5. 本輪負責 Profile
6. 可修改目錄
7. 禁止修改目錄
8. 預計驗收方式
```

若 branch 與任務不一致，Agent 必須停止施工。

例如：

```text
目前在 eml-u/research
但任務要求修改 production parser
```

正確行為：

```text
停止
→ 建立 Semantic Proposal
→ 交給 AI-P
```

不是直接跨界修改。

---

# 14. 防止兩個 Agent 互相覆蓋

## 14.1 不共用同一 Worktree

每個 Agent 必須打開不同資料夾。

錯誤：

```text
Agent A 與 Agent B 都在 efficientnewlanguage/
```

正確：

```text
Agent A → efficientnewlanguage-p/
Agent B → efficientnewlanguage-u/
```

---

## 14.2 Shared 檔案集中合併

若兩邊同時需要修改：

```text
docs/shared/EML-P-U-MAPPING.md
```

不要各自在自己的 branch 長期維護不同版本。

應：

1. 先各自提交 proposal；
2. 在 shared/governance 整合；
3. merge 到 main；
4. P/U 再同步 main。

---

## 14.3 不直接 cherry-pick 大量跨線 commit

少量獨立修復可以 cherry-pick。

大量功能不得透過 cherry-pick 偷渡跨 Profile。

若一項能力同時影響 P/U，應建立：

```text
shared decision
＋
separate P implementation
＋
separate U specification
```

---

# 15. CI 建議

單一 Repository 可使用 path-based CI。

## 15.1 EML-P CI

當以下路徑變更：

```text
packages/eml-p-*
tests/eml-p/
corpus/
benchmarks/
```

執行：

- typecheck；
- parser tests；
- transpiler tests；
- interpreter tests；
- round-trip tests；
- corpus tests；
- benchmark smoke test。

---

## 15.2 EML-U CI

當以下路徑變更：

```text
docs/eml-u/
experiments/eml-u/
packages/eml-u-experimental/
```

執行：

- schema validation；
- link validation；
- registry ID uniqueness；
- mapping completeness；
- prototype tests；
- status label validation；
- no accidental production dependency。

---

## 15.3 Shared CI

當以下路徑變更：

```text
docs/shared/
packages/semantic-ir/
packages/shared-registry/
README.md
```

執行：

- capability ID uniqueness；
- P/U Mapping reference validation；
- decision log schema；
- no missing loss model；
- no symbol collision；
- full integration test。

---

# 16. Release 策略

目前仍使用同一 Repository Release。

版本可以區分 Profile：

```text
EML-P v1.x
EML-U Research Preview 0.x
```

例如：

```text
EML-P v1.1.0
EML-U Research Preview 0.2
```

Repository tag：

```text
eml-p-v1.1.0
eml-u-preview-v0.2.0
```

Shared schema：

```text
eml-shared-schema-v0.3.0
```

EML-U 尚未成熟時，不應與 EML-P 使用相同穩定性承諾。

---

# 17. 何時才考慮拆成第二個 Repository

只有在 EML-U 出現明確產品與工程獨立性時才重新評估。

至少符合多項條件：

1. EML-U 已有獨立 runtime；
2. EML-U 有獨立大型二維編輯器；
3. 技術棧與 EML-P 明顯不同；
4. 有獨立 release cycle；
5. 有獨立套件與使用者；
6. Repository 體積明顯過大；
7. EML-U 實驗頻繁破壞 EML-P CI；
8. 需要不同授權；
9. 需要不同公開程度；
10. 需要不同團隊權限；
11. shared semantic registry 已形成穩定外部 API；
12. P/U 之間已可透過正式 protocol 互動。

屆時可考慮：

```text
efficientnewlanguage
→ EML-P、正式網站、共享標準

eml-universal-lab
→ EML-U、二維編輯器、Universal IR 實驗
```

但即使拆分，必須指定：

```text
Shared Registry 的唯一正式來源
```

不可讓兩個 Repository 各自維護一份。

---

# 18. 何時考慮 Fork

Fork 只用於：

- 外部社群貢獻；
- 第三方語言變體；
- 客戶專屬版本；
- 實驗性衍生專案；
- 不保證合併回主線的工作；
- 不同組織權限。

EML-P 與 EML-U 本身不使用 Fork 關係。

---

# 19. 首次建立工作流

建議實際順序：

## 第一步：備份與確認

```bash
git status
git log -10 --oneline
git remote -v
git branch -a
```

確認沒有未保存內容。

## 第二步：更新 main

```bash
git switch main
git pull origin main
```

## 第三步：建立遠端分支

```bash
git switch -c eml-p/development
git push -u origin eml-p/development

git switch main
git switch -c eml-u/research
git push -u origin eml-u/research

git switch main
git switch -c shared/governance
git push -u origin shared/governance

git switch main
```

## 第四步：建立 Worktree

```bash
git worktree add ../efficientnewlanguage-p eml-p/development
git worktree add ../efficientnewlanguage-u eml-u/research
git worktree add ../efficientnewlanguage-shared shared/governance
```

## 第五步：各自安裝依賴

視專案工具：

```bash
pnpm install
```

或：

```bash
npm install
```

每個 Worktree 可獨立安裝依賴，避免 build cache 互相干擾。

## 第六步：放入 Profile 指令

在各自工作區建立或更新：

```text
CLAUDE.md
docs/eml-p/AGENT-INSTRUCTIONS.md
docs/eml-u/AGENT-INSTRUCTIONS.md
```

## 第七步：啟動兩個 Agent

```text
AI-P
→ efficientnewlanguage-p/

AI-U
→ efficientnewlanguage-u/
```

## 第八步：Shared 僅在需要時啟動

```text
shared/governance
→ 重大映射、Registry、IR、README 或網站定位
```

---

# 20. 日常工作流程

## AI-P

```text
同步 main
→ 選取 EML-P 任務
→ 修改
→ 測試
→ benchmark
→ commit
→ push
→ PR 到 main
```

## AI-U

```text
同步 main
→ 選取 EML-U 研究節點
→ 建立規格或原型
→ 更新狀態
→ 更新 mapping proposal
→ commit
→ push
→ PR 到 main
```

## Shared

```text
收集 P/U proposal
→ 解析衝突
→ 更新 Registry / Mapping / Decision Log
→ commit
→ PR 到 main
```

---

# 21. 例外處理

## 21.1 AI-P 發現需要新增通用語意

不得直接定義 EML-U。

應建立：

```text
Empirical Pattern Proposal
```

並提交至：

```text
docs/shared/proposals/
```

---

## 21.2 AI-U 發現需要修改 parser

不得直接修改 EML-P production code。

應建立：

```text
Semantic Proposal
```

內容包括：

- 語意理由；
- 真實案例；
- 表面語法候選；
- 歧義；
- loss model；
- 建議測試。

交由 AI-P 評估。

---

## 21.3 同一檔案發生衝突

若為 shared 文件：

```text
不要在 P/U 分支各自強行解決
```

改由：

```text
shared/governance
```

統合。

---

## 21.4 Agent 修改錯誤分支

立即停止。

執行：

```bash
git status
git diff
```

若尚未 commit，可建立 patch：

```bash
git diff > accidental-change.patch
```

回復後，在正確 Worktree 套用：

```bash
git apply accidental-change.patch
```

若已 commit，可由正確分支 cherry-pick，但需要檢查是否跨越 Profile 邊界。

---

# 22. 清理 Worktree

查看：

```bash
git worktree list
```

移除不再使用的 Worktree：

```bash
git worktree remove ../efficientnewlanguage-u
```

若資料夾已手動刪除：

```bash
git worktree prune
```

不要直接刪除仍有未提交內容的 Worktree。

先檢查：

```bash
cd ../efficientnewlanguage-u
git status
```

---

# 23. 最低治理文件

在正式啟動雙 Agent 前，至少建立：

```text
docs/shared/EML-INVARIANTS.md
docs/shared/EML-CAPABILITY-REGISTRY.md
docs/shared/EML-P-U-MAPPING.md
docs/shared/EML-DECISION-LOG.md
docs/shared/EML-CONFLICT-REGISTER.md
```

以及：

```text
docs/eml-p/EML-P-PROFILE.md
docs/eml-u/EML-U-PROFILE.md
```

否則只有分支隔離，沒有語意治理，仍可能再次走偏。

---

# 24. 最終決議

EML 現階段採用：

```text
一個 Repository
＋
三條長期分支
＋
三個 Worktree
＋
兩個主要 Agent
＋
一個按需啟動的共享治理工作區
```

具體為：

```text
main
├── eml-p/development
├── eml-u/research
└── shared/governance
```

本地：

```text
efficientnewlanguage/
efficientnewlanguage-p/
efficientnewlanguage-u/
efficientnewlanguage-shared/
```

AI 分工：

```text
AI-P
→ EML-P 實作、案例、測試、壓縮、AI 學習、商業展示

AI-U
→ EML-U 歷史、本體、通用語意、空間附加、Universal IR

Shared
→ Registry、Mapping、Invariants、Decision Log、Conflict Resolution
```

最重要的治理原則是：

> **用 Worktree 分離施工環境，用 Branch 分離工作線，用 Shared Governance 維持同一個 EML。**

不使用兩個 Repository，是為了避免 EML-P 與 EML-U 過早分裂。

不使用 Fork，是因為兩者不是上下游衍生關係。

未來只有在 EML-U 形成獨立 runtime、獨立產品、獨立技術棧與獨立 release cycle 後，才重新評估第二個 Repository。

---

# 25. 一句話版本

> **現在用一個 GitHub Repository；EML-P 與 EML-U 各自在不同 Branch 與 Worktree 施工，Shared Governance 負責共同語意與整合。**
