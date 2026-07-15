const PIPELINE_STEPS = [
  { label: '用户创意', desc: '输入非遗主题和创作参数', done: true, color: 'var(--text-primary)' },
  { label: '豆包大模型创意策划', desc: 'AI 理解主题、构思故事', done: true, color: 'var(--gold)' },
  { label: '故事 / 角色 / 场景', desc: '生成完整创意框架', done: true, color: 'var(--gold)' },
  { label: 'AI 分镜导演台', desc: '8 镜头分镜 + 提示词 + 可生成性评分', done: true, color: 'var(--gold)' },
  { label: 'Seedream 图像生成', desc: '基于首帧/尾帧提示词生成图片', done: false, color: 'var(--teal)' },
  { label: 'Seedance 视频镜头生成', desc: '基于视频提示词生成视频片段', done: false, color: 'var(--teal)' },
  { label: 'AI 非遗短片生产包', desc: '完整的短片前期制作方案', done: true, color: 'var(--gold)' },
];

export default function TechRoadmap() {
  return (
    <div className="page">
      <div className="page-container" style={{ maxWidth: 800 }}>
        <h1 className="page-title">技术路线</h1>
        <p className="page-subtitle">从创意到成片的完整 AI 工作流</p>

        {/* 流程图 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 48 }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 20 }}>
              {/* 左侧节点 */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 48,
                flexShrink: 0,
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: step.done ? 'var(--gold-dim)' : 'rgba(255,255,255,0.04)',
                  border: `2px solid ${step.done ? 'var(--gold)' : 'var(--border)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 14,
                  color: step.done ? 'var(--gold)' : 'var(--text-muted)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {step.done ? '✓' : i + 1}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div style={{
                    width: 2,
                    flex: 1,
                    minHeight: 40,
                    background: step.done ? 'var(--border-gold)' : 'var(--border)',
                    margin: '4px 0',
                  }} />
                )}
              </div>

              {/* 右侧内容 */}
              <div style={{ paddingBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: step.color }}>
                    {step.label}
                  </h3>
                  {!step.done && (
                    <span style={{
                      fontSize: 11, padding: '2px 8px', borderRadius: 10,
                      background: 'var(--teal-dim)', color: 'var(--teal)',
                    }}>
                      预留
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="divider" />

        {/* 说明 */}
        <div className="card" style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gold)', marginBottom: 16 }}>当前 V2 第一阶段实现状态</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              ['已实现', '完整 UI 骨架、路由系统、首页、案例库、AI 导演台界面'],
              ['已实现', '项目 localStorage 存储、案例数据结构、类型系统'],
              ['已预留', '豆包大模型 / 火山方舟 API 接口（.env + 后端代理）'],
              ['已预留', 'Seedream 图像生成、Seedance 视频生成接口'],
              ['待实现', '真实 AI 文本生成、局部重新生成、AI 优化'],
              ['待实现', 'Markdown 导出、AI 视频可生成性深度分析'],
            ].map(([status, text], i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 12, padding: '2px 8px', borderRadius: 10, flexShrink: 0, marginTop: 2,
                  background: status === '已实现' ? 'rgba(52,211,153,0.15)' : status === '已预留' ? 'var(--teal-dim)' : 'rgba(255,255,255,0.05)',
                  color: status === '已实现' ? 'var(--success)' : status === '已预留' ? 'var(--teal)' : 'var(--text-muted)',
                }}>
                  {status}
                </span>
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 技术栈 */}
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--gold)', marginBottom: 16 }}>技术栈</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['React 18', 'TypeScript', 'Vite', 'React Router', 'Node.js', 'Express', '豆包大模型', 'Seedream', 'Seedance'].map(t => (
              <span key={t} className="tag tag-teal">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}