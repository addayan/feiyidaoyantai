// ===== 可生成性评分工具 =====

interface GeneratabilityCheckResult {
  label: string;
  status: 'pass' | 'warning';
  detail: string;
}

interface ScoreResult {
  score: number;
  checks: GeneratabilityCheckResult[];
}

/**
 * 基于规则计算单个镜头的可生成性评分（0-100）。
 * 评估维度：主体数量、人物数量、动作数量、运镜复杂度、环境变化、提示词长度、冲突动作、同时事件。
 */
export function calculateGeneratabilityScore(shot: any): ScoreResult {
  const checks: GeneratabilityCheckResult[] = [];
  let totalScore = 100;

  // 合并三个提示词用于分析
  const allPrompts = [
    shot.firstFramePrompt || '',
    shot.lastFramePrompt || '',
    shot.videoPrompt || '',
  ].join(' ');

  // --- 1. 主体数量评估 ---
  // 统计提示词中提到的主体数量（简单启发式：统计主要名词短语）
  const subjectIndicators = ['人物', '角色', '主体', '对象', '人物', '老人', '年轻人', '女孩', '男孩', '手艺人', '师傅', '老人', '师傅', '少女', '小孩'];
  let subjectCount = 0;
  for (const indicator of subjectIndicators) {
    const regex = new RegExp(indicator, 'g');
    const matches = allPrompts.match(regex);
    if (matches) subjectCount += matches.length;
  }
  // 也统计 "一个"、"一位" 等量词
  const quantifierMatches = allPrompts.match(/[一两位三四五六七八九十]+[个位名]/g);
  if (quantifierMatches) subjectCount += quantifierMatches.length;

  if (subjectCount <= 0) {
    totalScore -= 15;
    checks.push({ label: '主体数量', status: 'warning', detail: '提示词中未明确指定主体，可能导致生成内容不确定' });
  } else if (subjectCount === 1 || subjectCount === 2) {
    checks.push({ label: '主体数量', status: 'pass', detail: `主体数量 ${subjectCount} 个，适合 AI 生成` });
  } else if (subjectCount <= 3) {
    totalScore -= 5;
    checks.push({ label: '主体数量', status: 'warning', detail: `主体数量 ${subjectCount} 个，建议控制在 1-2 个` });
  } else {
    totalScore -= 15;
    checks.push({ label: '主体数量', status: 'warning', detail: `主体数量 ${subjectCount} 个，过多可能导致生成混乱` });
  }

  // --- 2. 人物数量 ---
  const personIndicators = ['人', '女子', '男子', '老', '少女', '少年', '孩子', '老人', '年轻人', '女孩', '男孩', '手艺人', '艺人', '师傅'];
  let personCount = 0;
  for (const ind of personIndicators) {
    const regex = new RegExp(ind, 'g');
    const matches = allPrompts.match(regex);
    if (matches) personCount += matches.length;
  }
  // 去重估计
  const estimatedPersons = Math.min(personCount, Math.ceil(personCount / 2));

  if (estimatedPersons <= 2) {
    checks.push({ label: '人物数量', status: 'pass', detail: `约 ${Math.max(estimatedPersons, 1)} 个人物，适合生成` });
  } else if (estimatedPersons === 3) {
    totalScore -= 8;
    checks.push({ label: '人物数量', status: 'warning', detail: `约 ${estimatedPersons} 个人物，AI 生成多人场景一致性较难保证` });
  } else {
    totalScore -= 15;
    checks.push({ label: '人物数量', status: 'warning', detail: `约 ${estimatedPersons} 个人物，建议减少到 1-2 人` });
  }

  // --- 3. 动作数量 ---
  const actionIndicators = ['走', '跑', '跳', '转身', '抬头', '低头', '挥手', '拿', '放', '抬', '握', '转动', '操作', '编织', '刺绣', '雕刻', '切割', '舞动', '奔跑', '飞舞', '抛', '接', '敲', '打', '雕刻', '剪', '雕刻', '绘制', '拿起', '放下', '注视', '环顾', '抚摸', '拉', '推', '转身'];
  let actionCount = 0;
  for (const ind of actionIndicators) {
    const regex = new RegExp(ind, 'g');
    const matches = allPrompts.match(regex);
    if (matches) actionCount += matches.length;
  }

  if (actionCount <= 1) {
    checks.push({ label: '动作数量', status: 'pass', detail: `动作简单清晰` });
  } else if (actionCount <= 2) {
    totalScore -= 3;
    checks.push({ label: '动作数量', status: 'pass', detail: `动作数量适中` });
  } else if (actionCount <= 3) {
    totalScore -= 8;
    checks.push({ label: '动作数量', status: 'warning', detail: `包含 ${actionCount} 个动作描述，AI 可能无法完美呈现所有动作` });
  } else {
    totalScore -= 15;
    checks.push({ label: '动作数量', status: 'warning', detail: `包含 ${actionCount} 个动作描述，建议简化到 1-2 个核心动作` });
  }

  // --- 4. 运镜复杂度 ---
  const cameraText = shot.camera || '';
  const complexCameras = ['环绕', '推摇', '拉摇', '跟移', '航拍', '手持'];
  const isComplex = complexCameras.some(c => cameraText.includes(c));

  if (isComplex) {
    totalScore -= 10;
    checks.push({ label: '运镜复杂度', status: 'warning', detail: `运镜"${cameraText}"较复杂，AI 视频生成可能无法完美实现` });
  } else {
    checks.push({ label: '运镜复杂度', status: 'pass', detail: `运镜"${cameraText}"适合 AI 视频生成` });
  }

  // --- 5. 环境变化 ---
  // 如果首帧和尾帧的环境差异较大，扣分
  const firstFrame = shot.firstFramePrompt || '';
  const lastFrame = shot.lastFramePrompt || '';
  const environmentWords = ['室内', '室外', '白天', '夜晚', '黄昏', '清晨', '夜晚', '雨天', '晴天', '雪天', '工坊', '街道', '山间', '河边', '舞台'];
  const firstEnv = environmentWords.filter(w => firstFrame.includes(w));
  const lastEnv = environmentWords.filter(w => lastFrame.includes(w));
  const envChange = firstEnv.length > 0 && lastEnv.length > 0 &&
    !firstEnv.some(w => lastEnv.includes(w));

  if (envChange) {
    totalScore -= 10;
    checks.push({ label: '环境变化', status: 'warning', detail: '首帧与尾帧环境差异较大，AI 视频生成可能出现不连贯' });
  } else {
    checks.push({ label: '环境变化', status: 'pass', detail: '环境设定连贯' });
  }

  // --- 6. 提示词长度 ---
  const promptLen = allPrompts.length;
  if (promptLen < 30) {
    totalScore -= 10;
    checks.push({ label: '提示词长度', status: 'warning', detail: `提示词过短（${promptLen}字），描述不够充分` });
  } else if (promptLen > 500) {
    totalScore -= 10;
    checks.push({ label: '提示词长度', status: 'warning', detail: `提示词过长（${promptLen}字），AI 可能忽略部分内容` });
  } else {
    checks.push({ label: '提示词长度', status: 'pass', detail: `提示词长度适中（${promptLen}字）` });
  }

  // --- 7. 冲突动作 ---
  const conflictActions = ['一边...一边', '同时', '又...又', '一边...一边', '边...边'];
  const hasConflict = conflictActions.some(pattern => allPrompts.includes(pattern));
  if (hasConflict) {
    totalScore -= 12;
    checks.push({ label: '冲突动作', status: 'warning', detail: '包含同时进行的多个动作，AI 难以同时表现' });
  } else {
    checks.push({ label: '冲突动作', status: 'pass', detail: '动作描述无冲突' });
  }

  // --- 8. 多个同时事件 ---
  const multiEventIndicators = ['同时', '与此同时', '此刻', '同一时间', '平行'];
  const hasMultiEvent = multiEventIndicators.some(w => allPrompts.includes(w));
  if (hasMultiEvent) {
    totalScore -= 12;
    checks.push({ label: '同时事件', status: 'warning', detail: '描述了多个同时发生的事件，AI 视频生成建议拆分为单独镜头' });
  } else {
    checks.push({ label: '同时事件', status: 'pass', detail: '场景聚焦单一事件' });
  }

  // 确保 score 在 0-100 范围内
  totalScore = Math.max(0, Math.min(100, totalScore));

  return { score: totalScore, checks };
}
