# Banana Shaker 要件定義書 v1.1

**更新日**: 2025-01-28  
**バージョン**: v1.1.1 実装完了

---

## 1. システム概要

### 1.1 プロジェクト名
**Banana Shaker** - 個人用画像生成支援Webアプリケーション

### 1.2 目的
Nanobanana / Nanobanana Pro (Gemini画像生成API)を使用して：
- プリセット管理による効率的な画像生成
- 履歴・ギャラリーによる再利用
- 入力画像を使った画像変換(img2img)
- ストレスフリーな画像生成環境の提供

### 1.3 利用形態
- **対象**: 個人利用（開発者本人）
- **環境**: PCブラウザ
- **認証**: ログイン必須
- **デプロイ**: ローカル開発環境（`npm run dev`）

---

## 2. 実装済み機能（v1.1.1）

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
- ✅ 解像度: 1k, 2k, 4k
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
- ✅ 画像詳細モーダル
- ✅ お気に入り機能（いいね）
- ✅ 画像ダウンロード
- ✅ フルサイズ表示切り替え
- ✅ リミックス機能（パラメータ再利用）

### 2.6 UIテーマ
- ✅ ビビッドグリーン＋バナナイエロー配色
- ✅ 明るく親しみやすいデザイン
- ✅ レスポンシブレイアウト
- ✅ ダークモード対応（CSS変数のみ）

---

## 3. 技術スタック

### 3.1 フロントエンド
- **フレームワーク**: Next.js 16.0.4
- **ルーティング**: App Router
- **言語**: TypeScript
- **UIライブラリ**: shadcn/ui
- **スタイリング**: Tailwind CSS
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

### 5.1 ディレクトリ構成
```
Banana Shaker/
├── app/
│   ├── (auth)/
│   │   └── login/          # ログインページ
│   ├── (main)/
│   │   ├── page.tsx        # ダッシュボード
│   │   ├── generate/       # 生成ページ
│   │   ├── presets/        # プリセット管理
│   │   ├── gallery/        # ギャラリー
│   │   └── settings/       # 設定
│   ├── api/
│   │   └── auth/           # Auth.js API
│   ├── actions.ts          # Server Actions
│   ├── layout.tsx          # ルートレイアウト
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── app-sidebar.tsx
│   ├── site-header.tsx
│   ├── generator-form.tsx
│   ├── preset-dialog.tsx
│   ├── presets-list.tsx
│   ├── gallery-grid.tsx
│   ├── image-detail-dialog.tsx
│   └── api-key-form.tsx
├── lib/
│   ├── db.ts               # Database connection
│   ├── nanobanana.ts       # Image generation wrapper
│   ├── crypto.ts           # Encryption utilities
│   └── actions.ts          # Auth actions
├── scripts/
│   ├── migrate.js          # Database migration
│   └── seed-user.js        # Initial user creation
├── auth.ts                 # Auth.js configuration
├── auth.config.ts          # Auth.js config
├── middleware.ts           # Auth middleware
└── next.config.ts          # Next.js configuration
```

### 5.2 主要コンポーネント

#### Server Actions (`app/actions.ts`)
- `saveApiKey()`: APIキー保存
- `getApiKeys()`: APIキー取得
- `createPreset()`: プリセット作成
- `updatePreset()`: プリセット更新
- `deletePreset()`: プリセット削除
- `getPresets()`: プリセット一覧取得
- `generateImage()`: 画像生成
- `getHistory()`: 履歴取得
- `toggleFavorite()`: お気に入り切り替え

#### Image Generation Wrapper (`lib/nanobanana.ts`)
- `runNanoImageJob()`: 画像生成実行
- モック対応（`mock-`で始まるAPIキー）
- 複数枚生成対応（順次実行）
- Base64画像データ返却

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
- 生成ボタン

### 6.4 プリセットページ (`/presets`)
- プリセット一覧（カード表示）
- 新規作成ボタン
- 各カードに編集・削除・使用ボタン
- プリセット作成/編集モーダル

### 6.5 ギャラリーページ (`/gallery`)
- 画像グリッド表示
- クリックで詳細モーダル
- モーダル機能:
  - **フルサイズ表示切り替え**
  - **いいねボタン**
  - **ダウンロードボタン**
  - リミックスボタン
  - プロンプト・パラメータ表示

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

3. **Gemini API制約**
   - 無料プランではGemini 3 Pro Imageのクォータが厳しい
   - 解像度パラメータはプロンプトに含めるが、実際の効果は不明

### 7.2 機能的制限
1. **リミックス機能**
   - プロンプトのみ引き継ぎ
   - 入力画像の再読み込みは未対応

2. **非同期処理**
   - 生成中はブロッキング
   - プログレス表示なし

---

## 8. セットアップ手順

### 8.1 初回セットアップ
```bash
# 依存関係インストール
npm install

# データベースマイグレーション
node scripts/migrate.js

# 初期ユーザー作成
node scripts/seed-user.js
# デフォルト: admin@example.com / password123
```

### 8.2 環境変数
`.env`ファイルを作成:
```env
AUTH_SECRET=banana-shaker-secret-key-for-local-development-only-change-in-production
DATABASE_URL=file:./database.db
```

### 8.3 実行
```bash
npm run dev
# http://localhost:3000 でアクセス
```

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

### 9.3 優先度低
- [ ] キャラクターシート生成
- [ ] コミックレイアウト生成
- [ ] バッチダウンロード
- [ ] タグ検索・フィルタリング

---

## 10. 変更履歴

### v1.1.1 (2025-01-28)
- ✅ フルサイズ画像表示機能
- ✅ いいね機能
- ✅ ダウンロード機能
- ✅ Task Type選択肢追加（image-to-image）
- ✅ 9:16アスペクト比追加
- ✅ outputResolution API修正
- ✅ デバッグログ追加

### v1.1.0 (2025-01-27)
- ✅ ビビッドグリーン＋バナナイエローテーマ
- ✅ img2img機能（画像アップロード）
- ✅ ギャラリー強化

### v1.0.0 (2025-01-26)
- ✅ 初期実装完了
- ✅ 認証・APIキー管理
- ✅ 画像生成・プリセット・ギャラリー
