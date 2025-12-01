---
title: IDEA的环境配置
icon: pen-to-square
date: 2025-12-01
category:
  - Java
tag:
  - IDEA
  - 环境配置

---



## 环境信息

> 2025  idea 破解版安装教程参考：[ idea 2025.2.5 安装与破解 - 知乎](https://zhuanlan.zhihu.com/p/1976418632692150346)

- idea版本：
- jdk8 安装路径：F:\my_soft\java
- jdk17 安装路径：F:\my_soft\jdk-17
- maven
  - `Maven home directory`：F:/my_soft/apache-maven-3.8.4
  - `User settings file`：F:\my_soft\apache-maven-3.8.4\conf\settings.xml
  - `Local repository`：F:\my_soft\apache-maven-3.8.4\maven-repo



## JDK/SDK 配置

- 单个项目配置：
  1. 打开项目 → `File → Project Structure`（快捷键 `Ctrl+Alt+Shift+S`）；
  2. 左侧 `Platform Settings → SDKs` → 右上角 `+` → 选择 `JDK`；
  3. 选择本地 JDK 安装路径（如 `D:\jdk17`），点击 `OK`；
  4. 左侧 `Project Settings → Project` → 「SDK」下拉选择刚配置的 JDK，「Language level」匹配 JDK 版本（如 JDK17 选 17）；
  5. （可选）`Project Settings → Modules` → 对应模块 → `Dependencies` → 确认 Module SDK 为目标 JDK。
- 全局默认配置（新建项目无需重复配）：`File → Other Settings → Structure for New Projects`，重复上述步骤配置默认 JDK。



## 构建工具配置（Maven）

### maven

`File → Settings`（快捷键 `Ctrl+Alt+S`）→ `Build, Execution, Deployment → Build Tools → Maven`：

- `Maven home directory`：选择自定义 Maven 安装路径（如 `D:\apache-maven-3.9.0`）；
- `User settings file`：选择自定义的 `settings.xml` 路径；
- `Local repository`：自动读取 `settings.xml` 配置，无需手动改。



## 编码格式配置（避免中文乱码）

统一编码为 UTF-8 是必做项：`Settings → Editor → File Encodings`：

- 「Project encoding」「Default encoding for properties files」「IDE Encoding」均设为 `UTF-8`；
- 勾选「Transparent native-to-ascii conversion」（解决 properties 文件中文乱码）。