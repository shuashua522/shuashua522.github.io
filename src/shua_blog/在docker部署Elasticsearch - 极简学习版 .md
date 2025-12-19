---
title: 在docker部署Elasticsearch-极简版
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



## 部署Elasticsearch

### 调整系统内核参数（ES 必需）

ES 运行需要调整`vm.max_map_count`参数，否则启动会报错，执行以下命令（临时生效，重启机器后需重新执行）：

```bash
# Linux系统
sudo sysctl -w vm.max_map_count=262144

# 如需永久生效，编辑/etc/sysctl.conf，添加以下内容后执行sysctl -p
# vm.max_map_count=262144
```

###  Docker 命令部署 ES（单节点，测试专用）

直接执行以下`docker run`命令，一键创建并启动 ES 容器：

```bash
# 无持久化部署ES（容器删除后数据全部清空）
docker run -d \
  --name es-test \                          # 容器名，方便管理
  --restart unless-stopped \                # 异常退出自动重启（可选，测试用可去掉）
  -e "ES_JAVA_OPTS=-Xms512m -Xmx512m" \     # 限制内存，避免占用过多资源
  -e "discovery.type=single-node" \         # 单节点模式，测试专用
  -e "xpack.security.enabled=false" \       # 禁用安全认证，学习更方便
  -e "network.host=0.0.0.0" \               # 允许外部访问
  -p 9200:9200 \                            # 映射HTTP端口（核心，用于访问ES API）
  -p 9300:9300 \                            # 节点通信端口（测试用可选）
  elasticsearch:7.17.20
```

### 访问ES

####  访问 ES 接口验证

执行以下命令（或浏览器访问`http://你的机器IP:9200`）：

```bash
curl http://localhost:9200
```

成功会返回 ES 的基础信息 JSON，示例如下：

```json
{
  "name" : "xxxxxx",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "xxxxxx",
  "version" : {
    "number" : "7.17.20",
    "build_flavor" : "default",
    "build_type" : "docker"
  },
  "tagline" : "You Know, for Search"
}
```

#### 3. 简单测试 ES 功能（创建索引 / 读写数据）

```bash
# 1. 创建测试索引
curl -X PUT "localhost:9200/test_index?pretty"

# 2. 插入一条测试数据
curl -X PUT "localhost:9200/test_index/_doc/1?pretty" -H 'Content-Type: application/json' -d '
{
  "name": "无持久化测试",
  "content": "删除容器后这条数据会消失"
}
'

# 3. 查询插入的数据
curl -X GET "localhost:9200/test_index/_doc/1?pretty"
```
