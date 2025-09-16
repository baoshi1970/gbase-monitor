#!/bin/bash

# GBase监控平台 Docker开发环境脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    log_success "Docker环境检查通过"
}

# 构建镜像
build() {
    log_info "开始构建Docker镜像..."
    docker-compose build --no-cache
    log_success "镜像构建完成"
}

# 启动服务
start() {
    log_info "启动Docker服务..."
    docker-compose up -d
    
    # 等待服务启动
    log_info "等待服务启动..."
    sleep 10
    
    # 检查服务状态
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "服务启动成功！"
        log_info "前端地址: http://localhost"
        log_info "健康检查: http://localhost/health"
    else
        log_warning "服务可能还在启动中，请稍后访问"
    fi
}

# 停止服务
stop() {
    log_info "停止Docker服务..."
    docker-compose down
    log_success "服务已停止"
}

# 重启服务
restart() {
    log_info "重启Docker服务..."
    stop
    start
}

# 查看日志
logs() {
    log_info "查看服务日志..."
    docker-compose logs -f
}

# 查看服务状态
status() {
    log_info "服务状态:"
    docker-compose ps
    
    log_info "健康检查:"
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "服务运行正常"
    else
        log_error "服务异常或未启动"
    fi
}

# 清理容器和镜像
clean() {
    log_info "清理Docker资源..."
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    log_success "清理完成"
}

# 进入容器
exec_container() {
    log_info "进入容器..."
    docker-compose exec gbase-monitor sh
}

# 显示帮助信息
show_help() {
    echo "GBase监控平台 Docker管理脚本"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "命令:"
    echo "  build     构建Docker镜像"
    echo "  start     启动服务"
    echo "  stop      停止服务"
    echo "  restart   重启服务"
    echo "  logs      查看日志"
    echo "  status    查看服务状态"
    echo "  clean     清理Docker资源"
    echo "  exec      进入容器"
    echo "  help      显示帮助信息"
    echo ""
}

# 主函数
main() {
    case "${1:-help}" in
        build)
            check_docker
            build
            ;;
        start)
            check_docker
            start
            ;;
        stop)
            stop
            ;;
        restart)
            check_docker
            restart
            ;;
        logs)
            logs
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        exec)
            exec_container
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"