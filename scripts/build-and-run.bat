@echo off
REM Windows批处理脚本 - 构建和运行Docker容器

echo ======================================
echo   GBase监控平台 Docker部署脚本
echo ======================================

REM 检查Docker是否安装
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker未安装，请先安装Docker Desktop
    pause
    exit /b 1
)

echo [INFO] Docker检查通过

REM 停止现有容器
echo [INFO] 停止现有容器...
docker-compose -f docker-compose.local.yml down

REM 构建应用
echo [INFO] 构建React应用...
call npm run build
if errorlevel 1 (
    echo [ERROR] 构建失败
    pause
    exit /b 1
)

echo [SUCCESS] 构建完成

REM 构建Docker镜像并启动
echo [INFO] 构建Docker镜像并启动服务...
docker-compose -f docker-compose.local.yml up -d --build

REM 等待服务启动
echo [INFO] 等待服务启动...
timeout /t 10 /nobreak >nul

REM 检查服务状态
curl -f http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    echo [WARNING] 服务可能还在启动中
    echo [INFO] 请稍后访问 http://localhost:3000
) else (
    echo [SUCCESS] 服务启动成功！
    echo [INFO] 前端地址: http://localhost:3000
)

echo.
echo 其他有用命令:
echo   查看日志: docker-compose -f docker-compose.local.yml logs -f
echo   停止服务: docker-compose -f docker-compose.local.yml down
echo   查看状态: docker-compose -f docker-compose.local.yml ps

pause