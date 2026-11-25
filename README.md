# ClaudeCodeCMD

> Claude Code 内置命令速查 · 按「你正在干什么」排序

**https://macromozilla.github.io/ClaudeCodeCMD/**

**126 条命令 + 23 个别名**，每条写清楚是干嘛的，标出**通常跟哪条配着用**，一键复制。

这些命令 Claude Code **自带**，敲一下就能用 —— 不用装。

`Not affiliated with or endorsed by Anthropic.`

---

## 排序逻辑

**先按「对项目起什么作用」分组，组内再按使用频率从高到低排。**

作用不一样的命令不混在一起：`/verify` `/debug` 这类是真去找问题、改项目的；`/status` `/usage` 只是看一眼，什么都不动 —— 所以它们分在两个组里。

```
动手改代码 → 审查 · 验证 · 找 bug → 提交 · 盯 PR → 改坏了回退 → 上下文 · 对话 → 后台 · 并行 · 定时 → …
```
组的先后也大致按写代码时碰到的频率排，最前面几组是编程时真正会敲的。

**43 条配对关系**标在「配对」列：`←` 是先跑什么，`→` 是接着跑什么。比如：

```
  /code-review     ←/diff →/simplify →/verify
  /simplify        ←/code-review →/verify
  /verify          ←/run →/debug
  /ship            ←/verify
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

另外 **23 个别名**（`/undo` `/checkup` `/proactive` `/settings` …）写在官方表格的描述文字里，只读表格首列会全漏。

**多的：**官方表里还留着 `/vim`「Removed in v2.1.92」这样的墓碑行。本页把已经被移除的命令**整条删掉**了 —— `/tag` `/pr-comments` `/vim` `/ultraplan` 都不在这张表里（`/output-style` 在 v2.1.269 重新上线了，所以又收回来了）。**这里每一条都是当前版本敲下去有反应的。**

排除了约 40 个「看着像命令但不是」的：文档举例用的自定义 skill（`/deploy` `/commit`）、gateway 的 HTTP 接口（`/healthz` `/userinfo`）、权限文档里举例的机器人命令（`/merge`）。没往数字里凑。

---

## 全部命令

`skill` = bundled skill（本质是提示词，Claude 可能自己触发，会被同名自定义文件覆盖）· `workflow` = 多 agent 编排 · **`表外`** = 官方表未收录。别名和主名效果一样。每组内按使用频率从高到低排。

### 动手改代码（3）

*让 Claude 直接改你的项目：先定方案，再改、批量改、清理*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/plan` `[description]` | → `/verify` | 直接从输入栏进入 plan 模式 |
| `/simplify` `[target]` `skill` | ← `/code-review` → `/verify` | 四个 agent 并行看复用/精简/效率/抽象层次，然后直接改。不找 bug |
| `/batch` `<instruction>` `skill` | → `/verify` | 把大规模改动拆成 5-30 个独立单元并行做，每个单元一个 worktree + 一个 PR |

### 审查 · 验证 · 找 bug（8）

*找出项目里的问题：审改动、跑起来验、查漏洞*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/code-review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [--max-findings n|all|default] [pr#|branch|path]` `skill`<br>别名 `/ship:review` | ← `/diff` → `/simplify` → `/verify` | 审当前 diff（或指定 PR / 分支 / 路径）的正确性 bug 与可清理处，支持 --fix |
| `/verify` `skill` | ← `/run` → `/debug` | 把项目真的构建并跑起来看结果，而不是只跑测试和类型检查 |
| `/diff` | → `/code-review` | 打开交互式 diff 查看器，看未提交改动和每轮的改动 |
| `/run` `skill` | ← `/run-skill-generator` → `/verify` | 启动并操作你的项目，亲眼看改动生效，而不只是测试通过 |
| `/review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [pr#|branch|path]` | → `/code-review` | /code-review 的别名，用法和分档完全一样 |
| `/security-review` | ← `/diff` → `/verify` | 分析当前分支的改动有没有安全漏洞 |
| `/ultrareview` `[PR or branch]` | ← `/code-review` | 在云端沙箱跑一次深度多 agent 代码审查。现在推荐写成 `/code-review ultra`，这条是它的别名 |
| `/run-skill-generator` `skill` | → `/run` | 写一个项目专属 skill，教会 /run 和 /verify 怎么构建和启动你的项目 |

### 提交 · 盯 PR（3）

*改完推上去，开 PR，盯着评审和 CI 自动修*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/ship` `[level] [pr] [+bot]` `skill` | ← `/verify` | 一条龙：提交推送、没有 PR 就开一个、先审一遍，然后在本会话盯着 PR，评审意见和挂掉的 CI 自动推修复。`/ship stop` 停止 |
| `/steward` `[pr] [+bot]` `skill`<br>别名 `/ship:steward` | ← `/code-review` | 只盯 PR：评审意见和挂掉的 CI 自动推修复，不像 `/ship` 那样先审一遍。`/steward stop` 停止 |
| `/autofix-pr` `[prompt]` | — | 开一个云端会话盯着当前分支的 PR，CI 挂了或有评论就自动推修复 |

### 改坏了回退（3）

*后悔药：回到某个点，或者另开一条路试*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/rewind`<br>别名 `/checkpoint` `/undo` | → `/diff` | 把对话和/或代码回滚到之前某个检查点 |
| `/branch` `[name]` | → `/rewind` | 在当前这一点分叉出一条对话，换个方向试而不丢原来的 |
| `/fork` `[prompt]` | — | 把当前对话复制到一个新的后台会话，两边从此独立 |

### 上下文 · 对话（8）

*写着写着变慢变笨，用这几条腾地方；顺手问一句、把回复拿走*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/clear` `[name]`<br>别名 `/reset` `/new` | ← `/recap` | 清空上下文，开一段新对话 |
| `/compact` `[instructions]` | ← `/context` → `/clear` | 把已有对话总结压缩，腾出上下文空间 |
| `/context` `[all]` | → `/compact` | 用彩色方格图看当前上下文占用情况 |
| `/btw` `[question]` | — | 问个不进入对话历史的临时问题 |
| `/copy` `[N]` | — | 复制上一条回复到剪贴板 |
| `/recap` | — | 生成当前会话的一行摘要 |
| `/autocompact` `[auto|<tokens>]` | → `/context` | 设置自动压缩的触发点（上下文占到多满时自动压） |
| `/export` `[filename]` | — | 把当前对话导出成纯文本 |

### 后台 · 并行 · 定时（9）

*把活丢出去，你继续干别的*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/background` `[prompt]`<br>别名 `/bg` | → `/tasks` | 把当前会话转成后台 agent，腾出这个终端 |
| `/tasks`<br>别名 `/bashes` | → `/stop` | 查看和管理本会话的后台任务，含已完成的子 agent |
| `/subtask` `<task>` | → `/tasks` | 派一个继承完整对话的后台子 agent 去干活，你继续干你的 |
| `/loop` `[interval] [prompt]` `skill`<br>别名 `/proactive` | — | 让一个提示词按间隔反复跑；不给间隔则由 Claude 自己掌握节奏 |
| `/goal` `[condition|clear]` | — | 设一个目标，Claude 会跨多轮一直做到条件满足 |
| `/schedule` `[description]`<br>别名 `/routines` | — | 创建 / 更新 / 列出 / 立即运行云端定时任务（以前叫 Routine） |
| `/workflows` | — | 打开 workflow 进度视图，可暂停/恢复/保存正在跑的编排 |
| `/stop` | — | 停掉当前挂着的后台会话，对话记录和 worktree 都保留 |
| `/list-agents`<br>别名 `/peers` | — | 列出 Claude 能发消息的子 agent、团队队友和其他 Claude Code 会话，以及各自的名字 |

### 会话 · 换设备（8）

*同一段对话换个时间、换台机器接着聊*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/resume` `[session]`<br>别名 `/continue` | — | 按 ID 或名字恢复之前的对话，或打开会话选择器 |
| `/rename` `[name]` | — | 给当前会话改名，名字会显示在输入栏上 |
| `/exit`<br>别名 `/quit` | — | 退出 CLI |
| `/restart`<br>别名 `/update` | — | 重启 Claude Code 并接着这个会话，用来装上已下好的更新。**别和 `/upgrade` 搞混** —— 那个是升套餐 |
| `/teleport`<br>别名 `/tp` | — | 把一个 Claude Code on the web 会话拉到这个终端里继续 |
| `/remote-control`<br>别名 `/rc` | — | 让这个会话可以从 claude.ai 远程控制 |
| `/desktop`<br>别名 `/app` | — | 把当前会话转到 Claude Code 桌面版继续 |
| `/mobile`<br>别名 `/ios` `/android` | — | 显示下载 Claude 手机 App 的二维码 |

### 模型 · 模式（6）

*调快慢、调深浅、换回答风格、开沙箱*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/model` `[model]` | → `/effort` | 切换模型，并存为新会话的默认 |
| `/effort` `[level|auto|status|ultracode [on|off]]` | ← `/model` | 设置思考力度（low 到 xhigh、max、auto）；`status` 看当前档，`ultracode` 开关 ultracode |
| `/fast` `[on|off]` | — | 开关快速模式（仍是 Opus，只是输出更快，不降级到小模型） |
| `/output-style` `[style]` | — | 列出或切换输出风格，比如 `/output-style concise`（v2.1.269 起重新上线） |
| `/advisor` `[model|off]` | — | 开关顾问工具：在关键节点让第二个模型给建议 |
| `/sandbox` | — | 开关沙箱模式 |

### 只看不改：状态 · 用量（8）

*只是查看，不动项目，也不动设置*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/status` | — | 打开设置的状态页：版本、模型、账号、连通性 |
| `/usage` | → `/usage-credits` | 查看会话花费、套餐额度和活动统计 |
| `/cost` | — | /usage 的别名 |
| `/stats` | — | /usage 的别名 |
| `/help` | — | 显示帮助和可用命令 —— 你本地的这份才是最终依据 |
| `/release-notes` | — | 在交互式版本选择器里看更新日志 |
| `/insights` | — | 分析你的使用记录，生成项目领域、交互模式、卡点报告 |
| `/todos` **`表外`** | — | 打开待办列表浮层（changelog 里和 `/config` `/context` `/model` 并列为 command overlay）。 |

### 项目配置 · 权限（12）

*让它记住项目规矩，少弹批准框*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/init` | → `/memory` | 为项目生成 CLAUDE.md 指南 |
| `/memory` | — | 编辑 CLAUDE.md 记忆文件，开关自动记忆并查看条目 |
| `/permissions`<br>别名 `/allowed-tools` | → `/fewer-permission-prompts` | 管理工具权限的 allow / ask / deny 规则 |
| `/config` `[key=value ...]`<br>别名 `/settings` | — | 打开设置界面，调主题、模型、输出风格等 |
| `/add-dir` `<path>` | — | 给当前会话临时加一个可访问的工作目录 |
| `/cd` `<path>` | — | 把当前会话切到另一个工作目录 |
| `/hooks` | — | 查看工具事件的 hook 配置 |
| `/fewer-permission-prompts` `skill`<br>旧名 `/less-permission-prompts` | ← `/permissions` | 扫描历史里常用的只读命令，写进项目 settings.json 的白名单，减少批准弹窗 |
| `/update-config` `[request]` `skill` | — | 用一句话描述设置改动（放行某条命令、设环境变量、加 hook），Claude 去改对应的 settings.json |
| `/auto-mode-setup` | — | 读你的项目和最近的会话，起草 auto mode 的环境说明，你审过后存进用户设置 |
| `/import` `[codex|gemini|cursor] [--dry-run] [--yes]` | — | 把 Codex / Gemini CLI / Cursor 的配置搬进 Claude Code：指令文件、MCP、命令、子 agent、skill |
| `/env` **`表外`** | — | 设置环境变量，影响 Bash 与 PowerShell 工具执行的命令（v2.1.89 起也作用于 PowerShell）。 |

### 扩展：MCP / skill / plugin（12）

*装能力：外部服务、技能、插件、子 agent*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/mcp` `[reconnect <server>|enable|disable [<server>|all]]` | → `/reload-plugins` | 管理 MCP 服务连接与 OAuth 授权 |
| `/skills` | → `/reload-skills` | 列出可用的 skill |
| `/plugin` `[subcommand]` | → `/reload-plugins` | 管理 Claude Code 插件 |
| `/agents` | — | 提示你去让 Claude 创建/管理子 agent，或直接改 .claude/agents/ |
| `/reload-skills` | — | 重新扫描 skill 和命令目录，让会话中新增/改动的 skill 立即生效 |
| `/reload-plugins` `[--force]` | — | 重载所有活跃插件以应用改动，不用重启 |
| `/plugins` **`表外`** | — | 在 VS Code 扩展里打开「Manage plugins」图形界面。和 `/plugin` 不是一回事 —— 那个是在 CLI 里管插件。 |
| `/skill-doctor` | → `/skills` | 看每个 skill 占多少上下文、用得多不多，找出该关掉的 |
| `/claude-api` `[subcommand]` `skill` | — | 加载 Claude API 与 Managed Agents 参考资料（按项目语言）；子命令可做迁移、升级 SDK、省钱、提速、写评测等 |
| `/plugin-authoring` `skill` | — | 加载写 mod（改 Claude Code 界面或行为的插件）的参考资料 |
| `/workflow-authoring` `skill` | — | 加载写 workflow 编排脚本的参考：脚本 API、续跑、写法和范例 |
| `/claude-approvals` `[what to change or explain]` `skill` | — | 编辑、解释或调整 Claude Approvals 的策略文件和分类器 |

### 做文档 · 做图 · 做演示（10）

*产出给人看的东西：页面、设计稿、幻灯片、白板、图表*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/artifacts` | — | 列出你的 artifact（含别人分享给你的），挂到会话里、在浏览器打开或复制链接 |
| `/design` `[brief]` `skill` | — | 在一张画布上画 UI 稿、页面流程、落地页或海报，发布成 Claude Design artifact。`/design consent` / `/design revoke` 授权或收回 |
| `/slides` `[brief]` `skill` | — | 按你的简述做一份 Claude Slides 演示稿 |
| `/whiteboard` `[brief]` `skill` | — | 按你的简述做一块 Claude Whiteboards 白板 |
| `/dataviz` `[request]` `skill` | — | 图表/仪表盘的设计指导：选图形、配色、校验色盲安全与对比度 |
| `/artifact-diagramming` `skill` | — | 在 artifact 里画示意图的指引：什么时候值得画、画什么、内联 SVG 深浅色都看得清 |
| `/motion` `[brief]` `skill` | — | 按你的简述做一段 Claude Motion 动画（只在桌面版和云端会话，Team / Enterprise） |
| `/artifact-capabilities` `skill` | — | 加载已发布 artifact 能用的运行时能力参考（调用连接器、提供文件下载等） |
| `/design-sync` `[hint]` `skill` | — | 把仓库里的 React 设计系统同步到 Claude Design，让产出的设计用你的真实组件 |
| `/design-login` | — | 为 /design-sync 授权 claude.ai 账号的设计系统访问 |

### Claude Code 出毛病了（5）

*它自己装坏了、卡了、吃内存了 —— 诊断它，再报给官方*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/doctor` `[prompt-audit [path]]` `skill`<br>别名 `/checkup` | → `/status` | 体检安装、设置、扩展和 CLAUDE.md，给出修法，你点头后 Claude 动手改；`prompt-audit` 专查指令里给老模型写的过时写法 |
| `/debug` `[description]` `skill` | ← `/verify` → `/rewind` | 打开本会话的 debug 日志并读日志，排查 **Claude Code 自己**出的毛病（从敲下这一刻开始记录） |
| `/bug` `[report]`<br>别名 `/share` | — | 报 bug 或分享你的对话 |
| `/feedback` `[report]` | — | 提交对 Claude Code 的产品反馈 |
| `/heapdump` | — | 导出 JS 堆快照和内存分解，用于排查内存占用过高 |

### 界面 · 外观 · 快捷键（9）

*看着舒服点、敲着顺手点*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/theme` | — | 换配色主题 |
| `/focus` | — | 切换精简视图：只显示你的提问、一行工具摘要和最终回复（仅全屏渲染下可用） |
| `/statusline` | — | 配置状态栏 |
| `/tui` `[classic|fullscreen]` | — | 切换终端 UI 渲染器（经典 / 全屏无闪烁），并带着对话重启进去 |
| `/terminal-setup` | — | 配置 Shift+Enter 等终端快捷键 |
| `/keybindings` | — | 打开你的快捷键配置文件 |
| `/color` `[color|default]` | — | 设置当前会话输入栏的颜色 |
| `/voice` `[hold|tap|off]` | — | 开关语音听写 |
| `/scroll-speed` | — | 交互式调滚轮速度，调的时候能实时预览 |

### 账号 · 额度（7）

*登录、套餐、撞到上限怎么办*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/login` | — | 登录 Anthropic 账号 |
| `/logout` | — | 退出登录 |
| `/upgrade` | — | 在浏览器打开升级页，切换到更高套餐 |
| `/rate-limit-options` | — | 撞到 claude.ai 用量上限时列出办法：等重置后自动继续、加额度、升套餐 |
| `/usage-credits`<br>旧名 `/extra-usage` | — | 配置用量额度，或在触顶时向管理员申请 |
| `/privacy-settings` | — | 查看和修改隐私设置 |
| `/passes` | — | 送朋友一周免费 Claude Code |

### 接 IDE · 浏览器 · 云服务（9）

*接 IDE、Chrome、GitHub、Slack、Bedrock / Vertex*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/ide` | — | 管理 IDE 集成并查看状态 |
| `/chrome` | — | 配置 Claude in Chrome |
| `/claude-in-chrome` `[task]` `skill` | ← `/chrome` | 让 Claude 在你的浏览器里干活：测页面、填表单、读控制台日志 |
| `/install-github-app` | — | 为仓库安装 Claude GitHub App，可选配置 Actions 与 secrets |
| `/web-setup` | — | 用本地 gh CLI 凭据把 GitHub 账号连到 Claude Code on the web |
| `/remote-env` | — | 选择云端 agent 的默认环境 |
| `/install-slack-app` | — | 安装 Claude Slack 应用 |
| `/setup-bedrock` | — | 交互式向导配置 Amazon Bedrock 的认证、区域和模型 |
| `/setup-vertex` | — | 交互式向导配置 Google Cloud Agent Platform 的认证、项目、区域和模型 |

### 查资料 · 学用法（3）

*查外部资料，或者学怎么用 Claude Code*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/deep-research` `<question>` `workflow` | — | 对一个问题扇出网络搜索、交叉验证来源，产出带引用的报告 |
| `/powerup` | — | 用带动画的小课程快速了解 Claude Code 的功能 |
| `/team-onboarding` | — | 根据你的使用历史生成一份团队上手指南 |

### 彩蛋 · 周边（3）

*不干活，但确实还在*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/radio` | — | 在浏览器打开 Claude FM lo-fi 电台 |
| `/stickers` | — | 看 Claude Code 贴纸现在还能不能领 |
| `/buddy` **`表外`** | — | 愚人节彩蛋：孵一只小生物看着你写代码。 |

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
