// 运行时 API 配置
// 生产模式：使用同源 /api（由 Cloudflare Pages Functions 提供，随 Pages 部署自动发布）
// V2.2.x：functions/ 端点与前端同源部署，无需单独 Worker Route
window.__API_BASE__ = '';
