// 构建后自动生成 dist-manifest.json（每个构建产物的 SHA-256）
// 用法：npm run build（已挂到 build 脚本末尾）
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const distDir = join(process.cwd(), 'dist');
const manifest = {};

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else {
      const rel = relative(distDir, full).replace(/\\/g, '/');
      const hash = createHash('sha256').update(readFileSync(full)).digest('hex');
      manifest[rel] = hash;
    }
  }
}

if (statSync(distDir).isDirectory()) {
  walk(distDir);
  const out = join(process.cwd(), 'dist-manifest.json');
  writeFileSync(out, JSON.stringify(manifest, null, 4) + '\n');
  console.log(`[manifest] 已生成 dist-manifest.json（${Object.keys(manifest).length} 个文件）`);
} else {
  console.error('[manifest] dist/ 不存在，跳过');
  process.exit(1);
}
