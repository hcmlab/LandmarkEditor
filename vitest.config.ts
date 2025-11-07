import { fileURLToPath } from 'node:url';
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**', '**/node_modules/**', '**/dist/**'],
      include: ['**/*.spec.ts'],
      root: fileURLToPath(new URL('./', import.meta.url))
    }
  })
);
