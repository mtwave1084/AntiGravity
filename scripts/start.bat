@echo off
setlocal

set WORKSPACE=C:\Users\mt_wa\projects\agy
set PID_FILE=%WORKSPACE%\.claude\ccc-session.pid

:: PID ロック確認 — 二重起動防止
if exist "%PID_FILE%" (
  set /p OLD_PID=<"%PID_FILE%"
  tasklist /FI "PID eq %OLD_PID%" 2>nul | find "%OLD_PID%" >nul
  if not errorlevel 1 (
    echo [tear] セッション稼働中: PID %OLD_PID%
    exit /b 0
  )
  echo [tear] 古いPIDファイルを削除して再起動するよ
  del "%PID_FILE%"
)

:: 自分のPIDを書き込む
echo %ERRORLEVEL% > "%PID_FILE%"

cd /d "%WORKSPACE%"

echo [tear] ティアを起動するね……
:: セッション起動（--continue で前回から継続）
claude --continue --channel plugin:discord:discord
