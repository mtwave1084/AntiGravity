# Banana Shaker 要件定義書 v2.0

**更新日**: 2025-12-19  
**バージョン**: v2.0.0 図解生成モード（エージェント機能）

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
- **【NEW】構造化インフォグラフィック・図解の自動生成** 🆕

### 1.3 利用形態
- **対象**: 個人利用（開発者本人）
- **環境**: PCブラウザ
- **認証**: ログイン必須
- **デプロイ**: ローカル開発環境（`npm run dev`）

---

## 2. v2.0 新機能: 図解生成モード

### 2.1 機能概要

#### 目的
テキスト入力から、構造化されたインフォグラフィック（図解）を自動生成する**エージェント型**機能。

#### 特徴
- **2段階生成**: ワイヤーフレーム → 最終描画
- **8種類の構造テンプレート**: 目的に応じた図解パターン
- **13種類のスタイル**: デザインバリエーション
- **参照画像統合**: 最大4枚の参照画像でスタイル・内容をガイド

### 2.2 モード切り替え

| モード | 説明 | 既存機能 |
|--------|------|----------|
| 自由生成 | 従来のプロンプトベース画像生成 | ✅ 維持 |
| 図解生成 | 構造化インフォグラフィック生成 | 🆕 新規 |

- `/generate` ページでモード切り替えUI
- 既存の自由生成モードは**変更なし**で維持

### 2.3 図解構造（Diagram Structures）

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

### 2.4 デザインスタイル

| スタイル名 | 識別子 | 説明 |
|------------|--------|------|
| コーポレート | `corporate` | ビジネス向けクリーンデザイン |
| ポップ | `playful` | カラフルで楽しいデザイン |
| ミニマル | `minimal` | シンプルで洗練されたデザイン |
| 手書き風 | `sketch` | ラフスケッチ調 |
| ネオン | `neon` | サイバーパンク調 |
| レトロ | `retro` | ヴィンテージ調 |
| グラデーション | `gradient` | 美しいグラデーション |
| アイソメトリック | `isometric` | 立体的3D表現 |
| フラット | `flat` | フラットデザイン |
| グラスモーフィズム | `glassmorphism` | ガラス効果 |
| ニューモーフィズム | `neumorphism` | 柔らかい立体感 |
| 水彩風 | `watercolor` | 水彩画調 |
| アニメ調 | `anime` | アニメ・イラスト調 |

### 2.5 生成パイプライン

```
[テキスト入力]
     ↓
[構造選択] (8種類)
     ↓
[スタイル選択] (13種類)
     ↓
[参照画像追加] (任意、最大4枚)
     ↓
[ワイヤーフレーム生成] ← Gemini 3 Pro Image
     ↓
[ユーザー確認]
     ↓
[高精細フィニッシング] ← Gemini 3 Pro Image + imageConfig
     ↓
[完成画像]
```

### 2.6 コンテンツブロック

図解は複数の**ブロック**で構成される：

```typescript
interface DiagramBlock {
  id: string;
  type: 'header' | 'content' | 'footer';
  heading?: string;      // ブロック見出し
  content: string;       // 本文テキスト
  visualHint?: string;   // 視覚イメージの指示
}
```

- ユーザーはブロック単位でコンテンツを入力
- 各ブロックに見出し・内容・視覚ヒントを設定可能
- 構造によって推奨ブロック数が異なる

---

## 3. 画面仕様（v2.0追加分）

### 3.1 生成ページ (`/generate`) 変更点

#### モード切り替えUI
- ページ上部にタブまたはトグルスイッチ
- 「自由生成」「図解生成」の2モード
- React 19 Transitionでスムーズな切り替え

#### 図解生成フォーム（新規）
- **左カラム**:
  - 構造選択（8種類のカード）
  - スタイル選択（13種類のサムネイル）
  - コンテンツブロック編集（動的追加/削除）
  - 参照画像アップロード（最大4枚）
- **右カラム**:
  - ワイヤーフレームプレビュー
  - 最終生成画像プレビュー

### 3.2 サイドバー変更

```diff
- { name: 'Generate', href: '/generate', icon: Wand2 }
+ { name: '自由生成', href: '/generate?mode=free', icon: Wand2 }
+ { name: '図解生成', href: '/generate?mode=diagram', icon: ImageIcon }
```

---

## 4. 技術仕様

### 4.1 使用モデル

| 用途 | モデル名 | 備考 |
|------|----------|------|
| ワイヤーフレーム | `gemini-3-pro-image-preview` | 高速生成、低解像度 |
| 最終描画 | `gemini-3-pro-image-preview` | 4K対応、imageConfig使用 |

> **注記**: Gemini 3 Pro Thinkingモードは現時点で存在しないため、通常のgemini-3-pro-image-previewを使用

### 4.2 参照画像パラメータ

```typescript
inputImages: Array<{
  mimeType: string;
  dataBase64: string;
  role: 'reference';  // 全て参照として扱う
}>
```

> **注記**: 特別な一貫性保持パラメータは存在しないため、標準的なinputImages配列を使用

### 4.3 imageConfig設定（最終描画時）

```typescript
generationConfig: {
  responseModalities: ["IMAGE"],
  imageConfig: {
    aspectRatio: "16:9",  // または "1:1", "9:16"
    imageSize: "4K",      // 高解像度必須
  },
}
```

---

## 5. データベース拡張

### 5.1 DiagramJob テーブル（新規）

```sql
CREATE TABLE IF NOT EXISTS DiagramJob (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  structureType TEXT NOT NULL,       -- 8構造の1つ
  styleType TEXT NOT NULL,           -- 13スタイルの1つ
  title TEXT,                        -- 図解タイトル
  blocks TEXT NOT NULL,              -- JSON: コンテンツブロック配列
  wireframeImageId TEXT,             -- ワイヤーフレーム画像への参照
  finalImageId TEXT,                 -- 最終画像への参照
  status TEXT NOT NULL DEFAULT 'pending', -- pending | wireframe | completed | error
  errorMessage TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id),
  FOREIGN KEY (wireframeImageId) REFERENCES Image(id),
  FOREIGN KEY (finalImageId) REFERENCES Image(id)
);
```

### 5.2 既存テーブル変更
**なし** - 後方互換性を維持

---

## 6. ファイル構成（新規追加分）

### 6.1 lib/diagram-agent/

| ファイル | 責務 |
|----------|------|
| `types.ts` | 型定義（構造、スタイル、ブロック） |
| `prompt-builder.ts` | 構造・スタイルに応じたプロンプト生成 |
| `wireframe-generator.ts` | ワイヤーフレーム生成 |
| `final-renderer.ts` | 高精細最終描画 |
| `index.ts` | パイプライン統合 |

### 6.2 components/diagram-generator/

| ファイル | 責務 |
|----------|------|
| `DiagramForm.tsx` | 図解生成フォーム（メイン） |
| `StructureSelector.tsx` | 8構造選択UI |
| `StyleSelector.tsx` | 13スタイル選択UI |
| `BlockEditor.tsx` | コンテンツブロック編集 |
| `WireframePreview.tsx` | ワイヤーフレームプレビュー |
| `ReferenceImageGrid.tsx` | 参照画像管理 |

### 6.3 その他

| ファイル | 責務 |
|----------|------|
| `components/ModeSwitcher.tsx` | モード切り替えUI |
| `app/diagram-actions.ts` | 図解生成用Server Actions |
| `scripts/migrate-diagram.js` | DBマイグレーション |

---

## 7. 既知の制約

### 7.1 技術的制約（継続）
1. **本番ビルド不可**: `better-sqlite3`のネイティブモジュール問題
2. **画像保存方法**: SQLiteにBase64保存

### 7.2 図解生成固有の制約
1. **日本語テキスト**: 生成画像内の日本語テキストは品質にばらつきあり
2. **構造の自動判定なし**: ユーザーが構造を手動選択（将来的に自動推論検討）
3. **リアルタイムプレビューなし**: 生成完了まで待機が必要

---

## 8. 今後の展望

### 8.1 v2.1以降予定
- [ ] 構造の自動推論（テキスト解析から最適構造を提案）
- [ ] プリセット機能の図解モード対応
- [ ] ブロック並び替え（ドラッグ＆ドロップ）
- [ ] 日本語テキスト品質向上オプション

---

## 9. 変更履歴

### v2.0.0 (2025-12-19)
- 🆕 **図解生成モード（エージェント機能）**
  - モード切り替えUI
  - 8種類の図解構造
  - 13種類のデザインスタイル
  - コンテンツブロック編集
  - 2段階生成（ワイヤーフレーム→最終描画）
  - 参照画像統合（最大4枚）
- 🆕 **DiagramJobテーブル追加**
- 🆕 **専用Server Actions分離**

### v1.3.0 (2025-12-05)
- ✅ 参照画像機能
- ✅ クライアント側画像圧縮
- ✅ 生成結果インラインプレビュー
