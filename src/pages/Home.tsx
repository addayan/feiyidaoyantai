import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroBackground from '../components/HeroBackground';

function useTimecode() {
  const [tc, setTc] = useState('00:00:00');
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      setTc(`${h}:${m}:${sec}`);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return tc;
}

const STEPS = [
  { num: '01', title: '了解非遗', img: '/workflow-assets/step01.jpg', text: '输入非遗主题，自动整理官方项目介绍、地域背景与文化资料。' },
  { num: '02', title: '故事创意', img: '/workflow-assets/step02.jpg', text: '基于非遗元素生成故事方向、情感线索与创意梗概。' },
  { num: '03', title: '角色/场景', img: '/workflow-assets/step03.jpg', text: '统一人物锚点、服装道具与场景视觉风格设定。' },
  { num: '04', title: '分镜组织', img: '/workflow-assets/step04.jpg', text: '自动拆分叙事节奏、镜头内容和情绪变化，形成可执行方案。' },
  { num: '05', title: '首帧图片Prompt', img: '/workflow-assets/step05.jpg', text: '生成首帧画面提示词，明确主体、构图、光线与材质。' },
  { num: '06', title: '视频Prompt', img: '/workflow-assets/step06.jpg', text: '在首帧基础上生成视频提示词，明确动作、节奏与首尾设计。' },
  { num: '07', title: '文化表达检查', img: '/workflow-assets/step07.jpg', text: '自动标注文化事实与现代创意边界，提示风险与核对项。' },
  { num: '08', title: '导出创作资产', img: '/workflow-assets/step08.jpg', text: '一键导出分镜表、图片/视频提示词与项目文稿。' },
];

export default function Home() {
  const navigate = useNavigate();
  const tc = useTimecode();

  return <div className="page">
    <div style={{ position: 'relative' }}>
      <HeroBackground />
      <section className="home-hero" style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1200, margin: '0 auto',
        padding: '120px 32px 80px',
      }}>
        {/* REC 时间码 */}
        <div style={{
          position: 'absolute', top: 32, right: 32,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'ui-monospace, "SF Mono", Menlo, monospace',
          fontSize: 13, color: 'var(--text-muted)',
          letterSpacing: 2,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#e74c3c', display: 'inline-block',
            animation: 'recBlink 1.5s ease-in-out infinite',
          }} />
          REC&nbsp;&nbsp;{tc}
        </div>

        {/* 眉题 + 场记板 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
          <svg width="36" height="26" viewBox="0 0 40 28" fill="none" style={{ flexShrink: 0 }}>
            <rect x="2" y="6" width="36" height="20" rx="2" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
            <path d="M2 6 L6 1 L10 6 L14 1 L18 6 L22 1 L26 6 L30 1 L34 6 L38 1" stroke="var(--gold)" strokeWidth="1.2" fill="none" />
            <line x1="8" y1="14" x2="32" y2="14" stroke="var(--gold)" strokeWidth="0.8" opacity="0.5" />
            <line x1="8" y1="19" x2="24" y2="19" stroke="var(--gold)" strokeWidth="0.8" opacity="0.3" />
          </svg>
          <div style={{ color: 'var(--gold)', letterSpacing: 6, fontSize: 12, fontWeight: 500 }}>辽宁非遗 · 数字影像创新</div>
        </div>

        {/* 超大标题 */}
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: -2,
          marginBottom: 8,
          color: 'var(--text-primary)',
        }}>
          辽韵
        </h1>
        <h1 style={{
          fontSize: 'clamp(48px, 8vw, 96px)',
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: -2,
          marginBottom: 40,
          background: 'linear-gradient(135deg, var(--gold) 0%, #e8c87a 50%, var(--gold) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          AI导演台
        </h1>

        {/* 一句话定位 */}
        <p style={{
          fontSize: 20, lineHeight: 1.7,
          color: 'var(--text-secondary)',
          maxWidth: 560, marginBottom: 48,
        }}>
          从一张剪纸，到一个电影镜头。
        </p>

        {/* 按钮 */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/liaoning-case')} style={{ padding: '14px 32px', fontSize: 15 }}>
            ▶&nbsp; 体验《一剪见闾山》
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/create')} style={{ padding: '14px 32px', fontSize: 15 }}>
            开始创作 →
          </button>
        </div>
      </section>
    </div>

    {/* 案例卡 */}
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 64px' }}>
      <div className="card case-grid" style={{
        display: 'grid', gridTemplateColumns: '1fr 2fr',
        padding: 0, overflow: 'hidden',
        borderColor: 'rgba(201,168,76,.25)',
        background: 'linear-gradient(110deg, #2a1a14 0%, #1a1612 60%, #1e1a15 100%)',
      }}>
        <div style={{
          padding: 40,
          borderRight: '1px solid rgba(201,168,76,.15)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <span style={{ color: 'var(--gold)', fontSize: 11, letterSpacing: 3 }}>国家级非物质文化遗产</span>
          <div style={{ fontSize: 72, fontWeight: 800, color: 'var(--cinnabar)', lineHeight: 1.2, marginTop: 8 }}>剪纸</div>
          <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>医巫闾山满族剪纸</div>
          <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: 13 }}>辽宁 · 锦州　/　Ⅶ-16</p>
        </div>
        <div style={{ padding: '40px 44px' }}>
          <span style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 1 }}>主案例 · 完整前期创作</span>
          <h2 style={{ fontSize: 32, margin: '12px 0 16px', color: 'var(--text-primary)' }}>《一剪见闾山》</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
            从一张纸开始，让传统纹样、山林记忆与年轻人的视角，转化成一部 AI 非遗短片。
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/liaoning-case')}>
            进入导演台 →
          </button>
        </div>
      </div>
    </section>

    {/* 8步工作流 */}
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 96px' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 3, marginBottom: 8 }}>AI 辅助导演工作流</div>
        <h2 style={{ fontSize: 32, color: 'var(--text-primary)', marginBottom: 8 }}>8步完成一部非遗短片的前期创作</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>从选题到可执行的分镜与提示词，形成完整的创作资产。</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {STEPS.map((step) => (
          <div key={step.num} className="card" style={{ overflow: 'hidden', padding: 0, borderTop: '2px solid var(--gold)' }}>
            <div style={{ position: 'relative', height: 120, overflow: 'hidden' }}>
              <img src={step.img} alt={step.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(18,16,14,0.85)', color: 'var(--gold)', fontSize: 12, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>{step.num}</div>
            </div>
            <div style={{ padding: 14 }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: 15, marginBottom: 6 }}>{step.title}</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6, margin: 0 }}>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* 文化边界说明 */}
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 96px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div className="card" style={{ padding: 28, borderTop: '3px solid var(--gold)' }}>
          <h3 style={{ color: 'var(--gold)', fontSize: 18, marginBottom: 12 }}>文化事实层</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            真实、可考、不随意改编。项目名称、编号、类别、地区与公布批次均来自官方非遗名录。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div>📖 来源依据：官方资料、学术研究、文物记载</div>
            <div>📍 地域特征：辽宁地域的自然、人文与民俗</div>
            <div>✓ 表达原则：尊重史实，避免虚构和误读</div>
          </div>
        </div>
        <div className="card" style={{ padding: 28, borderTop: '3px solid var(--cinnabar)' }}>
          <h3 style={{ color: 'var(--cinnabar)', fontSize: 18, marginBottom: 12 }}>现代创意层</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>
            在文化事实基础上的艺术再表达。角色设定、场景重构、情感叙事属于现代创作。
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: 'var(--text-secondary)' }}>
            <div>💡 创作手法：影像叙事、视觉风格、艺术化加工</div>
            <div>🎬 表达形式：短片、海报、互动影像、AI数字艺术</div>
            <div>🎯 核心目标：让传统文化被更多人看见与喜爱</div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
        "AI 可以参与创意，但不能替代文化事实核验。"
      </div>
    </section>

    <style>{`
      @keyframes recBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.2; }
      }
    `}</style>
  </div>;
}
