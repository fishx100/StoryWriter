@echo off
rem Start backend and frontend dev servers in separate PowerShell windows

rem Backend: use project .venv Python executable to pick up installed deps
start "StoryWriter Backend" powershell -NoExit -Command "Set-Location 'd:\Projects\StoryWriter\backend'; & '..\.venv\Scripts\python.exe' -m uvicorn app.main:app --reload --port 8000"

rem Frontend: use explicit node executable to avoid PATH issues; use npm if node is on PATH
start "StoryWriter Frontend" powershell -NoExit -Command "Set-Location 'd:\Projects\StoryWriter\frontend'; & 'C:\Program Files\nodejs\node.exe' node_modules/next/dist/bin/next dev --port 3000"

rem Optionally open the app in the default browser
start "" "http://localhost:3000"
