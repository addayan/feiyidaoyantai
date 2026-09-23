// 统一 4 个 AI 端点切换到 KV 优先配置（config.ts）
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'functions/api/optimize-prompt.ts',
  'functions/api/optimize-shot.ts',
  'functions/api/regenerate-section.ts',
  'functions/api/regenerate-shot.ts',
];

const pairs = [
  // import 拆分为 ark + config
  ["import { callArkAPI, isModelConfigured, createErrorResponse } from '../_lib/ark';",
   "import { callArkAPI, createErrorResponse } from '../_lib/ark';\nimport { getModelConfig, isModelConfigured } from '../_lib/config';"],
  // 删除 env 行
  ['  const env = context.env as unknown as Record<string, string>;\n', ''],
  // 配置检查
  ['if (!isModelConfigured(env)) {', 'const config = await getModelConfig(context);\n  if (!isModelConfigured(config)) {'],
  // body 类型
  ['const body = await context.request.json();', 'const body: any = await context.request.json();'],
  // 调用用 config
  ['callArkAPI(prompt, env)', 'callArkAPI(prompt, config)'],
];

for (const path of files) {
  let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  let changed = false;
  for (const [oldStr, newStr] of pairs) {
    if (text.includes(oldStr)) {
      text = text.split(oldStr).join(newStr);
      changed = true;
      console.log(`OK   ${path.split('/').pop()} :: ${oldStr.slice(0, 36)}`);
    } else {
      console.log(`MISS ${path.split('/').pop()} :: ${oldStr.slice(0, 40)}`);
    }
  }
  if (changed) writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
}
console.log('=== 端点迁移完成 ===');
