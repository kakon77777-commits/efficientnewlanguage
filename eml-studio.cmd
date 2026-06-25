@echo off
REM EML Studio - double-click to launch the Cogni-Editor in your browser.
REM Forwards any args to the launcher, e.g.  eml-studio.cmd run examples\phase0\sum.eml
setlocal
cd /d "%~dp0"
set "COREPACK_ENABLE_DOWNLOAD_PROMPT=0"
set "NODE_NO_WARNINGS=1"
node "%~dp0scripts\launch.mjs" %*
echo.
echo [EML] Launcher exited with code %errorlevel%. Press any key to close this window.
pause >nul
endlocal
