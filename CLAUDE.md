# ClaudeCodeCMD 工作约定

Claude Code 内置命令速查页，GitHub Pages 从 `master` 直发：https://macromozilla.github.io/ClaudeCodeCMD/

## 合并（2026-11-25 他定）

- **改完默认自动合并，不用再问他**：推分支 → 开 PR → 等 CI（`validate`）绿 → 转成正式 PR → squash 合并 → 告诉他结果。
- CI 红了先修到绿再合，⛔ 不跳过、不关测试。

## 外观（2026-11-25 他定）

- **固定深色**：`style.css` 只有一套深色 token，⛔ 不再跟随系统切浅色，也不加 `prefers-color-scheme` 分支。

## 内容

- 所有内容都在 `commands.json`；README「全部命令」那一节照它生成，两边要一致。
- 分组（2026-11-25 他定）：**同一类的放一组，组内按使用频率排，同类的挨着放。**
  - 最上面一组只放 4 条，按推荐的检查顺序：`/code-review` → `/simplify` → `/security-review` → `/verify`（配对列也按这个链起来）。
  - 其他审查方式 / 跑起来看（`/diff` `/review` `/ultrareview` `/run`）第二组；排查 · 报问题（`/debug` `/doctor` `/heapdump` `/bug`）单独一组。
  - 切换工作方式的（`/plan` `/model` `/effort`）一组；只看不改的（`/status` `/usage`）一组。
- **别名不单独占一行**（2026-11-25 他定）：官方说是别名的（`/review` `/ultrareview` → `/code-review`，`/cost` `/stats` → `/usage` 等）并进主命令的 `aliases`，页面上写在说明后面。
- **配对写成一串**（2026-11-25 他定）：`前面的 → 自己（高亮）→ 后面的`，不要只写箭头加命令名。
- 已被官方移除的命令不收；对照官方 Commands 文档和 CHANGELOG 核，核到的版本写进 `builtins.basedOn`。
- 改了任何文件都把 `meta.contentVersion` 加一位，同步 `index.html` 里 `style.css` / `app.js` 的 `?v=`（CI 查）。
