@echo off
chcp 65001 >nul
echo Введите сообщение коммита на русском:
set /p message=
git add .
git commit -m "%message%"
echo.
echo Коммит создан: %message%
echo.
pause
