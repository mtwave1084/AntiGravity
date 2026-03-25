# on-stop.ps1
# Stop フックから呼ばれるセッション終了時スクリプト
# ccc-handoff が呼ばれていない場合のフォールバックとして最低限のメタデータを保存する

$handoffPath = "C:\Users\mt_wa\projects\agy\.claude\handoff.md"
$timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")

# 既に handoff.md が今日のタイムスタンプで存在する場合はスキップ
if (Test-Path $handoffPath) {
    $content = Get-Content $handoffPath -Raw
    $today = (Get-Date -Format "yyyy-MM-dd")
    if ($content -match $today) {
        Write-Host "[tear] handoff.md は今日のものが既にあるよ、スキップ"
        exit 0
    }
}

# フォールバック: 最低限の終了記録を書く
$fallback = @"
# Session Handoff

updated: $timestamp

## メモ
セッションが終了しました（ccc-handoff スキルは呼ばれませんでした）。
次回起動時は前回の状態から再開してください。
"@

Set-Content -Path $handoffPath -Value $fallback -Encoding UTF8
Write-Host "[tear] フォールバック handoff.md を書いたよ"
