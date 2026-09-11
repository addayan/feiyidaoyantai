// AI 创作导演台 V3.0：非遗知识库数据结构

export type HeritageLevel =
  | 'creative-group'
  | 'national'
  | 'provincial'
  | 'municipal'
  | 'county'
  | 'custom';

export interface HeritageAIProfile {
  visualStrength: number;
  motionStrength: number;
  storyStrength: number;
  generationStability: number;
  culturalRisk: number;
  visualMechanisms: string[];
  suitableStories: string[];
  suitableStyles: string[];
  goodShots: string[];
  hardShots: string[];
  cautions: string[];
}

export interface HeritageEntry {
  slug: string;

  /**
   * 面向普通用户的创作大类名称，例如：剪纸、玉雕、高跷。
   * V3.0 前台主要以这一层作为创作入口。
   */
  name: string;

  /** 国家级非遗官方十大门类之一 */
  officialCategory: string;

  /**
   * creative-group 表示“创作大类”，不是某一个具体国家级项目。
   * 后续同步国家级/省级项目时使用 national/provincial 等。
   */
  level: HeritageLevel;

  summary: string;
  keywords: string[];
  typicalMaterials: string[];
  typicalActions: string[];

  /** 事实层：后续接官方数据库后填充 */
  projectCode?: string;
  region?: string;
  protectionUnit?: string;
  sourceUrl?: string;
  sourceLabel?: string;
  lastVerifiedAt?: string;

  /** AI 创作层：允许持续优化 */
  ai: HeritageAIProfile;
}
