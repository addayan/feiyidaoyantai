// 用真实项目 prompt 直连 DeepSeek 测耗时（esbuild 编译入口）
import { buildGeneratePrompt } from '../server/prompts/generate-storyboard';
import { buildSafetyRules } from '../server/utils/safety';
import type { GenerateRequest } from '../server/types';

const req: GenerateRequest = {
  heritageType: '剪纸',
  topic: '窗花迎春',
  purpose: '节日祝福',
  duration: '60',
  style: '写实纪录片',
};

const prompt = buildGeneratePrompt(req, buildSafetyRules());
process.stdout.write(JSON.stringify({ prompt }));
