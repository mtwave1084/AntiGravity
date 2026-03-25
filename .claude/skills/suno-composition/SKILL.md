---
name: Suno AI Composition
description: Suno AIを使用した楽曲制作のための包括的なガイドとベストプラクティス。プロンプト構築、ジャンル選択、音質最適化の手法を提供。
---

# Suno AI Composition Skill

このスキルは、ユーザーがSuno AIで楽曲を作成する際に参照すべき知識とベストプラクティスを提供します。

## 参照ナレッジ

Suno AIでの作曲を支援する際は、以下のナレッジファイルを必ず参照してください：

1. **`.agent/knowledge/【辞書】Suno AI「ジャンル・楽器・ムード」プロンプトタグ100選 土台.md`**
   - ジャンル、楽器、ムード、音響プロダクション、構造指定の包括的なタグリスト
   - 各タグの効果とv5での出力傾向を詳述
   - タグの掛け合わせテクニック

2. **`.agent/knowledge/The Complete Guide to Mastering Suno.md.md`**
   - Sunoの内部動作メカニズムの理解
   - プロンプト工学の高度な戦略
   - モデル選択、構造化プロンプト、メタタグの使い方

## 基本原則

### Sunoの理解

Sunoは指示を人間のように読むのではなく、統計的に学習したパターンに基づいて音楽スタイルをブレンドします：

- **ジャンルの共起**：「rap」を指定すると、自動的にtrap、hip hop、heavy bassの要素が混ざる
- **Popの重力井戸**：ほぼすべてのジャンルがpopに引き寄せられる傾向がある
- **弱いタグvs強いタグ**：タグによって影響力が異なる

### プロンプト構造の重要性

**最も効果的な構造化フォーマット**：

```
genre: "specific genre description with context and influences"

vocal: "detailed vocal characteristics, delivery style, emotional quality"

instrumentation: "instruments in order of importance with playing style descriptions"

production: "recording quality tags, mixing characteristics, effects"

mood: "emotional atmosphere and energy level"

style tags: "additional production details and sonic characteristics"
```

**重要なルール**：
- カンマではなく「and」「with」を使って要素を連結
- 各セクションの最後にピリオドを使用
- 詩的な表現ではなく、技術的・メタデータ的な表現を使用

## モデル選択ガイド

| モデル | 最適な用途 | 特徴 |
|--------|-----------|------|
| **v5** | プロフェッショナルな音質、ボーカル重視の楽曲 | 最もクリーンな音質、自然なボーカル、洗練されたトーン |
| **v4.5** | 安定した結果、長尺楽曲 | 信頼性の高いワークホース、優れたプロンプト追従性 |
| **v4.5+** | 創造的で予測不可能な結果を求める場合 | Add Vocals/Instrumentals機能、より実験的 |
| **v4** | 意図的なカオス、ノスタルジックなワークフロー | 古い、予測不可能 |

## 重要なタグカテゴリ

### 音響・プロダクション（最重要）

v5攻略の鍵は「音の質感」を指定すること：

- **Hi-Fi**：AI特有のこもった感じを除去、クリアな音質
- **Wide Stereo**：左右の広がり、ヘッドホンでの没入感向上
- **Dry Vocals**：過剰なエコーを削減、生々しい声
- **Deep Bass**：重低音の強化
- **Crisp Drums**：ドラムの輪郭を明確に
- **Warm Tape Saturation**：アナログテープのような温かみ
- **Clean Mix**：各楽器の分離を改善
- **Studio Quality**：プロのスタジオ録音のような整った音

### 雰囲気・感情

ボーカルの表現力に大きく影響：

- **Melancholic**（憂鬱な）：切ない曲調
- **Euphoric**（多幸感）：爆発的な高揚感
- **Aggressive**（攻撃的）：叫びや強い語気
- **Dreamy**（夢のような）：浮遊感
- **Dark**（暗い）：重低音、シリアスな緊張感

### ジャンル・スタイル

ニッチなジャンルほど特徴的な音を出す：

- **City Pop**：v5が特に得意、80年代日本の都会的サウンド
- **Kawaii Future Bass**：アニメ声×重低音シンセ
- **Lo-fi Hip Hop**：作業用BGMの定番
- **Synthwave**：80年代SF映画のような電子音

### メタタグ（歌詞欄に記述）

各セクションに個別の指示を与える：

```
[Chorus | anthemic chorus | stacked harmonies | high energy]
[Bridge | Whisper | intimate]
[Build Up | aggressive energy | heavy distortion]
[Guitar Solo | 80s glam metal lead guitar | whammy bar bends]
```

## リアリズムの表現

「realistic」という言葉は弱い。物理的な録音特性を記述する：

### アコースティック・リアリズム
- Small room acoustics
- Close mic presence
- One-take performance
- Natural dynamics
- Breath detail

### パフォーマンス詳細
- Mouth noise
- Pick noise
- Fret squeak
- Finger movement noise on strings

### アナログ特性
- Tape saturation
- Analog warmth
- Slight wow and flutter

## 除外スタイルの活用

Exclude Stylesパラメータで不要な要素を確実に除外：

- **女性ボーカルのみ**：Male Vocalを除外
- **アコースティックのみ**：Electronic, Synthesizer, Drum Machineを除外
- **純粋なRock**：Electronic, Hip Hop, Popを除外

## パラメータ設定ガイド

### Weirdness（創造性）

- **0-30%**：安全で予測可能、商業ポップス向け
- **40-60%**：バランスの取れた創造性（推奨）
- **70-100%**：実験的、予測不可能な結果

### Style Influence（スタイル遵守度）

- **曖昧なタグ（Pop, Rock）**：70-90%に設定
- **具体的なタグ**：40-60%で十分
- **実験的な作品**：20-40%

## ワークフロー

1. **ジャンルとムードを決定**
2. **構造化プロンプトを作成**
   - ナレッジファイルから適切なタグを選択
   - 「and」「with」で連結、ピリオドで区切る
3. **歌詞にメタタグを追加**
   - 各セクション（Verse, Chorus, Bridge）の冒頭に配置
4. **除外スタイルを設定**
   - 不要な要素を明示的に除外
5. **パラメータを調整**
   - Vocal Gender, Weirdness, Style Influenceを設定
6. **複数バージョンを生成**
   - v4.5は歌詞の解釈にばらつきがあるため、複数生成を推奨
7. **Remasterで音質向上**（必要に応じて）
   - 歌詞欄の先頭に`[high_fidelity]` `[studio_mix]`などを追加してからRemaster

## よくある問題と解決策

### 問題：AI特有のペラペラした音
**解決策**：音響タグを追加（Hi-Fi, Wide Stereo, Deep Bass, Clean Mix）

### 問題：想定と違うジャンルになる
**解決策**：
- 除外スタイルを使用
- より具体的なジャンル記述（文脈と影響を含める）
- 共起する不要な要素を明示的に除外

### 問題：プロンプトが歌詞として歌われる（Lyric Bleed）
**解決策**：
- プロンプトをメタデータ的な表現に
- 歌詞欄を必ず埋める
- 歌詞欄の先頭に`///*****///`を配置

### 問題：イントロが長すぎる
**解決策**：MAX Modeで`[START_ON: TRUE]` `[START_ON: "最初の歌詞"]`を使用

## 注意事項

- Popの重力は非常に強い。意図的にpopを避ける場合は明示的に除外する
- v5は音質は最高だが、要求が厳しく反復が必要
- 電子音楽ではREALISMパラメータはほぼ無意味
- MAX Modeはアコースティック、カントリー、フォーク、オーケストラで最も効果的

## 活用例

ユーザーが楽曲制作を依頼した場合：

1. 世界観・テーマ・ムードを確認
2. 適切なジャンルとスタイルタグをナレッジから選択
3. 構造化プロンプトを作成
4. 歌詞にメタタグを追加した完成版を提供
5. Sunoでの設定値（Weirdness, Style Influence, 除外スタイル）を推奨

これにより、ユーザーは即座にSunoで高品質な楽曲を生成できます。
