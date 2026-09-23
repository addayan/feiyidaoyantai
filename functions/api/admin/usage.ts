import { readUsage } from '../../_lib/guard';

export const onRequestGet: PagesFunction = async (context) => {
  const kv = (context.env as any)?.ARK_CONFIG_KV as KVNamespace | undefined;
  const usage = await readUsage(kv);
  return new Response(JSON.stringify({ ok: true, ...usage }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
