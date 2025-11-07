@echo off
REM Docker deployment script for Phone Repair Shop Management System

echo Building and deploying Phone Repair Shop Management System with Docker...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist .env.local (
    echo Warning: .env.local file not found!
    echo Please create .env.local with your environment variables.
    echo You can copy .env.example to .env.local and update the values.
    set /p choice="Do you want to continue without environment variables? (y/N): "
    if /i not "%choice%"=="y" (
        echo Please create .env.local and try again.
        pause
        exit /b 1
    )
)

REM Build and start services
echo Building Docker images...
docker-compose build

echo Starting services...
docker-compose up -d

echo Deployment complete!
echo Access your application at http://localhost:3000
echo View logs with: docker-compose logs -f

pause