import type { HeritageEntry } from '../types/heritage';

export interface StoryComposerOptions {
  storyTemplate: string;
  protagonist: string;
  emotion: string;
  userIdea: string;
}

export function buildHeritageContext(
  heritageName: string,
  entry: HeritageEntry | null,
  options: StoryComposerOptions,
): string {
  const lines: string[] = [];

  lines.push('【V3 非遗创作上下文】');
  lines.push(`目标非遗：${heritageName}`);

  if (entry) {
    lines.push(`创作大类：${entry.name}`);
    lines.push(`官方门类：${entry.officialCategory}`);
    lines.push(`基础介绍：${entry.summary}`);
    lines.push(`典型材料：${entry.typicalMaterials.join('、')}`);
    lines.push(`典型动作：${entry.typicalActions.join('、')}`);
    lines.push(`视觉机制：${entry.ai.visualMechanisms.join('；')}`);
    lines.push(`适合故事：${entry.ai.suitableStories.join('；')}`);
    lines.push(`推荐视觉风格：${entry.ai.suitableStyles.join('、')}`);
    lines.push(`AI 好生成镜头：${entry.ai.goodShots.join('；')}`);
    lines.push(`AI 高风险镜头：${entry.ai.hardShots.join('；')}`);
    lines.push(`文化注意：${entry.ai.cautions.join('；')}`);
  } else {
    lines.push('资料状态：用户手动输入的非遗，当前种子库未命中。');
    lines.push('要求：不要凭空编造项目历史、传承人、申报地区、工艺步骤等事实；不确定的信息应使用概括表达。');
  }

  lines.push('');
  lines.push('【故事组合条件】');
  lines.push(`故事结构：${options.storyTemplate}`);
  lines.push(`主角：${options.protagonist}`);
  lines.push(`情绪：${options.emotion}`);
  lines.push(`用户创意：${options.userIdea || '由 AI 根据非遗特性主动提出适合的故事'}`);

  lines.push('');
  lines.push('【生成要求】');
  lines.push('1. 故事必须利用该非遗本身的视觉、动作、材料或表演特征，不能只把非遗当背景贴纸。');
  lines.push('2. 优先选择 AI 易生成、可拆成短镜头的叙事动作，避免一个镜头塞入大量复杂动作。');
  lines.push('3. 首帧图片提示词负责主体、环境、构图、光线、风格和一致性。');
  lines.push('4. 图生视频提示词重点描述主体动作、环境运动、镜头运动、节奏和时间推进。');
  lines.push('5. 对不确定的非遗事实不要擅自补全，文化表达检查中主动标注需要人工核验的内容。');

  return lines.join('\n');
}
