@echo off
setlocal EnableExtensions

set "WORKSPACE=C:\Users\mt_wa\projects\solitaire"
set "PID_FILE=%WORKSPACE%\.claude\ccc-session.pid"
set "CHANNEL=plugin:discord@claude-plugins-official"
set "POWERSHELL_EXE=%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe"

REM PID lock check to prevent duplicate launches.
if exist "%PID_FILE%" (
  set /p OLD_PID=<"%PID_FILE%"
  tasklist /FI "PID eq %OLD_PID%" 2>nul | find "%OLD_PID%" >nul
  if not errorlevel 1 (
    echo [tear] Session already running: PID %OLD_PID%
    exit /b 0
  )
  echo [tear] Removing stale PID file and relaunching
  del "%PID_FILE%"
)

REM Batch files cannot read their own PID directly, so query the parent cmd.exe PID via PowerShell.
for /f %%I in ('%POWERSHELL_EXE% -NoProfile -Command "(Get-CimInstance Win32_Process | Where-Object ProcessId -eq $PID).ParentProcessId"') do set "CURRENT_PID=%%I"
if not defined CURRENT_PID (
  echo [tear] Failed to resolve launcher PID
  exit /b 1
)
> "%PID_FILE%" echo %CURRENT_PID%

cd /d "%WORKSPACE%"

echo [tear] Launching Claude session...
claude --channels %CHANNEL% --enable-auto-mode "/ccc-boot"

set "CLAUDE_EXIT=%ERRORLEVEL%"
if exist "%PID_FILE%" del "%PID_FILE%"
exit /b %CLAUDE_EXIT%
