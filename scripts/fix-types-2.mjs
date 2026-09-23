// 修复 functions 与 server 残留类型问题
import { readFileSync, writeFileSync } from 'node:fs';

const fixes = [
  {
    path: 'functions/api/admin/config.ts',
    pairs: [
      ["  const env = context.env as any;\n", ''],
      ['    hasKv: !!context.env?.ARK_CONFIG_KV,', '    hasKv: !!env?.ARK_CONFIG_KV,'], // 依赖上面 env 定义——需先确认结构
    ],
  },
];

// admin/config.ts 需要引入 env 变量；先看现状再修（用通用替换）
let t = readFileSync('functions/api/admin/config.ts', 'utf8').replace(/\r\n/g, '\n');
t = t.split('const expected = (context.env as any)?.ADMIN_KEY as string | undefined;')
     .join('const env = context.env as any;\n  const expected = env?.ADMIN_KEY as string | undefined;');
t = t.split('hasKv: !!context.env?.ARK_CONFIG_KV,').join('hasKv: !!env?.ARK_CONFIG_KV,');
t = t.split("source: context.env?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',").join("source: env?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',");
t = t.split('const kv = context.env?.ARK_CONFIG_KV as KVNamespace | undefined;').join('const kv = env?.ARK_CONFIG_KV as KVNamespace | undefined;');
writeFileSync('functions/api/admin/config.ts', t.replace(/\n/g, '\r\n'), 'utf8');
console.log('admin/config.ts 修复完成');

// health.ts
t = readFileSync('functions/api/health.ts', 'utf8').replace(/\r\n/g, '\n');
t = t.split("source: context.env?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',").join("source: (context.env as any)?.ARK_CONFIG_KV ? 'kv-or-env' : 'env',");
writeFileSync('functions/api/health.ts', t.replace(/\n/g, '\r\n'), 'utf8');
console.log('health.ts 修复完成');

// server/routes/generate.ts choices 类型
t = readFileSync('server/routes/generate.ts', 'utf8').replace(/\r\n/g, '\n');
const idx = t.indexOf('data?.choices');
if (idx !== -1) {
  t = t.split('data?.choices').join('(data as any)?.choices');
  writeFileSync('server/routes/generate.ts', t.replace(/\n/g, '\r\n'), 'utf8');
  console.log('generate.ts choices 修复完成');
} else {
  console.log('generate.ts 未命中');
}
