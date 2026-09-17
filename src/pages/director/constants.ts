import type {
  Composition,
  Lighting,
  CameraAngle,
  DepthOfField,
  Speed,
  Mood,
  Transition,
  DirectorSection,
} from '../../types';

// ===== 分镜细节字段枚举值（V2.1.0 第二层）=====
export const DETAIL_OPTIONS = {
  composition: ['三分法', '中心构图', '对称构图', '引导线构图', '框架构图', '对角线构图', '留白构图', '黄金分割', '层次构图', '其他'] as Composition[],
  lighting: ['自然光', '逆光', '侧光', '顶光', '底光', '柔光', '硬光', '伦勃朗光', '轮廓光', '散射光', '暖光', '冷光'] as Lighting[],
  cameraAngle: ['平视', '俯视', '仰视', '鸟瞰', '倾斜', '低角度', '过肩'] as CameraAngle[],
  depthOfField: ['浅景深', '深景深', '焦点转移', '区域对焦', '全景深'] as DepthOfField[],
  speed: ['正常速度', '慢动作', '快动作', '定格', '延时'] as Speed[],
  mood: ['庄重', '温馨', '紧张', '神秘', '激昂', '宁静', '欢快', '哀伤', '怀旧', '期待', '震撼', '平和'] as Mood[],
  transition: ['硬切', '淡入淡出', '叠化', '划像', '遮罩转场', '匹配剪辑', '跳切', '黑场', '白场'] as Transition[],
};

export const DETAIL_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  composition: { icon: '🎨', label: '构图', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  lighting: { icon: '💡', label: '光效', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  cameraAngle: { icon: '📐', label: '角度', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  depthOfField: { icon: '🔍', label: '景深', color: '#c084fc', bg: 'rgba(168,85,247,0.12)' },
  speed: { icon: '⚡', label: '速度', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  mood: { icon: '🎭', label: '情绪', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  transition: { icon: '🔀', label: '转场', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

export const SECTION_MAP: { key: DirectorSection; id: string }[] = [
  { key: 'story', id: 'section-story' },
  { key: 'characters', id: 'section-characters' },
  { key: 'scenes', id: 'section-scenes' },
  { key: 'shots', id: 'section-shots' },
  { key: 'sound', id: 'section-sound' },
  { key: 'culture', id: 'section-culture' },
  { key: 'submission', id: 'section-submission' },
  { key: 'social', id: 'section-social' },
];
