import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const dist = path.join(root, 'docs/.vitepress/dist')
const generated = ['index.html', 'assets', 'blog', '404.html', 'sitemap.xml']

if (!fs.existsSync(path.join(dist, 'index.html'))) {
  console.error('VitePress dist not found. Run `npm run docs:build` first.')
  process.exit(1)
}

for (const item of generated) {
  fs.rmSync(path.join(root, item), { recursive: true, force: true })
}

fs.cpSync(dist, root, { recursive: true })
console.log('Copied docs/.vitepress/dist to repository root')
