import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'node18',
  external: [
    'fs-extra',
    'cross-spawn'
  ],
  noExternal: [
    'inquirer',
    'commander',
    'chalk',
    'ora',
    'open',
    'detect-port',
    'chokidar',
    'boxen',
    'gradient-string',
    'node-fetch',
    '@unilab/urpc',
    '@unilab/urpc-core'
  ],
  shims: true
}); 