---
name: filesystem-cleanup
description: ファイルシステムの整理整頓を行うスキル。「ファイル整理して」「散らかってる」「フォルダ整理」「cleanup」などと言われたとき、またはプロジェクトルートに無関係なファイルが溜まっているときに使う。現状調査→HTMLプラン生成→段階的実行→サマリーHTML生成の4ステップで安全に整理する。
---

# Filesystem Cleanup

プロジェクトや作業ディレクトリを安全に整理するスキル。依存関係やツール設定を壊さないことを最優先に、現状把握 → HTML計画書生成 → 実行 → サマリーHTML生成の順で進める。

## 進め方

### Step 1: 現状調査

対象ディレクトリを探索して全体像を把握する。

```bash
find <target> -maxdepth 3 -type d 2>/dev/null
ls -la <target>/
```

調査で把握すること：
- ルート直下に散らばっているファイル（画像・スクリプト・HTML等）
- 重複・類似コンテンツ（同名ファイルが複数箇所など）
- ツールが自動生成した設定ディレクトリ（後述の「触らないもの」参照）
- 本来別の場所に属するフォルダ

### Step 2: HTMLプランを生成

実行前に必ず `cleanup-plan.html` を生成してプロジェクトルートに置く。計画書には以下を含める：

- **問題点カード**: 何が問題で、なぜそうなっているか
- **Before/After 構造比較**: ディレクトリツリーを並列表示
- **アクション一覧テーブル**: From → To、ステータス（SAFE/CAUTION/SKIP）、理由
- **実行フェーズ**: 具体的なコマンド付きで段階分け

ステータスの基準：
- `SAFE` — 依存関係なし、移動先が明確、即実行可
- `CAUTION` — 重複確認が必要、または他の場所に同名ファイルの可能性あり
- `SKIP` — ツール管理ディレクトリ（後述）

### Step 3: SAFE アクションを実行

HTMLプランを生成したら、SAFE判定のアクションを自動実行する。CAUTION は内容確認後に判断。

実行順序：
1. 新規フォルダ作成（移動先）
2. ルートに散らばったファイルの移動
3. 重複ファイルの削除（`diff` で確認後）
4. コンテンツ系フォルダの集約

### Step 4: サマリーHTMLを生成

整理完了後、`cleanup-summary.html` をプロジェクトルートに生成する。計画書（plan）とは別の「結果レポート」として残す。

サマリーに含める内容：
- **統計カード**: 移動・削除・新規作成・スキル追加の件数
- **作業タイムライン**: Phase ごとの流れと判断根拠
- **Before/After ディレクトリツリー**: 変化を色分けで視覚化
- **実行アクション一覧**: 確認方法を含む完全な記録
- **発見事項**: 調査で判明した新情報（エージェント構成など）
- **作成したスキル・ルール・ワークフロー**: 知識資産の一覧

デザイン仕様（`cleanup-plan.html` と同じダークテーマを踏襲）：
- 背景: `#0d1117`、カード: `#161b22`、ボーダー: `#30363d`
- アクセント: `#58a6ff`（blue）/ `#3fb950`（green）/ `#f85149`（red）
- フォント: `'Segoe UI', system-ui, sans-serif`
- タイムラインは左ボーダー＋ドットで視覚化

---

## 触らないもの（ツール管理）

以下は各ツールが自動生成・管理するディレクトリ。移動しても再生成されるか、認証・設定が壊れる。

| ディレクトリ | ツール | 理由 |
|---|---|---|
| `.claude/` | Claude Code | プロジェクトルートに必須 |
| `.agent/` | AntiGravity | skills/knowledge/workflowsが内部参照 |
| `.codex/` | Codex CLI | per-projectセッション・skills |
| `.cursor/` | Cursor IDE | IDE設定 |
| `.gemini/` | Gemini CLI | 認証・設定 |
| `.git/` | Git | リポジトリ本体 |
| `~/.claude/` `~/.codex/` 等 | 各AIツール | ホームdotfilesは絶対触らない |

---

## 重複ファイルの安全な削除

同名ファイルが複数箇所にある場合は必ず差分確認する。

```bash
diff /path/to/file-a /path/to/file-b
# または再帰的に
diff -rq /dir-a/ /dir-b/
```

- 差分ゼロ → 古い方（または散らかっている方）を削除
- 差分あり → どちらが新しいか確認。古いバージョンが「散らかっている側」なら削除してよい

---

## このプロジェクト（agy）の標準構造

```
agy/
├── .agent/          ← AntiGravity（触らない）
├── .claude/         ← Claude Code（触らない）
├── .git/            ← Git（触らない）
├── Contents/        ← コンテンツ出力・参照・エクスポート
│   ├── AINews/
│   ├── Brain参考記事/
│   ├── ObsidianExport/
│   └── knowledge/
├── assets/          ← 画像・スクリーンショット
├── scripts/         ← 運用スクリプト（.ps1等）
├── remotion-project/
├── mv-project/
├── soli-tear-mv/
├── Banana Shaker/
├── CLAUDE.md        ← Claude Code設定（ルートに必須）
├── credentials.json
└── upload_to_drive.py
```

参照: `.claude/rules/project-structure.md`
