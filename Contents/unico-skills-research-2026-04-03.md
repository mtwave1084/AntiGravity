# ユニコ式 Claude Code × Remotion Skills 調査レポート

- 日時：2026-04-03
- 対象：`Contents/Brain参考記事/ユニコ記事.md` + `unico_Claude_Code/2026-03-26_1755_remotion-skills-claude/.claude/`
- 目的：設計思想・特徴・AGYでの可用性・運用注意事項の整理

---

## 1. Brain記事の設計思想（セールス構造分析）

### 1-1. セールスフロー

```
① 問題提起（動画生成AIだけでは差別化できない時代）
② 著者実績（動画編集歴15年・Xフォロワー4万超・スクール生934人・月100万達成受講生）
③ 解決策の提示（AIエージェントが台本〜編集まで全自動）
④ 機能一覧（全10項目 + スタイル30種 + サポート体制）
⑤ 第三者の声（YouTubeプロ「ミカ」の監修コメント）
⑥ FAQ（ハードル除去：PC必須・プログラミング不要・費用の目安）
⑦ 価格・CTA（段階値上げ形式）
```

### 1-2. ユニコスタイルの特徴

| 要素 | 内容 |
|------|------|
| 熱量 | 「！！」多用。「もう〜はいりません」「全部任せろ」系の断言フレーズ |
| 共感 | 「面倒くさいですよね？動画編集歴15年の僕ですら面倒で仕方ない」|
| 転換フレーズ | 「だけど違います」「だから開発したんです」「もう違います」 |
| 実績数字 | 4.7万インプ、300ブックマーク、10万人の銀の盾、月100万達成 |
| 特典体制 | 5大特典（コミュニティ・生放送サポート・添削・スタイル追加） |
| サポート強調 | 生放送5時間・電話サポート・「絶対に挫折させない」 |

### 1-3. ターゲット設定の構造

「動画生成AI（Sora/Veo/Runway）で止まっている層」を明確に設定し、  
「それだけでは差別化できない → 台本〜編集まで全自動のエージェントが必要」という  
問題 → 解決の流れが明確。初心者・非エンジニア向けの配慮（プログラミング不要を強調）も徹底。

---

## 2. `.claude/` ディレクトリ構造

```
.claude/
├── CLAUDE.md               ← 総合ルートルール（全設定の起点）
├── agents/                 ← 5エージェント定義
│   ├── audio-quality-reviewer/
│   ├── image-consistency-checker/
│   ├── simple-manga-video/
│   ├── video-list-viewer/
│   └── video-numbering/
├── rules/                  ← 19ルール（品質保証・ワークフロー・UI・音声）
├── skills/                 ← 10スキル（動画制作の全工程をカバー）
├── resources/              ← 同梱リソース
│   ├── bgm/default-bgm.mp3          ← ジャズループBGM
│   ├── style-catalog.md/html         ← 30スタイルカタログ
│   └── style-samples/style-XX.jpg    ← 30枚サムネイル
├── templates/              ← HTMLテンプレート4種
│   ├── preview.html
│   ├── subtitle-review.html
│   ├── fix-check.html
│   └── completion.html
├── scaffold/               ← Remotionプロジェクト骨格（自動セットアップ用）
├── setup.sh                ← 初回セットアップスクリプト
└── .env.example            ← APIキーテンプレート（フリーモデルID3つ同梱）
```

---

## 3. 設計哲学：.claude フォルダ Self-contained 原則

**最重要原則：「.claudeフォルダだけを渡せば、受け取った人が同じ動画制作挙動を再現できる」**

### Self-contained の実装方法

| 要素 | 方法 |
|------|------|
| BGM | `.claude/resources/bgm/` に同梱、setup.sh が自動コピー |
| スタイル資料 | `.claude/resources/style-catalog.*` + 30枚サンプル同梱 |
| プロジェクト骨格 | `.claude/scaffold/` に Remotion テンプレート全体を同梱 |
| APIキー管理 | `.env.example` にフリーモデルID同梱、実APIキーは `skills-demo/.env` のみ |
| セキュリティ | 配布前チェック（シークレット検索・個人情報検索・ファイル数確認）をスキルに内包 |

### Self-contained ルールの意味するもの

ユニコの `.claude/` は「AIエージェントの設定集」を超えて、  
**「ZIPで配布可能なワンパッケージ製品」**として設計されている。  
これはBrainという販売形態（購入 → ダウンロード → 即使用）に最適化した設計思想。

---

## 4. スキル詳細（10スキル）

| スキル名 | 役割 | API/ツール |
|---------|------|-----------|
| `simple-manga-video` | メイン動画制作（4ステップ確認フロー） | Fish Audio + fal.ai |
| `fish-audio-tts` | 日本語音声生成・ジェットカット・速度変換 | Fish Audio API |
| `gemini-image` | 2K画像生成（30スタイルカタログ） | fal.ai → Gemini 3 Pro Image |
| `remotion-script-gen` | 台本生成 | Claude |
| `distribute-zip` | 配布用ZIP作成（セキュリティチェック付き） | bash / grep |
| `lipsync` | リップシンク動画生成 | 外部API |
| `video-translator` | 翻訳動画生成 | Claude + TTS |
| `youtube-thumbnail` | YouTubeサムネイル生成 | fal.ai |
| `seo-title` | SEOタイトル5案生成 | Claude |
| `manga-bubble` | マンガふきだし挿入 | Canvas/SVG |

### simple-manga-video の4ステップ確認フロー

```
STEP 1: 🎨 スタイル選択 + 素材生成（TTS音声 + 画像）
        → HTML確認: style-catalog.html
STEP 2: 👀 レンダリング前確認（プレビューHTML）
        → HTML確認: preview-[動画名].html（速度切替ボタン付き）
STEP 2.5: 🔧 修正確認（修正がある場合のみ）
          → HTML確認: fix-check-[動画名].html（修正前後diff付き）
STEP 3: 📝 字幕レビュー（レンダリング前必須）
        → HTML確認: subtitle-review-[動画名].html
STEP 4: 🎬 レンダリング + 完成動画
        → HTML確認: completion-[動画名].html（SEOタイトル5案付き）
```

**設計ポイント：** 各ステップでHTMLを生成してユーザー確認を挟む。STEPスキップは絶対禁止。  
全自動でありながら「人間が確認する箇所」を明確に定義した設計。

---

## 5. ルール設計の分類（19ルール）

### 品質保証系
- `audio-validation` / `frame-validation` / `audio-processing` — 音声フレーム数計算・二重変換防止
- `scene-order` — シーン順序の一貫性保証
- `pronunciation-patterns` — 多義読み漢字の誤読パターン集

### ワークフロー系
- `parallel-production` — 複数動画の並列制作ルール（素材生成のみ並列、確認は1本ずつ）
- `subtitle-writing` / `subtitle-formatting` — 読み文字 vs 字幕テロップの分離ルール

### 配布設計
- `self-contained` — .claudeフォルダ完結の原則（前述）
- `user-extensions` — ユーザーによるアレンジのガイドライン

### UI/出力系
- `html-naming` — 確認HTML命名規則（CNT-XXXXX-STEP-XX-...）
- `html-open` — HTMLを自動で開く動作ルール
- `video-html` — 完成動画HTML必須要素（SEOタイトル・ダウンロードボタン）

### コンテンツ系
- `simple-manga` / `shorts-video` / `translated-videos` — 各動画タイプのルール
- `image-generation` / `style-tuning` / `component-api` — 画像・スタイル・コンポーネント設定

---

## 6. AGYプロジェクトへの可用性

### 6-1. そのまま活用できるもの ✅

| 要素 | AGYでの活用方法 |
|------|--------------|
| **Remotion動画制作フロー** | `remotion-project/` に同設計思想を適用可能。ステップ確認HTML方式は動画品質向上に直結 |
| **fal.ai 画像生成** | `fal-ai/gemini-3-pro-image-preview` = Nanobanana Pro の正式モデルID。AGYでも fal.ai 経由で使用可能 |
| **30スタイルカタログ** | そのままコピーしてカタログUI化可能。日本カルチャー特化の良質なスタイル集 |
| **Fish Audio TTS 設計** | 漢字そのまま渡す・ジェットカット・速度変換の手順はAGY動画制作にそのまま適用 |
| **distribute-zip 設計** | AGYでコンテンツを配布する場合のセキュリティチェックパターンとして参照 |

### 6-2. 設計思想として参考にすべきもの 📚

| 要素 | AGYへの示唆 |
|------|-----------|
| **Self-contained 設計** | AGYの `.claude/` も「skills-demo相当のプロジェクトを自動セットアップする」設計にできる |
| **読み文字 vs 字幕テロップの分離** | AGY動画制作時の基本ルールとして採用すべき重要な区別 |
| **HTMLステップ確認フロー** | 動画制作のQAとして有効。AGYではDiscordに確認HTMLを添付してCTAする方式に転用可能 |
| **BGM内包設計** | `remotion-project/public/bgm/` に共通BGMを置き、全動画で参照する設計 |

### 6-3. AGY固有の注意が必要なもの ⚠️

| 要素 | 注意内容 |
|------|---------|
| **fal.ai APIコスト** | $0.15/image〜（解像度で変動）。AGYで積極利用する場合は月次費用を試算すること |
| **Fish Audio ボイスクローニング** | 自分の声を使う場合は Fish Audio に別途音声データを登録が必要 |
| **Remotionの音声処理** | `playbackRate` 使用禁止 → 事前 ffmpeg 変換必須。これを忘れると音声途切れが発生 |
| **APIキー管理** | Fish Audio + fal.ai の2つが必要。`.env` は `.claude/` に絶対に含めない |

---

## 7. 運用上の注意事項

### 音声関連（重要度：高）

1. **Remotionで音声速度変更は `playbackRate` 禁止** → 事前に ffmpeg で変換
2. **速度設定を変えた場合は全音声を削除して全件再生成** — `fs.existsSync` でスキップされるため部分再生成は二重変換を起こす
3. **音声パスは `public/audio/`** — `out/audio/` を変換しても無効
4. **フレーム数計算** = `Math.ceil(変換後秒数 × 30) + 5`

### 画像生成関連

1. **デフォルトのアスペクト比は 9:16（縦）**。横動画の場合のみ 16:9 に変更
2. **スタイルカタログのプロンプトをそのままコピーしない** — STYLE + CHAR + シーンプロンプトの3定数体制が必須
3. **fal.ai 残高切れは Forbidden エラー**で検出できる

### 設定ファイル関連

1. **settings.json の `defaultMode` に `"ask"` は無効値** → Claude Code 起動エラーになる
2. **個人ボイスID (`FISH_AUDIO_REFERENCE_ID`) は `.claude/` に書かない** — ZIP配布に含まれるため

### 配布・セキュリティ関連

1. **配布前チェック6項目** — シークレット検索、サンプル画像30枚確認、BGM確認、APIキー実値確認、個人情報検索、HTMLテンプレート4種確認
2. **配布ファイル名** = `YYYY-MM-DD_HHMM_remotion-skills-claude.zip`

---

## 8. Brain記事スタイルの参照ポイント（AGY記事執筆向け）

AGYでBrain記事を書く際、ユニコ記事から学べるポイント：

| ポイント | ユニコの例 | AGYへの応用 |
|---------|----------|-----------|
| **断言フレーズ** | 「もう動画編集者はいりません！」 | 「もうツールの比較で時間を使わなくていい！」 |
| **失敗体験から入る** | 「AI動画バブルで稼いだが今は通用しない」 | 「Claude Codeを入れても使いこなせなかった時期があった」 |
| **第三者の声** | YouTubeプロ「ミカ」の監修コメント | スクール生・コミュニティメンバーの声 |
| **サポート体制** | 生放送5時間・電話サポート | Discord常駐・月次振り返り生放送 |
| **アレンジ可能を強調** | 「好きにアレンジできる」 | 「自分用にカスタマイズできる構造」 |

---

## 9. 特筆すべき発見

### Nanobanana Pro = fal-ai/gemini-3-pro-image-preview

ユニコの CLAUDE.md に画像生成のモデルIDが明記されていた：

```
モデル: fal-ai/gemini-3-pro-image-preview
プロバイダー: fal.ai（2026年2月1日より）
コスト: $0.15/image〜
```

ソリスが「Nanobanana Pro」と呼んでいた画像生成エンジンの実体は **fal.ai 経由の `fal-ai/gemini-3-pro-image-preview`**。  
ユリ（Gemini CLI）は直接呼び出せないが、AGYに fal.ai 統合を追加すれば Claude Code（ティア）から直接呼び出せる。

---

*レポート生成：ティア*
