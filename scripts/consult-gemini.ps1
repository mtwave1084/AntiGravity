# consult-gemini.ps1
# Claude Code から Gemini CLI に相談するラッパースクリプト
# 使い方: .\scripts\consult-gemini.ps1 "調査したいこと"

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt
)

$ErrorActionPreference = "Stop"

# 出力先
$ConsultDir = "C:\Users\mt_wa\projects\agy\.ai-consults"
if (-not (Test-Path $ConsultDir)) { New-Item -ItemType Directory -Path $ConsultDir | Out-Null }

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$OutFile = "$ConsultDir\gemini-$Timestamp.md"

# ヘッダー書き込み
$Header = @"
# Gemini CLI Consultation
date: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
prompt: $Prompt

---

"@
Set-Content -Path $OutFile -Value $Header -Encoding UTF8

Write-Host "[orchestrate] Gemini CLI に相談するよ..."

try {
    # Gemini CLIを呼ぶ（--promptフラグは実際のバージョンで確認してね）
    $FullPrompt = "GEMINI.mdの指示に従って次のタスクを実行してください: $Prompt"
    $Result = gemini -p $FullPrompt 2>&1

    Add-Content -Path $OutFile -Value $Result -Encoding UTF8
    Write-Host "[orchestrate] 完了 → $OutFile"
    Write-Output $OutFile

} catch {
    $ErrorMsg = "ERROR: $_"
    Add-Content -Path $OutFile -Value $ErrorMsg -Encoding UTF8
    Write-Warning "[orchestrate] Gemini CLIの呼び出しに失敗: $_"
    Write-Output $OutFile
}
