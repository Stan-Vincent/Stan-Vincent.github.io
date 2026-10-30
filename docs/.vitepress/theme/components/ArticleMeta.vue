<script setup>
import { useData } from 'vitepress'

const { frontmatter } = useData()
</script>

<template>
  <div v-if="frontmatter.date" class="article-meta-block">
    <div class="article-meta">
      <span>{{ frontmatter.date }}</span>
      <span v-if="frontmatter.read">约 {{ frontmatter.read }} 分钟</span>
      <span v-if="frontmatter.category">{{ frontmatter.category }}</span>
      <span class="tags">
        <span v-for="tag in (frontmatter.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </span>
    </div>
    <p v-if="frontmatter.description" class="article-lede">{{ frontmatter.description }}</p>
  </div>
</template>
