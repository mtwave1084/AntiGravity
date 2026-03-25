---
name: discord-channels-setup
description: Claude Code の Discord Channels 機能をセットアップする。Discord ボットを通じて Claude に外部からメッセージを送れるようにする。「Discord チャンネルを設定して」「Claude を Discord に繋ぎたい」などと言ったときに使用。
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Bash(cat *)
  - Bash(mkdir *)
  - Bash(cp *)
  - Bash(claude mcp*)
  - Bash(claude plugin*)
  - Bash(bun *)
---

# /discord-channels-setup — Discord Channels セットアップ

Claude Code の Channels 機能を使って Discord ボットと連携し、Discord から Claude を操作できるようにする。

Arguments: `$ARGUMENTS`

---

## 前提条件

- Claude Code v2.1.80 以上（`claude --version` で確認）
- **claude.ai アカウントでログイン**（Console/APIキー認証は非対応）
- Windows の場合: Git Bash 環境

---

## Step 1: Bun のインストール

```bash
# インストール確認
bun --version

# 未インストールの場合
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Windows での PATH 対策（重要）

Claude Code が spawn するプロセスから bun を参照できるよう、`~/.local/bin` にコピーする：

```bash
cp ~/.bun/bin/bun.exe ~/.local/bin/bun.exe
```

> **なぜ必要か**: `bun` を User PATH に追加しても、Claude Code が起動済みの場合や plugin spawn 時に PATH が引き継がれないことがある。`~/.local/bin` は claude.exe と同じ場所にあり確実に参照される。

---

## Step 2: Discord ボット作成

1. https://discord.com/developers/applications → **New Application**
2. **Bot** → ユーザー名を設定
3. **Bot** → **Reset Token** → トークンをコピー（一度しか表示されない）
4. **Privileged Gateway Intents** → **Message Content Intent** を ON → Save Changes
5. **OAuth2 > URL Generator** → スコープ `bot` → 権限を設定：
   - View Channels / Send Messages / Send Messages in Threads
   - Read Message History / Attach Files / Add Reactions
6. 生成 URL を開いてボットをサーバーに招待

---

## Step 3: プラグインインストール

Claude Code セッション内で：

```
claude plugin install discord@claude-plugins-official
```

---

## Step 4: Bot トークンの設定

```bash
mkdir -p ~/.claude/channels/discord
```

`~/.claude/channels/discord/.env` を作成：

```
DISCORD_BOT_TOKEN=取得したトークン
```

---

## Step 5: settings.json の設定

`~/.claude/settings.json` に追加：

```json
{
  "channelsEnabled": true,
  "enabledPlugins": {
    "discord@claude-plugins-official": true
  },
  "permissions": {
    "allow": [
      "mcp__discord__reply",
      "mcp__discord__react",
      "mcp__discord__fetch_messages",
      "mcp__discord__edit_message",
      "mcp__discord__download_attachment"
    ]
  }
}
```

---

## Step 6: Channels セッション起動

```bash
claude --channels plugin:discord@claude-plugins-official
```

---

## Step 7: ペアリング（初回のみ）

1. Discord でボットに DM を送る → ペアリングコードが返ってくる
2. コードを使って `~/.claude/channels/discord/access.json` を手動設定：

```json
{
  "dmPolicy": "allowlist",
  "allowFrom": ["あなたのDiscordユーザーID"],
  "groups": {},
  "pending": {}
}
```

`approved/` ディレクトリにも承認ファイルを作成：

```bash
mkdir -p ~/.claude/channels/discord/approved
echo "DMチャンネルID" > ~/.claude/channels/discord/approved/ユーザーID
```

---

## チャンネルへの応答追加

`access.json` の `groups` にチャンネル ID を追加：

```json
"groups": {
  "チャンネルID": {
    "requireMention": false,
    "allowFrom": []
  }
}
```

- `requireMention: true` → @メンション時のみ応答
- `requireMention: false` → 全メッセージに応答
- `allowFrom: []` → 誰でも可（特定ユーザーのみは ID を列挙）

チャンネル ID の取得: Discord 設定 → 詳細設定 → **開発者モード** ON → チャンネル右クリック → **チャンネル ID をコピー**

---

## トラブルシューティング

### `plugin:discord:discord - ✗ Failed to connect`
→ bun が PATH にない。Step 1 の PATH 対策を実行。

### `server discord is not on the approved channels allowlist`
→ `--channels server:discord` ではなく `--channels plugin:discord@claude-plugins-official` を使う。

### Discord で入力中が出るが応答なし
→ `~/.claude/settings.json` の `permissions.allow` に discord ツールを追加。

### `/discord:access` が Unknown skill になる
→ Windows ではコロン入りディレクトリ名が機能しないため、`access.json` を直接編集する。

---

## 起動コマンド（辞書登録推奨）

```bash
claude --channels plugin:discord@claude-plugins-official
```
