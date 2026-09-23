// 修复 CreateV3：点击「AI 真实生成 / 快速体验」立即触发生成，而非仅切换模式
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/CreateV3.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const pairs = [
  // 1) runGeneration 支持模式参数
  ['  const runGeneration = async () => {\n    const finalHeritage = heritageName.trim();',
   '  const runGeneration = async (modeOverride?: \'ai\' | \'quick\') => {\n    const genMode = modeOverride ?? mode;\n    const finalHeritage = heritageName.trim();'],
  // 2) 生成逻辑使用 genMode
  ['      if (mode === \'ai\') {', '      if (genMode === \'ai\') {'],
  // 3) AI 按钮：点击即切模式并生成
  ['                disabled={!modelConfigured}\n                onClick={() => setMode(\'ai\')}',
   '                disabled={!modelConfigured}\n                onClick={() => handleModeSelect(\'ai\')}'],
  // 4) 快速体验按钮：点击即切模式并生成
  ['                onClick={() => setMode(\'quick\')}', '                onClick={() => handleModeSelect(\'quick\')}'],
];

for (const [oldStr, newStr] of pairs) {
  if (text.includes(oldStr)) {
    text = text.split(oldStr).join(newStr);
    console.log(`OK   ${oldStr.slice(0, 44)}`);
  } else {
    console.log(`MISS ${oldStr.slice(0, 50)}`);
  }
}

// 5) 新增 handleModeSelect（插在 runGeneration 函数结束的 return 前）
const anchor = '  return (\n    <div className="page">';
const handler = `  const handleModeSelect = (m: 'ai' | 'quick') => {
    setMode(m);
    runGeneration(m);
  };

`;
if (text.includes(anchor)) {
  text = text.replace(anchor, handler + anchor);
  console.log('OK   新增 handleModeSelect');
} else {
  console.log('MISS 新增 handleModeSelect（anchor 未命中）');
}

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log('修复完成');
