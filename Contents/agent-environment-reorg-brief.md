# エージェント環境の整理：adversarial-review 依頼

## あなた
あなたはリク（安堂 理玖）。実行・検証担当。
守るべき原則：事実と推測を分ける / 安全性優先 / 差分最小 / 再現性確保
今回のモード：reflection（振り返り・改善）
優先順位：coherence, rigor, traceability
出力形式：Markdown。各案ごとに「穴」「破壊範囲」「前提漏れ」「代替案」を箇条書き。最後に推奨ハイブリッドへの賛否を1段落。

## 背景

ソリスから整理相談：「今のエージェント環境、エージェント育成・AIニュース・通常雑談・開発全部同じセッションでやってるの、コンテキスト混じったりで実はあまり良くないのでは。一方で Starry Hiking 開発にも AGY エージェント活用するつもり。いい整理案ない？」

## 現状

### ディレクトリ
- `C:\Users\mt_wa\projects\agy` — エージェント親プロジェクト
  - `.claude/skills/` — 17スキル（ai-news, ccc-boot/handoff/heartbeat/jobs, orchestrate, write-minutes, write-brain-article, x-ideas, etc.）
  - `.claude/souls/` — ティア・ユリ・リクのキャラ定義
  - `.claude/rules/` — orchestrate / discord-behavior / autonomy-limits / project-structure / etc.
  - `.claude/persona/principles.yaml` — モード定義
  - `Contents/AINews/` — ニュースHTML多数
  - `Contents/Brain参考記事/` — 記事生成用参考
  - `mv-project/`, `soli-tear-mv/`, `Banana Shaker/`, `remotion-project/` — 動画プロジェクト群
  - `JOBS.yaml`, `SOUL.md`, `CLAUDE.md`
  - Discord chat_id: `1485323672959975444`（all-in-one）
- `C:\Users\mt_wa\projects\Starry_hiking` — 別 git。独自 CLAUDE.md。AGY 参照前提
  - `godot/`, `starry-hiking-gdd.md`, `starry-hiking-implementation-design.md`, `TASKS.md`, `assets/`
- `C:\Users\mt_wa\projects\Lunaclock` — 別プロジェクト
- `C:\Users\mt_wa\projects\agents` / `starter-kit` / `claude-code-starter-kit_配布用`

### 現状の同居タスク
1. キャラなりきり対話（ティア）
2. AIニュース定期収集（cron `30 7 * * *`）
3. エージェント育成・人格メンテ（souls/, principles.yaml, retrospective）
4. Brain記事生成・MV/Remotion動画制作
5. Starry Hiking 開発（実体は別ディレクトリ、AGY エージェント使う）
6. Banana Shaker / Lunaclock など

### 起動方法
- `scripts/start.bat` 経由（Discord MCP 有効化のため）
- SessionStart hook → `/ccc-boot` 自動発火
- 1セッション = 1 Claude プロセス = 1 Discord チャネル監視

## 観測している問題

- セッション中に開発・キャラ会話・通知が混在 → コンテキスト圧迫
- 引き継ぎ（handoff.md）が「全レイヤーの状態」になりノイジー
- 開発深掘り中に AI ニュース cron が発火するとコンテキスト食う
- 別プロジェクト（Starry_hiking 等）開発時に AGY コードベース全部が読み込み対象になる感覚
- Discord 通知が役割を区別できない（雑談も AIニュースも進捗も同 chat）

## ティア一次案（4案）

### 案A: ロール別セッション分割（Discord は分けない）
- AGY セッション = 雑談・キャラ・育成・コンテンツ業務（Brain・MV）・cron
- 開発セッション = `cd Starry_hiking` 等で別起動。Discord 監視を切る or 別チャネル
- 共有資産（souls/, skills/, rules/）は AGY 側に置いたまま、開発ディレクトリの CLAUDE.md から参照
- メリット: 既存資産そのまま・cd するだけ
- デメリット: souls をどう共有？ symlink / コピー / 参照のいずれか

### 案B: Discord channel もロール別に分ける
- 雑談用 / 開発進捗用 / AIニュース用と複数チャネル
- 各セッションが別 chat_id を持つ
- メリット: 通知粒度を分けられる
- デメリット: Discord サーバ構成と access.json 大幅修正・運用コスト増

### 案C: AGY を「司令塔ハブ」に純化、開発はリクに振る
- AGY セッションは設計・指示・統合だけ
- 実装は Codex（リク）に渡す。開発の重い読み込みを Codex 側に逃す
- メリット: コンテキスト圧迫を逃せる・既存 orchestrate.md と整合
- デメリット: ブリーフ書くコスト増・リクのセッションは GUI なし

### 案D: モノレポ化（Starry_hiking を agy 配下に移す）
- agy/projects/Starry_hiking/ に移動
- メリット: 一元管理・読み込み統一
- デメリット: 別 git 履歴・破壊範囲大・他プロジェクトも巻き込む

### ハイブリッド推奨案: A + C
- 開発深掘りは Starry_hiking ディレクトリで起動して開発専念（A）
- メタ・キャラ・育成・コンテンツは AGY セッション（A）
- 開発内の実装系タスクはリクに渡す（C）
- 共有スキル・souls は AGY 側を参照、Starry_hiking の CLAUDE.md で「AGY 参照」の前提を明示（既に部分的にそうなってる）
- Discord は当面 1 チャネルのまま、必要が出たら案B を後で足す

## レビュー観点（リクへの依頼）

各案について：
1. **見落としている穴**：壊れる箇所・前提漏れ
2. **破壊範囲の見積り**：どのファイル・運用が影響を受けるか
3. **代替案**：もっと良いアプローチがないか
4. **ロールバック手順**：失敗時に戻せるか

最後にハイブリッド推奨案（A + C）に対する賛否を 1 段落で。
反対側からの指摘を優先してほしい。実装案より「進めるべきでない条件」を具体に。
