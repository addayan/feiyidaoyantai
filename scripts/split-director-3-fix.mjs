// 修复 split-director-3 残留的顶部操作栏旧内容
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Director.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const startMarker = "            </div>\n            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>";
const endMarker = "          </div>\n\n          {/* ===== 01 创意与故事 ===== */}";
const si = text.indexOf(startMarker);
const ei = text.indexOf(endMarker);
if (si === -1 || ei === -1 || ei < si) throw new Error('残留块边界未命中');

const removed = text.slice(si, ei + endMarker.length).split('\n').length;
text = text.slice(0, si) + text.slice(ei + endMarker.length);

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log(`OK：已删除 ${removed} 行残留，文件现在 ${text.split('\n').length} 行`);
