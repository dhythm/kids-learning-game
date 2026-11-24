/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages (project site) needs /kids-learning-game/; the deploy
  // workflow sets VITE_BASE. Local dev/build keep relative './'.
  base: process.env.VITE_BASE ?? './',
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
