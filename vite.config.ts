/// <reference types="vite" />
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import macros from 'vite-plugin-babel-macros';

// Add browser

export default defineConfig({
  // Add any additional configuration options here

  plugins: [macros()],

  test: {
    alias: {
      'std-numbers': '/src/std-numbers.js',
    },
  },
});
