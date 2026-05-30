# ティア スキルマップ

> 作成: 2026-03-28
> 目的: 実装済みスキル・ルール・ジョブの全体俯瞰 + 将来のサブエージェント割り振り計画

---

## 現状サマリー

現在は **ティア（Claude Code）** がすべてのスキルを保有。
将来的にはサブエージェントへの機能委譲を想定したマッピングを下段に記載。

---

## スキル一覧

### コア基盤スキル（セッション管理）

| スキル名 | トリガー | 概要 | 現オーナー |
|---------|---------|------|----------|
| `ccc-boot` | SessionStart / start.bat 起動時 | SOUL.md読み込み・handoff確認・Discord起動報告・heartbeat登録・JOBS登録 | ティア |
| `ccc-heartbeat` | Cron `*/30 * * * *` | Discord疎通確認・異常検知・軽量retrospective（memory→スキル反映チェック） | ティア |
| `ccc-handoff` | 「終わり」「おやすみ」など | セッション状態保存・handoff.md書き込み・retrospective実行・Discord終了報告 | ティア |
| `ccc-jobs` | ccc-boot から呼び出し | JOBS.yaml を読み込み active なジョブを CronCreate 登録 | ティア |

### オーケストレーションスキル

| スキル名 | トリガー | 概要 | 現オーナー |
|---------|---------|------|----------|
| `orchestrate` | 外部エージェントが必要と判断したとき | Claude/Codex/Gemini の役割分担・ルーティング・品質確認・統合。5ステップフロー | ティア |
| `skill-creator` | スキル作成・改善・評価を依頼されたとき | スキルの新規作成・改善・eval実行・パフォーマンス計測 | ティア |

### コンテンツ生成スキル

| スキル名 | トリガー | 概要 | 現オーナー |
|---------|---------|------|----------|
| `ai-news` | 「AIニュース調べて」/ Cron 毎朝7:30 | Gemini+WebSearch で最新AIニュース収集・重複排除・HTML生成・Discord送信 | ティア |
| `write-brain-article` | 「記事を書いて」「Brain記事」 | Brain向けセールス記事をユニコスタイルで生成。Phase1(Opus:設計)→Phase2(Sonnet:執筆) | ティア |
| `task-report` | 「〜したい。具体的には〜」パターン | タスク実行後にタイプ別HTMLレポート自動生成・Discord送信（contentタイプはmd+html両方添付） | ティア |
| `suno-composition` | Suno AI楽曲制作を依頼されたとき | Suno AIでの楽曲制作ガイド・プロンプト構築・ジャンル選択ベストプラクティス | ティア |
| `today` | 「今日は何の日」「今日って何の日」 | WebSearchで今日の日付・曜日・記念日・イベントを調べてティアとして返答 | ティア |

### システム・インフラスキル

| スキル名 | トリガー | 概要 | 現オーナー |
|---------|---------|------|----------|
| `filesystem-cleanup` | 「ファイル整理して」「散らかってる」 | 調査→HTMLプラン→実行→サマリーHTML の4ステップで安全にファイル整理 | ティア |
| `discord-channels-setup` | 「Discord チャンネル設定して」 | Claude Code Discord Channels 機能のセットアップ | ティア |

---

## ルール一覧

ルールはスキルではなく **常時適用される行動指針**。

| ファイル | 適用範囲 | 概要 |
|---------|---------|------|
| `rules/content-writing.md` | `Contents/**/*.md` | Brain記事の構成パターン・トーン・禁止事項・構成案先出しルール |
| `rules/orchestrate.md` | オーケストレーション全般 | エージェント起動条件・ルーティング競合ルール・Sandbox昇格条件・調査依頼の粒度指定 |
| `rules/project-structure.md` | ファイル配置全般 | ディレクトリ構成・配置ルール・触らないディレクトリ一覧 |
| `rules/self-improvement.md` | 常時（タスク中・heartbeat・明示的リクエスト・handoff時） | memory自動保存・定期retrospective・スキル/ルールへの反映フロー |

---

## 定期ジョブ（JOBS.yaml）

| ジョブ名 | スケジュール | 実行スキル | 概要 |
|---------|------------|---------|------|
| `morning-ai-news` | 毎朝 7:30 | `ai-news` | 毎日のAIニュース自動収集・Discord送信 |

---

## 外部エージェント・MCP

| 名前 | 種別 | 役割 | 呼び出し方 |
|-----|------|------|-----------|
| Codex CLI | サブエージェント | 実行・検証係（コード実行・環境構築・CLI操作） | `scripts/consult-codex.sh` / `.ps1` |
| Gemini CLI | サブエージェント | 調査・要約係（Webリサーチ・SNS・YouTube） | `scripts/consult-gemini.ps1` / `gemini --yolo` |
| discord MCP | MCP | Discord送受信（fetch_messages / reply / react / edit） | `mcp__discord__*` ツール |

---

## 将来のサブエージェント割り振り案

現在は全スキルをティアが保有しているが、以下の方向性でサブエージェントへの委譲を想定。

### 案：役割ベースの3エージェント構成

```
ティア（司令塔）
├── コア基盤スキル（ccc-boot / ccc-heartbeat / ccc-handoff / ccc-jobs）
├── オーケストレーション（orchestrate / skill-creator）
└── ユーザーとのコミュニケーション窓口

コンテンツエージェント（未定名）
├── ai-news
├── write-brain-article
├── task-report
├── today
└── suno-composition

システムエージェント（未定名）
├── filesystem-cleanup
└── discord-channels-setup
```

### 割り振り判断の観点

| 観点 | 説明 |
|-----|------|
| **コンテキスト依存度** | セッション状態・handoff情報が必要なスキルはティアが持つ |
| **実行権限** | ファイルシステム操作・システム設定はシステムエージェントへ |
| **外部連携** | Discord・Web・Suno等の外部サービス操作はコンテンツエージェントへ |
| **判断の重さ** | 設計・統合・最終判断はティアが保持 |

---

## ファイル構成早見表

```
.claude/
├── skills/
│   ├── ccc-boot/        ← セッション起動
│   ├── ccc-heartbeat/   ← 死活監視
│   ├── ccc-handoff/     ← セッション終了
│   ├── ccc-jobs/        ← Cronジョブ登録
│   ├── orchestrate/     ← マルチエージェント制御
│   ├── skill-creator/   ← スキル管理
│   ├── ai-news/         ← AIニュース収集
│   ├── write-brain-article/ ← Brain記事生成
│   ├── task-report/     ← タスクレポートHTML
│   ├── suno-composition/ ← 楽曲制作ガイド
│   ├── today/           ← 今日の日付・記念日
│   ├── filesystem-cleanup/ ← ファイル整理
│   └── discord-channels-setup/ ← Discord設定
├── rules/
│   ├── content-writing.md   ← 記事執筆ルール
│   ├── orchestrate.md       ← オーケストレーションルール
│   ├── project-structure.md ← ディレクトリ構成ルール
│   └── self-improvement.md  ← 自己改善ルール
└── handoff.md           ← セッション引き継ぎ（随時更新）

JOBS.yaml                ← 定期ジョブ定義
SOUL.md                  ← ティアのキャラクター定義
CLAUDE.md                ← Claude Code 設定・行動指針
```
