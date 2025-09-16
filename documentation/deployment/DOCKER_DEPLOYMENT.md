# 🐳 GBase AI监控平台 Docker部署指南

## 📋 概述

本指南介绍如何使用Docker部署GBase AI监控平台。部署方案采用多阶段构建，使用nginx作为Web服务器，支持生产环境部署。

## 🏗️ 部署架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Nginx)       │────│   (Optional)    │────│   (Optional)    │
│   Port: 80      │    │   Port: 3000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速开始

### 前置条件
- Docker 20.0+ 
- Docker Compose 2.0+
- Git

### 1. 克隆项目
```bash
git clone <repository-url>
cd gbase-monitor
```

### 2. 构建并启动服务
```bash
# 构建并启动前端服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f gbase-monitor
```

### 3. 访问应用
- **前端界面**: http://localhost
- **健康检查**: http://localhost/health

## 📦 Docker文件说明

### Dockerfile
- **构建阶段**: 使用Node.js 18安装依赖并构建React应用
- **生产阶段**: 使用nginx:alpine提供静态文件服务
- **优化**: 多阶段构建减少镜像大小

### docker-compose.yml
```yaml
services:
  gbase-monitor:     # 前端服务
    build: .
    ports:
      - "80:80"
    healthcheck: ...
    
  # gbase-backend:   # 后端服务 (可选)
  # database:        # 数据库服务 (可选)  
  # redis:           # 缓存服务 (可选)
```

### .dockerignore
排除不必要的文件和目录，减少构建上下文大小。

## ⚙️ 配置选项

### 环境变量
在`docker-compose.yml`中配置环境变量：

```yaml
environment:
  - NODE_ENV=production
  - REACT_APP_API_URL=http://your-api-server
  - REACT_APP_API_KEY=your-api-key
```

### 端口配置
修改`docker-compose.yml`中的端口映射：

```yaml
ports:
  - "8080:80"  # 映射到8080端口
```

### SSL/HTTPS配置
```yaml
ports:
  - "80:80"
  - "443:443"
volumes:
  - ./ssl:/etc/nginx/ssl
```

## 🔧 高级配置

### 1. 添加后端服务
取消`docker-compose.yml`中后端服务的注释：

```yaml
gbase-backend:
  image: your-backend-image:latest
  ports:
    - "3000:3000"
  environment:
    - NODE_ENV=production
```

### 2. 添加数据库
取消数据库服务注释并配置：

```yaml
database:
  image: postgres:15-alpine
  environment:
    POSTGRES_DB: gbase_monitor
    POSTGRES_USER: admin
    POSTGRES_PASSWORD: password
  volumes:
    - postgres_data:/var/lib/postgresql/data
```

### 3. 自定义nginx配置
修改`nginx.conf`文件来自定义Web服务器配置。

## 📊 监控和维护

### 健康检查
```bash
# 检查服务健康状态
curl http://localhost/health

# 查看容器状态
docker-compose ps
```

### 日志管理
```bash
# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs gbase-monitor

# 限制日志输出行数
docker-compose logs --tail=100 gbase-monitor
```

### 数据备份
```bash
# 备份数据库 (如果使用)
docker-compose exec database pg_dump -U admin gbase_monitor > backup.sql

# 备份数据卷
docker run --rm -v gbase-monitor_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

## 🚀 生产环境部署

### 1. 资源限制
在`docker-compose.yml`中添加资源限制：

```yaml
deploy:
  resources:
    limits:
      memory: 512M
      cpus: '0.5'
    reservations:
      memory: 256M
      cpus: '0.25'
```

### 2. 安全配置
- 使用非root用户运行容器
- 配置防火墙规则
- 启用SSL/TLS加密
- 定期更新镜像

### 3. 负载均衡
使用nginx或traefik作为反向代理：

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.gbase.rule=Host(`monitor.yourdomain.com`)"
  - "traefik.http.services.gbase.loadbalancer.server.port=80"
```

## 🛠️ 故障排除

### 常见问题

**1. 端口占用**
```bash
# 检查端口使用情况
netstat -tulpn | grep :80

# 更改端口映射
ports:
  - "8080:80"
```

**2. 构建失败**
```bash
# 清理Docker缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

**3. 权限问题**
```bash
# 检查文件权限
ls -la nginx.conf

# 修复权限
chmod 644 nginx.conf
```

### 性能优化

**1. 启用压缩**
nginx.conf已配置gzip压缩。

**2. 静态资源缓存**
nginx配置了静态资源长期缓存。

**3. 容器资源监控**
```bash
# 查看资源使用情况
docker stats
```

## 📝 更新部署

### 1. 滚动更新
```bash
# 拉取最新代码
git pull

# 重新构建和部署
docker-compose build
docker-compose up -d
```

### 2. 零停机更新
```bash
# 逐个重启服务
docker-compose up -d --no-deps gbase-monitor
```

## 🔗 相关链接

- [Docker官方文档](https://docs.docker.com/)
- [Docker Compose文档](https://docs.docker.com/compose/)
- [nginx配置指南](https://nginx.org/en/docs/)
- [项目部署指南](项目初始化操作手顺.md)