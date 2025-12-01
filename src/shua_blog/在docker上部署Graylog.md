---
title: 在docker部署kafka
icon: pen-to-square
date: 2025-10-26
category:
  - Java
tag:
  - docker
  - kafka
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

## 在docker上部署Graylog

要在 Docker 上部署 Graylog 并配合项目中的logback-gelf依赖实现日志收集，可按以下步骤操作（Graylog 需依赖 MongoDB 存储元数据、Elasticsearch 存储日志，推荐用 Docker Compose 编排）：

### **步骤 1：准备 Docker Compose 配置**

创建docker-compose.yml文件，定义 Graylog、Elasticsearch、MongoDB 三个服务（注意版本兼容性，以下示例为稳定组合）：

```
version: '3.8'

services:
  # MongoDB：存储Graylog元数据（用户、角色、配置等）
  mongodb:
    image: mongo:6.0  # 与Graylog 5.x兼容
    container_name: graylog-mongodb
    volumes:
      - mongodb_data:/data/db  # 持久化数据
    networks:
      - graylog-network
    restart: always

  # Elasticsearch：存储实际日志数据
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.12  # 与Graylog 5.x兼容
    container_name: graylog-elasticsearch
    environment:
      - discovery.type=single-node  # 单节点模式（生产环境需集群）
      - cluster.name=graylog  # 集群名需与Graylog配置一致
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"  # 调整JVM内存（根据服务器配置修改）
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data  # 持久化日志
    networks:
      - graylog-network
    restart: always
    # Elasticsearch启动依赖系统参数，需提前配置（见步骤2）

  # Graylog：日志收集与分析平台
  graylog:
    image: graylog/graylog:5.1  # 稳定版本
    container_name: graylog-server
    environment:
      # 管理员密码（需是SHA-256哈希值，示例密码为"admin"）
      - GRAYLOG_ROOT_PASSWORD_SHA2=8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
      - GRAYLOG_ROOT_EMAIL=admin@example.com  # 管理员邮箱（可选）
      # MongoDB连接地址（容器名+默认端口）
      - GRAYLOG_MONGODB_URI=mongodb://mongodb:27017/graylog
      # Elasticsearch连接地址（容器名+默认端口）
      - GRAYLOG_ELASTICSEARCH_HOSTS=http://elasticsearch:9200
      # Web界面绑定地址（允许外部访问）
      - GRAYLOG_HTTP_BIND_ADDRESS=0.0.0.0:9000
      # 时区（可选，与项目日志时区一致）
      - GRAYLOG_TIMEZONE=Asia/Shanghai
    volumes:
      - graylog_data:/usr/share/graylog/data  # 持久化Graylog数据
    ports:
      - "9000:9000"  # Web管理界面端口
      - "12201:12201/udp"  # GELF UDP端口（接收logback-gelf发送的日志）
      - "12201:12201/tcp"  # 可选，GELF TCP端口（根据项目配置选择）
    networks:
      - graylog-network
    restart: always
    depends_on:
      - mongodb
      - elasticsearch

networks:
  graylog-network:
    driver: bridge

volumes:
  mongodb_data:
  elasticsearch_data:
  graylog_data:
```

### **步骤 2：配置系统参数（Linux 环境）**

Elasticsearch 启动依赖vm.max_map_count参数（默认值可能不足），需提前设置：

```
# 临时生效（重启服务器后失效）
sudo sysctl -w vm.max_map_count=262144

# 永久生效（推荐）
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p  # 刷新配置
```

### **步骤 3：启动 Graylog 服务**

在docker-compose.yml所在目录执行：

```
# 启动服务（后台运行）
docker-compose up -d

# 查看启动状态（确认三个容器均为running）
docker-compose ps
```

### **步骤 4：配置 Graylog 接收 GELF 日志**

Graylog 需创建 “GELF 输入源” 接收logback-gelf发送的日志：

1. 访问 Graylog Web 界面：http://服务器IP:9000（首次登录用户名admin，密码admin，即步骤 1 中哈希对应的原始密码）。

1. 左侧菜单进入 **System → Inputs**，在 “Select input” 下拉框选择 **GELF UDP**（或 TCP，与项目 logback 配置一致），点击 “Launch new input”。

1. 配置输入源：

- **Title**：自定义名称（如my-gelf-input）。

- **Bind address**：[0.0.0.0](http://0.0.0.0)（允许所有 IP 发送）。

- **Port**：12201（与 docker-compose 映射的端口一致）。

- 其他保持默认，点击 “Save”。

### **步骤 5：项目中配置 logback-gelf 发送日志**

项目已引入logback-gelf:3.0.0依赖，需在src/main/resources下创建logback.xml（或logback-spring.xml），配置 GELF 输出到 Graylog：

```
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
    <appender name="GELF" class="de.siegmar.logback.gelf.GelfUdpAppender">
        <!-- Graylog服务器IP和端口（与docker-compose映射的12201一致） -->
        <host>服务器IP</host>
        <port>12201</port>

        <!-- 必选字段：日志来源（如项目名） -->
        <source>my-project</source>

        <!-- 可选：额外字段（会在Graylog中显示） -->
        <additionalFields>
            environment=dev,application=my-app
        </additionalFields>

        <!-- 日志格式：包含时间、级别、消息等 -->
        <layout class="de.siegmar.logback.gelf.GelfLayout">
            <includeMdcKeyName>requestId</includeMdcKeyName>  <!-- 可选：包含MDC中的字段 -->
            <includeLevelName>true</includeLevelName>
            <includeThreadName>true</includeThreadName>
            <includeLoggerName>true</includeLoggerName>
            <includeFormattedMessage>true</includeFormattedMessage>
        </layout>
    </appender>

    <!-- 根日志级别：info及以上会被发送到Graylog -->
    <root level="info">
        <appender-ref ref="GELF" />
    </root>
</configuration>
```

- 若使用 TCP 而非 UDP，将GelfUdpAppender替换为GelfTcpAppender，并确保 Graylog 输入源对应 TCP。

- host需填写部署 Graylog 的服务器 IP（本地测试可用[localhost](http://localhost)）。

### **步骤 6：验证日志收集**

1. 启动项目，触发一些日志输出（如logger.info("test graylog")）。

1. 回到 Graylog Web 界面，左侧菜单点击 **Search**，即可看到项目发送的日志（可能需要等待几秒刷新）。

### 常见问题排查

- **Elasticsearch 启动失败**：检查vm.max_map_count是否配置正确，或减少ES_JAVA_OPTS的内存（如-Xms256m -Xmx256m）。

- **日志未接收**：

- 检查 Graylog 的 GELF 输入源是否启动（System → Inputs中状态为Running）。

- 验证项目logback.xml的host和port是否正确，服务器防火墙是否开放 12201 端口。

- 查看 Graylog 容器日志：docker logs graylog-server，排查连接错误。

通过以上步骤，即可在 Docker 中部署 Graylog 并结合logback-gelf实现日志收集。