你只负责把我提供的 UI 成品接入现有项目并上线，不负责重新设计。

仓库：https://github.com/addayan/feiyidaoyantai

执行：
1. 解压交付包。
2. 读取 `drop-in/INTEGRATION.md`。
3. 把 `drop-in` 内文件原样合并进当前仓库。
4. 只做必要的 import / route / 首页 CTA 接线；禁止重绘 UI、禁止重新生成图片、禁止改文案设计。
5. 如与当前仓库有轻微类型或路径冲突，只做兼容修复，不改变视觉与结构。
6. `npm run build` 必须通过。
7. 部署到现有 `https://feiyi.hao1234.top/`。
8. 真实浏览器验证 `/liaoning-case`、分镜切换、Prompt复制、移动端响应式。
9. 首页“体验《一剪见闾山》”改为 `/liaoning-case`。

特别禁止：
- 不要强调“8镜头”。
- 不要声称内置图片/视频生成。
- 不要重构 Director。
- 不要改 AI API。
- 不要重新设计这套页面。

最后只报告：Build、部署地址、页面是否打开、交互是否通过、是否存在阻塞。
