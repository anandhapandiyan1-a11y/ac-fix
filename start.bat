@echo off
REM ============================================
REM  AC-Fix - One-click launcher (Windows)
REM  Starts Backend (FastAPI :8000) + Frontend (Vite :5173)
REM ============================================
cd /d "%~dp0"

echo.
echo  ==========================================
echo   AC-Fix - Local AC Service Finder
echo   Starting backend + frontend...
echo  ==========================================
echo.

start "AC-Fix Backend" cmd /k "cd backend && ..\myenv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 4 /nobreak > nul
start "AC-Fix Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo  Backend : http://127.0.0.1:8000  (API docs: /docs)
echo  Frontend: http://localhost:5173
echo  Demo    : customer@demo.com / mechanic@demo.com  (password: demo1234)
echo.
pause