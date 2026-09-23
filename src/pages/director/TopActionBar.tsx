import type { Ref } from 'react';

interface TopActionBarProps {
  title: string;
  heritageType: string;
  style: string;
  duration: string;
  onCreateClick: () => void;
  onExportMarkdown: () => void;
  onExportProject: () => void;
  onImportClick: () => void;
  onCopyAllPrompts: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: Ref<HTMLInputElement>;
}

// ===== 导演台顶部信息栏 + 操作按钮 =====
export default function TopActionBar({
  title,
  heritageType,
  style,
  duration,
  onCreateClick,
  onExportMarkdown,
  onExportProject,
  onImportClick,
  onCopyAllPrompts,
  onFileChange,
  fileInputRef,
}: TopActionBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
        padding: '14px 20px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            background: 'rgba(52, 211, 153, 0.15)',
            color: 'var(--success)',
          }}
        >
          ✓ 生成完成
        </span>
        <span style={{ fontWeight: 600, fontSize: 17 }}>{title}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="tag">{heritageType}</span>
          <span className="tag tag-teal">{style}</span>
          <span className="tag">{duration}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <button className="btn btn-sm btn-ghost" onClick={onCreateClick}>继续创作</button>
        <button className="btn btn-sm btn-secondary" onClick={onExportMarkdown}>导出 Markdown</button>
        <button className="btn btn-sm btn-secondary" onClick={onExportProject} title="导出完整项目数据（含分镜、角色、场景）为 JSON 文件，可备份或分享">导出项目</button>
        <button className="btn btn-sm btn-ghost" onClick={onImportClick} title="从 JSON 文件导入项目">导入项目</button>
        <button className="btn btn-sm btn-teal" onClick={onCopyAllPrompts}>复制全部提示词</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
