#!/bin/bash

# Docker网络问题修复脚本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# 检测网络连通性
test_network() {
    log_info "检测网络连通性..."

    if curl -s --connect-timeout 5 https://registry-1.docker.io > /dev/null; then
        log_success "Docker Hub连接正常"
        return 0
    else
        log_warning "Docker Hub连接失败"
        return 1
    fi
}

# 配置Docker镜像源
configure_docker_mirror() {
    log_info "配置Docker镜像源..."

    # 创建docker配置目录
    sudo mkdir -p /etc/docker

    # 配置国内镜像源
    sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
    "registry-mirrors": [
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com",
        "https://mirror.baidubce.com",
        "https://ccr.ccs.tencentyun.com"
    ],
    "max-concurrent-downloads": 10,
    "log-driver": "json-file",
    "log-level": "warn",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
EOF

    # 重启Docker服务
    sudo systemctl daemon-reload
    sudo systemctl restart docker

    log_success "Docker镜像源配置完成"
}

# 使用本地构建方案
use_local_build() {
    log_info "使用本地构建方案..."

    cd /opt/gbase-monitor

    # 停止现有容器
    docker compose down 2>/dev/null || true

    # 使用本地配置构建
    docker compose -f docker-compose.local.yml up -d --build

    # 等待服务启动
    sleep 15

    # 检查服务状态
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_success "服务启动成功！"
        log_info "访问地址: http://$(hostname -I | awk '{print $1}'):3000"
    else
        log_warning "服务可能还在启动中"
    fi
}

# 预拉取所需镜像
pull_images() {
    log_info "预拉取所需镜像..."

    local images=(
        "node:18-alpine"
        "nginx:alpine"
    )

    for image in "${images[@]}"; do
        log_info "拉取镜像: $image"
        if docker pull "$image"; then
            log_success "镜像 $image 拉取成功"
        else
            log_error "镜像 $image 拉取失败"
        fi
    done
}

# 创建离线部署包
create_offline_package() {
    log_info "创建离线部署包..."

    # 构建本地镜像
    docker compose -f docker-compose.local.yml build

    # 保存镜像
    docker save gbase-monitor-gbase-monitor:latest > gbase-monitor-image.tar

    log_success "离线镜像包已创建: gbase-monitor-image.tar"
}

# 主菜单
main_menu() {
    echo "======================================="
    echo "  Docker网络问题修复工具"
    echo "======================================="
    echo "1. 检测网络连通性"
    echo "2. 配置Docker镜像源"
    echo "3. 使用本地构建方案 (推荐)"
    echo "4. 预拉取镜像"
    echo "5. 创建离线部署包"
    echo "6. 一键修复并部署"
    echo "0. 退出"
    echo
    read -p "请选择操作 [0-6]: " choice

    case $choice in
        1) test_network ;;
        2) configure_docker_mirror ;;
        3) use_local_build ;;
        4) pull_images ;;
        5) create_offline_package ;;
        6)
            configure_docker_mirror
            sleep 5
            use_local_build
            ;;
        0) exit 0 ;;
        *) log_error "无效选择" ;;
    esac
}

# 自动修复模式
auto_fix() {
    log_info "开始自动修复..."

    if ! test_network; then
        log_info "网络连接异常，配置镜像源..."
        configure_docker_mirror
        sleep 5
    fi

    log_info "使用本地构建方案部署..."
    use_local_build
}

# 主函数
main() {
    if [[ $# -eq 0 ]]; then
        main_menu
    elif [[ "$1" == "auto" ]]; then
        auto_fix
    else
        echo "用法: $0 [auto]"
        echo "  auto: 自动修复模式"
        exit 1
    fi
}

main "$@"