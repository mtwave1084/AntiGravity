---
name: agent-reach
description: Agent-Reach を使って Web / YouTube / RSS / GitHub の情報を取得するスキル。Gemini 503 時の補完、一次ソース確認、動画字幕取得などに使う。
user-invocable: false
allowed-tools: Bash, Read, Write
---

# Agent-Reach スキル

## 概要

Agent-Reach は AIエージェントにインターネットアクセス能力を与える scaffolding ツール。
以下の4チャネルが現在使用可能（Phase 1）。

| チャネル | 使い方 | 備考 |
|---------|--------|------|
| Web | `curl https://r.jina.ai/{URL}` | 本文のみ抽出・広告除去 |
| YouTube | `yt-dlp --write-auto-sub --skip-download {URL}` | 字幕テキスト取得 |
| RSS | `agent-reach read {RSS_URL}` | フィード全件取得 |
| GitHub | `agent-reach read {GITHUB_URL}` | gh CLI を内部使用 |

## 前提条件

- `agent-reach` コマンドが PATH に存在すること
- `yt-dlp` が PATH に存在すること（~/.bashrc で追加済み）
- yt-dlp の JS runtime 設定：`~/.config/yt-dlp/config` に `--js-runtimes node`

PATH が通っていない場合は以下を先頭に入れる：
```bash
export PATH="$PATH:/c/Users/mt_wa/AppData/Roaming/Python/Python313/Scripts:/c/Users/mt_wa/.local/bin"
```

## 使い方

### Web ページの本文取得

```bash
curl -s "https://r.jina.ai/https://example.com/article" 2>&1
```

### YouTube 字幕取得

```bash
export PATH="$PATH:/c/Users/mt_wa/AppData/Roaming/Python/Python313/Scripts:/c/Users/mt_wa/.local/bin"
yt-dlp --write-auto-sub --sub-lang ja,en --skip-download --output "/tmp/%(id)s" "{YOUTUBE_URL}" 2>&1
cat /tmp/*.vtt 2>/dev/null | head -100
```

### RSS フィード読み取り

```bash
agent-reach read "{RSS_URL}" 2>&1
```

例：
```bash
agent-reach read "https://feeds.feedburner.com/TechCrunch" 2>&1
```

### GitHub リポジトリ読み取り

```bash
agent-reach read "https://github.com/owner/repo" 2>&1
```

## 状態確認

```bash
agent-reach doctor 2>&1
```

## どのときに使うか

1. **Gemini が 503 のとき** → Web / RSS で一次ソース確認
2. **YouTube 動画の内容を確認したいとき** → yt-dlp で字幕取得
3. **AIニュース（ai-news スキル）の補完** → RSS で最新エントリを取得
4. **公式ドキュメント精読** → Jina Reader で本文抽出（広告・ナビ除去）

## 注意

- Jina Reader は curl コマンドで直接使う（agent-reach コマンドを経由しない）
- yt-dlp は YouTube の仕様変更で定期的に更新が必要：`pip install -U yt-dlp`
- `agent-reach doctor` で定期的に状態を確認する
- X/Twitter（bird CLI）は現時点で未設定。専用アカウントを用意してから導入する
