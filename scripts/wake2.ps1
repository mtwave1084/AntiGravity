Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Win32 API でスリープを防ぐ / モニターをオンにする
Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Power {
    [DllImport("kernel32.dll")]
    public static extern uint SetThreadExecutionState(uint esFlags);
    [DllImport("user32.dll")]
    public static extern int SendMessage(int hWnd, int hMsg, int wParam, int lParam);
    public const uint ES_CONTINUOUS = 0x80000000;
    public const uint ES_DISPLAY_REQUIRED = 0x00000002;
    public const uint ES_SYSTEM_REQUIRED = 0x00000001;
    public const int HWND_BROADCAST = 0xFFFF;
    public const int WM_SYSCOMMAND = 0x0112;
    public const int SC_MONITORPOWER = 0xF170;
}
"@

# モニターをオンにする (-1=on, 1=low power, 2=off)
[Power]::SendMessage([Power]::HWND_BROADCAST, [Power]::WM_SYSCOMMAND, [Power]::SC_MONITORPOWER, -1)
Start-Sleep -Milliseconds 300

# スリープ防止フラグをセット
[Power]::SetThreadExecutionState([Power]::ES_CONTINUOUS -bor [Power]::ES_DISPLAY_REQUIRED -bor [Power]::ES_SYSTEM_REQUIRED)

# キー入力シミュレート (Shift キー)
[System.Windows.Forms.SendKeys]::SendWait('+')
Start-Sleep -Milliseconds 500

# マウスを動かす
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(300, 300)
Start-Sleep -Milliseconds 300
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(400, 400)
Start-Sleep -Milliseconds 500

# スクリーンショット
$screen = [System.Windows.Forms.Screen]::PrimaryScreen
$bitmap = New-Object System.Drawing.Bitmap($screen.Bounds.Width, $screen.Bounds.Height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.CopyFromScreen($screen.Bounds.Location, [System.Drawing.Point]::Empty, $screen.Bounds.Size)
$bitmap.Save("C:\Users\mt_wa\projects\agy\screenshot3.png")
$graphics.Dispose()
$bitmap.Dispose()
Write-Host "Done"
