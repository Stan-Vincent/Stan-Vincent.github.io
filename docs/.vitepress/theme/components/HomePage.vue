<script setup>
import { data as posts } from '../../../blog/posts.data'

const latestPosts = posts.slice(0, 3)
</script>

<template>
  <div class="home-shell">
    <div class="home-backdrop" aria-hidden="true"></div>

    <main class="home-wrap">
      <section id="top" class="hero">
        <p class="eyebrow">
          <span class="pulse" aria-hidden="true"></span>
          C++ / Qt 开发者
        </p>

        <h1>欢迎来到我的<span class="accent">博客</span></h1>

        <p class="lede">
          我是 Stan-Vincent。这里记录 C++、Qt 与分布式系统的实践，
          也会写下这个站点本身是怎么做出来的。
        </p>

        <div class="actions">
          <a class="btn btn-primary" href="/blog/">
            <span>读文章</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
          <a class="btn btn-ghost" href="#projects">
            <span>查看项目</span>
            <span class="btn-arrow" aria-hidden="true">↓</span>
          </a>
        </div>

        <div class="scroll-hint" aria-hidden="true">向下</div>
      </section>

      <section id="posts" class="section">
        <div class="section-head">
          <span class="idx">01</span>
          <h2>文章</h2>
          <a class="note note-link" href="/blog/">全部文章 →</a>
        </div>

        <div v-if="latestPosts.length" class="post-list">
          <a
            v-for="post in latestPosts"
            :key="post.url"
            class="post-row"
            :href="post.url"
          >
            <span class="post-date">{{ post.date }}</span>
            <span class="post-row-main">
              <span class="post-row-title" v-html="post.titleHtml"></span>
              <span class="post-row-desc">{{ post.description }}</span>
              <span class="post-row-tags">
                <span v-for="tag in post.tags" :key="tag" class="tag">{{ tag }}</span>
              </span>
            </span>
            <span class="post-arrow" aria-hidden="true">→</span>
          </a>
        </div>
        <p v-else class="empty-state">还没有文章。在 <code>docs/blog/posts/</code> 新建 Markdown 文件，然后运行 <code>npm run build:site</code>。</p>
      </section>

      <section id="projects" class="section">
        <div class="section-head">
          <span class="idx">02</span>
          <h2>项目</h2>
          <span class="note">两个开源项目，持续迭代中</span>
        </div>

        <div class="projects">
          <article class="card">
            <div class="card-top">
              <span>01</span>
              <span>桌面应用</span>
            </div>
            <h3>DeepSeek API Client</h3>
            <p>
              基于 Qt 6 的 DeepSeek AI 桌面聊天客户端，集成 DeepSeek API 实现流式对话，
              支持 Markdown 渲染、多会话管理、主题切换与配置管理。模块化设计，界面与业务逻辑解耦。
            </p>
            <div class="tags">
              <span class="tag">C++</span>
              <span class="tag">Qt 6</span>
              <span class="tag">DeepSeek API</span>
              <span class="tag">Markdown</span>
            </div>
            <a
              class="card-link"
              href="https://github.com/Stan-Vincent/DeepSeek-API-Client-QT"
              target="_blank"
              rel="noopener"
            >
              <span>查看源码</span>
              <span class="card-arrow" aria-hidden="true">→</span>
            </a>
          </article>

          <article class="card">
            <div class="card-top">
              <span>02</span>
              <span>分布式系统</span>
            </div>
            <h3>HChat 分布式即时通讯</h3>
            <p>
              基于 Qt 与 C++ 的分布式 IM 系统（C/S 架构）：Qt 6 客户端 + Boost.Beast HTTP 网关
              + gRPC 分服协调 + 多台 Asio TCP 聊天服 + Redis/MySQL。支持私聊群聊、大文件流式上传、
              断线重连与断点续传。
            </p>
            <div class="tags">
              <span class="tag">C++</span>
              <span class="tag">Qt 6</span>
              <span class="tag">Boost.Asio</span>
              <span class="tag">gRPC</span>
              <span class="tag">Redis</span>
              <span class="tag">MySQL</span>
            </div>
            <a
              class="card-link"
              href="https://github.com/Stan-Vincent/HChat-demo"
              target="_blank"
              rel="noopener"
            >
              <span>查看源码</span>
              <span class="card-arrow" aria-hidden="true">→</span>
            </a>
          </article>
        </div>
      </section>

      <section id="skills" class="section">
        <div class="section-head">
          <span class="idx">03</span>
          <h2>技能</h2>
          <span class="note">日常开发中使用的技术</span>
        </div>

        <div class="skills">
          <div class="skill-row">
            <span class="skill-label">语言与框架</span>
            <div class="chips">
              <span class="chip">C++</span>
              <span class="chip">Qt 6</span>
              <span class="chip">Boost.Asio</span>
              <span class="chip">Boost.Beast</span>
              <span class="chip">gRPC</span>
            </div>
          </div>
          <div class="skill-row">
            <span class="skill-label">存储与中间件</span>
            <div class="chips">
              <span class="chip">Redis</span>
              <span class="chip">MySQL</span>
            </div>
          </div>
          <div class="skill-row">
            <span class="skill-label">工具链</span>
            <div class="chips">
              <span class="chip">Git</span>
              <span class="chip">CMake</span>
              <span class="chip">Linux</span>
              <span class="chip">Visual Studio</span>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" class="section">
        <div class="contact-panel">
          <div>
            <h2>在 GitHub 上找我</h2>
            <p>对 C++、Qt 或分布式系统感兴趣，欢迎来逛逛，一起交流。</p>
          </div>
          <a
            class="btn btn-primary"
            href="https://github.com/Stan-Vincent"
            target="_blank"
            rel="noopener"
          >
            <span>打开 GitHub</span>
            <span class="btn-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>
