// ===== 镜头优化 Prompt =====

// ===== 分镜细节字段可选值（V2.1.0 新增）=====
const SHOT_DETAIL_ENUMS = `  - composition（构图）: 三分法 | 中心构图 | 对称构图 | 引导线构图 | 框架构图 | 对角线构图 | 留白构图 | 黄金分割 | 层次构图 | 其他
  - lighting（光效）: 自然光 | 逆光 | 侧光 | 顶光 | 底光 | 柔光 | 硬光 | 伦勃朗光 | 轮廓光 | 散射光 | 暖光 | 冷光
  - cameraAngle（拍摄角度）: 平视 | 俯视 | 仰视 | 鸟瞰 | 倾斜 | 低角度 | 过肩
  - depthOfField（景深）: 浅景深 | 深景深 | 焦点转移 | 区域对焦 | 全景深
  - speed（速度/帧率）: 正常速度 | 慢动作 | 快动作 | 定格 | 延时
  - mood（情绪氛围）: 庄重 | 温馨 | 紧张 | 神秘 | 激昂 | 宁静 | 欢快 | 哀伤 | 怀旧 | 期待 | 震撼 | 平和
  - transition（转场方式）: 硬切 | 淡入淡出 | 叠化 | 划像 | 遮罩转场 | 匹配剪辑 | 跳切 | 黑场 | 白场`;

const OPTIMIZE_TYPE_LABELS: Record<string, string> = {
  cinematic: '增强电影感',
  emotion: '增强情绪表达',
  camera: '增强运镜设计',
  heritage: '增强非遗文化表达',
  generatability: '增强 AI 视频可生成性',
  simplify: '简化提示词',
  seedream: '适配 Seedream（图像生成模型）',
  seedance: '适配 Seedance（视频生成模型）',
  custom: '自定义要求',
};

const OPTIMIZE_TYPE_TIPS: Record<string, string> = {
  cinematic: '增加光影层次描述、景深效果、镜头语言、色彩情绪、电影构图参考。提示词中可加入"cinematic lighting""shallow depth of field""film grain"等电影术语。',
  emotion: '强化情绪氛围描写，增加人物表情、肢体语言、环境氛围的细节描述。使画面传达更明确的情感。',
  camera: '优化运镜描述，使运镜更具叙事性。可增加运镜速度、轨迹的描述，确保运镜在 AI 视频生成中可实现。',
  heritage: '深入描写非遗技艺的细节：工具纹理、材料质感、工序动作、传统纹样等。使文化元素更加突出和准确。',
  generatability: '简化镜头内容到 AI 可生成的范围：减少人物数量（1-2人最佳）、简化动作、保持环境一致、避免冲突动作、控制提示词长度在 200-400 字。',
  simplify: '精简提示词到最核心的元素，去除冗余描述。保留主体、场景、光影、风格等关键词，控制在 150 字以内。',
  seedream: '优化为 Seedream 图像生成模型的最佳格式：强调画面构图、主体描述、光影效果、色彩方案。使用 Seedream 推荐的提示词结构：主体 + 环境 + 光影 + 风格 + 质量。',
  seedance: '优化为 Seedance 视频生成模型的最佳格式：强调动态变化、运镜描述、时间流逝。使用 Seedance 推荐的提示词结构：场景 + 主体动作 + 运镜 + 时长 + 风格。',
  custom: '按照用户自定义要求进行优化。',
};

/**
 * 构建镜头优化 prompt。
 */
export function buildOptimizeShotPrompt(
  project: any,
  shotIndex: number,
  optimizeType: string,
  customInstruction?: string,
): string {
  const data = project.data || project;
  const shots = data.shots || [];
  const shot = shots[shotIndex];

  const label = OPTIMIZE_TYPE_LABELS[optimizeType] || optimizeType;
  const tips = OPTIMIZE_TYPE_TIPS[optimizeType] || '';

  return `你是一位专业的 AI 视频提示词优化师。请对以下镜头进行"${label}"优化。

## 项目信息
- 非遗类型：${data.heritageType}
- 视觉风格：${data.style}

## 当前镜头（镜头 ${shotIndex + 1}）
${shot ? JSON.stringify(shot, null, 2) : '（当前为空）'}

## 优化方向：${label}
${tips}
${customInstruction ? `\n## 用户自定义要求\n${customInstruction}\n` : ''}

## 输出要求
1. 只返回一个完整的镜头 JSON 对象，不要返回数组。
2. 不要使用 Markdown 代码围栏，不添加任何解释文字。
3. 所有提示词必须使用**全中文**编写。图像提示词末尾追加，高清细节，画面稳定，光影层次丰富；视频提示词末尾追加，运镜稳定流畅，画面无闪烁无变形，动作自然连贯。必须填写 negativePrompt 字段。
4. 优化后的镜头需保持与原镜头相同的 id、scene、shotSize。
5. 保留或优化以下 7 个分镜细节字段（从枚举值中选择最合适的值）：
${SHOT_DETAIL_ENUMS}
   - 优化时可根据优化方向调整这些参数（如"增强电影感"时可改为更有电影质感的构图和光效）。
6. 按照以下模板输出：

{
  "id": "shot-${shotIndex + 1}",
  "scene": "${shot?.scene || '场景'}",
  "shotSize": "${shot?.shotSize || '中景'}",
  "camera": "优化后的运镜",
  "duration": "${shot?.duration || '5秒'}",
  "description": "优化后的镜头描述",
  "composition": "构图方式",
  "lighting": "光效",
  "cameraAngle": "拍摄角度",
  "depthOfField": "景深",
  "speed": "速度/帧率",
  "mood": "情绪氛围",
  "transition": "转场方式",
  "firstFramePrompt": "优化后的首帧提示词（全中文，末尾追加：，高清细节，画面稳定，光影层次丰富）",
  "lastFramePrompt": "优化后的尾帧提示词（全中文，末尾追加质量后缀）",
  "videoPrompt": "优化后的视频提示词（全中文，末尾追加：，运镜稳定流畅，画面无闪烁无变形，动作自然连贯）",
  "negativePrompt": "负面提示词（全中文，至少包含：模糊，变形，多余手指，文字水印，低画质，过度饱和，面部扭曲，肢体畸形）",
  "generatabilityScore": 85,
  "generatabilityChecks": [
    { "label": "主体明确", "status": "pass", "detail": "..." },
    { "label": "场景清晰", "status": "pass", "detail": "..." },
    { "label": "运镜合理", "status": "pass", "detail": "..." },
    { "label": "环境动态", "status": "pass", "detail": "..." }
  ]
}

再次强调：只返回一个镜头的纯 JSON。`;
}
