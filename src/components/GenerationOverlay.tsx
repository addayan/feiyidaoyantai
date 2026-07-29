import { useEffect, useRef, useState } from 'react';

interface CompletionStat {
  icon: string;
  label: string;
}

interface Props {
  visible: boolean;
  heritageType: string;
  topic: string;
  purpose: string;
  duration: string;
  style: string;
  progress: number;
  currentStage: number;
  done: boolean;
  error: boolean;
  onRetry: () => void;
  onDismiss: () => void;
  completionStats?: CompletionStat[];
}

const STAGES = [
  '正在理解非遗主题',
  '正在构思故事',
  '正在设计角色与场景',
  '正在生成 8 个分镜',
  '正在生成 AI 图片与视频提示词',
  '正在进行文化表达检查',
];

function getContextLine(stage: number, ht: string, topic: string): string {
  switch (stage) {
    case 0: return `正在理解：${ht} × ${topic || '用户创意'}`;
    case 1: return `正在构思：从${ht}展开故事线`;
    case 2: return '正在准备：角色、场景、镜头';
    case 3: return '正在设计：8 个镜头的分镜与运镜';
    case 4: return '正在生成：AI 图片与视频提示词';
    case 5: return '正在检查：文化表达准确性';
    default: return '';
  }
}

const DEFAULT_STATS: CompletionStat[] = [
  { icon: '👤', label: '-- 个角色' },
  { icon: '🎬', label: '-- 个场景' },
  { icon: '📷', label: '-- 个镜头' },
  { icon: '✨', label: '-- 条 AI 提示词' },
  { icon: '✅', label: '1 份文化表达检查' },
];

/* ============================================================
   轻量粒子 — 生成面板背景装饰
   ============================================================ */
function OverlayParticles() {
  const particles = useRef(
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2,
      duration: 14 + Math.random() * 18,
      delay: Math.random() * 10,
      opacity: 0.08 + Math.random() * 0.18,
      isGold: Math.random() > 0.6,
    }))
  ).current;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <div
          key={p.id}
          className="gen-particle"
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: p.isGold
              ? `rgba(212,168,83,${p.opacity})`
              : `rgba(45,212,191,${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px ${p.isGold ? 'rgba(212,168,83,0.12)' : 'rgba(45,212,191,0.12)'}`,
            animation: `genParticleFloat ${p.duration}s ${p.delay}s infinite ease-in-out`,
          }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   GenerationOverlay 主组件
   ============================================================ */
export type { CompletionStat };

export default function GenerationOverlay({
  visible, heritageType, topic, purpose, duration, style: vs,
  progress, currentStage, done, error, onRetry, onDismiss, completionStats,
}: Props) {
  const stats = completionStats ?? DEFAULT_STATS;
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const h = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', h);
    return () => mq.removeEventListener('change', h);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,10,24,0.92)',
      backdropFilter: 'blur(12px)',
    }}>
      {/* 粒子 */}
      {!reducedMotion && <OverlayParticles />}

      {/* 光晕 */}
      {!reducedMotion && (
        <div className="gen-glow" style={{
          position: 'absolute', top: '25%', left: '50%', width: '50%', height: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(ellipse, rgba(45,212,191,0.06) 0%, rgba(212,168,83,0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      )}

      {/* 内容 */}
      <div style={{ position: 'relative', zIndex: 10, maxWidth: 520, width: '90%', textAlign: 'center' }}>

        {/* ====== 错误状态 ====== */}
        {error && (
          <div className="animate-fade-in">
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              这次生成没有完成
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32, lineHeight: 1.6 }}>
              可能是网络波动或模型响应异常。
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={onRetry}>重新尝试</button>
              <button className="btn btn-secondary" onClick={onDismiss}>返回修改</button>
            </div>
          </div>
        )}

        {/* ====== 完成状态 ====== */}
        {done && !error && (
          <div className="animate-fade-in">
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(52,211,153,0.15)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 28, color: 'var(--success)',
            }}>✓</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              创作方案生成完成
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 28 }}>
              已生成完整创作方案，包含角色、场景、分镜与 AI 提示词
            </p>
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 28,
            }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  fontSize: 13, color: 'var(--text-secondary)',
                }}>
                  <span style={{ marginRight: 6 }}>{s.icon}</span>{s.label}
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: 'var(--teal)' }}>
              正在进入 AI 导演台……
            </p>
          </div>
        )}

        {/* ====== 进行中 ====== */}
        {!done && !error && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
              AI 正在为你导演这部非遗短片
            </h2>

            {/* 用户输入摘要 */}
            <div style={{
              padding: '14px 20px', borderRadius: 'var(--radius-md)',
              background: 'rgba(212,168,83,0.08)', border: '1px solid rgba(212,168,83,0.2)',
              marginBottom: 28,
            }}>
              <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--gold)', marginBottom: 6 }}>
                {heritageType}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, fontStyle: 'italic', lineHeight: 1.5 }}>
                &ldquo;{topic || '未填写创意主题'}&rdquo;
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                {purpose} · {duration} · {vs}
              </div>
            </div>

            {/* 进度百分比 + 进度条 */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: 'var(--gold)', fontVariantNumeric: 'tabular-nums' }}>
                  {Math.round(progress)}%
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  AI 正在处理完整创作方案……
                </span>
              </div>
              <div style={{ width: '100%', height: 4, borderRadius: 2, background: 'var(--bg-input)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 2, width: `${progress}%`,
                  background: 'linear-gradient(90deg, var(--teal), var(--gold))',
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>

            {/* 动态上下文 */}
            <p style={{
              fontSize: 13, color: 'var(--teal)', marginBottom: 20,
              animation: 'fadeIn 0.3s ease', minHeight: 20,
            }}>
              {getContextLine(currentStage, heritageType, topic)}
            </p>

            {/* 阶段列表 */}
            <div style={{ textAlign: 'left' }}>
              {STAGES.map((s, i) => {
                const isDone = i < currentStage;
                const isCurrent = i === currentStage;
                const isPending = i > currentStage;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0',
                    color: isDone ? 'var(--text-secondary)' : isCurrent ? 'var(--text-primary)' : 'var(--text-muted)',
                    opacity: isPending ? 0.35 : 1,
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, flexShrink: 0,
                      background: isDone ? 'var(--success)' : 'transparent',
                      color: isDone ? '#0a0e1a' : isCurrent ? 'var(--gold)' : 'var(--text-muted)',
                      border: isCurrent ? '1.5px solid var(--gold)' : isPending ? '1.5px solid var(--border)' : 'none',
                      fontWeight: 600,
                    }}>
                      {isDone ? '✓' : isCurrent ? '●' : '○'}
                    </span>
                    <span style={{ fontWeight: isCurrent ? 600 : 400, fontSize: 14 }}>{s}</span>
                    {isCurrent && (
                      <span style={{
                        marginLeft: 'auto', fontSize: 12, color: 'var(--gold)',
                        animation: 'shimmer 1.5s infinite',
                        background: 'linear-gradient(90deg, var(--gold), var(--teal), var(--gold))',
                        backgroundSize: '200% 100%',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>处理中</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}