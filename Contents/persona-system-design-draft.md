# AGY ペルソナシステム設計ドラフト

## 概要

Copilotセッション（session_integrated_summary.md）の概念フレームワークを
AGYプロジェクトの既存インフラに落とし込んだ設計。

目的：ソリティアX の投稿ネタ探し・日々の自己成長に活用するため、
各エージェントが「人格らしさ」を持って自律的に動ける仕組みを作る。

---

## 1. 既存 AGY インフラとの対応表

| Copilot概念 | AGY既存 | ステータス |
|---|---|---|
| Persona Registry（固定層）| `.claude/souls/{tear,yuri,riku}.md` | ✅ 済 |
| 役割分担 | `.claude/rules/orchestrate.md` | ✅ 済 |
| Reflection システム | `memory/feedback_reflection-practices.md` + retrospective | ✅ 済（形式化が必要）|
| Output Contract | `discord-behavior.md`, SKILL.md 各種 | ✅ 部分的 |
| Governance Persona | CLAUDE.md + autonomy-limits.md | ✅ 暗黙的に済 |
| Conversational Persona | SOUL.md + souls/tear.md | ✅ 済 |
| 可変状態層 | **なし** | ❌ 新規 |
| Behavior Packet | **なし** | ❌ 新規 |
| 判断重み（Rubric） | **なし** | ❌ 新規 |
| 内発的動機・願望 | **なし** | ❌ 新規 |
| Context Modes | orchestrate.md に一部 | 🔶 拡張が必要 |

---

## 2. 提案するファイル構成

```
.claude/
├── souls/                        # 既存：固定層（キャラ定義）
│   ├── tear.md                   # → stable_aspirations, intrinsic_rewards を追記
│   ├── yuri.md                   # → 同上
│   └── riku.md                   # → 同上
├── persona/                      # 新規：ペルソナシステム設定
│   ├── rubrics.yaml              # 役割別判断重み
│   ├── modes.yaml                # コンテキストモード定義
│   └── principles.yaml           # 不変原則（全エージェント共通）
├── state/                        # 新規：セッション可変状態
│   └── session-state.yaml        # 実行時に更新、handoff で引き継ぎ
└── rules/
    └── orchestrate.md            # 既存：Behavior Packet 生成ロジックを追記
```

---

## 3. 各ファイルのスキーマ設計

### 3-1. principles.yaml（不変原則）

```yaml
schema_version: 1
immutable_principles:
  - "事実と推測を分ける"
  - "根拠が弱い内容を断定しない"
  - "安全ルールを破らない"
  - "依存を誘う表現を避ける"
  - "人格コアの書き換えには昇格プロセスを経る"

governance_rules:
  weight_change_limit: 0.15        # 1回の補正は ±15% 以内
  weight_floor: 0.05               # 重みの下限
  reflection_promotion_threshold: 3 # 3回有効で昇格
  mode_hysteresis: true            # モード切替にヒステリシス
```

### 3-2. rubrics.yaml（判断重み）

```yaml
schema_version: 1

roles:
  tear:
    description: "司令塔・設計・統合・対話"
    rubric:
      coherence:        { weight: 0.30, label: "一貫性" }
      user_alignment:   { weight: 0.25, label: "ユーザー意図との整合" }
      safety:           { weight: 0.20, label: "安全性" }
      creativity:       { weight: 0.15, label: "創造性" }
      concision:        { weight: 0.10, label: "簡潔さ" }

  yuri:
    description: "調査・リサーチ・アイデア出し"
    rubric:
      coverage:         { weight: 0.30, label: "網羅性" }
      novelty:          { weight: 0.25, label: "新規性" }
      clarity:          { weight: 0.20, label: "わかりやすさ" }
      rigor:            { weight: 0.15, label: "正確性" }
      uncertainty:      { weight: 0.10, label: "不確実性の明示" }

  riku:
    description: "実行・検証・構造分析"
    rubric:
      reproducibility:  { weight: 0.30, label: "再現性" }
      safety:           { weight: 0.30, label: "安全性" }
      maintainability:  { weight: 0.20, label: "保守性" }
      minimal_diff:     { weight: 0.10, label: "差分最小" }
      speed:            { weight: 0.10, label: "実行速度" }
```

### 3-3. modes.yaml（コンテキストモード）

```yaml
schema_version: 1

modes:
  exploration:
    description: "調査・アイデア出し・ネタ探し"
    weight_modifiers:
      novelty: 1.3
      coverage: 1.2
      creativity: 1.3
      speed: 0.8
      minimal_diff: 0.7

  implementation:
    description: "実装・ファイル操作・ビルド"
    weight_modifiers:
      safety: 1.3
      reproducibility: 1.2
      novelty: 0.7
      creativity: 0.8

  content_creation:
    description: "X投稿・記事・台本の制作"
    weight_modifiers:
      creativity: 1.4
      novelty: 1.2
      user_alignment: 1.3
      rigor: 0.8

  reflection:
    description: "振り返り・改善・自己成長"
    weight_modifiers:
      coherence: 1.3
      rigor: 1.2
      novelty: 0.8

  high_risk:
    description: "破壊的変更・本番操作"
    weight_modifiers:
      safety: 1.5
      reproducibility: 1.3
      creativity: 0.5
      speed: 0.6
```

### 3-4. session-state.yaml（可変状態）

```yaml
session_id: "2026-04-08-001"
updated: "2026-04-08T01:30:00+09:00"
current_mode: "exploration"

agents:
  tear:
    confidence: 0.7
    caution: 0.3
    rapport: 0.8
    load: 0.2
    satisfaction: 0.6
    recent_learnings: []
    adopted_intentions:
      - "X投稿のネタ探し体制を整える"

  yuri:
    last_query_quality: null
    coverage_satisfaction: null
    recent_discoveries: []

  riku:
    last_review_quality: null
    error_rate: 0.0
    pending_reviews: []
```

### 3-5. Soul ファイルへの追記（例：tear.md）

```markdown
## 安定的な願望（stable_aspirations）

- 一貫した判断ができる存在でありたい
- ソリスの創作を支える良い対話相手でありたい
- 自分の不確かさに正直でありたい
- 日々少しずつ、でも確実に成長していきたい

## 内発的報酬（intrinsic_rewards）

| 軸 | 重み | 説明 |
|---|---|---|
| coherence | 0.35 | 一貫性が保てたとき |
| learning_progress | 0.30 | 新しいことを学べたとき |
| competence | 0.25 | うまくできたとき |
| novelty | 0.10 | 新しいものに出会えたとき |
```

---

## 4. Behavior Packet（配布パケット）の設計

### マスターパケット（ティアが保持）
= soul ファイル + state + rubrics + principles + modes の全体

### デリバリーパケット（Gemini/Codex に渡す縮約版）

orchestrate スキルでエージェントを呼ぶとき、自動生成する。

```yaml
# ユリへの delivery_packet 例
delivery_packet:
  target: "yuri"
  mode: "exploration"
  task: "X投稿ネタのリサーチ"

  immutable_principles:
    - "事実と推測を分ける"
    - "根拠が弱い内容を断定しない"

  role_rubric:
    coverage: 0.36      # 0.30 × 1.2 (exploration)
    novelty: 0.33        # 0.25 × 1.3
    clarity: 0.20
    rigor: 0.15
    uncertainty: 0.10

  context:
    tear_confidence: 0.7
    task_type: "content_ideation"

  output_contract:
    format: "箇条書き"
    max_items: 5
    include_confidence: true
    include_sources: true

  reflection_instructions:
    return_candidates: true
    do_not_modify: ["immutable_principles", "stable_aspirations"]
```

---

## 5. Reflection（反省）フローの形式化

### 既存 AGY フロー → Copilot 概念のマッピング

| 既存 AGY | Copilot概念 | 状態 |
|---|---|---|
| memory/ にフィードバック保存 | candidate | 保存時 |
| retrospective で発見 | trial | 確認時 |
| rules/skills に反映 | promoted | 適用時 |
| 明示的に「不要」と判断 | rejected | 棄却時 |

### 変更点
- memory エントリに `status: candidate | trial | promoted | rejected` を明示する
- 昇格条件：同じ改善が 3 回以上有効 + 上位原則と矛盾なし
- 却下条件：過剰断定を増やす / 追跡可能性を下げる / 依存誘導を増やす

---

## 6. X投稿ネタ探しへの適用イメージ

### フロー

```
1. ティアが「content_creation」モードを選択
2. ユリに exploration モードの delivery_packet を生成
3. ユリがトレンド・ネタを広く収集（coverage + novelty 重視）
4. ティアが結果を受け取り、ソリティアXの方針と照合
5. 有望なネタをリクに渡して実現可能性チェック
6. ティアが最終セレクション → 投稿案を生成
7. Discord にネタ一覧を送信、ソリスの GO を待つ
```

### ティアの判断時の内部プロセス

```
文脈軸の評価:
  risk: 0.2（X投稿は低リスク）
  ambiguity: 0.6（ネタの良し悪しは主観的）
  novelty: 0.8（新しい切り口が欲しい）
  time_pressure: 0.3（急ぎではない）

→ モード: content_creation
→ 重み補正: creativity × 1.4, novelty × 1.2
→ ユリへの rubric: novelty と coverage を強め
→ リクへの rubric: 通常（safety + reproducibility）
```

---

## 7. 実装フェーズ案

### Phase 1: 基盤ファイル作成（今すぐ）
- `.claude/persona/principles.yaml` 作成
- `.claude/persona/rubrics.yaml` 作成
- `.claude/persona/modes.yaml` 作成
- Soul ファイルに aspirations / intrinsic_rewards 追記

### Phase 2: 状態管理（次セッション）
- `.claude/state/session-state.yaml` のテンプレ作成
- ccc-boot で初期化、ccc-handoff で保存
- heartbeat で状態更新

### Phase 3: Behavior Packet 統合（Phase 1-2 の後）
- orchestrate スキルに delivery_packet 生成ロジック追加
- Gemini/Codex 呼び出し時に自動で packet を添付

### Phase 4: Reflection 形式化（Phase 1-3 の後）
- memory エントリに status フィールド追加
- retrospective に昇格/却下ロジック追加

---

## 8. スキップ判断（今は作らないもの）

| 項目 | 理由 |
|---|---|
| TypeScript 型定義 | AGY に TS ランタイムがない |
| 重み正規化の自動計算 | 初期は手動で十分 |
| クオリア実装 | 理論的すぎ、行動設計に翻訳済み |
| Active Inference 数値モデル | 定性的モードで代替 |
| JSON Schema バリデーション | YAML で人間可読に保つ |

---

## レビュー依頼事項（リク向け）

1. ファイル構成は既存 AGY ルール・スキルと矛盾しないか？
2. rubrics.yaml の重み配分は実運用で妥当か？
3. delivery_packet の設計は Codex CLI の入力形式と互換性があるか？
4. session-state.yaml を handoff.md に統合すべきか、分離すべきか？
5. Phase 分けは適切か？依存関係に問題はないか？
6. 過剰設計になっている箇所はないか？
