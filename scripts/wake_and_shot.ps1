Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# 繝槭え繧ｹ繧貞虚縺九＠縺ｦ繧ｹ繝ｪ繝ｼ繝・繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ繧ｻ繝ｼ繝舌・隗｣髯､
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(100, 100)
Start-Sleep -Milliseconds 200
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(200, 200)
Start-Sleep -Milliseconds 200
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(150, 150)
Start-Sleep -Milliseconds 500

# 繧ｹ繧ｯ繝ｪ繝ｼ繝ｳ繧ｷ繝ｧ繝・ヨ
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
$bitmap.Save("C:\Users\mt_wa\projects\solitaire\screenshot2.png")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Saved screenshot2.png"

