@echo off
REM Menjalankan seluruh environment dev: Docker (Postgres + Redis), API (5000), Web (3001)
setlocal
cd /d "%~dp0"

echo [1/4] Menyalakan Docker Desktop...
docker info >nul 2>&1
if errorlevel 1 (
  start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
  echo      menunggu Docker siap...
  :waitdocker
  timeout /t 5 /nobreak >nul
  docker info >nul 2>&1
  if errorlevel 1 goto waitdocker
)

echo [2/4] Menyalakan database dan redis...
docker start indomurah-postgres indomurah-redis >nul
timeout /t 8 /nobreak >nul

echo [3/4] Menjalankan API (http://localhost:5000)...
start "IndoMurah API" cmd /k "cd /d %~dp0api && npm run start:dev"

echo [4/4] Menjalankan Web (http://localhost:3001)...
start "IndoMurah Web" cmd /k "cd /d %~dp0web && npm run dev"

echo.
echo Selesai. Buka http://localhost:3001
echo Login: Company Code INDOMURAH / admin / admin123
endlocal
