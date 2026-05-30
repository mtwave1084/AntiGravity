# Session Handoff (AGY / Solitaire)

updated: 2026-05-30T14:53:00+09:00

このファイルは Solitaire 全体・メタ運用・コンテンツ制作系の引き継ぎ。
プロジェクト固有の引き継ぎは各プロジェクトの `.handoff.md` を参照する：
- `C:\Users\mt_wa\projects\Starry_hiking\.handoff.md`（今セッションは触っていない）

---

## 今セッションでやったこと

- `project_resource-usage.md` memory 更新 — 「Claude 枠節約のため」→「品質面（ダブルチェック・サンドボックス分離）のため」に理由差し替え
- Solitaire Migration Plan の Open Questions 確定
  - モードタグ → `[DEV-SOLITAIRE]`
  - ユリ → Antigravity 移行後もそのまま継続
  - GitHub リポ名 → 変える（まだ未実施）
  - Q1（履歴固定）・Q3（transcript 全コピー）→ ティア提案通りで確定
- **Solitaire Migration ステップ3 完了**（リクと協働）
  - `[DEV-AGY]` → `[DEV-SOLITAIRE]` 全置換
  - `# AGY プロジェクト` → `# Solitaire プロジェクト`（CLAUDE.md）
  - Gemini CLI 記述 → HTTP API（consult-antigravity 経由）に更新
  - 変更ファイル：CLAUDE.md / mode-tags.md / orchestrate.md / project-structure.md / ccc-boot / ccc-handoff / filesystem-cleanup / cli-maintenance / orchestrate/SKILL.md

---

## 引き継ぎタスク（次のセッションで続ける）

- [x] **Solitaire Migration ステップ4** — 完了（2026-05-31）
  - ディレクトリ rename 済み。memory は solitaire storage に自動生成済み

- [x] **Solitaire Migration ステップ5** — 完了（2026-05-31）
  - `settings.local.json` / `scripts/*.ps1` / `*.bat` / `*.sh` / スキルファイル全更新済み

- [ ] **GitHub リポ名変更**（ステップ5と並行でOK）
  - GitHub UI で `AntiGravity.git` → `Solitaire.git`（またはソリスが決めた名前）にリネーム
  - ローカル remote URL を更新：`git remote set-url origin <new-url>`

- [ ] **画像入力対応の追加実装（必要になったら）**
  - `consult-antigravity.sh` は画像未対応
  - Discord 添付画像の Gemini 解析タスクが来たら着手

- [ ] **6/19 以降の Gemini API キー失敗リスク監視**
  - HTTP エラーが連続したら IP / referrer 制限付きキーに再発行検討

- [ ] **6/18 Gemini CLI サブスク終了に合わせた deprecated 化判断**
  - 旧 `consult-gemini.ps1` は薄い shim として残置済み。CLI のアンインストール時期はソリスと相談

---

## 未完了のまま残っているもの

- Starry Hiking 側 Phase 3 UI 実装 / Phase 4 アセット制作（`Starry_hiking/.handoff.md` 参照）
- Solitaire 移行ステップ4以降（上記参照）

---

## メモ

### ステップ4の注意点（次回ティアへ）

- **ターミナルを完全に閉じてから**ディレクトリ rename をする（Claude Code が agy/ を握っているとリネームできない）
- rename は Windows エクスプローラーか PowerShell で手動実施。Claude Code は関与しない
- per-project storage のコピー先：`C:\Users\mt_wa\.claude\projects\C--Users-mt-wa-projects-solitaire\`
- コピー後に旧キー（`C--Users-mt-wa-projects-agy`）は削除しない。一定期間保持
- ステップ5は新ディレクトリで再起動後に ccc-boot が完了してから着手

### GitHub リポ名について

- ソリスが「変えたい」と確定。名前は `Solitaire` 系が自然
- GitHub UI でリネーム → ローカルで `git remote set-url origin` の順番
- GitHub はリダイレクトを残してくれるので急がなくてOK

### 今日のメモ

- ステップ3で気づいた：`orchestrate/SKILL.md` の `gemini --yolo` 呼び出し例は長らく放置されていた。今回の移行スキャンで初めて発見・修正
- `cli-maintenance` も Gemini CLI のバージョン確認コマンドがそのまま残っていた。リクの分析が拾ってくれた
