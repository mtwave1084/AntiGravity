# ファイルシステム定期メンテナンス

プロジェクトが散らかってきたと感じたときの整理手順。
詳細は `/filesystem-cleanup` スキルを参照。

## いつ実行するか

- プロジェクトルートにファイルが4つ以上溜まってきたとき
- 同じようなフォルダが複数できてきたとき
- 「どこに何があるかわからない」と感じたとき

## 手順

1. **現状把握**
   ```bash
   ls -la /c/Users/mt_wa/projects/agy/
   find /c/Users/mt_wa/projects/agy -maxdepth 2 -type d
   ```

2. **HTMLプラン生成** → `cleanup-plan.html` をプロジェクトルートに出力

3. **SAFE アクションを実行**
   - ルートの画像 → `assets/`
   - ルートのスクリプト → `scripts/`
   - 生成コンテンツ → `Contents/`
   - 重複ファイル → `diff` 確認後に削除

4. **CAUTION 確認**
   - 同名ファイルが複数箇所に存在 → `diff` で比較
   - Obsidianノートの重複 → メインvault（`~/Obsidian/`）との差分確認

5. **確認**
   ```bash
   ls -la /c/Users/mt_wa/projects/agy/
   ```

## 禁止事項

- `.agent/` `.claude/` `.codex/` `.cursor/` `.gemini/` `.git/` の移動・削除
- `~/.claude/` など ホームのdotfiles への干渉
- `diff` 確認なしでの重複ファイル削除

## 標準構造の参照

`.claude/rules/project-structure.md` に正規の配置ルールを定義済み。
