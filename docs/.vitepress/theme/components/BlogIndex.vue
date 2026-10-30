<script setup>
import { data as posts } from '../../../blog/posts.data'

const monthText = posts.length
  ? posts[0].date.slice(0, 7).replace('-', ' 年 ') + ' 月'
  : ''
</script>

<template>
  <div class="blog-index-page">
    <div class="home-backdrop" aria-hidden="true"></div>

    <main class="home-wrap">
      <section class="page-hero">
        <p class="eyebrow">
          <span class="pulse" aria-hidden="true"></span>
          BLOG
        </p>
        <h1>记录与思考</h1>
        <p class="lede">关于 C++、Qt 与分布式系统的实践笔记，也记录建站过程。</p>
        <p class="blog-count">
          共 {{ posts.length }} 篇文章<span v-if="monthText"> · {{ monthText }}</span>
        </p>
      </section>

      <section class="blog-index">
        <div class="post-list">
          <a
            v-for="post in posts"
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
      </section>
    </main>
  </div>
</template>
