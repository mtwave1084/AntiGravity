# consult-gemini.ps1
# Compatibility shim that forwards to consult-antigravity.ps1
# (HTTP API ban — bash + curl iijou).
#
# Background:
#   Gemini CLI no subscription teikyou ha 2026-06-18 ni shuuryou suru tame,
#   2026-05-26 ni HTTP API (OpenAI gokan endpoint) ni icchi keiro wo kirikae.
#   Kyuu skill / rule kara no `consult-gemini.ps1` chokuyou ga kowarenai you,
#   kono file ha usui wrapper to shite zanchi suru.
#
# Usage (unchanged):
#   .\scripts\consult-gemini.ps1 -Prompt "shirabetai koto" [-Model gemini-3.1-pro-preview]

param(
    [Parameter(Mandatory=$true)]
    [string]$Prompt,
    [string]$Model = "gemini-3.5-flash"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
& "$ScriptDir\consult-antigravity.ps1" -Prompt $Prompt -Model $Model
