# 🐧 Ubuntu系统部署指南

## 📋 概述

本指南详细介绍如何在Ubuntu系统上部署GBase AI监控平台。

## 🔧 环境准备

### 1. 系统要求
- Ubuntu 18.04+ (推荐 20.04 或 22.04)
- 最少 2GB RAM
- 最少 10GB 可用磁盘空间
- sudo权限

### 2. 更新系统
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. 安装必要工具
```bash
sudo apt install -y curl wget git vim
```

## 🐳 Docker安装

### 方式一：官方脚本安装 (推荐)
```bash
# 下载Docker安装脚本
curl -fsSL https://get.docker.com -o get-docker.sh

# 执行安装
sudo sh get-docker.sh

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或执行以下命令使组权限生效
newgrp docker
```

### 方式二：手动安装
```bash
# 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 安装依赖
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加Docker源
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新并安装Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

### 3. 验证Docker安装
```bash
# 检查Docker版本
docker --version

# 检查Docker Compose版本
docker compose version

# 测试Docker运行
docker run hello-world
```

## 📦 部署应用

### 1. 克隆项目
```bash
# 进入部署目录
cd /opt

# 克隆项目 (替换为你的仓库地址)
sudo git clone <your-repository-url> gbase-monitor

# 修改权限
sudo chown -R $USER:$USER /opt/gbase-monitor
cd /opt/gbase-monitor
```

### 2. 方式一：使用部署脚本
```bash
# 给脚本执行权限
chmod +x scripts/docker-dev.sh

# 构建并启动
./scripts/docker-dev.sh build
./scripts/docker-dev.sh start
```

### 3. 方式二：手动部署
```bash
# 使用本地配置文件（适合国内网络环境）
docker compose -f docker-compose.local.yml up -d --build

# 或使用标准配置
docker compose up -d --build
```

### 4. 检查部署状态
```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 检查服务健康状态
curl http://localhost:3000
```

## 🌐 配置网络访问

### 1. 防火墙配置
```bash
# 允许HTTP访问
sudo ufw allow 80
sudo ufw allow 3000

# 如果需要HTTPS
sudo ufw allow 443

# 启用防火墙
sudo ufw enable
```

### 2. 配置反向代理 (可选)

#### 安装Nginx
```bash
sudo apt install -y nginx

# 创建配置文件
sudo tee /etc/nginx/sites-available/gbase-monitor << 'EOF'
server {
    listen 80;
    server_name your-domain.com;  # 替换为你的域名或IP

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
sudo ln -s /etc/nginx/sites-available/gbase-monitor /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔧 系统服务配置

### 1. 创建systemd服务
```bash
sudo tee /etc/systemd/system/gbase-monitor.service << 'EOF'
[Unit]
Description=GBase Monitor Application
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/gbase-monitor
ExecStart=/usr/bin/docker compose -f docker-compose.local.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.local.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

# 重载systemd配置
sudo systemctl daemon-reload

# 启用服务
sudo systemctl enable gbase-monitor

# 启动服务
sudo systemctl start gbase-monitor

# 检查状态
sudo systemctl status gbase-monitor
```

### 2. 设置开机自启
```bash
# 确保Docker开机自启
sudo systemctl enable docker

# 确保应用开机自启
sudo systemctl enable gbase-monitor
```

## 📊 监控和维护

### 1. 日志管理
```bash
# 查看应用日志
docker compose logs -f gbase-monitor

# 查看系统服务日志
sudo journalctl -u gbase-monitor -f

# 查看Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. 性能监控
```bash
# 查看容器资源使用
docker stats

# 查看系统资源
htop
free -h
df -h
```

### 3. 备份和更新
```bash
# 创建备份脚本
sudo tee /opt/backup-gbase.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/gbase-monitor"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份配置文件
tar -czf $BACKUP_DIR/config_$DATE.tar.gz \
    /opt/gbase-monitor/docker-compose*.yml \
    /opt/gbase-monitor/nginx.conf \
    /etc/nginx/sites-available/gbase-monitor

# 备份数据（如果有数据库）
# docker exec gbase-monitor-db pg_dump -U admin gbase_monitor > $BACKUP_DIR/db_$DATE.sql

echo "Backup completed: $BACKUP_DIR"
EOF

chmod +x /opt/backup-gbase.sh

# 设置定期备份
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-gbase.sh") | crontab -
```

## 🚀 更新部署

### 1. 更新代码
```bash
cd /opt/gbase-monitor

# 拉取最新代码
git pull

# 重新构建和部署
docker compose down
docker compose up -d --build
```

### 2. 滚动更新脚本
```bash
sudo tee /opt/update-gbase.sh << 'EOF'
#!/bin/bash
cd /opt/gbase-monitor

echo "Pulling latest code..."
git pull

echo "Building new image..."
docker compose build

echo "Updating service..."
docker compose up -d

echo "Cleaning up old images..."
docker image prune -f

echo "Update completed!"
EOF

chmod +x /opt/update-gbase.sh
```

## 🛠️ 故障排除

### 常见问题

1. **端口占用**
```bash
# 检查端口使用
sudo netstat -tulpn | grep :3000
sudo lsof -i :3000

# 修改端口
# 编辑 docker-compose.local.yml 中的端口映射
```

2. **权限问题**
```bash
# 修复Docker权限
sudo usermod -aG docker $USER
newgrp docker

# 修复文件权限
sudo chown -R $USER:$USER /opt/gbase-monitor
```

3. **内存不足**
```bash
# 检查内存使用
free -h

# 清理Docker资源
docker system prune -a
```

4. **网络问题**
```bash
# 检查防火墙状态
sudo ufw status

# 重启Docker网络
docker network prune
sudo systemctl restart docker
```

## 📝 访问应用

部署完成后，可以通过以下方式访问：

- **本地访问**: http://localhost:3000
- **局域网访问**: http://服务器IP:3000
- **域名访问**: http://your-domain.com (配置Nginx后)

## 🔒 安全建议

1. **定期更新系统**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **配置SSL证书**
```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

3. **限制访问**
```bash
# 只允许特定IP访问
sudo ufw allow from 192.168.1.0/24 to any port 3000
```

4. **启用fail2ban**
```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```