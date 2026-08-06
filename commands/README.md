# 成品命令文件

这些 `.md` 由 [`../commands.json`](../commands.json) 生成，不要直接改这里 —— 改 JSON。

用法：整个目录拷进你的项目，

```bash
mkdir -p .claude/commands && cp commands/*.md .claude/commands/
```

之后在 Claude Code 里敲 `/<文件名>` 就能跑，比如 `/refactor`。放到 `~/.claude/commands/` 则是所有项目通用。

⚠️ `simplify.md`、`code-review.md`、`verify.md` 会覆盖 Claude Code 自带的同名 bundled skill。想两个都留着，拷过去之前先改个名。
