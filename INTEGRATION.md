# 豆包只负责接线与上线，不负责设计

本包 UI 已完成。不要重新设计、不要让豆包“参考图片再做一版”。

## 1. 复制文件
把本目录内容合并到现有 `feiyidaoyantai` 仓库：
- `public/liaoyun-assets/*`
- `src/data/liaoyunCaseUi.ts`
- `src/pages/LiaoyunCaseExperience.tsx`
- `src/pages/liaoyun-case.css`

## 2. App.tsx 只增加一个路由
```tsx
const LiaoyunCaseExperience = lazy(() => import('./pages/LiaoyunCaseExperience'));
```
在 Routes 中增加：
```tsx
<Route path="/liaoning-case" element={<LiaoyunCaseExperience />} />
```

## 3. 首页 CTA
把“体验《一剪见闾山》”指向：
`/liaoning-case`

## 4. 不要改这些原则
- 不强调固定“8 个镜头”。页面已明确是案例节选，可继续扩展镜头。
- 不声称网站已经内置图片/视频生成。第 6 区已经写明：输出结构化提示词与创作资产，图片及视频生成由后续生成工具完成。
- 不添加未经核验的历史年代、传承人或纹样寓意。
- 不改现有 AI API、Director、项目存储逻辑。

## 5. 上线前验收
- `npm run build`
- 打开 `/liaoning-case`
- 点击 7 个分镜卡片，右侧提示词跟随切换
- 图片提示词 / 视频提示词复制按钮可用
- “生成后续分镜”跳转现有 `/create` 流程
- 手机宽度下无横向溢出
