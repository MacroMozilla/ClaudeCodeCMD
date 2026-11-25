# ClaudeCodeCMD

> Claude Code 内置命令速查 · 按「你正在干什么」排序

**https://macromozilla.github.io/ClaudeCodeCMD/**

**122 条命令 + 27 个别名**，每条写清楚是干嘛的，标出**通常跟哪条配着用**，一键复制。

这些命令 Claude Code **自带**，敲一下就能用 —— 不用装。

`Not affiliated with or endorsed by Anthropic.`

---

## 排序逻辑

**同一类的命令放一组，组内按使用频率从高到低排，同类的挨着放。**

- **最上面 4 条**是改完代码推荐的检查顺序：`/code-review`（先修 bug）→ `/simplify`（再精简，含效率）→ `/security-review`（查安全）→ `/verify`（最后真跑起来验）。前三步都会改代码，所以验证放最后。
- 换一种审法、看改动、把项目跑起来的（`/diff` `/ultrareview` `/run`）是第二组；出了毛病排查、报问题的（`/debug` `/doctor` `/bug`）是另一组。
- **切换工作方式**的（`/plan` `/model` `/effort`）单独一组；**只是看一眼**的（`/status` `/usage`）又是一组。

```
审查改动：推荐按这个顺序跑 → 审查的其他方式 · 跑起来看 → 提交 · 盯 PR → 排查 · 报问题 → 改坏了回退 → 模式 · 模型 → …
```
组的先后也大致按写代码时碰到的频率排。

**41 条配对关系**写在「配对」列，是这条命令通常所在的那一串，**加粗的就是它自己**，`/` 表示几条里任选一条：

```
/diff → */code-review* → /simplify
/code-review → */simplify* → /security-review
/simplify → */security-review* → /verify
/security-review / /run-skill-generator → */verify* → /ship
```
鼠标悬停在配对上能看到**为什么**要这么配。

---

## 这张表和官方那张表哪里不一样

官方文档那张「All commands」表，**既漏了东西，又留着已经没用的东西**。

**漏的：**官方表里没有、但在 changelog 或其他文档里能找到的命令，本页一并收了，共 4 条：

| 命令 | 在哪找到的 |
|---|---|
| `/todos` | changelog |
| `/env` | changelog |
| `/plugins` | vs-code 文档 |
| `/buddy` | changelog |

另外 **27 个别名**（`/undo` `/checkup` `/proactive` `/settings` …）写在官方表格的描述文字里，只读表格首列会全漏。

**多的：**官方表里还留着 `/vim`「Removed in v2.1.92」这样的墓碑行。本页把已经被移除的命令**整条删掉**了 —— `/tag` `/pr-comments` `/vim` `/ultraplan` 都不在这张表里（`/output-style` 在 v2.1.269 重新上线了，所以又收回来了）。**这里每一条都是当前版本敲下去有反应的。**

排除了约 40 个「看着像命令但不是」的：文档举例用的自定义 skill（`/deploy` `/commit`）、gateway 的 HTTP 接口（`/healthz` `/userinfo`）、权限文档里举例的机器人命令（`/merge`）。没往数字里凑。

---

## 全部命令

`skill` = bundled skill（本质是提示词，Claude 可能自己触发，会被同名自定义文件覆盖）· `workflow` = 多 agent 编排 · **`表外`** = 官方表未收录。别名和主名效果一样，写在说明后面。「配对」里加粗的是这条命令自己。每组内按使用频率从高到低排。

### 审查改动：推荐按这个顺序跑（4）

*改完一批先跑这 4 条：先修 bug → 再精简（含效率）→ 查安全 → 最后真跑起来验*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/code-review` `[level] [--fix] [--comment] [target]` `skill` | `/diff` → **`/code-review`** → `/simplify` | 审改动里的正确性 bug；`--fix` 直接改，`ultra` 上云端深审 · 别名 `/review` `/ultrareview` `/ship:review` |
| `/simplify` `[target]` `skill` | `/code-review` → **`/simplify`** → `/security-review` | 4 个 agent 并行查复用、精简、效率和抽象层次，直接改；不找 bug |
| `/security-review` | `/simplify` → **`/security-review`** → `/verify` | 审当前分支相对默认分支的改动有没有安全漏洞 |
| `/verify` `skill` | `/security-review` / `/run-skill-generator` → **`/verify`** → `/ship` | 构建并运行项目，亲眼确认改动生效，不只看测试 |

### 审查的其他方式 · 跑起来看（3）

*看改了什么、换一种审法、把项目跑起来*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/diff` | **`/diff`** → `/code-review` | 查看工作区改动，包括 Claude 这一轮改的 |
| `/run` `skill` | `/run-skill-generator` → **`/run`** → `/verify` | 启动并操作你的项目，看改动实际跑起来 |
| `/run-skill-generator` `skill` | **`/run-skill-generator`** → `/run` | 生成项目专属 skill，教 `/run` `/verify` 怎么构建和启动 |

### 提交 · 盯 PR（3）

*改完推上去，开 PR，盯着评审和 CI 自动修*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/ship` `[level] [pr] [+bot]` `skill` | `/verify` → **`/ship`** | 提交推送、开 PR、先审一遍，再盯着 PR 自动修；`stop` 结束 |
| `/steward` `[pr] [+bot]` `skill` | `/code-review` → **`/steward`** | 只盯 PR，自动修评审意见和挂掉的 CI，不先审；`stop` 结束 · 别名 `/ship:steward` |
| `/autofix-pr` `[prompt]` | — | 开云端会话盯当前分支的 PR，CI 挂了或有评论就推修复 |

### 排查 · 报问题（5）

*出了毛病：读日志排查、体检安装、导内存快照，再报给官方*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/debug` `[description]` `skill` | `/verify` → **`/debug`** → `/rewind` | 开启本会话 debug 日志并读日志排查问题 |
| `/doctor` `[prompt-audit]` `skill` | **`/doctor`** → `/status` | 体检安装、设置、扩展和 CLAUDE.md，你确认后帮你修 · 别名 `/checkup` |
| `/heapdump` | — | 导出堆快照和内存分解，排查内存占用过高 |
| `/bug` `[report]` | — | 报 bug 或分享对话，发送前会让你确认 · 别名 `/share` |
| `/feedback` `[report]` | — | 给 Claude Code 提产品反馈 |

### 改坏了回退（3）

*后悔药：回到某个点，或者另开一条路试*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/rewind` | **`/rewind`** → `/diff` | 把对话和/或代码退回到之前某个点 · 别名 `/checkpoint` `/undo` |
| `/branch` `[name]` | **`/branch`** → `/rewind` | 在当前点分叉出一条对话，原来的保留，可用 `/resume` 回去 |
| `/fork` `[prompt]` | — | 把对话复制进一个新的后台会话，这边继续干 |

### 模式 · 模型（7）

*切换工作方式：先规划再动手、换模型、调思考深浅、换回答风格、开沙箱*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/plan` `[description]` | **`/plan`** → `/verify` | 进入 plan 模式；带上描述就直接开始规划 |
| `/model` `[model]` | **`/model`** → `/effort` | 切换模型并存为默认；在列表里按 `s` 只改本会话 |
| `/effort` `[level|auto|status]` | `/model` → **`/effort`** | 设思考力度：low～xhigh、max 或 auto；`status` 看当前档 |
| `/fast` `[on|off]` | — | 开关快速模式 |
| `/advisor` `[model|off]` | — | 开关顾问：关键节点请第二个模型给建议 |
| `/output-style` `[style]` | — | 列出或切换输出风格 |
| `/sandbox` | — | 开关沙箱模式 |

### 上下文 · 对话（8）

*写着写着变慢变笨，用这几条腾地方；顺手问一句、把回复拿走*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/clear` `[name]` | `/recap` → **`/clear`** | 清空上下文，开新对话；只想腾地方用 `/compact` · 别名 `/reset` `/new` |
| `/compact` `[instructions]` | `/context` → **`/compact`** → `/clear` | 把已有对话总结压缩，腾出上下文 |
| `/context` `[all]` | **`/context`** → `/compact` | 用彩色方格图看上下文占用，附优化建议 |
| `/autocompact` `[auto|size]` | **`/autocompact`** → `/context` | 设自动压缩的触发点；`auto` 恢复默认 |
| `/btw` `[question]` | — | 问个旁支问题，不进对话历史 |
| `/recap` | — | 生成本会话的一行摘要 |
| `/copy` `[N]` | — | 复制上一条回复；`/copy 2` 复制倒数第二条 |
| `/export` `[filename]` | — | 把对话导出成纯文本 |

### 后台 · 并行 · 定时（10）

*把活丢出去并行跑，你继续干别的*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/background` `[prompt]` | **`/background`** → `/tasks` | 把当前会话转到后台跑，腾出终端 · 别名 `/bg` |
| `/tasks` | **`/tasks`** → `/stop` | 查看和管理本会话的后台任务 · 别名 `/bashes` |
| `/stop` | — | 停掉挂着的后台会话，记录和 worktree 保留 |
| `/list-agents` | — | 列出 Claude 能发消息的子 agent、队友和其他会话 · 别名 `/peers` |
| `/subtask` `<task>` | **`/subtask`** → `/tasks` | 派一个继承完整对话的后台子 agent，结果回到这里 |
| `/batch` `<instruction>` `skill` | **`/batch`** → `/verify` | 把大改动拆成 5–30 块并行做，每块一个 worktree 和 PR |
| `/workflows` | — | 查看 workflow 进度，可暂停、恢复、保存 |
| `/loop` `[interval] [prompt]` `skill` | — | 让提示词按间隔反复跑；不给间隔就由 Claude 自己定节奏 · 别名 `/proactive` |
| `/goal` `[condition|clear]` | — | 设一个目标，Claude 跨多轮一直做到达成 |
| `/schedule` `[description]` | — | 创建、修改、列出或立即运行云端定时任务 · 别名 `/routines` |

### 会话 · 换设备（8）

*同一段对话换个时间、换台机器接着聊*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/resume` `[session]` | — | 按 ID 或名字恢复对话，或打开会话列表 · 别名 `/continue` |
| `/rename` `[name]` | — | 给当前会话改名；不给名字就自动起一个 |
| `/exit` | — | 退出 CLI；在后台会话里是脱离，会话继续跑 · 别名 `/quit` |
| `/restart` | — | 重启并接着本会话，装上已下好的更新 · 别名 `/update` |
| `/teleport` | — | 把一个云端会话拉到这个终端继续 · 别名 `/tp` |
| `/remote-control` | — | 让本会话能从 claude.ai 远程控制 · 别名 `/rc` |
| `/desktop` | — | 把本会话转到桌面版继续 · 别名 `/app` |
| `/mobile` | — | 显示下载 Claude 手机 App 的二维码 · 别名 `/ios` `/android` |

### 只看不改：状态 · 用量（6）

*只是查看，不动项目，也不动设置*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/status` | — | 看版本、模型、账号和连通性 |
| `/usage` | **`/usage`** → `/usage-credits` | 看花费、套餐额度和活动统计 · 别名 `/cost` `/stats` |
| `/help` | — | 显示帮助和可用命令；`/help <命令>` 看单条用法 |
| `/release-notes` | — | 按版本看更新日志 |
| `/insights` | — | 分析你最近的会话，生成使用报告 |
| `/todos` **`表外`** | — | 打开待办列表浮层 |

### 项目配置 · 权限（12）

*让它记住项目规矩，少弹批准框*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/init` | **`/init`** → `/memory` | 为项目生成 CLAUDE.md |
| `/memory` | — | 编辑 CLAUDE.md，开关自动记忆 |
| `/permissions` | **`/permissions`** → `/fewer-permission-prompts` | 管理工具权限的 allow / ask / deny 规则 · 别名 `/allowed-tools` |
| `/fewer-permission-prompts` `skill` | `/permissions` → **`/fewer-permission-prompts`** | 把常用只读命令加进项目白名单，少弹批准框 · 旧名 `/less-permission-prompts` |
| `/auto-mode-setup` | — | 根据项目起草 auto mode 的环境说明，审过后保存 |
| `/config` `[key=value ...]` | — | 打开设置；也可 `/config key=value` 直接改 · 别名 `/settings` |
| `/update-config` `[request]` `skill` | — | 一句话说要改什么设置，Claude 去改 settings.json |
| `/env` **`表外`** | — | 设置 Bash / PowerShell 工具用的环境变量 |
| `/hooks` | — | 查看 hook 配置 |
| `/add-dir` `<path>` | — | 给会话加一个可访问的目录 |
| `/cd` `<path>` | — | 把会话移到另一个工作目录，对话保留 |
| `/import` `[codex|gemini|cursor]` | — | 把 Codex、Gemini CLI 或 Cursor 的配置搬进来 |

### 扩展：MCP / skill / plugin（12）

*装能力：外部服务、技能、插件、子 agent*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/mcp` `[reconnect|enable|disable] [server|all]` | **`/mcp`** → `/reload-plugins` | 管理 MCP 服务的连接和授权 |
| `/skills` | **`/skills`** → `/reload-skills` | 列出可用 skill，可调整哪些对 Claude 可见 |
| `/reload-skills` | — | 重新扫描 skill 目录，改动不用重启就生效 |
| `/skill-doctor` | **`/skill-doctor`** → `/skills` | 看每个 skill 占多少上下文、用得多不多 |
| `/plugin` `[subcommand]` | **`/plugin`** → `/reload-plugins` | 管理插件：安装、启用、停用 |
| `/plugins` **`表外`** | — | VS Code 扩展里的插件管理界面 |
| `/reload-plugins` `[--force]` | — | 重载插件，改动不用重启就生效 |
| `/plugin-authoring` `skill` | — | 加载写 mod 的参考资料 |
| `/agents` | — | 提示你怎么创建和管理子 agent |
| `/claude-api` `[subcommand]` `skill` | — | 加载 Claude API 与 Managed Agents 参考资料 |
| `/workflow-authoring` `skill` | — | 加载写 workflow 脚本的参考资料 |
| `/claude-approvals` `[request]` `skill` | — | 编辑、解释或调整 Claude Approvals 策略 |

### 做文档 · 做图 · 做演示（10）

*产出给人看的东西：页面、设计稿、幻灯片、白板、图表*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/artifacts` | — | 列出你的 artifact，挂到会话、打开或复制链接 |
| `/design` `[brief]` `skill` | — | 在画布上出 UI 稿、页面流程、落地页或海报 |
| `/design-sync` `[hint]` `skill` | — | 把仓库的 React 设计系统同步到 Claude Design |
| `/design-login` | — | 为 `/design-sync` 登录授权 |
| `/slides` `[brief]` `skill` | — | 按你的简述做一份演示稿 |
| `/whiteboard` `[brief]` `skill` | — | 按你的简述做一块白板 |
| `/motion` `[brief]` `skill` | — | 按你的简述做一段动画 |
| `/dataviz` `[request]` `skill` | — | 图表、仪表盘的设计指导：选图形、配色、可读性 |
| `/artifact-diagramming` `skill` | — | 在 artifact 里画示意图的指引 |
| `/artifact-capabilities` `skill` | — | 加载 artifact 运行时能力的参考 |

### 界面 · 外观 · 快捷键（9）

*看着舒服点、敲着顺手点*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/theme` | — | 换配色主题 |
| `/color` `[color|default]` | — | 设置本会话输入栏的颜色 |
| `/focus` | — | 精简视图：只显示提问、工具摘要和最终回复 |
| `/tui` `[classic|fullscreen]` | — | 切换经典 / 全屏渲染，带着对话重启 |
| `/scroll-speed` | — | 调滚轮速度（仅全屏渲染） |
| `/statusline` | — | 配置状态栏 |
| `/keybindings` | — | 打开快捷键配置文件 |
| `/terminal-setup` | — | 配好 Shift+Enter 换行等终端设置 |
| `/voice` `[hold|tap|off]` | — | 开关语音听写 |

### 账号 · 额度（7）

*登录、套餐、撞到上限怎么办*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/login` | — | 登录 Anthropic 账号 |
| `/logout` | — | 退出登录 |
| `/upgrade` | — | 打开升级页，换更高套餐 |
| `/rate-limit-options` | — | 撞到用量上限时，看还能怎么继续 |
| `/usage-credits` | — | 配置用量额度，或向管理员申请 · 旧名 `/extra-usage` |
| `/privacy-settings` | — | 查看和修改隐私设置 |
| `/passes` | — | 送朋友一周免费 Claude Code |

### 接 IDE · 浏览器 · 云服务（9）

*接 IDE、Chrome、GitHub、Slack、Bedrock / Vertex*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/ide` | — | 管理 IDE 集成并查看状态 |
| `/chrome` | — | 配置 Claude in Chrome |
| `/claude-in-chrome` `[task]` `skill` | `/chrome` → **`/claude-in-chrome`** | 让 Claude 在你的浏览器里测页面、填表、读日志 |
| `/install-github-app` | — | 给仓库装 Claude GitHub App，可顺带配 Actions |
| `/web-setup` | — | 用本地 gh 凭据把 GitHub 连到云端会话 |
| `/remote-env` | — | 选云端会话的默认环境 |
| `/install-slack-app` | — | 安装 Claude Slack 应用 |
| `/setup-bedrock` | — | 向导配置 Amazon Bedrock |
| `/setup-vertex` | — | 向导配置 Google Cloud Agent Platform |

### 查资料 · 学用法（3）

*查外部资料，或者学怎么用 Claude Code*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/deep-research` `<question>` `workflow` | — | 多路搜索、交叉核对，产出带引用的报告 |
| `/powerup` | — | 用带动画的小课程了解功能 |
| `/team-onboarding` | — | 根据使用历史生成团队上手指南 |

### 彩蛋 · 周边（3）

*不干活，但确实还在*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/radio` | — | 在浏览器打开 Claude FM 电台 |
| `/stickers` | — | 看贴纸还能不能领 |
| `/buddy` **`表外`** | — | 愚人节彩蛋：一只陪你写代码的小生物 |

---

## 准确性

> **官方 Commands 文档 + CHANGELOG，核到 v2.1.332（2026-11-25）**（2026-08-07 那一轮逐页扫过 code.claude.com 全部 129 个文档页面，核到 v2.1.224）
>
> ⚠️ 官方那张「All commands」表并不完整 —— /todos、/env、/buddy 只在 changelog 里出现过；表里同时留着 /vim 这种「已于 v2.1.92 移除」的墓碑行，本页把它们清掉了。内置命令随版本、套餐和平台变化，以你本地 /help 输出为准。

- [Claude Code — Commands reference](https://code.claude.com/docs/en/commands)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)
- [Claude Code — CHANGELOG](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md)

---

## 仓库结构

```
index.html      页面结构
style.css       样式（固定深色）
app.js          渲染 / 筛选 / 搜索 / 复制 / 配对跳转
commands.json   ← 所有内容都在这，唯一需要手写的文件
```

改文案 = 改 `commands.json` 推一下，Pages 直接生效，没有构建步骤。`app.js` 里不含任何具体命令内容。

**版面分两档**：顶栏用 `.bleed`，铺满整个浏览器宽度（宽屏上分组跳转能排成一行，两侧不浪费）；命令表用 `.wrap`，收在 78rem 里居中（一行读到底反而难扫）。顶栏高度会随视口宽度变，所以 `app.js` 实测它的高度写进 `--header-h`，sticky 的列名行和锚点滚动偏移都跟着这个变量走 —— 写死会在宽屏露缝。CI 里按 390 / 1280 / 2560 三档验这三件事。

**改完要把 `meta.contentVersion` 加一位** —— `index.html` 用 `?v=<contentVersion>` 破缓存（Pages 对静态资源发 `max-age=600`，不换 URL 浏览器会继续用旧的 JS/CSS）。CI 会检查两者一致。

**重新核过一遍命令之后，改 `meta.updated`**（页脚显示的核对日期）。

本地预览：`python3 -m http.server 8000`

---

## License

MIT
