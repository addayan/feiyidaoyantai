// 抽离 Director.tsx 顶层代码到 director/ 模块（保持逻辑不变）
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Director.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// 1) 新增 import（放在 CSS import 之后）
const anchor = "import { CSS } from '@dnd-kit/utilities';";
const addImports = `
import { DETAIL_OPTIONS, DETAIL_META, SECTION_MAP } from './director/constants';
import { fillMissingShotDetailsClient } from './director/fillMissingShotDetails';
import SortableItem from './director/SortableItem';`;
if (!text.includes(anchor)) throw new Error('import 锚点未命中');
text = text.replace(anchor, anchor + addImports);

// 2) 删除顶层代码块（从「分镜细节字段枚举值」注释到 SECTION_MAP 结束的 `];`）
const startMarker = '// ===== 分镜细节字段枚举值';
const endMarker = 'export default function Director() {';
const startIdx = text.indexOf(startMarker);
const endIdx = text.indexOf(endMarker);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) throw new Error('代码块边界未命中');
const removed = text.slice(startIdx, endIdx);
text = text.slice(0, startIdx) + text.slice(endIdx);

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log(`OK：已删除 ${removed.split('\n').length} 行顶层代码，Director.tsx 剩余 ${text.split('\n').length} 行`);
