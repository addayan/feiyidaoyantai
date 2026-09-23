import { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import { STORAGE_ERROR_EVENT } from './store/projectStore';
import Home from './pages/Home';

// ===== 路由级代码分割：非首屏页面懒加载 =====
const Create = lazy(() => import('./pages/Create'));
const CreateV3 = lazy(() => import('./pages/CreateV3'));
const Director = lazy(() => import('./pages/Director'));
const HeritageLibrary = lazy(() => import('./pages/HeritageLibrary'));
const HeritageDetail = lazy(() => import('./pages/HeritageDetail'));
const Cases = lazy(() => import('./pages/Cases'));
const MyProjects = lazy(() => import('./pages/MyProjects'));
const TechRoadmap = lazy(() => import('./pages/TechRoadmap'));
const AdminConfig = lazy(() => import('./pages/AdminConfig'));
const NotFound = lazy(() => import('./pages/NotFound'));

// 路由切换时的轻量加载占位
function RouteFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh', color: 'var(--text-muted, #7d93ab)', fontSize: 14 }}>
      加载中…
    </div>
  );
}

// 本地存储写入失败/容量告警的全局提示（右上角可关闭）
function StorageWarning() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      if (detail?.message) setMsg(detail.message);
    };
    window.addEventListener(STORAGE_ERROR_EVENT, handler);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, handler);
  }, []);

  if (!msg) return null;
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        maxWidth: 340,
        background: '#7f1d1d',
        color: '#fff',
        padding: '10px 14px',
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.5,
        boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
      }}
    >
      {msg}
      <button
        onClick={() => setMsg(null)}
        aria-label="关闭提示"
        style={{ marginLeft: 8, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15 }}
      >
        ×
      </button>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/heritage" element={<HeritageLibrary />} />
              <Route path="/heritage/:slug" element={<HeritageDetail />} />
              <Route path="/create" element={<CreateV3 />} />
              <Route path="/create-classic" element={<Create />} />
              <Route path="/director/:projectId" element={<Director />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/tech-roadmap" element={<TechRoadmap />} />
              <Route path="/admin" element={<AdminConfig />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <StorageWarning />
      </div>
    </ErrorBoundary>
  );
}
