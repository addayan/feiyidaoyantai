import { useNavigate } from 'react-router-dom';
import { LIAONING_URL } from '../data/liaoningCase';

export default function Home() {
  const navigate = useNavigate();
  return <div className="page">
    <section className="home-hero" style={{ maxWidth: 1200, margin: '0 auto', padding: '68px 32px 42px' }}>
      <div style={{ color: 'var(--gold)', letterSpacing: 5, fontSize: 13, marginBottom: 20 }}>辽宁非遗 · 数字影像创新</div>
      <h1 className="hero-title" style={{ fontSize: 62, lineHeight: 1.15, marginBottom: 14, color: '#f5ead3' }}>辽韵 AI 导演台</h1>
      <h2 className="hero-subtitle" style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 400, marginBottom: 22 }}>辽宁非遗数字影像创作系统</h2>
      <p style={{ fontSize: 19, marginBottom: 12 }}>从一张剪纸，到一个故事，再到一组可以生成的电影镜头。</p>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.9, maxWidth: 780 }}>以辽宁非遗为文化基础，AI 辅助完成故事、角色、场景、分镜、<br />图片提示词、视频提示词与文化表达检查。</p>
      <div style={{ display: 'flex', gap: 16, marginTop: 28, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" onClick={() => navigate(LIAONING_URL)}>体验《一剪见闾山》 →</button>
        <button className="btn btn-secondary" onClick={() => navigate('/create')}>开始自己的非遗创作</button>
      </div>
    </section>
    <section style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px 48px' }}>
      <div className="card case-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', padding: 0, overflow: 'hidden', borderColor: 'rgba(212,168,83,.4)', background: 'linear-gradient(110deg,#351924,#111b2c)' }}>
        <div style={{ padding: 32, borderRight: '1px solid rgba(212,168,83,.2)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ color: 'var(--gold)', fontSize: 12, letterSpacing: 2 }}>国家级非物质文化遗产</span>
          <div style={{ fontSize: 76, fontWeight: 800, color: '#ee7877', lineHeight: 1.3 }}>剪纸</div>
          <div style={{ fontSize: 18 }}>医巫闾山满族剪纸</div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 12 }}>辽宁 · 锦州　/　Ⅶ-16</p>
        </div>
        <div style={{ padding: '30px 38px' }}>
          <span style={{ color: 'var(--gold)', fontSize: 12 }}>本次主案例 · 8 镜头完整前期创作</span>
          <h2 style={{ fontSize: 34, margin: '10px 0' }}>《一剪见闾山》</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 18 }}>从一张纸开始，让传统纹样、山林记忆与年轻人的视角，<br />转化成一部 AI 非遗短片。</p>
          <button className="btn btn-primary" onClick={() => navigate(LIAONING_URL)}>进入完整 AI 导演台 →</button>
        </div>
      </div>
      <p style={{ marginTop: 24, color: 'var(--text-muted)', textAlign: 'center', fontSize: 14 }}>让不会编剧、不会分镜、不会写 AI 提示词的人，也能完成一部辽宁非遗短片的前期创作。</p>
    </section>
    <section className="steps-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px 64px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
      {[
        ['01 / 理解文化', '文化事实与创作设定分开呈现，让创意有据可依。'],
        ['02 / 组织镜头', '故事、角色、场景与8个镜头连接成可执行的创作方案。'],
        ['03 / 继续生产', '首尾帧与视频提示词支持复制、编辑和导出，衔接后续制作。'],
      ].map(([title, text]) => <div key={title} className="card"><h3 style={{ color: 'var(--gold)', marginBottom: 12 }}>{title}</h3><p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{text}</p></div>)}
    </section>
  </div>;
}
