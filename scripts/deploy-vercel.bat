@echo off
REM Vercel Deployment Script for ham-exam (Windows)

echo 🚀 Starting Vercel deployment for ham-exam...

REM Check if vercel CLI is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ vercel CLI is not installed. Installing now...
    npm install -g vercel
)

REM Login to Vercel (uncomment if needed)
REM vercel login

REM Pull current project configuration if this is a linked project
if exist ".vercel\project.json" (
    echo 🔄 Pulling project settings...
    vercel pull --yes
)

REM Build the project
echo 🏗️ Building the project...
npm run build

REM Deploy to Vercel
echo 📤 Deploying to Vercel...
if "%1"=="--prod" goto prod_deploy
if "%1"=="-p" goto prod_deploy

echo 🧪 Deploying to preview/staging...
vercel --token=%VERCEL_TOKEN%
goto end

:prod_deploy
echo 🌍 Deploying to production...
vercel --prod --token=%VERCEL_TOKEN%

:end
echo ✅ Deployment completed successfully!
echo 🎉 Your ham-exam application is now deployed.