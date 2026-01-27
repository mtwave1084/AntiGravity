# Banana Shaker 要件定義書 v3.0

**更新日**: 2026-01-18  
**バージョン**: v3.0.0 動画生成機能・SDK移行

---

## 1. システム概要

### 1.1 プロジェクト名
**Banana Shaker** - 個人用AI画像・動画生成支援Webアプリケーション

### 1.2 目的
Gemini / Veo APIを使用して：
- プリセット管理による効率的な画像生成
- 履歴・ギャラリーによる再利用
- 入力画像を使った画像変換(img2img)
- **「Cute & Pop」な世界観で楽しく画像生成**
- **構造化インフォグラフィック・図解の自動生成**
- **【NEW】AI動画生成（Veo API）** 🆕

### 1.3 利用形態
- **対象**: 個人利用（開発者本人）
- **環境**: PCブラウザ
- **認証**: ログイン必須
- **デプロイ**: ローカル開発環境（`npm run dev`）

---

## 2. v3.0 新機能: 動画生成モード 🆕

### 2.1 機能概要

#### 目的
Veo APIを使用してテキスト・画像から高品質動画を生成する機能。

#### 特徴
- **複数モデル対応**: Veo 3.1, 3.1 Fast, 3.0, 3.0 Fast, 2.0
- **テキストto動画**: プロンプトから動画生成
- **画像to動画**: スタートフレーム/エンドフレーム指定
- **参照画像**: 最大3枚でスタイル・コンテンツガイド
- **音声付き生成**: Veo 3.x系モデルは音声付き動画対応

### 2.2 対応モデル

| モデル名 | 識別子 | 特徴 |
|----------|--------|------|
| Veo 3.1 | `veo-3.1-generate-preview` | 推奨・音声付き・4K対応 |
| Veo 3.1 Fast | `veo-3.1-fast-generate-preview` | 高速版 |
| Veo 3.0 | `veo-3.0-generate-001` | 安定版・音声付き |
| Veo 3.0 Fast | `veo-3.0-fast-generate-001` | 高速版 |
| Veo 2.0 | `veo-2.0-generate-001` | 音声なし |

### 2.3 生成パラメータ

| パラメータ | 値 | 説明 |
|------------|------|------|
| アスペクト比 | 16:9, 9:16 | 横向き/縦向き |
| 解像度 | 720p, 1080p, 4K | 出力品質 |
| 長さ | 4秒, 5秒, 6秒, 8秒 | 動画の長さ |
| スタートフレーム | 画像 | 開始位置の画像 |
| エンドフレーム | 画像 | 終了位置の画像 |
| 参照画像 | 最大3枚 | スタイル/アセット参照 |

### 2.4 UIフロー

```
[プロンプト入力]
     ↓
[モデル・パラメータ選択]
     ↓
[画像オプション] (スタート/エンドフレーム、参照画像)
     ↓
[生成開始] ← 約60秒〜2分待機
     ↓
[プレビュー表示]
     ↓
[確定] → 動画ギャラリーに保存
```

### 2.5 安全フィルター

Veo APIには厳格な安全ポリシーがあります：
- 子供に関するコンテンツはブロックされる可能性
- `raiMediaFilteredReasons`で理由が返される
- UI上にエラーメッセージとして表示

---

## 3. SDK移行 🆕

### 3.1 変更内容

| 項目 | 旧 | 新 |
|------|-----|-----|
| パッケージ | `@google/generative-ai` | `@google/genai` |
| クライアント | `GoogleGenerativeAI` | `GoogleGenAI` |
| 呼び出し方法 | `genAI.getGenerativeModel().generateContent()` | `ai.models.generateContent()` |

### 3.2 影響範囲

| ファイル | 変更内容 |
|----------|----------|
| `lib/nanobanana.ts` | SDK移行完了 |
| `lib/veo.ts` | 新規作成（Veo API対応） |
| `lib/diagram-agent/wireframe-generator.ts` | SDK移行完了 |
| `lib/diagram-agent/final-renderer.ts` | SDK移行完了 |

---

## 4. v2.x 機能: 図解生成モード

### 4.1 機能概要

#### 目的
テキスト入力から、構造化されたインフォグラフィック（図解）を自動生成する**エージェント型**機能。

#### 特徴
- **2段階生成**: ワイヤーフレーム → 最終描画
- **8種類の構造テンプレート**: 目的に応じた図解パターン
- **13種類のスタイル**: デザインバリエーション
- **参照画像統合**: 最大4枚の参照画像でスタイル・内容をガイド

### 4.2 モード切り替え

| モード | 説明 | 状態 |
|--------|------|------|
| 自由生成 | 従来のプロンプトベース画像生成 | ✅ |
| 図解生成 | 構造化インフォグラフィック生成 | ✅ |
| 動画生成 | Veo APIによる動画生成 | ✅ 🆕 |

- `/generate` ページでモード切り替えUI（3モード対応）

### 4.3 図解構造（Diagram Structures）

| 構造名 | 識別子 | 説明 | ユースケース |
|--------|--------|------|--------------|
| 比較図 | `comparison` | A vs B の並列比較 | 製品比較、Before/After |
| タイムライン | `timeline` | 時系列フロー | 歴史、計画、ロードマップ |
| 階層図 | `hierarchy` | ツリー構造 | 組織図、分類 |
| プロセス図 | `process_flow` | ステップバイステップ | 手順説明、フロー |
| サイクル図 | `cycle` | 循環プロセス | PDCAサイクル、ライフサイクル |
| ピラミッド | `pyramid` | レベル階層 | マズロー、優先度 |
| マインドマップ | `mindmap` | 中心から放射 | アイデア整理、概念図 |
| ガイドチャート | `guide_chart` | セクション分割 | チートシート、まとめ |

---

## 5. データベース

### 5.1 テーブル一覧

| テーブル | 用途 | バージョン |
|----------|------|------------|
| User | ユーザー情報 | v1.0 |
| ApiKey | API キー管理 | v1.0 |
| Preset | プリセット | v1.0 |
| GenerationJob | 画像生成ジョブ | v1.0 |
| Image | 生成画像データ | v1.0 (v2.1で`confirmed`追加) |
| DiagramJob | 図解生成ジョブ | v2.0 |
| DiagramImage | 図解画像データ | v2.0 |
| VideoJob | 動画生成ジョブ | v3.0 🆕 |
| Video | 生成動画データ | v3.0 🆕 |

### 5.2 VideoJob テーブル（新規）

```sql
CREATE TABLE IF NOT EXISTS VideoJob (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negativePrompt TEXT,
  aspectRatio TEXT,
  resolution TEXT,
  durationSeconds INTEGER,
  startFrameData TEXT,    -- JSON
  endFrameData TEXT,      -- JSON
  referenceImagesData TEXT, -- JSON
  operationName TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  errorMessage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
);
```

### 5.3 Video テーブル（新規）

```sql
CREATE TABLE IF NOT EXISTS Video (
  id TEXT PRIMARY KEY,
  jobId TEXT NOT NULL,
  mimeType TEXT NOT NULL,
  dataBase64 TEXT NOT NULL,
  durationSeconds INTEGER,
  favorite BOOLEAN DEFAULT 0,
  confirmed BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jobId) REFERENCES VideoJob(id)
);
```

---

## 6. ファイル構成

### 6.1 v3.0 追加分

| ファイル | 責務 |
|----------|------|
| `lib/veo.ts` | Veo API wrapper（生成・拡張） |
| `app/video-actions.ts` | 動画生成用Server Actions |
| `components/video-generator/VideoGeneratorForm.tsx` | 動画生成フォーム |
| `components/video-gallery-grid.tsx` | 動画ギャラリーグリッド |
| `app/(main)/video-gallery/page.tsx` | 動画ギャラリーページ |
| `scripts/migrate-video.js` | DBマイグレーション |

### 6.2 サイドバー構成

```
ダッシュボード
プリセット
自由生成
図解生成
動画生成  🆕
ギャラリー
図解ギャラリー
動画ギャラリー  🆕
設定
```

---

## 7. 既知の制約

### 7.1 技術的制約（継続）
1. **本番ビルド不可**: `better-sqlite3`のネイティブモジュール問題
2. **画像・動画保存方法**: SQLiteにBase64保存

### 7.2 動画生成固有の制約 🆕
1. **生成時間**: 1〜2分程度かかる（ポーリングで待機）
2. **安全フィルター**: 子供関連のコンテンツは高確率でブロック
3. **ファイルサイズ**: 4K動画は10MB以上になりうる
4. **内部サーバーエラー**: 一時的に発生することがある（リトライで解決）

### 7.3 ギャラリー機能の既知課題（v2.1）

| 課題 | 状態 | 説明 |
|------|------|------|
| ライトボックス閉じ時の遷移 | 保留 | ライトボックスを閉じた際、infoダイアログに戻らずギャラリーに戻る |
| ライトボックス上のダウンロード | 保留 | ライトボックス上のダウンロードボタンがクリックできない |

---

## 8. 今後の展望

### 8.1 v3.1以降予定

| 機能 | 優先度 | 説明 |
|------|--------|------|
| 動画拡張機能 | 中 | `extendVeoVideo`を使った動画延長（バックエンド実装済み、UI未実装） |
| 構造の自動推論 | 低 | テキスト解析から最適構造を提案 |
| プリセット機能の図解モード対応 | 低 | - |
| 日本語テキスト品質向上 | 低 | - |

---

## 9. 変更履歴

### v3.0.0 (2026-01-18)
- 🆕 **動画生成機能（Veo API統合）**
  - Veo 3.1/3.0/2.0 モデル対応
  - テキストto動画、画像to動画
  - スタート/エンドフレーム指定
  - 参照画像（最大3枚）
  - 動画プレビュー・確定フロー
  - 動画ギャラリー
- 🆕 **SDK移行**
  - `@google/generative-ai` → `@google/genai` 完全移行
- 🆕 **エラーハンドリング強化**
  - 安全フィルター(RAI)エラーの日本語表示
  - API内部エラーの適切なハンドリング
- ⚙️ **データベース変更**
  - VideoJob, Videoテーブル追加
  - migrate-video.jsスクリプト追加

### v2.1.0 (2026-01-07)
- 🆕 **自由生成プレビュー強化**
  - ライトボックスによるフルスクリーンプレビュー
  - 修正テキストボックス追加（再生成可能）
  - 確定フロー導入（確定前は未保存）
- 🆕 **ギャラリー改善**
  - 画像詳細ダイアログ→拡大ボタン→ライトボックスの遷移
- 🆕 **日本語対応**
  - 自由生成フォームラベルの日本語化
- ⚙️ **データベース変更**
  - Imageテーブルに`confirmed`カラム追加

### v2.0.0 (2025-12-19)
- 🆕 **図解生成モード（エージェント機能）**
  - モード切り替えUI
  - 8種類の図解構造
  - 13種類のデザインスタイル
  - 2段階生成（ワイヤーフレーム→最終描画）

### v1.3.0 (2025-12-05)
- ✅ 参照画像機能
- ✅ クライアント側画像圧縮
- ✅ 生成結果インラインプレビュー

