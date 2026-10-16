import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { cpSync, existsSync, readdirSync } from 'node:fs';

// Multi-Page App: index.html + all pages in componentes/pages.
const pagesDir = resolve(__dirname, 'componentes/pages');
const pages = Object.fromEntries(
  readdirSync(pagesDir)
    .filter((file) => file.endsWith('.html'))
    .map((file) => [file.replace('.html', ''), resolve(pagesDir, file)])
);

function copyStaticAssetsPlugin() {
  return {
    name: 'copy-static-assets',
    closeBundle() {
      const staticDirs = ['images', 'data', 'scripts'];
      for (const dir of staticDirs) {
        const src = resolve(__dirname, 'assets', dir);
        const dest = resolve(__dirname, 'dist', 'assets', dir);
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true, force: true });
        }
      }
    },
  };
}

export default defineConfig({
  assetsInclude: ['**/*.txt', '**/*.csv'],
  plugins: [copyStaticAssetsPlugin()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...pages,
      },
    },
  },
});
