async function main() {
  const body = { heritageType: '剪纸', topic: '窗花迎春', purpose: '节日祝福', duration: '60', style: '写实纪录片' };
  console.log('POST /api/generate-storyboard ...');
  const t0 = Date.now();
  try {
    const res = await fetch('https://feiyi.hao1234.top/api/generate-storyboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(150000),
    });
    const text = await res.text();
    let j; try { j = JSON.parse(text); } catch { j = null; }
    console.log(`HTTP ${res.status} 耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
    if (j?.error) {
      console.log('ERROR:', j.error.code, j.error.message);
    } else if (j) {
      console.log('OK aiModel=' + j.aiModel + ' title=' + j.title + ' 镜头数=' + (j.shots ? j.shots.length : '?'));
    } else {
      console.log('非JSON响应:', text.slice(0, 200));
    }
  } catch (e) {
    console.log('FETCH FAIL', e.message);
  }
}
main();
