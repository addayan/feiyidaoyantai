// 05 单镜头Prompt v3：定位可编辑镜头列表中的展开按钮
import puppeteer from 'puppeteer-core';
import path from 'node:path';
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const URL = 'https://feiyi.hao1234.top/director/yiwulvshan-paper-cutting?mode=example';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});
const page = await browser.newPage();
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 90000 }).catch(async () => {
  await page.goto(URL, { waitUntil: 'networkidle2', timeout: 90000 });
});
await sleep(3500);

// 定位第一个"查看 AI 提示词"按钮并滚动到视口中部
const loc = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const target = btns.find((b) => (b.textContent || '').includes('查看 AI 提示词'));
  if (!target) return null;
  target.scrollIntoView({ block: 'center' });
  const r = target.getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
console.log('btn loc:', JSON.stringify(loc));
if (loc) {
  await sleep(900);
  await page.mouse.click(loc.x, loc.y);
  console.log('clicked');
}
await sleep(2500);

const state = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const target = btns.find((b) => (b.textContent || '').includes('查看 AI 提示词') || (b.textContent || '').includes('收起 AI 提示词'));
  if (!target) return { found: false };
  const card = target.closest('.card');
  if (!card) return { found: true, noCard: true };
  const t = card.textContent || '';
  return {
    found: true,
    w: Math.round(card.getBoundingClientRect().width),
    h: Math.round(card.getBoundingClientRect().height),
    hasPrompt: t.includes('首帧图片提示词'),
    hasVideo: t.includes('视频生成提示词'),
    hasParam: t.includes('镜头参数概览'),
    txtHead: t.slice(0, 24),
    textLen: t.length,
  };
});
console.log('state:', JSON.stringify(state));

if (state.found && !state.noCard && state.hasPrompt) {
  // 对按钮所属卡片截图
  const shot1 = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => (b.textContent || '').includes('收起 AI 提示词'));
    const card = target ? target.closest('.card') : null;
    if (card) card.scrollIntoView({ block: 'center' });
    return !!card;
  });
  await sleep(800);
  const cards = await page.$$('.card');
  for (const c of cards) {
    const txt = await c.evaluate((el) => (el.textContent || '').slice(0, 24));
    if (txt.includes('一张红纸')) {
      const ok = await c.evaluate((el) => {
        const btns = Array.from(el.querySelectorAll('button'));
        return btns.some((b) => (b.textContent || '').includes('收起 AI 提示词'));
      });
      if (ok) {
        await c.screenshot({ path: path.resolve('submission', 'screenshots', '05-单镜头Prompt.png') });
        console.log('saved shot1 editable card screenshot');
        break;
      }
    }
  }
} else {
  console.log('EXPAND FAILED; state above. fallback viewport shot');
  await page.screenshot({ path: path.resolve('submission', 'screenshots', '05-单镜头Prompt.png'), type: 'png' });
}
await browser.close();
console.log('DONE');
