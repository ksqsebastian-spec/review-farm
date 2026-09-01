// Bundles the Worker into a single file for upload to Cloudflare.
import { build } from 'esbuild';
import { mkdirSync } from 'node:fs';

mkdirSync('dist', { recursive: true });
await build({
  entryPoints: ['src/worker.js'],
  outfile: 'dist/worker.js',
  bundle: true,
  format: 'esm',
  target: 'es2022',
  platform: 'neutral',
  charset: 'utf8',
  minify: true,
});
console.log('built dist/worker.js');
