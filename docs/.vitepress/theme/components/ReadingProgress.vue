<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const width = ref(0)
const visible = computed(() => page.value.relativePath.startsWith('blog/posts/'))

function update() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
  width.value = ratio * 100
}

watch(
  () => page.value.relativePath,
  () => {
    width.value = 0
    nextTick(update)
  }
)

onMounted(() => {
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
  update()
})

onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
</script>

<template>
  <div
    v-if="visible"
    class="read-progress"
    :style="{ width: width + '%' }"
    aria-hidden="true"
  />
</template>
