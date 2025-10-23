---
title: 在docker部署Nacos
icon: pen-to-square
date: 2025-10-23
category:
  - Java
tag:
  - docker
  - Nacos
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



## 部署Nacos

> [Nacos Docker 快速开始 | Nacos 官网](https://nacos.io/docs/latest/quickstart/quick-start-docker/?spm=5238cd80.297dad21.0.0.271de37exgSjij)

### 拉取Nacos镜像

Nacos 官方镜像托管在 Docker Hub，直接拉取最新版本：

```bash
docker pull nacos/nacos-server:latest
```

若需要指定版本（如`v2.3.2`），可替换标签：

```bash
docker pull nacos/nacos-server:v2.3.2
```

### **准备 Nacos 数据目录（持久化）**

默认情况下，Nacos 使用嵌入式数据库（数据存储在容器内），容器删除后数据会丢失。建议挂载宿主机目录持久化数据

```bash
# 创建数据和日志目录（路径可自定义）
mkdir -p /opt/nacos/data /opt/nacos/logs

# 赋予目录权限（避免容器内权限不足）
sudo chmod -R 777 /opt/nacos
```

### **启动 Nacos 容器（单机模式）**

Nacos 支持单机和集群模式，先以**单机模式**部署，命令如下：

```bash
docker run -d \
  --name nacos \
  -p 8848:8848 \
  -e MODE=standalone \
  -e JVM_XMS=512m \
  -e JVM_XMX=512m \
  -v /opt/nacos/data:/home/nacos/data \
  -v /opt/nacos/logs:/home/nacos/logs \
  nacos/nacos-server:latest
```

### **验证部署是否成功**

**方法 1：查看容器状态**

```bash
docker ps | grep nacos
```

若输出包含`nacos`容器信息，说明启动成功。

**方法 2：查看容器日志**

```bash
docker logs -f nacos
```

若日志中出现类似 `Nacos started successfully in standalone mode.` 的信息，说明启动完成。

**方法 3：访问 Web 控制台**

打开浏览器，访问 `http://宿主机IP:8848/nacos`（若在本机部署，可用`localhost`）：

- 默认用户名 / 密码：`nacos`/`nacos`；
- 登录成功后，即可进入 Nacos 控制台，说明部署成功

### **Nacos 新版本启用了强制令牌和身份认证**

**步骤 1：生成 Base64 编码的令牌**

用 `openssl` 生成随机、安全的 32 字节原始密钥，再转成 Base64 编码

```bash
# 生成 32 字节随机数据，并用 Base64 编码（直接输出符合要求的令牌）
openssl rand -base64 32
```

输出结果：

```plaintext
n97+pqxF4yZbkRvu2UQvsbcsr6fJBFCKicOvaR40y5Y=
```

**步骤 2：删除之前启动失败的容器**

```bash
docker rm nacos
```

**步骤 3：添加令牌参数重新启动容器**

在启动命令中增加 `-e NACOS_AUTH_TOKEN=刚才生成的Base64值`，`-e NACOS_AUTH_IDENTITY_KEY=自定义键` 和 `-e NACOS_AUTH_IDENTITY_VALUE=自定义值`（示例用 `nacos-key` 和 `nacos-value`，可自行修改），完整命令如下：

```bash
docker run -d \
  --name nacos \
  -p 8848:8848 \
  -p 8081:8080 \
  -p 9848:9848 \
  -e MODE=standalone \
  -e JVM_XMS=512m \
  -e JVM_XMX=512m \
  -e NACOS_AUTH_TOKEN=n97+pqxF4yZbkRvu2UQvsbcsr6fJBFCKicOvaR40y5Y= \
  -e NACOS_AUTH_IDENTITY_KEY=nacos-key \
  -e NACOS_AUTH_IDENTITY_VALUE=nacos-value \
  -v /opt/nacos/data:/home/nacos/data \
  -v /opt/nacos/logs:/home/nacos/logs \
  nacos/nacos-server:latest
```

> 因为服务器800端口已被占用，所以替换成了8081
>
> 账号nacos，密码：nacos123

### 停止容器

```bash
docker stop nacos
```

