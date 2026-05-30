# consult-antigravity.ps1
# Claude Code kara Gemini OpenAI gokan endpoint ni soudan suru wrapper.
# Jittai ha consult-antigravity.sh (bash + curl). PowerShell 5.1 no
# native-process stdout capture mondai wo sakeru tame ni bash ni iijou shiteiru
# (same pattern as consult-codex.ps1).
#
# Usage:
#   .\scripts\consult-antigravity.ps1 -Prompt "shirabetai koto" [-Model gemini-3.1-pro-preview]

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,
    [string]$Model = "gemini-3.5-flash"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ShScript  = "$ScriptDir\consult-antigravity.sh" -replace '\\', '/'

# Use Git Bash explicitly. Default "bash" on Windows resolves to
# C:\Windows\System32\bash.exe (WSL launcher), which is wrong here.
$GitBash = "$env:ProgramFiles\Git\bin\bash.exe"
if (-not (Test-Path $GitBash)) {
    Write-Error "Git Bash not found at $GitBash. Install Git for Windows."
    exit 1
}

$OutFile = & $GitBash $ShScript $Prompt $Model
Write-Output $OutFile
