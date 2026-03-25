# Discord Channels 設定状態

このファイルは現在の Discord Channels 設定の記録。
セットアップ手順の詳細は `/discord-channels-setup` スキルを参照。

## 現在の設定（2026-03-23）

### インフラ
- Bun: `~/.bun/bin/bun.exe`（`~/.local/bin/bun.exe` にもコピー済み）
- プラグイン: `discord@claude-plugins-official` インストール済み
- キャッシュ: `~/.claude/plugins/cache/claude-plugins-official/discord/0.0.1/`

### ファイル構成
```
~/.claude/
  settings.json          # channelsEnabled, enabledPlugins, permissions
  channels/discord/
    .env                 # DISCORD_BOT_TOKEN
    access.json          # アクセス制御
    approved/            # ペアリング承認ファイル
```

### access.json の設定
```json
{
  "dmPolicy": "allowlist",
  "allowFrom": ["507559289658015747"],
  "groups": {
    "1485323672959975444": {
      "requireMention": false,
      "allowFrom": []
    }
  }
}
```

- DM: ソリス（507559289658015747）のみ
- チャンネル `1485323672959975444`: 全メッセージに応答

### 起動コマンド
```bash
claude --channels plugin:discord@claude-plugins-official
```
（辞書登録済み）

## 注意事項

- channels セッションが起動していない間はメッセージは無視される
- access.json はランタイム中も再読み込みされるため、起動中でも編集可能
- トークンリセット後は `.env` の更新が必要
