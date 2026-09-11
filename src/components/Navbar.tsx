import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: '首页' },
  { path: '/heritage', label: '了解非遗' },
  { path: '/create', label: '开始创作' },
  { path: '/cases', label: '案例库' },
  { path: '/my-projects', label: '我的项目' },
  { path: '/tech-roadmap', label: '技术路线' },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 'var(--nav-height)',
      background: 'rgba(10, 14, 26, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        width: '100%',
        maxWidth: 'var(--container-max)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontSize: 20,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 20%, var(--gold) 80%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 1px 8px rgba(212,168,83,0.12))',
          }}>
            非遗影像工坊
          </span>
          <span style={{
            fontSize: 11,
            color: 'var(--gold)',
            border: '1px solid rgba(212,168,83,.3)',
            borderRadius: 4,
            padding: '1px 6px',
          }}>
            V3.0 BETA
          </span>
        </Link>

        <div style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                padding: '8px 13px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 13,
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path) ? 'var(--gold)' : 'var(--text-secondary)',
                background: isActive(item.path) ? 'var(--gold-dim)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}