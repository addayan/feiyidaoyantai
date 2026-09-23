// 将所有 AI 端点切换到 callArkAPIWithFallback（主/备自动回退）
import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'functions/api/optimize-prompt.ts',
  'functions/api/optimize-shot.ts',
  'functions/api/regenerate-section.ts',
  'functions/api/regenerate-shot.ts',
  'functions/api/generate-storyboard.ts',
];

for (const path of files) {
  let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  let changed = false;

  // import：ark 导入加 WithFallback
  const oldImp = "import { callArkAPI, createErrorResponse } from '../_lib/ark';";
  const newImp = "import { callArkAPIWithFallback, createErrorResponse } from '../_lib/ark';";
  if (text.includes(oldImp)) {
    text = text.split(oldImp).join(newImp);
    changed = true;
  }

  // 普通端点：const rawText = await callArkAPI(prompt, config);
  const oldCall = 'const rawText = await callArkAPI(prompt, config);';
  const newCall = 'const { content: rawText } = await callArkAPIWithFallback(prompt, config);';
  if (text.includes(oldCall)) {
    text = text.split(oldCall).join(newCall);
    changed = true;
  }

  // generate-storyboard：单独处理（要带 used 信息）
  const oldGen = 'const rawText = await callArkAPI(prompt, config);';
  const newGen = 'const { content: rawText, used } = await callArkAPIWithFallback(prompt, config);';
  if (path === 'functions/api/generate-storyboard.ts' && text.includes(oldGen)) {
    text = text.split(oldGen).join(newGen);
    changed = true;
  }

  if (changed) {
    writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
    console.log(`OK ${path}`);
  } else {
    console.log(`MISS ${path}`);
  }
}
