import { useNavigate } from 'react-router-dom';
import CaseCard from '../components/CaseCard';
import HeroBackground from '../components/HeroBackground';
import { CASE_SUMMARIES } from '../data/examples';

const FEATURES = [
  {
    icon: '🎬',
    title: '非遗专用创作流程',
    desc: '从主题到分镜到提示词，专为非遗短片设计的完整 AI 创作工作流，避免猎奇化与符号化。',
  },
  {
    icon: '🎯',
    title: 'AI 分镜导演台',
    desc: '8 镜头可视化分镜编辑，每个镜头包含首帧/尾帧/视频提示词，支持单镜头重新生成与 AI 优化。',
  },
  {
    icon: '✅',
    title: '文化表达与可生成性检查',
    desc: '自动检查文化表达准确性、猎奇化风险，并评估 AI 视频可生成性，让创意真正落地。',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="page">
      {/* Hero — 非遗 + AI 融合视觉 */}
      <section style={{
        minHeight: 700,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '80px 24px 48px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Hero 背景 — 面具 + 科技线路 + 粒子 + 光晕 */}
        <HeroBackground />

        {/* Hero 内容 — 位于遮罩层之上 */}
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, maxWidth: 640 }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 16px',
            borderRadius: 20,
            background: 'rgba(212,168,83,0.12)',
            border: '1px solid rgba(212,168,83,0.25)',
            color: 'var(--gold)',
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 28,
            backdropFilter: 'blur(8px)',
          }}>
            TRAE AI 创造力大赛参赛作品
          </div>

          <h1 style={{
            fontSize: 58,
            fontWeight: 800,
            lineHeight: 1.12,
            marginBottom: 14,
            background: 'linear-gradient(135deg, var(--text-primary) 20%, var(--gold) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
            filter: 'drop-shadow(0 2px 12px rgba(212,168,83,0.15))',
          }}>
            非遗影像工坊
          </h1>

          <p style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--gold)',
            marginBottom: 20,
            letterSpacing: 3,
            textShadow: '0 0 20px rgba(212,168,83,0.2)',
          }}>
            AI 非遗短片导演台
          </p>

          <p style={{
            fontSize: 16,
            color: 'rgba(241,245,249,0.78)',
            maxWidth: 560,
            margin: '0 auto 44px',
            lineHeight: 1.75,
          }}>
            输入一个中国非遗主题，让 AI 帮你完成故事、角色、场景、<br />
            分镜、提示词和文化表达检查。
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn btn-primary"
              style={{ padding: '14px 44px', fontSize: 17, fontWeight: 600 }}
              onClick={() => navigate('/create')}
            >
              开始 AI 创作
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '14px 40px', fontSize: 16 }}
              onClick={() => navigate('/cases')}
            >
              快速体验案例
            </button>
          </div>
        </div>
      </section>

      {/* 精选案例 */}
      <section style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '40px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>精选案例</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>点击查看完整 AI 导演台</p>
          </div>
          <button className="btn btn-ghost" onClick={() => navigate('/cases')}>
            查看全部 →
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {CASE_SUMMARIES.map((c, i) => (
            <CaseCard key={c.slug} data={c} index={i} />
          ))}
        </div>
      </section>

      {/* 产品优势 */}
      <section style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        padding: '40px 24px 100px',
      }}>
        <h2 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', marginBottom: 48 }}>
          为什么选择非遗影像工坊
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="card animate-fade-in"
              style={{
                animationDelay: `${i * 0.15}s`,
                opacity: 0,
                textAlign: 'center',
                padding: '36px 28px',
              }}
            >
              <div style={{
                fontSize: 40,
                marginBottom: 16,
                display: 'inline-block',
              }}>
                {f.icon}
              </div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                marginBottom: 10,
                color: 'var(--text-primary)',
              }}>
                {f.title}
              </h3>
              <p style={{
                fontSize: 14,
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}