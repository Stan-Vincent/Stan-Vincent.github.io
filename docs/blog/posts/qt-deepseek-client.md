---
title: 用 Qt 6 写一个 DeepSeek 桌面客户端
titleHtml: '用 Qt 6 写一个 DeepSeek <span class="nowrap">桌面客户端</span>'
date: '2026-10-26'
category: 桌面应用
tags:
  - Qt
  - C++
  - 桌面应用
description: 把 API Key 和会话记录留在本地，用 Qt 6 做一个带流式输出、Markdown 渲染和主题切换的桌面聊天客户端。
read: 6
order: 1
---

# 用 Qt 6 写一个 DeepSeek <span class="nowrap">桌面客户端</span>

<ArticleMeta />

浏览器里的 AI 聊天工具已经很多，但我还是想要一个单独的桌面窗口：不用一直开着浏览器标签页，快捷键随手可用。DeepSeek API Client 就是在这个想法下写出来的，技术栈是 Qt 6 + C++。

## 它包含哪些功能

项目的功能都围绕“本地优先”展开：

- **多会话管理**：新建、重命名、删除对话，历史记录自动写入 `sessions.json`。
- **流式对话**：回复边生成边显示，也可以中途停止。
- **Markdown 渲染**：代码块、表格、列表、引用都能正常显示。
- **深色 / 浅色主题**：一键切换，主题写在 QSS 文件里。
- **参数配置**：API Key、模型、温度、最大 Token、思考模式。
- **导出对话**：Markdown、HTML 或纯文本。
- **快捷键**：`Ctrl+Enter` 发送、`Ctrl+N` 新建、`Ctrl+D` 删除。

这些功能都不复杂，难的是让它们在一个桌面窗口里互相不打架。

## 界面与业务逻辑分开

桌面客户端最容易写成“按钮回调里塞满业务代码”。一旦要换主题、加导出格式或者改会话存储，就会牵一发动全身。这个项目从一开始就按模块拆分：界面负责展示和输入，会话、请求、配置各自独立。最直接的体现是主题：`light.txt`、`dark.txt` 和 `MarkDown.qss` 都是独立文件，和主程序放在同一目录，换主题不需要改 C++ 代码。

> 代价是发布时必须把 QSS 文件一起打包，否则程序会找不到样式。这是一个很小但很容易踩的发布细节。

## 流式输出

流式对话的体验取决于两件事：增量内容要立刻出现在界面上，以及用户点“停止”时能真正停下来。前者要求网络层每收到一段内容就通知界面，后者要求请求生命周期可取消，而不是等整个回复结束再丢弃。

在这类客户端里，我更愿意把“请求状态”当成一等公民：空闲、请求中、已停止、失败，界面只根据状态切换按钮和光标。这样停止、重试、切换会话都不会出现“看起来停了，其实还在请求”的尴尬。

## Markdown 与主题

AI 回复里的代码和表格很多，纯文本显示会很难读。项目把 Markdown 的样式放在独立的 `MarkDown.qss` 里，配合代码高亮，让回复在深色和浅色主题下都保持一致的可读性。

配置项也由客户端自己管理：API Key、模型、温度、最大 Token 和思考模式都可以在首次启动的设置窗口里填写，之后也能从菜单里修改。整个使用过程不需要登录网页版控制台。

## 构建与运行

源码需要 Qt 6.4 或更高版本、CMake 3.16+，以及支持 C++17 的编译器（MSVC 2022 或 MinGW 64-bit）：

```bash
git clone https://github.com/Stan-Vincent/DeepSeek-API-Client-QT.git
cd DeepSeek-API-Client-QT
mkdir build && cd build
cmake ..
cmake --build . --config Release
```

如果直接用 Release 包，解压后要保证主程序和样式文件在同一目录：

```text
DeepSeek_Chat.exe
light.txt
dark.txt
MarkDown.qss
```

缺少样式文件时界面不会按预期显示；缺少 VC++ 运行时则可能提示 `VCRUNTIME140.dll` 找不到。

## 小结

这是一个功能不算庞大的客户端，但它把“本地存储、流式输出、Markdown、主题、配置、导出”这些点在 Qt 里串了一遍。对我来说，它更像是一个桌面应用结构的练习：先把边界划清楚，再往里面填功能。

源码在 [GitHub](https://github.com/Stan-Vincent/DeepSeek-API-Client-QT)，Release 页面也提供了编译好的 Windows 包。
