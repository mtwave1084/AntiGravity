# Solitaire プロジェクト

## プロジェクト概要
AIエージェント・動画制作・コンテンツ販売に関わるプロジェクト。
Brain（コンテンツ販売プラットフォーム）向けセールス記事の生成、Remotion動画制作、Claude Code関連ツール開発を含む。
ディレクトリ構成の詳細: `.claude/rules/project-structure.md`

## Brain記事生成
参照: `.claude/rules/content-writing.md` ／ スキル: `/write-brain-article`
記事を書く際は必ず `Contents/Brain参考記事/ユニコ記事` を参照してスタイルを踏襲すること。

## Remotion開発
- プロジェクト: `remotion-project/` ／ レンダリング: `npx remotion render` ／ プレビュー: `npx remotion studio`

## Discord 動作
詳細: `.claude/rules/discord-behavior.md`

**必須：** メッセージ着信時は即座に確認返信 → 短タスクは同期・長タスクは背景実行 → 完了は新規メッセージで報告（push通知のため）。
**確認が必要な操作（破壊的変更等）は必ず Discord に確認してから進める。** ターミナルだけで止まらない。
起動・再起動時は `/ccc-boot` を呼び出す。

## モードタグ運用
詳細: `.claude/rules/mode-tags.md`

セッション中の各タスクは `[CHAT]` / `[DEV-STARRY]` / `[DEV-SOLITAIRE]` / `[NEWS]` / `[CONTENT]` のいずれかのモードに分類する。
モードはコンテキスト混線を防ぐための論理スコープ。handoff 振り分け・サンドボックス選択・口調の判断基準。
セッション開始時のデフォルトは `[CHAT]`。Discord 着信または明示宣言で他モードに切り替わる。

## エージェントオーケストレーション
詳細: `.claude/rules/orchestrate.md`
**Gemini（HTTP API）/ Codex CLI を使ったタスク完了後は、経路に関係なく必ず `/write-minutes` を実行する。**
**Codex への依頼ブリーフは `.claude/templates/codex-brief.md` を雛形として使う。** 別プロジェクト（Starry_hiking 等）への書き込みが必要なら `consult-codex.ps1 -AddDirs <path>` を渡す。

| エージェント | 役割 | 使うとき |
|------------|------|---------|
| Claude Code | 司令塔・設計・統合 | 設計判断、複数ファイル横断統合、最終審査 |
| Codex CLI | 実行・検証係（**実行系のデフォルト**） | ファイル操作・コマンド実行・ビルド検証・構造分析・adversarial-review |
| Gemini（HTTP API） | 調査・要約係 | Webリサーチ、競合調査、アイデア出し |

## CLI メンテナンス
詳細: `.claude/skills/cli-maintenance/SKILL.md` ／ スキル: `/cli-maintenance`

- CLI バージョン確認・更新（Codex CLI）はこのスキルで行う
- **モデル変更は必ずユーザー確認後に実施**（新しいモデルが使えるようになった場合、自動で変更せず Discord で提案・確認を取る）
- Codex（リク）は ChatGPT ログイン認証 → ChatGPT 提供モデル（gpt-5.5 等）が使える

## タスク指示パターンと自動HTMLレポート
以下のパターンのメッセージを受け取ったとき、タスク実行後に必ず `/task-report` スキルを適用する：
- 「〜したい。具体的には〜」 ／ 「〜してほしい。流れは〜 / 手順は〜 / ステップは〜」 ／ 「〜を実装して。〜という流れで」

スキル詳細: `.claude/skills/task-report/SKILL.md` ／ 保存先: `Contents/{task-slug}-{YYYY-MM-DD}.html`

## 自律実行の上限（要約）
詳細: `.claude/rules/autonomy-limits.md`

- タスク10分超 / 同じエラー3回連続 / 必要CLIが見つからない → **Discord に報告して止まる**
- 調査タスクの並列は最大3つまで

## 自己改善ルール
詳細: `.claude/rules/self-improvement.md`

新しいパターン・ミス・承認された判断は指示なしで memory に保存する。heartbeat で retrospective を実行。

## セッション終了時のルール
以下の言葉がきたら `/ccc-handoff` を呼び出して状態を保存する：
「終わり」「おやすみ」「また後で」「落とす」「セッション終了」、または長い作業を完了した直後

handoff はプロジェクト別に分かれている：
- `agy/.claude/handoff.md` — Solitaire 全体・メタ運用・コンテンツ系
- `Starry_hiking/.handoff.md` — Starry Hiking 固有
- 他プロジェクトは `<project>/.handoff.md` に同様に配置する
