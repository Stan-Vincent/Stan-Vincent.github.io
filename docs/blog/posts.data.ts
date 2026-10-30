import { createContentLoader } from 'vitepress'

export interface Post {
  url: string
  title: string
  titleHtml: string
  date: string
  category: string
  tags: string[]
  description: string
  read: number
  order: number
}

declare const data: Post[]
export { data }

export default createContentLoader('blog/posts/*.md', {
  transform(raw) {
    return raw
      .map(({ url, frontmatter }) => ({
        url,
        title: frontmatter.title,
        titleHtml: frontmatter.titleHtml || frontmatter.title,
        date: String(frontmatter.date ?? ''),
        category: frontmatter.category || '',
        tags: frontmatter.tags || [],
        description: frontmatter.description || '',
        read: frontmatter.read || 0,
        order: frontmatter.order ?? 999
      }))
      .sort((a, b) => b.date.localeCompare(a.date) || a.order - b.order)
  }
})
