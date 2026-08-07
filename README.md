# ClaudeCodeCMD

> Claude Code 内置命令速查 · 按「你正在干什么」排序

**https://macromozilla.github.io/ClaudeCodeCMD/**

**111 条命令 + 19 个别名**，每条写清楚是干嘛的，标出**通常跟哪条配着用**，一键复制。

这些命令 Claude Code **自带**，敲一下就能用 —— 不用装。

`Not affiliated with or endorsed by Anthropic.`

---

## 排序逻辑

不是按字母，也不是按官方文档的目录，是按**写代码的人依次会碰到的事**：

```
写代码 → 审代码 → 验证排错 → 改坏了回退 → 上下文满了 → 丢后台跑 → …
```
最前面五组就是编程时真正会敲的。`/help` 这种在最后 —— 真写代码的时候没人敲它。

**39 条配对关系**标在「配对」列：`←` 是先跑什么，`→` 是接着跑什么。比如：

```
  /code-review     ←/diff →/simplify →/verify
  /simplify        ←/code-review →/verify
  /verify          ←/run →/debug
  /debug           ←/verify →/rewind
```
鼠标悬停在配对上能看到**为什么**要这么配。

---

## 为什么是 111 条不是 104 条

官方文档那张「All commands」表列了 104 条，**那张表不完整**。把 code.claude.com 全部 129 个文档页面下载逐页扫描后，多找到 7 条：

| 命令 | 在哪找到的 |
|---|---|
| `/env` | changelog |
| `/todos` | changelog |
| `/plugins` | vs-code 文档 |
| `/update` | changelog |
| `/buddy` | changelog |
| `/output-style` | changelog |
| `/tag` | changelog |

另外 **19 个别名**（`/undo` `/checkup` `/proactive` `/settings` …）写在官方表格的描述文字里，只读表格首列会全漏。

同时排除了约 40 个「看着像命令但不是」的：文档举例用的自定义 skill（`/deploy` `/commit`）、gateway 的 HTTP 接口（`/healthz` `/userinfo`）、权限文档里举例的机器人命令（`/merge`）。没往数字里凑。

---

## 全部命令

`skill` = bundled skill（本质是提示词，Claude 可能自己触发，会被同名自定义文件覆盖）· `workflow` = 多 agent 编排 · **`表外`** = 官方表未收录。别名和主名效果一样。

### 写代码 · 改代码（5）

*开工：定方案、动手改、跑起来看*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/plan` `[description]` | → `/verify` | 直接从输入栏进入 plan 模式 |
| `/simplify` `[target]` `skill` | ← `/code-review` → `/verify` | 四个 agent 并行看复用/精简/效率/抽象层次，然后直接改。不找 bug |
| `/batch` `<instruction>` `skill` | → `/verify` | 把大规模改动拆成 5-30 个独立单元并行做，每个单元一个 worktree + 一个 PR |
| `/run` `skill` | ← `/run-skill-generator` → `/verify` | 启动并操作你的项目，亲眼看改动生效，而不只是测试通过 |
| `/run-skill-generator` `skill` | → `/run` | 写一个项目专属 skill，教会 /run 和 /verify 怎么构建和启动你的项目 |

### 审代码 · 找问题（5）

*改完先看再审 —— 这几条互相配着用*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/diff` | → `/code-review` | 打开交互式 diff 查看器，看未提交改动和每轮的改动 |
| `/code-review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [pr#|branch|path]` `skill` | ← `/diff` → `/simplify` → `/verify` | 审当前 diff（或指定 PR / 分支 / 路径）的正确性 bug 与可清理处，支持 --fix |
| `/review` `[low|medium|high|xhigh|max|ultra] [--fix] [--comment] [pr#|branch|path]` | → `/code-review` | /code-review 的别名，用法和分档完全一样 |
| `/ultrareview` `[PR or branch]` | ← `/code-review` | 在云端沙箱里跑一次深度多 agent 代码审查 |
| `/security-review` | ← `/diff` → `/verify` | 分析当前分支的改动有没有安全漏洞 |

### 验证 · 排错（5）

*确认没改坏；红了用这几条查*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/verify` `skill` | ← `/run` → `/debug` | 把项目真的构建并跑起来看结果，而不是只跑测试和类型检查 |
| `/debug` `[description]` `skill` | ← `/verify` → `/rewind` | 打开本会话的 debug 日志，并读日志排查问题 |
| `/doctor` `skill`<br>别名 `/checkup` | → `/status` | 跑一次安装体检，能诊断也能修：PATH、重复安装、无用 skill、慢 hook、CLAUDE.md 瘦身 |
| `/status` | — | 打开设置的状态页：版本、模型、账号、连通性 |
| `/heapdump` | — | 导出 JS 堆快照和内存分解，用于排查内存占用过高 |

### 改坏了回退（4）

*后悔药：回到某个点，或者另开一条路试*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/rewind`<br>别名 `/checkpoint` `/undo` | → `/diff` | 把对话和/或代码回滚到之前某个检查点 |
| `/branch` `[name]` | → `/rewind` | 在当前这一点分叉出一条对话，换个方向试而不丢原来的 |
| `/fork` `[prompt]` | — | 把当前对话复制到一个新的后台会话，两边从此独立 |
| `/stop` | — | 停掉当前的后台会话 |

### 上下文满了（7）

*写着写着变慢/变笨，用这几条腾地方*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/context` `[all]` | → `/compact` | 用彩色方格图看当前上下文占用情况 |
| `/compact` `[instructions]` | ← `/context` → `/clear` | 把已有对话总结压缩，腾出上下文空间 |
| `/autocompact` `[auto|<tokens>]` | → `/context` | 设置自动压缩的触发点（上下文占到多满时自动压） |
| `/clear` `[name]`<br>别名 `/reset` `/new` | ← `/recap` | 清空上下文，开一段新对话 |
| `/recap` | — | 生成当前会话的一行摘要 |
| `/export` `[filename]` | — | 把当前对话导出成纯文本 |
| `/copy` `[N]` | — | 复制上一条回复到剪贴板 |

### 让它后台自己干（10）

*把活丢出去，你继续干别的*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/background` `[prompt]`<br>别名 `/bg` | → `/tasks` | 把当前会话转成后台 agent，腾出这个终端 |
| `/subtask` `<task>` | → `/tasks` | 派一个继承完整对话的后台子 agent 去干活，你继续干你的 |
| `/tasks`<br>别名 `/bashes` | → `/stop` | 查看和管理本会话的后台任务，含已完成的子 agent |
| `/goal` `[condition|clear]` | — | 设一个目标，Claude 会跨多轮一直做到条件满足 |
| `/loop` `[interval] [prompt]` `skill`<br>别名 `/proactive` | — | 让一个提示词按间隔反复跑；不给间隔则由 Claude 自己掌握节奏 |
| `/schedule` `[description]`<br>别名 `/routines` | — | 创建/更新/列出/立即运行 Routine（跑在 Anthropic 云端的定时任务） |
| `/workflows` | — | 打开 workflow 进度视图，可暂停/恢复/保存正在跑的编排 |
| `/autofix-pr` `[prompt]` | — | 开一个云端会话盯着当前分支的 PR，CI 挂了或有评论就自动推修复 |
| `/btw` `[question]` | — | 问个不进入对话历史的临时问题 |
| `/focus` | — | 切换精简视图：只显示你的提问、一行工具摘要和最终回复 |

### 换机器 · 换终端（7）

*同一段对话在别处接着聊*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/resume` `[session]`<br>别名 `/continue` | — | 按 ID 或名字恢复之前的对话，或打开会话选择器 |
| `/rename` `[name]` | — | 给当前会话改名，名字会显示在输入栏上 |
| `/teleport`<br>别名 `/tp` | — | 把一个 Claude Code on the web 会话拉到这个终端里继续 |
| `/desktop`<br>别名 `/app` | — | 把当前会话转到 Claude Code 桌面版继续 |
| `/remote-control`<br>别名 `/rc` | — | 让这个会话可以从 claude.ai 远程控制 |
| `/mobile`<br>别名 `/ios` `/android` | — | 显示下载 Claude 手机 App 的二维码 |
| `/exit`<br>别名 `/quit` | — | 退出 CLI |

### 模型 · 思考力度（5）

*调快慢、调深浅、开沙箱*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/model` `[model]` | → `/effort` | 切换模型，并存为新会话的默认 |
| `/effort` `[level|auto]` | ← `/model` | 设置模型的思考力度（effort level） |
| `/fast` `[on|off]` | — | 开关快速模式（仍是 Opus，只是输出更快，不降级到小模型） |
| `/advisor` `[model|off]` | — | 开关顾问工具：在关键节点让第二个模型给建议 |
| `/sandbox` | — | 开关沙箱模式 |

### 项目配置 · 权限（10）

*让它记住项目规矩，少弹批准框*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/init` | → `/memory` | 为项目生成 CLAUDE.md 指南 |
| `/memory` | — | 编辑 CLAUDE.md 记忆文件，开关自动记忆并查看条目 |
| `/permissions`<br>别名 `/allowed-tools` | → `/fewer-permission-prompts` | 管理工具权限的 allow / ask / deny 规则 |
| `/hooks` | — | 查看工具事件的 hook 配置 |
| `/config` `[key=value ...]`<br>别名 `/settings` | — | 打开设置界面，调主题、模型、输出风格等 |
| `/add-dir` `<path>` | — | 给当前会话临时加一个可访问的工作目录 |
| `/cd` `<path>` | — | 把当前会话切到另一个工作目录 |
| `/env` **`表外`** | — | 设置环境变量，影响 Bash 与 PowerShell 工具执行的命令（v2.1.89 起也作用于 PowerShell）。 |
| `/todos` **`表外`** | — | 打开待办列表浮层（changelog 里和 `/config` `/context` `/model` 并列为 command overlay）。 |
| `/fewer-permission-prompts` `skill`<br>别名  （旧名 `/less-permission-prompts`） | ← `/permissions` | 扫描历史里常用的只读命令，写进项目 settings.json 的白名单，减少批准弹窗 |

### 扩展：skill / plugin / MCP（11）

*装能力：技能、插件、外部服务、子 agent*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/skills` | → `/reload-skills` | 列出可用的 skill |
| `/reload-skills` | — | 重新扫描 skill 和命令目录，让会话中新增/改动的 skill 立即生效 |
| `/plugin` `[subcommand]` | → `/reload-plugins` | 管理 Claude Code 插件 |
| `/plugins` **`表外`** | — | 在 VS Code 扩展里打开「Manage plugins」图形界面。和 `/plugin` 不是一回事 —— 那个是在 CLI 里管插件。 |
| `/reload-plugins` `[--force]` | — | 重载所有活跃插件以应用改动，不用重启 |
| `/mcp` `[reconnect <server>|enable|disable [<server>|all]]` | → `/reload-plugins` | 管理 MCP 服务连接与 OAuth 授权 |
| `/agents` | — | 提示你去让 Claude 创建/管理子 agent，或直接改 .claude/agents/ |
| `/claude-api` `[migrate|managed-agents-onboard|prompt-audit]` `skill` | — | 加载 Claude API 与 Managed Agents 的参考资料（按你项目的语言） |
| `/dataviz` `[request]` `skill` | — | 图表/仪表盘的设计指导：选图形、配色、校验色盲安全与对比度 |
| `/design-sync` `[hint]` `skill` | — | 把仓库里的 React 设计系统同步到 Claude Design，让产出的设计用你的真实组件 |
| `/design-login` | — | 为 /design-sync 授权 claude.ai 账号的设计系统访问 |

### 界面 · 外观 · 快捷键（11）

*看着舒服点、敲着顺手点*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/theme` | — | 换配色主题 |
| `/color` `[color|default]` | — | 设置当前会话输入栏的颜色 |
| `/tui` `[default|fullscreen]` | — | 切换终端 UI 渲染器，并带着对话重启进去 |
| `/statusline` | — | 配置状态栏 |
| `/keybindings` | — | 打开你的快捷键配置文件 |
| `/terminal-setup` | — | 配置 Shift+Enter 等终端快捷键 |
| `/scroll-speed` | — | 交互式调滚轮速度，调的时候能实时预览 |
| `/voice` `[hold|tap|off]` | — | 开关语音听写 |
| `/ide` | — | 管理 IDE 集成并查看状态 |
| `/chrome` | — | 配置 Claude in Chrome |
| `/powerup` | — | 用带动画的小课程快速了解 Claude Code 的功能 |

### 账号 · 花费 · 额度（9）

*登录、看花了多少、套餐*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/login` | — | 登录 Anthropic 账号 |
| `/logout` | — | 退出登录 |
| `/usage` | → `/usage-credits` | 查看会话花费、套餐额度和活动统计 |
| `/cost` | — | /usage 的别名 |
| `/stats` | — | /usage 的别名 |
| `/usage-credits`<br>别名  （旧名 `/extra-usage`） | — | 配置用量额度，或在触顶时向管理员申请 |
| `/upgrade` | — | 在浏览器打开升级页，切换到更高套餐 |
| `/passes` | — | 送朋友一周免费 Claude Code |
| `/privacy-settings` | — | 查看和修改隐私设置 |

### 装环境 · 接集成（7）

*接 GitHub / Slack / Bedrock / Vertex，或装到网页版*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/install-github-app` | — | 为仓库安装 Claude GitHub App，可选配置 Actions 与 secrets |
| `/install-slack-app` | — | 安装 Claude Slack 应用 |
| `/web-setup` | — | 用本地 gh CLI 凭据把 GitHub 账号连到 Claude Code on the web |
| `/remote-env` | — | 选择云端 agent 的默认环境 |
| `/setup-bedrock` | — | 交互式向导配置 Amazon Bedrock 的认证、区域和模型 |
| `/setup-vertex` | — | 交互式向导配置 Google Cloud Agent Platform 的认证、项目、区域和模型 |
| `/update` **`表外`** | — | 更新 Claude Code 自身。**注意和 `/upgrade` 区分** —— 后者是打开网页升套餐。 |

### 查资料 · 反馈 · 参考（7）

*查外部资料、报 bug、看更新日志*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/deep-research` `<question>` `workflow` | — | 对一个问题扇出网络搜索、交叉验证来源，产出带引用的报告 |
| `/bug` `[report]`<br>别名 `/share` | — | 报 bug 或分享你的对话 |
| `/feedback` `[report]` | — | 提交对 Claude Code 的产品反馈 |
| `/release-notes` | — | 在交互式版本选择器里看更新日志 |
| `/insights` | — | 分析你的使用记录，生成项目领域、交互模式、卡点报告 |
| `/team-onboarding` | — | 根据你的使用历史生成一份团队上手指南 |
| `/help` | — | 显示帮助和可用命令 —— 你本地的这份才是最终依据 |

### 杂项 · 已移除（8）

*彩蛋，以及已经没了的（网上老文章还在提）*

| 命令 | 配对 | 说明 |
|---|---|---|
| `/radio` | — | 在浏览器打开 Claude FM lo-fi 电台 |
| `/stickers` | — | 订购 Claude Code 贴纸 |
| `/buddy` **`表外`** | — | 愚人节彩蛋：孵一只小生物看着你写代码。 |
| `/output-style` **`表外`** | — | 【已废弃 v2.1.73，已移除 v2.1.91】改用 `/config` 或直接改 `outputStyle` 设置。 |
| `/tag` **`表外`** | — | 【已移除 v2.1.92】原本用于给会话打标签。 |
| `/pr-comments` `[PR]` | — | 【已移除 v2.1.91】 |
| `/vim` | — | 【已移除 v2.1.92】 |
| `/ultraplan` `<prompt>` | — | 【已移除】 |

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
app.js          渲染 / 筛选 / 搜索 / 复制 / 配对跳转
commands.json   ← 所有内容都在这，唯一需要手写的文件
```

改文案 = 改 `commands.json` 推一下，Pages 直接生效，没有构建步骤。`app.js` 里不含任何具体命令内容。

**改完要把 `meta.contentVersion` 加一位** —— `index.html` 用 `?v=<contentVersion>` 破缓存（Pages 对静态资源发 `max-age=600`，不换 URL 浏览器会继续用旧的 JS/CSS）。CI 会检查两者一致。

本地预览：`python3 -m http.server 8000`

---

## License

MIT
