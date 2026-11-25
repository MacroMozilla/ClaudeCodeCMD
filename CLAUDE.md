# ClaudeCodeCMD 工作约定

Claude Code 内置命令速查页，GitHub Pages 从 `master` 直发：https://macromozilla.github.io/ClaudeCodeCMD/

## 合并（2026-11-25 他定）

- **改完默认自动合并，不用再问他**：推分支 → 开 PR → 等 CI（`validate`）绿 → 转成正式 PR → squash 合并 → 告诉他结果。
- CI 红了先修到绿再合，⛔ 不跳过、不关测试。

## 外观（2026-11-25 他定）

- **固定深色**：`style.css` 只有一套深色 token，⛔ 不再跟随系统切浅色，也不加 `prefers-color-scheme` 分支。

## 内容

- 所有内容都在 `commands.json`；README「全部命令」那一节照它生成，两边要一致。
- 分组（2026-11-25 他定）：先按「这条命令在干哪一类事」分，组内按使用频率从高到低排。对**已有改动**下手的（`/code-review` `/simplify` `/verify` `/security-review`）放一起、排最上面；**切换工作方式**的（`/plan` `/model` `/effort`）单独一组；只看不改的（`/status` `/usage`）又是一组。
- 已被官方移除的命令不收；对照官方 Commands 文档和 CHANGELOG 核，核到的版本写进 `builtins.basedOn`。
- 改了任何文件都把 `meta.contentVersion` 加一位，同步 `index.html` 里 `style.css` / `app.js` 的 `?v=`（CI 查）。
