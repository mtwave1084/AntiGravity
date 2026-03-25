Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# マウスを動かしてスリープ/スクリーンセーバー解除
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(100, 100)
Start-Sleep -Milliseconds 200
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(200, 200)
Start-Sleep -Milliseconds 200
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(150, 150)
Start-Sleep -Milliseconds 500

# スクリーンショット
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
$bitmap.Save("C:\Users\mt_wa\projects\agy\screenshot2.png")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Saved screenshot2.png"
