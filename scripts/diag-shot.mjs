// 诊断脚本：检查页面加载与截图
import puppeteer from 'puppeteer-core';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push('[console] ' + m.type() + ': ' + m.text().slice(0, 300)));
page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message.slice(0, 300)));
page.on('requestfailed', (r) => logs.push('[reqfail] ' + r.url().slice(0, 150) + ' :: ' + (r.failure()?.errorText || '')));
const target = process.argv[2] || 'https://feiyi.hao1234.top/';
try {
  const resp = await page.goto(target, { waitUntil: 'networkidle0', timeout: 60000 });
  console.log('HTTP status:', resp && resp.status());
  console.log('URL after goto:', page.url());
} catch (e) {
  console.log('goto error:', e.message.slice(0, 300));
}
await new Promise((r) => setTimeout(r, 4000));
const info = await page.evaluate(() => ({
  title: document.title,
  bodyLen: document.body ? document.body.innerHTML.length : -1,
  hasRoot: !!document.getElementById('root'),
  rootLen: (document.getElementById('root') || {}).innerHTML?.length ?? -1,
  bg: getComputedStyle(document.body).backgroundColor,
}));
console.log('INFO:', JSON.stringify(info));
console.log('LOGS:');
console.log(logs.slice(0, 30).join('\n'));
await page.screenshot({ path: 'submission/screenshots/_diag.png', type: 'png' });
await browser.close();
console.log('DONE');
