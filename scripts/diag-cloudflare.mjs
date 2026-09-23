// 用线上 diag 接口对比长短 prompt 从 Cloudflare 调 DeepSeek 的耗时
import fs from 'node:fs';

async function call(prompt, tag) {
  const t0 = Date.now();
  try {
    const res = await fetch('https://feiyi.hao1234.top/api/admin/diag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
      signal: AbortSignal.timeout(60000),
    });
    const text = await res.text();
    let j; try { j = JSON.parse(text); } catch { j = null; }
    console.log(`[${tag}] HTTP ${res.status} 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`, j ? JSON.stringify(j).slice(0, 300) : text.slice(0, 120));
  } catch (e) {
    console.log(`[${tag}] FAIL ${e.message} 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}

const raw = fs.readFileSync(new URL('./real-prompt.json', import.meta.url), 'utf8').replace(/^\uFEFF/, '');
const long = JSON.parse(raw).prompt;
const mid = long.slice(0, 800);
const short = '请只回复两个字：正常';

await call(short, '短(12字)');
await call(mid, '中(800字)');
await call(long, '长(5730字)');
