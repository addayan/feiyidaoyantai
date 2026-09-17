import { describe, it, expect } from 'vitest';
import { calculateGeneratabilityScore } from './score';

function makeShot(overrides: Record<string, unknown> = {}) {
  return {
    firstFramePrompt: '一位匠人在室内工坊雕刻木雕',
    lastFramePrompt: '匠人手持刻刀专注雕刻',
    videoPrompt: '匠人在木屑中沉稳雕刻',
    camera: '固定',
    ...overrides,
  };
}

describe('calculateGeneratabilityScore', () => {
  it('理想镜头得高分', () => {
    const r = calculateGeneratabilityScore(makeShot());
    expect(r.score).toBeGreaterThanOrEqual(90);
    expect(r.score).toBeLessThanOrEqual(100);
    expect(r.checks.length).toBe(8);
  });

  it('冲突动作扣分并给出 warning', () => {
    const r = calculateGeneratabilityScore(makeShot({
      videoPrompt: '匠人一边雕刻一边说话，同时环顾四周',
    }));
    const conflict = r.checks.find(c => c.label === '冲突动作');
    expect(conflict?.status).toBe('warning');
    expect(r.score).toBeLessThan(100);
  });

  it('复杂运镜扣分', () => {
    const r = calculateGeneratabilityScore(makeShot({ camera: '环绕' }));
    const camCheck = r.checks.find(c => c.label === '运镜复杂度');
    expect(camCheck?.status).toBe('warning');
    expect(r.score).toBeLessThanOrEqual(90);
  });

  it('首尾帧环境变化扣分', () => {
    const r = calculateGeneratabilityScore(makeShot({
      firstFramePrompt: '白天在室外街道上的匠人',
      lastFramePrompt: '夜晚在室内工坊里的匠人',
      videoPrompt: '匠人在工坊中',
    }));
    const envCheck = r.checks.find(c => c.label === '环境变化');
    expect(envCheck?.status).toBe('warning');
  });

  it('提示词过短扣分', () => {
    const r = calculateGeneratabilityScore(makeShot({
      firstFramePrompt: '人',
      lastFramePrompt: '人',
      videoPrompt: '人',
    }));
    const lenCheck = r.checks.find(c => c.label === '提示词长度');
    expect(lenCheck?.status).toBe('warning');
  });

  it('同时事件扣分', () => {
    const r = calculateGeneratabilityScore(makeShot({
      videoPrompt: '与此同时，远处的锣鼓声响起，人群开始聚集',
    }));
    const eventCheck = r.checks.find(c => c.label === '同时事件');
    expect(eventCheck?.status).toBe('warning');
  });

  it('评分始终被限制在 0-100', () => {
    const r = calculateGeneratabilityScore(makeShot({
      camera: '环绕',
      videoPrompt: '匠人一边雕刻一边说话，与此同时周围的人同时鼓掌，多个事件同时发生',
    }));
    expect(r.score).toBeGreaterThanOrEqual(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
