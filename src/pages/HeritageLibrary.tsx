import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OFFICIAL_CATEGORIES, searchHeritage } from '../data/heritageCatalog';

export default function HeritageLibrary() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('全部');

  const results = useMemo(() => {
    const searched = searchHeritage(query);
    if (category === '全部') return searched;
    return searched.filter(item => item.officialCategory === category);
  }, [query, category]);

  return (
    <div className="page">
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', padding: '48px 24px 80px' }}>
        <header style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800, letterSpacing: '0.12em', marginBottom: 10 }}>
            V3.0 · 非遗知识库
          </div>
          <h1 style={{ fontSize: 36, margin: 0, lineHeight: 1.2 }}>了解非遗，再开始创作</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 760, lineHeight: 1.8, marginTop: 12 }}>
            V3.0 先用“剪纸、玉雕、高跷、皮影”这类普通人能理解的创作大类做入口。
            后续逐步同步国家级项目、地域子项与官方资料，知识库与 AI 创作导演台共用同一套数据。
          </p>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) auto',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜索：剪纸、玉雕、高跷、皮影……"
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              background: 'var(--bg-input)',
              color: 'var(--text-primary)',
              fontSize: 15,
              outline: 'none',
            }}
          />
          <Link to="/create" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center' }}>
            开始创作
          </Link>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
          {['全部', ...OFFICIAL_CATEGORIES].map(item => {
            const active = item === category;
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                style={{
                  padding: '7px 11px',
                  borderRadius: 999,
                  border: active ? '1px solid var(--gold)' : '1px solid var(--border)',
                  background: active ? 'var(--gold-dim)' : 'transparent',
                  color: active ? 'var(--gold)' : 'var(--text-secondary)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {results.map(item => (
            <Link
              key={item.slug}
              to={`/heritage/${item.slug}`}
              className="card"
              style={{
                display: 'block',
                padding: 20,
                minHeight: 220,
                textDecoration: 'none',
                border: '1px solid var(--border)',
                transition: 'transform .15s ease, border-color .15s ease',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                {item.officialCategory}
              </div>
              <h2 style={{ fontSize: 22, margin: 0, color: 'var(--text-primary)' }}>{item.name}</h2>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)', marginTop: 10 }}>
                {item.summary}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 14 }}>
                {item.keywords.slice(0, 4).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
              <div style={{ marginTop: 16, fontSize: 12, color: 'var(--gold)' }}>
                AI 视觉 {item.ai.visualStrength} · 故事 {item.ai.storyStrength} · 生成稳定 {item.ai.generationStability}
              </div>
            </Link>
          ))}
        </div>

        {results.length === 0 && (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            暂时没有匹配的种子资料。你仍然可以在“开始创作”里手动输入任何非遗名称。
          </div>
        )}

        <div
          className="card"
          style={{
            marginTop: 28,
            padding: 18,
            borderStyle: 'dashed',
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontSize: 13,
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>数据说明：</strong>
          当前页面是 V3.0 的“创作大类种子库”，不是全国非遗最终完整名录。
          数据结构已经为国家级、省级、市级、县级项目、地区、项目编号、保护单位和官方来源预留字段。
        </div>
      </div>
    </div>
  );
}
