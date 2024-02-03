/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: 'index'
    },
    rollupOptions: {
      external: ['node:fs', 'node:path']
    }
  },
  test: {
    globals: true,
    include: ['test/*.test.ts'],
    coverage: {
      exclude: ['example/**', 'src/types.ts', 'test/**']
    }
  }
})
