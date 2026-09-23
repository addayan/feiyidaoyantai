// 诊断：DeepSeek 完整生成耗时（直连，绕过 Cloudflare）
const KEY = 'sk-6d507692fb8546fe817b16f779cf773d';
const BASE = 'https://api.deepseek.com';
const MODEL = 'deepseek-v4-pro';

const prompt = `请为一个非遗剪纸题材的 60 秒纪录片生成完整分镜方案，输出 JSON（包含 title、story、characters、scenes、shots（8 个镜头，每个含 firstFramePrompt/lastFramePrompt/videoPrompt/negativePrompt）、soundDesign、cultureCheck、socialPosts 等完整字段），全部使用中文。`;

async function main() {
  console.log('直连 DeepSeek 生成测试，模型:', MODEL);
  const t0 = Date.now();
  try {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 16000,
      }),
      signal: AbortSignal.timeout(300000),
    });
    const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`HTTP ${res.status} 耗时 ${elapsed}s`);
    if (!res.ok) {
      console.log('ERR BODY:', (await res.text()).slice(0, 500));
      return;
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    console.log('内容长度:', content.length, 'chars; usage:', JSON.stringify(data.usage));
    console.log('开头:', content.slice(0, 150));
    console.log('结尾:', content.slice(-150));
  } catch (e) {
    console.log('FAIL', e.message, `耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
}
main();
