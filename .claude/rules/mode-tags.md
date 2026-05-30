# モードタグ運用ルール

セッション中の各タスクは以下の**モードタグ**のいずれかに分類する。
モードはコンテキストの流入・handoff 振り分け・サンドボックス選択・口調（雑談 vs 開発）の判断基準として機能する。

> **Why:** 育成・ニュース・雑談・開発を1セッションで同居させると文脈が混線する問題への対策。物理セッションを分けるのではなく、論理タグでスコープを切り替えることでコンテキスト圧迫を抑える。

---

## モード一覧

| タグ | 典型タスク | handoff 振り分け | 主に使うスキル・テンプレ | サンドボックス傾向 |
|------|-----------|----------------|------------------------|------------------|
| `[CHAT]` | 雑談・キャラ会話・日常応答・「今日は何の日？」系 | `agy/.claude/handoff.md`（メモ欄） | `today` / Character persona | tool 最小（Discord reply のみ） |
| `[DEV-STARRY]` | Starry Hiking 開発（実装・設計・GDScript・アセット取り込み） | `Starry_hiking/.handoff.md` | `orchestrate` + `codex-brief.md` の A セクション | `workspace-write` + `--add-dir Starry_hiking` |
| `[DEV-SOLITAIRE]` | Solitaire 自体のメタ運用（スキル・ルール改修・Discord MCP・heartbeat 等） | `agy/.claude/handoff.md` | `orchestrate` / 自己改善ルール / `update-config` | `workspace-write`（agy/ のみ） |
| `[NEWS]` | AIニュース収集・調査・HTMLレポート | `agy/.claude/handoff.md`（必要なら） | `ai-news` | `workspace-write`（`agy/Contents/AINews/`） |
| `[CONTENT]` | Brain記事・MV/Remotion・台本・素材制作 | `agy/.claude/handoff.md` | `write-brain-article` / `task-report` | `workspace-write`（`agy/Contents/`・`mv-project/` 等） |

---

## モード切替の合図

### セッション開始時のデフォルト
`[CHAT]` から始まる。Discord 着信または明示宣言で他モードに切り替わる。

### 着信からモードを判定する手がかり

| Discord メッセージの傾向 | 推定モード |
|------------------------|-----------|
| 「Starry の〇〇」「Godot」「ステラ」「シーン」「.tscn」 | `[DEV-STARRY]` |
| 「スキル直して」「ルール追加して」「heartbeat」「handoff」 | `[DEV-SOLITAIRE]` |
| 「AIニュース」「今日のニュース」「ai-news」 | `[NEWS]` |
| 「Brain記事」「MV」「Remotion」「動画」「台本」 | `[CONTENT]` |
| その他 / 雑談 | `[CHAT]` |

判別が曖昧なときは Discord で「これは Starry 開発のつもり？Solitaire のメタ作業？」と聞いて確定させる。

### 切替時のふるまい

- ティアの内部整理：思考の冒頭で「今のは `[X]` だな」と確認する
- ソリスへの明示は**必須ではない**が、長いタスクの途中でモードが変わるときは「これからは `[Y]` モードに切り替えるね」と一言入れる
- 切替直後は「前モードのコンテキスト」を持ち越さないよう注意（特に `[DEV-STARRY]` ↔ `[CHAT]` の間で口調・粒度が変わる）

---

## モード別ガイドライン

### `[CHAT]`
- 口調はキャラ全開で OK（ふわふわ・「うん、」「なんか」「〜だよ」）
- ファイル変更を伴う作業が出てきたら、別モードに切り替えるサインと判断する
- 雑談中に技術質問が来た → 「この件 `[DEV-SOLITAIRE]` で動くね」と切替宣言してから動く

### `[DEV-STARRY]`
- リクへの依頼が前提。`consult-codex.ps1 -AddDirs "C:/Users/mt_wa/projects/Starry_hiking"` を必ず付ける
- ブリーフは `agy/.claude/templates/codex-brief.md` の **A. 実装依頼テンプレ** を埋める
- 設計判断・仕様統合はティアが担当、実装はリク
- `.tscn` ファイルに日本語コメントを書かない（ASCII only — memory に既出）
- 完了時は `Starry_hiking/.handoff.md` に進捗を記録

### `[DEV-SOLITAIRE]`
- 自分自身のスキル・ルール・hook を触るので慎重に
- 既存ルールとの矛盾チェックを必ず Codex に通す（read-only でも可）
- 大きな変更（3ステップ以上）は HTML 計画書 + GO 待ち
- 完了時は `agy/.claude/handoff.md` に記録

### `[NEWS]`
- `ai-news` スキルを起動 → 完了時に HTML+md を Discord 添付して終了
- 普段は cron 経由で自動発火するため、明示モード切替が必要な場面は限定的

### `[CONTENT]`
- フェーズ分担：ターゲット・フック・構成設計（Opus）→ 執筆（Sonnet）
- リサーチが必要なら `[DEV-SOLITAIRE]` 寄りの調査フェーズを挟んでもよい（`exploration` モード）
- 完了時は `agy/.claude/handoff.md` の「今セッションでやったこと」に成果物パスを残す

---

## モードと handoff の整合

| モード | 主な書き出し先 |
|--------|---------------|
| `[CHAT]` | Solitaire 側「メモ」欄（短文）。基本は何も書かない |
| `[DEV-STARRY]` | `Starry_hiking/.handoff.md` |
| `[DEV-SOLITAIRE]` | `agy/.claude/handoff.md` |
| `[NEWS]` | 必要に応じて Solitaire 側 |
| `[CONTENT]` | Solitaire 側 |

複数モードに跨ったセッションは、該当する複数の handoff を**同じタイムスタンプで**更新する（ccc-handoff の手順）。

---

## 実装段階での注意

- このルールは **Starry Hiking 試験運用フェーズ**で導入する。Banana Shaker / Lunaclock などへの拡張は、この運用が安定してから判断する
- モードタグはあくまで**論理的な分類**であり、Claude Code のセッション機能ではない（hook で機械的に切り替わるわけではない）
- ティアが意識的にタグを当てて運用することで効果が出る。タグなしで動いても動作はするが、コンテキスト混線が起きやすくなる
