// 最终版网站截图脚本（用于比赛 PDF）
// 视口 1440x900，deviceScaleFactor=2 → 输出 2880x1800 PNG
// 用法：node scripts/capture-final.mjs
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import path from 'node:path';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = 'https://feiyi.hao1234.top';
const OUT = path.resolve('submission', 'screenshots');
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 2 },
});

async function open(url) {
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 90000 });
  } catch (e) {
    console.warn('[warn] networkidle0 failed, retry with networkidle2:', e.message);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  }
  await sleep(3500); // React 渲染 + 字体
  return page;
}

async function shot(page, name) {
  await sleep(800);
  await page.screenshot({ path: path.join(OUT, name), type: 'png' });
  console.log('saved:', name);
  await page.close();
}

// 01 首页
{
  const page = await open(`${BASE}/`);
  await shot(page, '01-首页.png');
}

// 02 创作入口
{
  const page = await open(`${BASE}/create`);
  await shot(page, '02-创作入口.png');
}

// 03 导演台总览（固定案例首屏）
{
  const page = await open(`${BASE}/director/yiwulvshan-paper-cutting?mode=example`);
  await shot(page, '03-导演台总览.png');
}

// 04 8镜头（滚动到分镜导演台）
{
  const page = await open(`${BASE}/director/yiwulvshan-paper-cutting?mode=example`);
  await page.evaluate(() => {
    const el = document.getElementById('section-shots');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await sleep(1500);
  await shot(page, '04-8镜头.png');
}

// 05 单镜头Prompt（滚动到分镜导演台并展开第一个镜头提示词）
{
  const page = await open(`${BASE}/director/yiwulvshan-paper-cutting?mode=example`);
  await page.evaluate(() => {
    const el = document.getElementById('section-shots');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await sleep(1200);
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const target = btns.find((b) => b.textContent && b.textContent.includes('查看 AI 提示词'));
    if (target) target.click();
  });
  await sleep(1200);
  await page.evaluate(() => {
    const el = document.getElementById('section-shots');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await sleep(800);
  await shot(page, '05-单镜头Prompt.png');
}

// 06 文化表达检查（滚动到文化检查章节）
{
  const page = await open(`${BASE}/director/yiwulvshan-paper-cutting?mode=example`);
  await page.evaluate(() => {
    const el = document.getElementById('section-culture');
    if (el) el.scrollIntoView({ block: 'start' });
  });
  await sleep(1500);
  await shot(page, '06-文化表达检查.png');
}

await browser.close();
console.log('ALL DONE');
