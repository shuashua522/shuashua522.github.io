---
title: 在docker部署xxl-job-极简版
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



## 部署xxl-job（纯 Docker 命令）

#### 创建自定义网络（保证容器间通信）

先创建一个专属网络，让 MySQL 和 xxl-job-admin 容器能通过容器名互相访问，避免端口冲突或通信问题：

```bash
docker network create xxl-job-network
```

#### 部署 MySQL 容器（xxl-job 依赖）

1. 先下载 xxl-job 官方初始化 SQL 文件（用于自动创建表结构）：
   ```bash
   # 创建目录存放数据和SQL，避免文件散落
   mkdir -p /home/ubuntu/xxlJob/sql
   cd /home/ubuntu/xxlJob/sql
   # 下载官方初始化SQL（国内源，速度快）
   curl -o init.sql https://gitee.com/xuxueli0323/xxl-job/raw/master/doc/db/tables_xxl_job.sql
   ```

2. 启动 MySQL 容器（关键参数已标注）：
   ```bash
   docker run -d \
     --name xxl-job-mysql \
     --network xxl-job-network \
     -p 3306:3306 \
     # 挂载实际存放的init.sql文件路径
     -v /home/ubuntu/xxlJob/sql/init.sql:/docker-entrypoint-initdb.d/init.sql \
     -e MYSQL_ROOT_PASSWORD=root123 \
     -e MYSQL_DATABASE=xxl_job \
     -e MYSQL_CHARACTER_SET_SERVER=utf8mb4 \
     -e MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci \
     --restart always \
     mysql:8.0
   ```

3. 验证 MySQL 是否启动并初始化成功（可选，确保表已创建）：
   ```bash
   # 进入MySQL容器
   docker exec -it xxl-job-mysql mysql -uroot -proot123
   # 进入xxl_job数据库
   use xxl_job;
   # 查看表是否存在（能看到xxl_job_开头的表就说明初始化成功）
   show tables;
   # 退出MySQL
   exit
   ```

#### 部署 xxl-job-admin 容器

等待 MySQL 完全启动（约 10 秒，确保初始化完成），再执行以下命令启动调度中心：

```bash
docker run -d \
  --name xxl-job-admin \          # 容器名
  --network xxl-job-network \     # 加入和MySQL相同的网络
  -p 8080:8080 \                  # 端口映射（宿主机8080→容器8080）
  -e SPRING_DATASOURCE_URL="jdbc:mysql://xxl-job-mysql:3306/xxl_job?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&serverTimezone=Asia/Shanghai" \
  # 重点：数据库地址用MySQL容器名（xxl-job-mysql），不是localhost
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=root123 \
  --restart always \              # 开机自启/异常重启
  xuxueli/xxl-job-admin:2.4.0    # xxl-job-admin镜像版本（稳定版）
```

访问管理界面：打开浏览器访问`http://你的服务器IP:8080/xxl-job-admin`

，用默认账号密码登录：

- 账号：admin

- 密码：123456



