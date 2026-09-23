import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIAOYUN_FACTS, LIAOYUN_SHOTS } from '../data/liaoyunCaseUi';
import './liaoyun-case.css';

function copyText(value: string) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(value);
  const el = document.createElement('textarea'); el.value = value; document.body.appendChild(el); el.select(); document.execCommand('copy'); el.remove();
  return Promise.resolve();
}

export default function LiaoyunCaseExperience() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(0);
  const [toast, setToast] = useState('');
  const shot = useMemo(() => LIAOYUN_SHOTS[selected], [selected]);
  const doCopy = async (value: string) => { await copyText(value); setToast('已复制提示词'); setTimeout(() => setToast(''), 1300); };

  return <div className="ly-page">
    <section className="ly-section ly-case" id="case">
      <div className="ly-kicker">04 / 核心界面 · 案例叙事</div>
      <div className="ly-case-grid">
        <div className="ly-copy">
          <div className="ly-eyebrow">辽宁非遗 · 数字影像创新</div>
          <h1>从一张<span>红纸</span>开始</h1>
          <p className="ly-lead">《一剪见闾山》以医巫闾山满族剪纸为核心案例，把文化理解、故事组织、分镜与提示词串成一条可继续生产的创作链路。</p>
          <div className="ly-facts"><span>{LIAOYUN_FACTS.category}</span><span>{LIAOYUN_FACTS.code}</span><span>{LIAOYUN_FACTS.region}</span><span>{LIAOYUN_FACTS.batch}</span></div>
          <blockquote>数字化不是替代手艺，而是让更多年轻人重新看见它。</blockquote>
          <div className="ly-actions"><button className="ly-primary" onClick={()=>document.querySelector('#storyboard')?.scrollIntoView({behavior:'smooth'})}>查看分镜结构</button><button className="ly-secondary" onClick={()=>document.querySelector('#prompt')?.scrollIntoView({behavior:'smooth'})}>查看提示词</button></div>
        </div>
        <div className="ly-case-card">
          <div className="ly-case-title">《一剪见闾山》</div><div className="ly-case-sub">{LIAOYUN_FACTS.officialName} · AI 数字影像创作案例</div>
          <div className="ly-story-steps">
            {[
              [0,'看见红纸','从一张普通的红纸出发，唤起对传统与故乡的好奇。'],
              [2,'观察剪刻','跟随手与剪刀的动作，感受纸张节奏、纹理与温度。'],
              [3,'连接山林','让剪纸镂空与山林意象形成匹配转场，建立地域联系。'],
              [6,'数字记录','将故事拆成分镜，并继续生成图片与视频提示词。'],
            ].map(([idx,title,desc]) => <article key={String(title)}><img src={LIAOYUN_SHOTS[Number(idx)].image}/><b>{String(title)}</b><p>{String(desc)}</p></article>)}
          </div>
        </div>
      </div>
      <div className="ly-bridge"><div><b>文案理解</b><span>提炼主题与叙事主线</span></div><i>→</i><div><b>角色场景</b><span>建立人物与场景设定</span></div><i>→</i><div><b>分镜组织</b><span>生成可执行镜头序列</span></div><i>→</i><div><b>进入生产</b><span>导出提示词与创作资产</span></div></div>
    </section>

    <section className="ly-section" id="storyboard">
      <div className="ly-kicker">05 / 核心界面 · 分镜组织</div>
      <div className="ly-head"><div><h2>把一个故事拆成可执行的<span>分镜结构</span></h2><p>从文化理解、情绪节奏到镜头组织，逐步形成可以继续扩展的导演方案。</p></div><div className="ly-note">案例节选 / 展示部分分镜结构，不代表完整短片镜头总数。</div></div>
      <div className="ly-director">
        <div className="ly-director-head"><div><div className="ly-director-name">《一剪见闾山》</div><div className="ly-tags"><span>传统美术</span><span>文化传承</span><span>人物成长</span><span>地域记忆</span></div></div><blockquote>“以纸为媒，剪出山河，让被遗忘的文化再次被看见。”</blockquote></div>
        <div className="ly-tabs"><button className="active">分镜列表</button><button>故事结构</button><button>角色场景</button><button>视觉风格</button><button>制作参数</button></div>
        <div className="ly-shots">{LIAOYUN_SHOTS.map((s,i)=><button key={s.id} className={`ly-shot ${selected===i?'active':''}`} onClick={()=>setSelected(i)}><img src={s.image}/><div><b><em>{s.id}</em>{s.title}</b><p>{s.description}</p><div className="ly-shot-tags">{s.tags.map(t=><span key={t}>{t}</span>)}</div></div></button>)}<div className="ly-more"><strong>···</strong><b>更多分镜<br/>持续生成中</b><small>基于故事结构与风格设定<br/>可继续扩展镜头序列</small><button onClick={()=>navigate('/create?heritage=yiwulvshan-manchu-paper-cutting')}>＋ 生成后续分镜</button></div></div>
      </div>
      <div className="ly-value"><b>从文案，<span>走向生产结构。</span></b><p>系统输出故事、角色、场景与分镜参数，帮助进入后续图像与视频生产。</p></div>
    </section>

    <section className="ly-section" id="prompt">
      <div className="ly-kicker">06 / 核心界面 · 提示词生成</div>
      <div className="ly-head"><div><h2>从“<span>想法</span>”到 AI 可生成提示词</h2><p>把创意转化为可以直接进入图片和视频生产的结构化描述。</p></div></div>
      <div className="ly-prompt-layout">
        <aside className="ly-picker">{LIAOYUN_SHOTS.map((s,i)=><button key={s.id} className={selected===i?'active':''} onClick={()=>setSelected(i)}><img src={s.image}/><span><b>{s.id} {s.title}</b><small>{s.shotSize} · {s.duration}</small></span></button>)}</aside>
        <div className="ly-workbench">
          <div className="ly-prompt-top"><img src={shot.image}/><div className="ly-meta"><div><small>画面描述</small><strong>{shot.description}</strong></div><div className="ly-meta-grid"><span><small>景别</small><b>{shot.shotSize}</b></span><span><small>构图</small><b>{shot.composition}</b></span><span><small>运镜</small><b>{shot.camera}</b></span><span><small>光线</small><b>{shot.light}</b></span><span><small>时长</small><b>{shot.duration}</b></span><span><small>风格</small><b>传统文化 · 电影质感</b></span></div></div></div>
          <div className="ly-prompt-card"><div className="ly-prompt-label">图片提示词<small>用于文生图</small></div><div>{shot.imagePrompt}</div><button onClick={()=>doCopy(shot.imagePrompt)}>复制提示词</button></div>
          <div className="ly-prompt-card"><div className="ly-prompt-label">视频提示词<small>用于文生视频</small></div><div>{shot.videoPrompt}</div><button onClick={()=>doCopy(shot.videoPrompt)}>复制提示词</button></div>
          <div className="ly-truth">当前系统输出结构化提示词与创作资产，图片及视频生成由后续生成工具完成。</div>
        </div>
      </div>
    </section>
    {toast && <div className="ly-toast">{toast}</div>}
  </div>;
}
