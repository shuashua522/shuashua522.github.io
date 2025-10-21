---
title: 在docker部署Redis
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

### **带配置和持久化的部署**

为了数据持久化和自定义配置，建议挂载宿主机目录到容器：

#### **步骤 1：准备配置文件和数据目录**

```bash
# 创建配置文件目录和数据目录
mkdir -p /opt/redis/conf /opt/redis/data

# 下载官方默认配置文件（或手动创建）
wget -O /opt/redis/conf/redis.conf http://download.redis.io/redis-stable/redis.conf
```

#### **步骤 2：修改配置文件（关键配置）**

编辑 `/opt/redis/conf/redis.conf`，调整以下参数（根据需求）：

```conf
# 允许远程连接（注释掉bind，或改为0.0.0.0）
# bind 127.0.0.1 -::1
bind 0.0.0.0

# 开启密码认证（可选，替换为你的密码）
requirepass your_redis_password

# 持久化配置（默认开启RDB，可按需开启AOF）
# appendonly yes  # 开启AOF持久化
# appendfilename "appendonly.aof"

# 数据目录（容器内路径，需与挂载目录对应）
dir /data
```

#### **步骤 3：启动容器（挂载配置和数据）**

```bash
docker run --name redis \
  -p 6379:6379 \
  -v /opt/redis/conf/redis.conf:/etc/redis/redis.conf \
  -v /opt/redis/data:/data \
  -d redis:7.2 \
  redis-server /etc/redis/redis.conf
```

## 测试Redis是否可用

```java
@RestController
public class RedisTestController {

    @Autowired
    private StringRedisTemplate stringRedisTemplate;

    @GetMapping("/test/redis")
    public String testRedis() {
        try {
            // 写入测试数据
            stringRedisTemplate.opsForValue().set("test_controller", "Redis from Controller");
            // 读取测试数据
            String value = stringRedisTemplate.opsForValue().get("test_controller");
            return "Redis 操作成功，值为：" + value;
        } catch (Exception e) {
            return "Redis 操作失败：" + e.getMessage();
        }
    }
}
```

## Redis可视化工具

>  [AnotherRedisDesktopManager 发行版 - Gitee.com](https://gitee.com/qishibo/AnotherRedisDe[AnotherRedisDesktopManager 发行版 - Gitee.com](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)sktopManager/releases)
