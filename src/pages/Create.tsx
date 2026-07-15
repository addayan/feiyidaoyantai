import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HeritageType, Purpose, Duration, VisualStyle, Project } from '../types';
import { generateMockProjectData } from '../data/mockGenerator';
import { createProject } from '../store/projectStore';
import GenerationOverlay from '../components/GenerationOverlay';

const HERITAGE_OPTIONS: HeritageType[] = ['傩戏', '铜梁龙', '蜀绣', '木版年画', '剪纸', '皮影', '陶艺', '其他'];
const PURPOSE_OPTIONS: Purpose[] = ['AIGC 比赛', '短视频', '课程作业', '文旅宣传', '动态海报', '其他'];
const DURATION_OPTIONS: Duration[] = ['30秒', '约1分钟', '3分钟', '5分钟'];
const STYLE_OPTIONS: VisualStyle[] = ['写实电影', '国风动画', '纪录片', '剪纸风', '东方幻想', '其他'];

const INSPIRATION_TEMPLATES: Record<string, string> = {
  '从人物成长出发': '年轻人在第一次接触{type}后，从不理解到深深被震撼，最终找到了自己与传统的连接',
  '从传统与现代冲突出发': '当{type}古老技法遇上数字时代，一位传承人用创新方式让传统焕发新生',
  '从一件非遗器物出发': '一件{type}作品跨越三代人的时光，承载着不为人知的家族记忆与情感',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 10,
};

const STAGE_COUNT = 6;

/* ============================================================
   可点击选项 Chip 样式
   ============================================================ */
function chipStyle(selected: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '9px 18px',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    border: selected ? '1.5px solid var(--gold)' : '1.5px solid var(--border)',
    background: selected ? 'var(--gold-dim)' : 'var(--bg-input)',
    color: selected ? 'var(--gold)' : 'var(--text-secondary)',
    transition: 'all 0.2s ease',
    userSelect: 'none' as const,
  };
}

/* ============================================================
   Segmented Control
   ============================================================ */
function SegmentedControl({
  value, onChange, disabled,
}: {
  value: 'ai' | 'quick';
  onChange: (v: 'ai' | 'quick') => void;
  disabled?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', borderRadius: 'var(--radius-md)',
      background: 'var(--bg-input)', border: '1px solid var(--border)',
      overflow: 'hidden',
    }}>
      <button
        disabled={disabled}
        onClick={() => onChange('ai')}
        style={{
          flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
          background: value === 'ai' ? 'rgba(212,168,83,0.15)' : 'transparent',
          color: value === 'ai' ? 'var(--gold)' : 'var(--text-muted)',
          border: 'none', borderBottom: value === 'ai' ? '2px solid var(--gold)' : '2px solid transparent',
          transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
        }}
      >
        AI 真实生成
        <span style={{
          display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2,
        }}>即将接入</span>
      </button>
      <button
        disabled={disabled}
        onClick={() => onChange('quick')}
        style={{
          flex: 1, padding: '10px 0', fontSize: 14, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
          background: value === 'quick' ? 'rgba(45,212,191,0.12)' : 'transparent',
          color: value === 'quick' ? 'var(--teal)' : 'var(--text-muted)',
          border: 'none', borderBottom: value === 'quick' ? '2px solid var(--teal)' : '2px solid transparent',
          transition: 'all 0.2s', opacity: disabled ? 0.5 : 1,
        }}
      >
        快速体验
        <span style={{
          display: 'block', fontSize: 11, fontWeight: 400, color: 'var(--text-muted)', marginTop: 2,
        }}>本地数据，立即可用</span>
      </button>
    </div>
  );
}

/* ============================================================
   Create 页面
   ============================================================ */
export default function Create() {
  const navigate = useNavigate();

  // 表单状态
  const [heritageType, setHeritageType] = useState<HeritageType>('蜀绣');
  const [topic, setTopic] = useState('');
  const [purpose, setPurpose] = useState<Purpose>('AIGC 比赛');
  const [duration, setDuration] = useState<Duration>('约1分钟');
  const [style, setStyle] = useState<VisualStyle>('写实电影');
  const [mode, setMode] = useState<'ai' | 'quick'>('quick');

  // 生成状态
  const [showOverlay, setShowOverlay] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [aiNotice, setAiNotice] = useState(false);

  // 防重复提交
  const generatingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canGenerate = topic.trim().length > 0;

  const handleInspiration = useCallback((label: string) => {
    const tpl = INSPIRATION_TEMPLATES[label];
    if (tpl) setTopic(tpl.replace('{type}', heritageType));
  }, [heritageType]);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    generatingRef.current = false;
  }, []);

  const runGeneration = useCallback(() => {
    setShowOverlay(true);
    setGenerating(true);
    setProgress(0);
    setCurrentStage(0);
    setDone(false);
    setError(false);
    generatingRef.current = true;

    let stage = 0;
    let pct = 0;

    timerRef.current = setInterval(() => {
      if (!generatingRef.current) {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

      pct += 2 + Math.random() * 4;
      if (pct >= 100) pct = 100;
      setProgress(pct);

      // 阶段切换
      const newStage = Math.min(Math.floor(pct / (100 / STAGE_COUNT)), STAGE_COUNT - 1);
      if (newStage !== stage) {
        stage = newStage;
        setCurrentStage(stage);
      }

      if (pct >= 100) {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = null;
        generatingRef.current = false;

        // 延迟 1 秒展示完成状态
        setTimeout(() => {
          setDone(true);
          setGenerating(false);

          // 生成数据
          try {
            const data = generateMockProjectData({
              heritageType,
              topic: topic.trim(),
              purpose,
              duration,
              style,
            });

            const now = new Date().toISOString();
            const projectId = `proj-${Date.now()}`;
            const project: Project = {
              id: projectId,
              slug: projectId,
              createdAt: now,
              updatedAt: now,
              data,
              isExample: false,
            };

            createProject(project);

            // 延迟后跳转
            setTimeout(() => {
              setShowOverlay(false);
              navigate(`/director/${projectId}`);
            }, 1200);
          } catch {
            setError(true);
            setGenerating(false);
          }
        }, 1000);
      }
    }, 400);
  }, [heritageType, topic, purpose, duration, style, navigate]);

  const handleGenerate = useCallback(() => {
    if (!canGenerate || generatingRef.current) return;

    if (mode === 'ai') {
      setAiNotice(true);
      return;
    }

    setAiNotice(false);
    runGeneration();
  }, [canGenerate, mode, runGeneration]);

  const handleRetry = useCallback(() => {
    cleanup();
    setError(false);
    runGeneration();
  }, [cleanup, runGeneration]);

  const handleDismiss = useCallback(() => {
    cleanup();
    setShowOverlay(false);
    setGenerating(false);
    setDone(false);
    setError(false);
    setProgress(0);
    setCurrentStage(0);
  }, [cleanup]);

  // 组件卸载时清理
  useState(() => () => cleanup());

  return (
    <div className="page">
      <GenerationOverlay
        visible={showOverlay}
        heritageType={heritageType}
        topic={topic.trim()}
        purpose={purpose}
        duration={duration}
        style={style}
        progress={progress}
        currentStage={currentStage}
        done={done}
        error={error}
        onRetry={handleRetry}
        onDismiss={handleDismiss}
      />

      <div className="page-container" style={{ maxWidth: 680 }}>
        <h1 className="page-title">开始创作</h1>
        <p className="page-subtitle">填写非遗主题和创作参数，AI 将为你生成完整短片方案</p>

        <div className="card" style={{ padding: 32 }}>
          {/* 非遗类型 — Chip 选项 */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_STYLE}>非遗类型</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {HERITAGE_OPTIONS.map(h => (
                <button
                  key={h}
                  className="create-chip"
                  style={chipStyle(heritageType === h)}
                  onClick={() => setHeritageType(h)}
                  onMouseEnter={e => {
                    if (heritageType !== h) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={e => {
                    if (heritageType !== h) (e.currentTarget as HTMLElement).style.borderColor = '';
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          {/* 创意主题 — Textarea + 灵感按钮 */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_STYLE}>创意主题</label>
            <textarea
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder='例如：年轻女孩第一次理解外婆为什么绣了一辈子'
              rows={3}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
              {Object.keys(INSPIRATION_TEMPLATES).map(label => (
                <button
                  key={label}
                  className="btn btn-ghost"
                  style={{ fontSize: 12, padding: '5px 12px', borderRadius: 20 }}
                  onClick={() => handleInspiration(label)}
                >
                  💡 {label}
                </button>
              ))}
            </div>
          </div>

          {/* 作品用途 — Chip 选项 */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_STYLE}>作品用途</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {PURPOSE_OPTIONS.map(p => (
                <button
                  key={p}
                  className="create-chip"
                  style={chipStyle(purpose === p)}
                  onClick={() => setPurpose(p)}
                  onMouseEnter={e => {
                    if (purpose !== p) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={e => {
                    if (purpose !== p) (e.currentTarget as HTMLElement).style.borderColor = '';
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* 视频时长 — Chip 选项 */}
          <div style={{ marginBottom: 24 }}>
            <label style={LABEL_STYLE}>视频时长</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {DURATION_OPTIONS.map(d => (
                <button
                  key={d}
                  className="create-chip"
                  style={chipStyle(duration === d)}
                  onClick={() => setDuration(d)}
                  onMouseEnter={e => {
                    if (duration !== d) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={e => {
                    if (duration !== d) (e.currentTarget as HTMLElement).style.borderColor = '';
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 视觉风格 — Chip 选项 */}
          <div style={{ marginBottom: 28 }}>
            <label style={LABEL_STYLE}>视觉风格</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {STYLE_OPTIONS.map(s => (
                <button
                  key={s}
                  className="create-chip"
                  style={chipStyle(style === s)}
                  onClick={() => setStyle(s)}
                  onMouseEnter={e => {
                    if (style !== s) (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                  }}
                  onMouseLeave={e => {
                    if (style !== s) (e.currentTarget as HTMLElement).style.borderColor = '';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 生成模式 — Segmented Control */}
          <div style={{ marginBottom: 28 }}>
            <label style={LABEL_STYLE}>生成模式</label>
            <SegmentedControl
              value={mode}
              onChange={v => { setMode(v); setAiNotice(false); }}
              disabled={generatingRef.current}
            />
          </div>

          {/* AI 不可用提示 */}
          {aiNotice && (
            <div style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(248, 113, 113, 0.1)',
              border: '1px solid rgba(248, 113, 113, 0.3)',
              color: 'var(--error)',
              fontSize: 14,
              marginBottom: 20,
            }}>
              AI 真实生成将在下一阶段接入，请先使用「快速体验」模式生成项目。
            </div>
          )}

          {/* 生成按钮 */}
          <button
            className="btn btn-primary"
            style={{
              width: '100%', padding: '14px', fontSize: 16, fontWeight: 600,
              opacity: canGenerate && !generatingRef.current ? 1 : 0.5,
            }}
            disabled={!canGenerate || generatingRef.current}
            onClick={handleGenerate}
          >
            生成 AI 非遗短片方案
          </button>
        </div>
      </div>
    </div>
  );
}