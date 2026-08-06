# ClaudeCodeCMD

> Claude Code 命令速查 · 复制即用

**https://macromozilla.github.io/ClaudeCodeCMD/**

一屏看完 19 条自定义命令，点命令名展开细节，一键复制。外加 111 条 Claude Code 内置命令速查（含 19 个别名、2 个旧名，可直接敲的名字共 132 个）。

`Not affiliated with or endorsed by Anthropic.`

---

## 两个复制按钮的区别

| 按钮 | 复制到的内容 | 怎么用 |
|---|---|---|
| **提示词** | 只有提示词正文 | 一次性用 —— 粘进 Claude Code 对话框，回车就跑 |
| **装成 /命令** | 正文 + 一段 YAML frontmatter | 长期用 —— 存成 `.claude/commands/xxx.md`，以后敲 `/xxx` 就能调用 |

frontmatter 就是文件开头 `---` 之间那几行，告诉 Claude Code 这个命令叫什么、干什么、能不能自己触发、允许用哪些工具。没有它，文件只是一段文本，不会变成 `/命令`。

懒得一个个复制的话，整个目录拷过去：

```bash
git clone https://github.com/MacroMozilla/ClaudeCodeCMD.git
mkdir -p .claude/commands && cp ClaudeCodeCMD/commands/*.md .claude/commands/
```
放 `~/.claude/commands/` 则所有项目通用。

---

## 这是什么

每条命令都写清楚三件事：**什么时候用**、**什么时候别用**、**有什么坑**。第二件是这个项目存在的理由 —— 网上的命令合集基本只写第一件。

命令按「配起来用」分组，不是按功能分类：查的和修的挨在一起，测量的和优化的挨在一起。

---

## ⚠️ 三个命令会覆盖 Claude Code 自带的

| 这里的命令 | 覆盖掉的自带命令 | 想两个都留着 |
|---|---|---|
| `simplify` | `/simplify` | 改名，比如 `simplify-strict` |
| `verify` | `/verify` | 改名，比如 `verify-strict` |
| `code-review` | `/code-review` | 改名，比如 `code-review-strict` |

另一个容易搞反的点：frontmatter 的 **`allowed-tools` 不是限制，是免批准**（官方原文 *"It does not restrict which tools are available: every tool remains callable"*）。要让审查命令真的不能改文件，得用 **`disallowed-tools`**。本仓库 6 条只读命令全部用的后者。

---

## 推荐执行顺序

不熟的代码库，从上往下按这个顺序走。顺序不是随便排的 —— 中间有两处调换了就会白干。

```
  1.先看懂  ›  2.补测试  ›  3.只读审查  ›  4.挑着修  ›  5.清场  ›  6.动结构
  7.收局部  ›  8.先测量  ›  9.再优化  ›  10.统一风格  ›  11.补文档
```

**每步之后 → verify** —— 它是节拍器，不是终点。攒几个阶段才验一次，红了你不知道是哪一步红的。

三处不能调换：

- **先重构，后优化** —— 反过来的话，你精心调过的那段代码会在重构时被整个挪走重写。
- **先测量，后优化** —— 没有 profile 数据，optimize 应该直接拒绝开工。
- **审查和修分开** —— 审查阶段允许改文件，你就失去了挑哪些问题值得修的机会。

---

## 19 条自定义命令

### 1. 先看懂

*动手之前先知道现在长什么样，不然一定会捅到不该捅的地方*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`explain-architecture`](commands/explain-architecture.md) | 只读 | 讲清楚这个代码库实际长什么样 —— 以代码为准，不是以 README 为准。 | — | `refactor` `harden` `document` |
| [`check-against-spec`](commands/check-against-spec.md) | 只读 | 拿实现对着规格逐条核，两个方向都核。 | — | `fix-issues` `add-tests` |

<details>
<summary><code>explain-architecture</code> 的细节</summary>

**✓ 什么时候用**

- 接手一个陌生的代码库，动手之前。
- 所有大改造的前置：不知道边界在哪就动手，一定会捅到不该捅的地方。
- 要给新人讲这个项目。

**✗ 什么时候别用**

- 你只想看懂一个函数 —— 直接问就行，不用启动全局梳理。
- 指望它输出一份可以直接交付的架构文档 —— 它给的是现状描述，成文还得你来。

**⚠ 坑**

- 它会照抄 README 和文档里的说法，而那些经常和代码早就对不上了。要求它以代码为准，并且明确指出文档和实现打架的地方 —— 这些地方往往就是坑最多的地方。
- 它容易描述「理想的分层」而不是实际的依赖流向。要求它指出打破分层的实际引用。

📋 提示词全文 → [`commands/explain-architecture.md`](commands/explain-architecture.md)

</details>

<details>
<summary><code>check-against-spec</code> 的细节</summary>

**✓ 什么时候用**

- 有一份需求文档 / API 规格 / RFC，想知道实现到哪一步了。
- 接了别人的活，要验收。
- 对着一份协议或标准做实现，需要逐条确认。

**✗ 什么时候别用**

- 没有明确的规格文件 —— 它会开始猜你想要什么，那还不如不核。
- 规格已经过时 —— 先更新规格，否则你会照着错的东西改代码。

**⚠ 坑**

- 只核「规格里有的实现了没」是不够的 —— 反方向同样重要：实现里有一堆规格没提的行为，那些往往是没人知道的隐藏功能或者副作用。
- 它倾向于把「大致做了」判成「已实现」。要求每条给出 file:line 证据，给不出就算未实现。

📋 提示词全文 → [`commands/check-against-spec.md`](commands/check-against-spec.md)

</details>


### 2. 建安全网

*后面每一条高风险命令都以「行为不变」为前提，没测试你验证不了这件事*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`add-tests`](commands/add-tests.md) | 低风险 | 给现有行为补测试 —— 所有高风险命令的前置。 | — | `refactor` `simplify` `verify` |
| [`verify`](commands/verify.md) | 只读 | 跑构建、测试、类型检查，如实报结果 —— 每次改完都跑一次。 | — | `fix-issues` |

<details>
<summary><code>add-tests</code> 的细节</summary>

**✓ 什么时候用**

- 准备跑 refactor / simplify / optimize，需要先有行为基线。
- 某块代码你不敢动，因为不知道改坏了会不会有人发现。
- 刚修完 bug，要防止它再回来。

**✗ 什么时候别用**

- 你希望测试描述的是「应该怎样」 —— 补基线测试要锁的是「现在实际怎样」，两者混了就失去了基线的意义。
- 只是想把覆盖率数字刷上去 —— 那会得到一堆断言 mock 的测试，没有任何保护作用。

**⚠ 坑**

- 它会写出「测试 mock 是否按 mock 的方式工作」的测试 —— 覆盖率涨了，保护力为零。
- 补基线的时候如果发现当前行为是错的，它会顺手把代码改对。那你就没有基线了，而且 bug 修复混进了测试 commit。

📋 提示词全文 → [`commands/add-tests.md`](commands/add-tests.md)

</details>

<details>
<summary><code>verify</code> 的细节</summary>

> 🔁 **会覆盖自带的 `/verify`** —— Claude Code 自带 /verify（bundled skill），它的做法是**真的把 app 构建并跑起来看结果**，而不是退回去跑测试和类型检查。这条是「跑检查套件」的版本，语义不完全一样。同名会覆盖 —— 想两个都要，把这条改名成 verify-checks。另外自 v2.1.215 起，Claude 不会自己主动跑 /verify，只在你敲的时候跑。

**✓ 什么时候用**

- 任何一条改代码的命令跑完之后，立刻跑。
- 分阶段的大改中间，每个阶段之后。
- 提交前最后确认一遍。

**✗ 什么时候别用**

- 你指望它顺手把红的修绿 —— 它只报告，修是 fix-issues 的事。
- 整个流程只在最后跑这一次 —— 那就失去意义了，它是节拍器不是终点。

**⚠ 坑**

- 最常见的失败模式是「乐观汇报」：只跑了一部分测试就说通过，或者把 skip 当成 pass。要求它把实际执行的命令和原始输出贴出来。
- 改动没被任何测试覆盖时，绿灯说明不了任何事。要求它明确说出「这次改的地方有没有被测到」。

📋 提示词全文 → [`commands/verify.md`](commands/verify.md)

</details>


### 3. 查 → 修

*查的只读、修的才动手；分开跑你才有机会挑哪些值得修*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`code-review`](commands/code-review.md) | 只读 | 审查当前 diff，只出报告，一个字都不改。 | — | `fix-issues` `add-tests` |
| [`security-audit`](commands/security-audit.md) | 只读 | 按攻击面过一遍代码，只报不修，每条要给出可利用路径。 | `explain-architecture` | `fix-issues` `audit-dependencies` |
| [`fix-issues`](commands/fix-issues.md) | 高风险 | 按已有的问题清单逐条修，一条一个 commit。 | `code-review` `add-tests` | `verify` |
| [`improve-error-handling`](commands/improve-error-handling.md) | 中风险 | 把吞掉的、糊弄过去的错误处理补成能排查的。 | `code-review` | `add-tests` `verify` |

<details>
<summary><code>code-review</code> 的细节</summary>

> 🔁 **会覆盖自带的 `/code-review`** —— Claude Code 自带 /code-review（bundled skill，支持 low/medium/high/xhigh/max/ultra 分档、--fix、--comment）。同名自定义命令会**覆盖**它。除非你就是想要一个更严格的只读版本，否则先用自带的。

**✓ 什么时候用**

- 写完一版准备提交，想在自己看之前先拿到一张排好序的问题清单。
- 接手别人的分支，需要快速知道哪里危险。
- 作为 fix-issues 的前置 —— 先有清单，再挑着修。

**✗ 什么时候别用**

- 你其实想让它顺手把问题改掉 —— 那直接跑 fix-issues，别指望审查阶段偷偷帮你改。
- diff 超过一两千行 —— 拆开分批审，一次性审完的结论没法用。
- 你要找的是安全漏洞 —— 用 security-audit，这条只做浅层覆盖。

**⚠ 坑**

- **`allowed-tools` 不是限制，是免批准。** 官方文档写得很清楚：它只是让列出的工具在这一轮不用问你，`"It does not restrict which tools are available: every tool remains callable"`。想真的禁止它写文件，要用 `disallowed-tools`。网上很多「只读命令」模板这里是反的。
- 不写死「不许改文件」，它十有八九会边审边顺手修 —— 于是你失去了挑哪些问题值得修的机会，diff 也混成一坨。

📋 提示词全文 → [`commands/code-review.md`](commands/code-review.md)

</details>

<details>
<summary><code>security-audit</code> 的细节</summary>

**✓ 什么时候用**

- 代码要处理外部输入、认证、密钥或者钱。
- 发版前的例行检查。
- 接手一个不了解的代码库，想先知道有没有明显的雷。

**✗ 什么时候别用**

- 你需要的是合规认证 —— 这是代码审查，不是审计报告，不能拿去交差。
- 只想升级有漏洞的依赖 —— 那是 audit-dependencies。
- 指望它替代真正的渗透测试 —— 静态阅读发现不了运行时和配置层的问题。

**⚠ 坑**

- 它会编 CVE 编号，也会把「理论上不安全的写法」按高危报出来，实际上那条路径根本不可达。必须要求每条给出具体的可利用路径，给不出的降级或删掉。
- 注意和内置的 `/security-review` 区分：内置那条是审当前分支的 diff，这条是按攻击面过一遍代码，用途不同。

📋 提示词全文 → [`commands/security-audit.md`](commands/security-audit.md)

</details>

<details>
<summary><code>fix-issues</code> 的细节</summary>

**✓ 什么时候用**

- code-review 或 security-audit 已经出了清单，你挑好了要修哪几条。
- 有一份现成的 issue 列表 / CI 报错 / 测试失败列表要清掉。

**✗ 什么时候别用**

- 还没有清单 —— 先跑 code-review，别让它边找边修。
- 问题的修法需要改架构 —— 那不是「修」，先单独讨论方案。
- 清单有二三十条 —— 分批，一次十条以内，不然 diff 没法审。

**⚠ 坑**

- 不指定「只修我列的这几条」，它会顺手把路上看到的其它问题一起改了，diff 立刻失控。
- 一个 commit 修完所有问题的话，其中一条改错了你只能整批回滚。

📋 提示词全文 → [`commands/fix-issues.md`](commands/fix-issues.md)

</details>

<details>
<summary><code>improve-error-handling</code> 的细节</summary>

**✓ 什么时候用**

- 线上出问题时日志里什么都看不出来。
- 审查发现一堆 catch 块是空的，或者只写了 log 就继续往下走。
- 失败被当成成功返回给了调用方。

**✗ 什么时候别用**

- 你还不知道哪些错误真的需要处理 —— 先 code-review 找出来。
- 你想做的是加重试/降级/熔断 —— 那是设计决策，不该由一条命令顺手决定。

**⚠ 坑**

- 它爱给每个函数套一层 try/catch，结果是噪音变多、真正的错误更难找。要写死「只在能做出处理决策的地方捕获」。
- 改错误类型会悄悄破坏调用方 —— 上游可能正 catch 着具体的错误类做分支。

📋 提示词全文 → [`commands/improve-error-handling.md`](commands/improve-error-handling.md)

</details>


### 4. 清理 → 重塑

*先删再搬再收：少搬点东西，结构定了再收拾局部*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`remove-dead-code`](commands/remove-dead-code.md) | 高风险 | 删掉真正没人用的代码 —— 删之前必须先证明它是死的。 | `code-review` `add-tests` | `refactor` `verify` |
| [`refactor`](commands/refactor.md) | 高风险 | 调整代码结构，对外行为一点不变。 | `add-tests` `explain-architecture` `remove-dead-code` | `verify` `simplify` `profile` |
| [`simplify`](commands/simplify.md) | 高风险 | 精简局部逻辑，不改变对外行为。 | `add-tests` `refactor` | `verify` |

<details>
<summary><code>remove-dead-code</code> 的细节</summary>

**✓ 什么时候用**

- 重构前先清场，减少要搬的东西。
- 一次大改留下了明显的残骸：注释掉的旧实现、废弃的分支、没人调的工具函数。

**✗ 什么时候别用**

- 这是个对外发布的库 —— 「没人调」只是这个仓库里没人调，你的用户在调。
- 代码里有反射、动态分发、字符串拼出来的调用 —— 静态搜索证明不了死活。
- 你只是觉得某段代码丑 —— 那是 simplify 的活，不是删。

**⚠ 坑**

- 最危险的一条命令。「搜不到引用」不等于「没人用」：配置文件、模板、生成代码、别的包、反射调用、测试夹具、文档示例里都可能在用。
- 它会把「暂时没接上的新功能」当死代码删掉 —— 写了一半的东西看起来和废弃的东西一模一样。

📋 提示词全文 → [`commands/remove-dead-code.md`](commands/remove-dead-code.md)

</details>

<details>
<summary><code>refactor</code> 的细节</summary>

**✓ 什么时候用**

- 要加的新功能被现在的结构挡着，先把结构挪顺。
- 一个文件/类什么都干，边界该拆开了。
- 同一个概念在三个地方有三种表示，要统一。

**✗ 什么时候别用**

- 没有测试 —— 重构的定义就是「行为不变」，没测试你无法验证这一点。
- 你已经调过性能了 —— 顺序反了，重构会把优化成果作废。先重构再优化。
- 你其实想改行为 —— 那是改需求，不叫重构，分开做。

**⚠ 坑**

- 它很容易在搬代码的路上「顺便」修个 bug 或改个默认值 —— 于是行为变了，而 diff 里全是位置变动，你根本看不出来。
- 跨文件搬运时公开接口最容易悄悄漂移：参数顺序、可选性、导出名。

📋 提示词全文 → [`commands/refactor.md`](commands/refactor.md)

</details>

<details>
<summary><code>simplify</code> 的细节</summary>

> 🔁 **会覆盖自带的 `/simplify`** —— Claude Code 自带 /simplify（bundled skill，四个 agent 并行看复用/精简/效率/抽象层次）。你在 .claude/skills/ 或 .claude/commands/ 里放同名文件会**覆盖**它。想两个都留着，把这条改名成 simplify-strict。

**✓ 什么时候用**

- 一段逻辑你读第二遍还要回头看，但它其实是对的。
- 同一个判断分散在三四个 if 里，合并后语义不变。
- 刚写完一版能跑的实现，想在提交前把脚手架收干净。

**✗ 什么时候别用**

- 这块代码没有测试 —— 先跑 add-tests，否则改坏了没人告诉你。
- 你其实想改的是结构（拆模块、挪边界）—— 那是 refactor，不是 simplify。
- 代码看着乱是因为有 bug —— 先 code-review 定位，别指望精简顺手把 bug 带走。

**⚠ 坑**

- 最常见的坑：它会删掉你有意保留的扩展点 —— 只有一个实现的接口、暂时没人调的 hook、留给下个需求的 strategy 分支，在它眼里都是「多余的间接层」。提示词里的「不许删疑似故意保留的抽象」那段就是为这个写的。
- 不加「接口不变」约束的话，它会顺手改导出函数的签名，然后你在别的包里才发现编译不过。

📋 提示词全文 → [`commands/simplify.md`](commands/simplify.md)

</details>


### 5. 测量 → 提速

*顺序不能反，没有 profile 数据 optimize 应该直接拒绝开工*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`profile`](commands/profile.md) | 只读 | 真的跑起来测量，拿到热点数据 —— optimize 的硬性前置。 | `refactor` | `optimize` |
| [`optimize`](commands/optimize.md) | 高风险 | 只优化 profile 指出来的地方，改完要拿数字说话。 | `profile` `refactor` `add-tests` | `verify` `profile` |

<details>
<summary><code>profile</code> 的细节</summary>

**✓ 什么时候用**

- 准备优化，需要先知道时间花在哪。
- 有明确的性能问题需要定位。
- 想验证一次优化是不是真的有效（改完再跑一次）。

**✗ 什么时候别用**

- 没有能代表真实用法的负载 —— 用错的负载测出来的热点会把你带到沟里。
- 你想要的是「读代码找出慢的地方」 —— 那不是 profile，那是猜。

**⚠ 坑**

- 它会「靠读代码分析性能」然后给你一份看起来很专业的热点列表 —— 全是猜的。必须要求真的执行测量，做不到就明说做不到。
- 在开发模式、空数据集、单次调用下测出来的数据，和生产环境经常完全对不上。要求它说清楚测量条件。

📋 提示词全文 → [`commands/profile.md`](commands/profile.md)

</details>

<details>
<summary><code>optimize</code> 的细节</summary>

**✓ 什么时候用**

- profile 已经跑过，你手里有一份热点数据。
- 有明确的性能目标（比如 p99 从 800ms 降到 200ms）。

**✗ 什么时候别用**

- **没跑过 profile —— 这是硬性前置。** 凭直觉猜的热点十次有九次是错的。
- 结构还要动 —— 先 refactor，否则优化成果会被后面的重构作废。
- 只是「感觉有点慢」，没有基准也没有目标 —— 先定义什么叫快。

**⚠ 坑**

- 它会拿可读性换性能，而且换得很积极 —— 缓存、手动内联、位运算、把清楚的循环改成看不懂的一行。不给约束的话，你会得到一份快 3% 但没人敢动的代码。
- 微基准的提升经常在真实负载下消失，甚至变负。要求它在真实场景下复测。

📋 提示词全文 → [`commands/optimize.md`](commands/optimize.md)

</details>


### 6. 收尾

*机械性的收口动作，单独提交，别和逻辑改动混在一起*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`standardize`](commands/standardize.md) | 低风险 | 统一格式、lint、类型和命名，纯机械改动。 | — | `verify` |
| [`document`](commands/document.md) | 低风险 | 补文档和注释，写代码实际做的事，不是你希望它做的事。 | `explain-architecture` | — |
| [`audit-dependencies`](commands/audit-dependencies.md) | 中风险 | 盘一遍依赖：有漏洞的、没人用的、版本落后的，先出报告再动手。 | — | `verify` `security-audit` |

<details>
<summary><code>standardize</code> 的细节</summary>

**✓ 什么时候用**

- 仓库里几种风格并存，读起来费劲。
- 刚合并完别人的分支，风格没对齐。
- 提交前的收尾动作。

**✗ 什么时候别用**

- 和功能改动放在同一个 commit 里 —— 格式化的 diff 会把真正的改动淹掉。
- 项目还没有 lint / formatter 配置 —— 先定规则，别让它替你发明一套。

**⚠ 坑**

- 格式化会碰到大量文件，如果混进了任何一处逻辑改动，你基本不可能在 diff 里发现。所以必须单独 commit。
- 它可能替你「改进」一套项目已有的命名约定 —— 要求它沿用仓库里现有的规则，而不是套用语言社区的通用规范。

📋 提示词全文 → [`commands/standardize.md`](commands/standardize.md)

</details>

<details>
<summary><code>document</code> 的细节</summary>

**✓ 什么时候用**

- 一个模块要交给别人接手。
- 公开 API 缺少用法说明。
- 有一段逻辑，为什么这么写只有你知道。

**✗ 什么时候别用**

- 代码本身还要大改 —— 先改完再写，不然文档立刻过期。
- 你想要的是每个函数上面都有一段注释 —— 那是噪音，不是文档。

**⚠ 坑**

- 它会写出「// 把 x 加一」这种复述代码的注释。真正值钱的是「为什么」—— 为什么选这个方案、为什么不能改、这里有什么坑。
- 它会照着函数名想当然地描述行为，而不是读实现。一份说得好听但和代码对不上的文档，比没有文档更糟。

📋 提示词全文 → [`commands/document.md`](commands/document.md)

</details>

<details>
<summary><code>audit-dependencies</code> 的细节</summary>

**✓ 什么时候用**

- 很久没管依赖了，想知道欠了多少债。
- 发版前例行检查有没有已知漏洞。
- 打包体积变大，想找出谁带进来的。

**✗ 什么时候别用**

- 你想的是「全部升到最新」 —— 那不是审计，是一次高风险大改，而且会一次性引入所有 breaking change。
- 正在赶发版 —— 依赖升级的爆炸半径不可预测，别在这个时候动。

**⚠ 坑**

- 不加约束的话它会直接开始升级，甚至跨大版本升。一定要求它先出报告、等你挑。
- 「没人用」的判断对可选依赖、peer 依赖、构建期工具、类型包经常是错的。

📋 提示词全文 → [`commands/audit-dependencies.md`](commands/audit-dependencies.md)

</details>


### 7. 组合流程

*把上面几组串起来的编排命令，每阶段停下等确认*

| 命令 | 风险 | 一句话 | 前置 | 后续 |
|---|---|---|---|---|
| [`harden`](commands/harden.md) | 高风险 | 全流程编排：从摸架构到补文档，每个阶段停下等你确认。 | `explain-architecture` | `pre-release` |
| [`pre-commit`](commands/pre-commit.md) | 低风险 | 提交前的轻量组合：先验一遍，再统一格式，分开提交。 | — | `code-review` |
| [`pre-release`](commands/pre-release.md) | 中风险 | 发版前：安全审查 + 全量验证 + 文档对齐，每步停下。 | `harden` `verify` | — |

<details>
<summary><code>harden</code> 的细节</summary>

**✓ 什么时候用**

- 接手一个没人维护过的项目，想系统性过一遍。
- 发版前留出了一整块时间，准备认真收拾一轮技术债。
- 你知道要做十件事，但记不住正确顺序 —— 顺序本身就是这条命令的价值。

**✗ 什么时候别用**

- 你只想修一个具体问题 —— 直接跑对应的单条命令，别启动全流程。
- 没有能跑起来的测试 —— 阶段 0 会直接把你拦下来，先解决测试再来。
- 你没空全程盯着 —— 它每个阶段都会停下等确认，无人值守跑不动。

**⚠ 坑**

- 阶段顺序不是随便排的：**先重构后优化**（反过来优化成果会被重构作废），**先测量后优化**（不然优化的是错的地方）。你要是让它跳步，这两条约束就失效了。
- 它会想把两个阶段合成一轮做完 —— 尤其「审查 + 修」看起来特别顺。别答应，那正好踩中最常见的两个坑。

📋 提示词全文 → [`commands/harden.md`](commands/harden.md)

</details>

<details>
<summary><code>pre-commit</code> 的细节</summary>

**✓ 什么时候用**

- 写完一段改动，准备提交。
- 想在推之前把明显的问题挡掉。

**✗ 什么时候别用**

- 改动很大 —— 这条是轻量收尾，大改动该走 code-review。
- 你希望它顺手把测试修绿 —— 它只会告诉你红了，修是另一件事。

**⚠ 坑**

- 格式化必须和你的功能改动分开 commit，否则 review 的人在几百行格式变动里找不到你真正改了什么。

📋 提示词全文 → [`commands/pre-commit.md`](commands/pre-commit.md)

</details>

<details>
<summary><code>pre-release</code> 的细节</summary>

**✓ 什么时候用**

- 准备打 tag 发版。
- 要把改动推到生产环境之前。

**✗ 什么时候别用**

- 还在开发中期 —— 这是收口用的，中途跑纯属浪费时间。
- 你需要的是完整的代码质量改造 —— 那是 harden，这条只做发版前检查。

**⚠ 坑**

- 发版前最容易出的事故是「顺手修一下」：审查发现小问题，直接改，没重新跑完整验证就发了。这条命令写死了每次改动后必须重验。
- 文档和 changelog 经常是最后才想起来的，而它们恰恰是用户第一眼看到的东西。

📋 提示词全文 → [`commands/pre-release.md`](commands/pre-release.md)

</details>


---

## Claude Code 内置命令速查（111 条 + 19 个别名）

共 111 条（内置 97 · bundled skill 13 · workflow 1），另含 19 个别名、2 个旧名。其中 7 条**不在官方「All commands」表里** —— 是翻遍 129 个文档页面才找到的。

> **整理依据：code.claude.com 全部 129 个文档页面（含 changelog），快照日 2026-08-06**
>
> ⚠️ 官方那张「All commands」表并不完整 —— /update、/todos、/env、/buddy 只在 changelog 里出现过。内置命令随版本、套餐和平台变化，以你本地 /help 输出为准。

标 `skill` = bundled skill（本质是提示词，Claude 可能自己触发，会被你的同名文件覆盖），`workflow` = 多 agent 编排，**`表外`** = 官方「All commands」表里没有、在 changelog 或其它页面找到的。别名和主名效果一样，敲哪个都行。

### 会话与上下文

*开新对话、压缩上下文、回滚、分叉、后台跑*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/clear` `[name]` | `/reset` `/new` | 清空上下文，开一段新对话 |
| `/compact` `[instructions]` | — | 把已有对话总结压缩，腾出上下文空间 |
| `/autocompact` `[auto\|<tokens>]` | — | 设置自动压缩的触发点（上下文占到多满时自动压） |
| `/context` `[all]` | — | 用彩色方格图看当前上下文占用情况 |
| `/resume` `[session]` | `/continue` | 按 ID 或名字恢复之前的对话，或打开会话选择器 |
| `/rename` `[name]` | — | 给当前会话改名，名字会显示在输入栏上 |
| `/recap` | — | 生成当前会话的一行摘要 |
| `/export` `[filename]` | — | 把当前对话导出成纯文本 |
| `/copy` `[N]` | — | 复制上一条回复到剪贴板 |
| `/branch` `[name]` | — | 在当前这一点分叉出一条对话，换个方向试而不丢原来的 |
| `/fork` `[prompt]` | — | 把当前对话复制到一个新的后台会话，两边从此独立 |
| `/rewind` | `/checkpoint` `/undo` | 把对话和/或代码回滚到之前某个检查点 |
| `/background` `[prompt]` | `/bg` | 把当前会话转成后台 agent，腾出这个终端 |
| `/stop` | — | 停掉当前的后台会话 |
| `/tasks` | `/bashes` | 查看和管理本会话的后台任务，含已完成的子 agent |
| `/subtask` `<task>` | — | 派一个继承完整对话的后台子 agent 去干活，你继续干你的 |
| `/goal` `[condition\|clear]` | — | 设一个目标，Claude 会跨多轮一直做到条件满足 |
| `/btw` `[question]` | — | 问个不进入对话历史的临时问题 |
| `/focus` | — | 切换精简视图：只显示你的提问、一行工具摘要和最终回复 |
| `/diff` | — | 打开交互式 diff 查看器，看未提交改动和每轮的改动 |
| `/teleport` | `/tp` | 把一个 Claude Code on the web 会话拉到这个终端里继续 |
| `/desktop` | `/app` | 把当前会话转到 Claude Code 桌面版继续 |
| `/remote-control` | `/rc` | 让这个会话可以从 claude.ai 远程控制 |
| `/todos` **`表外`** | — | 打开待办列表浮层（changelog 里和 `/config` `/context` `/model` 并列为 command overlay）。 |

### 写代码与审查

*改代码、审代码、验证、调试*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/code-review` `[low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [pr#\|branch\|path]` `skill` | — | 审当前 diff（或指定 PR / 分支 / 路径）的正确性 bug 与可清理处，支持 --fix |
| `/review` `[low\|medium\|high\|xhigh\|max\|ultra] [--fix] [--comment] [pr#\|branch\|path]` | — | /code-review 的别名，用法和分档完全一样 |
| `/simplify` `[target]` `skill` | — | 四个 agent 并行看复用/精简/效率/抽象层次，然后直接改。不找 bug |
| `/verify` `skill` | — | 把项目真的构建并跑起来看结果，而不是只跑测试和类型检查 |
| `/run` `skill` | — | 启动并操作你的项目，亲眼看改动生效，而不只是测试通过 |
| `/run-skill-generator` `skill` | — | 写一个项目专属 skill，教会 /run 和 /verify 怎么构建和启动你的项目 |
| `/security-review` | — | 分析当前分支的改动有没有安全漏洞 |
| `/ultrareview` `[PR or branch]` | — | 在云端沙箱里跑一次深度多 agent 代码审查 |
| `/batch` `<instruction>` `skill` | — | 把大规模改动拆成 5-30 个独立单元并行做，每个单元一个 worktree + 一个 PR |
| `/debug` `[description]` `skill` | — | 打开本会话的 debug 日志，并读日志排查问题 |
| `/init` | — | 为项目生成 CLAUDE.md 指南 |
| `/plan` `[description]` | — | 直接从输入栏进入 plan 模式 |
| `/deep-research` `<question>` `workflow` | — | 对一个问题扇出网络搜索、交叉验证来源，产出带引用的报告 |
| `/autofix-pr` `[prompt]` | — | 开一个云端会话盯着当前分支的 PR，CI 挂了或有评论就自动推修复 |
| `/workflows` | — | 打开 workflow 进度视图，可暂停/恢复/保存正在跑的编排 |

### 模型与运行方式

*换模型、调力度、快慢、沙箱、定时*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/model` `[model]` | — | 切换模型，并存为新会话的默认 |
| `/effort` `[level\|auto]` | — | 设置模型的思考力度（effort level） |
| `/fast` `[on\|off]` | — | 开关快速模式（仍是 Opus，只是输出更快，不降级到小模型） |
| `/advisor` `[model\|off]` | — | 开关顾问工具：在关键节点让第二个模型给建议 |
| `/sandbox` | — | 开关沙箱模式 |
| `/loop` `[interval] [prompt]` `skill` | `/proactive` | 让一个提示词按间隔反复跑；不给间隔则由 Claude 自己掌握节奏 |
| `/schedule` `[description]` | `/routines` | 创建/更新/列出/立即运行 Routine（跑在 Anthropic 云端的定时任务） |

### 配置与权限

*设置、权限、记忆、快捷键、外观*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/config` `[key=value ...]` | `/settings` | 打开设置界面，调主题、模型、输出风格等 |
| `/permissions` | `/allowed-tools` | 管理工具权限的 allow / ask / deny 规则 |
| `/memory` | — | 编辑 CLAUDE.md 记忆文件，开关自动记忆并查看条目 |
| `/hooks` | — | 查看工具事件的 hook 配置 |
| `/keybindings` | — | 打开你的快捷键配置文件 |
| `/statusline` | — | 配置状态栏 |
| `/terminal-setup` | — | 配置 Shift+Enter 等终端快捷键 |
| `/theme` | — | 换配色主题 |
| `/color` `[color\|default]` | — | 设置当前会话输入栏的颜色 |
| `/tui` `[default\|fullscreen]` | — | 切换终端 UI 渲染器，并带着对话重启进去 |
| `/scroll-speed` | — | 交互式调滚轮速度，调的时候能实时预览 |
| `/voice` `[hold\|tap\|off]` | — | 开关语音听写 |
| `/ide` | — | 管理 IDE 集成并查看状态 |
| `/chrome` | — | 配置 Claude in Chrome |
| `/add-dir` `<path>` | — | 给当前会话临时加一个可访问的工作目录 |
| `/cd` `<path>` | — | 把当前会话切到另一个工作目录 |
| `/env` **`表外`** | — | 设置环境变量，影响 Bash 与 PowerShell 工具执行的命令（v2.1.89 起也作用于 PowerShell）。 |

### 扩展：skill / plugin / MCP

*技能、插件、MCP 服务、子 agent*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/skills` | — | 列出可用的 skill |
| `/reload-skills` | — | 重新扫描 skill 和命令目录，让会话中新增/改动的 skill 立即生效 |
| `/plugin` `[subcommand]` | — | 管理 Claude Code 插件 |
| `/reload-plugins` `[--force]` | — | 重载所有活跃插件以应用改动，不用重启 |
| `/mcp` `[reconnect <server>\|enable\|disable [<server>\|all]]` | — | 管理 MCP 服务连接与 OAuth 授权 |
| `/agents` | — | 提示你去让 Claude 创建/管理子 agent，或直接改 .claude/agents/ |
| `/claude-api` `[migrate\|managed-agents-onboard\|prompt-audit]` `skill` | — | 加载 Claude API 与 Managed Agents 的参考资料（按你项目的语言） |
| `/dataviz` `[request]` `skill` | — | 图表/仪表盘的设计指导：选图形、配色、校验色盲安全与对比度 |
| `/design-sync` `[hint]` `skill` | — | 把仓库里的 React 设计系统同步到 Claude Design，让产出的设计用你的真实组件 |
| `/design-login` | — | 为 /design-sync 授权 claude.ai 账号的设计系统访问 |
| `/plugins` **`表外`** | — | 在 VS Code 扩展里打开「Manage plugins」图形界面。和 `/plugin` 不是一回事 —— 那个是在 CLI 里管插件。 |

### 账号与用量

*登录、花费、额度、套餐*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/login` | — | 登录 Anthropic 账号 |
| `/logout` | — | 退出登录 |
| `/usage` | — | 查看会话花费、套餐额度和活动统计 |
| `/cost` | — | /usage 的别名 |
| `/stats` | — | /usage 的别名 |
| `/usage-credits` | （旧名 `/extra-usage`） | 配置用量额度，或在触顶时向管理员申请 |
| `/upgrade` | — | 在浏览器打开升级页，切换到更高套餐 |
| `/passes` | — | 送朋友一周免费 Claude Code |
| `/privacy-settings` | — | 查看和修改隐私设置 |

### 安装与诊断

*体检、状态、装集成、报 bug*

| 命令 | 别名 | 说明 |
|---|---|---|
| `/doctor` `skill` | `/checkup` | 跑一次安装体检，能诊断也能修：PATH、重复安装、无用 skill、慢 hook、CLAUDE.md 瘦身 |
| `/status` | — | 打开设置的状态页：版本、模型、账号、连通性 |
| `/help` | — | 显示帮助和可用命令 —— 你本地的这份才是最终依据 |
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

### 杂项与已移除

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

## 不建议这么做

**1. 一条命令里叠加多个动作**（「review 并且 refactor 并且 optimize」）

- 为什么不行：diff 太大没法审，出了问题也分不清是哪一步干的。
- 该怎么做：一条命令一个动作，中间用 verify 断开。

**2. 没有测试就直接 simplify / refactor**

- 为什么不行：改坏了发现不了 —— 这两条命令都以「行为不变」为前提，而验证行为不变的唯一手段就是测试。
- 该怎么做：先 add-tests 拿到基线，再动手。

**3. simplify 不加「接口不变」约束**

- 为什么不行：有意保留的扩展点被当成多余的间接层删掉：只有一个实现的接口、还没人调的 hook、留给下个需求的分支。
- 该怎么做：提示词里写死「公开接口不变」+「不许删疑似故意保留的抽象，删之前先全仓搜索证明它是死的」。

**4. 先优化后重构**

- 为什么不行：优化成果被重构作废 —— 你精心调过的那段代码，重构时整个被挪走重写了。
- 该怎么做：永远是 refactor → profile → optimize。结构先定下来，再测量，再针对性优化。

**5. 审查阶段允许改文件**

- 为什么不行：失去挑选修哪些问题的机会，而且审查的改动和后续的改动混在同一个 diff 里。
- 该怎么做：审查命令的 frontmatter 加 `disallowed-tools: Edit Write NotebookEdit`，提示词里也写死「只报告不修改」。注意不是 `allowed-tools` —— 那个字段是免批准，不是限制。

**6. 全程一个 commit**

- 为什么不行：没法按类别回滚。精简改坏了一处，你只能连着修的三个 bug 一起 revert。
- 该怎么做：一类改动一个 commit，提示词里明确要求。

**7. verify 只在最后跑一次**

- 为什么不行：它是节拍器，不是终点。攒了五个阶段才验一次，红了你也不知道是哪个阶段红的。
- 该怎么做：每个动过代码的阶段之后都跑一次。

---

## 仓库结构

```
index.html      页面结构
style.css       样式（跟随系统深浅色）
app.js          渲染 / 展开 / 筛选 / 搜索 / 复制
commands.json   ← 所有内容都在这，唯一需要手写的文件
commands/*.md   ← 由 commands.json 生成的成品命令文件
```

改文案 = 改 `commands.json` 推一下，Pages 直接生效，没有构建步骤。`app.js` 里不含任何具体命令内容。

**改完之后要做一件事：把 `commands.json` 里的 `meta.contentVersion` 加一位。**
`index.html` 引用 JS/CSS 时带 `?v=<contentVersion>`：

```html
<link rel="stylesheet" href="style.css?v=1.2.0">
<script src="app.js?v=1.2.0"></script>
```

因为 GitHub Pages 对静态资源发 `cache-control: max-age=600`，不换 URL 的话浏览器会继续用缓存里的旧 JS/CSS —— 页面看起来「没更新」。版本号变了 URL 就变，浏览器必然重新拉。CI 会检查 `?v=` 和 `contentVersion` 是否一致，忘了改会直接失败。

本地预览要起 HTTP 服务：`python3 -m http.server 8000`

---

## 内容准确性

内置命令、bundled skill、frontmatter 字段都对着官方文档核过（2026-08-06）：

- [Claude Code — Commands reference](https://code.claude.com/docs/en/commands)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)

---

## License

MIT
