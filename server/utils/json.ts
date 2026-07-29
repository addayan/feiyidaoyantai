// ===== JSON 修复工具 =====

/**
 * 去除 markdown 代码围栏（```json ... ```）
 */
export function removeCodeFence(text: string): string {
  // 匹配 ```json ... ``` 或 ``` ... ```
  return text.replace(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/g, '$1').trim();
}

/**
 * 从可能包含 markdown 围栏、前后说明的文本中提取 JSON 主体。
 * 策略：
 * 1. 去除代码围栏
 * 2. 找到第一个 { 或 [ 和最后一个 } 或 ]
 */
export function extractJSON(text: string): string {
  let cleaned = removeCodeFence(text);

  // 尝试找到 JSON 主体
  const startBrace = cleaned.indexOf('{');
  const startBracket = cleaned.indexOf('[');

  // 确定起始位置
  let start = -1;
  let endChar = '';
  if (startBrace === -1 && startBracket === -1) {
    return cleaned;
  }
  if (startBrace === -1) {
    start = startBracket;
    endChar = ']';
  } else if (startBracket === -1) {
    start = startBrace;
    endChar = '}';
  } else {
    // 两个都存在，取更早的那个
    start = Math.min(startBrace, startBracket);
    endChar = start === startBrace ? '}' : ']';
  }

  // 从末尾向前查找匹配的闭合字符
  const end = cleaned.lastIndexOf(endChar);
  if (end > start) {
    cleaned = cleaned.substring(start, end + 1);
  }

  return cleaned.trim();
}

/**
 * 修复截断的 JSON（最多一轮修复，失败返回原文本）。
 * 处理：缺失 } ]、末尾多余逗号、未闭合字符串。
 */
export function tryRepairTruncatedJSON(text: string): string {
  let repaired = text;

  // 1. 去除末尾多余逗号（}] 前的逗号）
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  // 2. 统计未闭合的引号
  let inString = false;
  let quoteCount = 0;
  for (let i = 0; i < repaired.length; i++) {
    if (repaired[i] === '\\' && inString) {
      i++; // 跳过转义字符
      continue;
    }
    if (repaired[i] === '"') {
      inString = !inString;
      quoteCount++;
    }
  }
  // 如果引号数量为奇数，说明有一个未闭合的字符串
  if (quoteCount % 2 !== 0) {
    repaired += '"';
  }

  // 3. 统计需要补全的括号
  let openBraces = 0;
  let openBrackets = 0;
  inString = false;
  for (let i = 0; i < repaired.length; i++) {
    if (repaired[i] === '\\' && inString) {
      i++;
      continue;
    }
    if (repaired[i] === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (repaired[i] === '{') openBraces++;
    if (repaired[i] === '}') openBraces--;
    if (repaired[i] === '[') openBrackets++;
    if (repaired[i] === ']') openBrackets--;
  }

  // 补全缺失的括号（先 ] 后 }，按照通常的嵌套顺序）
  while (openBrackets > 0) {
    repaired += ']';
    openBrackets--;
  }
  while (openBraces > 0) {
    repaired += '}';
    openBraces--;
  }

  // 4. 再次去除补全后可能产生的多余逗号
  repaired = repaired.replace(/,\s*([}\]])/g, '$1');

  return repaired;
}

/**
 * 安全 JSON 解析：组合以上函数，最终 JSON.parse。
 * 返回 { data, error }，其中 data 为解析结果或 null，error 为错误信息或 null。
 */
export function safeJSONParse(text: string): { data: any | null; error: string | null } {
  if (!text || typeof text !== 'string') {
    return { data: null, error: '输入为空或非字符串' };
  }

  try {
    // 阶段 1：提取 JSON 主体
    let jsonStr = extractJSON(text);
    // 阶段 2：去除代码围栏
    jsonStr = removeCodeFence(jsonStr);
    // 阶段 3：修复截断
    jsonStr = tryRepairTruncatedJSON(jsonStr);

    // 尝试解析
    const parsed = JSON.parse(jsonStr);
    return { data: parsed, error: null };
  } catch (e: any) {
    return { data: null, error: `JSON 解析失败: ${e.message}` };
  }
}
