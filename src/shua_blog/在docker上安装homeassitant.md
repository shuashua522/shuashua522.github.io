---
title: 在docker上安装homeassitant
icon: pen-to-square
date: 2025-10-08
category:
  - agent
tag:
  - docker
  - homeassitant
---



## 服务器环境

Ubuntu-22.04

## 安装docker

>  [Linux | Docker Docs --- Linux | Docker Docs](https://docs.docker.com/desktop/setup/install/linux/)

安装后 Docker 服务会自动启动。要验证 Docker 是否正在运行，请使用：

```console
 sudo systemctl status docker
```

### **配置 Docker 加速器**

**配置 Docker 加速器**：

```bash
# 1. 创建 Docker 配置目录（若已存在则跳过）
sudo mkdir -p /etc/docker

# 2. 编辑配置文件（daemon.json）
sudo nano /etc/docker/daemon.json

# 3. 粘贴以下内容，将 "你的阿里云加速器地址" 替换为实际复制的地址
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

**验证加速器是否生效**：

```bash
docker info
```

输出中若能看到 `Registry Mirrors: 你的阿里云加速器地址/`，说明配置成功。



## 在docker上部署homeassistant

### 创建持久化配置目录

Home Assistant 的配置文件、数据库和日志需存储在主机本地目录，避免容器重启后数据丢失：

```bash
sudo mkdir -p /opt/homeassistant/config
sudo chown -R $USER:$USER /opt/homeassistant  # 设置当前用户权限
```

### **拉取并运行 Home Assistant 容器**

**拉取最新镜像**

```bash
docker pull homeassistant/home-assistant:latest
```

**启动容器**

```bash
docker run -d \
  --name homeassistant \
  --restart unless-stopped \
  -v /opt/homeassistant/config:/config \
  -e TZ=Asia/Shanghai \
  -p 8123:8123 \
  homeassistant/home-assistant:latest
```

**参数解释**：

- `-d`：后台运行容器。
- `--restart unless-stopped`：容器意外终止时自动重启。
- `-v /opt/homeassistant/config:/config`：将主机目录映射到容器内的配置目录。
- `-e TZ=Asia/Shanghai`：设置时区为上海。
- `-p 8123:8123`：将容器的 8123 端口映射到主机端口。

### 访问前端

在本地电脑的浏览器中输入：`http://服务器IP地址:8123`

账号：shua，密码：123456

### 安装HACS

直接下载 HACS 压缩包（无需 Git）：

```bash
# 确保当前在 custom_components 目录
cd /opt/homeassistant/config/custom_components

# 下载最新版 HACS 压缩包
wget https://github.com/hacs/integration/releases/latest/download/hacs.zip

# 解压到 hacs 文件夹（若提示 unzip 未安装，先执行：sudo apt install unzip）
unzip hacs.zip -d hacs

# 解压后删除压缩包（可选）
rm hacs.zip

# 修复权限（Docker 环境必须执行）
sudo chown -R 1000:1000 /opt/homeassistant/config

# 重启 Home Assistant 容器
docker restart homeassistant
```



阿里云服务器远程连接密码：@Shua123

