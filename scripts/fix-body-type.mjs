import { readFileSync, writeFileSync } from 'node:fs';
const path = 'functions/api/generate-storyboard.ts';
let text = readFileSync(path, 'utf8').replace(/\r\n/g, '\n');
const oldStr = 'const body = await context.request.json();';
const newStr = 'const body: any = await context.request.json();';
if (text.includes(oldStr)) {
  text = text.split(oldStr).join(newStr);
  writeFileSync(path, text.replace(/\n/g, '\r\n'), 'utf8');
  console.log('OK body -> any');
} else {
  console.log('MISS');
}
