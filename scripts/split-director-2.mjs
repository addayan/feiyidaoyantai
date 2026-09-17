// 清理 Director.tsx 拆离后多余的 import
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Director.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const pairs = [
  // 类型 import 收窄：只保留 GenerationRecord（其余类型已移入 director/constants.ts）
  ["import type { GenerationRecord, Composition, Lighting, CameraAngle, DepthOfField, Speed, Mood, Transition } from '../types';",
   "import type { GenerationRecord } from '../types';"],
  // useSortable 移入 SortableItem.tsx
  ["import {\n  SortableContext,\n  verticalListSortingStrategy,\n  useSortable,\n} from '@dnd-kit/sortable';",
   "import {\n  SortableContext,\n  verticalListSortingStrategy,\n} from '@dnd-kit/sortable';"],
  // CSS 移入 SortableItem.tsx
  ["import { CSS } from '@dnd-kit/utilities';\n", ''],
];

for (const [oldStr, newStr] of pairs) {
  if (text.includes(oldStr)) {
    text = text.split(oldStr).join(newStr);
    console.log(`OK   ${oldStr.slice(0, 40)}`);
  } else {
    console.log(`MISS ${oldStr.slice(0, 50)}`);
  }
}

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log('import 清理完成');
