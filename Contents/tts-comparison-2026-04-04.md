# TTS（音声合成）総合比較レポート 2026-04-04

## はじめに

Fish Audio を起点に、クラウドサービス・OSSモデルを横断したTTS比較レポート。
AGYプロジェクト（ティア・ユリ・リクのキャラクターボイス生成）での活用を念頭に置いてまとめる。

---

## 1. クラウドサービス系

### Fish Audio

- **概要**: SotA クラスのクラウドTTS。旗艦モデル S1 が TTS-Arena2 で1位。Fish Speech（OSS版）も公開中。
- **精度**: CER 約0.4%、WER 約0.8%（benchmark）。70言語対応、2M+ ボイスライブラリ
- **音声クローン**: 15秒のサンプルで高精度クローン。追加ファインチューニング不要
- **レイテンシ**: サブ500ms（リアルタイムストリーミング対応）
- **価格**: $15/百万UTF-8バイト（約12時間分）。無料枠200分/月。最小サブスク $5.50/月
- **Python SDK**: `pip install fish-audio-sdk`（Python 3.9+）
- **ライセンス**: 商用利用可
- **優位性**: ElevenLabs比 45〜70%安価。OSS版（Fish Speech, Apache 2.0）でセルフホスト可
- **注意点**: 日本語品質は英語/中国語より若干劣る場合あり（多言語モデルのトレードオフ）

### ElevenLabs

- **概要**: 業界最高品質クラスのクラウドTTS。英語ナレーション特化で評価高い
- **精度**: 70言語対応。声質・感情表現が業界トップクラス
- **音声クローン**: Instant（1分以下）/ Professional（カスタムモデル）の2種
- **レイテンシ**: Flash v2.5 で約75ms（超低遅延）
- **価格**: 月額サブスク制。スケールすると割高。Fish Audioの2〜3倍以上
- **優位性**: 英語品質・感情制御・APIエコシステムが成熟
- **注意点**: コスト高。大量利用には向かない

### Cartesia (Sonic-3)

- **概要**: 低レイテンシ特化。リアルタイム会話AIでの採用増加
- **精度**: 40言語対応（インド言語9言語含む）
- **音声クローン**: 15秒サンプルで対応
- **レイテンシ**: Time-to-First-Audio 約40ms（業界最速クラス）
- **価格**: ElevenLabs の約1/5
- **優位性**: 会話AIエージェント・低遅延用途に最適
- **注意点**: ボイスライブラリが ElevenLabs より少ない

### Google Cloud TTS

- **概要**: Google の大規模インフラを活用した安定TTS
- **精度**: 380+ ボイス、50+ 言語。WaveNet/Neural2 採用
- **価格**: 標準 $4/百万文字、無料枠100万文字/月
- **優位性**: Google エコシステムとの統合。SSML サポート充実
- **注意点**: 声のカスタマイズ性が低い。レイテンシは専門サービスより高め

### Amazon Polly

- **概要**: AWS エコシステム向けTTS
- **精度**: Neural TTS、40+ 言語
- **価格**: 標準 $4/百万文字、Neural $16/百万文字
- **優位性**: AWS Lambda・S3 との統合が容易
- **注意点**: ボイスライブラリが古め。カスタムボイスはエンタープライズ契約が必要

### Azure TTS (Microsoft)

- **概要**: 最多言語カバレッジ。400+ボイス、140+言語
- **価格**: Neural $15/百万文字、無料枠50万文字/月
- **優位性**: SSML サポートが最も充実。多言語対応が最広
- **注意点**: コストが Fish Audio と同水準だが機能は劣る

### OpenAI TTS

- **概要**: GPT エコシステムに統合された TTS
- **精度**: 6種類の組み込みボイス
- **優位性**: OpenAI API との組み合わせがシームレス
- **注意点**: ボイスクローン非対応。SSML非対応。言語チューニング不可。**PlayHT は 2025年12月末でAPI停止（Meta 買収）**

---

## 2. OSS系

### Fish Speech（fishaudio/fish-speech）

- **概要**: Fish Audio の OSS 版。クラウド API の代替としてセルフホスト可能
- **ライセンス**: Apache 2.0（商用利用可）
- **精度**: S2 Pro はデュアルオートリグレッシブ構造 + RL アライメント。80+ 言語
- **音声クローン**: 10〜30秒のリファレンス音声で対応
- **要件**: NVIDIA GPU 推奨（RTX 3060以上）。CPU も可（低速）
- **セットアップ難度**: ★★★☆☆（中程度）。公式ドキュメントあり
- **AGYでの可用性**: ◎ ティア/リクのボイスを完全ローカルで生成可能
- **注意点**: GPU がない場合は生成が遅い。モデルサイズが大きい

### Kokoro-82M

- **概要**: 82Mパラメータの超軽量高品質TTS。StyleTTS2 + ISTFTNet ベース
- **ライセンス**: Apache 2.0（商用利用可）
- **精度**: GPU で96倍リアルタイム（超高速）。声質は大型モデルに匹敵
- **音声クローン**: 単体では非対応（外部組み合わせで可）
- **要件**: 軽量なため CPU でも動作可。ONNX/PyTorch 両対応
- **セットアップ難度**: ★★☆☆☆（簡単）。Kokoro-FastAPI でDocker化済み
- **AGYでの可用性**: ○ ナレーション・固定キャラクターの読み上げに適する
- **注意点**: ボイスクローン単体では不可。感情制御は限定的

### Coqui XTTS-v2

- **概要**: HuggingFace 最多DLのTTSモデル。声クローンが得意
- **ライセンス**: Coqui Public Model License（**非商用限定**）
- **精度**: 17言語。6秒のクリップでクローン可能
- **音声クローン**: ◎（6秒と最短クラス）
- **セットアップ難度**: ★★★☆☆（中程度）
- **AGYでの可用性**: △ ライセンスが非商用限定なので商用展開には使えない
- **注意点**: 商用利用不可が最大のネック

### Chatterbox（Resemble AI）

- **概要**: Resemble AI がオープンソース化した高性能TTS
- **ライセンス**: オープンソース（商用可）
- **精度**: ElevenLabs と比較テストで63.75%の選好率。350Mパラメータ（Turbo版）
- **音声クローン**: ◎（ElevenLabs相当の品質）
- **セットアップ難度**: ★★★☆☆（中程度）
- **AGYでの可用性**: ◎ OpenAI互換APIとして建てられるためAgentとの統合容易
- **注意点**: Turboモデルは比較的新しく情報が少ない

### StyleTTS2

- **概要**: Kokoro の基盤アーキテクチャ。研究・カスタム開発向け
- **ライセンス**: MIT
- **用途**: アーキテクチャレベルの改修・実験向け
- **AGYでの可用性**: △（研究・実験用途）
- **注意点**: プロダクション利用はKokoroや派生物を使う方が現実的

---

## 3. 比較サマリー

| サービス | 品質 | 声クローン | コスト | 商用 | ローカル | AGY適性 |
|---------|------|----------|--------|------|---------|---------|
| Fish Audio | ★★★★★ | ◎15秒 | $$ | ✅ | ✅(Fish Speech) | ◎ |
| ElevenLabs | ★★★★★ | ◎ | $$$$ | ✅ | ❌ | △（高コスト） |
| Cartesia | ★★★★☆ | ◎15秒 | $$ | ✅ | ❌ | ○（低遅延用途） |
| Google TTS | ★★★☆☆ | ❌ | $$ | ✅ | ❌ | △ |
| Fish Speech(OSS) | ★★★★☆ | ◎10〜30秒 | 無料 | ✅ | ✅ | ◎ |
| Kokoro-82M | ★★★★☆ | △ | 無料 | ✅ | ✅ | ○ |
| XTTS-v2 | ★★★★☆ | ◎6秒 | 無料 | ❌非商用 | ✅ | △ |
| Chatterbox | ★★★★☆ | ◎ | 無料 | ✅ | ✅ | ◎ |

---

## 4. AGYプロジェクトでの推奨活用方針

### ティア・リクのボイス生成（短期）
→ **Fish Audio API**（`fish-audio-sdk`）が最善
- ソリスの声サンプル15秒を用意してクローン
- ティアはピッチ高め調整、リクはそのまま or 低め
- `pip install fish-audio-sdk` で即利用開始

### ローカル開発・コスト削減（中期）
→ **Fish Speech + Chatterbox** の両方をローカルに立てる
- Fish Speech: キャラクターボイス精度重視
- Chatterbox + chatterbox-tts-api: OpenAI互換エンドポイント → エージェント統合が簡単

### ナレーション・固定文章読み上げ（補助）
→ **Kokoro-FastAPI**（Docker、超軽量）
- GPU なしでも動く
- バッチ処理・コンテンツ読み上げに

---

## 5. おまけ：OSSベースの改修アイデア

### A. Fish Speech をファインチューニングしてキャラクターボイスを固定化

Fish Speech はファインチューニング API を持つ。以下のフローで固定ボイスを作れる：

```
1. ソリスの声サンプルを収集（30秒〜数分）
2. Fish Speech の fine-tuning スクリプトで話者適応（Speaker Adaptation）
3. 生成されたモデルチェックポイントをローカルに保持
4. API呼び出し時に reference_id を固定 → 常に同じ声で生成
```

**メリット**: 毎回リファレンス音声を送る必要がない。一貫した声質。
**難度**: ★★★★☆（GPUと数時間のトレーニング時間が必要）

### B. Kokoro + ピッチシフターで多キャラクター対応

Kokoro の出力音声に対してピッチ変換（librosa または soundstretch）をかけることで複数キャラを1モデルから生成できる：

```python
import librosa
import soundfile as sf

y, sr = librosa.load("kokoro_output.wav")
# ティア: +3半音（高め・可愛い系）
y_tear = librosa.effects.pitch_shift(y, sr=sr, n_steps=3)
# リク: -2半音（低め・落ち着き系）
y_riku = librosa.effects.pitch_shift(y, sr=sr, n_steps=-2)

sf.write("tear_voice.wav", y_tear, sr)
sf.write("riku_voice.wav", y_riku, sr)
```

**メリット**: 1モデルで複数キャラ。完全ローカル・無料。
**難度**: ★★☆☆☆（ライブラリインストールのみ）

### C. Chatterbox-TTS-API で OpenAI互換エージェント基盤

`chatterbox-tts-api` は OpenAI TTS API 互換のエンドポイントを提供する。Discordボット・音声エージェントとの統合が容易：

```bash
# Docker で起動
docker run -p 8880:8880 travisvn/chatterbox-tts-api

# 既存の OpenAI SDK でそのまま呼べる
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8880/v1", api_key="not-needed")
response = client.audio.speech.create(model="chatterbox", voice="tear", input="こんにちは！")
```

**メリット**: 既存コードの base_url を変えるだけ。将来の切り替えも容易。
**難度**: ★★☆☆☆（Docker必須）

---

## 参考リンク

- [Fish Audio 公式](https://fish.audio/)
- [Fish Speech GitHub](https://github.com/fishaudio/fish-speech)
- [fish-audio-sdk PyPI](https://pypi.org/project/fish-audio-sdk/)
- [Kokoro-82M HuggingFace](https://huggingface.co/hexgrad/Kokoro-82M)
- [Kokoro-FastAPI GitHub](https://github.com/remsky/Kokoro-FastAPI)
- [Chatterbox TTS API GitHub](https://github.com/travisvn/chatterbox-tts-api)
- [Fish Audio TTS API比較ブログ](https://fish.audio/blog/text-to-speech-api-comparison-pricing-features)
