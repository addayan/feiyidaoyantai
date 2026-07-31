import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DIRECTOR_SECTIONS, type DirectorSection, type Project } from '../types';
import type { GenerationRecord, Composition, Lighting, CameraAngle, DepthOfField, Speed, Mood, Transition } from '../types';
import { getProject, updateProject, createProject, addGenerationRecord as storeAddGenerationRecord } from '../store/projectStore';
import { getExampleProject } from '../data/examples';
import { DIRECTOR_STYLE_PRESETS } from '../data/directorStyles';
import type { DirectorStylePreset } from '../types';
import { copyText as doCopy } from '../utils/clipboard';
import { useAIHealth } from '../hooks/useAIHealth';
import { regenerateSection, regenerateShot, optimizeShot, optimizePrompt } from '../api/ai';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ===== 分镜细节字段枚举值（V2.1.0 第二层）=====
const DETAIL_OPTIONS = {
  composition: ['三分法', '中心构图', '对称构图', '引导线构图', '框架构图', '对角线构图', '留白构图', '黄金分割', '层次构图', '其他'] as Composition[],
  lighting: ['自然光', '逆光', '侧光', '顶光', '底光', '柔光', '硬光', '伦勃朗光', '轮廓光', '散射光', '暖光', '冷光'] as Lighting[],
  cameraAngle: ['平视', '俯视', '仰视', '鸟瞰', '倾斜', '低角度', '过肩'] as CameraAngle[],
  depthOfField: ['浅景深', '深景深', '焦点转移', '区域对焦', '全景深'] as DepthOfField[],
  speed: ['正常速度', '慢动作', '快动作', '定格', '延时'] as Speed[],
  mood: ['庄重', '温馨', '紧张', '神秘', '激昂', '宁静', '欢快', '哀伤', '怀旧', '期待', '震撼', '平和'] as Mood[],
  transition: ['硬切', '淡入淡出', '叠化', '划像', '遮罩转场', '匹配剪辑', '跳切', '黑场', '白场'] as Transition[],
};

const DETAIL_META: Record<string, { icon: string; label: string; color: string; bg: string }> = {
  composition: { icon: '🎨', label: '构图', color: '#a78bfa', bg: 'rgba(139,92,246,0.12)' },
  lighting: { icon: '💡', label: '光效', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
  cameraAngle: { icon: '📐', label: '角度', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
  depthOfField: { icon: '🔍', label: '景深', color: '#c084fc', bg: 'rgba(168,85,247,0.12)' },
  speed: { icon: '⚡', label: '速度', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  mood: { icon: '🎭', label: '情绪', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  transition: { icon: '🔀', label: '转场', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

// ===== 前端镜头细节补齐（V2.2.0 新增，与后端 fillMissingShotDetails 保持一致）=====
function fillMissingShotDetailsClient(shot: any, index: number, totalShots: number): void {
  if (!shot.composition) {
    const map: Record<string, string> = { '特写': '中心构图', '近景': '中心构图', '中景': '三分法', '中近景': '三分法', '全景': '层次构图', '远景': '引导线构图', '大远景': '黄金分割' };
    shot.composition = map[shot.shotSize] || '三分法';
  }
  if (!shot.lighting) {
    const d = String(shot.description || '');
    if (/黄昏|夕阳|暖光|温暖/.test(d)) shot.lighting = '暖光';
    else if (/逆光|剪影|轮廓/.test(d)) shot.lighting = '逆光';
    else if (/室内|工坊|屋内/.test(d)) shot.lighting = '柔光';
    else if (/室外|户外|自然/.test(d)) shot.lighting = '自然光';
    else if (/冷|蓝|夜/.test(d)) shot.lighting = '冷光';
    else shot.lighting = '柔光';
  }
  if (!shot.cameraAngle) {
    const map: Record<string, string> = { '固定': '平视', '推': '平视', '拉': '平视', '摇': '平视', '移': '平视', '跟': '平视', '升': '仰视', '降': '俯视', '航拍': '鸟瞰', '环绕': '低角度' };
    shot.cameraAngle = map[shot.camera] || '平视';
  }
  if (!shot.depthOfField) {
    const map: Record<string, string> = { '特写': '浅景深', '近景': '浅景深', '中景': '浅景深', '中近景': '浅景深', '全景': '深景深', '远景': '深景深', '大远景': '全景深' };
    shot.depthOfField = map[shot.shotSize] || '浅景深';
  }
  if (!shot.speed) {
    const d = String(shot.description || '');
    if (/慢|缓|凝/.test(d)) shot.speed = '慢动作';
    else if (/快|疾|飞/.test(d)) shot.speed = '快动作';
    else if (/定格|静止/.test(d)) shot.speed = '定格';
    else shot.speed = '正常速度';
  }
  if (!shot.mood) {
    const d = String(shot.description || '');
    if (/庄|肃|敬/.test(d)) shot.mood = '庄重';
    else if (/温|暖|柔/.test(d)) shot.mood = '温馨';
    else if (/紧|急|险/.test(d)) shot.mood = '紧张';
    else if (/神|秘|幽/.test(d)) shot.mood = '神秘';
    else if (/宁|静|安/.test(d)) shot.mood = '宁静';
    else if (/怀|旧|忆/.test(d)) shot.mood = '怀旧';
    else if (index >= totalShots - 2) shot.mood = '期待';
    else shot.mood = '庄重';
  }
  if (!shot.transition) {
    shot.transition = (index === totalShots - 1) ? '淡入淡出' : '硬切';
  }
}

// ===== 可拖拽镜头卡片包装组件（V2.1.0 导演台体验优化）=====
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
  };

  return (
    <div ref={setNodeRef} style={style}>
      {/* 拖拽手柄 - 绝对定位在卡片右上角 */}
      <div
        {...attributes}
        {...listeners}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          cursor: 'grab',
          zIndex: 10,
          padding: 4,
          borderRadius: 4,
          color: 'var(--text-muted)',
          opacity: 0.3,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.3'; }}
        title="拖拽排序"
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="4" cy="4" r="1.5" />
          <circle cx="8" cy="4" r="1.5" />
          <circle cx="12" cy="4" r="1.5" />
          <circle cx="4" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="12" cy="8" r="1.5" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      </div>
      {children}
    </div>
  );
}

const SECTION_MAP: { key: DirectorSection; id: string }[] = [
  { key: 'story', id: 'section-story' },
  { key: 'characters', id: 'section-characters' },
  { key: 'scenes', id: 'section-scenes' },
  { key: 'shots', id: 'section-shots' },
  { key: 'sound', id: 'section-sound' },
  { key: 'culture', id: 'section-culture' },
  { key: 'submission', id: 'section-submission' },
  { key: 'social', id: 'section-social' },
];

export default function Director() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<Project['data'] | null>(null);
  const [activeSection, setActiveSection] = useState<DirectorSection>('story');
  const [expandedShots, setExpandedShots] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');

  // AI 状态
  const { modelConfigured } = useAIHealth();
  const [aiLoading, setAiLoading] = useState<string | null>(null); // 当前正在操作的模块
  const [aiError, setAiError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 导演风格预设状态
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [showStylePanel, setShowStylePanel] = useState(false);

  // 分镜细节编辑状态（V2.1.0 第二层）
  const [editingDetail, setEditingDetail] = useState<{ shotIndex: number; field: string } | null>(null);

  // 批量操作状态（V2.1.0 导演台体验优化）
  const [selectedShots, setSelectedShots] = useState<Set<string>>(new Set());
  const [batchEditField, setBatchEditField] = useState<string | null>(null);
  const [batchEditValue, setBatchEditValue] = useState('');
  const [showComparePanel, setShowComparePanel] = useState(false);

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const mainRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 加载项目数据
  useEffect(() => {
    if (!projectId) return;
    const isExample = searchParams.get('mode') === 'example';
    const found = isExample ? getExampleProject(projectId) : getProject(projectId);
    // V2.2.0：补齐旧项目缺失的镜头细节字段
    if (found?.data?.shots) {
      found.data.shots = found.data.shots.map((s: any, i: number) => {
        const shot = { ...s };
        fillMissingShotDetailsClient(shot, i, found.data.shots.length);
        return shot;
      });
    }
    setProject(found);
    setData(found?.data ?? null);
  }, [projectId, searchParams]);

  // IntersectionObserver：滚动时自动高亮当前模块
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionKey = SECTION_MAP.find((s) => s.id === entry.target.id)?.key;
            if (sectionKey) setActiveSection(sectionKey);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    SECTION_MAP.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [project]);

  // 点击左侧导航，平滑滚动到对应 section
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // 拖拽传感器配置（V2.1.0 导演台体验优化）
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // 拖拽排序完成处理（V2.1.0 导演台体验优化）
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    if (!data || !project) return;

    const oldIndex = data.shots.findIndex((s) => s.id === active.id);
    const newIndex = data.shots.findIndex((s) => s.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const newShots = [...data.shots];
    const [moved] = newShots.splice(oldIndex, 1);
    newShots.splice(newIndex, 0, moved);

    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, shots: newShots };
    });
    if (!project.isExample) {
      updateProject(project.id, { shots: newShots });
    }
    setToast('镜头顺序已更新');
    setTimeout(() => setToast(null), 2000);
  }, [data, project]);

  // 批量操作：切换选中状态（V2.1.0 导演台体验优化）
  const toggleShotSelection = useCallback((shotId: string) => {
    setSelectedShots((prev) => {
      const next = new Set(prev);
      if (next.has(shotId)) next.delete(shotId);
      else next.add(shotId);
      return next;
    });
  }, []);

  // 批量操作：全选/取消全选（V2.1.0 导演台体验优化）
  const toggleSelectAllShots = useCallback(() => {
    if (!data) return;
    setSelectedShots((prev) => {
      if (prev.size === data.shots.length) {
        return new Set();
      }
      return new Set(data.shots.map((s) => s.id));
    });
  }, [data]);

  // 批量操作：删除选中镜头（V2.1.0 导演台体验优化）
  const handleBatchDelete = useCallback(() => {
    if (!data || !project || selectedShots.size === 0) return;
    const newShots = data.shots.filter((s) => !selectedShots.has(s.id));
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, shots: newShots };
    });
    if (!project.isExample) {
      updateProject(project.id, { shots: newShots });
    }
    setSelectedShots(new Set());
    setToast(`已删除 ${selectedShots.size} 个镜头`);
    setTimeout(() => setToast(null), 2000);
  }, [data, project, selectedShots]);

  // 批量操作：统一设置某个维度（V2.1.0 导演台体验优化）
  const handleBatchEdit = useCallback(() => {
    if (!data || !project || selectedShots.size === 0 || !batchEditField) return;
    const newShots = data.shots.map((s) =>
      selectedShots.has(s.id) ? { ...s, [batchEditField]: batchEditValue } : s
    );
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, shots: newShots };
    });
    if (!project.isExample) {
      updateProject(project.id, { shots: newShots });
    }
    setBatchEditField(null);
    setBatchEditValue('');
    setSelectedShots(new Set());
    setToast(`已批量设置 ${selectedShots.size} 个镜头`);
    setTimeout(() => setToast(null), 2000);
  }, [data, project, selectedShots, batchEditField, batchEditValue]);

  // 切换提示词展开/收起
  const togglePrompt = useCallback((shotId: string) => {
    setExpandedShots((prev) => {
      const next = new Set(prev);
      if (next.has(shotId)) next.delete(shotId);
      else next.add(shotId);
      return next;
    });
  }, []);

  // 复制文本
  const handleCopy = useCallback(async (text: string, id: string) => {
    const ok = await doCopy(text);
    if (ok) {
      setCopiedId(id);
      setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    }
  }, []);

  // 复制全部提示词
  const copyAllPrompts = useCallback(() => {
    if (!data) return;
    const lines: string[] = [];
    data.shots.forEach((shot, i) => {
      lines.push(`【镜头 ${i + 1}】`);
      lines.push(`首帧提示词：${shot.firstFramePrompt}`);
      lines.push(`尾帧提示词：${shot.lastFramePrompt}`);
      lines.push(`视频提示词：${shot.videoPrompt}`);
      if (i < data.shots.length - 1) lines.push('');
    });
    handleCopy(lines.join('\n'), 'all-prompts');
  }, [data, handleCopy]);

  // 复制完整参赛说明
  const copyFullSubmission = useCallback(() => {
    if (!data) return;
    const sn = data.submissionNote;
    const lines = [
      `作品名称：${sn.title}`,
      '',
      `作品简介：${sn.introduction}`,
      '',
      `创意说明：${sn.creativeNote}`,
      '',
      `技术说明：${sn.techNote}`,
      '',
      `AI 使用说明：${sn.aiUsageNote}`,
      '',
      `文化价值：${sn.culturalValue}`,
      '',
      `适合赛道：${sn.suitableTrack}`,
      '',
      `作品规格建议：${sn.specSuggestion}`,
    ];
    handleCopy(lines.join('\n'), 'full-submission');
  }, [data, handleCopy]);

  // 编辑
  const startEdit = useCallback((fieldId: string, currentValue: string) => {
    setEditingField(fieldId);
    setEditDraft(currentValue);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingField(null);
    setEditDraft('');
  }, []);

  // 更新分镜细节字段（V2.1.0 第二层：点击标签下拉选择）
  const updateShotDetail = useCallback((shotIndex: number, field: string, value: string) => {
    if (!data || !project) return;
    const newShots = data.shots.map((s, idx) =>
      idx === shotIndex ? { ...s, [field]: value } : s
    );
    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, shots: newShots };
    });
    if (!project.isExample) {
      updateProject(project.id, { shots: newShots });
    }
    setEditingDetail(null);
  }, [data, project]);

  const saveEdit = useCallback((fieldId: string, path: string[]) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev));
      let target: any = next;
      for (let i = 0; i < path.length - 1; i++) {
        target = target[path[i]];
      }
      target[path[path.length - 1]] = editDraft;
      if (project && !project.isExample) {
        updateProject(project.id, next);
      }
      return next;
    });
    setEditingField(null);
    setEditDraft('');
  }, [editDraft, project]);

  // 导出 Markdown
  const exportMarkdown = useCallback(() => {
    if (!data) return;
    const d = data;

    const md: string[] = [];
    md.push(`# ${d.title}`);
    md.push('');
    md.push(`**非遗类型：** ${d.heritageType}｜**风格：** ${d.style}｜**时长：** ${d.duration}`);
    md.push('');

    md.push('## 一句话创意');
    md.push('');
    md.push(d.tagline);
    md.push('');

    md.push('## 故事梗概');
    md.push('');
    md.push(d.story.synopsis);
    md.push('');

    md.push('## 角色设定');
    md.push('');
    d.characters.forEach((char, i) => {
      md.push(`### ${i + 1}. ${char.name}`);
      md.push(`- **年龄：** ${char.age}`);
      md.push(`- **身份：** ${char.identity}`);
      md.push(`- **外貌：** ${char.appearance}`);
      md.push(`- **服装：** ${char.costume}`);
      md.push(`- **性格：** ${char.personality}`);
      md.push(`- **关系：** ${char.relationship}`);
      md.push(`- **道具：** ${char.props}`);
      md.push(`- **一致性锚点：** ${char.anchorPoint}`);
      md.push('');
    });

    md.push('## 场景设定');
    md.push('');
    d.scenes.forEach((scene, i) => {
      md.push(`### ${i + 1}. ${scene.name}`);
      md.push(`- **时间：** ${scene.time}`);
      md.push(`- **地点：** ${scene.location}`);
      md.push(`- **氛围：** ${scene.atmosphere}`);
      md.push(`- **核心视觉元素：** ${scene.coreVisualElements}`);
      md.push(`- **允许元素：** ${scene.allowedElements}`);
      md.push(`- **避免元素：** ${scene.avoidElements}`);
      md.push(`- **色彩建议：** ${scene.colorSuggestion}`);
      md.push(`- **声音元素：** ${scene.soundElements}`);
      md.push('');
    });

    md.push('## 分镜导演台（8 镜头）');
    md.push('');
    d.shots.forEach((shot, i) => {
      md.push(`### 镜头 ${i + 1}`);
      md.push(`- **场景：** ${shot.scene}`);
      md.push(`- **景别：** ${shot.shotSize}`);
      md.push(`- **运镜：** ${shot.camera}`);
      md.push(`- **时长：** ${shot.duration}`);
      md.push(`- **描述：** ${shot.description}`);
      md.push('');
      md.push('#### 首帧图片提示词');
      md.push(shot.firstFramePrompt);
      md.push('');
      md.push('#### 尾帧图片提示词');
      md.push(shot.lastFramePrompt);
      md.push('');
      md.push('#### 视频生成提示词');
      md.push(shot.videoPrompt);
      md.push('');
      md.push(`**AI 视频可生成性评分：${shot.generatabilityScore} / 100**`);
      md.push('');
      md.push('| 检查项 | 状态 | 说明 |');
      md.push('|--------|------|------|');
      shot.generatabilityChecks.forEach(check => {
        const status = check.status === 'pass' ? '✓' : check.status === 'warn' ? '△' : '✗';
        md.push(`| ${check.label} | ${status} | ${check.detail} |`);
      });
      md.push('');
    });

    md.push('## 声音设计');
    md.push('');
    md.push(`**BGM：** ${d.soundDesign.bgm}`);
    md.push('');
    md.push(`**环境音：** ${d.soundDesign.ambientSound}`);
    md.push('');
    md.push(`**人声：** ${d.soundDesign.voice}`);
    md.push('');
    md.push(`**音效：** ${d.soundDesign.soundEffects}`);
    md.push('');

    md.push('## 文化表达检查');
    md.push('');
    md.push(`**综合评分：${d.cultureCheck.overallScore} / 100**`);
    md.push('');
    md.push('| 检查项 | 状态 |');
    md.push('|--------|------|');
    d.cultureCheck.items.forEach(item => {
      md.push(`| ${item.label} | ${item.status} |`);
    });
    md.push('');
    md.push('**注意事项：**');
    md.push(d.cultureCheck.notes);
    md.push('');
    md.push('**优化建议：**');
    md.push(d.cultureCheck.suggestions);
    md.push('');
    if (d.cultureCheck.disclaimer) {
      md.push('**免责声明：**');
      md.push(d.cultureCheck.disclaimer);
      md.push('');
    }

    md.push('## 参赛说明');
    md.push('');
    md.push(`**作品名称：** ${d.submissionNote.title}`);
    md.push('');
    md.push(`**作品简介：** ${d.submissionNote.introduction}`);
    md.push('');
    md.push(`**创意说明：** ${d.submissionNote.creativeNote}`);
    md.push('');
    md.push(`**技术说明：** ${d.submissionNote.techNote}`);
    md.push('');
    md.push(`**AI 使用说明：** ${d.submissionNote.aiUsageNote}`);
    md.push('');
    md.push(`**文化价值：** ${d.submissionNote.culturalValue}`);
    md.push('');
    md.push(`**推荐赛道：** ${d.submissionNote.suitableTrack}`);
    md.push('');
    md.push(`**作品规格建议：** ${d.submissionNote.specSuggestion}`);
    md.push('');

    md.push('## 发布文案');
    md.push('');
    md.push('### 抖音文案');
    md.push(d.socialPosts.douyin);
    md.push('');
    md.push('### 小红书文案');
    md.push(d.socialPosts.xiaohongshu);
    md.push('');

    md.push('---');
    md.push('');
    md.push('*由 非遗影像工坊 2.0 生成*');
    md.push('');

    const blob = new Blob([md.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${d.title.replace(/[\\/:*?"<>|]/g, '')}-非遗影像工坊.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  // ===== AI 辅助函数 =====

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 导出项目为 JSON（V2.2.0 新增）
  const exportProjectJSON = useCallback(() => {
    if (!project) return;
    const exportData = {
      ...project,
      _exportMeta: {
        app: '非遗影像工坊',
        version: 'V2.2.0',
        exportedAt: new Date().toISOString(),
        exportedBy: '阿岩',
      },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(project.data.title || '未命名项目').replace(/[\\/:*?"<>|]/g, '')}-非遗影像工坊.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('项目已导出为 JSON 文件');
  }, [project, showToast]);

  // 导入项目 JSON（V2.2.0 新增）
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data || !parsed.data.title) {
          showToast('导入失败：文件格式不正确');
          return;
        }
        const now = new Date().toISOString();
        const newProject: Project = {
          ...parsed,
          id: `proj-${Date.now()}`,
          slug: `proj-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          isExample: false,
        };
        delete (newProject as any)._exportMeta;
        createProject(newProject);
        showToast(`项目「${newProject.data.title}」导入成功`);
        setTimeout(() => navigate('/director/' + newProject.id), 500);
      } catch (err) {
        showToast('导入失败：JSON 解析错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [navigate, showToast]);

  // 应用导演风格预设到所有镜头
  const applyStylePreset = useCallback((preset: DirectorStylePreset) => {
    if (!data || !project) return;
    setSelectedStyleId(preset.id);
    setShowStylePanel(false);

    const newShots = data.shots.map((shot) => ({
      ...shot,
      composition: preset.composition ?? shot.composition,
      lighting: preset.lighting ?? shot.lighting,
      cameraAngle: preset.cameraAngle ?? shot.cameraAngle,
      depthOfField: preset.depthOfField ?? shot.depthOfField,
      speed: preset.speed ?? shot.speed,
      mood: preset.mood ?? shot.mood,
      transition: preset.transition ?? shot.transition,
      // 追加风格后缀到提示词
      firstFramePrompt: preset.promptSuffix
        ? `${shot.firstFramePrompt}。${preset.promptSuffix}`
        : shot.firstFramePrompt,
      lastFramePrompt: preset.promptSuffix
        ? `${shot.lastFramePrompt}。${preset.promptSuffix}`
        : shot.lastFramePrompt,
      videoPrompt: preset.videoPromptSuffix
        ? `${shot.videoPrompt}。${preset.videoPromptSuffix}`
        : shot.videoPrompt,
    }));

    setData((prev) => {
      if (!prev) return prev;
      return { ...prev, shots: newShots };
    });

    if (!project.isExample) {
      updateProject(project.id, { shots: newShots });
    }

    showToast(`已应用「${preset.name}」，所有镜头参数已更新`);
  }, [data, project, showToast]);

  const addGenerationRecord = useCallback((type: GenerationRecord['type'], target?: string) => {
    if (!project) return;
    const record: GenerationRecord = {
      id: `gen-${Date.now()}`,
      type,
      target,
      createdAt: new Date().toISOString(),
    };
    setProject((prev) => {
      if (!prev) return prev;
      const history = prev.generationHistory ? [...prev.generationHistory, record] : [record];
      return { ...prev, generationHistory: history };
    });
    if (!project.isExample) {
      storeAddGenerationRecord(project.id, record);
    }
  }, [project]);

  // 重新生成某个 section（故事/角色/场景/声音设计/参赛说明/发布文案）
  const handleRegenerateSection = useCallback(async (sectionType: string) => {
    if (!data || !project || !modelConfigured || aiLoading !== null) return;

    // sectionType 到 data 字段的映射
    const sectionFieldMap: Record<string, string> = {
      story: 'story',
      characters: 'characters',
      scenes: 'scenes',
      soundDesign: 'soundDesign',
      submissionNote: 'submissionNote',
      socialPosts: 'socialPosts',
    };

    const fieldName = sectionFieldMap[sectionType];
    if (!fieldName) return;

    setAiLoading(sectionType);
    setAiError(null);

    // 保留旧内容以便回滚
    const oldContent = JSON.parse(JSON.stringify((data as any)[fieldName]));

    try {
      const result = await regenerateSection({
        project: data,
        sectionType,
      });

      // 更新 data 对应模块
      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        (next as any)[fieldName] = result[fieldName] ?? result;
        // 如果是 story，同步更新 title 和 tagline
        if (sectionType === 'story' && result.title) {
          next.title = result.title;
          next.tagline = result.tagline ?? next.tagline;
        }
        return next;
      });

      // 自动保存
      if (!project.isExample) {
        updateProject(project.id, { [fieldName]: result[fieldName] ?? result });
      }

      addGenerationRecord('regenerate-section', sectionType);
      showToast(`${sectionType === 'story' ? '故事' : sectionType === 'characters' ? '角色' : sectionType === 'scenes' ? '场景' : sectionType === 'soundDesign' ? '声音设计' : sectionType === 'submissionNote' ? '参赛说明' : '发布文案'} 重新生成成功`);
    } catch (err: any) {
      // 恢复旧内容
      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        (next as any)[fieldName] = oldContent;
        return next;
      });
      setAiError(err?.message || '重新生成失败，原内容已保留');
      showToast('重新生成失败，原内容已保留');
    } finally {
      setAiLoading(null);
    }
  }, [data, project, modelConfigured, aiLoading, addGenerationRecord, showToast]);

  // 重新生成某个镜头
  const handleRegenerateShot = useCallback(async (shotIndex: number) => {
    if (!data || !project || !modelConfigured || aiLoading !== null) return;

    setAiLoading(`shot-${shotIndex}`);
    setAiError(null);

    // 保留旧 shot
    const oldShot = JSON.parse(JSON.stringify(data.shots[shotIndex]));

    try {
      const result = await regenerateShot({
        project: data,
        shotIndex,
      });

      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex] = result;
        return next;
      });

      if (!project.isExample) {
        const newShots = data.shots.map((s, idx) => idx === shotIndex ? result : s);
        updateProject(project.id, { shots: newShots });
      }

      addGenerationRecord('regenerate-shot', `镜头 ${shotIndex + 1}`);
      showToast(`镜头 ${shotIndex + 1} 重新生成成功`);
    } catch (err: any) {
      // 恢复旧 shot
      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex] = oldShot;
        return next;
      });
      setAiError(err?.message || '重新生成失败，原内容已保留');
      showToast('重新生成失败，原内容已保留');
    } finally {
      setAiLoading(null);
    }
  }, [data, project, modelConfigured, aiLoading, addGenerationRecord, showToast]);

  // 优化某个镜头
  const handleOptimizeShot = useCallback(async (shotIndex: number) => {
    if (!data || !project || !modelConfigured || aiLoading !== null) return;

    setAiLoading(`optimize-shot-${shotIndex}`);
    setAiError(null);

    const oldShot = JSON.parse(JSON.stringify(data.shots[shotIndex]));

    try {
      const result = await optimizeShot({
        project: data,
        shotIndex,
        optimizeType: '综合优化',
      });

      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex] = result;
        return next;
      });

      if (!project.isExample) {
        const newShots = data.shots.map((s, idx) => idx === shotIndex ? result : s);
        updateProject(project.id, { shots: newShots });
      }

      addGenerationRecord('optimize-shot', `镜头 ${shotIndex + 1}`);
      showToast(`镜头 ${shotIndex + 1} 优化成功`);
    } catch (err: any) {
      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex] = oldShot;
        return next;
      });
      setAiError(err?.message || '优化失败，原内容已保留');
      showToast('优化失败，原内容已保留');
    } finally {
      setAiLoading(null);
    }
  }, [data, project, modelConfigured, aiLoading, addGenerationRecord, showToast]);

  // 优化某个提示词字段
  const handleOptimizePrompt = useCallback(async (shotIndex: number, promptField: 'firstFramePrompt' | 'lastFramePrompt' | 'videoPrompt') => {
    if (!data || !project || !modelConfigured || aiLoading !== null) return;

    setAiLoading(`optimize-prompt-${shotIndex}-${promptField}`);
    setAiError(null);

    const oldValue = data.shots[shotIndex][promptField];

    try {
      const result = await optimizePrompt({
        project: data,
        shotIndex,
        promptField,
        optimizeType: '综合优化',
      });

      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex][promptField] = result;
        return next;
      });

      if (!project.isExample) {
        const newShots = data.shots.map((s, idx) => {
          if (idx !== shotIndex) return s;
          return { ...s, [promptField]: result };
        });
        updateProject(project.id, { shots: newShots });
      }

      const fieldLabel = promptField === 'firstFramePrompt' ? '首帧' : promptField === 'lastFramePrompt' ? '尾帧' : '视频';
      addGenerationRecord('optimize-prompt', `镜头 ${shotIndex + 1} ${fieldLabel}提示词`);
      showToast(`镜头 ${shotIndex + 1} ${fieldLabel}提示词优化成功`);
    } catch (err: any) {
      // 恢复旧值
      setData((prev) => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        next.shots[shotIndex][promptField] = oldValue;
        return next;
      });
      setAiError(err?.message || '提示词优化失败，原内容已保留');
      showToast('提示词优化失败，原内容已保留');
    } finally {
      setAiLoading(null);
    }
  }, [data, project, modelConfigured, aiLoading, addGenerationRecord, showToast]);

  // AI 按钮统一禁用判断
  const aiDisabled = !modelConfigured || aiLoading !== null;
  const aiTooltip = !modelConfigured
    ? '需要配置火山方舟 API'
    : aiLoading !== null
      ? 'AI 正在处理中...'
      : '点击执行';

  if (!project || !data) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>未找到项目数据</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>返回首页</button>
        </div>
      </div>
    );
  }

  const isExample = project.isExample;

  return (
    <div className="page">
      <div
        ref={mainRef}
        style={{
          display: 'flex',
          maxWidth: 'var(--container-max)',
          margin: '0 auto',
          padding: '24px 24px 80px',
          gap: 32,
        }}
      >
        {/* 左侧 sticky 导航 */}
        <aside
          style={{
            position: 'sticky',
            top: 'calc(var(--nav-height) + 24px)',
            width: 'var(--sidebar-width)',
            alignSelf: 'flex-start',
            flexShrink: 0,
            maxHeight: 'calc(100vh - var(--nav-height) - 48px)',
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              padding: '16px 16px 12px',
              borderBottom: '1px solid var(--border)',
              marginBottom: 12,
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
              {isExample ? '示例案例' : '已自动保存'}
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {data.title}
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
              {data.tagline}
            </p>
          </div>

          <nav>
            {DIRECTOR_SECTIONS.map((s) => (
              <button
                key={s.key}
                onClick={() => scrollToSection(SECTION_MAP.find((m) => m.key === s.key)!.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 16px',
                  textAlign: 'left',
                  background: activeSection === s.key ? 'var(--gold-dim)' : 'transparent',
                  color: activeSection === s.key ? 'var(--gold)' : 'var(--text-secondary)',
                  borderLeft: activeSection === s.key ? '3px solid var(--gold)' : '3px solid transparent',
                  fontSize: 13,
                  transition: 'all 0.2s',
                  borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                }}
              >
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: activeSection === s.key ? 'var(--gold)' : 'var(--text-muted)',
                    width: 22,
                    flexShrink: 0,
                  }}
                >
                  {s.num}
                </span>
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* 右侧完整长页面 */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {/* 顶部信息栏 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 32,
              padding: '14px 20px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: 'var(--success)',
                }}
              >
                ✓ 生成完成
              </span>
              <span style={{ fontWeight: 600, fontSize: 17 }}>{data.title}</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <span className="tag">{data.heritageType}</span>
                <span className="tag tag-teal">{data.style}</span>
                <span className="tag">{data.duration}</span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button className="btn btn-sm btn-ghost" onClick={() => navigate('/create')}>继续创作</button>
              <button className="btn btn-sm btn-secondary" onClick={exportMarkdown}>导出 Markdown</button>
              <button className="btn btn-sm btn-secondary" onClick={exportProjectJSON} title="导出完整项目数据（含分镜、角色、场景）为 JSON 文件，可备份或分享">导出项目</button>
              <button className="btn btn-sm btn-ghost" onClick={() => fileInputRef.current?.click()} title="从 JSON 文件导入项目">导入项目</button>
              <button className="btn btn-sm btn-teal" onClick={copyAllPrompts}>复制全部提示词</button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                onChange={handleFileImport}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* ===== 01 创意与故事 ===== */}
          <section id="section-story" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>01</span>创意与故事
            </h2>
            <div className="card">
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>作品名称</label>
                <p style={{ fontSize: 20, fontWeight: 600 }}>{data.story.title}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>一句话创意</label>
                <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>{data.story.tagline}</p>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 6, display: 'block' }}>故事梗概</label>
                {editingField === 'story-synopsis' ? (
                  <div>
                    <textarea
                      autoFocus
                      value={editDraft}
                      onChange={(e) => setEditDraft(e.target.value)}
                      style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.8, marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => saveEdit('story-synopsis', ['story', 'synopsis'])}>保存</button>
                      <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{data.story.synopsis}</p>
                )}
              </div>
              <div className="divider" />
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <button className="btn btn-sm btn-ghost" onClick={() => startEdit('story-synopsis', data.story.synopsis)}>编辑</button>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={aiDisabled}
                  title={aiTooltip}
                  onClick={() => handleRegenerateSection('story')}
                  style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {aiLoading === 'story' ? '生成中...' : 'AI 重新生成'}
                </button>
              </div>
            </div>
          </section>

          {/* ===== 02 角色设定 ===== */}
          <section id="section-characters" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>02</span>角色设定
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.characters.map((char, i) => (
                <div key={i} className="card">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {([
                      ['姓名', char.name, 'name'],
                      ['年龄', char.age, 'age'],
                      ['身份', char.identity, 'identity'],
                      ['外貌', char.appearance, 'appearance'],
                      ['服装', char.costume, 'costume'],
                      ['核心性格', char.personality, 'personality'],
                      ['人物关系', char.relationship, 'relationship'],
                      ['主要道具', char.props, 'props'],
                      ['一致性锚点', char.anchorPoint, 'anchorPoint'],
                    ] as const).map(([label, value, fieldKey]) => {
                      const fieldId = `char-${i}-${fieldKey}`;
                      return (
                        <div key={label}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{label}</span>
                            <button className="btn btn-sm btn-ghost" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => startEdit(fieldId, value)}>编辑</button>
                          </div>
                          {editingField === fieldId ? (
                            <div>
                              <textarea
                                autoFocus
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(fieldId, ['characters', String(i), fieldKey])}>保存</button>
                                <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{value}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`char-${i}-name`, char.name)}>编辑角色</button>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={aiDisabled}
                      title={aiTooltip}
                      onClick={() => handleRegenerateSection('characters')}
                      style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {aiLoading === 'characters' ? '生成中...' : '重新生成角色'}
                    </button>
                  </div>
                </div>
              ))}
              <p style={{ fontSize: 12, color: 'var(--text-muted)', padding: '0 4px' }}>
                本 Demo 中人物为虚构创作角色，不对应现实中的具体传承人。如引用真实人物、工坊、作品或资料，应注明来源并确认授权。
              </p>
            </div>
          </section>

          {/* ===== 03 场景设定 ===== */}
          <section id="section-scenes" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>03</span>场景设定
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.scenes.map((scene, i) => (
                <div key={i} className="card">
                  <h4 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--gold)' }}>{scene.name}</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {([
                      ['时间', scene.time, 'time'],
                      ['地点', scene.location, 'location'],
                      ['氛围', scene.atmosphere, 'atmosphere'],
                      ['核心视觉元素', scene.coreVisualElements, 'coreVisualElements'],
                      ['允许出现的元素', scene.allowedElements, 'allowedElements'],
                      ['避免出现的内容', scene.avoidElements, 'avoidElements'],
                      ['色彩建议', scene.colorSuggestion, 'colorSuggestion'],
                      ['声音元素', scene.soundElements, 'soundElements'],
                    ] as const).map(([label, value, fieldKey]) => {
                      const fieldId = `scene-${i}-${fieldKey}`;
                      return (
                        <div key={label}>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>{label}</span>
                            <button className="btn btn-sm btn-ghost" style={{ padding: '2px 6px', fontSize: 11 }} onClick={() => startEdit(fieldId, value)}>编辑</button>
                          </div>
                          {editingField === fieldId ? (
                            <div>
                              <textarea
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}
                              />
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(fieldId, ['scenes', String(i), fieldKey])}>保存</button>
                                <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                              </div>
                            </div>
                          ) : (
                            <div style={{ fontSize: 14 }}>{value}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="divider" />
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`scene-${i}-name`, scene.name)}>编辑</button>
                    <button
                      className="btn btn-sm btn-secondary"
                      disabled={aiDisabled}
                      title={aiTooltip}
                      onClick={() => handleRegenerateSection('scenes')}
                      style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {aiLoading === 'scenes' ? '生成中...' : '重新生成场景'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ===== 04 分镜导演台 ===== */}
          <section id="section-shots" className="director-section" style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                <span style={{ color: 'var(--gold)', marginRight: 8 }}>04</span>分镜导演台
              </h2>
              {/* 批量操作工具栏（V2.1.0 导演台体验优化） */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {selectedShots.size > 0 && (
                  <>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingRight: 4 }}>
                      已选 {selectedShots.size} 个
                    </span>
                    <button className="btn btn-sm btn-ghost" onClick={toggleSelectAllShots}>
                      {selectedShots.size === data.shots.length ? '取消全选' : '全选'}
                    </button>
                    {selectedShots.size >= 2 && (
                      <button className="btn btn-sm btn-ghost" onClick={() => setShowComparePanel(true)}>
                        对比
                      </button>
                    )}
                    <button className="btn btn-sm btn-ghost" onClick={() => setBatchEditField('composition')}>
                      批量编辑
                    </button>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={handleBatchDelete}
                      style={{ color: 'var(--error)' }}
                    >
                      删除
                    </button>
                    <button className="btn btn-sm btn-ghost" onClick={() => setSelectedShots(new Set())}>
                      取消
                    </button>
                  </>
                )}
                {/* 导演风格预设选择器 */}
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => setShowStylePanel(!showStylePanel)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {selectedStyleId
                    ? `${DIRECTOR_STYLE_PRESETS.find((s) => s.id === selectedStyleId)?.icon ?? ''} ${DIRECTOR_STYLE_PRESETS.find((s) => s.id === selectedStyleId)?.name ?? '风格'}`
                    : '🎬 导演风格预设'}
                </button>
              </div>
            </div>

            {/* 风格预设面板 */}
            {showStylePanel && (
              <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }}>选择导演风格预设</h4>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>一键应用到所有镜头</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                  {DIRECTOR_STYLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyStylePreset(preset)}
                      style={{
                        padding: 14,
                        borderRadius: 'var(--radius-md)',
                        border: selectedStyleId === preset.id
                          ? '2px solid var(--gold)'
                          : '1px solid var(--border)',
                        background: selectedStyleId === preset.id ? 'var(--gold-dim)' : 'var(--bg-input)',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{preset.icon}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{preset.name}</span>
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{preset.description}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
                        {preset.composition && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(139,92,246,0.12)', color: '#a78bfa' }}>{preset.composition}</span>}
                        {preset.lighting && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>{preset.lighting}</span>}
                        {preset.mood && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 8, background: 'rgba(244,114,182,0.12)', color: '#f472b6' }}>{preset.mood}</span>}
                      </div>
                    </button>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
                  风格预设基于电影流派和美学特征，不使用导演姓名，避免版权风险。应用后所有镜头的7个维度参数将自动填充，提示词将追加风格描述后缀。
                </p>
              </div>
          )}

            {/* 批量编辑面板（V2.1.0 导演台体验优化） */}
            {batchEditField && (
              <div className="card" style={{ padding: 16, marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>
                  批量编辑：{DETAIL_META[batchEditField]?.label}
                </span>
                <select
                  value={batchEditValue}
                  onChange={(e) => setBatchEditValue(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  <option value="">选择{DETAIL_META[batchEditField]?.label}...</option>
                  {(DETAIL_OPTIONS as any)[batchEditField]?.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <button className="btn btn-sm btn-primary" onClick={handleBatchEdit} disabled={!batchEditValue}>应用</button>
                <button className="btn btn-sm btn-ghost" onClick={() => { setBatchEditField(null); setBatchEditValue(''); }}>取消</button>
              </div>
            )}

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={data.shots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {data.shots.map((shot, i) => {
                    const isExpanded = expandedShots.has(shot.id);
                    const isLast = i === data.shots.length - 1;
                    return (
                      <SortableItem key={shot.id} id={shot.id}>
                    <div className="card" style={{ padding: 20 }}>
                    {/* 镜头头部 + 缩略图占位区 */}
                    <div style={{ display: 'flex', gap: 14, marginBottom: 12 }}>
                      {/* 左侧：缩略图占位区 + 批量复选框（V2.1.0 导演台体验优化） */}
                      <div style={{ position: 'relative', flexShrink: 0 }}>
                        <div
                          style={{
                            width: 120,
                            height: 72,
                            borderRadius: 'var(--radius-sm)',
                            background: selectedShots.has(shot.id) ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.03)',
                            border: selectedShots.has(shot.id) ? '1px dashed rgba(139,92,246,0.5)' : '1px dashed var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            cursor: 'default',
                            overflow: 'hidden',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ fontSize: 22, opacity: 0.3 }}>🎬</span>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.5 }}>首帧预览</span>
                        </div>
                        {/* 批量复选框 */}
                        <input
                          type="checkbox"
                          checked={selectedShots.has(shot.id)}
                          onChange={() => toggleShotSelection(shot.id)}
                          style={{
                            position: 'absolute',
                            top: 6,
                            right: 6,
                            width: 18,
                            height: 18,
                            cursor: 'pointer',
                            zIndex: 5,
                            accentColor: 'var(--gold)',
                          }}
                          title="选中进行批量操作"
                        />
                      </div>

                      {/* 右侧：镜头信息 */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: '50%',
                                background: 'var(--gold-dim)',
                                color: 'var(--gold)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 13,
                                fontWeight: 700,
                                flexShrink: 0,
                              }}
                            >
                              {i + 1}
                            </span>
                            <div>
                              <div style={{ display: 'flex', gap: 5, marginBottom: 2, flexWrap: 'wrap' }}>
                                <span className="tag" style={{ fontSize: 11 }}>{shot.shotSize}</span>
                                <span className="tag tag-teal" style={{ fontSize: 11 }}>{shot.camera}</span>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{shot.duration}</span>
                              </div>
                              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shot.scene}</span>
                            </div>
                          </div>
                          <div
                            style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-sm)',
                              background: shot.generatabilityScore >= 85 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                              color: shot.generatabilityScore >= 85 ? 'var(--success)' : 'var(--warning)',
                              fontSize: 13,
                              fontWeight: 600,
                              flexShrink: 0,
                            }}
                          >
                            {shot.generatabilityScore}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 分镜规格标签栏 (V2.1.0 第二层：可点击编辑) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px', marginBottom: 12 }}>
                      {Object.entries(DETAIL_META).map(([field, meta]) => {
                        const value = (shot as any)[field];
                        const isEditing = editingDetail?.shotIndex === i && editingDetail.field === field;
                        return (
                          <div key={field} style={{ position: 'relative' }}>
                            {isEditing ? (
                              <select
                                autoFocus
                                value={value || ''}
                                onChange={(e) => updateShotDetail(i, field, e.target.value)}
                                onBlur={() => setEditingDetail(null)}
                                style={{
                                  fontSize: 12,
                                  padding: '3px 8px',
                                  borderRadius: 10,
                                  border: `1px solid ${meta.color}`,
                                  background: 'var(--bg-input)',
                                  color: meta.color,
                                  cursor: 'pointer',
                                  outline: 'none',
                                }}
                              >
                                {!value && <option value="">选择{meta.label}</option>}
                                {(DETAIL_OPTIONS as any)[field].map((opt: string) => (
                                  <option key={opt} value={opt}>{opt}</option>
                                ))}
                              </select>
                            ) : (
                              <button
                                onClick={() => setEditingDetail({ shotIndex: i, field })}
                                style={{
                                  fontSize: 12,
                                  padding: '3px 10px',
                                  borderRadius: 10,
                                  border: '1px solid transparent',
                                  background: value ? meta.bg : 'rgba(255,255,255,0.02)',
                                  color: value ? meta.color : 'var(--text-muted)',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s',
                                  opacity: value ? 1 : 0.5,
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.borderColor = meta.color + '40'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.opacity = value ? '1' : '0.5'; e.currentTarget.style.borderColor = 'transparent'; }}
                                title={`点击编辑${meta.label}`}
                              >
                                <span style={{ fontSize: 10 }}>{meta.icon}</span>
                                {value ? `${meta.label} · ${value}` : `+ ${meta.label}`}
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* 画面描述 */}
                    {editingField === `shot-${shot.id}-description` ? (
                      <div style={{ marginBottom: 12 }}>
                        <textarea
                        autoFocus
                        value={editDraft}
                        onChange={(e) => setEditDraft(e.target.value)}
                        style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 15, lineHeight: 1.7, marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => saveEdit(`shot-${shot.id}-description`, ['shots', String(i), 'description'])}>保存</button>
                          <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
                        {shot.description}
                      </p>
                    )}

                    {/* 可生成性检查 */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      {shot.generatabilityChecks.map((check, ci) => (
                        <span
                          key={ci}
                          style={{
                            fontSize: 12,
                            padding: '2px 8px',
                            borderRadius: 10,
                            background:
                              check.status === 'pass'
                                ? 'rgba(52,211,153,0.1)'
                                : check.status === 'warn'
                                  ? 'rgba(251,191,36,0.1)'
                                  : 'rgba(248,113,113,0.1)',
                            color:
                              check.status === 'pass'
                                ? 'var(--success)'
                                : check.status === 'warn'
                                  ? 'var(--warning)'
                                  : 'var(--error)',
                          }}
                        >
                          {check.status === 'pass' ? '✓' : check.status === 'warn' ? '△' : '✗'} {check.label}
                        </span>
                      ))}
                    </div>

                    {/* 操作按钮 */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`shot-${shot.id}-description`, shot.description)}>编辑</button>
                      <button
                        className="btn btn-sm btn-ghost"
                        disabled={aiDisabled}
                        title={aiTooltip}
                        onClick={() => handleRegenerateShot(i)}
                        style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {aiLoading === `shot-${i}` ? '生成中...' : '重新生成'}
                      </button>
                      <button
                        className="btn btn-sm btn-teal"
                        disabled={aiDisabled}
                        title={aiTooltip}
                        onClick={() => handleOptimizeShot(i)}
                        style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {aiLoading === `optimize-shot-${i}` ? '优化中...' : 'AI 优化'}
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => togglePrompt(shot.id)}
                      >
                        {isExpanded ? '收起 AI 提示词' : '查看 AI 提示词'}
                      </button>
                    </div>

                    {/* 展开的提示词 */}
                    {isExpanded && (
                      <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                        {/* 镜头参数概览表 (V2.1.0 第二层新增) */}
                        <div style={{ marginBottom: 16, padding: 12, borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)' }}>
                          <h5 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--text-muted)' }}>镜头参数概览</h5>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                            {Object.entries(DETAIL_META).map(([field, meta]) => {
                              const val = (shot as any)[field];
                              const isEditing = editingDetail?.shotIndex === i && editingDetail?.field === field;
                              return (
                                <div key={field} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                  <span style={{ color: 'var(--text-muted)' }}>{meta.icon}{meta.label}</span>
                                  {isEditing ? (
                                    <select
                                      autoFocus
                                      value={val || ''}
                                      onChange={(e) => updateShotDetail(i, field, e.target.value)}
                                      onBlur={() => setEditingDetail(null)}
                                      style={{ fontSize: 11, padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', cursor: 'pointer' }}
                                    >
                                      {(DETAIL_OPTIONS as any)[field]?.map((opt: string) => (
                                        <option key={opt} value={opt}>{opt}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span
                                      style={{ color: val ? meta.color : 'var(--text-muted)', fontWeight: val ? 500 : 400, cursor: 'pointer', borderBottom: val ? 'none' : '1px dashed var(--text-muted)', paddingBottom: 1 }}
                                      onClick={() => setEditingDetail({ shotIndex: i, field })}
                                      title="点击编辑"
                                    >
                                      {val || '—'}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="prompt-block">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h5>首帧图片提示词</h5>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`shot-${shot.id}-first`, shot.firstFramePrompt)}>编辑</button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCopy(shot.firstFramePrompt, `${shot.id}-first`)}
                              >
                                复制{copiedId === `${shot.id}-first` && <span className="copy-feedback">已复制</span>}
                              </button>
                              <button
                                className="btn btn-sm btn-teal"
                                disabled={aiDisabled}
                                title={aiTooltip}
                                onClick={() => handleOptimizePrompt(i, 'firstFramePrompt')}
                                style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                              >
                                {aiLoading === `optimize-prompt-${i}-firstFramePrompt` ? '优化中...' : 'AI 优化'}
                              </button>
                            </div>
                          </div>
                          {editingField === `shot-${shot.id}-first` ? (
                            <div>
                              <textarea
                                autoFocus
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}
                              />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-primary" onClick={() => saveEdit(`shot-${shot.id}-first`, ['shots', String(i), 'firstFramePrompt'])}>保存</button>
                                <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                              </div>
                            </div>
                          ) : (
                            <p>{shot.firstFramePrompt}</p>
                          )}
                        </div>
                        <div className="prompt-block">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h5>尾帧图片提示词</h5>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`shot-${shot.id}-last`, shot.lastFramePrompt)}>编辑</button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCopy(shot.lastFramePrompt, `${shot.id}-last`)}
                              >
                                复制{copiedId === `${shot.id}-last` && <span className="copy-feedback">已复制</span>}
                              </button>
                              <button
                                className="btn btn-sm btn-teal"
                                disabled={aiDisabled}
                                title={aiTooltip}
                                onClick={() => handleOptimizePrompt(i, 'lastFramePrompt')}
                                style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                              >
                                {aiLoading === `optimize-prompt-${i}-lastFramePrompt` ? '优化中...' : 'AI 优化'}
                              </button>
                            </div>
                          </div>
                          {editingField === `shot-${shot.id}-last` ? (
                            <div>
                              <textarea
                                autoFocus
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(`shot-${shot.id}-last`, ['shots', String(i), 'lastFramePrompt'])}>保存</button>
                                <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                              </div>
                            </div>
                          ) : (
                            <p>{shot.lastFramePrompt}</p>
                          )}
                        </div>
                        <div className="prompt-block">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <h5>视频生成提示词</h5>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-sm btn-ghost" onClick={() => startEdit(`shot-${shot.id}-video`, shot.videoPrompt)}>编辑</button>
                              <button
                                className="btn btn-sm btn-ghost"
                                onClick={() => handleCopy(shot.videoPrompt, `${shot.id}-video`)}
                              >
                                复制{copiedId === `${shot.id}-video` && <span className="copy-feedback">已复制</span>}
                              </button>
                              <button
                                className="btn btn-sm btn-teal"
                                disabled={aiDisabled}
                                title={aiTooltip}
                                onClick={() => handleOptimizePrompt(i, 'videoPrompt')}
                                style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                              >
                                {aiLoading === `optimize-prompt-${i}-videoPrompt` ? '优化中...' : 'AI 优化'}
                              </button>
                            </div>
                          </div>
                          {editingField === `shot-${shot.id}-video` ? (
                            <div>
                              <textarea
                                autoFocus
                                value={editDraft}
                                onChange={(e) => setEditDraft(e.target.value)}
                                style={{ width: '100%', minHeight: 100, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}
                              />
                              <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-sm btn-primary" onClick={() => saveEdit(`shot-${shot.id}-video`, ['shots', String(i), 'videoPrompt'])}>保存</button>
                                <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                              </div>
                            </div>
                          ) : (
                            <p>{shot.videoPrompt}</p>
                          )}
                        </div>
                      </div>
                    )}
                    </div>

                    {/* 转场指示箭头 (V2.1.0 第二层新增) */}
                    {!isLast && (
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '6px 0', gap: 8 }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                        <span style={{
                          fontSize: 11,
                          padding: '2px 10px',
                          borderRadius: 10,
                          background: 'rgba(148,163,184,0.08)',
                          color: 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}>
                          {shot.transition ? (
                            <>
                              <span>↓</span>
                              <span style={{ color: '#94a3b8' }}>{shot.transition}</span>
                            </>
                          ) : (
                            <span>↓ 硬切</span>
                          )}
                        </span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                      </div>
                    )}
                      </SortableItem>
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>

            {/* 镜头对比面板（V2.1.0 导演台体验优化） */}
            {showComparePanel && selectedShots.size >= 2 && (
              <div className="card" style={{ padding: 20, marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600 }}>镜头对比 ({selectedShots.size} 个)</h4>
                  <button className="btn btn-sm btn-ghost" onClick={() => setShowComparePanel(false)}>关闭</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontWeight: 500 }}>参数</th>
                        {data.shots
                          .filter((s) => selectedShots.has(s.id))
                          .map((s, idx) => (
                            <th key={s.id} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)', fontWeight: 600 }}>
                              镜头 {data.shots.findIndex((shot) => shot.id === s.id) + 1}
                            </th>
                          ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>场景</td>
                        {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => (
                          <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{s.scene}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>景别</td>
                        {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => (
                          <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{s.shotSize}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>运镜</td>
                        {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => (
                          <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{s.camera}</td>
                        ))}
                      </tr>
                      <tr>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>时长</td>
                        {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => (
                          <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-primary)' }}>{s.duration}</td>
                        ))}
                      </tr>
                      {Object.entries(DETAIL_META).map(([field, meta]) => (
                        <tr key={field}>
                          <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>{meta.label}</td>
                          {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => {
                            const val = (s as any)[field];
                            return (
                              <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: val ? meta.color : 'var(--text-muted)' }}>
                                {val || '—'}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr>
                        <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>可生成性</td>
                        {data.shots.filter((s) => selectedShots.has(s.id)).map((s) => (
                          <td key={s.id} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', color: s.generatabilityScore >= 85 ? 'var(--success)' : 'var(--warning)', fontWeight: 600 }}>
                            {s.generatabilityScore}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>

          {/* ===== 05 声音设计 ===== */}
          <section id="section-sound" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>05</span>声音设计
            </h2>
            <div className="card">
              {(
                [
                  ['BGM', data.soundDesign.bgm],
                  ['环境音', data.soundDesign.ambientSound],
                  ['人声', data.soundDesign.voice],
                  ['音效', data.soundDesign.soundEffects],
                ] as const
              ).map(([label, value]) => (
                <div key={label} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
                    <button
                      className="btn btn-sm btn-ghost"
                      disabled={aiDisabled}
                      title={aiTooltip}
                      onClick={() => handleRegenerateSection('soundDesign')}
                      style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      {aiLoading === 'soundDesign' ? '优化中...' : 'AI 优化'}
                    </button>
                  </div>
                  <p
                    style={{
                      fontSize: 14,
                      color: 'var(--text-primary)',
                      lineHeight: 1.6,
                      padding: '12px 16px',
                      background: 'var(--bg-input)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ===== 06 文化表达检查 ===== */}
          <section id="section-culture" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>06</span>文化表达检查
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card" style={{ textAlign: 'center', padding: '28px' }}>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>文化表达评分</div>
                <div
                  style={{
                    fontSize: 48,
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, var(--gold), var(--teal))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {data.cultureCheck.overallScore} <span style={{ fontSize: 20, fontWeight: 400 }}>/ 100</span>
                </div>
              </div>

              <div className="card">
                {data.cultureCheck.items.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: i < data.cultureCheck.items.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{item.label}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color:
                          item.status.includes('良好') || item.status === '已说明' || item.status === '正常' || item.status === '低'
                            ? 'var(--success)'
                            : 'var(--warning)',
                      }}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="card">
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--gold)' }}>注意事项</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.cultureCheck.notes}</p>
              </div>

              <div className="card">
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--gold)' }}>优化建议</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.cultureCheck.suggestions}</p>
              </div>

              {data.cultureCheck.disclaimer && (
                <div className="card" style={{ borderLeft: '3px solid var(--warning)' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: 'var(--warning)' }}>免责声明</h4>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{data.cultureCheck.disclaimer}</p>
                </div>
              )}
            </div>
          </section>

          {/* ===== 07 参赛说明 ===== */}
          <section id="section-submission" className="director-section" style={{ marginBottom: 48 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700 }}>
                <span style={{ color: 'var(--gold)', marginRight: 8 }}>07</span>参赛说明
              </h2>
              <button className="btn btn-sm btn-secondary" onClick={copyFullSubmission}>复制完整参赛说明</button>
            </div>
            <div className="card">
              {([
                ['作品名称', data.submissionNote.title, 'title'],
                ['作品简介', data.submissionNote.introduction, 'introduction'],
                ['创意说明', data.submissionNote.creativeNote, 'creativeNote'],
                ['技术说明', data.submissionNote.techNote, 'techNote'],
                ['AI 使用说明', data.submissionNote.aiUsageNote, 'aiUsageNote'],
                ['文化价值', data.submissionNote.culturalValue, 'culturalValue'],
                ['适合赛道', data.submissionNote.suitableTrack, 'suitableTrack'],
                ['作品规格建议', data.submissionNote.specSuggestion, 'specSuggestion'],
              ] as const).map(([label, value, fieldKey]) => {
                const fieldId = `submissionNote-${fieldKey}`;
                return (
                  <div key={label} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <label style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => startEdit(fieldId, value)}>编辑</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleCopy(value, `submission-${fieldKey}`)}>复制</button>
                      </div>
                    </div>
                    {editingField === fieldId ? (
                      <div>
                        <textarea
                          autoFocus
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => saveEdit(fieldId, ['submissionNote', fieldKey])}>保存</button>
                          <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: 14,
                          color: 'var(--text-primary)',
                          lineHeight: 1.6,
                          padding: '12px 16px',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                );
              })}
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button
                  className="btn btn-sm btn-secondary"
                  disabled={aiDisabled}
                  title={aiTooltip}
                  onClick={() => handleRegenerateSection('submissionNote')}
                  style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                >
                  {aiLoading === 'submissionNote' ? '生成中...' : 'AI 重新生成'}
                </button>
              </div>
            </div>
          </section>

          {/* ===== 08 发布文案 ===== */}
          <section id="section-social" className="director-section" style={{ marginBottom: 48 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
              <span style={{ color: 'var(--gold)', marginRight: 8 }}>08</span>发布文案
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {([
                ['抖音文案', data.socialPosts.douyin, 'douyin'],
                ['小红书文案', data.socialPosts.xiaohongshu, 'xiaohongshu'],
              ] as const).map(([label, value, fieldKey]) => {
                const fieldId = `socialPosts-${fieldKey}`;
                return (
                  <div key={label} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ fontSize: 16, fontWeight: 600 }}>{label}</h4>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-ghost" onClick={() => handleCopy(value, `social-${fieldKey}`)}>复制</button>
                        <button className="btn btn-sm btn-ghost" onClick={() => startEdit(fieldId, value)}>编辑</button>
                        <button
                          className="btn btn-sm btn-teal"
                          disabled={aiDisabled}
                          title={aiTooltip}
                          onClick={() => handleRegenerateSection('socialPosts')}
                          style={aiDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {aiLoading === 'socialPosts' ? '优化中...' : 'AI 优化'}
                        </button>
                      </div>
                    </div>
                    {editingField === fieldId ? (
                      <div>
                        <textarea
                          autoFocus
                          value={editDraft}
                          onChange={(e) => setEditDraft(e.target.value)}
                          style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.8, marginBottom: 8, whiteSpace: 'pre-wrap' }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm btn-primary" onClick={() => saveEdit(fieldId, ['socialPosts', fieldKey])}>保存</button>
                          <button className="btn btn-sm btn-ghost" onClick={cancelEdit}>取消</button>
                        </div>
                      </div>
                    ) : (
                      <p
                        style={{
                          fontSize: 14,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.8,
                          padding: '12px 16px',
                          background: 'var(--bg-input)',
                          borderRadius: 'var(--radius-sm)',
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {value}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
      {/* Toast 通知 */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            background: aiError ? 'rgba(248,113,113,0.95)' : 'rgba(52,211,153,0.95)',
            color: '#fff',
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease',
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
