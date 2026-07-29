import type { Project, GenerationRecord } from '../types';

const STORAGE_KEY = 'heritage-studio-projects';

export function getAllProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Project[];
  } catch {
    return [];
  }
}

export function getProject(id: string): Project | null {
  const all = getAllProjects();
  return all.find(p => p.id === id) ?? null;
}

export function createProject(project: Project): void {
  const all = getAllProjects();
  all.unshift(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function updateProject(id: string, data: Partial<Project['data']>): void {
  const all = getAllProjects();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    updatedAt: new Date().toISOString(),
    data: { ...all[idx].data, ...data },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function deleteProject(id: string): void {
  const all = getAllProjects().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
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
  const all = getAllProjects();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  all[idx] = {
    ...all[idx],
    updatedAt: new Date().toISOString(),
    data: { ...all[idx].data, title: newName },
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function addGenerationRecord(id: string, record: GenerationRecord): void {
  const all = getAllProjects();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return;
  const history = all[idx].generationHistory ? [...all[idx].generationHistory, record] : [record];
  all[idx] = {
    ...all[idx],
    generationHistory: history,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}