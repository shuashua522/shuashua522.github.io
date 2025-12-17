---
title: 在docker部署Redis-极简版
icon: pen-to-square
date: 2025-10-21
category:
  - Java
tag:
  - docker
  - Redis
---



## 服务器环境

Ubuntu-22.04

## 安装docker

> [Ubuntu | Docker Docs --- Ubuntu | Docker Docs](https://docs.docker.com/desktop/setup/install/linux/ubuntu/)

安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用：

```
sudo systemctl status docker
```

### 配置docker镜像

**配置镜像：**

```
# 1. 创建 Docker 配置目录（若已存在则跳过）
sudo mkdir -p /etc/docker

# 2. 编辑配置文件（daemon.json）
sudo nano /etc/docker/daemon.json

# 3. 粘贴以下内容(或者你的其他镜像地址)
{
  "registry-mirrors": [  
  "https://docker.xuanyuan.me",
  "https://mirrors.tuna.tsinghua.edu.cn/docker-ce/"]
}

# 4. 保存退出（Ctrl+O → 回车 → Ctrl+X）

# 5. 重启 Docker 服务，使配置生效
sudo systemctl daemon-reload
sudo systemctl restart docker
```

**验证镜像是否生效：**

```
docker info
```

输出中若能看到 Registry Mirrors: 你的镜像地址/，说明配置成功。



## 部署Redis

### 拉取Redis镜像

```bash
docker pull redis:7.2
```

验证镜像是否拉取成功：

```bash
docker images | grep redis
```

### 使用 Redis 容器（最简版）

#### 步骤 1：启动

直接启动一个 Redis 容器，暴露端口、设置简单密码（学习用，避免无密码风险）：

```bash
# 启动Redis容器（核心参数说明）
# -d：后台运行
# -p 6379:6379：映射主机6379端口到容器6379（主机端口可自定义，比如6380:6379）
# --name redis-learn：容器命名（方便管理）
# --requirepass 123456：设置Redis密码（学习用，记得改）
docker run -d --name redis-learn -p 6379:6379 redis:7.2 --requirepass 123456
```

验证启动是否成功：

```bash
# 查看容器状态（UP表示运行中）
docker ps | grep redis-learn

# 查看容器日志（确认无报错）
docker logs redis-learn
```

#### 连接

1. 进入容器内部连接（推荐）

```bash
# 进入redis-learn容器，启动redis-cli客户端
docker exec -it redis-learn redis-cli

# 连接后输入密码（替换成你设置的123456）
127.0.0.1:6379> AUTH 123456
# 返回OK表示认证成功

# 测试基础操作（学习用）
127.0.0.1:6379> SET name "docker-redis"  # 设置键值对
127.0.0.1:6379> GET name                 # 获取值
127.0.0.1:6379> KEYS *                   # 查看所有键
127.0.0.1:6379> DEL name                 # 删除键
```

2. 主机直接连接（需安装 redis-cli，可选）:

```bash
redis-cli -h 127.0.0.1 -p 6379 -a 123456
# 后续操作和容器内一致
```
