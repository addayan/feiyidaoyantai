import { useNavigate } from 'react-router-dom';
import type { CaseSummary } from '../types';

interface Props {
  data: CaseSummary;
  index: number;
}

export default function CaseCard({ data, index }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/director/${data.slug}?mode=example`);
  };

  const colors = [
    'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(45,212,191,0.08))',
    'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(212,168,83,0.1))',
    'linear-gradient(135deg, rgba(45,212,191,0.15), rgba(99,102,241,0.08))',
    'linear-gradient(135deg, rgba(212,168,83,0.12), rgba(168,85,247,0.08))',
  ];

  return (
    <div
      className="card card-clickable hero-case-card animate-fade-in"
      onClick={handleClick}
      style={{
        background: colors[index % colors.length],
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="tag">{data.heritageType}</span>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{data.duration}</span>
      </div>

      <div>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: 6,
        }}>
          {data.title}
        </h3>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {data.tagline}
        </p>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'auto',
        paddingTop: 12,
        borderTop: '1px solid var(--border)',
      }}>
        <span className="tag tag-teal">{data.style}</span>
        <span style={{
          fontSize: 13,
          color: 'var(--gold)',
          fontWeight: 500,
        }}>
          查看案例 →
        </span>
      </div>
    </div>
  );
}