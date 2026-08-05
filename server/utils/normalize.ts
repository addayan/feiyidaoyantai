// ===== 数据标准化 =====

import type { GenerateRequest } from '../types';
import { calculateGeneratabilityScore } from './score';

// ===== 分镜细节字段合法值（V2.1.0 新增）=====
const VALID_COMPOSITION = ['三分法', '中心构图', '对称构图', '引导线构图', '框架构图', '对角线构图', '留白构图', '黄金分割', '层次构图', '其他'];
const VALID_LIGHTING = ['自然光', '逆光', '侧光', '顶光', '底光', '柔光', '硬光', '伦勃朗光', '轮廓光', '散射光', '暖光', '冷光'];
const VALID_CAMERA_ANGLE = ['平视', '俯视', '仰视', '鸟瞰', '倾斜', '低角度', '过肩'];
const VALID_DEPTH_OF_FIELD = ['浅景深', '深景深', '焦点转移', '区域对焦', '全景深'];
const VALID_SPEED = ['正常速度', '慢动作', '快动作', '定格', '延时'];
const VALID_MOOD = ['庄重', '温馨', '紧张', '神秘', '激昂', '宁静', '欢快', '哀伤', '怀旧', '期待', '震撼', '平和'];
const VALID_TRANSITION = ['硬切', '淡入淡出', '叠化', '划像', '遮罩转场', '匹配剪辑', '跳切', '黑场', '白场'];

/**
 * 校验并保留 AI 生成的分镜细节字段。
 * 如果值不在合法枚举中，移除该字段（前端会根据 undefined 判断是否显示）。
 */
export function validateShotDetailFields(shot: any): void {
  const fieldValidMap: Record<string, string[]> = {
    composition: VALID_COMPOSITION,
    lighting: VALID_LIGHTING,
    cameraAngle: VALID_CAMERA_ANGLE,
    depthOfField: VALID_DEPTH_OF_FIELD,
    speed: VALID_SPEED,
    mood: VALID_MOOD,
    transition: VALID_TRANSITION,
  };

  for (const [field, validValues] of Object.entries(fieldValidMap)) {
    if (shot[field] !== undefined && shot[field] !== null) {
      const value = String(shot[field]).trim();
      if (!validValues.includes(value)) {
        // 值不合法，移除字段（前端会根据 undefined 判断是否显示）
        delete shot[field];
      } else {
        shot[field] = value;
      }
    }
  }
}

/**
 * 为缺失的分镜细节字段补齐智能默认值。
 * 根据 shotSize / camera / description / index 推断最合适的值。
 */
export function fillMissingShotDetails(shot: any, index: number, totalShots: number): void {
  // 构图
  if (!shot.composition) {
    const sizeToComposition: Record<string, string> = {
      '特写': '中心构图', '近景': '中心构图',
      '中景': '三分法', '中近景': '三分法',
      '全景': '层次构图', '远景': '引导线构图', '大远景': '黄金分割',
    };
    shot.composition = sizeToComposition[shot.shotSize] || '三分法';
  }
  // 光效
  if (!shot.lighting) {
    const desc = String(shot.description || '');
    if (/黄昏|夕阳|暖光|温暖/.test(desc)) shot.lighting = '暖光';
    else if (/逆光|剪影|轮廓/.test(desc)) shot.lighting = '逆光';
    else if (/室内|工坊|屋内/.test(desc)) shot.lighting = '柔光';
    else if (/室外|户外|自然/.test(desc)) shot.lighting = '自然光';
    else if (/冷|蓝|夜/.test(desc)) shot.lighting = '冷光';
    else shot.lighting = '柔光';
  }
  // 拍摄角度
  if (!shot.cameraAngle) {
    const cameraToAngle: Record<string, string> = {
      '固定': '平视', '推': '平视', '拉': '平视',
      '摇': '平视', '移': '平视', '跟': '平视',
      '升': '仰视', '降': '俯视',
      '航拍': '鸟瞰', '环绕': '低角度',
    };
    shot.cameraAngle = cameraToAngle[shot.camera] || '平视';
  }
  // 景深
  if (!shot.depthOfField) {
    const sizeToDof: Record<string, string> = {
      '特写': '浅景深', '近景': '浅景深',
      '中景': '浅景深', '中近景': '浅景深',
      '全景': '深景深', '远景': '深景深', '大远景': '全景深',
    };
    shot.depthOfField = sizeToDof[shot.shotSize] || '浅景深';
  }
  // 速度
  if (!shot.speed) {
    const desc = String(shot.description || '');
    if (/慢|缓|凝/.test(desc)) shot.speed = '慢动作';
    else if (/快|疾|飞/.test(desc)) shot.speed = '快动作';
    else if (/定格|静止/.test(desc)) shot.speed = '定格';
    else shot.speed = '正常速度';
  }
  // 情绪
  if (!shot.mood) {
    const desc = String(shot.description || '');
    if (/庄|肃|敬/.test(desc)) shot.mood = '庄重';
    else if (/温|暖|柔/.test(desc)) shot.mood = '温馨';
    else if (/紧|急|险/.test(desc)) shot.mood = '紧张';
    else if (/神|秘|幽/.test(desc)) shot.mood = '神秘';
    else if (/宁|静|安/.test(desc)) shot.mood = '宁静';
    else if (/怀|旧|忆/.test(desc)) shot.mood = '怀旧';
    else if (index >= totalShots - 2) shot.mood = '期待';
    else shot.mood = '庄重';
  }
  // 转场
  if (!shot.transition) {
    shot.transition = (index === totalShots - 1) ? '淡入淡出' : '硬切';
  }
}

/**
 * 标准化 AI 生成的原始数据，确保所有字段完整、镜头数量为 8 个。
 */
export function normalizeGeneratedResult(raw: any, request: GenerateRequest): any {
  const warnings: string[] = [];

  // --- 标题 ---
  const title = raw.title || `${request.heritageType}《${request.topic || '传承'}》`;
  if (!raw.title) warnings.push('title 缺失，已根据 topic 生成');

  // --- 一句话 ---
  const tagline = raw.tagline || `一段关于${request.heritageType}的动人故事，在传统与现代之间寻找传承的意义。`;
  if (!raw.tagline) warnings.push('tagline 缺失，已基于 topic 生成');

  // --- 基本元信息 ---
  const heritageType = request.heritageType;
  const purpose = request.purpose;
  const duration = request.duration;
  const style = request.style;

  // --- 故事 ---
  const story = {
    title: raw.story?.title || title,
    tagline: raw.story?.tagline || tagline,
    synopsis: raw.story?.synopsis || `这是一个关于${request.heritageType}的短片创作方案。核心创意：${request.topic}。故事围绕${request.heritageType}的技艺与传承展开，展现非遗文化在当代的生命力与情感价值。`,
  };
  if (!raw.story?.synopsis) warnings.push('story.synopsis 缺失，已生成兜底内容');

  // --- 角色 ---
  const characters = normalizeCharacters(raw.characters || [], request);
  if (!raw.characters || raw.characters.length === 0) warnings.push('characters 为空，已生成兜底角色');

  // --- 场景 ---
  const scenes = normalizeScenes(raw.scenes || [], request);
  if (!raw.scenes || raw.scenes.length === 0) warnings.push('scenes 为空，已生成兜底场景');

  // --- 镜头（必须为 8 个） ---
  const shots = normalizeShots(raw.shots || [], request, scenes);
  const originalShotCount = raw.shots?.length || 0;
  if (originalShotCount < 8) warnings.push(`shots 仅 ${originalShotCount} 个，已补齐到 8 个`);
  if (originalShotCount > 8) warnings.push(`shots 有 ${originalShotCount} 个，已截取前 8 个`);

  // --- 声音设计 ---
  const soundDesign = {
    bgm: raw.soundDesign?.bgm || `${request.heritageType}主题背景音乐：中国传统乐器（古筝/二胡/笛子）与现代氛围音乐融合，情感递进，从安静到温暖升华。`,
    ambientSound: raw.soundDesign?.ambientSound || `老宅环境音：远处市井声、木梁吱呀声、工具轻触声。`,
    voice: raw.soundDesign?.voice || `旁白（女声，温和）："每一道工序里，都藏着几代人的光阴。"`,
    soundEffects: raw.soundDesign?.soundEffects || `${request.heritageType}工序音效、材质声、脚步声。`,
  };
  if (!raw.soundDesign) warnings.push('soundDesign 为空，已生成兜底内容');

  // --- 文化表达检查 ---
  const cultureCheck = {
    overallScore: raw.cultureCheck?.overallScore || 80,
    items: raw.cultureCheck?.items || [
      { label: '文化符号使用', status: '正常', detail: '使用了恰当的文化符号' },
      { label: '猎奇化风险', status: '低', detail: '未发现猎奇化倾向' },
      { label: '虚构身份说明', status: '已说明', detail: '角色为虚构创作角色' },
      { label: '真实资料引用', status: '建议注明来源', detail: '如有引用请注明' },
      { label: '工艺准确性', status: '良好', detail: '工艺描述基本准确' },
      { label: '地域文化表达', status: '良好', detail: '地域文化元素运用得当' },
    ],
    notes: raw.cultureCheck?.notes || '本作品中人物为虚构创作角色，不对应现实中的具体传承人。',
    suggestions: raw.cultureCheck?.suggestions || `后续可进一步优化：${request.heritageType}的具体工序细节、地域方言使用、传统服饰纹样考证。`,
    disclaimer: raw.cultureCheck?.disclaimer || '所有创意角色均为虚构，不对应现实中任何具体人物。如引用真实人物、工坊、作品或资料，应注明来源并确认授权。',
  };
  if (!raw.cultureCheck) warnings.push('cultureCheck 为空，已生成兜底内容');

  // --- 参赛说明 ---
  const submissionNote = {
    title: raw.submissionNote?.title || title,
    introduction: raw.submissionNote?.introduction || `本作品以${request.heritageType}为主题，通过${style}的视觉语言，讲述一段关于传统技艺传承的动人故事。`,
    creativeNote: raw.submissionNote?.creativeNote || `创意来源于${request.topic || '对非遗文化的观察与思考'}。作品尝试用现代叙事手法呈现传统技艺的温度与深度。`,
    techNote: raw.submissionNote?.techNote || `使用 AI 辅助创意策划、分镜设计和提示词生成。视频生成工具使用 Seedream（图像）和 Seedance（视频）。`,
    aiUsageNote: raw.submissionNote?.aiUsageNote || `本作品使用 AI 工具进行创意策划、分镜脚本、提示词优化和文化表达检查。AI 生成内容经过人工审核与调整。`,
    culturalValue: raw.submissionNote?.culturalValue || `${request.heritageType}是中国重要的非物质文化遗产。本作品致力于展现其技艺之美、传承之重和当代价值。`,
    suitableTrack: raw.submissionNote?.suitableTrack || 'AIGC 创意赛道 / 数字非遗赛道 / 传统文化创新赛道',
    specSuggestion: raw.submissionNote?.specSuggestion || `建议输出规格：1080p 或 4K，配合字幕和配乐。`,
  };
  if (!raw.submissionNote) warnings.push('submissionNote 为空，已生成兜底内容');

  // --- 发布文案 ---
  const socialPosts = {
    douyin: raw.socialPosts?.douyin || `用 AI 做了一个关于${request.heritageType}的短片！#非遗影像工坊 #${request.heritageType} #AI短片 #传统文化`,
    xiaohongshu: raw.socialPosts?.xiaohongshu || `用 AI 做了一部${request.heritageType}短片\n\n从创意到分镜到提示词，AI 帮我完成了全部前期策划。\n\n#非遗影像工坊 #${request.heritageType} #AI创作 #非遗文化 #短片创作`,
  };
  if (!raw.socialPosts) warnings.push('socialPosts 为空，已生成兜底内容');

  // --- 生成元信息 ---
  const generationMeta = {
    mode: 'ai' as const,
    model: raw.generationMeta?.model || 'unknown',
    generatedAt: raw.generationMeta?.generatedAt || new Date().toISOString(),
    normalized: true,
    warnings,
  };

  return {
    title,
    tagline,
    heritageType,
    purpose,
    duration,
    style,
    story,
    characters,
    scenes,
    shots,
    soundDesign,
    cultureCheck,
    submissionNote,
    socialPosts,
    generationMeta,
  };
}

// ===== 角色标准化 =====
function normalizeCharacters(chars: any[], request: GenerateRequest): any[] {
  const requiredFields = ['name', 'age', 'identity', 'appearance', 'costume', 'personality', 'relationship', 'props', 'anchorPoint'];

  // 字段名映射
  const fieldAliases: Record<string, string> = {
    consistencyAnchor: 'anchorPoint',
    anchor: 'anchorPoint',
    role: 'identity',
    look: 'appearance',
    traits: 'personality',
    relation: 'relationship',
    tools: 'props',
    belongings: 'props',
  };

  const normalized = chars.map(c => {
    const mapped: any = {};
    for (const [key, value] of Object.entries(c)) {
      const canonicalKey = fieldAliases[key] || key;
      mapped[canonicalKey] = value;
    }
    // 确保所有必填字段存在
    for (const field of requiredFields) {
      if (!mapped[field] || mapped[field] === '') {
        mapped[field] = getDefaultCharacterField(field, request);
      }
    }
    return mapped;
  });

  return normalized.length > 0 ? normalized : getDefaultCharacters(request);
}

function getDefaultCharacterField(field: string, request: GenerateRequest): string {
  const defaults: Record<string, string> = {
    name: '手艺人',
    age: '60岁',
    identity: `${request.heritageType}老艺人`,
    appearance: '精神矍铄，双手有老茧，眼神温和而坚定',
    costume: '传统中式服装或工作围裙',
    personality: '沉默寡言但技艺精湛，对年轻人有耐心',
    relationship: '主角的师父',
    props: `${request.heritageType}专用工具`,
    anchorPoint: '老艺人形象 + 传统工具 + 专注神情',
  };
  return defaults[field] || '';
}

function getDefaultCharacters(request: GenerateRequest): any[] {
  return [
    {
      name: '小雅',
      age: '22岁',
      identity: '数字媒体专业大学生',
      appearance: '短发，戴眼镜，穿着简约',
      costume: '日常休闲装',
      personality: '好奇心强，有共情力，对传统文化既陌生又向往',
      relationship: '非遗老艺人的学生',
      props: '手机、相机、笔记本',
      anchorPoint: '年轻面孔 + 现代衣着 + 手持相机',
    },
    {
      name: '老周',
      age: '65岁',
      identity: `${request.heritageType}老艺人`,
      appearance: '精神矍铄，双手有老茧，眼神温和而坚定',
      costume: '传统中式服装或工作围裙',
      personality: '沉默寡言但技艺精湛，对年轻人有耐心',
      relationship: '小雅的师父',
      props: `${request.heritageType}专用工具、老照片`,
      anchorPoint: '老艺人形象 + 传统工具 + 专注神情',
    },
  ];
}

// ===== 场景标准化 =====
function normalizeScenes(scenes: any[], request: GenerateRequest): any[] {
  const requiredFields = ['name', 'time', 'location', 'atmosphere', 'coreVisualElements', 'allowedElements', 'avoidElements', 'colorSuggestion', 'soundElements'];

  const normalized = scenes.map(s => {
    for (const field of requiredFields) {
      if (!s[field] || s[field] === '') {
        (s as any)[field] = getDefaultSceneField(field, request);
      }
    }
    return s;
  });

  return normalized.length > 0 ? normalized : getDefaultScenes(request);
}

function getDefaultSceneField(field: string, request: GenerateRequest): string {
  const defaults: Record<string, string> = {
    name: '传统工坊',
    time: '白天',
    location: '老城巷子深处的传统工坊',
    atmosphere: '温暖、安静、时光仿佛停滞',
    coreVisualElements: `${request.heritageType}工具、暖色灯光、木梁结构`,
    allowedElements: '传统工具、暖色调灯光、木质家具',
    avoidElements: '现代电子设备、霓虹灯',
    colorSuggestion: '暖橙、琥珀、深棕',
    soundElements: '远处市井声、工具触碰声',
  };
  return defaults[field] || '';
}

function getDefaultScenes(request: GenerateRequest): any[] {
  return [
    {
      name: '老宅工坊',
      time: '黄昏至夜晚',
      location: '老城巷子深处的传统工坊',
      atmosphere: '温暖、安静、时光仿佛停滞',
      coreVisualElements: `${request.heritageType}工具、暖色灯光、木梁结构、老照片`,
      allowedElements: '传统工具、暖色调灯光、木质家具、手工材料',
      avoidElements: '现代电子设备（手机/相机除外）、霓虹灯',
      colorSuggestion: '暖橙、琥珀、深棕，局部青绿色点缀',
      soundElements: '远处的市井声、工具触碰声、虫鸣',
    },
    {
      name: '现代空间',
      time: '白天',
      location: '大学工作室或现代展厅',
      atmosphere: '明亮、开放、充满可能性',
      coreVisualElements: '白墙、投影设备、作品展示区、落地窗',
      allowedElements: '现代家具、投影、自然光、数字设备',
      avoidElements: '过于杂乱、阴暗、复古装饰',
      colorSuggestion: '白色、浅灰、自然光色，局部金色点缀',
      soundElements: '键盘敲击声、脚步声、环境白噪音',
    },
  ];
}

// ===== 镜头标准化（必须 8 个）=====
function normalizeShots(shots: any[], request: GenerateRequest, scenes: any[]): any[] {
  const requiredFields = [
    'id', 'scene', 'shotSize', 'camera', 'duration',
    'description', 'firstFramePrompt', 'lastFramePrompt', 'videoPrompt',
    'negativePrompt', 'generatabilityScore', 'generatabilityChecks',
  ];

  // 处理已有镜头
  const normalized = shots.map((s, i) => {
    // 确保必填字段
    for (const field of requiredFields) {
      if (s[field] === undefined || s[field] === null || s[field] === '') {
        (s as any)[field] = getDefaultShotField(field, request, i, scenes);
      }
    }
    // 校验分镜细节字段（V2.1.0 新增）
    validateShotDetailFields(s);
    // 补齐缺失的分镜细节字段（V2.2.0 新增）
    fillMissingShotDetails(s, i, 8);
    // 确保 id 格式正确
    s.id = `shot-${i + 1}`;
    // 重新计算可生成性评分
    const { score, checks } = calculateGeneratabilityScore(s);
    s.generatabilityScore = score;
    s.generatabilityChecks = checks.map(c => ({
      label: c.label,
      status: c.status === 'warning' ? 'warn' : 'pass',
      detail: c.detail,
    }));
    return s;
  });

  // 截取或补齐到 8 个
  if (normalized.length > 8) {
    return normalized.slice(0, 8);
  }

  // 补齐不足的镜头
  while (normalized.length < 8) {
    const idx = normalized.length;
    normalized.push(createDefaultShot(request, idx, scenes));
  }

  return normalized;
}

function getDefaultShotField(field: string, request: GenerateRequest, index: number, scenes: any[]): any {
  const sceneName = scenes[index % scenes.length]?.name || '传统工坊';
  const defaults: Record<string, any> = {
    id: `shot-${index + 1}`,
    scene: sceneName,
    shotSize: '中景',
    camera: '固定',
    duration: '5秒',
    description: `${request.heritageType}短片镜头 ${index + 1}，展现非遗技艺的传承之美。`,
    firstFramePrompt: `${request.style}风格，${request.heritageType}主题，镜头${index + 1}首帧画面。光线柔和，色彩温润，电影级画面质量，高清细节，画面稳定，光影层次丰富`,
    lastFramePrompt: `${request.style}风格，${request.heritageType}主题，镜头${index + 1}尾帧画面。画面有轻微动态过渡，保持视觉连贯性，高清细节，画面稳定，光影层次丰富`,
    videoPrompt: `${request.style}风格 ${request.heritageType}短片镜头${index + 1}，固定镜头，中景，5秒，光线柔和，色彩温润，电影级画面，运镜稳定流畅，画面无闪烁无变形，动作自然连贯`,
    negativePrompt: '模糊，变形，多余手指，文字水印，低画质，过度饱和，面部扭曲，肢体畸形',
    generatabilityScore: 70,
    generatabilityChecks: [
      { label: '主体明确', status: 'pass', detail: '主体清晰可辨' },
      { label: '场景清晰', status: 'pass', detail: '场景描述具体' },
    ],
  };
  return defaults[field] ?? '';
}

function createDefaultShot(request: GenerateRequest, index: number, scenes: any[]): any {
  const sceneName = scenes[index % scenes.length]?.name || '传统工坊';
  const shot = {
    id: `shot-${index + 1}`,
    scene: sceneName,
    shotSize: '中景',
    camera: '固定',
    duration: '5秒',
    description: `${request.heritageType}传承的延续，镜头${index + 1}，传统技艺在当代焕发新的生命力。`,
    composition: '三分法',
    lighting: '自然光',
    cameraAngle: '平视',
    depthOfField: '浅景深',
    speed: '正常速度',
    mood: index < 4 ? '庄重' : '温馨',
    transition: index === 7 ? '淡入淡出' : '硬切',
    firstFramePrompt: `${request.style}风格，${request.heritageType}主题，${sceneName}场景。一位专注的${request.heritageType}手艺人正在进行传统工序，光线柔和，色彩温润，电影级画面质量，高清细节，画面稳定，光影层次丰富`,
    lastFramePrompt: `${request.style}风格，${request.heritageType}主题，${sceneName}场景。手艺人完成了一道工序，神情满足，光线温暖，电影级画面，高清细节，画面稳定，光影层次丰富`,
    videoPrompt: `${request.style}风格 ${request.heritageType}短片，${sceneName}场景，固定镜头，中景，5秒，手艺人专注进行传统工序，光线柔和，色彩温润，电影级画面，运镜稳定流畅，画面无闪烁无变形，动作自然连贯`,
    negativePrompt: '模糊，变形，多余手指，文字水印，低画质，过度饱和，面部扭曲，肢体畸形',
    generatabilityScore: 70,
    generatabilityChecks: [
      { label: '主体明确', status: 'pass', detail: '主体清晰可辨' },
      { label: '场景清晰', status: 'pass', detail: '场景描述具体' },
      { label: '运镜合理', status: 'pass', detail: '运镜方式可实现' },
      { label: '环境动态', status: 'pass', detail: '环境动态描述充分' },
    ],
  };

  const { score, checks } = calculateGeneratabilityScore(shot);
  shot.generatabilityScore = score;
  shot.generatabilityChecks = checks.map(c => ({
    label: c.label,
    status: c.status === 'warning' ? 'warn' : 'pass',
    detail: c.detail,
  }));

  return shot;
}
