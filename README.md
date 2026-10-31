# Stan-Vincent 的博客

基于 VitePress 的个人博客。文章源码在 `docs/`，构建产物在仓库根目录，由 GitHub Pages 发布

## 环境

- Node.js 18+
- 首次拉取仓库后安装依赖：

```powershell
npm install
```

## 本地预览

开发模式（推荐，改 Markdown 会热更新）：

```powershell
npm run docs:dev
```

打开终端打印的地址，默认是 `http://localhost:5173/`。

预览构建后的成品：

```powershell
npm run docs:build
npm run docs:preview
```

默认是 `http://localhost:4173/`。

> 不要直接双击 `index.html`。VitePress 的页面依赖 HTTP 服务器，`file://` 下 `/assets/...` 会解析到错误位置，CSS/JS 全部 404，只显示原始 HTML。

## 写一篇新文章

### 1. 新建文件

在 `docs/blog/posts/` 下新建 Markdown 文件，文件名就是 URL：

```text
docs/blog/posts/my-first-post.md  →  /blog/posts/my-first-post.html
```

建议用英文短横线，不要用中文和空格。改文件名会改文章链接。

### 2. 使用这个模板

```md
---
title: 我的第一篇博客
date: '2026-10-26'
category: 随笔
tags: [C++, Qt]
description: 一句话摘要，列表和文章顶部都会显示。
read: 5
order: 1
---

# 我的第一篇博客

<ArticleMeta />

正文用 Markdown 写……

## 第一个小节

...
```

### 3. 字段说明

- `title`：侧栏、浏览器标题、列表标题
- `date`：建议加引号，避免 YAML 把它解析成日期对象
- `category`：文章分类，显示在文章顶部
- `tags`：标签数组，显示在列表和文章顶部
- `description`：摘要，显示在列表和文章顶部，也用于 SEO
- `read`：预计阅读分钟数
- `order`：排序用；日期新的在前，同一天 `order` 小的在前
- `titleHtml`（可选）：列表里显示的标题，可加 `<span class="nowrap">` 控制断行；不写就用 `title`
- 正文的 `# 标题` 与 `title` 保持一致
- `<ArticleMeta />` 必须保留，日期、标签、摘要靠它渲染

正文里用 `##` / `###` 分节，右侧目录会自动生成；代码块会自动带复制按钮。

### 4. 自动生成的内容

新增文章后，以下内容都由构建自动更新，**不用手动改其他 HTML**：

- 左侧“全部文章”侧栏
- `/blog/` 博客列表
- 首页最新 3 篇
- 上一篇 / 下一篇
- 本地搜索索引

如果 `npm run docs:dev` 里侧栏没有出现新文章，重启一下 dev server；`npm run build:site` 一定会重新读取。

## 构建与发布

```powershell
npm run build:site
```

这个命令会：

1. 用 VitePress 构建 `docs/`
2. 把产物复制到仓库根目录（`index.html`、`assets/`、`blog/` 等）

然后提交并推送：

```powershell
git add -A
git commit -m "Add post: 我的第一篇博客"
git push
```

GitHub Pages 发布的是仓库根目录的构建产物。

> 现在不是 push 自动构建：写完文章必须先跑 `npm run build:site`，否则线上还是旧内容。

## 根目录不要手改

下面这些都是生成物：

```text
index.html
assets/
blog/
404.html
hashmap.json
logo.svg
vp-icons.css
```

所有内容改动都在 `docs/` 里完成。下次构建会覆盖根目录的这些文件。

## 删除文章

删除 `docs/blog/posts/xxx.md`，然后重新构建：

```powershell
npm run build:site
```

侧栏、列表和搜索会自动更新；旧文章 URL 会失效。

## 图片

放到 `docs/public/images/`，Markdown 里用绝对路径：

```md
![截图](/images/example.png)
```

## 修改导航、侧栏和主题

- `docs/.vitepress/config.mts`：站点标题、导航、自动侧栏、搜索、页脚
- `docs/.vitepress/theme/custom.css`：配色、排版、首页样式、文章样式
- `docs/.vitepress/theme/components/`：首页、博客列表、文章元信息、阅读进度
- `docs/blog/posts.data.ts`：文章列表数据源
- `docs/index.md`：首页
- `docs/blog/index.md`：博客列表页

## 目录结构

```text
docs/
├── index.md                 首页
├── blog/
│   ├── index.md             博客列表
│   └── posts/               文章 Markdown（目前为空）
└── .vitepress/
    ├── config.mts           导航 / 侧栏 / 搜索
    └── theme/
        ├── custom.css       主题样式
        └── components/      首页、列表、文章元信息、阅读进度
scripts/copy-dist.mjs        构建产物复制脚本
package.json                 npm 脚本与依赖
```

## 常见问题

- **打开是裸 HTML、没有样式**：用 `npm run docs:dev` 或 `npm run docs:preview`，不要双击 `index.html`
- **新文章不显示**：先 `npm run build:site`；dev 模式下重启 server
- **首页没有新文章**：首页只显示最新 3 篇，全部文章在 `/blog/`
- **列表标题还是旧标题**：检查 frontmatter 里的 `titleHtml`，没用到就删掉
- **标题在手机上断行难看**：可加 `titleHtml` 并用 `<span class="nowrap">` 包住不想被拆开的词

## 忽略文件

`.gitignore` 已排除：

```text
node_modules/
docs/.vitepress/dist/
docs/.vitepress/cache/
.trae-html-share-packages/
.screenshots/
```
