---
title: 在docker部署kafka
icon: pen-to-square
date: 2025-10-16
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

## 在docker上部署kafka

> [使用 Kafka 的事件驱动应用程序 | Docker Docs --- Event-driven apps with Kafka | Docker Docs](https://docs.docker.com/guides/kafka/#connecting-to-kafka-from-a-non-containerized-app)

### 步骤 1：创建 Docker Compose 配置（推荐）

为了让 Kafka-UI 与 Kafka 容器在同一网络中通信，推荐使用 docker-compose.yml 统一管理（若之前用 docker run 启动 Kafka，需先停止并迁移配置）：

**停止现有 Kafka 容器（若已启动）**

```bash
docker stop kafka && docker rm kafka
# 检查是否停止
docker ps 
```

**创建kafka的管理目录，存放配置文件：**

```
ubuntu@VM-24-5-ubuntu:~$ mkdir kafka-docker 
ubuntu@VM-24-5-ubuntu:~$ cd kafka-docker
ubuntu@VM-24-5-ubuntu:~/kafka-docker$ pwd
/home/ubuntu/kafka-docker
```

**创建 docker-compose.yml 文件**

```
nano docker-compose.yml
```

**写入以下配置（包含 Kafka 和 Kafka-UI）**

```
version: '3.8'

services:
  # Kafka 集群（基于 KRaft 模式）
  kafka:
    image: apache/kafka:latest
    container_name: kafka
    ports:
      - "9092:9092"  # 外部访问端口（本地Java程序）
      - "9093:9093"  # 内部访问端口（容器内服务如Kafka-UI）
    environment:
      # 1. 监听器配置：确保内部监听器绑定服务名
      KAFKA_LISTENERS: >
        CONTROLLER://localhost:9091,
        INTERNAL://0.0.0.0:9093,  
        EXTERNAL://0.0.0.0:9092 
      # 2. 声明地址：内部用服务名kaka，外部用环境变量IP
      KAFKA_ADVERTISED_LISTENERS: >
        INTERNAL://kafka:9093, 
        EXTERNAL://62.234.0.27:9092
      # 3. 监听器协议映射（名称必须与上面一致）
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: >
        CONTROLLER:PLAINTEXT,
        INTERNAL:PLAINTEXT,
        EXTERNAL:PLAINTEXT
      # 4. KRaft 必需配置（不变）
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@localhost:9091
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      # 5. 指定broker间通信用内部监听器
      KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
    # 显式加入自定义网络（必须）
    networks:
      - kafka-net

  # Kafka-UI 可视化工具
  kafka-ui:
    image: kafbat/kafka-ui:main
    container_name: kafka-ui
    ports:
      - "8080:8080"
    environment:
      # 关键：用Kafka的内部监听器地址（服务名+内部端口）
      KAFKA_CLUSTERS_0_NAME: local-kafka
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:9093  # 必须与Kafka的INTERNAL监听器一致
      DYNAMIC_CONFIG_ENABLED: "true"
    depends_on:
      - kafka  # 确保Kafka先启动
    # 显式加入同一个自定义网络（必须，否则无法解析kafka服务名）
    networks:
      - kafka-net

# 定义自定义网络（确保容器间通信）
networks:
  kafka-net:
    driver: bridge  # 单机桥接网络，适合容器间通信
```

### 步骤 2：启动服务

**在 docker-compose.yml 所在目录执行：**

```
docker compose up -d
```

- 查看启动状态：**docker compose ps**，确保 kafka 和 kafka-ui 均为 Up 状态。

### 步骤 3：访问 Kafka-UI 界面

打开浏览器，访问服务器的 8080 端口（若在本地服务器，直接访问 http://localhost:8080；若在远程服务器，替换为服务器 IP，如 http://你的服务器IP:8080）。



## Java连接kafka测试

### maven依赖

```xml
<dependencies>
    <!-- Kafka 客户端核心依赖 -->
    <dependency>
        <groupId>org.apache.kafka</groupId>
        <artifactId>kafka-clients</artifactId>
        <version>3.8.0</version> <!-- 与 Kafka 服务器版本匹配 -->
    </dependency>
    <!-- 日志依赖（可选，方便调试） -->
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-api</artifactId>
        <version>1.7.36</version>
    </dependency>
    <dependency>
        <groupId>org.slf4j</groupId>
        <artifactId>slf4j-simple</artifactId>
        <version>1.7.36</version>
    </dependency>
</dependencies>
```

### kafka生产者

```java
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.apache.kafka.common.serialization.StringSerializer;
import java.util.Properties;

/**
 * @author shuashua
 * @version 1.0
 * @date 2025/10/16 14:55
 */
public class KafkaProducerExample {
    public static void main(String[] args) {
        // 1. 配置生产者参数
        Properties props = new Properties();
        // Kafka 服务器地址（核心配置）
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, "服务器IP:9092"); // 替换为实际地址
        // 序列化器：将键和值从字符串转为字节数组
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class.getName());
        // 可选配置：消息确认机制（1表示仅首领节点确认，适合测试）
        props.put(ProducerConfig.ACKS_CONFIG, "1");

        // 2. 创建生产者实例
        KafkaProducer<String, String> producer = new KafkaProducer<>(props);

        try {
            String topic = "test-topic";
            for (int i = 0; i < 5; i++) {
                String key = "key-" + i;
                String value = "Hello Kafka! This is message " + i;
                ProducerRecord<String, String> record = new ProducerRecord<>(topic, key, value);

                // 改用同步发送（get() 等待结果），强制捕获成功/失败信息
                RecordMetadata metadata = producer.send(record).get();
                System.out.printf("同步发送成功：topic=%s, offset=%d%n", metadata.topic(), metadata.offset());
            }
        } catch (Exception e) {
            // 捕获所有异常（如连接超时、主题不存在）
            System.err.println("消息发送失败：" + e.getMessage());
            e.printStackTrace();
        }finally {
            // 4. 关闭生产者（释放资源）
            producer.flush(); // 确保所有消息被发送
            producer.close();
        }
    }
}
```

### kafka消费者

```java
/**
 * @author shuashua
 * @version 1.0
 * @date 2025/10/16 14:56
 */
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.ConsumerRecords;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.common.serialization.StringDeserializer;
import java.time.Duration;
import java.util.Collections;
import java.util.Properties;

public class KafkaConsumerExample {
    public static void main(String[] args) {
        // 1. 配置消费者参数
        Properties props = new Properties();
        // Kafka 服务器地址（核心配置）
        props.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "服务器IP:9092"); // 替换为实际地址
        // 消费者组ID（同一组内的消费者共同分担消费，不同组独立消费）
        props.put(ConsumerConfig.GROUP_ID_CONFIG, "test-group");
        // 反序列化器：将字节数组转为字符串
        props.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        props.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class.getName());
        // 自动提交偏移量（测试场景简化配置）
        props.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, "true");
        props.put(ConsumerConfig.AUTO_COMMIT_INTERVAL_MS_CONFIG, "1000");
        // 首次消费位置：earliest表示从最早消息开始，latest表示从最新消息开始
        props.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");

        // 2. 创建消费者实例
        KafkaConsumer<String, String> consumer = new KafkaConsumer<>(props);

        try {
            // 3. 订阅主题（可订阅多个，用集合传入）
            String topic = "test-topic";
            consumer.subscribe(Collections.singletonList(topic));
            System.out.println("开始消费消息...");

            // 4. 循环拉取消息（长轮询）
            while (true) {
                // 拉取消息，超时时间3秒
                ConsumerRecords<String, String> records = consumer.poll(Duration.ofSeconds(3));
                for (ConsumerRecord<String, String> record : records) {
                    System.out.printf("消费消息：topic=%s, partition=%d, offset=%d, key=%s, value=%s%n",
                            record.topic(), record.partition(), record.offset(),
                            record.key(), record.value());
                }
            }
        } finally {
            // 5. 关闭消费者（释放资源）
            consumer.close();
        }
    }
}

```

### 运行代码验证

运行前需要通过kafka-ui先创建主题：`test-topic`