// 验证：DeepSeek 关闭思考模式（thinking disabled）的耗时与完整性
import fs from 'node:fs';

const KEY = 'sk-6d507692fb8546fe817b16f779cf773d';
const BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-v4-pro';

async function main() {
  const raw = fs.readFileSync(new URL('./real-prompt.json', import.meta.url), 'utf8').replace(/^\uFEFF/, '');
  // 加一个空格破坏 prompt 缓存，确保测的是真实首次推理
  const prompt = JSON.parse(raw).prompt + ' ';
  console.log('prompt 长度:', prompt.length, '（末尾加空格破坏缓存）');
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 32000,
        thinking: { type: 'disabled' },
      }),
      signal: AbortSignal.timeout(300000),
    });
    console.log(`HTTP ${res.status} 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (!res.ok) {
      console.log('ERR BODY:', (await res.text()).slice(0, 400));
      return;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    console.log('内容长度:', content.length, 'chars; usage:', JSON.stringify(data.usage));
    // 完整性检查
    const checks = ['"title"', '"shots"', '"soundDesign"', '"cultureCheck"', '"submissionNote"', '"socialPosts"', '"douyin"', '"xiaohongshu"'];
    for (const c of checks) console.log(`  含${c}:`, content.includes(c));
    console.log('结尾:', content.slice(-150));
  } catch (e) {
    console.log('FAIL', e.message, `耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
main();
