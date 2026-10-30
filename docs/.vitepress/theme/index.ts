import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import './custom.css'
import HomePage from './components/HomePage.vue'
import BlogIndex from './components/BlogIndex.vue'
import ArticleMeta from './components/ArticleMeta.vue'
import ReadingProgress from './components/ReadingProgress.vue'

export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      'layout-top': () => h(ReadingProgress)
    })
  },
  enhanceApp({ app }) {
    app.component('HomePage', HomePage)
    app.component('BlogIndex', BlogIndex)
    app.component('ArticleMeta', ArticleMeta)
  }
}
