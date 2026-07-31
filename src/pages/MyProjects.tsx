import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { getAllProjects, deleteProject, renameProject, createProject } from '../store/projectStore';
import type { Project } from '../types';

export default function MyProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () => setProjects(getAllProjects());

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // 导入项目 JSON（V2.2.0 新增）
  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data || !parsed.data.title) {
          showToast('导入失败：文件格式不正确');
          return;
        }
        const now = new Date().toISOString();
        const newProject: Project = {
          ...parsed,
          id: `proj-${Date.now()}`,
          slug: `proj-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          isExample: false,
        };
        delete (newProject as any)._exportMeta;
        createProject(newProject);
        showToast(`项目「${newProject.data.title}」导入成功`);
        refresh();
        setTimeout(() => navigate('/director/' + newProject.id), 800);
      } catch (err) {
        showToast('导入失败：JSON 解析错误');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, [navigate, showToast]);

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
          <div style={{ marginBottom: 24 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => fileInputRef.current?.click()} title="从 JSON 文件导入项目">
              导入项目
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </div>
          <EmptyState />
          {toast && (
            <div style={{
              position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(10,14,26,0.95)', border: '1px solid var(--border-gold)',
              color: 'var(--gold)', padding: '10px 20px', borderRadius: 'var(--radius-sm)',
              fontSize: 14, zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            }}>
              {toast}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-container">
        <h1 className="page-title">我的项目</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <p className="page-subtitle" style={{ margin: 0 }}>共 {projects.length} 个项目</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm btn-secondary" onClick={() => fileInputRef.current?.click()} title="从 JSON 文件导入项目">
              导入项目
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

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
        {toast && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(10,14,26,0.95)', border: '1px solid var(--border-gold)',
            color: 'var(--gold)', padding: '10px 20px', borderRadius: 'var(--radius-sm)',
            fontSize: 14, zIndex: 2000, boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}