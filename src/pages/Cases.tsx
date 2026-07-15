import CaseCard from '../components/CaseCard';
import { CASE_SUMMARIES } from '../data/examples';

export default function Cases() {
  return (
    <div className="page">
      <div className="page-container">
        <h1 className="page-title">案例库</h1>
        <p className="page-subtitle">内置 4 个完整非遗短片案例，点击即可进入 AI 导演台查看全部内容</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 24,
        }}>
          {CASE_SUMMARIES.map((c, i) => (
            <CaseCard key={c.slug} data={c} index={i} />
          ))}
        </div>

        <div className="card" style={{ marginTop: 48, textAlign: 'center', padding: '32px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 12 }}>
            每个案例包含完整的创意概览、角色设定、场景设定、8 个分镜、提示词、声音设计、文化表达检查等全部模块。
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            案例数据将在后续阶段逐步完善为完整内容。点击卡片即可体验 AI 导演台界面。
          </p>
        </div>
      </div>
    </div>
  );
}