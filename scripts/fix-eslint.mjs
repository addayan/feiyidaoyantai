// 批量清理 ESLint 死代码告警（行为不变，每处替换均验证命中）
import { readFileSync, writeFileSync } from 'node:fs';

function fixFile(path, pairs) {
  let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
  let changed = false;
  for (const [oldStr, newStr] of pairs) {
    if (text.includes(oldStr)) {
      text = text.split(oldStr).join(newStr);
      console.log(`OK   ${path} :: ${oldStr.slice(0, 40)}`);
      changed = true;
    } else {
      console.log(`MISS ${path} :: ${oldStr.slice(0, 50)}`);
    }
  }
  if (changed) writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
}

// 1. regenerate.ts 删除未使用的 AIError import
fixFile('server/routes/regenerate.ts', [
  ["import type { AIError } from '../types';\n", ''],
]);

// 2. Create.tsx 未读 state 改占位解构
fixFile('src/pages/Create.tsx', [
  ['const [generating, setGenerating] = useState(false);', 'const [, setGenerating] = useState(false); // generating 只写不读，占位跳过'],
  ['const [abortController, setAbortController] = useState<AbortController | null>(null);', 'const [, setAbortController] = useState<AbortController | null>(null); // abortController 只写不读，占位跳过'],
]);

// 3. Director.tsx
fixFile('src/pages/Director.tsx', [
  ['  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});\n', ''],
  ['      } catch (err) {\n        showToast(\'导入失败：JSON 解析错误\');', '      } catch {\n        showToast(\'导入失败：JSON 解析错误\');'],
  ['.map((s, idx) => (\n                            <th key={s.id}', '.map((s) => (\n                            <th key={s.id}'],
]);

// 4. HeritageLibrary.tsx 删除未用 import
fixFile('src/pages/HeritageLibrary.tsx', [
  ["import {\n  HERITAGE_CATALOG,\n  OFFICIAL_CATEGORIES,\n  searchHeritage,\n} from '../data/heritageCatalog';", "import { OFFICIAL_CATEGORIES, searchHeritage } from '../data/heritageCatalog';"],
]);

// 5. MyProjects.tsx
fixFile('src/pages/MyProjects.tsx', [
  ["import { Link, useNavigate } from 'react-router-dom';", "import { useNavigate } from 'react-router-dom';"],
  ['      } catch (err) {\n        showToast(\'导入失败：JSON 解析错误\');', '      } catch {\n        showToast(\'导入失败：JSON 解析错误\');'],
]);

// 6. HeroBackground.tsx（多行类型声明）
fixFile('src/components/HeroBackground.tsx', [
  ['    let particles: Array<{', '    const particles: Array<{'],
]);

// 7. json.ts 去掉无用预赋值
fixFile('server/utils/json.ts', [
  ['  // 确定起始位置\n  let start = -1;\n  let endChar = \'\';\n  if (startBrace === -1 && startBracket === -1) {\n    return cleaned;\n  }', '  // 确定起始位置\n  if (startBrace === -1 && startBracket === -1) {\n    return cleaned;\n  }\n  let start: number;\n  let endChar: string;'],
]);

console.log('=== 修复完成 ===');
