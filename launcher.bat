@echo off
:: Get the current directory where this script is running
set "CURRENT_DIR=%~dp0"

:: Launch Edge in Kiosk mode (Full screen, no exit button)
start msedge.exe --kiosk "%CURRENT_DIR%index.html" --edge-kiosk-type=fullscreen

:: Alternatively, if you prefer Chrome, use this line instead:
:: start chrome.exe --kiosk "%CURRENT_DIR%index.html"