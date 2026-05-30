# AGY Project Overview
_AntiGravity によるメタ視点監査用ドキュメント_
_生成: 2026-04-02 / リク（Codex CLI）+ ティア（Claude Code）_

---

## 1. このリポジトリの性格

**AGY は「アプリ本体」より「AIエージェント運用基盤 + 成果物保管庫」の性格が強い。**

- コードプロジェクト（Remotion動画、Banana Shaker等）と、AIエージェント運用ルール・生成物が同一リポジトリに混在
- 監査の中心はコード品質だけではなく、`.claude/rules/orchestrate.md` と `.claude/rules/discord-behavior.md` にある**運用プロトコル**
- 日本語ルール + キャラクター運用 + 複数エージェント協調という独自設計のため、一般的なソフトウェア監査より「人間運用プロトコルの理解」が重要

---

## 2. ディレクトリ構成と役割

```
agy/
├── .claude/           ← Claude Code 運用中枢（最重要）
├── .agent/            ← AntiGravity 管理領域（触らない）
├── .codex/            ← Codex CLI 設定（触らない）
├── .gemini/           ← Gemini CLI 設定（触らない）
├── .cursor/           ← Cursor IDE（触らない）
├── .git/              ← Git（触らない）
├── .ai-consults/      ← Gemini/Codex 相談ログ（監査証跡）
│
├── Contents/          ← 成果物・生成物の主置き場
│   ├── AINews/            AIニュース HTML + index.md
│   ├── Brain参考記事/     Brain記事の文体・構成参照元
│   ├── knowledge/         ナレッジ素材
│   ├── ObsidianExport/    Obsidian エクスポート素材
│   ├── ObsidianVault/     プロジェクト固有ノート
│   └── *.html / *.md      調査レポート・計画書・成果物
│
├── assets/            ← 画像・スクリーンショット
├── scripts/           ← 運用スクリプト（consult系・起動・停止）
│
├── remotion-project/  ← Remotion 動画フレームワーク
├── mv-project/        ← MV プロジェクト
├── soli-tear-mv/      ← ソリティア MV
├── Banana Shaker/     ← 別系統 Next.js アプリ（SQLite DB含む）
│
├── CLAUDE.md          ← Claude Code 行動規約（必読）
├── JOBS.yaml          ← 定期実行ジョブ定義
├── SOUL.md            ← エージェントキャラクター定義インデックス
└── credentials.json   ← 機密（読み取り注意）
```

---

## 3. `.claude/` の全体像（運用中枢）

### ルール層（`.claude/rules/`）

| ファイル | 役割 |
|---------|------|
| `orchestrate.md` | Claude/Codex/Gemini の役割分担・委譲条件の**中核** |
| `discord-behavior.md` | Discord を唯一の確認窓口とする運用ルール |
| `autonomy-limits.md` | 自律実行の上限・再試行回数・停止条件 |
| `project-structure.md` | 生成物の配置先と「触らないディレクトリ」の定義 |
| `gemini-codex-hooks.md` | Gemini/Codex 使用後に必ず議事録化するフック |
| `self-improvement.md` | memory / retrospective / handoff への反映規則 |
| `content-writing.md` | Brain 記事などの執筆規約 |

### スキル層（`.claude/skills/`）

| スキル | 役割 |
|-------|------|
| `orchestrate/` | Claude/Codex/Gemini へのタスク振り分け |
| `ai-news/` | AIニュース収集・HTML生成・Discord送信・index.md更新 |
| `write-brain-article/` | Brain 向け販売記事生成 |
| `task-report/` | タスク完了後の HTML レポート生成 |
| `write-minutes/` | Gemini/Codex 協業ログの Obsidian 議事録化 |
| `ccc-boot/` | セッション起動・引き継ぎ確認 |
| `ccc-jobs/` | JOBS.yaml からの定期ジョブ登録 |
| `ccc-handoff/` | セッション終了・状態保存 |
| `ccc-heartbeat/` | 30分ごとの死活監視・retrospective |
| `agent-reach/` | Gemini 障害時や一次ソース取得の代替経路 |
| `discord-channels-setup/` | Discord MCP のセットアップ |
| `character-persona/` | AIキャラクター人格設定の作成・対話 |

### 設定・状態ファイル

| ファイル | 内容 |
|---------|------|
| `settings.local.json` | 許可ツール・SessionStart/Stop フック定義 |
| `handoff.md` | 継続案件と次セッションへの引き継ぎ（頻繁に更新） |
| `souls/tear.md` | ティア（Claude）の人格設定 |
| `souls/yuri.md` | ユリ（Gemini）の人格設定 |
| `souls/riku.md` | リク（Codex）の人格設定 |
| `ccc-session.pid` | 実行中プロセスID |
| `scheduled_tasks.lock` | 定期ジョブ実行状態 |

---

## 4. エージェント間の役割分担

```
ユーザー（ソリス）
       ↓
  ティア（Claude Code）— 司令塔・設計判断・最終統合・Discord窓口
       ├─→ ユリ（Gemini CLI）— 調査・要約・SNS/YouTube/Webリサーチ
       └─→ リク（Codex CLI）— 実行・検証・ファイル操作・ビルド確認
```

### ティア（Claude Code）
- 設計の最終決定・複数エージェント出力の統合・ユーザー文脈依存の判断
- スキル・ルール・Discord運用の中核を担う

### リク（Codex CLI）
- **実行系タスクのデフォルト担当**
- ファイル操作・コマンド実行・ビルド/lint/test・構造分析・adversarial review
- `scripts/consult-codex.ps1` または Bash 直接呼び出し
- 相談ログは `.ai-consults/codex-{timestamp}.md` に保存

### ユリ（Gemini CLI）
- Webリサーチ・SNS/YouTube/Brain 系の最新トレンド探索
- ハルシネーション前提で、Claude または Codex による検証が設計上要求されている
- `scripts/consult-gemini.ps1` または Bash 直接呼び出し
- 相談ログは `.ai-consults/gemini-{timestamp}.md` に保存

---

## 5. 主なワークフロー

### AIニュース（毎朝 7:30 自動実行）
```
JOBS.yaml → CronCreate → /ai-news スキル
  → index.md で重複確認
  → Gemini + WebSearch でリサーチ
  → Claude が整理・HTML生成
  → Contents/AINews/ai-news-{date}.html 保存
  → Discord に HTML 添付で完了報告
```

### コンテンツ生成（Brain記事等）
```
ユーザー依頼 → /write-brain-article
  → Brain参考記事/ でスタイル参照
  → Gemini で市場調査（必要時）
  → Opus でターゲット・構成設計
  → Sonnet で執筆
  → /task-report で HTML レポート化
```

### Discord 連携
- Discord は**唯一の確認窓口**（ターミナル停止では承認待ちにならない設計）
- 長い作業はバックグラウンド実行、完了時は新規メッセージで通知（push通知のため）
- 破壊的操作前の確認は Discord 必須
- 起動方法: `scripts/start.bat` 経由でのみ Discord MCP が有効（IDE直起動は不可）

### エージェント協調後の処理
- Gemini/Codex 使用後は **経路に関係なく必ず** `/write-minutes` で議事録化
- 保存先: `C:\Users\mt_wa\Obsidian\99_Insights\minutes-{date}-{slug}.md`

---

## 6. 触ってよいファイル / 触ってはいけないファイル

### 触ってよい
- `Contents/` 配下の生成物・記事・HTML・素材
- `assets/`
- `scripts/`（運用スクリプト）
- `remotion-project/`, `mv-project/`, `soli-tear-mv/`, `Banana Shaker/`（各プロジェクトコード）
- `JOBS.yaml`
- `.ai-consults/`（読み取り専用が望ましい）

### 原則触らない
| パス | 管理ツール |
|-----|---------|
| `.claude/` | Claude Code |
| `.agent/` | AntiGravity |
| `.git/` | Git |
| `.codex/`, `.cursor/`, `.gemini/` | 各 CLI ツール |

### 特に慎重に扱うべき機密ファイル
- `credentials.json`（Google Drive 等の認証情報）
- `Banana Shaker/.env`（環境変数）
- `Banana Shaker/banana.db` + WAL/SHM（SQLite DB）
- `.claude/settings.local.json`（Stop フックで会話保存が走る）
- `.claude/handoff.md`（セッション間引き継ぎ状態）

---

## 7. AntiGravity が監査するなら — 推奨優先順位

### 読む順番

1. `CLAUDE.md` — 行動規約全体
2. `.claude/rules/orchestrate.md` — 実質的な運用OS
3. `.claude/rules/discord-behavior.md` — 確認フローの設計思想
4. `.claude/rules/autonomy-limits.md` — 停止条件・安全装置
5. `.claude/rules/project-structure.md` — ファイル配置ルール
6. `.claude/skills/ai-news/SKILL.md`, `task-report/SKILL.md`, `write-minutes/SKILL.md` — 主要スキル
7. `JOBS.yaml` + `.claude/settings.local.json` — 自動化の定義
8. `Contents/` + `.ai-consults/` — 実例確認

### 注目ポイント

- **`orchestrate.md` が実質的な運用OS**。ここが壊れると全体オーケストレーションが崩れる
- **Discord が確認チャネル**であり、ターミナル停止では承認待ちにならない設計
- **Gemini の結果をそのまま採用せず** Codex/Claude で検証する二重化思想
- **`write-minutes` と `.ai-consults/`** による監査証跡の保存
- **`task-report`** により成果物が `Contents/` に HTML として蓄積される

### リスク観点

- 運用ルールが `.claude/` に強く集中しており、ここが破損すると全体に波及
- 生成物・実プロダクト・運用ログ・人格設定が同一リポジトリに混在
- `Banana Shaker/` のような別アプリ資産と AGY 運用ルールが同居しており、監査範囲を誤ると誤検知や不要変更につながる
- `credentials.json` / DB / Obsidian 外部保存パスがあり、read-only 監査でもパス解決・内容露出の境界を明確にすべき

---

_作成: ティア（Claude Code claude-sonnet-4-6） + リク（Codex CLI gpt-5.4）_
_リクの分析ログ: `.ai-consults/codex-20260402-*.md`_
