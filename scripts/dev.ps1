#requires -Version 5.1
<#
.SYNOPSIS
  Start PostgreSQL + Redis, apply migrations, then run API and web with reload.

.DESCRIPTION
  Two new PowerShell windows are opened for the long-running servers so this
  terminal stays free. First run creates backend/.venv and installs deps.

.EXAMPLE
  ./scripts/dev.ps1
  ./scripts/dev.ps1 -NoInfra -SkipInstall
#>
[CmdletBinding()]
param(
  [switch]$NoInfra,
  [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$venvPython = Join-Path $backend ".venv\Scripts\python.exe"

function Assert-File([string]$path, [string]$hint) {
  if (-not (Test-Path $path)) {
    throw "Missing $path. $hint"
  }
}

if (-not $NoInfra) {
  Write-Host "Starting PostgreSQL and Redis..." -ForegroundColor Cyan
  Push-Location $root
  docker compose up -d db redis
  Pop-Location
}

if (-not (Test-Path $venvPython)) {
  Write-Host "Creating backend virtual environment..." -ForegroundColor Cyan
  Push-Location $backend
  python -m venv .venv
  Pop-Location
  $SkipInstall = $false
}

if (-not $SkipInstall) {
  Write-Host "Installing backend dependencies..." -ForegroundColor Cyan
  & $venvPython -m pip install --upgrade pip | Out-Null
  & $venvPython -m pip install -r (Join-Path $backend "requirements-dev.txt")
}

Assert-File (Join-Path $backend ".env") "Copy backend/.env.example to backend/.env and fill in the values."

Write-Host "Applying database migrations..." -ForegroundColor Cyan
Push-Location $backend
& $venvPython -m alembic upgrade head
Pop-Location

Write-Host "Starting API on http://localhost:8000 ..." -ForegroundColor Green
Start-Process -FilePath $venvPython `
  -ArgumentList "-m", "uvicorn", "app.main:app", "--reload", "--port", "8000" `
  -WorkingDirectory $backend

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
  Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
  Push-Location $frontend
  npm install
  Pop-Location
}

Write-Host "Starting web on http://localhost:3000 ..." -ForegroundColor Green
Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" -WorkingDirectory $frontend

Write-Host ""
Write-Host "Web      : http://localhost:3000" -ForegroundColor Yellow
Write-Host "API docs : http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Health   : http://localhost:8000/api/v1/health" -ForegroundColor Yellow
