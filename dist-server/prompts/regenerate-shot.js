// ===== 重新生成镜头 Prompt =====
/**
 * 构建重新生成单个镜头的 prompt。
 * 要求考虑前后镜头衔接。
 */
export function buildRegenerateShotPrompt(project, shotIndex, safetyRules, instruction) {
    const data = project.data || project;
    const shots = data.shots || [];
    const currentShot = shots[shotIndex];
    const prevShot = shotIndex > 0 ? shots[shotIndex - 1] : null;
    const nextShot = shotIndex < shots.length - 1 ? shots[shotIndex + 1] : null;
    return `你是一位专业的非遗影像分镜师。请重新生成项目"${data.title}"中的第 ${shotIndex + 1} 个镜头。

## 项目信息
- 非遗类型：${data.heritageType}
- 视觉风格：${data.style}
- 所属场景：${currentShot?.scene || '未知场景'}

## 前一个镜头（镜头 ${shotIndex}）${prevShot ? '' : '（无，这是第一个镜头）'}
${prevShot ? JSON.stringify({
        description: prevShot.description,
        lastFramePrompt: prevShot.lastFramePrompt,
        shotSize: prevShot.shotSize,
        camera: prevShot.camera,
    }, null, 2) : '无'}

## 当前镜头内容（待重新生成）
${currentShot ? JSON.stringify(currentShot, null, 2) : '（当前为空）'}

## 后一个镜头（镜头 ${shotIndex + 2}）${nextShot ? '' : '（无，这是最后一个镜头）'}
${nextShot ? JSON.stringify({
        description: nextShot.description,
        firstFramePrompt: nextShot.firstFramePrompt,
        shotSize: nextShot.shotSize,
        camera: nextShot.camera,
    }, null, 2) : '无'}

${instruction ? `## 用户修改要求\n${instruction}\n` : ''}

## 输出要求
1. 只返回一个完整的镜头 JSON 对象，不要返回数组。
2. 不要使用 Markdown 代码围栏，不添加任何解释文字。
3. 必须考虑与前后镜头的视觉衔接（首帧应与前一镜头尾帧有过渡感，尾帧应与后一镜头首帧有衔接感）。
4. 按照以下模板结构输出：

{
  "id": "shot-${shotIndex + 1}",
  "scene": "所属场景名称",
  "shotSize": "景别",
  "camera": "运镜",
  "duration": "时长",
  "description": "镜头内容描述",
  "firstFramePrompt": "首帧画面提示词（适合 AI 图像生成）",
  "lastFramePrompt": "尾帧画面提示词（适合 AI 图像生成）",
  "videoPrompt": "视频生成提示词（适合 AI 视频生成）",
  "generatabilityScore": 85,
  "generatabilityChecks": [
    { "label": "主体明确", "status": "pass", "detail": "..." },
    { "label": "场景清晰", "status": "pass", "detail": "..." },
    { "label": "运镜合理", "status": "pass", "detail": "..." },
    { "label": "环境动态", "status": "pass", "detail": "..." }
  ]
}

## 安全规则
${safetyRules}

再次强调：只返回一个镜头的纯 JSON。`;
}
