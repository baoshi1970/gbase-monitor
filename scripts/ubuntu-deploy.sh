#!/bin/bash

# GBase监控平台 Ubuntu自动部署脚本
# 使用方法: curl -fsSL https://raw.githubusercontent.com/your-repo/gbase-monitor/main/scripts/ubuntu-deploy.sh | bash

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_DIR="/opt/gbase-monitor"
SERVICE_NAME="gbase-monitor"
NGINX_SITE="gbase-monitor"

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

# 检查是否为root用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "请不要使用root用户运行此脚本，使用sudo权限的普通用户"
        exit 1
    fi
}

# 检查系统要求
check_system() {
    log_info "检查系统要求..."

    # 检查Ubuntu版本
    if ! command -v lsb_release &> /dev/null; then
        log_error "无法检测系统版本，请确保在Ubuntu系统上运行"
        exit 1
    fi

    local version=$(lsb_release -rs)
    if [[ $(echo "$version >= 18.04" | bc -l) -ne 1 ]]; then
        log_warning "建议使用Ubuntu 18.04或更高版本"
    fi

    # 检查内存
    local memory=$(free -m | awk 'NR==2{printf "%.1f", $2/1024}')
    if [[ $(echo "$memory < 2.0" | bc -l) -eq 1 ]]; then
        log_warning "系统内存少于2GB，可能影响性能"
    fi

    log_success "系统检查完成"
}

# 更新系统
update_system() {
    log_info "更新系统包..."
    sudo apt update
    sudo apt upgrade -y
    sudo apt install -y curl wget git vim bc
    log_success "系统更新完成"
}

# 安装Docker
install_docker() {
    if command -v docker &> /dev/null; then
        log_info "Docker已安装，版本: $(docker --version)"
        return 0
    fi

    log_info "安装Docker..."

    # 下载安装脚本
    curl -fsSL https://get.docker.com -o get-docker.sh

    # 执行安装
    sudo sh get-docker.sh

    # 添加用户到docker组
    sudo usermod -aG docker $USER

    # 清理安装脚本
    rm get-docker.sh

    log_success "Docker安装完成"
    log_warning "请重新登录以使docker组权限生效"
}

# 验证Docker安装
verify_docker() {
    log_info "验证Docker安装..."

    if ! command -v docker &> /dev/null; then
        log_error "Docker安装失败"
        exit 1
    fi

    # 测试Docker权限
    if ! docker ps &> /dev/null; then
        log_warning "Docker权限不足，尝试重新加载组权限..."
        newgrp docker
    fi

    # 检查Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose未正确安装"
        exit 1
    fi

    log_success "Docker验证完成"
}

# 克隆项目
clone_project() {
    log_info "克隆项目代码..."

    if [[ -d "$PROJECT_DIR" ]]; then
        log_warning "项目目录已存在，正在更新..."
        cd "$PROJECT_DIR"
        git pull
    else
        # 创建项目目录
        sudo mkdir -p "$PROJECT_DIR"
        sudo chown $USER:$USER "$PROJECT_DIR"

        # 这里需要替换为实际的仓库地址
        log_warning "请手动克隆项目到 $PROJECT_DIR"
        log_info "示例命令: git clone <your-repo-url> $PROJECT_DIR"

        # 如果有具体的仓库地址，取消下面的注释并替换URL
        # git clone https://github.com/your-username/gbase-monitor.git "$PROJECT_DIR"

        return 1
    fi

    cd "$PROJECT_DIR"
    log_success "项目代码准备完成"
}

# 配置防火墙
configure_firewall() {
    log_info "配置防火墙..."

    if command -v ufw &> /dev/null; then
        sudo ufw allow 22    # SSH
        sudo ufw allow 80    # HTTP
        sudo ufw allow 443   # HTTPS
        sudo ufw allow 3000  # 应用端口

        # 检查UFW状态，如果未启用则启用
        if ! sudo ufw status | grep -q "Status: active"; then
            echo "y" | sudo ufw enable
        fi

        log_success "防火墙配置完成"
    else
        log_warning "UFW未安装，跳过防火墙配置"
    fi
}

# 部署应用
deploy_application() {
    log_info "部署应用..."

    cd "$PROJECT_DIR"

    # 给脚本执行权限
    chmod +x scripts/docker-dev.sh

    # 构建并启动应用
    docker compose -f docker-compose.local.yml up -d --build

    # 等待启动
    sleep 15

    # 检查服务状态
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "应用部署成功"
    else
        log_warning "应用可能还在启动中"
    fi
}

# 创建系统服务
create_systemd_service() {
    log_info "创建系统服务..."

    sudo tee /etc/systemd/system/${SERVICE_NAME}.service > /dev/null << EOF
[Unit]
Description=GBase Monitor Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${PROJECT_DIR}
ExecStart=/usr/bin/docker compose -f docker-compose.local.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.local.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

    # 重载systemd配置
    sudo systemctl daemon-reload

    # 启用服务
    sudo systemctl enable ${SERVICE_NAME}

    log_success "系统服务创建完成"
}

# 安装Nginx (可选)
install_nginx() {
    read -p "是否安装Nginx反向代理? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "安装Nginx..."

        sudo apt install -y nginx

        # 创建配置文件
        sudo tee /etc/nginx/sites-available/${NGINX_SITE} > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

        # 启用站点
        sudo ln -sf /etc/nginx/sites-available/${NGINX_SITE} /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default

        # 测试配置
        sudo nginx -t

        # 重启Nginx
        sudo systemctl restart nginx
        sudo systemctl enable nginx

        log_success "Nginx安装配置完成"
    fi
}

# 显示部署信息
show_deployment_info() {
    log_success "========================================="
    log_success "  GBase监控平台部署完成！"
    log_success "========================================="
    echo
    log_info "访问地址:"
    log_info "  直接访问: http://$(hostname -I | awk '{print $1}'):3000"

    if systemctl is-active --quiet nginx; then
        log_info "  Nginx代理: http://$(hostname -I | awk '{print $1}')"
    fi

    echo
    log_info "常用命令:"
    log_info "  查看服务状态: sudo systemctl status ${SERVICE_NAME}"
    log_info "  查看应用日志: docker compose -f ${PROJECT_DIR}/docker-compose.local.yml logs -f"
    log_info "  重启应用: sudo systemctl restart ${SERVICE_NAME}"
    log_info "  进入项目目录: cd ${PROJECT_DIR}"
    echo
    log_info "管理脚本:"
    log_info "  ${PROJECT_DIR}/scripts/docker-dev.sh [start|stop|restart|logs|status]"
    echo
}

# 主函数
main() {
    echo "======================================="
    echo "  GBase AI监控平台 Ubuntu部署脚本"
    echo "======================================="
    echo

    check_root
    check_system
    update_system
    install_docker
    verify_docker

    if ! clone_project; then
        log_error "项目克隆失败，请手动克隆后重新运行部署"
        exit 1
    fi

    configure_firewall
    deploy_application
    create_systemd_service
    install_nginx
    show_deployment_info
}

# 错误处理
trap 'log_error "部署过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"