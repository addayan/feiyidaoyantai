import { Link } from 'react-router-dom';

interface Props {
  title?: string;
  description?: string;
}

export default function EmptyState({
  title = '还没有保存的项目',
  description = '开始你的第一次 AI 非遗短片创作吧',
}: Props) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 24px',
      textAlign: 'center',
    }}>
      <div style={{
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'var(--gold-dim)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 36,
        marginBottom: 24,
      }}>
        📁
      </div>

      <h3 style={{
        fontSize: 20,
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: 8,
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: 15,
        color: 'var(--text-muted)',
        marginBottom: 32,
        maxWidth: 360,
      }}>
        {description}
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/create" className="btn btn-primary">
          开始 AI 创作
        </Link>
        <Link to="/cases" className="btn btn-secondary">
          浏览案例
        </Link>
      </div>
    </div>
  );
}