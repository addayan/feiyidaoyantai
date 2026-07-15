import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { getAllProjects } from '../store/projectStore';
import type { Project } from '../types';

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setProjects(getAllProjects());
  }, []);

  if (projects.length === 0) {
    return (
      <div className="page">
        <div className="page-container">
          <h1 className="page-title">我的项目</h1>
          <p className="page-subtitle">AI 生成的非遗短片方案会自动保存在这里</p>
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">
        <h1 className="page-title">我的项目</h1>
        <p className="page-subtitle">共 {projects.length} 个项目</p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {projects.map(p => (
            <div key={p.id} className="card card-clickable" onClick={() => navigate(`/director/${p.id}`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="tag">{p.data.heritageType}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.data.duration}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{p.data.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                {p.data.tagline}
              </p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                <span className="tag tag-teal">{p.data.style}</span>
                <span className="tag">{p.data.purpose}</span>
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 12, borderTop: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                <span>创建：{new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                <span style={{ color: 'var(--gold)', fontWeight: 500 }}>继续创作 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}