# V2.1.0 测试报告

## 测试日期：2026-07-23

## 一、验收结论

- **V2.1.0 是否通过**：通过
- **是否完成真实 AI 测试**：是
- **是否可以作为正式稳定版本**：是

## 二、API 配置

- **health 结果**：`{ ok: true, service: "非遗影像工坊 AI 后端", modelConfigured: true, modelId: "deepseek-chat" }`
- **模型是否配置**：已配置（DeepSeek Chat）
- **API Key 安全**：不暴露

## 三、真实 AI 测试

### 整体生成
- **结果**：成功
- **耗时**：56.0 秒
- **标题**：纸间星河（AI 原创，非固定案例标题）
- **角色数**：2
- **场景数**：2
- **镜头数**：8（严格）
- **标准化 warnings**：0
- **heritageType**：蜀绣（保持用户输入）
- **purpose**：AIGC 比赛（保持）
- **duration**：约 1 分钟（保持）
- **style**：写实电影（保持）
- **generationMeta.mode**：ai
- **参赛说明**：8 个字段完整
- **发布文案**：抖音 + 小红书均存在

### 单模块重新生成
- **故事梗概重新生成**：成功（2.3 秒）
- **发布文案重新生成**：成功（1.7 秒）

### 单镜头重新生成
- **镜头 3 重新生成**：成功（6.2 秒）
- **其他镜头不变**：确认镜头 1、2、4、5、6、7、8 保持原样

### 镜头 AI 优化
- **镜头 5 增强电影感**：成功（8.1 秒）
- **可生成性评分**：合理

### 提示词优化
- **镜头 5 视频提示词优化（适配 Seedance）**：成功（1.6 秒）
- **优化后 prompt 包含**：起始状态、人物动作、环境动态、运镜、结束状态

## 四、错误保护

- **超时处理**：后端 AbortSignal.timeout 120s，前端 AbortController
- **无效响应**：safeJSONParse 返回 error，前端显示友好提示
- **原内容保留**：失败时自动恢复旧内容
- **用户输入保留**：不自动切换 mock

## 五、兼容性

- **V2.0.1 项目**：无 generationMeta 和 generationHistory 时正常打开，不报错
- **数据迁移**：normalize 自动补全缺失字段
- **重复项目**：无

## 六、安全

- **前端无 API Key**：通过
- **dist 无 API Key**：通过
- **Git 无 API Key**：.env 已加入 .gitignore
- **日志不输出 Authorization**：使用 getSafeModelId()
- **前端不暴露堆栈**：全局错误处理返回通用消息

## 七、构建

- **前端 TypeScript**：零错误
- **后端 TypeScript**：零错误
- **Vite build**：通过（993ms）

## 八、JSON 工具测试

- **27 项测试全部通过**（0 失败）
- 覆盖：removeCodeFence、extractJSON、tryRepairTruncatedJSON、safeJSONParse、normalizeGeneratedResult
- 边界情况：截断 JSON、缺失字段、score 越界、旧项目兼容

## 九、代码修复

- **修复 stale closure**：handleRegenerateShot/handleOptimizeShot/handleOptimizePrompt 中 updateProject 使用正确的新 shots 数组
- **修复 localStorage 直接操作**：addGenerationRecord 改为通过 projectStore 统一管理
- **修复 API_BASE 硬编码**：改为动态获取 hostname

## 十、交付文件

- **HTML ZIP**：`heritage-workshop-v2.1.0-html.zip`（632 KB）
- **源码 ZIP**：`heritage-workshop-v2.1.0-source.zip`
- **README**：已更新至 V2.1.0
- **Release Notes**：`RELEASE_NOTES_v2.1.0.md`
- **.env.example**：模板文件

## 十一、已知问题

1. **AI 生成内容可能偏离非遗类型**：DeepSeek Chat 模型偶尔不严格遵循 heritageType 约束（如输入"蜀绣"但生成"剪纸"内容），建议人工审核
2. **Seedream/Seedance 未接入**：提示词优化中的"适配 Seedance"等选项仅优化提示词格式，不实际调用视频生成 API
3. **单次生成耗时较长**：完整分镜方案约 30-90 秒，取决于模型响应速度
4. **score.ts 启发式评分粗糙**：基于关键词匹配，非真正 AI 评估