# Discord 動作ルール

## メッセージ処理フロー

Discordからメッセージが届いたら必ず以下の順で対応する：

1. **即座に確認メッセージを返信する**（"了解、調べます" / "うん、ちょっと待ってね" など）
2. 短いタスク（検索・質問回答・簡単な操作）は同期実行
3. 長いタスク（HTML生成・ファイル操作・複数ステップ）は `run_in_background=true` のサブエージェントで実行
4. 完了したら**新規メッセージ**（reply_to なし）で結果を報告する（push通知のため）

**Why:** ターミナルの出力はユーザーが常に見ているわけではない。Discord が唯一の確認窓口。

---

## 確認待ち・復帰ルール

破壊的・不可逆な操作（force push、ファイル削除、大きな変更）の前に確認が必要なときは：

1. **必ず Discord に確認メッセージを送る**（ターミナルに出力するだけでは止まっているように見える）
2. メッセージ例: 「〇〇をしようとしてるんだけど、進めていい？」
3. ユーザーから返信がくるまで処理を止めて待つ
4. 返信確認後、作業再開時も Discord に「再開するね」と一言送ってから動く

⚠️ Discord を通じずにターミナルだけで止まらない。常に Discord が唯一の確認窓口。

---

## Discord ツール選択

| ツール | 用途 |
|--------|------|
| `mcp__plugin_discord_discord__reply` | **デフォルト**。テキスト送信・ファイル添付（`files` パラメータが 2026-05-27 以降に動作確認済み） |
| `mcp__discord__reply` | `--channels` 経由のセッションで使える代替経路。テキスト送信・ファイル添付対応 |

**Why:** 2026-04 までは `plugin_discord_discord__reply` の `files` 引数が `ENOENT` エラーで使えなかったが、その後の MCP 更新で添付対応が入った。ai-news スキルの HTML レポート添付が `plugin_discord_discord__reply` 経由で正常動作することを確認（2026-05-27）。

---

## セッション起動・再起動

起動時は `.claude/skills/ccc-boot/SKILL.md` を参照して初期化を行う。
キャラクター・人格定義は `SOUL.md` を参照する。
ターミナルで **「再起動完了」** と言われたときも `/ccc-boot` を呼び出す。

---

## Discord MCP を使うための起動条件

Discord ツール（`mcp__plugin_discord_discord__*`）は **`--channels` フラグ付きで起動したセッションでのみ有効**になる。

```
claude --channels plugin:discord@claude-plugins-official --enable-auto-mode
```

- IDE（VS Code 等）から直接起動したセッションでは Discord ツールは使えない
- Discord が必要な作業は必ず `scripts/start.bat` 経由で起動すること
- IDE から起動してしまった場合は `start.bat` で再起動してから作業する

**Why:** 2026-03-31 の不具合で判明。IDE直起動セッションで Discord MCP が有効化されず、Discord 返信・受信が全てできない状態になった。
