/// <reference types="vitest" />

import { defineConfig } from 'vite'
import cacheDir from 'vite-plugin-cachedir'

export default defineConfig({
  plugins: [cacheDir()],
  build: {
    ssr: 'src/index.ts',
    rollupOptions: {
      external: ['headless-route']
    }
  },
  test: {
    globals: true,
    include: ['test/*.test.ts'],
    coverage: {
      include: ['src/{Api,Cache,DataStore,Error,utils}.ts']
    }
  }
})
