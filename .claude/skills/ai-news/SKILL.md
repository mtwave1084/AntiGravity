---
name: ai-news
description: 「AIニュース調べて」「今日のAIニュース」「ai-news」「/ai-news」などと言われたときに使うスキル。過去に扱ったトピック（index.md）と重複しないように最新AIニュースを収集し、ダークテーマのHTMLレポートを生成してDiscordに返信する。
user-invocable: true
allowed-tools: WebSearch, Read, Write, Edit, Bash
---

# AIニューススキル

## やること

1. **過去のバックナンバーを読んで重複を把握する**
   `Contents/AINews/index.md` を Read して、過去に扱ったトピック・企業・日付を把握する。

2. **当日のAIニュースをWebSearchで調査する**
   以下のカテゴリごとに最新情報を検索する：
   - OpenAI（新モデル・サービス・企業動向）
   - Anthropic（Claude・Claude Code・新機能）
   - Google/Gemini（新モデル・Workspace統合・ハード）
   - 画像生成（Midjourney・Stable Diffusion・FLUX 等）
   - 動画生成（Sora・Runway・Veo・Kling 等）
   - 音楽生成（Suno・Udio・Lyria 等）
   - AI政策・規制・業界動向

   クエリ例：`OpenAI 最新ニュース 2026-03-23`、`Anthropic Claude 新機能 今週` など。
   日付は `currentDate` から取得して検索に使うこと。

3. **重複しないニュースに絞り込む**
   index.md に既に記載されているトピック・リリースは除外する。
   「同じ企業の別ニュース」はOK。「同じリリースの別角度」はNG。

4. **サマリーをユーザーに先に返す**
   Discordに「今日のAIニュースをまとめたよ！」とカテゴリごとの箇条書きで先に返信する。
   長すぎないように各カテゴリ1〜3件に絞ること。

5. **HTMLファイルを生成する**
   `Contents/AINews/ai-news-{YYYY-MM-DD}.html` を Write で保存する。
   フォーマットは下記「HTMLテンプレート」に従う。

6. **index.mdを更新する**
   `Contents/AINews/index.md` の先頭（最新順）に今日のエントリを追記する。
   フォーマットは既存エントリに合わせること。

7. **Discordに完了報告する**
   「HTMLレポートも保存したよ！」と返信する。

---

## HTMLテンプレート

以下のダークテーマ・カードベースのフォーマットで生成すること。

```html
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI News {YYYY-MM-DD}</title>
<style>
  body { background: #0d1117; color: #e6edf3; font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; }
  h1 { color: #58a6ff; border-bottom: 1px solid #30363d; padding-bottom: 10px; }
  h2 { color: #79c0ff; margin-top: 32px; }
  .card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 16px; margin: 12px 0; }
  .card h3 { color: #d2a8ff; margin: 0 0 8px; font-size: 1em; }
  .card p { margin: 0; color: #c9d1d9; font-size: 0.9em; line-height: 1.6; }
  .badge { display: inline-block; background: #1f6feb; color: #fff; font-size: 0.75em; padding: 2px 8px; border-radius: 12px; margin-left: 8px; vertical-align: middle; }
  .date { color: #8b949e; font-size: 0.8em; }
</style>
</head>
<body>
<h1>🤖 AI News <span class="date">{YYYY-MM-DD}</span></h1>

<!-- カテゴリごとにセクションを作成 -->
<h2>OpenAI</h2>
<!-- ニュースカード -->
<div class="card">
  <h3>タイトル <span class="badge">新機能</span></h3>
  <p>内容の説明。</p>
  <p class="date">2026-XX-XX</p>
</div>

<!-- 他カテゴリも同様に続ける -->

</body>
</html>
```

バッジの種類：`新機能` `新モデル` `資金調達` `企業動向` `規制` `ハード` など内容に合わせて選ぶ。

---

## ティアのスタイルガイド（Discord返信用）

- 文は短く、ひとこと区切り
- 「うん、」「あ、」「わあ、」から入ることがある
- 「なんか」をよく使う
- 語尾は `〜だよ` / `〜だよ！` / `〜だよね` / `〜かな`
- マークダウン装飾は使わない（Discord向けはシンプルに）
- ニュースの箇条書きは `・` を使う

---

## 注意

- 情報が少ない日は「今日は大きな動きは少なかったみたい」と正直に言ってOK
- ニュースが多すぎるときはカテゴリごとに上位2〜3件に絞る
- HTMLのスタイルは既存ファイル（`ai-news-2026-03-23.html`）を参考にして一貫性を保つ
- index.mdの更新は忘れずに（重複防止の核）
