import { DIRECTOR_SECTIONS, type DirectorSection } from '../../types';
import { SECTION_MAP } from './constants';

interface SidebarNavProps {
  isExample?: boolean;
  title: string;
  tagline: string;
  activeSection: DirectorSection;
  onNavigate: (id: string) => void;
}

// ===== 导演台左侧 sticky 章节导航 =====
export default function SidebarNav({ isExample, title, tagline, activeSection, onNavigate }: SidebarNavProps) {
  return (
    <aside
      style={{
        position: 'sticky',
        top: 'calc(var(--nav-height) + 24px)',
        width: 'var(--sidebar-width)',
        alignSelf: 'flex-start',
        flexShrink: 0,
        maxHeight: 'calc(100vh - var(--nav-height) - 48px)',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          padding: '16px 16px 12px',
          borderBottom: '1px solid var(--border)',
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          {isExample ? '示例案例' : '已自动保存'}
        </div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
          {title}
        </h3>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
          {tagline}
        </p>
      </div>

      <nav>
        {DIRECTOR_SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => onNavigate(SECTION_MAP.find((m) => m.key === s.key)!.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '9px 16px',
              textAlign: 'left',
              background: activeSection === s.key ? 'var(--gold-dim)' : 'transparent',
              color: activeSection === s.key ? 'var(--gold)' : 'var(--text-secondary)',
              borderLeft: activeSection === s.key ? '3px solid var(--gold)' : '3px solid transparent',
              fontSize: 13,
              transition: 'all 0.2s',
              borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: activeSection === s.key ? 'var(--gold)' : 'var(--text-muted)',
                width: 22,
                flexShrink: 0,
              }}
            >
              {s.num}
            </span>
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
