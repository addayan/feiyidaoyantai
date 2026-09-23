import { readFileSync, writeFileSync } from 'node:fs';
const path = 'src/pages/AdminConfig.tsx';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

text = text.split('} catch (e) {').join('} catch {');
text = text.split('　|　').join(' | ');

writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
console.log('AdminConfig.tsx lint 修复完成');
