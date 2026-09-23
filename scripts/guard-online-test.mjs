const BASE = 'https://feiyi.hao1234.top/api/generate-storyboard';

async function post(topic, note) {
  const body = { heritageType: '剪纸', topic, purpose: '节日祝福', duration: '60', style: '写实纪录片' };
  const res = await fetch(BASE, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text.slice(0, 200) }; }
  const code = parsed?.error?.code || (res.ok ? 'OK' : '?');
  console.log(`${note}: HTTP ${res.status} code=${code} msg=${(parsed?.error?.message || '').slice(0, 60)}`);
  return { status: res.status, code };
}

async function main() {
  console.log('=== 限速验证：同分钟连续 8 次不同请求 ===');
  for (let i = 1; i <= 8; i++) {
    const r = await post(`限速测试话题${i}`, `第${i}次`);
    if (r.status === 429) { console.log('（提前触发限速）'); break; }
  }
  console.log('--- 第 9 次（期望 429 限速） ---');
  await post('限速测试话题第九', '第9次');

  console.log('\n=== 去重验证：相同请求连打 3 次 ===');
  const topic = '去重测试唯一话题A';
  await post(topic, 'A1');
  await post(topic, 'A2');
  await post(topic, 'A3');

  console.log('\n=== 今日用量 ===');
  const u = await fetch('https://feiyi.hao1234.top/api/admin/usage').then(r => r.json());
  console.log(JSON.stringify(u));
}

main().catch(e => { console.error('FAIL', e.message); process.exit(1); });
