import type { ProjectData, HeritageType, Purpose, Duration, VisualStyle } from '../types';

interface GenerateParams {
  heritageType: HeritageType;
  topic: string;
  purpose: Purpose;
  duration: Duration;
  style: VisualStyle;
}

export function generateMockProjectData(params: GenerateParams): ProjectData {
  const { heritageType, topic, purpose, duration, style } = params;

  // 根据非遗类型生成合理标题
  const titles: Record<string, string[]> = {
    '傩戏': ['丑面', '面具之下', '傩', '夜傩'],
    '铜梁龙': ['火龙入夜', '龙腾', '打铁花', '龙舞'],
    '蜀绣': ['一针入画', '绣梦', '丝线之间', '针尖时光'],
    '木版年画': ['门神醒来', '年画', '印迹', '纸上年'],
    '剪纸': ['剪窗花', '红纸', '纸上乾坤', '剪梦'],
    '皮影': ['影戏', '光影', '皮影人', '幕后'],
    '陶艺': ['泥与火', '窑变', '手作', '陶魂'],
    '其他': ['传承', '匠心', '手作时光', '守望'],
  };

  const typeTitles = titles[heritageType] || titles['其他'];
  const randomTitle = typeTitles[Math.floor(Math.random() * typeTitles.length)];
  const title = `${heritageType}《${randomTitle}》`;

  // 根据主题生成一句话
  const tagline = topic || `一段关于${heritageType}的动人故事，在传统与现代之间寻找传承的意义。`;

  // 故事梗概
  const storySynopsis = `这是一个关于${heritageType}的短片创作方案。${topic ? '核心创意：' + topic + '。' : ''}故事围绕${heritageType}的技艺与传承展开，展现非遗文化在当代的生命力与情感价值。`;

  // 角色
  const characters = [
    {
      name: '小雅',
      age: '22岁',
      identity: '数字媒体专业大学生',
      appearance: '短发，戴眼镜，穿着简约',
      costume: '日常休闲装，有时穿文化衫',
      personality: '好奇心强，有共情力，对传统文化既陌生又向往',
      relationship: '非遗老艺人的孙女/学生',
      props: '手机、相机、笔记本',
      anchorPoint: '年轻面孔 + 现代衣着 + 手持相机',
    },
    {
      name: '老周',
      age: '65岁',
      identity: `${heritageType}老艺人`,
      appearance: '精神矍铄，双手有老茧，眼神温和而坚定',
      costume: '传统中式服装或工作围裙',
      personality: '沉默寡言但技艺精湛，对年轻人有耐心',
      relationship: '小雅的外公/师父',
      props: `${heritageType}专用工具、老照片`,
      anchorPoint: '老艺人形象 + 传统工具 + 专注神情',
    },
  ];

  // 场景
  const scenes = [
    {
      name: '老宅工坊',
      time: '黄昏至夜晚',
      location: '老城巷子深处的传统工坊',
      atmosphere: '温暖、安静、时光仿佛停滞',
      coreVisualElements: `${heritageType}工具、暖色灯光、木梁结构、老照片`,
      allowedElements: '传统工具、暖色调灯光、木质家具、手工材料',
      avoidElements: '现代电子设备（手机/相机除外）、霓虹灯、过于现代的装修',
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

  // 8 个镜头
  const shots = Array.from({ length: 8 }, (_, i) => {
    const shotSizes = ['特写', '近景', '中景', '全景', '远景'] as const;
    const cameras = ['固定', '推', '拉', '摇', '跟', '移'] as const;
    const descriptions = [
      `黄昏光线透过木窗，照亮${heritageType}工具的轮廓，灰尘在光柱中浮动。`,
      `老艺人双手专注地进行${heritageType}工序，动作熟练而从容。`,
      `小雅站在门口，犹豫片刻后轻轻踏入工坊。`,
      `中景：老艺人向小雅展示${heritageType}的核心技法，眼神中流露传承的渴望。`,
      `细节特写：${heritageType}作品上精妙的纹理与色彩。`,
      `平行剪辑：老艺人的传统手法与小雅用相机记录的画面交替出现。`,
      `全景：工坊内一老一少，传统与现代在同一空间中交汇。`,
      `结尾：${heritageType}作品在光影中呈现，旁白落下。`,
    ];

    return {
      id: `shot-${i + 1}`,
      scene: i % 2 === 0 ? '老宅工坊' : '现代空间',
      shotSize: shotSizes[i % shotSizes.length],
      camera: cameras[i % cameras.length],
      duration: `${5 + (i % 4)}秒`,
      description: descriptions[i] || `${heritageType}短片镜头 ${i + 1}，展现非遗技艺的传承之美。`,
      firstFramePrompt: `${style}风格，${heritageType}主题，首帧画面：${descriptions[i]} 光线柔和，色彩温润，电影级画面质量。`,
      lastFramePrompt: `${style}风格，${heritageType}主题，尾帧画面：${descriptions[i]} 画面有轻微动态过渡，保持视觉连贯性。`,
      videoPrompt: `${style}风格 ${heritageType}短片镜头，${descriptions[i]} 运镜：${cameras[i % cameras.length]}，景别：${shotSizes[i % shotSizes.length]}，时长${5 + (i % 4)}秒，光线柔和，色彩温润，电影级画面。`,
      generatabilityScore: 75 + (i % 6) * 3,
      generatabilityChecks: [
        { label: '主体明确', status: 'pass' as const, detail: '主体清晰可辨' },
        { label: '场景清晰', status: 'pass' as const, detail: '场景描述具体' },
        { label: '运镜合理', status: 'pass' as const, detail: '运镜方式可实现' },
        { label: '环境动态', status: i % 3 === 0 ? 'warn' as const : 'pass' as const, detail: i % 3 === 0 ? '建议增加环境动态元素' : '环境动态描述充分' },
      ],
    };
  });

  // 声音设计
  const soundDesign = {
    bgm: `${heritageType}主题背景音乐：中国传统乐器（古筝/二胡/笛子）与现代氛围音乐融合，情感递进，从安静到温暖升华。`,
    ambientSound: `老宅环境音：远处市井声、木梁吱呀声、工具轻触声、夏日蝉鸣或冬日炉火声。`,
    voice: `旁白（女声，温和）："每一道工序里，都藏着几代人的光阴。" 老艺人少量对白，方言或普通话均可。`,
    soundEffects: `${heritageType}工序音效、纸张/布料/金属材质声、脚步声、相机快门声（现代空间场景）。`,
  };

  // 文化表达检查
  const cultureCheck = {
    overallScore: 82 + Math.floor(Math.random() * 10),
    items: [
      { label: '文化符号使用', status: '正常', detail: '使用了恰当的文化符号' },
      { label: '猎奇化风险', status: '低', detail: '未发现猎奇化倾向' },
      { label: '虚构身份说明', status: '已说明', detail: '角色为虚构创作角色' },
      { label: '真实资料引用', status: '建议注明来源', detail: '如有引用请注明' },
      { label: '工艺准确性', status: '良好', detail: '工艺描述基本准确' },
      { label: '地域文化表达', status: '良好', detail: '地域文化元素运用得当' },
    ],
    notes: '本 Demo 中人物为虚构创作角色，不对应现实中的具体传承人。如引用真实人物、工坊、作品或资料，应注明来源并确认授权。',
    suggestions: `后续可进一步优化：${heritageType}的具体工序细节、地域方言使用、传统服饰纹样考证。`,
  };

  // 参赛说明
  const submissionNote = {
    title,
    introduction: `本作品以${heritageType}为主题，通过${style}的视觉语言，讲述一段关于传统技艺传承的动人故事。`,
    creativeNote: `创意来源于${topic || '对非遗文化的观察与思考'}。作品尝试用现代叙事手法呈现传统技艺的温度与深度。`,
    techNote: `使用 AI 辅助创意策划、分镜设计和提示词生成。视频生成工具使用 Seedream（图像）和 Seedance（视频）。`,
    aiUsageNote: `本作品使用 AI 工具进行创意策划、分镜脚本、提示词优化和文化表达检查。AI 生成内容经过人工审核与调整。`,
    culturalValue: `${heritageType}是中国重要的非物质文化遗产。本作品致力于展现其技艺之美、传承之重和当代价值。`,
    suitableTrack: 'AIGC 创意赛道 / 数字非遗赛道 / 传统文化创新赛道',
    specSuggestion: `建议输出规格：1080p 或 4K，${duration === '30秒' ? '30秒' : duration === '约1分钟' ? '60秒' : duration === '3分钟' ? '3分钟' : '5分钟'}，建议配合字幕和配乐。`,
  };

  // 发布文案
  const socialPosts = {
    douyin: `用 AI 做了一个关于${heritageType}的短片！从创意到分镜再到提示词，全部由 AI 辅助完成。#非遗影像工坊 #${heritageType} #AI短片 #传统文化`,
    xiaohongshu: `✨ 用 AI 做了一部${heritageType}短片\n\n从创意到分镜到提示词，AI 帮我完成了全部前期策划。\n\n这个故事讲的是：${topic || '传统与现代的交汇'}\n\n第一次用 AI 做非遗题材，才发现传统文化和 AI 结合可以这么有感觉。\n\n#非遗影像工坊 #${heritageType} #AI创作 #非遗文化 #短片创作`,
  };

  return {
    title,
    tagline,
    heritageType,
    purpose,
    duration,
    style,
    story: {
      title,
      tagline,
      synopsis: storySynopsis,
    },
    characters,
    scenes,
    shots,
    soundDesign,
    cultureCheck,
    submissionNote,
    socialPosts,
  };
}