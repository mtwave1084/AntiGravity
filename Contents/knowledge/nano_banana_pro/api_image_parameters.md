# Gemini API 画像生成パラメータの正しい使い方

**更新日:** 2025-12-01  
**カテゴリ:** API実装ガイド

---

## 概要

Gemini API で画像生成（Nano Banana / Nano Banana Pro）を使用する際、解像度とアスペクト比の正しい指定方法について。

## 正しい実装 ✅

### 構造化パラメータの使用

`generationConfig` の中に **`imageConfig`** オブジェクトをネストして、その中に `aspectRatio` と `imageSize` を指定します。

```typescript
const result = await model.generateContent({
    contents: [{ role: "user", parts }],
    generationConfig: {
        responseModalities: ["IMAGE"],
        imageConfig: {                    // ← ネストして指定
            aspectRatio: "16:9",
            imageSize: "4K",               // 大文字必須
        },
    },
});
```

### 重要なポイント

1. **imageConfig のネスト**: `generationConfig.imageConfig` という階層構造にする
2. **大文字小文字の区別**: `imageSize` は **大文字** (`"1K"`, `"2K"`, `"4K"`)
3. **パラメータ名**: 
   - ✅ `imageSize` (正)
   - ❌ `resolution` (誤)

---

## よくある間違い ❌

### 誤り 1: generationConfig に直接配置

```typescript
// ❌ 間違い - imageConfig をネストしていない
generationConfig: {
    responseModalities: ["IMAGE"],
    imageSize: "4K",           // エラー: Cannot find field
    aspectRatio: "16:9",       // エラー: Cannot find field
}
```

**エラーメッセージ:**
```
Invalid JSON payload received. 
Unknown name "imageSize" at 'generation_config': Cannot find field.
Unknown name "aspectRatio" at 'generation_config': Cannot find field.
```

### 誤り 2: プロンプトテキストに追加

```typescript
// ❌ 間違い（効果なし）
let prompt = "A beautiful landscape";
prompt += ` --resolution 4k`;      // 無視される可能性
prompt += ` --ar 16:9`;            // 無視される可能性
```

> [!WARNING]
> プロンプトベースのパラメータ（`--resolution`, `--ar`）は公式にサポートされていない可能性があります。構造化パラメータを使用することを推奨します。

---

## 完全な実装例

### TypeScript (Node.js SDK)

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function runNanoImageJob(request: {
    apiKey: string;
    model: "nanobanana" | "nanobanana-pro";
    prompt: string;
    aspectRatio?: string;
    outputResolution?: string;
    negativePrompt?: string;
    seed?: number;
}) {
    const genAI = new GoogleGenerativeAI(request.apiKey);
    
    const modelName = request.model === "nanobanana-pro"
        ? "gemini-3-pro-image-preview"
        : "gemini-2.5-flash-image";
    
    const model = genAI.getGenerativeModel({ model: modelName });

    // プロンプト構築（画像パラメータはimageConfigで指定）
    let fullPrompt = request.prompt;
    if (request.negativePrompt) fullPrompt += ` --no ${request.negativePrompt}`;
    if (request.seed) fullPrompt += ` --seed ${request.seed}`;

    const parts = [{ text: fullPrompt }];

    // generationConfig の構築
    const config: any = {
        responseModalities: ["IMAGE"],
    };

    // imageConfig を追加（解像度またはアスペクト比が指定されている場合）
    if (request.outputResolution || request.aspectRatio) {
        config.imageConfig = {};
        
        if (request.aspectRatio) {
            config.imageConfig.aspectRatio = request.aspectRatio;
        }
        
        if (request.outputResolution) {
            // 小文字を大文字に変換（1k → 1K）
            config.imageConfig.imageSize = request.outputResolution.toUpperCase();
        }
    }

    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig: config,
    });

    return result;
}
```

---

## サポートされている値

### imageSize

| 値 | 対応モデル | 説明 |
|---|---|---|
| `"1K"` | Nano Banana, Nano Banana Pro | デフォルト解像度 |
| `"2K"` | Nano Banana Pro のみ | 中解像度 |
| `"4K"` | Nano Banana Pro のみ | 高解像度 |

> [!IMPORTANT]
> - 大文字必須: `"1K"`, `"2K"`, `"4K"`
> - 小文字 (`"1k"`) は拒否されます

### aspectRatio

サポートされているアスペクト比：

- `"1:1"` - 正方形
- `"2:3"` - 縦長
- `"3:2"` - 横長
- `"3:4"` - 縦長
- `"4:3"` - 横長
- `"4:5"` - 縦長（InstagramやTikTok向け）
- `"5:4"` - 横長
- `"9:16"` - 縦長ポートレート（スマホ画面）
- `"16:9"` - ワイドスクリーン
- `"21:9"` - ウルトラワイド

---

## プロンプトパラメータとして有効なもの

imageConfig では指定できず、プロンプトテキストに追加する必要があるパラメータ：

```typescript
// ✅ これらはプロンプトパラメータとして有効
if (negativePrompt) fullPrompt += ` --no ${negativePrompt}`;
if (seed) fullPrompt += ` --seed ${seed}`;
```

| パラメータ | 形式 | 例 | 場所 |
|-----------|------|-----|------|
| aspectRatio | config | `imageConfig.aspectRatio: "16:9"` | imageConfig |
| imageSize | config | `imageConfig.imageSize: "4K"` | imageConfig |
| negativePrompt | prompt | `--no low quality` | プロンプトテキスト |
| seed | prompt | `--seed 12345` | プロンプトテキスト |

---

## API調査の経緯

### 第1回試行: 直接 generationConfig に配置 → 失敗

```typescript
// 試行1: ❌ 失敗
generationConfig: {
    responseModalities: ["IMAGE"],
    imageSize: "4K",        // エラー
    aspectRatio: "16:9",    // エラー
}
```

**結果:** 400 Bad Request - "Cannot find field"

**日付:** 2025-11-30

### 第2回試行: imageConfig にネスト → ✅ 成功

```typescript
// 試行2: ✅ 成功（動作確認済み）
generationConfig: {
    responseModalities: ["IMAGE"],
    imageConfig: {
        imageSize: "4K",
        aspectRatio: "16:9",
    },
}
```

**結果:** ✅ **動作確認済み**
- 2K画像の生成に成功
- 4K画像の生成に成功
- imageConfig構造が正しく機能することを確認

**確認日:** 2025-12-01

**参照:** [Gemini API 画像生成ドキュメント（日本語）](https://ai.google.dev/gemini-api/docs/image-generation?hl=ja#aspect-ratio-and-image-size)

---

## トラブルシューティング

### 問題: "Cannot find field" エラー

**原因:** imageConfig をネストしていない、または間違った階層に配置している

**解決策:** `generationConfig.imageConfig` として正しくネストする

### 問題: 小文字の解像度が拒否される

**原因:** API は大文字のみを受け付ける（`"1K"`, `"2K"`, `"4K"`）

**解決策:** `.toUpperCase()` を使用して変換

```typescript
imageSize: request.outputResolution?.toUpperCase() || "1K"
```

### 問題: Nano Banana で 4K が使えない

**原因:** 4K は Nano Banana Pro 専用

**解決策:** `gemini-3-pro-image-preview` モデルを使用

---

## 参考リンク

- [Gemini API - 画像生成（日本語）](https://ai.google.dev/gemini-api/docs/image-generation?hl=ja)
- [Gemini API - GenerationConfig](https://ai.google.dev/api/generate-content#GenerationConfig)
- [Google Generative AI Node.js SDK](https://www.npmjs.com/package/@google/generative-ai)

---

## まとめ

✅ **正しい実装:**
- `generationConfig.imageConfig` にネスト
- `imageSize` と `aspectRatio` を imageConfig 内に配置
- imageSize は大文字必須

❌ **避けるべき実装:**
- generationConfig に直接配置
- プロンプトテキストへの追加（`--resolution`, `--ar`）
- 小文字の解像度指定
