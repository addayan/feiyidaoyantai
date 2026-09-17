// 抽离 Director.tsx 左侧导航与顶部操作栏为子组件（保持逻辑不变）
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/pages/Director.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

// 1) 新增 import
const anchor = "import SortableItem from './director/SortableItem';";
const addImports = `
import SidebarNav from './director/SidebarNav';
import TopActionBar from './director/TopActionBar';`;
if (!text.includes(anchor)) throw new Error('import 锚点未命中');
text = text.replace(anchor, anchor + addImports);

// 2) 替换 aside 块
const asideStart = '        {/* 左侧 sticky 导航 */}\n        <aside';
const asideEnd = '        </aside>';
const si = text.indexOf(asideStart);
const ei = text.indexOf(asideEnd);
if (si === -1 || ei === -1 || ei < si) throw new Error('aside 边界未命中');
const asideBlock = text.slice(si, ei + asideEnd.length);
console.log(`aside 块：${asideBlock.split('\n').length} 行`);
text = text.slice(0, si) + `        <SidebarNav
          isExample={isExample}
          title={data.title}
          tagline={data.tagline}
          activeSection={activeSection}
          onNavigate={scrollToSection}
        />` + text.slice(ei + asideEnd.length);

// 3) 替换顶部操作栏块
const topStart = '          {/* 顶部信息栏 */}\n          <div';
const topEnd = '          </div>';
const tsi = text.indexOf(topStart);
// 顶部块结束：找 topStart 之后第一个「          </div>」后跟空行和注释
const tei = text.indexOf(topEnd, tsi);
if (tsi === -1 || tei === -1) throw new Error('顶部块边界未命中');
const topBlock = text.slice(tsi, tei + topEnd.length);
console.log(`顶部块：${topBlock.split('\n').length} 行`);
text = text.slice(0, tsi) + `          <TopActionBar
            title={data.title}
            heritageType={data.heritageType}
            style={data.style}
            duration={data.duration}
            onCreateClick={() => navigate('/create')}
            onExportMarkdown={exportMarkdown}
            onExportProject={exportProjectJSON}
            onImportClick={() => fileInputRef.current?.click()}
            onCopyAllPrompts={copyAllPrompts}
            onFileChange={handleFileImport}
            fileInputRef={fileInputRef}
          />` + text.slice(tei + topEnd.length);

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log(`OK：Director.tsx 现在 ${text.split('\n').length} 行`);
