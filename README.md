# ClaudeCodeCMD

> Claude Code 命令速查 · 复制即用

**网站：https://macromozilla.github.io/ClaudeCodeCMD/**

> ⚠️ 网站尚未上线（还没有 `index.html`，Pages 也没开）。见 [上线还差什么](#上线还差什么)。
> 在那之前，下面的纯文本版就能直接用 —— 复制提示词粘进 Claude Code 即可。

`Not affiliated with or endorsed by Anthropic.`

---

## 这是什么

一份 Claude Code 自定义命令的速查表。每条命令都写清楚三件事：**什么时候用**、**什么时候别用**、**有什么坑** —— 第二件事是这个项目存在的理由，网上那些命令合集基本都不写。

每条命令有两种用法：
1. 直接复制提示词，粘进 Claude Code 对话框
2. 存成 `.claude/commands/<名字>.md`（下面给了带 frontmatter 的完整文件），之后敲 `/<名字>` 就能跑

---

## 当前进度

内容全部在 [`commands.json`](commands.json) 里。**DRAFT**

| 分区 | 已写 | 待写 |
|---|---|---|
| ② 代码修改类 | `simplify` | `fix-issues`、`remove-dead-code`、`refactor`、`improve-error-handling`、`optimize`、`audit-dependencies`、`standardize`、`add-tests`、`document` |
| ③ 只读 / 审查类 | `code-review` | `verify`、`security-audit`、`explain-architecture`、`check-against-spec`、`profile` |
| ④ 组合流程 | `harden` | `pre-commit`、`pre-release` |
| ⑤ Claude Code 内置命令 | — | 待用本地 `/help` 输出填充，不凭记忆编 |
| ⑥ 不建议这么做 | 7 条，已写完 | — |

---

## 上线还差什么

1. 合并 [PR #1](https://github.com/MacroMozilla/ClaudeCodeCMD/pull/1) 到 `master`（目前是 draft）
2. 写 `index.html` + `app.js` + `style.css`，把 JSON 渲染出来
3. 仓库 **Settings → Pages → Source** 选 `master` 分支根目录，保存

三步做完，https://macromozilla.github.io/ClaudeCodeCMD/ 就能访问了。推送即上线，不需要 Actions。

---

## 命令

### ⚠️ 先读这条：有三个命令和 Claude Code 自带的重名

Claude Code 自带了 `/simplify`、`/code-review`、`/verify` 三个 bundled skill。你在 `.claude/skills/` 或 `.claude/commands/` 里放**同名**文件会直接覆盖掉自带的那个。想两个都留着，就把这里的命令改个名（比如 `simplify-strict`）。

还有一个容易搞反的点：frontmatter 里的 **`allowed-tools` 不是限制，是免批准** —— 官方原文是 *"It does not restrict which tools are available: every tool remains callable"*。要让一个审查命令真的不能改文件，得用 **`disallowed-tools`**。


### ② 代码修改类

#### `simplify`  ·  高风险

精简局部逻辑，不改变对外行为。

> 🔁 **会覆盖自带的 `/simplify`**（bundled-skill）

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

**配对**

- 跑之前先跑 → `add-tests`（没有测试就别跑，改坏了发现不了）
- 跑之前先跑 → `refactor`（结构要动的话先动结构，顺序反了会白干）
- 跑完接着跑 → `verify`（行为必须和跑之前一模一样，跑完立刻验）

<details>
<summary><b>提示词全文</b>（点开复制）</summary>

```text
Simplify the code in $ARGUMENTS. If no target is given, simplify only the files changed on this branch versus the default branch.

Scope — do exactly one thing:
1. Reduce incidental complexity in the target: collapse redundant branches, remove needless indirection, inline a single-use helper that costs more than it saves, replace hand-rolled logic with a helper that already exists in this repo.
2. Do NOT fix bugs, do NOT add features, do NOT optimize for speed, do NOT reformat or re-sort code you are not otherwise changing, and do NOT rename anything on the public surface. If you spot a bug, write it down and keep going — report it at the end, do not fix it here.

Hard constraints:
- Behavior must not change. Every observable output, side effect, thrown error type, log line something depends on, and public signature stays exactly as it is.
- The public interface must not change: exported functions, classes, and types, their parameter lists, defaults, and return shapes. If a simplification would require an interface change, stop and report it as a proposal instead of doing it.
- Do not delete an abstraction that merely looks unused. Plugin hooks, adapter and strategy seams, feature flags, protected or overridable members, an interface with one implementation today, and anything referenced from config, docs, generated code, or another package are all presumed deliberate. If you cannot prove it is dead with a repo-wide search, leave it and list it under "left alone".
- Before changing anything, check that the target is covered by tests. Run them and record the pass/fail baseline. If there is no meaningful coverage, STOP and say so — ask whether to add tests first or to proceed unprotected. Do not proceed silently.
- Keep comments that explain why. Delete only a comment that restates code you just deleted.

Working order:
1. Report the test baseline.
2. List the simplifications you intend to make, grouped by kind, before editing anything.
3. Apply them. Put each kind in its own commit so any one can be reverted alone. Never mix simplification with another kind of change.
4. Re-run the same tests. The result must match the baseline exactly. If it does not, revert and report.

Finish with: what you changed and why, what you deliberately left alone and the reason, and anything you suspect is dead but could not prove.
```

**存成命令文件** `.claude/commands/simplify.md`：

````markdown
---
description: 精简局部逻辑，行为和对外接口保持不变。改动前要求有测试基线。
argument-hint: [path]
disable-model-invocation: true
---

Simplify the code in $ARGUMENTS. If no target is given, simplify only the files changed on this branch versus the default branch.

Scope — do exactly one thing:
1. Reduce incidental complexity in the target: collapse redundant branches, remove needless indirection, inline a single-use helper that costs more than it saves, replace hand-rolled logic with a helper that already exists in this repo.
2. Do NOT fix bugs, do NOT add features, do NOT optimize for speed, do NOT reformat or re-sort code you are not otherwise changing, and do NOT rename anything on the public surface. If you spot a bug, write it down and keep going — report it at the end, do not fix it here.

Hard constraints:
- Behavior must not change. Every observable output, side effect, thrown error type, log line something depends on, and public signature stays exactly as it is.
- The public interface must not change: exported functions, classes, and types, their parameter lists, defaults, and return shapes. If a simplification would require an interface change, stop and report it as a proposal instead of doing it.
- Do not delete an abstraction that merely looks unused. Plugin hooks, adapter and strategy seams, feature flags, protected or overridable members, an interface with one implementation today, and anything referenced from config, docs, generated code, or another package are all presumed deliberate. If you cannot prove it is dead with a repo-wide search, leave it and list it under "left alone".
- Before changing anything, check that the target is covered by tests. Run them and record the pass/fail baseline. If there is no meaningful coverage, STOP and say so — ask whether to add tests first or to proceed unprotected. Do not proceed silently.
- Keep comments that explain why. Delete only a comment that restates code you just deleted.

Working order:
1. Report the test baseline.
2. List the simplifications you intend to make, grouped by kind, before editing anything.
3. Apply them. Put each kind in its own commit so any one can be reverted alone. Never mix simplification with another kind of change.
4. Re-run the same tests. The result must match the baseline exactly. If it does not, revert and report.

Finish with: what you changed and why, what you deliberately left alone and the reason, and anything you suspect is dead but could not prove.
````

> disable-model-invocation: true —— 这条会改文件，只应该你手动敲 /simplify 触发，不该让 Claude 自己决定什么时候跑。

</details>


### ③ 只读 / 审查类

#### `code-review`  ·  只读

审查当前 diff，只出报告，一个字都不改。

> 🔁 **会覆盖自带的 `/code-review`**（bundled-skill）

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

**配对**

- 跑完接着跑 → `fix-issues`（拿到清单后挑着修）
- 跑完接着跑 → `add-tests`（审出来的行为缺口先补测试再动手）

<details>
<summary><b>提示词全文</b>（点开复制）</summary>

```text
Review the current diff. Report findings only — this is a read-only pass.

Target: $ARGUMENTS. If empty, review the diff between this branch and the default branch (`git diff $(git merge-base HEAD origin/HEAD)...HEAD`).

Hard constraints:
- Do NOT edit, create, or delete any file. Do NOT run a formatter, a codemod, or any tool with a --fix flag. Do NOT commit. If you find yourself about to change a file, stop and write the finding down instead. Deciding which findings are worth acting on is my job; a review that quietly fixes things takes that decision away and merges unrelated changes into one diff.
- Read-only commands are fine: git diff, git log, grep, tests, type checks, and linters in report mode.
- Review only what the diff touches, plus whatever you must read to judge it. Do not audit the whole repo.
- Do not invent problems to fill a quota. If the diff is clean, say it is clean.

Look for these, in priority order:
1. Correctness — logic that yields a wrong result: off-by-one, inverted condition, wrong variable, unhandled null or undefined, race, resource leak, transaction left open.
2. Contract breakage — a caller elsewhere in the repo that this change breaks. Actually grep for the callers; do not assume there are none.
3. Error handling — swallowed exceptions, errors logged and then continued past, a failure that surfaces to the caller as success.
4. Security-adjacent — injection, unvalidated input crossing a trust boundary, secrets in code or logs. Shallow pass only; a real audit is a separate job.
5. Test gaps — behavior added or changed with no test that would fail if it regressed.
6. Clarity and cleanup — last, and clearly marked optional.

For every finding give:
- file:line
- Severity: blocker / should-fix / nit
- The concrete failure: which input or state produces which wrong outcome. If you cannot state that concretely, it is a nit, not a bug — label it honestly.
- A suggested fix in one or two sentences, described and not applied.

List blockers first. End with a one-line verdict: safe to merge / fix blockers first / needs a closer look at <area>.
```

**存成命令文件** `.claude/commands/code-review.md`：

````markdown
---
description: 只读审查当前 diff，按严重程度输出清单，不改任何文件。
argument-hint: [path|PR]
disallowed-tools: Edit Write NotebookEdit
---

Review the current diff. Report findings only — this is a read-only pass.

Target: $ARGUMENTS. If empty, review the diff between this branch and the default branch (`git diff $(git merge-base HEAD origin/HEAD)...HEAD`).

Hard constraints:
- Do NOT edit, create, or delete any file. Do NOT run a formatter, a codemod, or any tool with a --fix flag. Do NOT commit. If you find yourself about to change a file, stop and write the finding down instead. Deciding which findings are worth acting on is my job; a review that quietly fixes things takes that decision away and merges unrelated changes into one diff.
- Read-only commands are fine: git diff, git log, grep, tests, type checks, and linters in report mode.
- Review only what the diff touches, plus whatever you must read to judge it. Do not audit the whole repo.
- Do not invent problems to fill a quota. If the diff is clean, say it is clean.

Look for these, in priority order:
1. Correctness — logic that yields a wrong result: off-by-one, inverted condition, wrong variable, unhandled null or undefined, race, resource leak, transaction left open.
2. Contract breakage — a caller elsewhere in the repo that this change breaks. Actually grep for the callers; do not assume there are none.
3. Error handling — swallowed exceptions, errors logged and then continued past, a failure that surfaces to the caller as success.
4. Security-adjacent — injection, unvalidated input crossing a trust boundary, secrets in code or logs. Shallow pass only; a real audit is a separate job.
5. Test gaps — behavior added or changed with no test that would fail if it regressed.
6. Clarity and cleanup — last, and clearly marked optional.

For every finding give:
- file:line
- Severity: blocker / should-fix / nit
- The concrete failure: which input or state produces which wrong outcome. If you cannot state that concretely, it is a nit, not a bug — label it honestly.
- A suggested fix in one or two sentences, described and not applied.

List blockers first. End with a one-line verdict: safe to merge / fix blockers first / needs a closer look at <area>.
````

> `disallowed-tools` 才是真正把写文件的能力从工具池里拿掉的那个字段 —— 只读命令靠它兜底，不要用 `allowed-tools`。

> 限制在下一条消息发出时自动解除，所以不影响你审完接着让它改。

</details>


### ④ 组合流程

#### `harden`  ·  高风险

全流程编排：从摸架构到补文档，每个阶段停下等你确认。

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

**配对**

- 跑之前先跑 → `explain-architecture`（不熟的代码库先摸清结构再启动）
- 跑完接着跑 → `pre-release`（全流程跑完，发版前再走一遍轻量检查）

<details>
<summary><b>提示词全文</b>（点开复制）</summary>

```text
Run a full hardening pass on this codebase. You are an orchestrator: you sequence the stages below and stop for my confirmation between every one.

Hard constraints:
- STOP after each stage. Print what the stage found or changed, then wait for me to say continue. Do not chain two stages in one turn, no matter how small the second one looks. "Review and then fix" in one pass is exactly the mistake this command exists to prevent.
- One stage means one concern and its own commit or commits. Never mix a review with a fix, or a restructuring with an optimization, in the same commit. I need to be able to revert any single stage on its own.
- The stage order is not negotiable, and two orderings in particular. Restructuring after optimizing throws the optimization away, so restructure first. Optimizing before measuring optimizes the wrong thing, so measure first.
- Run the verify step after every stage that touched code, not once at the end. It is the metronome, not the finish line.
- If a stage's verify fails, stop the whole run and fix that before going on. Do not carry a red build into the next stage.

Stages:
0. Baseline. Report the test command, the current pass/fail count, coverage if available, and the commit you are starting from. If the tests do not run at all, stop here and say so.
1. Map. Read-only architecture pass: what the modules are, which way dependencies flow, where the seams are. No edits.
2. Cover. Add tests for the areas stages 4 through 8 will touch, starting with whatever has no coverage today. Tests only, no production-code changes. Verify.
3. Review. Read-only: correctness bugs, error handling, security. Produce a ranked list. No edits. Then ask me which findings to act on — do not act on all of them by default.
4. Fix. Only the findings I picked, one commit per finding or per tight group. Verify.
5. Prune. Remove genuinely dead code. Prove each removal with a repo-wide search first, and skip anything reachable from config, docs, generated code, or another package. Verify.
6. Restructure. Refactor for structure. Public interfaces stay put unless I approve each change individually. Verify.
7. Simplify. Reduce incidental complexity. Behavior and interfaces unchanged. Verify.
8. Measure, then optimize. Profile first and show me the numbers. Optimize only what the profile flags, and only where the measured win justifies the complexity it adds. Re-measure afterward and show the before/after. Do not skip the measuring half.
9. Normalize. Lint, type-check, naming and layout consistency. Mechanical changes only. Verify.
10. Document. Update docs and comments to match what the code now does.

Start at stage 0 and stop.
```

**存成命令文件** `.claude/commands/harden.md`：

````markdown
---
description: 全流程加固编排：基线→摸架构→补测试→审查→修→删死代码→重构→精简→测量后优化→规范化→文档，每阶段停下等确认。
disable-model-invocation: true
---

Run a full hardening pass on this codebase. You are an orchestrator: you sequence the stages below and stop for my confirmation between every one.

Hard constraints:
- STOP after each stage. Print what the stage found or changed, then wait for me to say continue. Do not chain two stages in one turn, no matter how small the second one looks. "Review and then fix" in one pass is exactly the mistake this command exists to prevent.
- One stage means one concern and its own commit or commits. Never mix a review with a fix, or a restructuring with an optimization, in the same commit. I need to be able to revert any single stage on its own.
- The stage order is not negotiable, and two orderings in particular. Restructuring after optimizing throws the optimization away, so restructure first. Optimizing before measuring optimizes the wrong thing, so measure first.
- Run the verify step after every stage that touched code, not once at the end. It is the metronome, not the finish line.
- If a stage's verify fails, stop the whole run and fix that before going on. Do not carry a red build into the next stage.

Stages:
0. Baseline. Report the test command, the current pass/fail count, coverage if available, and the commit you are starting from. If the tests do not run at all, stop here and say so.
1. Map. Read-only architecture pass: what the modules are, which way dependencies flow, where the seams are. No edits.
2. Cover. Add tests for the areas stages 4 through 8 will touch, starting with whatever has no coverage today. Tests only, no production-code changes. Verify.
3. Review. Read-only: correctness bugs, error handling, security. Produce a ranked list. No edits. Then ask me which findings to act on — do not act on all of them by default.
4. Fix. Only the findings I picked, one commit per finding or per tight group. Verify.
5. Prune. Remove genuinely dead code. Prove each removal with a repo-wide search first, and skip anything reachable from config, docs, generated code, or another package. Verify.
6. Restructure. Refactor for structure. Public interfaces stay put unless I approve each change individually. Verify.
7. Simplify. Reduce incidental complexity. Behavior and interfaces unchanged. Verify.
8. Measure, then optimize. Profile first and show me the numbers. Optimize only what the profile flags, and only where the measured win justifies the complexity it adds. Re-measure afterward and show the before/after. Do not skip the measuring half.
9. Normalize. Lint, type-check, naming and layout consistency. Mechanical changes only. Verify.
10. Document. Update docs and comments to match what the code now does.

Start at stage 0 and stop.
````

> 必须 disable-model-invocation: true —— 这是个会连续改一整个代码库的编排命令，绝不能让 Claude 自己判断时机启动。

</details>


---

## ⑥ 不建议这么做

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

## 内容准确性

内置命令、bundled skill、frontmatter 字段这些，都对着官方文档核过（快照 2026-08-06），不是凭记忆写的：

- [Claude Code — Commands reference](https://code.claude.com/docs/en/commands)
- [Claude Code — Extend Claude with skills](https://code.claude.com/docs/en/skills)

内置命令的可用性随 Claude Code 版本、套餐和平台变化。**以你本地 `/help` 的输出为准。**

---

## License

MIT
