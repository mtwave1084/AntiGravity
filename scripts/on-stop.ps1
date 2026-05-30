# on-stop.ps1
# Stop 繝輔ャ繧ｯ縺九ｉ蜻ｼ縺ｰ繧後ｋ繧ｻ繝・す繝ｧ繝ｳ邨ゆｺ・凾繧ｹ繧ｯ繝ｪ繝励ヨ
# ccc-handoff 縺悟他縺ｰ繧後※縺・↑縺・ｴ蜷医・繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ縺ｨ縺励※譛菴朱剞縺ｮ繝｡繧ｿ繝・・繧ｿ繧剃ｿ晏ｭ倥☆繧・
$handoffPath = "C:\Users\mt_wa\projects\solitaire\.claude\handoff.md"
$timestamp = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")

# 譌｢縺ｫ handoff.md 縺御ｻ頑律縺ｮ繧ｿ繧､繝繧ｹ繧ｿ繝ｳ繝励〒蟄伜惠縺吶ｋ蝣ｴ蜷医・繧ｹ繧ｭ繝・・
if (Test-Path $handoffPath) {
    $content = Get-Content $handoffPath -Raw
    $today = (Get-Date -Format "yyyy-MM-dd")
    if ($content -match $today) {
        Write-Host "[tear] handoff.md 縺ｯ莉頑律縺ｮ繧ゅ・縺梧里縺ｫ縺ゅｋ繧医√せ繧ｭ繝・・"
        exit 0
    }
}

# 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ: 譛菴朱剞縺ｮ邨ゆｺ・ｨ倬鹸繧呈嶌縺・$fallback = @"
# Session Handoff

updated: $timestamp

## 繝｡繝｢
繧ｻ繝・す繝ｧ繝ｳ縺檎ｵゆｺ・＠縺ｾ縺励◆・・cc-handoff 繧ｹ繧ｭ繝ｫ縺ｯ蜻ｼ縺ｰ繧後∪縺帙ｓ縺ｧ縺励◆・峨・谺｡蝗櫁ｵｷ蜍墓凾縺ｯ蜑榊屓縺ｮ迥ｶ諷九°繧牙・髢九＠縺ｦ縺上□縺輔＞縲・"@

Set-Content -Path $handoffPath -Value $fallback -Encoding UTF8
Write-Host "[tear] 繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ handoff.md 繧呈嶌縺・◆繧・

