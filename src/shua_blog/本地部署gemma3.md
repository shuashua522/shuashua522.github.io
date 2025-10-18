---
title: 本地部署gemma3
icon: pen-to-square
date: 2025-10-16
category:
  - agent
tag:
  - ollama
---



## Gemma3

> [gemma3 --- gemma3](https://ollama.com/library/gemma3)

当前在单个 GPU 上运行的最强大的模型。

**这个模型需要 Ollama 0.6 或更高版本。**

Gemma 是 Google 基于 Gemini 技术构建的一家人工智能模型。Gemma 3 模型是多模态的，可以处理文本和图像，具有 128K 的上下文窗口，支持超过 140 种语言。它们有 270M、1B、4B、12B 和 27B 参数大小，擅长问答、摘要和推理等任务，而其紧凑的设计允许在资源受限的设备上部署。



## 安装Ollama

> [Download Ollama](https://ollama.com/download)
>
> 安装完成后，Ollama 会自动在后台启动服务（默认端口：`11434`）

选择gemma3:270m下载

![image-20251018163001758](C:\Users\admin\AppData\Roaming\Typora\typora-user-images\image-20251018163001758.png)

## openai api调用

```python
from openai import OpenAI

# 配置客户端，指向本地Ollama服务
client = OpenAI(
    base_url="http://localhost:11434/v1",  # Ollama的OpenAI兼容端点
    api_key="ollama"  # 本地调用无需真实API密钥，任意字符串即可
)

# 调用Gemma3（模型名称需与下载的标签一致，如gemma3:4b）
response = client.chat.completions.create(
    model="gemma3:270m",  # 模型标签（与pull/run时一致）
    messages=[
        {"role": "user", "content": "介绍一下你自己"}
    ]
)

# 输出结果
print(response.choices[0].message.content)
```



