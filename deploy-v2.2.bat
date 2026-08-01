@echo off
chcp 65001 >nul
echo ============================================
echo   非遗影像工坊 V2.2.0 部署脚本 BY 阿岩
echo ============================================
echo.

:: 检查是否提供了 API Token
if "%~1"=="" (
    echo [错误] 请提供 Cloudflare API Token
    echo.
    echo 使用方法: deploy-v2.2.bat YOUR_CLOUDFLARE_API_TOKEN
    echo.
    echo 获取 Token 步骤:
    echo   1. 访问 https://dash.cloudflare.com/profile/api-tokens
    echo   2. 点击 "Create Token"
    echo   3. 选择 "Edit Cloudflare Workers" 模板
    echo   4. 或自定义权限: Account ^> Cloudflare Pages ^> Edit
    echo   5. 复制生成的 Token
    pause
    exit /b 1
)

set CLOUDFLARE_API_TOKEN=%~1
set CLOUDFLARE_ACCOUNT_ID=d47a86113683cf607f4ad2044c8b5027

echo [1/3] 构建项目...
cd /d "C:\Users\Administrator\AppData\Roaming\TRAE SOLO CN\ModularData\ai-agent\work-mode-projects\6a572d3fdf87250939ae844b\feiyidaoyantai-main"
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 构建失败
    pause
    exit /b 1
)
echo [完成] 构建成功
echo.

echo [2/3] 部署到 Cloudflare Pages...
call npx wrangler pages deploy dist --project-name=feiyi --branch=main
if %errorlevel% neq 0 (
    echo [错误] 部署失败
    pause
    exit /b 1
)
echo [完成] 部署成功
echo.

echo [3/3] 验证部署...
timeout /t 5 >nul
echo 访问以下地址验证:
echo   - https://feiyi-4zu.pages.dev
echo   - https://feiyi.hao1234.top
echo.
echo ============================================
echo   V2.2.0 部署完成 BY 阿岩
echo ============================================
pause
