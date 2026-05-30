# consult-codex.ps1
# Claude Code から Codex CLI に相談するラッパースクリプト
# 使い方:
#   .\scripts\consult-codex.ps1 -Prompt "タスクの内容" [-Sandbox read-only] [-AddDirs "C:/path1,C:/path2"]
# 実体は consult-codex.sh に委譲（PowerShell では codex の出力をキャプチャできないため）

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,
    [string]$Sandbox = "read-only",   # read-only | workspace-write | danger-full-access
    [string]$AddDirs = ""              # カンマ区切り。例: "C:/Users/mt_wa/projects/Starry_hiking"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ShScript  = "$ScriptDir\consult-codex.sh" -replace '\\', '/'

if ([string]::IsNullOrEmpty($AddDirs)) {
    $OutFile = bash $ShScript $Prompt $Sandbox
} else {
    $OutFile = bash $ShScript $Prompt $Sandbox $AddDirs
}

Write-Output $OutFile
