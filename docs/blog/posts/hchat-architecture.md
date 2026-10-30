---
title: HChat 的分层：两条链路、两台聊天服与一次跨服消息
titleHtml: 'HChat 的分层：两条<span class="nowrap">链路</span>、两台<span class="nowrap">聊天服</span>与<span class="nowrap">一次跨服消息</span>'
date: '2026-10-26'
category: 分布式系统
tags:
  - 分布式
  - gRPC
  - C++
description: 从 HTTP 登录到 TCP 长连接聊天，再到两台 ChatServer 之间的 gRPC 转发，拆开一个分布式 IM 的请求路径。
read: 8
order: 2
---

# HChat 的分层：两条<span class="nowrap">链路</span>、两台<span class="nowrap">聊天服</span>与<span class="nowrap">一次跨服消息</span>

<ArticleMeta />

HChat 是一个学习性质的分布式即时通讯项目：Qt 客户端、Boost.Beast HTTP 网关、gRPC 状态与转发服务、两台 Asio TCP 聊天服，外加 Redis 和 MySQL。功能不少，但真正值得拆的是它的分层方式。

> README 里写明了：这是一个基于 llfcchat 教程实现的学习项目。下面的分层说明来自项目自己的文档和目录结构。

## 两条链路，互不影响

客户端没有把所有请求塞进同一条连接，而是分成两条独立链路：

- **HTTP 到 GateServer**：注册、登录、重置密码、上传和下载头像。
- **TCP 到 ChatServer**：登录后的实时聊天。

登录流程把两条链路串起来：先通过 HTTP 拿到账号信息，再用 token 建立 TCP 连接登录 ChatServer；登录回包里直接带回好友列表。这样账号类操作走请求-响应，聊天类操作走长连接，互不阻塞。

## 服务与端口

| 服务 | 类型 | 端口 | 职责 |
|---|---|---|---|
| GateServer | HTTP | 8080 | 登录、注册、重置、上传、头像下载 |
| StatusServer | gRPC | 50052 | 在线状态、心跳 |
| ChatServer 1 | TCP / RPC | 8990 / 50055 | 聊天主节点 |
| ChatServer 2 | TCP / RPC | 8991 / 50056 | 聊天从节点 |
| VarifyServer | gRPC | 50051 | Node.js 邮件验证码 |
| MySQL | — | 3308 | 业务库 Hcat |
| Redis | — | 6380 | 验证码、token、在线状态 |

端口都从各服务的 `config.ini` 读取；改端口时要同步启动脚本和测试脚本，这也是分布式项目里很容易漏的一步。

## 为什么聊天不用 HTTP

聊天需要服务端主动推送，HTTP 的请求-响应模型不适合长期占用。ChatServer 用 Boost.Asio 维护 TCP 长连接，消息帧是自定义格式：**2 字节 id + 2 字节长度（大端）+ 消息体**。固定头部让服务端可以先读长度、再读内容，避免粘包和半包问题。

```text
+--------+----------+------------------+
| 2 字节 | 2 字节   | 消息体           |
| id     | 长度     | ...              |
+--------+----------+------------------+
```

协议层还有心跳、断线重连、异地登录踢人、断点续传和大文件流式上传。它们的共同点是都需要“连接状态”，这也是 TCP 链路存在的理由。

## 跨服消息

两台 ChatServer 共享同一个 Redis。在线状态由 StatusServer 统一维护，Redis 里存验证码、token、在线状态和分布式协调信息。

当两个用户分别连在不同节点上时，消息不能只在本节点投递：发送方所在的 ChatServer 会通过节点间的 gRPC 连接（50055 / 50056）把消息转给另一台，再由对方投递给目标用户。这样横向加节点时，不需要让所有客户端重连到同一台机器。

> 把“用户在哪台机器上”这件事交给 Redis 和 StatusServer，聊天服本身就能保持相对无状态，扩容和重启都更容易。

## 数据放在哪

持久化数据在 MySQL：用户、好友关系、好友申请、会话、私聊映射和聊天消息都有独立的表。Redis 负责短生命周期的状态：验证码、token、在线状态。这个划分让短生命周期的状态不必写进业务库，减少高频写压力。

## 几个真实的工程坑

这个项目里踩过、也写进 README 的几个问题，比架构图更有意思：

- **MySQL Connector/C++ 与 Debug 运行时**：Connector 只提供 Release DLL（`/MD`），原生 Debug（`/MDd`）在跨 DLL 传 `sql::SQLString` 时会因 STL 布局不同而崩溃。解决方式是把 `Debug|x64` 改成 Release 运行时（`/MD` + `NDEBUG` + `_ITERATOR_DEBUG_LEVEL=0`）但保留无优化，这样既能连 MySQL 又能断点。
- **GateServer 的工作目录**：它从当前工作目录读取 `config.ini`，所以必须从 `GateServer/` 目录启动；exe 同级还要有 MySQL 认证插件目录 `plugin/`，否则会出现 `mysql_native_password` 加载失败。
- **客户端构建环境**：`.pro` 的 post-link 用了 cmd 语法（`copy /Y`、`xcopy`），在 Git Bash 里跑 qmake/make 会把 `/Y` 当成 POSIX 路径，必须用 Qt Creator 构建。

这些问题不影响架构，但会让第一次跑起来的人卡很久。把它们写进 README，比事后解释省事。

## 小结

HChat 的分层可以概括成：HTTP 管账号，TCP 管聊天，Redis 管共享状态，gRPC 管跨节点，MySQL 管持久化。每一层只做一件事，组合起来才是一个能横向扩展的 IM。

源码在 [GitHub](https://github.com/Stan-Vincent/HChat-demo)。README 里有完整的启动脚本、端口表和测试脚本。
