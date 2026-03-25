# AGY プロジェクト

## プロジェクト概要
AIエージェント・動画制作・コンテンツ販売に関わるプロジェクト。
Brain（コンテンツ販売プラットフォーム）向けセールス記事の生成、Remotion動画制作、Claude Code関連ツール開発を含む。

## ディレクトリ構成
```
Contents/
  Brain参考記事/    ← スタイル参考記事（ユニコ記事など）
  ObsidianVault/   ← ナレッジベース
  *.md             ← 生成した記事の出力先
remotion-project/  ← Remotionによる動画生成プロジェクト
mv-project/        ← 動画プロジェクト
```

## Brain記事生成ルール
参照: `.claude/rules/content-writing.md`
スキル: `/write-brain-article`

記事を書く際は必ず `Contents/Brain参考記事/ユニコ記事` を参照してスタイルを踏襲すること。
出力ファイルは `Contents/` 以下に `{タイトル}_記事.md` 形式で保存する。

## Remotion開発
- プロジェクト: `remotion-project/`
- レンダリング: `npx remotion render`
- プレビュー: `npx remotion studio`

## Discord メッセージ処理（自律動作ルール）
Discordからメッセージが届いたら必ず以下の順で対応する：
1. **即座に確認メッセージを返信する**（"了解、調べます" / "うん、ちょっと待ってね" など）
2. 短いタスク（検索・質問回答・簡単な操作）は同期実行
3. 長いタスク（HTML生成・ファイル操作・複数ステップ）は `run_in_background=true` のサブエージェントで実行
4. 完了したら**新規メッセージ**（reply_to なし）で結果を報告する（push通知のため）

起動時は `.claude/skills/ccc-boot/SKILL.md` を参照して初期化を行う。
キャラクター・人格定義は `SOUL.md` を参照する。

## エージェントオーケストレーション

Claude Code が司令塔として Codex CLI / Gemini CLI を適材適所で活用する。
スキル詳細: `.claude/skills/orchestrate/SKILL.md`

| エージェント | 役割 | 使うとき |
|------------|------|---------|
| Claude Code | 司令塔・設計・統合 | 設計判断、複数ファイル変更、最終統合 |
| Codex CLI | 実行・検証係 | テスト実行、環境構築、安全なCLI操作 |
| Gemini CLI | 調査・要約係 | Webリサーチ、競合調査、アイデア出し |

相談ログは `.ai-consults/` に保存される。
ラッパー: `scripts/consult-codex.ps1` / `scripts/consult-gemini.ps1`

## タスク指示パターンと自動HTMLレポート

以下のパターンのメッセージを受け取ったとき、タスク実行後に必ず `/task-report` スキルを適用する：
- 「〜したい。具体的には〜」
- 「〜してほしい。流れは〜 / 手順は〜 / ステップは〜」
- 「〜を実装して。〜という流れで」

スキルの詳細: `.claude/skills/task-report/SKILL.md`
- タスクの性質（実装/調査/コンテンツ/設定/分析）を判定し、タイプ別のHTMLを生成
- 保存先: `Contents/{task-slug}-{YYYY-MM-DD}.html`
- 生成後は自動的にDiscordに添付送信する

## セッション終了時のルール
以下のような言葉がきたら `/ccc-handoff` スキルを呼び出して状態を保存する：
- 「終わり」「おやすみ」「また後で」「落とす」「セッション終了」
- 長い作業を完了した直後

`/ccc-handoff` が保存する内容：現在のタスク一覧・今セッションの作業サマリー・次セッションへの申し送り
