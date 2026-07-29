import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { DIRECTOR_SECTIONS, type DirectorSection, type Project } from '../types';
import type { GenerationRecord } from '../types';
import { getProject, updateProject, addGenerationRecord as storeAddGenerationRecord } from '../store/projectStore';
import { getExampleProject } from '../data/examples';
import { DIRECTOR_STYLE_PRESETS } from '../data/directorStyles';
import type { DirectorStylePreset } from '../types';
import { copyText as doCopy } from '../utils/clipboard';
import { useAIHealth } from '../hooks/useAIHealth';
import { regenerateSection, regenerateShot, optimizeShot, optimizePrompt } from '../api/ai';

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

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const mainRef = useRef<HTMLDivElement>(null);

  // 加载项目数据
  useEffect(() => {
    if (!projectId) return;
    const isExample = searchParams.get('mode') === 'example';
    const found = isExample ? getExampleProject(projectId) : getProject(projectId);
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
              <button className="btn btn-sm btn-teal" onClick={copyAllPrompts}>复制全部提示词</button>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.shots.map((shot, i) => {
                const isExpanded = expandedShots.has(shot.id);
                return (
                  <div key={shot.id} className="card" style={{ padding: 20 }}>
                    {/* 镜头头部 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--gold-dim)',
                            color: 'var(--gold)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 14,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <div style={{ display: 'flex', gap: 6, marginBottom: 2, flexWrap: 'wrap' }}>
                            <span className="tag">{shot.shotSize}</span>
                            <span className="tag tag-teal">{shot.camera}</span>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{shot.duration}</span>
                          </div>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{shot.scene}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          padding: '4px 12px',
                          borderRadius: 'var(--radius-sm)',
                          background: shot.generatabilityScore >= 85 ? 'rgba(52,211,153,0.15)' : 'rgba(251,191,36,0.15)',
                          color: shot.generatabilityScore >= 85 ? 'var(--success)' : 'var(--warning)',
                          fontSize: 14,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {shot.generatabilityScore} / 100
                      </div>
                    </div>

                    {/* 分镜规格标签 (V2.1.0 新增) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 10px', marginBottom: 12 }}>
                      {shot.composition && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(139,92,246,0.12)', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>🎨</span>构图 · {shot.composition}
                        </span>
                      )}
                      {shot.lighting && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(251,191,36,0.12)', color: '#fbbf24', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>💡</span>光效 · {shot.lighting}
                        </span>
                      )}
                      {shot.cameraAngle && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(56,189,248,0.12)', color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>📐</span>角度 · {shot.cameraAngle}
                        </span>
                      )}
                      {shot.depthOfField && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(168,85,247,0.12)', color: '#c084fc', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>🔍</span>景深 · {shot.depthOfField}
                        </span>
                      )}
                      {shot.speed && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(52,211,153,0.12)', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>⚡</span>速度 · {shot.speed}
                        </span>
                      )}
                      {shot.mood && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(244,114,182,0.12)', color: '#f472b6', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>🎭</span>情绪 · {shot.mood}
                        </span>
                      )}
                      {shot.transition && (
                        <span style={{ fontSize: 12, padding: '3px 10px', borderRadius: 10, background: 'rgba(148,163,184,0.12)', color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10 }}>🔀</span>转场 · {shot.transition}
                        </span>
                      )}
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
                );
              })}
            </div>
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
