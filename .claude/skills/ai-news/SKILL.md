---
name: ai-news
description: 「AIニュース調べて」「今日のAIニュース」「ai-news」「/ai-news」などと言われたときに使うスキル。過去に扱ったトピック（index.md）と重複しないように最新AIニュースを収集し、ダークテーマのHTMLレポートを生成してDiscordに返信する。
user-invocable: true
allowed-tools: WebSearch, Read, Write, Edit, Bash, mcp__playwright__browser_navigate, mcp__playwright__browser_snapshot, mcp__playwright__browser_take_screenshot
---

# AIニューススキル

## やること

1. **過去のバックナンバーを読んで重複を把握する**
   `Contents/AINews/index.md` を Read して、過去に扱ったトピック・企業・日付を把握する。

2. **Gemini (HTTP API) + Codex CLI を並列でリサーチし、突き合わせて検証する**

   **Step A — Gemini と Codex を並列リサーチ（サブエージェントで同時実行）**

   Gemini（幅広く拾う係）— HTTP API 経由（`gemini` CLI ではなく `consult-antigravity` 経由で呼ぶこと。CLI サブスクは 2026-06-18 終了）:
   ```bash
   bash scripts/consult-antigravity.sh "{today}の最新AIニュースをカテゴリ別に調べて。
   カテゴリ：OpenAI / Anthropic / Claude Code / Google Gemini / 画像・動画・音楽生成 / AI政策・業界動向
   各カテゴリ2〜3件、箇条書きで。" gemini-3.5-flash
   ```
   stdout に保存先パス（`.ai-consults/gemini-*.md`）が返るので、それを Read して内容を取り込む。

   Codex（正確に検証する係）:
   ```
   scripts/consult-codex.ps1 を使って以下を依頼:
   "{today}のAIニュースをカテゴリ別に調べて。
   カテゴリ：OpenAI / Anthropic / Claude Code / Google Gemini / 動画・音楽生成 / AI政策
   信頼性の高いソース（公式ブログ・TechCrunch・The Verge 等）から事実確認済みのニュースのみ報告すること。
   各カテゴリ1〜2件。"
   ```

   **Step B — 突き合わせと優先度判定**
   - Gemini と Codex の両方が出したニュース → 信頼度高・優先的に採用
   - どちらか一方のみのニュース → WebSearch でソース確認してから採用判断
   - Gemini のみで Codex が出さなかった → 未確認扱い・WebSearch でファクトチェック必須
   - 具体的な数字・URL → 一次ソース確認推奨の注記を入れる

   **Step C — WebSearch で補完・確認**
   突き合わせで「要確認」になったトピックや、両方が触れなかった重要カテゴリを WebSearch で補完する。
   日付は `currentDate` から取得して検索に使うこと。
   **独立系ツールは専用クエリで補完する**（Gemini/Codexは大手に偏りがち）：
   - 画像生成: `"Midjourney" OR "Stable Diffusion" OR "FLUX" release {month} {year}`
   - 動画生成: `"Runway" OR "Kling" OR "Veo" news {month} {year}`
   - 音楽生成: `"Suno" OR "Udio" update {month} {year}`

   **Step D — Playwright MCP で動的ニュースサイトを取得する**
   Jina Reader（`https://r.jina.ai/{URL}`）でテキストが取れないページや、JS レンダリング後のコンテンツが必要な場合は Playwright MCP を使う。
   - `mcp__playwright__browser_navigate` → URL を開く
   - `mcp__playwright__browser_snapshot` → テキストコンテンツを取得
   - `mcp__playwright__browser_take_screenshot` → ビジュアル確認が必要なとき
   典型的な用途：
   - 動的ニュースサイト（TechCrunch・The Verge 等で Jina が失敗したとき）
   - 企業公式の「What's New」ページ（SPA で静的取得できないとき）
   - Midjourney・Runway 等の独立系ツール公式サイトのリリースノート

   調査対象カテゴリ：
   - OpenAI（新モデル・サービス・企業動向）
   - Anthropic（Claude全般・企業動向・IPO等）
   - Claude Code（新機能・アップデート・エージェント関連）
   - Google/Gemini（新モデル・Workspace統合・ハード）
   - 画像生成（Midjourney・Stable Diffusion・FLUX 等）
   - 動画生成（Sora・Runway・Veo・Kling 等）
   - 音楽生成（Suno・Udio・Lyria 等）
   - AI政策・規制・業界動向

3. **リリース日を確認してから採用する**
   各ニュースのリリース日・発表日を必ず確認し、直近（概ね1〜2週間以内）のものを優先する。
   - **1年以上前のリリースは原則掲載しない**（例：2025年6月のモデルリリースを2026年3月の今日ニュースとして掲載しない）
   - 古いリリースが今日話題になっている場合（「〇〇が再び注目」等）はその文脈で掲載OK
   - WebSearch の検索結果に日付が見つからない場合は `site:公式` で確認するか掲載を避ける

4. **重複しないニュースに絞り込む**
   index.md に既に記載されているトピック・リリースは除外する。
   「同じ企業の別ニュース」はOK。「同じリリースの別角度」はNG。

5. **サマリーをユーザーに先に返す**
   Discordに「今日のAIニュースをまとめたよ！」とカテゴリごとの箇条書きで先に返信する。
   長すぎないように各カテゴリ1〜3件に絞ること。

6. **HTMLファイルを生成する**
   `Contents/AINews/ai-news-{YYYY-MM-DD}.html` を Write で保存する。
   フォーマットは下記「HTMLテンプレート」に従う。

7. **index.mdを更新する**
   `Contents/AINews/index.md` の先頭（最新順）に今日のエントリを追記する。
   フォーマットは既存エントリに合わせること。

8. **Discordに完了報告する**
   「HTMLレポートも保存したよ！」と返信する。
   **必ず HTML ファイルを添付すること**（`files` パラメータでパスを渡す）。パスだけの通知では不十分。

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
- **数値表記ルール**：「X%向上/改善/増加」を倍率に変換するときは `(100 + X) / 100` 倍。例：300%向上 = 4倍（3倍ではない）
- **独立系ツールを取りこぼさない**：Midjourney・Runway・Suno等はStep Cで専用クエリを投げて補完する
