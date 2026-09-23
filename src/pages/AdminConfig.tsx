import { useCallback, useEffect, useState } from 'react';

interface ProviderForm {
  baseUrl: string;
  modelId: string;
  apiKey: string;
  timeoutMs: number;
}

type ProviderKind = 'chat' | 'image' | 'video';

const PROVIDERS: { kind: ProviderKind; title: string; desc: string; placeholderBaseUrl: string; placeholderModel: string }[] = [
  {
    kind: 'chat',
    title: '聊天模型',
    desc: '用于生成故事、分镜、提示词等文字内容（AI 真实生成）。',
    placeholderBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    placeholderModel: 'gemini-3.8-flash',
  },
  {
    kind: 'image',
    title: '图片模型',
    desc: '预留：用于 AI 生成图片（如 Seedream）。',
    placeholderBaseUrl: 'https://api.siliconflow.cn/v1',
    placeholderModel: 'black-forest-labs/FLUX.1-schnell',
  },
  {
    kind: 'video',
    title: '视频模型',
    desc: '预留：用于 AI 生成视频（如 Seedance）。',
    placeholderBaseUrl: 'https://api.siliconflow.cn/v1',
    placeholderModel: 'Wan-AI/Wan2.1-T2V-Turbo',
  },
];

const EMPTY_PROVIDER: ProviderForm = { baseUrl: '', modelId: '', apiKey: '', timeoutMs: 120000 };

const STYLE: Record<string, React.CSSProperties> = {
  page: { maxWidth: 760, margin: '0 auto', padding: '48px 24px 90px' },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 24, marginBottom: 16 },
  label: { display: 'block', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 },
  input: {
    width: '100%', padding: '10px 12px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-input)',
    color: 'var(--text-primary)', fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
  },
  btn: { padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  row: { display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'center', marginTop: 16 },
  tip: { fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7, marginTop: 12 },
};

function adminFetch(url: string, options: RequestInit = {}) {
  return fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
}

const KIND_LABEL: Record<ProviderKind, string> = { chat: '聊天模型', image: '图片模型', video: '视频模型' };

export default function AdminConfig() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<Record<ProviderKind, ProviderForm>>({
    chat: { ...EMPTY_PROVIDER },
    image: { ...EMPTY_PROVIDER },
    video: { ...EMPTY_PROVIDER },
  });
  const [hasKey, setHasKey] = useState<Record<ProviderKind, boolean>>({ chat: false, image: false, video: false });
  const [status, setStatus] = useState<{ kind: 'ok' | 'err' | 'info'; text: string } | null>(null);
  const [usage, setUsage] = useState<{ date: string; chat: number; image: number; video: number; total: number } | null>(null);

  const loadUsage = useCallback(async () => {
    try {
      const res = await adminFetch('/api/admin/usage', { method: 'GET' });
      if (res.ok) setUsage(await res.json());
    } catch { /* 用量读取失败不影响页面 */ }
  }, []);

  const setProvider = (kind: ProviderKind, key: keyof ProviderForm, value: string | number) =>
    setForm(f => ({ ...f, [kind]: { ...f[kind], [key]: value } }));

  const notify = (kind: 'ok' | 'err' | 'info', text: string) => setStatus({ kind, text });

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch('/api/admin/config', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) {
        notify('err', data?.error?.message || '读取配置失败');
        return;
      }
      const next: Record<ProviderKind, ProviderForm> = { chat: { ...EMPTY_PROVIDER }, image: { ...EMPTY_PROVIDER }, video: { ...EMPTY_PROVIDER } };
      const nextHas: Record<ProviderKind, boolean> = { chat: false, image: false, video: false };
      for (const kind of Object.keys(next) as ProviderKind[]) {
        const p = data[kind] || {};
        next[kind] = { baseUrl: p.baseUrl || '', modelId: p.modelId || '', apiKey: '', timeoutMs: p.timeoutMs || 120000 };
        nextHas[kind] = !!p.hasApiKey;
      }
      setHasKey(nextHas);
      setForm(next);
    } catch {
      notify('err', '无法连接配置接口，请确认在线上环境访问（本地开发无此接口）。');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadConfig(); loadUsage(); }, [loadConfig, loadUsage]);

  const doTest = async (kind: ProviderKind) => {
    const cfg = form[kind];
    setBusy(true);
    setStatus(null);
    try {
      if (!cfg.apiKey && !hasKey[kind] && !cfg.modelId) {
        notify('err', `请先填写 ${KIND_LABEL[kind]} 的 API Key 与模型 ID 再测试`);
        setBusy(false);
        return;
      }
      if (!cfg.apiKey) {
        notify('info', `${KIND_LABEL[kind]}使用已保存的 API Key 测试（请稍候，最长 30 秒）……`);
      }
      const payload = { provider: kind, config: { ...cfg, apiKey: cfg.apiKey || '' } };
      const res = await adminFetch('/api/admin/test', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        notify('err', data?.error?.message || '测试失败');
        return;
      }
      if (data.ok) {
        notify('ok', `${KIND_LABEL[kind]}连接成功（${data.latencyMs}ms）：${data.detail}`);
      } else {
        notify('err', `${KIND_LABEL[kind]}连接失败（${data.latencyMs}ms）：${data.detail}`);
      }
    } catch {
      notify('err', '测试请求失败');
    } finally {
      setBusy(false);
    }
  };

  const doSave = async (clear?: boolean) => {
    setBusy(true);
    setStatus(null);
    try {
      const payload = clear
        ? { clear: true }
        : {
            config: {
              chat: { ...form.chat, apiKey: form.chat.apiKey || '' },
              image: { ...form.image, apiKey: form.image.apiKey || '' },
              video: { ...form.video, apiKey: form.video.apiKey || '' },
            },
          };
      const res = await adminFetch('/api/admin/config', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) {
        notify('err', data?.error?.message || '保存失败');
        return;
      }
      const nextHas = { ...hasKey };
      for (const kind of Object.keys(nextHas) as ProviderKind[]) {
        if (data[kind]) nextHas[kind] = !!data[kind].hasApiKey;
      }
      setHasKey(nextHas);
      // 保存成功后保留输入框中的 Key（已安全存于服务端；留空=不改写，填入=覆盖）
      notify('ok', data.message || '保存成功');
    } catch {
      notify('err', '保存请求失败');
    } finally {
      setBusy(false);
    }
  };

  const renderProvider = (kind: ProviderKind, cfg: ProviderForm, hasKeyFlag: boolean) => {
    const meta = PROVIDERS.find(p => p.kind === kind)!;
    return (
      <>
        <div style={{ marginBottom: 14 }}>
          <label style={STYLE.label}>Base URL（服务地址，需以 http(s):// 开头）</label>
          <input value={cfg.baseUrl} onChange={e => setProvider(kind, 'baseUrl', e.target.value)} placeholder={meta.placeholderBaseUrl} style={STYLE.input} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={STYLE.label}>模型 ID（Model ID）</label>
          <input value={cfg.modelId} onChange={e => setProvider(kind, 'modelId', e.target.value)} placeholder={meta.placeholderModel} style={STYLE.input} />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={STYLE.label}>API Key（留空 = 保持不变；已{hasKeyFlag ? '有' : '未'}配置）</label>
          <input
            type="password"
            value={cfg.apiKey}
            onChange={e => setProvider(kind, 'apiKey', e.target.value)}
            placeholder={hasKeyFlag ? '已保存，留空保持不变' : '输入新的 API Key'}
            style={STYLE.input}
          />
        </div>
        <div style={{ marginBottom: 14 }}>
          <label style={STYLE.label}>请求超时（毫秒）</label>
          <input type="number" value={cfg.timeoutMs} onChange={e => setProvider(kind, 'timeoutMs', Number(e.target.value) || 120000)} style={STYLE.input} />
        </div>
        <div style={STYLE.row}>
          <button className="btn btn-secondary" onClick={() => doTest(kind)} disabled={busy} style={STYLE.btn}>测试连接</button>
        </div>
      </>
    );
  };

  return (
    <div className="page">
      <div style={STYLE.page}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800, letterSpacing: '.12em' }}>系统设置</div>
          <h1 style={{ fontSize: 30, margin: '8px 0 0' }}>模型与 API 配置</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 10 }}>
            按用途配置 AI 模型（聊天 / 图片 / 视频）。保存后立即生效。
          </p>
        </div>

        {loading ? (
          <div style={{ ...STYLE.card, textAlign: 'center', color: 'var(--text-muted)' }}>读取配置中…</div>
        ) : (
          <>
            {PROVIDERS.map(meta => (
              <div style={STYLE.card} key={meta.kind}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{meta.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>{meta.desc}</div>
                {renderProvider(meta.kind, form[meta.kind], hasKey[meta.kind])}
              </div>
            ))}

            <div style={STYLE.card}>
              <div style={STYLE.row}>
                <button className="btn btn-primary" onClick={() => doSave()} disabled={busy} style={STYLE.btn}>保存配置</button>
                <button className="btn btn-ghost" onClick={() => doSave(true)} disabled={busy} style={STYLE.btn}>清空配置（回退环境变量）</button>
                <button className="btn btn-ghost" onClick={loadConfig} disabled={busy} style={STYLE.btn}>重新读取</button>
              </div>
            </div>

            <div style={STYLE.card}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>今日 AI 用量</div>
              {usage ? (
                <div style={{ fontSize: 13, lineHeight: 1.9 }}>
                  <div>聊天：<b style={{ color: 'var(--gold)' }}>{usage.chat}</b> 次 | 图片：<b style={{ color: 'var(--gold)' }}>{usage.image}</b> 次 | 视频：<b style={{ color: 'var(--gold)' }}>{usage.video}</b> 次 | 今日合计：<b style={{ color: 'var(--gold)' }}>{usage.total}</b> 次</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>暂无数据（生成成功后更新）</div>
              )}
              <div style={STYLE.tip}>
                AI 流量保护 V1：聊天限速 8 次/分钟、最大并发 2；图片/视频限速 10 次/分钟、最大并发 2；10 秒内相同请求自动去重；相同结果 1 小时缓存。
              </div>
            </div>
          </>
        )}

        {status && (
          <div
            style={{
              padding: 12, borderRadius: 'var(--radius-md)', fontSize: 13, lineHeight: 1.6,
              border: `1px solid ${status.kind === 'ok' ? 'rgba(52,211,153,.4)' : status.kind === 'err' ? 'rgba(248,113,113,.4)' : 'rgba(148,163,184,.4)'}`,
              color: status.kind === 'ok' ? '#6ee7b7' : status.kind === 'err' ? '#fca5a5' : 'var(--text-secondary)',
              background: status.kind === 'ok' ? 'rgba(52,211,153,.08)' : status.kind === 'err' ? 'rgba(248,113,113,.08)' : 'rgba(148,163,184,.08)',
            }}
          >
            {status.text}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <a href="/" style={{ fontSize: 12, color: 'var(--text-muted)' }}>← 返回首页</a>
        </div>
      </div>
    </div>
  );
}
