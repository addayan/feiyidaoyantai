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
  firstFramePrompt: string;
  lastFramePrompt: string;
  videoPrompt: string;
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

// ===== 项目（含元数据） =====
export interface Project {
  id: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  data: ProjectData;
  isExample?: boolean;
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