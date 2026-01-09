# Banana Shaker v2.0 Review Result

## Findings
- Critical: `DIAGRAM_STRUCTURES`/`DIAGRAM_STYLES` の未閉じ文字列でビルドが通りません。(`lib/diagram-agent/types.ts:26`, `lib/diagram-agent/types.ts:27`, `lib/diagram-agent/types.ts:45`, `lib/diagram-agent/types.ts:56`, `lib/diagram-agent/types.ts:99`, `lib/diagram-agent/types.ts:145`)
- Critical: 図解フォーム内の JSX が壊れていてコンパイル不能です（未閉じ placeholder、閉じタグ欠落）。(`components/diagram-generator/DiagramForm.tsx:162`, `components/diagram-generator/DiagramForm.tsx:197`, `components/diagram-generator/DiagramForm.tsx:216`)
- Critical: ブロック編集 UI も JSX/文字列が壊れていてビルドに失敗します。(`components/diagram-generator/BlockEditor.tsx:94`, `components/diagram-generator/BlockEditor.tsx:96`, `components/diagram-generator/BlockEditor.tsx:114`, `components/diagram-generator/BlockEditor.tsx:116`)
- High: URL 変更に `ModeSwitcher` の state が追随しないため、表示モードが URL とズレる可能性があります。(`components/ModeSwitcher.tsx:20`)
- High: サイドバーのアクティブ判定が `pathname === item.href` で query を含む `href` と一致せず、`/generate?mode=...` が常に非アクティブになります。(`components/app-sidebar.tsx:48`)
- Medium: 図解は `DiagramImage` に保存されますが、ギャラリーは `GenerationJob/Image` のみ表示するため、図解は出ません。(`app/(main)/gallery/page.tsx:1`, `components/diagram-generator/DiagramForm.tsx:295`)
- Medium: UI 表示文字列の文字化けが残っています。(`components/ModeSwitcher.tsx:57`, `components/diagram-generator/DiagramForm.tsx:162`, `components/diagram-generator/BlockEditor.tsx:94`, `components/diagram-generator/ReferenceImageGrid.tsx:60`)
- Low: `as any` が多用されており、レビューガイドの「No any」条件に未対応です。(`app/diagram-actions.ts:31`, `app/diagram-actions.ts:72`, `app/diagram-actions.ts:220`)

## Open Questions / Assumptions
- 図解はギャラリー表示を分ける方針（別ギャラリー）で進めますか？
- `components/generator-form.tsx` は変更していない認識のため、本件レビュー対象外として扱います。

## Requirements Check
- モード切り替え、2段階生成、図解構造/スタイルの定義、DiagramJob/DiagramImageのマイグレーションなど「意図した実装」は見えますが、現状は構文エラーが残っており要件を満たした状態に達していません。
- 「既存の free モードUIは変更しない」という要件は、現時点では変更なし扱いとします（確認済みの前提）。

## Suggested Next Steps
1) 文字化け/構文エラーを直してビルドが通る状態に戻す
2) `ModeSwitcher` を URL 変化に追随させる（初期値だけでなく検索パラメータ変化で同期）
3) サイドバーのアクティブ判定を `pathname` と query の分離で修正する
4) 図解ギャラリーを分離する場合の導線・一覧UIを決める
5) `any` の削減（DB結果の型付け）
6) 手動テスト（モード切替、ワイヤーフレーム→最終、参照画像4枚）

## Test Status
- テストは未実行です。
