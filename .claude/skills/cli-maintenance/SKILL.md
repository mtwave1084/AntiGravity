# cli-maintenance スキル

CLI ツール（Codex CLI）のバージョン確認・更新と、モデル設定の確認・変更提案を行うスキル。
Gemini は 2026-06-18 でサブスク終了のため CLI ではなく HTTP API（consult-antigravity 経由）を使用。

## トリガー

- ユーザーから「CLI更新して」「バージョン確認して」「CLIの状態を確認して」など
- または定期メンテナンスの一環として手動で呼び出す

---

## フロー

### STEP 1 — 現在のバージョンを確認する

```bash
# PATH を通してから実行
export PATH="$PATH:/c/Users/mt_wa/AppData/Roaming/Python/Python313/Scripts:/c/Users/mt_wa/.local/bin"

# Codex CLI
codex --version
```

### STEP 2 — 最新バージョンを確認する（npm）

```bash
# Codex CLI の最新版
npm view @openai/codex version
```

### STEP 3 — 差分を比較してDiscordに報告する

現在と最新を比較し、以下のフォーマットで Discord に送る：

```
CLIのバージョン確認したよ！

Codex CLI: 現在 X.X.X → 最新 Y.Y.Y（更新あり / 最新）

更新していい？
```

更新がない場合は「最新だよ！」と報告して終了。

### STEP 4 — ユーザーの承認を待って更新する

承認が来たら更新を実行：

```bash
# Codex CLI を更新
npm install -g @openai/codex@latest
```

更新完了後に Discord で「更新したよ！」と新規メッセージで報告する。

---

## モデル確認・変更フロー

### STEP A — 現在のモデル設定を確認する

`C:\Users\mt_wa\.codex\config.toml` を Read して現在の設定を確認する：

```toml
model = "..."
model_reasoning_effort = "..."
```

### STEP B — 利用可能なモデルを調べる

Codex CLI のリリースノートや公式ドキュメントを WebSearch で確認し、新しいモデルが追加されていないか調べる。

検索クエリ例: `OpenAI Codex CLI supported models {currentYear}`

### STEP C — 変更提案（必ず確認を取る）

新しいモデルが利用可能になっていた場合、**自動で変更せず**に Discord で確認を取る：

```
リクの設定を確認したよ！

現在: model = "gpt-X.X" / reasoning_effort = "medium"
新しいモデル "gpt-Y.Y" が使えるようになってるみたい。

変更する？変更する場合は reasoning_effort も一緒に教えてね（high/medium/low）。
```

ユーザーから「変更して」「gpt-Y.Y の medium で」などの返信が来てから `config.toml` を Edit する。

**⚠️ モデル変更は必ずユーザー確認後に行う。承認なしで自動変更しない。**

### STEP D — config.toml を更新する（承認後のみ）

```toml
model = "新しいモデル名"
model_reasoning_effort = "指定の思考量"
```

更新後に Discord で「設定を更新したよ！」と報告する。

---

## Codex CLI の認証・モデル制約

| 認証方式 | アクセス可能なモデル |
|---------|-------------------|
| ChatGPT ログイン（トークン認証） | ChatGPT で提供されているモデル（gpt-5.5 等） |
| OpenAI API キー | API で提供されているモデルのみ |

現在のリク（リク = Codex CLI）の認証方式: **ChatGPT ログイン（トークン認証）**
→ ChatGPT で提供されているモデル（gpt-5.5 含む）が使える。

確認方法: `C:\Users\mt_wa\.codex\auth.json` の `"OPENAI_API_KEY"` が `null` なら ChatGPT 認証。

---

## 状態スナップショット（最終更新: 2026-05-30）

| ツール | バージョン | モデル | 思考量 |
|--------|----------|-------|--------|
| Codex CLI | 0.124.0 | gpt-5.5 | medium |
| Gemini（HTTP API） | — | gemini-3.5-flash（デフォルト） | — |

---

## 注意

- npm コマンドは PATH が通った状態（export PATH を先に実行）で動かすこと
- Codex CLI のバージョンアップ後は `codex --version` で確認する
- Gemini は `consult-antigravity.sh` 経由で HTTP API を叩く（`GEMINI_API_KEY` 環境変数で認証）
- Gemini CLI のサブスク提供は **2026-06-18 終了**。CLI はもはや使わない。旧 `consult-gemini.ps1` は薄い shim として残置
