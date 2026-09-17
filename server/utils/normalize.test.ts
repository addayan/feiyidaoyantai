import { describe, it, expect } from 'vitest';
import { validateShotDetailFields, fillMissingShotDetails, normalizeGeneratedResult } from './normalize';

const request = { heritageType: '剪纸', topic: '窗花', purpose: '宣传', duration: '1分钟', style: '纪实' };

describe('validateShotDetailFields', () => {
  it('移除非法枚举值，保留合法值', () => {
    const shot: Record<string, unknown> = { composition: '非法构图', lighting: '自然光', cameraAngle: '平视' };
    validateShotDetailFields(shot);
    expect(shot.composition).toBeUndefined();
    expect(shot.lighting).toBe('自然光');
    expect(shot.cameraAngle).toBe('平视');
  });

  it('null 值不处理', () => {
    const shot: Record<string, unknown> = { composition: null };
    validateShotDetailFields(shot);
    expect(shot.composition).toBeNull();
  });
});

describe('fillMissingShotDetails', () => {
  it('根据景别和描述推断细节字段', () => {
    const shot: Record<string, unknown> = { shotSize: '特写', description: '温暖室内', camera: '固定' };
    fillMissingShotDetails(shot, 0, 8);
    expect(shot.composition).toBe('中心构图');
    expect(shot.depthOfField).toBe('浅景深');
    expect(shot.lighting).toBe('暖光');
  });

  it('末镜头转场为淡入淡出', () => {
    const shot: Record<string, unknown> = { description: '' };
    fillMissingShotDetails(shot, 7, 8);
    expect(shot.transition).toBe('淡入淡出');
  });

  it('中间镜头转场为硬切', () => {
    const shot: Record<string, unknown> = { description: '' };
    fillMissingShotDetails(shot, 3, 8);
    expect(shot.transition).toBe('硬切');
  });

  it('已有字段不被覆盖', () => {
    const shot: Record<string, unknown> = { composition: '三分法', description: '温暖室内' };
    fillMissingShotDetails(shot, 0, 8);
    expect(shot.composition).toBe('三分法');
  });
});

describe('normalizeGeneratedResult', () => {
  it('不足 8 个镜头时补齐为 8 个', () => {
    const r = normalizeGeneratedResult({ title: '测试', shots: [{ id: 'shot-1' }, { id: 'shot-2' }] }, request);
    expect(r.shots.length).toBe(8);
    expect(r.shots[0].id).toBe('shot-1');
    expect(r.shots[7].id).toBe('shot-8');
  });

  it('超过 8 个镜头时截取前 8 个', () => {
    const shots = Array.from({ length: 12 }, (_, i) => ({ id: `raw-${i + 1}` }));
    const r = normalizeGeneratedResult({ shots }, request);
    expect(r.shots.length).toBe(8);
    expect(r.shots[7].id).toBe('shot-8');
  });

  it('缺失标题时根据 topic 生成', () => {
    const r = normalizeGeneratedResult({ shots: [] }, request);
    expect(r.title).toContain('窗花');
  });

  it('每个镜头补齐必填字段和 7 个细节字段', () => {
    const r = normalizeGeneratedResult({ title: 't', shots: [{ description: '温暖室内' }] }, request);
    const shot = r.shots[0];
    const detailFields = ['composition', 'lighting', 'cameraAngle', 'depthOfField', 'speed', 'mood', 'transition'];
    for (const f of detailFields) {
      expect(shot[f], `字段 ${f} 应被补齐`).toBeTruthy();
    }
    expect(shot.firstFramePrompt).toBeTruthy();
    expect(shot.videoPrompt).toBeTruthy();
  });

  it('generatabilityScore 在 0-100 且 checks 完整', () => {
    const r = normalizeGeneratedResult({ title: 't', shots: [{ description: 'x' }] }, request);
    const shot = r.shots[0];
    expect(shot.generatabilityScore).toBeGreaterThanOrEqual(0);
    expect(shot.generatabilityScore).toBeLessThanOrEqual(100);
    expect(shot.generatabilityChecks.length).toBe(8);
  });

  it('返回结构包含全部模块', () => {
    const r = normalizeGeneratedResult({ shots: [] }, request);
    for (const key of ['title', 'tagline', 'story', 'characters', 'scenes', 'shots', 'soundDesign', 'cultureCheck', 'submissionNote', 'socialPosts', 'generationMeta']) {
      expect(r[key], `缺少字段 ${key}`).toBeTruthy();
    }
  });
});
