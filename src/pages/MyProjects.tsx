import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { getAllProjects, deleteProject, renameProject } from '../store/projectStore';
import type { Project } from '../types';

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const refresh = () => setProjects(getAllProjects());

  useEffect(() => {
    refresh();
  }, []);

  const handleDelete = (id: string) => {
    deleteProject(id);
    refresh();
    setConfirmDeleteId(null);
  };

  const handleRename = (id: string) => {
    if (renameDraft.trim()) {
      renameProject(id, renameDraft.trim());
      refresh();
      setRenamingId(null);
      setRenameDraft('');
    }
  };

  const startRename = (p: Project) => {
    setRenamingId(p.id);
    setRenameDraft(p.data.title);
  };

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
            <div key={p.id} className="card" style={{ position: 'relative' }}>
              {/* 点击卡片主体进入导演台 */}
              <div
                onClick={() => navigate(`/director/${p.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span className="tag">{p.data.heritageType}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.data.duration}</span>
                </div>

                {renamingId === p.id ? (
                  <div style={{ marginBottom: 6 }} onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={renameDraft}
                      onChange={e => setRenameDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleRename(p.id);
                        if (e.key === 'Escape') { setRenamingId(null); setRenameDraft(''); }
                      }}
                      autoFocus
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-gold)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-primary)',
                        fontSize: 16,
                        fontWeight: 600,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <button className="btn btn-sm btn-primary" onClick={() => handleRename(p.id)}>保存</button>
                      <button className="btn btn-sm btn-ghost" onClick={() => { setRenamingId(null); setRenameDraft(''); }}>取消</button>
                    </div>
                  </div>
                ) : (
                  <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{p.data.title}</h3>
                )}

                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.5 }}>
                  {p.data.tagline}
                </p>
                <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                  <span className="tag tag-teal">{p.data.style}</span>
                  <span className="tag">{p.data.purpose}</span>
                </div>
              </div>

              {/* 底部操作栏 */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: 12, borderTop: '1px solid var(--border)',
                fontSize: 12, color: 'var(--text-muted)',
              }}>
                <span>创建：{new Date(p.createdAt).toLocaleDateString('zh-CN')}</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    className="btn btn-sm btn-ghost"
                    style={{ padding: '4px 8px', fontSize: 12 }}
                    onClick={(e) => { e.stopPropagation(); startRename(p); }}
                  >
                    重命名
                  </button>
                  {confirmDeleteId === p.id ? (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn btn-sm"
                        style={{ padding: '4px 8px', fontSize: 12, background: 'rgba(248,113,113,0.15)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      >
                        确认删除
                      </button>
                      <button
                        className="btn btn-sm btn-ghost"
                        style={{ padding: '4px 8px', fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }}
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-sm btn-ghost"
                      style={{ padding: '4px 8px', fontSize: 12, color: 'var(--error)' }}
                      onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(p.id); }}
                    >
                      删除
                    </button>
                  )}
                  <span style={{ color: 'var(--gold)', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(`/director/${p.id}`)}>继续创作 →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}