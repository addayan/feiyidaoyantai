import { Link, useParams } from 'react-router-dom';
import { getHeritageBySlug } from '../data/heritageCatalog';

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '88px 1fr 38px', gap: 10, alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</span>
      <div style={{ height: 6, background: 'rgba(148,163,184,0.16)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, background: 'var(--gold)' }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

export default function HeritageDetail() {
  const { slug } = useParams<{ slug: string }>();
  const item = getHeritageBySlug(slug);

  if (!item) {
    return (
      <div className="page">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <h1>暂未找到这项非遗</h1>
          <p style={{ color: 'var(--text-muted)' }}>可以返回非遗库浏览，或者直接手动输入名称开始创作。</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 20 }}>
            <Link className="btn btn-secondary" to="/heritage">返回非遗库</Link>
            <Link className="btn btn-primary" to="/create">手动输入创作</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 80px' }}>
        <Link to="/heritage" style={{ fontSize: 13, color: 'var(--text-muted)' }}>← 返回非遗库</Link>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800 }}>{item.officialCategory}</div>
            <h1 className="heritage-title" style={{ fontSize: 42, margin: '6px 0 0' }}>{item.name}</h1>
            <p style={{ maxWidth: 680, color: 'var(--text-secondary)', lineHeight: 1.8 }}>{item.summary}</p>
          </div>
          <Link className="btn btn-primary" to={`/create?heritage=${item.slug}`}>
            用「{item.name}」开始创作
          </Link>
        </div>

    {item.officialName && <section className="card" style={{ marginTop: 24, lineHeight: 1.9 }}>
          <strong>文化事实层 · {item.officialName}</strong><p>{item.designation} · {item.projectCode} · {item.announcedAt} · {item.region}</p>
          <a href={item.sourceUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--gold)' }}>{item.sourceLabel} ↗</a><p style={{ fontSize: 12 }}>核验日期：{item.lastVerifiedAt}。以下 AI 创作档案属于创意建议，不是历史事实。</p>
        </section>}
        
        <div className="heritage-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 18, marginTop: 28 }}>
          <section className="card" style={{ padding: 22 }}>
            <h2 style={{ marginTop: 0 }}>AI 创作档案</h2>

            <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 22 }}>适合的视觉机制</h3>
            <ul style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              {item.ai.visualMechanisms.map(text => <li key={text}>{text}</li>)}
            </ul>

            <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 22 }}>适合的故事</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {item.ai.suitableStories.map(text => <span className="tag" key={text}>{text}</span>)}
            </div>

            <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 22 }}>推荐镜头</h3>
            <ul style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              {item.ai.goodShots.map(text => <li key={text}>{text}</li>)}
            </ul>

            <h3 style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 22 }}>AI 容易翻车</h3>
            <ul style={{ lineHeight: 1.8, color: 'var(--text-secondary)' }}>
              {item.ai.hardShots.map(text => <li key={text}>{text}</li>)}
            </ul>
          </section>

          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ marginTop: 0, fontSize: 17 }}>AI 影像适配度</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Score label="视觉" value={item.ai.visualStrength} />
                <Score label="动态" value={item.ai.motionStrength} />
                <Score label="故事" value={item.ai.storyStrength} />
                <Score label="稳定" value={item.ai.generationStability} />
                <Score label="文化风险" value={item.ai.culturalRisk} />
              </div>
            </div>

            <div className="card" style={{ padding: 20 }}>
              <h2 style={{ marginTop: 0, fontSize: 17 }}>材料与动作</h2>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.9 }}>
                <div><strong>材料：</strong>{item.typicalMaterials.join('、')}</div>
                <div><strong>动作：</strong>{item.typicalActions.join('、')}</div>
                <div><strong>推荐风格：</strong>{item.ai.suitableStyles.join('、')}</div>
              </div>
            </div>

            <div className="card" style={{ padding: 20, borderColor: 'rgba(245, 158, 11, .28)' }}>
              <h2 style={{ marginTop: 0, fontSize: 17 }}>文化注意</h2>
              <ul style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.8, paddingLeft: 18 }}>
                {item.ai.cautions.map(text => <li key={text}>{text}</li>)}
              </ul>
            </div>
          </aside>
        </div>

        <div className="card" style={{ padding: 18, marginTop: 18, color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.7 }}>
          文化资料用于事实核验；AI 创作档案提供视觉和叙事建议。具体纹样与素材仍需在制作时核对来源和授权。
        </div>
      </div>
    </div>
  );
}
