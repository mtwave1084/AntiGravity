# Banana Shaker 要件定義書 v1.2

**更新日**: 2025-12-01  
**バージョン**: v1.2.0 UIリニューアル & API修正完了

---

## 1. システム概要

### 1.1 プロジェクト名
**Banana Shaker** - 個人用画像生成支援Webアプリケーション

### 1.2 目的
Nanobanana / Nanobanana Pro (Gemini画像生成API)を使用して：
- プリセット管理による効率的な画像生成
- 履歴・ギャラリーによる再利用
- 入力画像を使った画像変換(img2img)
- **「Cute & Pop」な世界観で楽しく画像生成**

### 1.3 利用形態
- **対象**: 個人利用（開発者本人）
- **環境**: PCブラウザ
- **認証**: ログイン必須
- **デプロイ**: ローカル開発環境（`npm run dev`）

---

## 2. 実装済み機能（v1.2.0）

### 2.1 認証機能
- ✅ メール＋パスワードによるログイン
- ✅ Auth.js (v5) Credentials Provider
- ✅ セッション管理
- ✅ 未認証時の自動リダイレクト

### 2.2 APIキー管理
- ✅ Nanobanana / Nanobanana Pro APIキー登録
- ✅ AES-256-CBC暗号化保存
- ✅ 設定画面での更新機能

### 2.3 画像生成機能

#### Text-to-Image (通常生成)
- ✅ プロンプト入力
- ✅ ネガティブプロンプト
- ✅ プロバイダ選択: Nanobanana / Nanobanana Pro
- ✅ アスペクト比: 1:1, 2:3, 3:2, 3:4, 4:3, 9:16, 16:9
- ✅ 解像度: 1k, 2k, 4k (**API `imageConfig` 正式対応**)
- ✅ 生成枚数: 1〜4枚
- ✅ シード値指定（任意）

#### Image-to-Image (img2img)
- ✅ 画像アップロード機能
- ✅ Base64エンコード
- ✅ プレビュー表示
- ✅ アップロード画像削除機能
- ✅ 自動的にタスクタイプ切り替え

### 2.4 プリセット機能
- ✅ プリセット作成・編集・削除
- ✅ タイトル・タグ管理
- ✅ 全パラメータ保存
- ✅ プリセットからの生成
- ✅ カード形式の一覧表示

### 2.5 ギャラリー・履歴
- ✅ グリッド表示
- ✅ 画像詳細モーダル (**スクロールバー対応**)
- ✅ お気に入り機能（いいね）
- ✅ 画像ダウンロード
- ✅ フルサイズ表示切り替え
- ✅ リミックス機能（パラメータ再利用）

### 2.6 UIテーマ (**大幅リニューアル**)
- ✅ **Cute & Pop テーマ**
  - メインカラー: オレンジ (`#FF9F43`)
  - サブカラー: グリーン (`#2ECC71`)
  - 背景: ウォームクリーム (`#FFF9F0`)
- ✅ **マスコットキャラクター統合**
  - サイドバーに常時表示
- ✅ **角丸・ポップなデザイン**
  - ボタンやカードに大きな角丸 (`rounded-xl`〜`3xl`)
  - ホバー時のバウンスアニメーション
- ✅ レスポンシブレイアウト

---

## 3. 技術スタック

### 3.1 フロントエンド
- **フレームワーク**: Next.js 16.0.4
- **ルーティング**: App Router
- **言語**: TypeScript
- **UIライブラリ**: shadcn/ui (カスタマイズ済み)
- **スタイリング**: Tailwind CSS v4
- **フォント**: Google Fonts (Inter)

### 3.2 バックエンド
- **認証**: Auth.js v5
- **データベース**: SQLite (`better-sqlite3`)
- **暗号化**: AES-256-CBC (Node.js crypto)
- **画像生成API**: Google GenAI SDK (`@google/generative-ai`)

### 3.3 モデル
- **Nanobanana**: `gemini-2.5-flash-image`
- **Nanobanana Pro**: `gemini-3-pro-image-preview`

---

## 4. データベーススキーマ
*(v1.1から変更なし)*

### 4.1 User テーブル
```sql
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### 4.2 ApiKey テーブル
```sql
CREATE TABLE ApiKey (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  provider TEXT NOT NULL,
  encryptedKey TEXT NOT NULL,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  UNIQUE(userId, provider)
)
```

### 4.3 Preset テーブル
```sql
CREATE TABLE Preset (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  tags TEXT,
  provider TEXT NOT NULL,
  taskType TEXT NOT NULL,
  aspectRatio TEXT,
  outputResolution TEXT,
  numOutputs INTEGER DEFAULT 1,
  seed INTEGER,
  prompt TEXT NOT NULL,
  negativePrompt TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
)
```

### 4.4 GenerationJob テーブル
```sql
CREATE TABLE GenerationJob (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  presetId TEXT,
  provider TEXT NOT NULL,
  taskType TEXT NOT NULL,
  prompt TEXT NOT NULL,
  negativePrompt TEXT,
  aspectRatio TEXT,
  outputResolution TEXT,
  numOutputs INTEGER DEFAULT 1,
  seed INTEGER,
  status TEXT DEFAULT 'pending',
  errorMessage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (presetId) REFERENCES Preset(id)
)
```

### 4.5 Image テーブル
```sql
CREATE TABLE Image (
  id TEXT PRIMARY KEY,
  jobId TEXT NOT NULL,
  "index" INTEGER NOT NULL,
  mimeType TEXT NOT NULL,
  dataBase64 TEXT NOT NULL,
  label TEXT,
  favorite INTEGER DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (jobId) REFERENCES GenerationJob(id)
)
```

---

## 5. アーキテクチャ
*(v1.1から変更なし)*

---

## 6. 画面仕様

### 6.1 ログイン画面 (`/login`)
- メールアドレス・パスワード入力
- エラー表示
- 認証成功後にダッシュボードへ遷移

### 6.2 ダッシュボード (`/`)
- 最近のプリセット表示
- 最近の生成画像表示
- 各項目クリックで詳細ページへ遷移

### 6.3 生成ページ (`/generate`)
- **ポップなデザインのフォーム**
- プリセット読み込み
- プロバイダ選択
- タスクタイプ選択
- プロンプト入力
- ネガティブプロンプト入力
- アスペクト比選択
- 解像度選択
- 生成枚数指定
- シード値指定
- **画像アップロード（img2img用）**
- **アニメーション付き生成ボタン**

### 6.4 プリセットページ (`/presets`)
- プリセット一覧（カード表示）
- 新規作成ボタン
- 各カードに編集・削除・使用ボタン
- プリセット作成/編集モーダル

### 6.5 ギャラリーページ (`/gallery`)
- 画像グリッド表示
- クリックで詳細モーダル
- モーダル機能:
  - **ポップなデザイン（角丸・ボーダー）**
  - **スクロール可能なプロンプトエリア**
  - フルサイズ表示切り替え
  - いいねボタン
  - ダウンロードボタン
  - リミックスボタン

### 6.6 設定ページ (`/settings`)
- Nanobanana APIキー管理
- Nanobanana Pro APIキー管理

---

## 7. 既知の制約・課題

### 7.1 技術的制約
1. **本番ビルド不可**
   - `better-sqlite3`のネイティブモジュール問題
   - 現状は`npm run dev`での運用のみ
   
2. **画像保存方法**
   - SQLiteにBase64文字列として保存
   - 大量画像には不向き（将来的にファイルシステムまたはクラウドストレージへ移行検討）

### 7.2 機能的制限
1. **リミックス機能**
   - プロンプトのみ引き継ぎ
   - 入力画像の再読み込みは未対応

2. **非同期処理**
   - 生成中はブロッキング
   - プログレス表示なし

---

## 8. セットアップ手順
*(v1.1から変更なし)*

---

## 9. 今後の展望（v2以降）

### 9.1 優先度高
- [ ] 本番ビルド対応（better-sqlite3問題の解決）
- [ ] 外部ストレージ対応（S3/GCS）
- [ ] リミックス時の画像再読み込み
- [ ] お気に入りフィルター機能

### 9.2 優先度中
- [ ] 非同期生成とプログレス表示
- [ ] 複数ユーザー対応
- [ ] 外部認証（Google/GitHub）
- [ ] 画像編集機能（切り抜き・回転）

---

## 10. 変更履歴

### v1.2.0 (2025-12-01)
- ✅ **UI完全リニューアル ("Cute & Pop" テーマ)**
  - オレンジ/グリーン/クリームの配色
  - マスコットキャラクターのサイドバー統合
  - 角丸・アニメーションUI
- ✅ **解像度API修正**
  - `imageConfig` 構造への正式対応
  - 2K/4K生成の動作確認完了
- ✅ **ギャラリー改善**
  - 詳細ポップアップへのスクロールバー追加
  - デザインの統一

### v1.1.1 (2025-01-28)
- ✅ フルサイズ画像表示機能
- ✅ いいね機能
- ✅ ダウンロード機能
- ✅ Task Type選択肢追加（image-to-image）
- ✅ 9:16アスペクト比追加
- ✅ outputResolution API修正（プロンプトベース）
- ✅ デバッグログ追加

### v1.1.0 (2025-01-27)
- ✅ ビビッドグリーン＋バナナイエローテーマ
- ✅ img2img機能（画像アップロード）
- ✅ ギャラリー強化

### v1.0.0 (2025-01-26)
- ✅ 初期実装完了
- ✅ 認証・APIキー管理
- ✅ 画像生成・プリセット・ギャラリー
