import type { DirectorStylePreset } from '../types';

// ===== 导演风格预设 (V2.1.0) =====
// 基于电影流派/美学特征命名，不使用导演姓名，避免版权风险
// 每个风格包包含完整的7维参数组合 + 运镜倾向 + 提示词后缀

export const DIRECTOR_STYLE_PRESETS: DirectorStylePreset[] = [
  {
    id: 'documentary',
    name: '手持纪实风',
    description: '真实感、临场感，仿佛纪录片跟拍',
    icon: '📹',
    composition: '引导线构图',
    lighting: '自然光',
    cameraAngle: '平视',
    depthOfField: '浅景深',
    speed: '正常速度',
    mood: '庄重',
    transition: '硬切',
    cameraPreference: '手持',
    promptSuffix:
      '纪录片质感，手持摄影的轻微呼吸感，自然光线，真实临场感，浅景深聚焦主体，画面带有轻微颗粒感',
    videoPromptSuffix:
      '手持跟拍，镜头有自然呼吸感，画面真实记录感，无过度修饰，纪录片风格运镜',
  },
  {
    id: 'epic',
    name: '史诗大气风',
    description: '宏大叙事、庄严磅礴，适合历史非遗题材',
    icon: '🏛️',
    composition: '对称构图',
    lighting: '逆光',
    cameraAngle: '鸟瞰',
    depthOfField: '深景深',
    speed: '慢动作',
    mood: '震撼',
    transition: '淡入淡出',
    cameraPreference: '航拍',
    promptSuffix:
      '史诗电影质感，宏大对称构图，逆光剪影轮廓，深景深展现全貌，庄严磅礴的氛围，电影级4K画质',
    videoPromptSuffix:
      '航拍/升降镜头，缓慢推进，画面宏大稳定，史诗级交响配乐感，庄严仪式感运镜',
  },
  {
    id: 'nostalgia',
    name: '暖色回忆风',
    description: '怀旧温柔、光影朦胧，情感细腻',
    icon: '🍂',
    composition: '三分法',
    lighting: '暖光',
    cameraAngle: '平视',
    depthOfField: '浅景深',
    speed: '正常速度',
    mood: '怀旧',
    transition: '叠化',
    cameraPreference: '推',
    promptSuffix:
      '怀旧暖色调，柔和暖光洒满画面，浅景深虚化背景，胶片颗粒质感，温暖回忆氛围，画面如老照片般温柔',
    videoPromptSuffix:
      '缓慢推镜，柔和暖光，画面带有胶片颗粒和轻微光晕，温柔缓慢的运镜节奏，怀旧情绪铺满',
  },
  {
    id: 'suspense',
    name: '冷峻悬疑风',
    description: '紧张压迫、光影锐利，悬念感拉满',
    icon: '🔍',
    composition: '框架构图',
    lighting: '侧光',
    cameraAngle: '低角度',
    depthOfField: '焦点转移',
    speed: '正常速度',
    mood: '紧张',
    transition: '跳切',
    cameraPreference: '固定',
    promptSuffix:
      '悬疑惊悚质感，硬朗侧光制造强烈明暗对比，低角度仰拍增强压迫感，焦点在主体间转移，冷峻蓝色调，紧张氛围',
    videoPromptSuffix:
      '固定镜头或缓慢推近，画面稳定中暗含压迫，硬光制造深重阴影，紧张悬疑的节奏控制',
  },
  {
    id: 'zen',
    name: '东方留白风',
    description: '意境悠远、空灵宁静，东方美学极致',
    icon: '🌫️',
    composition: '留白构图',
    lighting: '散射光',
    cameraAngle: '平视',
    depthOfField: '深景深',
    speed: '慢动作',
    mood: '宁静',
    transition: '叠化',
    cameraPreference: '移',
    promptSuffix: '东方水墨意境，大面积留白构图，散射柔光均匀铺洒，深远景深展现层次，画面空灵宁静，意境悠远',
    videoPromptSuffix:
      '缓慢横移或平移镜头，画面如卷轴展开，空灵安静，散射光柔和均匀，东方禅意运镜',
  },
  {
    id: 'folk',
    name: '民俗活力风',
    description: '热闹鲜活、色彩明快，非遗节庆最佳',
    icon: '🎉',
    composition: '三分法',
    lighting: '暖光',
    cameraAngle: '平视',
    depthOfField: '区域对焦',
    speed: '正常速度',
    mood: '欢快',
    transition: '硬切',
    cameraPreference: '跟移',
    promptSuffix:
      '民俗节庆活力感，暖黄色调明快鲜亮，区域对焦捕捉人群动态，色彩饱和度高，热闹欢腾的氛围，画面充满生命力',
    videoPromptSuffix:
      '跟移镜头捕捉人群动态，画面活跃有生气，暖色调高饱和，欢快的运镜节奏与节庆氛围同步',
  },
  {
    id: 'ritual',
    name: '神秘仪式风',
    description: '神秘深邃、光影迷离，仪式感强烈',
    icon: '🕯️',
    composition: '中心构图',
    lighting: '轮廓光',
    cameraAngle: '仰视',
    depthOfField: '浅景深',
    speed: '慢动作',
    mood: '神秘',
    transition: '黑场',
    cameraPreference: '环绕',
    promptSuffix:
      '神秘仪式氛围，轮廓光勾勒主体边缘，仰视角度增强庄严神秘感，浅景深聚焦仪式细节，暗调画面中光影迷离，深邃神秘',
    videoPromptSuffix:
      '缓慢环绕镜头，画面暗调中光影流转，神秘仪式感运镜，慢动作增强庄严感，轮廓光勾边',
  },
  {
    id: 'commercial',
    name: '动感冲击风',
    description: '快节奏、强视觉冲击，商业广告质感',
    icon: '⚡',
    composition: '对角线构图',
    lighting: '硬光',
    cameraAngle: '倾斜',
    depthOfField: '浅景深',
    speed: '快动作',
    mood: '激昂',
    transition: '硬切',
    cameraPreference: '推',
    promptSuffix:
      '商业广告质感，强对比硬光，倾斜对角线构图增强动感，浅景深聚焦产品细节，高饱和度色彩，强烈视觉冲击力',
    videoPromptSuffix:
      '快速推拉运镜，动感节奏，画面有冲击力和张力，商业广告级运镜，快切节奏配合高能量',
  },
];

// 获取风格预设 by id
export function getStylePresetById(id: string): DirectorStylePreset | undefined {
  return DIRECTOR_STYLE_PRESETS.find((s) => s.id === id);
}
