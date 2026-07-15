/**
 * 统一剪贴板复制工具
 * 优先 navigator.clipboard，自动 fallback 到 textarea + execCommand
 */
export async function copyText(text: string): Promise<boolean> {
  // 尝试现代 Clipboard API（仅在安全上下文可用）
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // 权限被拒绝或不可用，继续 fallback
    }
  }

  // Fallback：隐藏 textarea + execCommand
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
}
