import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: '首页' },
  { path: '/heritage', label: '了解非遗' },
  { path: '/create', label: '开始创作' },
  { path: '/my-projects', label: '我的项目' },
  { path: '/tech-roadmap', label: '技术路线' },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // 路由切换后自动收起移动端菜单
  const closeOnNavigate = () => setOpen(false);

  return (
    <nav
      className="app-nav"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav-height)',
        background: 'rgba(10, 14, 26, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        zIndex: 1000,
      }}
    >
      <div className="nav-inner">
        <Link to="/" className="nav-brand" onClick={closeOnNavigate}>
          <span className="nav-title">辽韵 AI 导演台</span>
          <span className="nav-badge">辽宁非遗</span>
        </Link>

        {/* 桌面端：水平导航 */}
        <div className="nav-links" role="menubar">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              role="menuitem"
              className="nav-link"
              data-active={isActive(item.path) ? '1' : '0'}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 移动端：汉堡按钮（仅小屏显示） */}
        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`nav-toggle-bar ${open ? 'is-open' : ''}`} />
        </button>
      </div>

      {/* 移动端：展开的下拉菜单 */}
      {open && (
        <div className="nav-drawer">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="nav-drawer-link"
              data-active={isActive(item.path) ? '1' : '0'}
              onClick={closeOnNavigate}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
