// ===== 单个提示词字段优化 Prompt =====

const PROMPT_FIELD_LABELS: Record<string, string> = {
  firstFramePrompt: '首帧提示词（用于 AI 图像生成）',
  lastFramePrompt: '尾帧提示词（用于 AI 图像生成）',
  videoPrompt: '视频提示词（用于 AI 视频生成）',
};

const OPTIMIZE_TYPE_TIPS_FIELD: Record<string, string> = {
  cinematic: '增强电影感：加入光影层次、景深、镜头语言、色彩情绪的描述。可使用 "cinematic lighting""golden hour""shallow depth of field" 等术语。',
  emotion: '增强情绪表达：强化氛围描写，增加情绪关键词和感官细节。',
  camera: '增强运镜设计：优化运镜描述，使运动轨迹更清晰、更具叙事性。',
  heritage: '增强非遗文化表达：深入描写非遗技艺细节（工具、材料、纹理、工序）。',
  generatability: '增强 AI 可生成性：简化到 1-2 个主体、1 个动作、保持环境一致，控制在 200-400 字。全中文编写。',
  simplify: '简化提示词：精简到核心关键词，去除冗余描述，控制在 150 字以内。全中文编写。',
  seedream: '适配 Seedream：使用 Seedream 推荐的提示词结构（主体 + 环境 + 光影 + 风格 + 质量），全中文编写。末尾追加质量后缀：，高清细节，画面稳定，光影层次丰富。',
  seedance: '适配 Seedance：使用 Seedance 推荐的提示词结构（场景 + 动作 + 运镜 + 时长 + 风格），全中文编写。末尾追加质量后缀：，运镜稳定流畅，画面无闪烁无变形，动作自然连贯。',
  negative: '优化负面提示词：列出需要排除的内容，至少包含：模糊，变形，多余手指，文字水印，低画质，过度饱和，面部扭曲，肢体畸形。可根据镜头特点追加额外排除项。',
  custom: '自定义优化。',
};

/**
 * 构建单个提示词字段优化 prompt。
 */
export function buildOptimizePromptFieldPrompt(
  project: any,
  shotIndex: number,
  promptField: string,
  optimizeType: string,
  customInstruction?: string,
): string {
  const data = project.data || project;
  const shots = data.shots || [];
  const shot = shots[shotIndex];

  const fieldLabel = PROMPT_FIELD_LABELS[promptField] || promptField;
  const tips = OPTIMIZE_TYPE_TIPS_FIELD[optimizeType] || '';

  const currentPrompt = shot ? (shot as any)[promptField] || '（当前为空）' : '（当前为空）';

  return `你是一位专业的 AI 图像/视频提示词优化师。请对以下镜头的"${fieldLabel}"进行优化。

## 项目信息
- 非遗类型：${data.heritageType}
- 视觉风格：${data.style}
- 镜头序号：${shotIndex + 1}

## 镜头描述
${shot?.description || '未知'}

## 当前${fieldLabel}
${currentPrompt}

## 优化方向：${optimizeType}
${tips}
${customInstruction ? `\n## 用户自定义要求\n${customInstruction}\n` : ''}

## 输出要求
1. 只返回优化后的纯文本提示词字符串，必须使用**全中文**编写。
2. 不要使用 JSON 格式，不要使用代码围栏。
3. 不要添加任何解释文字，只返回提示词本身。
4. 优化后的提示词应直接可用于对应的 AI 生成工具。
5. 如果是图像提示词，末尾追加，高清细节，画面稳定，光影层次丰富；如果是视频提示词，末尾追加，运镜稳定流畅，画面无闪烁无变形，动作自然连贯。

再次强调：只返回纯文本提示词。`;
}
