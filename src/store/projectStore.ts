import type { Project, GenerationRecord } from '../types';

const STORAGE_KEY = 'heritage-studio-projects';
/** localStorage 容量安全阈值（Chrome 默认约 5MB，留 10% 余量） */
const SAFE_SIZE_LIMIT = 4_500_000;
/** 存储写入失败时派发的事件名（供 UI 层提示用户） */
export const STORAGE_ERROR_EVENT = 'heritage-storage-error';

// 内存缓存：避免每次读写都全量 JSON.parse/stringify
let cache: Project[] | null = null;

function loadAll(): Project[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cache = raw ? (JSON.parse(raw) as Project[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

/** 通知 UI：存储写入失败或接近容量上限 */
function notifyStorageError(message: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: { message } }));
  } catch {
    // 事件派发失败不影响主流程
  }
}

/**
 * 安全写入：先更新内存缓存（当前会话不丢数据），
 * localStorage 失败时发事件提示用户，不静默吞掉。
 */
function persist(all: Project[]): boolean {
  cache = all;
  try {
    const serialized = JSON.stringify(all);
    // 容量预检：接近上限时提前提醒（仍尝试写入）
    if (serialized.length > SAFE_SIZE_LIMIT) {
      notifyStorageError('本地存储接近容量上限，项目较多时建议定期导出 JSON 备份，防止后续保存失败。');
    }
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (err) {
    const name = err instanceof Error ? err.name : String(err);
    const isQuota = name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED';
    console.warn(
      `[projectStore] localStorage 写入失败（${isQuota ? '容量不足' : name}），当前会话数据已保留在内存`,
      err
    );
    notifyStorageError(
      isQuota
        ? '本地存储空间已满，本次改动只保留到当前会话。请导出项目 JSON 备份后清理不用的项目。'
        : '本地保存失败（浏览器存储不可用），本次改动只保留到当前会话。'
    );
    return false;
  }
}

// 多标签页同步：其他标签页写入后失效本地缓存，避免读到旧数据
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) cache = null;
  });
}

export function getAllProjects(): Project[] {
  return loadAll();
}

export function getProject(id: string): Project | null {
  const all = loadAll();
  return all.find(p => p.id === id) ?? null;
}

export function createProject(project: Project): void {
  const all = loadAll();
  all.unshift(project);
  persist(all);
}

export function updateProject(id: string, data: Partial<Project['data']>): void {
  const all = loadAll();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    updatedAt: new Date().toISOString(),
    data: { ...all[idx].data, ...data },
  };
  persist(all);
}

export function deleteProject(id: string): void {
  const all = loadAll().filter(p => p.id !== id);
  persist(all);
}

export function duplicateProject(id: string): Project | null {
  const source = getProject(id);
  if (!source) return null;
  const now = new Date().toISOString();
  const dup: Project = {
    ...JSON.parse(JSON.stringify(source)),
    id: `proj-${Date.now()}`,
    slug: `proj-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    isExample: false,
  };
  createProject(dup);
  return dup;
}

export function renameProject(id: string, newName: string): void {
  const all = loadAll();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    updatedAt: new Date().toISOString(),
    data: { ...all[idx].data, title: newName },
  };
  persist(all);
}

export function addGenerationRecord(id: string, record: GenerationRecord): void {
  const all = loadAll();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  const history = all[idx].generationHistory ? [...all[idx].generationHistory, record] : [record];
  all[idx] = {
    ...all[idx],
    generationHistory: history,
  };
  persist(all);
}
