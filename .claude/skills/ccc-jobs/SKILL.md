# ccc-jobs

JOBS.yaml を読み込み、active なジョブを CronCreate に登録するスキル。
ccc-boot から呼び出される。

## やること

### 1. JOBS.yaml を読み込む
`C:\Users\mt_wa\projects\agy\JOBS.yaml` を読み込む。

### 2. 既存のCronジョブを確認
CronList を使って現在登録済みのジョブを確認する。
同名のジョブが既に登録されていたらスキップする（重複防止）。

### 3. active: true のジョブを登録
各ジョブについて:

```
skill が指定されている場合:
  prompt = "/ai-news" のようにスキル名をコマンドとして実行する

prompt が直接指定されている場合:
  そのプロンプトをそのまま使う
```

CronCreate で登録:
- cron: ジョブの schedule フィールド
- prompt: 上記のプロンプト
- recurring: true

### 4. 登録結果を報告
登録したジョブの一覧を Discord (chat_id: 1485323672959975444) に報告する。

---

## 対応しているフィールド

| フィールド | 必須 | 説明 |
|----------|------|------|
| schedule | ✓ | 5フィールドcron式（ローカル時刻） |
| description | ✓ | ジョブの説明 |
| active | ✓ | true のときのみ登録 |
| skill | △ | スキル名（ai-newsなど） |
| prompt | △ | 直接プロンプト（skill未指定時） |
| chat_id | - | 結果の送信先Discord chat_id |
