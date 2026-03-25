# consult-codex.ps1
# Claude Code から Codex CLI に相談するラッパースクリプト
# 使い方: .\scripts\consult-codex.ps1 "タスクの内容"

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,
    [string]$Sandbox = "read-only"   # read-only | workspace-write | danger-full-access
)

$ErrorActionPreference = "Stop"

# 出力先
$ConsultDir = "C:\Users\mt_wa\projects\agy\.ai-consults"
if (-not (Test-Path $ConsultDir)) { New-Item -ItemType Directory -Path $ConsultDir | Out-Null }

$Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$OutFile = "$ConsultDir\codex-$Timestamp.md"

# ヘッダー書き込み
$Header = @"
# Codex CLI Consultation
date: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
sandbox: $Sandbox
prompt: $Prompt

---

"@
Set-Content -Path $OutFile -Value $Header -Encoding UTF8

Write-Host "[orchestrate] Codex CLI に相談するよ (sandbox: $Sandbox)..."

try {
    # Codex CLIを呼ぶ
    $Result = codex exec --sandbox $Sandbox --ask-for-approval never `
        "AGENTS.md の指示に従って次のタスクを実行してください: $Prompt" 2>&1

    Add-Content -Path $OutFile -Value $Result -Encoding UTF8
    Write-Host "[orchestrate] 完了 → $OutFile"
    Write-Output $OutFile

} catch {
    $ErrorMsg = "ERROR: $_"
    Add-Content -Path $OutFile -Value $ErrorMsg -Encoding UTF8
    Write-Warning "[orchestrate] Codex CLIの呼び出しに失敗: $_"
    Write-Output $OutFile
}
