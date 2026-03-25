# ccc-heartbeat

30分ごとに自動実行される死活監視スキル。MCP疎通確認と自動再起動を担う。

## トリガー
CronCreate で `*/30 * * * *` に登録済み。ccc-boot から自動登録される。

## やること（すべて run_in_background=true のサブエージェントで実行）

### 1. MCP 疎通確認
Discord の fetch_messages ツールを使って軽量に疎通確認する：
- chat_id: `1485323672959975444`
- limit: 1

### 2. 結果の処理

**疎通成功の場合：**
- 基本的に**無音**（Discord に通知しない）
- ただし何か異常（未処理のメッセージが溜まっているなど）があれば報告する

**疎通失敗の場合：**
- Discord への送信を試みる（別経路があれば）
- `C:\Users\mt_wa\projects\agy\scripts\restart-session.bat` を実行してセッション再起動

## 注意
- 正常時は無音であること（毎回通知すると邪魔になる）
- エラー時のみ Discord に「なんか調子悪かったみたいで再起動したよ……」と報告する
