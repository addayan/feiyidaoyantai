import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0e1a',
          color: '#f1f5f9',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 500, padding: 32 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              margin: '0 auto 20px', background: 'rgba(248, 113, 113, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28,
            }}>
              ⚠️
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
              页面渲染出错
            </h2>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 8 }}>
              {this.state.error?.message || '未知错误'}
            </p>
            <details style={{ textAlign: 'left', marginTop: 16, fontSize: 12, color: '#64748b' }}>
              <summary style={{ cursor: 'pointer', marginBottom: 8 }}>错误堆栈</summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                marginTop: 24, padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#d4a853', color: '#0a0e1a', border: 'none',
                borderRadius: 10, cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
