export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      background: 'rgba(10, 14, 26, 0.6)',
      backdropFilter: 'blur(12px)',
      padding: '28px 24px 20px',
      marginTop: 'auto',
    }}>
      {/* 上层：品牌 + 创作者署名 */}
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        {/* 左侧品牌 */}
        <div style={{ flexShrink: 0 }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
            letterSpacing: '0.5px',
          }}>
            非遗影像工坊
          </div>
          <div style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}>
            AI 非遗短片导演台 · 让 AI 当你的非遗短片导演
          </div>
        </div>

        {/* 右侧创作者 */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontSize: 11,
            color: 'var(--text-muted)',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}>
            Designed &amp; Developed by
          </div>
          <div style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            justifyContent: 'flex-end',
          }}>
            阿岩
            <span style={{
              fontSize: 9,
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--gold-dim)',
              border: '1px solid var(--border-gold)',
              color: 'var(--gold)',
              fontWeight: 500,
            }}>
              Creator
            </span>
          </div>
        </div>
      </div>

      {/* 分割线 */}
      <hr style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto 14px',
        border: 'none',
        borderTop: '1px solid var(--border)',
      }} />

      {/* 下层：比赛标签 + 版权 */}
      <div style={{
        maxWidth: 'var(--container-max)',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: 11,
        color: 'var(--text-muted)',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        <div style={{
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}>
          <span style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(212,168,83,0.08)',
            border: '1px solid var(--border-gold)',
            color: 'var(--gold)',
            fontSize: 10,
            fontWeight: 500,
          }}>
            TRAE AI 创造力大赛参赛作品
          </span>
          <span>V2.1.0</span>
        </div>
        <div>
          &copy; 2026 非遗影像工坊 · All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
