import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import type { Duration, Project, Purpose, VisualStyle } from '../types';
import { generateMockProjectData } from '../data/mockGenerator';
import { liaoningData } from '../data/liaoningCase';
import {
  getHeritageBySlug,
  getHeritageSuggestions,
  searchHeritage,
} from '../data/heritageCatalog';
import { buildHeritageContext } from '../utils/heritageContext';
import { createProject } from '../store/projectStore';
import { generateStoryboard } from '../api/ai';
import { useAIHealth } from '../hooks/useAIHealth';

const PURPOSES: Purpose[] = ['AIGC 比赛', '短视频', '课程作业', '文旅宣传', '动态海报', '其他'];
const DURATIONS: Duration[] = ['30秒', '约1分钟', '3分钟', '5分钟'];
const STYLES: VisualStyle[] = ['写实电影', '国风动画', '纪录片', '剪纸风', '东方幻想', '其他'];

const STORY_TEMPLATES = [
  'AI 根据非遗特性自动推荐',
  '人物成长：从陌生到理解，再到主动选择',
  '器物叙事：一件作品承载时间与记忆',
  '奇幻进入：主角进入非遗构成的世界',
  '传统与现代碰撞：旧技艺遇到当代生活',
  '一日纪实：跟随一次制作 / 表演完整经历',
];

const PROTAGONISTS = [
  '当代大学生',
  '手艺人后代',
  '年轻学徒',
  '普通游客 / 观察者',
  '非遗作品 / 器物本身',
  '无固定主角，以群像为主',
];

const EMOTIONS = ['温暖', '诗意', '奇幻', '热血', '克制纪实', '神秘'];

function ChoiceRow({
  title,
  options,
  value,
  onChange,
}: {
  title: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 9 }}>{title}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {options.map(option => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: active ? '1px solid var(--gold)' : '1px solid var(--border)',
                background: active ? 'var(--gold-dim)' : 'var(--bg-input)',
                color: active ? 'var(--gold)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function CreateV3() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { modelConfigured } = useAIHealth();

  const preset = getHeritageBySlug(searchParams.get('heritage'));
  const suggestions = useMemo(() => getHeritageSuggestions(8), []);

  const [heritageName, setHeritageName] = useState(preset?.name ?? '');
  const [heritageSlug, setHeritageSlug] = useState(preset?.slug ?? '');
  const [heritageSearch, setHeritageSearch] = useState(preset?.name ?? '');

  const [storyTemplate, setStoryTemplate] = useState(STORY_TEMPLATES[0]);
  const [protagonist, setProtagonist] = useState(PROTAGONISTS[0]);
  const [emotion, setEmotion] = useState(EMOTIONS[0]);
  const [purpose, setPurpose] = useState<Purpose>('AIGC 比赛');
  const [duration, setDuration] = useState<Duration>('约1分钟');
  const [style, setStyle] = useState<VisualStyle>('写实电影');
  const [idea, setIdea] = useState('');

  const [mode, setMode] = useState<'ai' | 'quick'>(modelConfigured ? 'ai' : 'quick');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const generationLock = useRef(false);

  useEffect(() => {
    if (!modelConfigured && mode === 'ai') setMode('quick');
  }, [modelConfigured, mode]);

  const matchedEntry = useMemo(() => {
    if (heritageSlug) return getHeritageBySlug(heritageSlug);
    const exact = searchHeritage(heritageName).find(item => item.name === heritageName);
    return exact ?? null;
  }, [heritageName, heritageSlug]);

  const searchResults = useMemo(() => {
    if (!heritageSearch.trim()) return [];
    return searchHeritage(heritageSearch).slice(0, 6);
  }, [heritageSearch]);

  const selectHeritage = (name: string, slug?: string) => {
    setHeritageName(name);
    setHeritageSearch(name);
    setHeritageSlug(slug ?? '');
  };

  const finalizeProject = (data: any, generationMode: 'ai' | 'quick') => {
    const now = new Date().toISOString();
    const projectId = `proj-${Date.now()}`;
    const project: Project = {
      id: projectId,
      slug: projectId,
      createdAt: now,
      updatedAt: now,
      data,
      isExample: false,
      generationMeta: {
        mode: generationMode,
        generatedAt: now,
      },
    };
    createProject(project);
    navigate(`/director/${projectId}`);
  };

  const runGeneration = async (modeOverride?: 'ai' | 'quick') => {
    const genMode = modeOverride ?? mode;
    const finalHeritage = heritageName.trim();
    if (!finalHeritage || generationLock.current) return;

    setGenerating(true);
    setError('');
    generationLock.current = true;

    const creativeContext = buildHeritageContext(
      finalHeritage,
      matchedEntry,
      {
        storyTemplate,
        protagonist,
        emotion,
        userIdea: idea.trim(),
      },
    );

    try {
      if (genMode === 'ai') {
        if (!modelConfigured) {
          throw new Error('AI 模型尚未配置，请先使用快速体验或配置模型。');
        }

        const data = await generateStoryboard({
          heritageType: finalHeritage,
          topic: creativeContext,
          purpose,
          duration,
          style,
        });

        finalizeProject(data, 'ai');
        return;
      }

      // 医巫闾山满族剪纸直接用《一剪见闾山》完整数据
      const data = finalHeritage === '医巫闾山满族剪纸'
        ? { ...liaoningData, heritageType: '医巫闾山满族剪纸' }
        : generateMockProjectData({ heritageType: finalHeritage as any, topic: creativeContext, purpose, duration, style });

      finalizeProject(data, 'quick');
    } catch (err: any) {
      const msg = err?.message || '生成失败，请稍后再试';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      generationLock.current = false;
      setGenerating(false);
    }
  };

  const handleModeSelect = (m: 'ai' | 'quick') => {
    setMode(m);
    runGeneration(m);
  };

  return (
    <div className="page">
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '48px 24px 90px' }}>
        <header style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 800, letterSpacing: '.12em' }}>
            辽宁非遗 AI 创作导演台
          </div>
          <h1 className="create-title" style={{ fontSize: 36, margin: '8px 0 0' }}>先选非遗，再组合你的故事</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, maxWidth: 720, margin: '12px auto 0' }}>
            不需要先懂导演风格。选一个非遗或直接输入名称，再用几个简单选项确定故事方向。
            AI 会读取对应的非遗创作资料，生成故事、分镜、首帧图提示词和视频提示词。
          </p>
        </header>
        <section className="card" style={{ borderColor: 'var(--gold)', padding: 22, marginBottom: 20, background: 'linear-gradient(120deg, #301c25, #111e31)' }}>
          <div style={{ color: 'var(--gold)', fontSize: 12, marginBottom: 8 }}>本次推荐 ·《一剪见闾山》</div>
          <h2 style={{ fontSize: 23 }}>剪纸（医巫闾山满族剪纸）</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 16px' }}>辽宁省锦州市 · 传统美术 · 国家级非物质文化遗产代表性项目</p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => selectHeritage('医巫闾山满族剪纸', 'yiwulvshan-manchu-paper-cutting')}>选择这个非遗项目</button>
            <Link className="btn btn-secondary" to="/director/yiwulvshan-paper-cutting?mode=example">打开完整演示案例</Link>
          </div>
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>01 · 选择非遗</div>
              <h2 style={{ fontSize: 18, margin: '4px 0 0' }}>你想做什么非遗？</h2>
            </div>
            <Link to="/heritage" style={{ fontSize: 12, color: 'var(--gold)' }}>不知道选什么？去非遗库看看 →</Link>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              value={heritageSearch}
              onChange={event => {
                setHeritageSearch(event.target.value);
                setHeritageName(event.target.value);
                setHeritageSlug('');
              }}
              placeholder="输入：剪纸、玉雕、高跷、海城高跷……"
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: 15,
                outline: 'none',
              }}
            />
            {heritageSearch.trim() && searchResults.length > 0 && heritageSearch !== heritageName && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 'calc(100% + 6px)',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  zIndex: 20,
                  overflow: 'hidden',
                  boxShadow: '0 18px 40px rgba(0,0,0,.28)',
                }}
              >
                {searchResults.map(item => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => selectHeritage(item.name, item.slug)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      textAlign: 'left',
                      border: 0,
                      borderBottom: '1px solid var(--border)',
                      background: 'transparent',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                  >
                    <strong>{item.name}</strong>
                    <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--text-muted)' }}>{item.officialCategory}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>AI 推荐</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {suggestions.map(item => (
                <button
                  key={item.slug}
                  type="button"
                  onClick={() => selectHeritage(item.name, item.slug)}
                  style={{
                    padding: '7px 11px',
                    borderRadius: 999,
                    border: heritageName === item.name ? '1px solid var(--gold)' : '1px solid var(--border)',
                    background: heritageName === item.name ? 'var(--gold-dim)' : 'transparent',
                    color: heritageName === item.name ? 'var(--gold)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: 12,
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {matchedEntry && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(45,212,191,.06)',
                border: '1px solid rgba(45,212,191,.18)',
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 700 }}>
                已读取「{matchedEntry.name}」AI 创作档案
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {matchedEntry.summary}
              </div>
            </div>
          )}

          {!matchedEntry && heritageName.trim() && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>
              当前种子库未命中“{heritageName.trim()}”，仍可继续创作；AI 将被明确要求不要胡编不确定的非遗事实。
            </div>
          )}
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>02 · 组合故事</div>
          <h2 style={{ fontSize: 18, margin: '4px 0 20px' }}>用简单选项决定故事模板</h2>

          <ChoiceRow title="故事结构" options={STORY_TEMPLATES} value={storyTemplate} onChange={setStoryTemplate} />
          <ChoiceRow title="主角" options={PROTAGONISTS} value={protagonist} onChange={setProtagonist} />
          <ChoiceRow title="情绪" options={EMOTIONS} value={emotion} onChange={setEmotion} />

          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 9 }}>你自己的创意（可空）</div>
            <textarea
              value={idea}
              onChange={event => setIdea(event.target.value)}
              placeholder="例如：一个大学生回老家整理奶奶遗物，发现一盒旧剪纸……"
              style={{
                width: '100%',
                minHeight: 96,
                resize: 'vertical',
                padding: 14,
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                fontSize: 14,
                lineHeight: 1.7,
                outline: 'none',
              }}
            />
          </div>
        </section>

        <section className="card" style={{ padding: 24, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>03 · 输出条件</div>
          <h2 style={{ fontSize: 18, margin: '4px 0 20px' }}>这些条件会影响分镜和提示词</h2>

          <ChoiceRow title="用途" options={PURPOSES} value={purpose} onChange={value => setPurpose(value as Purpose)} />
          <ChoiceRow title="时长" options={DURATIONS} value={duration} onChange={value => setDuration(value as Duration)} />
          <ChoiceRow title="视觉风格" options={STYLES} value={style} onChange={value => setStyle(value as VisualStyle)} />
        </section>

        <section
          className="card"
          style={{
            padding: 20,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 16,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>生成方式</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                disabled={!modelConfigured || generating}
                onClick={() => handleModeSelect('ai')}
                className={mode === 'ai' ? 'btn btn-sm btn-primary' : 'btn btn-sm btn-secondary'}
                style={!modelConfigured ? { opacity: .45, cursor: 'not-allowed' } : undefined}
              >
                AI 真实生成
              </button>
              <button
                type="button"
                onClick={() => handleModeSelect('quick')}
                disabled={generating}
                className={mode === 'quick' ? 'btn btn-sm btn-teal' : 'btn btn-sm btn-secondary'}
              >
                快速体验
              </button>
            </div>
            {!modelConfigured && (
              <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text-muted)' }}>
                当前 AI API 未配置，先用快速体验验证 V3 流程。
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => runGeneration()}
            disabled={!heritageName.trim() || generating}
            className="btn btn-primary"
            style={{ minWidth: 190, opacity: !heritageName.trim() || generating ? .5 : 1 }}
          >
            {generating ? '正在生成故事与分镜…' : '生成故事、分镜与提示词'}
          </button>
        </section>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(248,113,113,.35)',
              color: '#fca5a5',
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <Link to="/create-classic" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            临时返回 V2.2 经典创作页
          </Link>
        </div>
      </div>
    </div>
  );
}
