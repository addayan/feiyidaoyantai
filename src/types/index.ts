// ===== 非遗影像工坊 2.0 类型定义 =====

/** 非遗类型 */
export type HeritageType =
  | '傩戏' | '铜梁龙' | '蜀绣' | '木版年画'
  | '剪纸' | '皮影' | '陶艺' | '其他';

/** 作品用途 */
export type Purpose =
  | 'AIGC 比赛' | '短视频' | '课程作业' | '文旅宣传' | '动态海报' | '其他';

/** 视频时长 */
export type Duration = '30秒' | '约1分钟' | '3分钟' | '5分钟';

/** 视觉风格 */
export type VisualStyle =
  | '写实电影' | '国风动画' | '纪录片' | '剪纸风' | '东方幻想' | '其他';

/** 景别 */
export type ShotSize =
  | '特写' | '近景' | '中景' | '中近景' | '全景' | '远景' | '大远景';

/** 运镜 */
export type CameraMovement =
  | '固定' | '推' | '拉' | '摇' | '移' | '跟' | '升' | '降' | '环绕'
  | '推摇' | '拉摇' | '跟移' | '航拍' | '手持';

/** 构图方式 (V2.1.0 新增) */
export type Composition =
  | '三分法' | '中心构图' | '对称构图' | '引导线构图' | '框架构图'
  | '对角线构图' | '留白构图' | '黄金分割' | '层次构图' | '其他';

/** 光效 (V2.1.0 新增) */
export type Lighting =
  | '自然光' | '逆光' | '侧光' | '顶光' | '底光' | '柔光'
  | '硬光' | '伦勃朗光' | '轮廓光' | '散射光' | '暖光' | '冷光';

/** 拍摄角度 (V2.1.0 新增) */
export type CameraAngle =
  | '平视' | '俯视' | '仰视' | '鸟瞰' | '倾斜' | '低角度' | '过肩';

/** 景深 (V2.1.0 新增) */
export type DepthOfField =
  | '浅景深' | '深景深' | '焦点转移' | '区域对焦' | '全景深';

/** 速度 / 帧率 (V2.1.0 新增) */
export type Speed =
  | '正常速度' | '慢动作' | '快动作' | '定格' | '延时';

/** 情绪氛围 (V2.1.0 新增) */
export type Mood =
  | '庄重' | '温馨' | '紧张' | '神秘' | '激昂' | '宁静'
  | '欢快' | '哀伤' | '怀旧' | '期待' | '震撼' | '平和';

/** 转场方式 (V2.1.0 新增) */
export type Transition =
  | '硬切' | '淡入淡出' | '叠化' | '划像' | '遮罩转场'
  | '匹配剪辑' | '跳切' | '黑场' | '白场';

/** 保存状态 */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// ===== 创作表单 =====
export interface CreateForm {
  heritageType: HeritageType;
  topic: string;
  purpose: Purpose;
  duration: Duration;
  style: VisualStyle;
  mode: 'ai' | 'quick';
}

// ===== 故事 =====
export interface Story {
  title: string;
  tagline: string;
  synopsis: string;
}

// ===== 角色 =====
export interface Character {
  name: string;
  age: string;
  identity: string;
  appearance: string;
  costume: string;
  personality: string;
  relationship: string;
  props: string;
  anchorPoint: string; // 一致性锚点
}

// ===== 场景 =====
export interface Scene {
  name: string;
  time: string;
  location: string;
  atmosphere: string;
  coreVisualElements: string;
  allowedElements: string;
  avoidElements: string;
  colorSuggestion: string;
  soundElements: string;
}

// ===== 镜头 =====
export interface GeneratabilityCheck {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

export interface Shot {
  id: string;
  scene: string;
  shotSize: ShotSize;
  camera: CameraMovement;
  duration: string;
  description: string;
  // === V2.1.0 新增：分镜细节（可选，兼容旧项目）===
  composition?: Composition;
  lighting?: Lighting;
  cameraAngle?: CameraAngle;
  depthOfField?: DepthOfField;
  speed?: Speed;
  mood?: Mood;
  transition?: Transition;
  // ================================================
  firstFramePrompt: string;
  lastFramePrompt: string;
  videoPrompt: string;
  // V2.2.1 新增：负面提示词（用于 AI 图像/视频生成时排除不想要的内容）
  negativePrompt?: string;
  generatabilityScore: number;
  generatabilityChecks: GeneratabilityCheck[];
}

// ===== 声音设计 =====
export interface SoundDesign {
  bgm: string;
  ambientSound: string;
  voice: string;
  soundEffects: string;
}

// ===== 文化表达检查 =====
export interface CultureCheckItem {
  label: string;
  status: string;
  detail: string;
}

export interface CultureCheck {
  overallScore: number;
  items: CultureCheckItem[];
  notes: string;
  suggestions: string;
  disclaimer?: string;
}

// ===== 参赛说明 =====
export interface SubmissionNote {
  title: string;
  introduction: string;
  creativeNote: string;
  techNote: string;
  aiUsageNote: string;
  culturalValue: string;
  suitableTrack: string;
  specSuggestion: string;
}

// ===== 发布文案 =====
export interface SocialPosts {
  douyin: string;
  xiaohongshu: string;
}

// ===== 完整项目数据 =====
export interface ProjectData {
  title: string;
  tagline: string;
  heritageType: HeritageType;
  purpose: Purpose;
  duration: Duration;
  style: VisualStyle;
  story: Story;
  characters: Character[];
  scenes: Scene[];
  shots: Shot[];
  soundDesign: SoundDesign;
  cultureCheck: CultureCheck;
  submissionNote: SubmissionNote;
  socialPosts: SocialPosts;
}

// ===== 生成元数据（V2.1.0 新增，可选，兼容旧项目） =====
export interface GenerationMeta {
  mode: 'ai' | 'quick';
  model?: string;
  generatedAt?: string;
  normalized?: boolean;
  warnings?: string[];
}

// ===== 生成历史记录（V2.1.0 新增，可选） =====
export interface GenerationRecord {
  id: string;
  type: 'generate' | 'regenerate-section' | 'regenerate-shot' | 'optimize-shot' | 'optimize-prompt';
  target?: string;
  createdAt: string;
  model?: string;
}

// ===== 项目（含元数据） =====
export interface Project {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  data: ProjectData;
  isExample?: boolean;
  generationMeta?: GenerationMeta;
  generationHistory?: GenerationRecord[];
}

// ===== 案例库摘要 =====
export interface CaseSummary {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  heritageType: HeritageType;
  style: VisualStyle;
  duration: Duration;
  coverDescription: string;
}

// ===== 优化类型 =====
export type PromptOptimizeType =
  | '增强电影感' | '增强情绪表达' | '增强运镜设计'
  | '增强非遗文化表达' | '增强 AI 视频可生成性' | '简化提示词'
  | '适配 Seedream' | '适配 Seedance' | '自定义要求';

// ===== 导演台侧边栏 =====
export type DirectorSection =
  | 'story' | 'characters' | 'scenes' | 'shots'
  | 'sound' | 'culture' | 'submission' | 'social';

export const DIRECTOR_SECTIONS: { key: DirectorSection; label: string; num: string }[] = [
  { key: 'story', label: '创意与故事', num: '01' },
  { key: 'characters', label: '角色设定', num: '02' },
  { key: 'scenes', label: '场景设定', num: '03' },
  { key: 'shots', label: '分镜导演台', num: '04' },
  { key: 'sound', label: '声音设计', num: '05' },
  { key: 'culture', label: '文化表达检查', num: '06' },
  { key: 'submission', label: '参赛说明', num: '07' },
  { key: 'social', label: '发布文案', num: '08' },
];

// ===== 导演风格预设 (V2.1.0 新增) =====
export interface DirectorStylePreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  // 风格对应的默认参数值
  composition?: Composition;
  lighting?: Lighting;
  cameraAngle?: CameraAngle;
  depthOfField?: DepthOfField;
  speed?: Speed;
  mood?: Mood;
  transition?: Transition;
  // 运镜倾向（用于 AI 生成时参考）
  cameraPreference?: CameraMovement;
  // 提示词后缀（追加到 firstFramePrompt / lastFramePrompt）
  promptSuffix?: string;
  // 视频提示词后缀
  videoPromptSuffix?: string;
}
