# save-conversation-to-obsidian.ps1
# Stop 繝輔ャ繧ｯ縺九ｉ蜻ｼ縺ｰ繧後ｋ縲よ怙蠕後・莨夊ｩｱ繧ｿ繝ｼ繝ｳ繧・Obsidian 縺ｮ譌･谺｡繝ｭ繧ｰ縺ｫ霑ｽ險倥☆繧・
$ErrorActionPreference = "SilentlyContinue"

$obsidianDir = "C:\Users\mt_wa\Obsidian\99_Insights"
$projectDir  = "C:\Users\mt_wa\.claude\projects\C--Users-mt-wa-projects-solitaire"
$today       = Get-Date -Format "yyyy-MM-dd"
$timestamp   = Get-Date -Format "HH:mm"
$outputFile  = Join-Path $obsidianDir "conversations-$today.md"

# 譛譁ｰ縺ｮ JSONL 繝輔ぃ繧､繝ｫ繧貞叙蠕・$jsonlFile = Get-ChildItem -Path $projectDir -Filter "*.jsonl" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $jsonlFile) { exit 0 }

# 譛蠕後・ user / assistant 繝・く繧ｹ繝医ｒ謚ｽ蜃ｺ
$lastUser      = $null
$lastAssistant = $null

try {
    $lines = Get-Content $jsonlFile.FullName -Encoding UTF8
    foreach ($line in $lines) {
        if (-not $line.Trim()) { continue }
        try {
            $obj = $line | ConvertFrom-Json
            $role = $obj.type
            $content = $obj.message.content

            # content 縺碁・蛻励・縺ｨ縺肴怙蛻昴・ text 繝悶Ο繝・け繧貞叙繧・            $text = $null
            if ($content -is [string]) {
                $text = $content
            } elseif ($content -is [System.Array]) {
                $text = ($content | Where-Object { $_.type -eq "text" } | Select-Object -First 1).text
            }

            if ($text) {
                if ($role -eq "user")      { $lastUser      = $text }
                if ($role -eq "assistant") { $lastAssistant = $text }
            }
        } catch {}
    }
} catch {}

if (-not $lastUser -and -not $lastAssistant) { exit 0 }

# --- 繝輔ぃ繧､繝ｫ繝倥ャ繝繝ｼ・亥・蝗槭・縺ｿ・・--
if (-not (Test-Path $outputFile)) {
    Set-Content -Path $outputFile -Value "# 莨夊ｩｱ繝ｭ繧ｰ 窶・$today`n" -Encoding UTF8
}

# --- 繧ｨ繝ｳ繝医Μ繧堤ｵ・∩遶九※縺ｦ霑ｽ險・---
$lines_out = @("## $timestamp")

if ($lastUser) {
    $u = if ($lastUser.Length -gt 200) { $lastUser.Substring(0,200) + "窶ｦ" } else { $lastUser }
    $lines_out += "**繧ｽ繝ｪ繧ｹ**: $u"
    $lines_out += ""
}
if ($lastAssistant) {
    $a = if ($lastAssistant.Length -gt 300) { $lastAssistant.Substring(0,300) + "窶ｦ" } else { $lastAssistant }
    $lines_out += "**繝・ぅ繧｢**: $a"
    $lines_out += ""
}
$lines_out += "---"
$lines_out += ""

Add-Content -Path $outputFile -Value ($lines_out -join "`n") -Encoding UTF8
Write-Host "[tear] 莨夊ｩｱ繧・Obsidian 縺ｫ險倬鹸縺励◆繧・竊・$outputFile"

