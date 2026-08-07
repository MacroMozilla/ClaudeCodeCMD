# ClaudeCodeCMD

> Claude Code 内置命令速查 · 111 条全收录

**https://macromozilla.github.io/ClaudeCodeCMD/**

Claude Code 内置命令速查表：**111 条命令 + 19 个别名**，常用的排在最前，按用途分组，可搜索可筛选。

这些命令 Claude Code **自带**，敲一下就能用 —— 不用安装，不用复制。

`Not affiliated with or endorsed by Anthropic.`

---

## 为什么不是 104 条

官方文档那张「All commands」表列了 104 条。**那张表不完整。**

把 code.claude.com 全部 129 个文档页面下载下来逐页扫描后，多找到 7 条真实存在但表里没有的命令：

| 命令 | 在哪找到的 |
|---|---|
| `/todos` | changelog |
| `/env` | changelog |
| `/plugins` | vs-code 文档 |
| `/update` | changelog |
| `/buddy` | changelog |
| `/output-style` | changelog |
| `/tag` | changelog |

另外 **19 个别名**（`/undo` `/checkup` `/proactive` `/settings` …）写在官方表格的描述文字里，只读表格首列会全部漏掉。

合计可以直接敲的名字：**130 个**。

同时排除了约 40 个「看起来像命令但不是」的：文档举例用的自定义 skill（`/deploy` `/commit`）、gateway 的 HTTP 接口（`/healthz` `/userinfo`）、权限文档里举例的机器人命令（`/merge`）。没往数字里凑。

---

## 命令一览

标 `skill` = bundled skill（本质是提示词，Claude 可能自己触发，会被你的同名文件覆盖），`workflow` = 多 agent 编排，**`表外`** = 官方表未收录。别名和主名效果一样，敲哪个都行。

### 最常用（16）

*日常几乎天天敲的，先看这些*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/help` | — | 显示帮助和可用命令 —— 你本地的这份才是最终依据 |
| `/clear` `[name]` | `/reset` `/new` | 清空上下文，开一段新对话 |
| `/compact` `[instructions]` | — | 把已有对话总结压缩，腾出上下文空间 |
| `/context` `[all]` | — | 用彩色方格图看当前上下文占用情况 |
| `/resume` `[session]` | `/continue` | 按 ID 或名字恢复之前的对话，或打开会话选择器 |
| `/model` `[model]` | — | 切换模型，并存为新会话的默认 |
| `/init` | — | 为项目生成 CLAUDE.md 指南 |
| `/diff` | — | 打开交互式 diff 查看器，看未提交改动和每轮的改动 |
| `/rewind` | `/checkpoint` `/undo` | 把对话和/或代码回滚到之前某个检查点 |
| `/code-review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [pr#|branch|path]` `skill` | — | 审当前 diff（或指定 PR / 分支 / 路径）的正确性 bug 与可清理处，支持 --fix |
| `/review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [pr#|branch|path]` | — | /code-review 的别名，用法和分档完全一样 |
| `/usage` | — | 查看会话花费、套餐额度和活动统计 |
| `/config` `[key=value ...]` | `/settings` | 打开设置界面，调主题、模型、输出风格等 |
| `/permissions` | `/allowed-tools` | 管理工具权限的 allow / ask / deny 规则 |
| `/doctor` `skill` | `/checkup` | 跑一次安装体检，能诊断也能修：PATH、重复安装、无用 skill、慢 hook、CLAUDE.md 瘦身 |
| `/plan` `[description]` | — | 直接从输入栏进入 plan 模式 |

### 会话与上下文（18）

*开新对话、压缩上下文、回滚、分叉、后台跑*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/autocompact` `[auto|<tokens>]` | — | 设置自动压缩的触发点（上下文占到多满时自动压） |
| `/rename` `[name]` | — | 给当前会话改名，名字会显示在输入栏上 |
| `/recap` | — | 生成当前会话的一行摘要 |
| `/export` `[filename]` | — | 把当前对话导出成纯文本 |
| `/copy` `[N]` | — | 复制上一条回复到剪贴板 |
| `/branch` `[name]` | — | 在当前这一点分叉出一条对话，换个方向试而不丢原来的 |
| `/fork` `[prompt]` | — | 把当前对话复制到一个新的后台会话，两边从此独立 |
| `/background` `[prompt]` | `/bg` | 把当前会话转成后台 agent，腾出这个终端 |
| `/stop` | — | 停掉当前的后台会话 |
| `/tasks` | `/bashes` | 查看和管理本会话的后台任务，含已完成的子 agent |
| `/subtask` `<task>` | — | 派一个继承完整对话的后台子 agent 去干活，你继续干你的 |
| `/goal` `[condition|clear]` | — | 设一个目标，Claude 会跨多轮一直做到条件满足 |
| `/btw` `[question]` | — | 问个不进入对话历史的临时问题 |
| `/focus` | — | 切换精简视图：只显示你的提问、一行工具摘要和最终回复 |
| `/teleport` | `/tp` | 把一个 Claude Code on the web 会话拉到这个终端里继续 |
| `/desktop` | `/app` | 把当前会话转到 Claude Code 桌面版继续 |
| `/remote-control` | `/rc` | 让这个会话可以从 claude.ai 远程控制 |
| `/todos` **`表外`** | — | 打开待办列表浮层（changelog 里和 `/config` `/context` `/model` 并列为 command overlay）。 |

### 写代码与审查（11）

*改代码、审代码、验证、调试*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/simplify` `[target]` `skill` | — | 四个 agent 并行看复用/精简/效率/抽象层次，然后直接改。不找 bug |
| `/verify` `skill` | — | 把项目真的构建并跑起来看结果，而不是只跑测试和类型检查 |
| `/run` `skill` | — | 启动并操作你的项目，亲眼看改动生效，而不只是测试通过 |
| `/run-skill-generator` `skill` | — | 写一个项目专属 skill，教会 /run 和 /verify 怎么构建和启动你的项目 |
| `/security-review` | — | 分析当前分支的改动有没有安全漏洞 |
| `/ultrareview` `[PR or branch]` | — | 在云端沙箱里跑一次深度多 agent 代码审查 |
| `/batch` `<instruction>` `skill` | — | 把大规模改动拆成 5-30 个独立单元并行做，每个单元一个 worktree + 一个 PR |
| `/debug` `[description]` `skill` | — | 打开本会话的 debug 日志，并读日志排查问题 |
| `/deep-research` `<question>` `workflow` | — | 对一个问题扇出网络搜索、交叉验证来源，产出带引用的报告 |
| `/autofix-pr` `[prompt]` | — | 开一个云端会话盯着当前分支的 PR，CI 挂了或有评论就自动推修复 |
| `/workflows` | — | 打开 workflow 进度视图，可暂停/恢复/保存正在跑的编排 |

### 模型与运行方式（6）

*换模型、调力度、快慢、沙箱、定时*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/effort` `[level|auto]` | — | 设置模型的思考力度（effort level） |
| `/fast` `[on|off]` | — | 开关快速模式（仍是 Opus，只是输出更快，不降级到小模型） |
| `/advisor` `[model|off]` | — | 开关顾问工具：在关键节点让第二个模型给建议 |
| `/sandbox` | — | 开关沙箱模式 |
| `/loop` `[interval] [prompt]` `skill` | `/proactive` | 让一个提示词按间隔反复跑；不给间隔则由 Claude 自己掌握节奏 |
| `/schedule` `[description]` | `/routines` | 创建/更新/列出/立即运行 Routine（跑在 Anthropic 云端的定时任务） |

### 配置与权限（15）

*设置、权限、记忆、快捷键、外观*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/memory` | — | 编辑 CLAUDE.md 记忆文件，开关自动记忆并查看条目 |
| `/hooks` | — | 查看工具事件的 hook 配置 |
| `/keybindings` | — | 打开你的快捷键配置文件 |
| `/statusline` | — | 配置状态栏 |
| `/terminal-setup` | — | 配置 Shift+Enter 等终端快捷键 |
| `/theme` | — | 换配色主题 |
| `/color` `[color|default]` | — | 设置当前会话输入栏的颜色 |
| `/tui` `[default|fullscreen]` | — | 切换终端 UI 渲染器，并带着对话重启进去 |
| `/scroll-speed` | — | 交互式调滚轮速度，调的时候能实时预览 |
| `/voice` `[hold|tap|off]` | — | 开关语音听写 |
| `/ide` | — | 管理 IDE 集成并查看状态 |
| `/chrome` | — | 配置 Claude in Chrome |
| `/add-dir` `<path>` | — | 给当前会话临时加一个可访问的工作目录 |
| `/cd` `<path>` | — | 把当前会话切到另一个工作目录 |
| `/env` **`表外`** | — | 设置环境变量，影响 Bash 与 PowerShell 工具执行的命令（v2.1.89 起也作用于 PowerShell）。 |

### 扩展：skill / plugin / MCP（11）

*技能、插件、MCP 服务、子 agent*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/skills` | — | 列出可用的 skill |
| `/reload-skills` | — | 重新扫描 skill 和命令目录，让会话中新增/改动的 skill 立即生效 |
| `/plugin` `[subcommand]` | — | 管理 Claude Code 插件 |
| `/reload-plugins` `[--force]` | — | 重载所有活跃插件以应用改动，不用重启 |
| `/mcp` `[reconnect <server>|enable|disable [<server>|all]]` | — | 管理 MCP 服务连接与 OAuth 授权 |
| `/agents` | — | 提示你去让 Claude 创建/管理子 agent，或直接改 .claude/agents/ |
| `/claude-api` `[migrate|managed-agents-onboard|prompt-audit]` `skill` | — | 加载 Claude API 与 Managed Agents 的参考资料（按你项目的语言） |
| `/dataviz` `[request]` `skill` | — | 图表/仪表盘的设计指导：选图形、配色、校验色盲安全与对比度 |
| `/design-sync` `[hint]` `skill` | — | 把仓库里的 React 设计系统同步到 Claude Design，让产出的设计用你的真实组件 |
| `/design-login` | — | 为 /design-sync 授权 claude.ai 账号的设计系统访问 |
| `/plugins` **`表外`** | — | 在 VS Code 扩展里打开「Manage plugins」图形界面。和 `/plugin` 不是一回事 —— 那个是在 CLI 里管插件。 |

### 账号与用量（8）

*登录、花费、额度、套餐*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/login` | — | 登录 Anthropic 账号 |
| `/logout` | — | 退出登录 |
| `/cost` | — | /usage 的别名 |
| `/stats` | — | /usage 的别名 |
| `/usage-credits` | （旧名 `/extra-usage`） | 配置用量额度，或在触顶时向管理员申请 |
| `/upgrade` | — | 在浏览器打开升级页，切换到更高套餐 |
| `/passes` | — | 送朋友一周免费 Claude Code |
| `/privacy-settings` | — | 查看和修改隐私设置 |

### 安装与诊断（18）

*体检、状态、装集成、报 bug*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/status` | — | 打开设置的状态页：版本、模型、账号、连通性 |
| `/bug` `[report]` | `/share` | 报 bug 或分享你的对话 |
| `/feedback` `[report]` | — | 提交对 Claude Code 的产品反馈 |
| `/release-notes` | — | 在交互式版本选择器里看更新日志 |
| `/insights` | — | 分析你的使用记录，生成项目领域、交互模式、卡点报告 |
| `/team-onboarding` | — | 根据你的使用历史生成一份团队上手指南 |
| `/powerup` | — | 用带动画的小课程快速了解 Claude Code 的功能 |
| `/fewer-permission-prompts` `skill` | （旧名 `/less-permission-prompts`） | 扫描历史里常用的只读命令，写进项目 settings.json 的白名单，减少批准弹窗 |
| `/heapdump` | — | 导出 JS 堆快照和内存分解，用于排查内存占用过高 |
| `/install-github-app` | — | 为仓库安装 Claude GitHub App，可选配置 Actions 与 secrets |
| `/install-slack-app` | — | 安装 Claude Slack 应用 |
| `/web-setup` | — | 用本地 gh CLI 凭据把 GitHub 账号连到 Claude Code on the web |
| `/remote-env` | — | 选择云端 agent 的默认环境 |
| `/setup-bedrock` | — | 交互式向导配置 Amazon Bedrock 的认证、区域和模型 |
| `/setup-vertex` | — | 交互式向导配置 Google Cloud Agent Platform 的认证、项目、区域和模型 |
| `/mobile` | `/ios` `/android` | 显示下载 Claude 手机 App 的二维码 |
| `/exit` | `/quit` | 退出 CLI |
| `/update` **`表外`** | — | 更新 Claude Code 自身。**注意和 `/upgrade` 区分** —— 后者是打开网页升套餐。 |

### 杂项与已移除（8）

*好玩的，以及已经没了的（网上老文章还在提）*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/radio` | — | 在浏览器打开 Claude FM lo-fi 电台 |
| `/stickers` | — | 订购 Claude Code 贴纸 |
| `/pr-comments` `[PR]` | — | 【已移除 v2.1.91】 |
| `/vim` | — | 【已移除 v2.1.92】 |
| `/ultraplan` `<prompt>` | — | 【已移除】 |
| `/buddy` **`表外`** | — | 愚人节彩蛋：孵一只小生物看着你写代码。 |
| `/output-style` **`表外`** | — | 【已废弃 v2.1.73，已移除 v2.1.91】改用 `/config` 或直接改 `outputStyle` 设置。 |
| `/tag` **`表外`** | — | 【已移除 v2.1.92】原本用于给会话打标签。 |

---

## 准确性

> **code.claude.com 全部 129 个文档页面（含 changelog），快照日 2026-08-06**
>
> ⚠️ 官方那张「All commands」表并不完整 —— /update、/todos、/env、/buddy 只在 changelog 里出现过。内置命令随版本、套餐和平台变化，以你本地 /help 输出为准。

- [Claude Code — Commands reference](https://code.claude.com/docs/en/commands)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)

---

## 仓库结构

```
index.html      页面结构
style.css       样式（跟随系统深浅色）
app.js          渲染 / 筛选 / 搜索
commands.json   ← 所有内容都在这，唯一需要手写的文件
```

改文案 = 改 `commands.json` 推一下，Pages 直接生效，没有构建步骤。`app.js` 里不含任何具体命令内容。

**改完要把 `meta.contentVersion` 加一位** —— `index.html` 用 `?v=<contentVersion>` 破缓存（GitHub Pages 对静态资源发 `max-age=600`，不换 URL 浏览器会继续用旧的 JS/CSS）。CI 会检查两者一致。

本地预览：`python3 -m http.server 8000`

---

## License

MIT
