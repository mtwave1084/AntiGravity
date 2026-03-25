@echo off
:: ccc-heartbeat から呼び出されるセッション再起動スクリプト
set WORKSPACE=C:\Users\mt_wa\projects\agy
set PID_FILE=%WORKSPACE%\.claude\ccc-session.pid

echo [tear] セッションを再起動するよ……

:: 古いセッションを終了
if exist "%PID_FILE%" (
  set /p OLD_PID=<"%PID_FILE%"
  taskkill /F /PID %OLD_PID% 2>nul
  del "%PID_FILE%"
)

timeout /t 3 /nobreak >nul

:: 新しいセッションをバックグラウンドで起動
start "" /B cmd /c "cd /d %WORKSPACE% && call scripts\start.bat"

echo [tear] 再起動完了！
