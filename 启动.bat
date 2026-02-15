@echo off
chcp 65001 >nul
title 🔐 加密解密工具 - 快速启动

echo ==================================================
echo 🔐 加密解密工具 - 快速启动
echo ==================================================
echo.

cd /d "%~dp0"

echo [1/3] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ 错误: 未找到Python!
    echo.
    echo 请先安装Python:
    echo   https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

echo ✅ Python环境检查通过
echo.

echo [2/3] 启动本地服务器...
echo.

python 快速启动.py

if errorlevel 1 (
    echo.
    echo ❌ 启动失败，请检查错误信息
    pause
)
