---
paths:
  - "**/*"
---

# プロジェクト構造ルール

## agy/ の標準ディレクトリ構成

```
agy/
├── .agent/              ← AntiGravity管理（触らない）
├── .claude/             ← Claude Code管理（触らない）
├── .git/                ← Git（触らない）
│
├── Contents/            ← コンテンツ置き場（全出力・参照・素材はここ）
│   ├── AINews/          ← AIニュースHTML
│   ├── Brain参考記事/   ← スタイル参考記事
│   ├── ObsidianExport/  ← Obsidianエクスポート・講座素材
│   ├── ObsidianVault/   ← プロジェクト固有ノート（Le Pas du Sucre等）
│   └── knowledge/       ← ナレッジベース素材
│
├── assets/              ← 画像・スクリーンショット
├── scripts/             ← 運用スクリプト（.ps1, .sh等）
│
├── remotion-project/    ← Remotion動画フレームワーク
├── mv-project/          ← MVプロジェクト
├── soli-tear-mv/        ← ソリティアMV
├── Banana Shaker/       ← Banana Shakerプロジェクト
│
├── CLAUDE.md            ← Claude Code設定（ルートに必須）
├── .gitignore
├── credentials.json
└── upload_to_drive.py
```

## 配置ルール

- **生成した記事・HTML** → `Contents/` 以下（ルート直下に置かない）
- **スクリーンショット・画像** → `assets/`
- **PowerShell・シェルスクリプト** → `scripts/`
- **Obsidianエクスポート・講座素材** → `Contents/ObsidianExport/`
- **プロジェクト固有のObsidianノート** → `Contents/ObsidianVault/`
- **ツールが自動生成するdotfiles** → 触らない・移動しない

## 触らないディレクトリ

| パス | ツール |
|---|---|
| `.agent/` | AntiGravity |
| `.claude/` | Claude Code |
| `.codex/` | Codex CLI |
| `.cursor/` | Cursor IDE |
| `.gemini/` | Gemini CLI |
| `.git/` | Git |

## Obsidian vault について

- メインvault: `C:\Users\mt_wa\Obsidian\`（PARA構造、全体ナレッジ）
- プロジェクト固有ノート: `agy/Contents/ObsidianVault/`（AGYプロジェクトのみ）
- `agy/` 直下に `Obsidian/` フォルダを作らない（メインvaultと混同するため）
