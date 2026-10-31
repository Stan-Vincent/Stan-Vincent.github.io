import { defineConfig } from 'vitepress'
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import { fileURLToPath } from 'node:url'

const dirname = fileURLToPath(new URL('.', import.meta.url))
const postsDir = path.resolve(dirname, '../blog/posts')

function readPosts() {
  return fs
    .readdirSync(postsDir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(postsDir, file), 'utf8')
      const { data } = matter(raw)
      return {
        text: data.title || file.replace(/\.md$/, ''),
        link: `/blog/posts/${file.replace(/\.md$/, '.html')}`,
        date: String(data.date || ''),
        order: Number(data.order ?? 999)
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order)
}

function blogSidebar() {
  const posts = readPosts()
  if (!posts.length) return []
  return [
    {
      text: '全部文章',
      items: posts.map(({ text, link }) => ({ text, link }))
    }
  ]
}

export default defineConfig({
  lang: 'zh-CN',
  title: 'Stan-Vincent',
  titleTemplate: ':title · Stan-Vincent',
  description: 'Stan-Vincent 的博客：记录 C++、Qt、分布式系统与建站实践。',
  head: [['link', { rel: 'icon', href: '/logo.svg' }]],
  markdown: {
    theme: 'github-dark',
    lineNumbers: false
  },
  lastUpdated: false,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/blog/' },
      { text: '项目', link: '/#projects' },
      { text: '技能', link: '/#skills' },
      { text: '联系', link: '/#contact' }
    ],
    sidebar: {
      '/blog/': blogSidebar()
    },
    outline: {
      level: [2, 3],
      label: '本页目录'
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索',
            buttonAriaLabel: '搜索'
          },
          modal: {
            noResultsText: '没有找到结果',
            resetButtonTitle: '清除搜索',
            footer: {
              selectText: '选择',
              navigateText: '切换',
              closeText: '关闭'
            }
          }
        }
      }
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Stan-Vincent' }
    ],
    footer: {
      message: '记录 C++、Qt 与分布式系统的实践',
      copyright: '© 2026 Stan-Vincent'
    },
    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '文章',
    returnToTopLabel: '回到顶部',
    externalLinkIcon: true
  }
})
