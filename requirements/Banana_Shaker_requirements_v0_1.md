# NanoStudio（仮）暫定要件定義書 v0.1

## 1. システム概要

- **名称（仮）**：Banana Shaker  
- **目的**：  
  Nanobanana / Nanobanana Pro（以下まとめて Nanobanana 系）を、
  - プリセット管理
  - 再利用しやすい履歴・ギャラリー
  - 入力画像を使った生成
  で「自分がストレスなく使うため」の **個人用画像生成支援Webアプリ** として構築する。

- **利用形態**：
  - PCブラウザ前提
  - ログイン必須
  - v1は管理者（=本人）専用  
  - 将来、一般公開し「UI提供＋利用者自身のAPIキー」での利用も視野

---

## 2. 想定ユーザー・ユースケース

### 2.1 想定ユーザー

- **主ユーザー**：開発者本人（Nanobananaヘビーユーザー）
- **将来的ユーザー**（v2以降）：
  - 画像生成を日常的に行うクリエイター
  - キャラクターデザインを量産したい人
  - マンガ・同人系ラフをAIで出したい人

### 2.2 主要ユースケース（v1視点）

1. **プリセット管理**
   - よく使うプロンプト＋パラメータをプリセットとして保存
   - 一覧から選択し1クリックで生成

2. **通常生成**
   - プロンプト＋パラメータをその場で入力し生成
   - プリセットを読み込んで微調整して生成

3. **入力画像を利用した生成**
   - 画像をアップロードし、構図や衣装・背景などを差し替えて生成

4. **履歴・ギャラリー**
   - 過去の生成結果を一覧で閲覧
   - プロンプト・パラメータを確認し、同じ条件で再生成

※ キャラクターシート（3面図＋アップ）、ポーズ差分、マンガ的コマ割りは v2 で本格対応予定。

---

## 3. 機能要件（v1）

### 3.1 認証・ユーザー管理

- [MUST] ログイン機能（メール＋パスワード）
- [MUST] 認証状態の維持（セッション）
- [MUST] 未ログイン時はログイン画面へリダイレクト
- [FUTURE] 外部認証（Google / X / GitHub 等）

### 3.2 APIキー管理

- [MUST] Nanobanana / Nanobanana Pro の APIキー入力フォーム
- [MUST] APIキーの保存・更新・削除
- [MUST] 生成実行時に該当サービスのキーを使用
- [MUST] APIキー未設定時のエラーメッセージ表示
- [SHOULD] 画面上は伏字表示＋「表示/隠す」切替

### 3.3 画像生成機能

#### 3.3.1 通常生成

- 入力項目：
  - 使用サービス：`Nanobanana / Nanobanana Pro`
  - 生成枚数：1〜4枚程度
  - アスペクト比：例）1:1, 2:3, 3:4, 9:16 など
  - 解像度：`1k / 2k / 4k`（Proのみ利用）
  - シード：数値 or auto（null）
  - メインプロンプト（必須）
  - ネガティブプロンプト（任意）
- 動作：
  - 「生成」ボタンで `/api/generate` にPOST
  - 生成中ステータス表示（スピナー・メッセージ）
  - 完了後にサムネイル一覧表示
- エラー：
  - 通信エラー / APIキー未設定 / レートリミット 等をユーザーに分かるメッセージで表示

#### 3.3.2 入力画像付き生成

- 入力項目追加：
  - 入力画像アップロード（単一）
  - 「変化タイプ」選択（例：構図変え / 衣装変更 / 背景変更）
- 動作：
  - 画像を一時ストレージに保存
  - `/api/generate` で該当画像をBase64に変換して Nanobanana に渡す
  - 変化タイプはプロンプトに補足テキストとして反映

### 3.4 プリセット機能

- プリセット項目：
  - タイトル（必須）
  - タグ（任意、カンマ区切り）
  - プロバイダ：`nanobanana / nanobanana-pro`
  - タスク種別：`text-to-image` など（v1は主に text-to-image）
  - アスペクト比
  - 解像度
  - 生成枚数
  - シード
  - メインプロンプト
  - ネガティブプロンプト
- 必須機能：
  - [MUST] 一覧・検索（タイトル・タグ）
  - [MUST] 新規作成・編集・削除
  - [MUST] 「このプリセットで生成」ボタン
  - [MUST] 編集画面から「保存」「保存して生成」

### 3.5 ギャラリー・履歴

- 記録する内容：
  - 生成日時
  - 使用サービス（Nanobanana / Pro）
  - タスク種別
  - プロンプト・ネガティブプロンプト
  - 生成パラメータ（アスペクト比、解像度、枚数、シード）
  - 紐づくプリセットID（あれば）
- 機能：
  - [MUST] サムネイル一覧表示（ページング）
  - [MUST] フィルタ（日時、プロバイダ、プリセットIDなど）
  - [MUST] サムネクリックで詳細モーダル表示
  - [MUST] モーダルから「この設定で再生成」
  - [SHOULD] お気に入りフラグと絞り込み

---

## 4. 画面仕様（v1）

### 4.1 共通レイアウト

- 左サイドバー＋上部ヘッダー＋メインコンテンツ構成

```text
+--------------------------------------------------------------+
| [NanoStudio]                [生成ジョブ数]  [ユーザー情報]  |
+-------------+-----------------------------------------------+
| ダッシュボード |                                           |
| プリセット     |                                           |
| 通常生成       |        メインコンテンツ                     |
| ギャラリー     |                                           |
| 設定           |                                           |
+-------------+-----------------------------------------------+
```

### 4.2 ログイン画面

- 項目：Email / Password
- ボタン：ログイン
- 未ログイン時の全アクセスをこの画面へ誘導

### 4.3 ダッシュボード

- 表示内容：
  - 最近使ったプリセット（最大5件）
  - 最近生成した画像（最大8件）
- 操作：
  - プリセットカード→編集／生成へ遷移
  - 画像サムネ→ギャラリー詳細モーダル

### 4.4 プリセット一覧

- 上部：検索フォーム（キーワード・タグ）
- 本体：プリセットカードリスト
  - タイトル
  - モデル種別
  - タグ
  - 更新日時
  - [編集] [このプリセットで生成] [削除]
- 右上：`+ 新規プリセット`

### 4.5 プリセット編集

- 入力項目：
  - タイトル、タグ
  - モデル種別
  - 生成枚数
  - アスペクト比、解像度
  - シード
  - メインプロンプト
  - ネガティブプロンプト
- 操作：
  - [保存] / [保存して生成]
  - エラー表示（未入力、バリデーションエラーなど）

### 4.6 通常生成画面

- 上部：
  - 「既存プリセットから読み込む」セレクト＋読込ボタン
- 中央：
  - モデル種別、枚数、アスペクト比、解像度、シード
  - メインプロンプト、ネガティブプロンプト
- 下部（入力画像）：
  - 画像アップロード
  - 「ギャラリーから選ぶ」
  - 変化タイプセレクト
- 下部（結果）：
  - [生成] ボタン
  - 結果サムネイルグリッド

### 4.7 ギャラリー / 履歴

- 上部フィルタ：
  - 日付、プロバイダ、プリセット、検索ボックス
- 本体：
  - サムネイルグリッド
- 詳細モーダル：
  - 大きな画像
  - プロンプト / ネガティブプロンプト
  - パラメータ
  - 「この設定で再生成」
  - お気に入りトグル（あれば）

### 4.8 設定画面（APIキー）

- 項目：
  - Nanobanana APIキー
  - Nanobanana Pro APIキー
- 操作：
  - 入力・保存
  - 「表示/隠す」トグル
- APIキー未設定時に生成画面からエラー誘導を想定

---

## 5. API / ラッパ仕様（概要）

### 5.1 Nanobanana ラッパ（`lib/nanobanana.ts`）

#### 型定義（抜粋）

```ts
export type NanoModel = "nanobanana" | "nanobanana-pro";

export type ImageTaskType =
  | "text-to-image"
  | "image-to-image"
  | "multi-image-blend"
  | "character-sheet"
  | "character-variation"
  | "comic-layout";

export interface NanoImageJobRequest {
  apiKey: string;
  model: NanoModel;
  taskType: ImageTaskType;

  prompt: string;
  negativePrompt?: string;

  aspectRatio?: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "4:5" | "5:4" | "9:16" | "16:9" | "21:9";
  outputResolution?: "1k" | "2k" | "4k";
  numOutputs?: number;
  seed?: number;

  inputImages?: Array<{
    mimeType: string;
    dataBase64: string;
    role?: "base" | "style" | "reference" | "mask";
  }>;

  rawConfig?: Record<string, unknown>;
}

export interface NanoGeneratedImage {
  index: number;
  mimeType: string;
  dataBase64: string;
}

export interface NanoImageJobResult {
  images: NanoGeneratedImage[];
  rawResponse: unknown;
}

export async function runNanoImageJob(
  request: NanoImageJobRequest,
): Promise<NanoImageJobResult>;
```

#### 主な責務

1. APIキーから `GoogleGenAI` クライアント生成
2. モデルID解決（`gemini-2.5-flash-image` / `gemini-3-pro-image-preview`）
3. `contents`（テキスト＋画像）組み立て
4. `config`（`responseModalities: ["IMAGE"]`、`imageConfig`）組み立て
5. 画像部分を抽出し、`NanoImageJobResult` に詰めて返却
6. エラーをアプリ側で扱いやすい独自エラー型に変換

### 5.2 `/api/generate` ルート

- メソッド：`POST`
- 認証：必須
- 入力（例）：

```json
{
  "provider": "nanobanana-pro",
  "taskType": "text-to-image",
  "prompt": "キャラクターの説明...",
  "negativePrompt": "low quality, extra limbs",
  "aspectRatio": "3:4",
  "outputResolution": "2k",
  "numOutputs": 4,
  "seed": null,
  "inputImageId": null
}
```

- 処理フロー：
  1. ログイン確認
  2. ユーザーの APIキーを `ApiKey` テーブルから取得
  3. `inputImageId` があればストレージから取得し Base64 に変換
  4. `GenerationJob` を `status = pending` で作成
  5. `runNanoImageJob()` を呼び出し
  6. 返ってきた画像を `Image` テーブルへ保存
  7. `GenerationJob.status` を `success` に更新
  8. レスポンスとして `jobId` と 画像配列（Base64）を返却
  9. 失敗時は `status = error` とエラーメッセージを保存

- レスポンス（例）：

```json
{
  "jobId": "job_123",
  "images": [
    { "index": 0, "mimeType": "image/png", "dataBase64": "..." },
    { "index": 1, "mimeType": "image/png", "dataBase64": "..." }
  ]
}
```

---

## 6. データモデル（Prisma schema たたき台）

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // ハッシュ済み
  name      String?

  apiKeys        ApiKey[]
  presets        Preset[]
  generationJobs GenerationJob[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model ApiKey {
  id           String   @id @default(cuid())
  user         User     @relation(fields: [userId], references: [id])
  userId       String

  provider     String   // "nanobanana" | "nanobanana-pro"
  encryptedKey String   // 暗号化されたAPIキー

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, provider])
}

model Preset {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String

  title     String
  tags      String?  // "キャラ,立ち絵" など
  provider  String   // "nanobanana" | "nanobanana-pro"
  taskType  String   // "text-to-image" 等

  aspectRatio      String?
  outputResolution String?
  numOutputs       Int      @default(1)
  seed             Int?

  prompt          String
  negativePrompt  String?

  generationJobs  GenerationJob[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model GenerationJob {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id])
  userId    String

  preset    Preset?  @relation(fields: [presetId], references: [id])
  presetId  String?

  provider  String
  taskType  String

  prompt          String
  negativePrompt  String?

  aspectRatio      String?
  outputResolution String?
  numOutputs       Int
  seed             Int?

  status       String   // "pending" | "success" | "error"
  errorMessage String?

  images    Image[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Image {
  id        String   @id @default(cuid())
  job       GenerationJob @relation(fields: [jobId], references: [id])
  jobId     String

  index     Int
  mimeType  String

  dataBase64 String?
  url        String?

  label     String?   // 将来: front-view/panel-1 等の識別用
  favorite  Boolean   @default(false)

  createdAt DateTime @default(now())
}
```

---

## 7. 非機能要件（v1）

- **パフォーマンス**
  - 1ジョブあたり数十秒以内を目安
  - 生成処理はサーバー側で非同期実行（ただし v1は同期レスポンスでも可）
- **セキュリティ**
  - APIキーは平文保存しない（暗号化して `encryptedKey` に格納）
  - ログにAPIキーを出力しない
  - 公開時はHTTPS前提
- **信頼性**
  - 生成成功・失敗は `GenerationJob.status` に必ず反映
- **拡張性**
  - 他画像生成サービス追加を見据え、「provider」「taskType」で抽象化
  - v2でキャラクター・コマ割り用テーブルを追加可能なデータ構造にする

---

## 8. 技術スタック

- **フロント / API**：Next.js（App Router） + TypeScript
- **UI**：Tailwind CSS
- **認証**：Auth.js（旧 NextAuth.js 後継）
- **DB / ORM**：SQLite + Prisma
- **画像生成**：Google GenAI SDK 経由で
  - `gemini-2.5-flash-image`（Nanobanana）
  - `gemini-3-pro-image-preview`（Nanobanana Pro）
- **デプロイ想定**：
  - v1：ローカル開発・ローカル利用
  - 将来：Vercel + 外部DB（Supabase / Neon 等）も視野

---

## 9. 今後の拡張（v2候補）

- キャラクターシート機能
  - 3面図＋アップ生成ウィザード
  - キャラ設定（名前 / 性格 / 世界観）との紐づけ
- キャラクターポーズ・表情差分生成
  - キャラシートを選択し、ポーズ・表情テンプレから一括生成
- マンガ的コマ割り機能
  - コマ割りテンプレ
  - コマごとのキャラ・シーン指定
  - 全コマ一括ラフ生成
- 画像ストレージの外出し（S3 / GCS）と `Image.url` への移行
