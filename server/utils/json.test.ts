import { describe, it, expect } from 'vitest';
import { removeCodeFence, extractJSON, tryRepairTruncatedJSON, safeJSONParse } from './json';

describe('removeCodeFence', () => {
  it('去除 json 代码围栏', () => {
    expect(removeCodeFence('```json\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('去除无语言标注的代码围栏', () => {
    expect(removeCodeFence('```\n{"a":1}\n```')).toBe('{"a":1}');
  });

  it('无围栏时原样返回', () => {
    expect(removeCodeFence('{"a":1}')).toBe('{"a":1}');
  });
});

describe('extractJSON', () => {
  it('从前后说明文字中提取 JSON 主体', () => {
    expect(extractJSON('以下是生成结果：{"a":1,"b":[1,2]} 请查收')).toBe('{"a":1,"b":[1,2]}');
  });

  it('提取数组 JSON', () => {
    expect(extractJSON('结果如下 [1,2,3] 结束')).toBe('[1,2,3]');
  });

  it('无 JSON 结构时返回原文本', () => {
    expect(extractJSON('纯文本')).toBe('纯文本');
  });
});

describe('tryRepairTruncatedJSON', () => {
  it('补全缺失的闭合括号', () => {
    expect(tryRepairTruncatedJSON('{"a":1,')).toBe('{"a":1}');
  });

  it('去除末尾多余逗号', () => {
    expect(tryRepairTruncatedJSON('{"a":1,"b":2,}')).toBe('{"a":1,"b":2}');
  });

  it('补全未闭合的字符串引号', () => {
    expect(tryRepairTruncatedJSON('{"a":"abc')).toBe('{"a":"abc"}');
  });

  it('补全嵌套数组括号', () => {
    expect(tryRepairTruncatedJSON('{"shots":[{"id":"shot-1"},')).toBe('{"shots":[{"id":"shot-1"}]}');
  });
});

describe('safeJSONParse', () => {
  it('解析标准 JSON', () => {
    const r = safeJSONParse('{"a":1}');
    expect(r.error).toBeNull();
    expect(r.data).toEqual({ a: 1 });
  });

  it('解析带围栏和说明文字的 JSON', () => {
    const r = safeJSONParse('以下是分镜方案：\n```json\n{"shots":[{"id":"shot-1"}]}\n```\n以上。');
    expect(r.error).toBeNull();
    expect(r.data.shots[0].id).toBe('shot-1');
  });

  it('解析截断的 JSON', () => {
    const r = safeJSONParse('{"title":"传承","shots":[{"id":"shot-1"}');
    expect(r.error).toBeNull();
    expect(r.data.title).toBe('传承');
  });

  it('非 JSON 文本返回错误', () => {
    const r = safeJSONParse('这不是 JSON');
    expect(r.data).toBeNull();
    expect(r.error).not.toBeNull();
  });

  it('空输入返回错误', () => {
    const r = safeJSONParse('');
    expect(r.error).not.toBeNull();
  });
});
