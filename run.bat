@echo off
title Auto Google Translate Bot
echo Starting...
:a
node index.js
echo Restarting...
timeout 3 /noBreak
goto a