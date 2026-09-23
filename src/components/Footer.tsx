export default function Footer() {
  return <footer style={{
    borderTop: '1px solid var(--border)',
    padding: '32px 24px',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: 12,
    lineHeight: 2,
  }}>
    <div style={{ color: 'var(--gold)', letterSpacing: 3, fontSize: 11, marginBottom: 6 }}>辽韵 AI 导演台</div>
    <div>辽宁非遗数字影像创作系统 · 医巫闾山满族剪纸</div>
    <div style={{ marginTop: 4, opacity: 0.6 }}>让传统文化被看见、被理解、再被继续讲述</div>
    <div style={{ marginTop: 8, fontSize: 11, opacity: 0.5 }}>V3.1.0</div>
  </footer>;
}
