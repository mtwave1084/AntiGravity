@echo off
setlocal EnableExtensions

set "WORKSPACE=C:\Users\mt_wa\projects\solitaire"
set "PID_FILE=%WORKSPACE%\.claude\ccc-session.pid"

echo [tear] Restarting Claude session...

REM Stop the tracked cmd.exe process tree if a session is recorded.
if exist "%PID_FILE%" (
  set /p OLD_PID=<"%PID_FILE%"
  taskkill /F /T /PID %OLD_PID% 2>nul
  del "%PID_FILE%"
)

timeout /t 3 /nobreak >nul

REM Launch a fresh detached session in the background.
start "" /B cmd /c "call \"%WORKSPACE%\scripts\start.bat\""

echo [tear] Relaunch requested

