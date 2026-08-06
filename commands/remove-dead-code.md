---
description: 删除确实无人引用的代码，删除前必须给出全仓搜索证据并等待确认。
argument-hint: [path]
disable-model-invocation: true
---

Remove dead code from $ARGUMENTS. If no target is given, limit the search to the directory I am working in — do not sweep the whole repo unasked.

The burden of proof is on deletion. For every candidate, you must show it is unreachable before you remove it.

Proof requires all of these:
- A repo-wide search for the symbol name, including tests, fixtures, config files, templates, build scripts, CI files, documentation, and generated code.
- A search for the name as a *string*, not just as an identifier. Reflection, dynamic import, dependency-injection containers, serialization, and feature-flag lookups reach code by name.
- Confirmation that it is not part of a published interface. If this package is consumed outside this repo, an export with no internal callers is still live. Treat every export as live unless I tell you this is an application, not a library.

Do NOT delete, and list under "unproven" instead, anything that is:
- Reachable through reflection, dynamic dispatch, a plugin registry, or a name built at runtime.
- An interface method, an abstract or overridable member, or a required part of a protocol — even with one implementation.
- Behind a feature flag, or referenced from config, migrations, docs, or another package.
- Recently added. New code that nothing calls yet is usually unfinished, not dead. Check the git history: if it landed recently, ask me before removing it.

Working order:
1. Report the test baseline first. If tests do not run, stop.
2. Present the candidates in two lists — "proven dead, with the evidence" and "suspicious but unproven, with the reason" — and wait for me to approve the first list before deleting anything.
3. Delete only what I approved. Group by area, one commit per area.
4. Re-run the tests. Build the project too — dead-code removal breaks compilation in ways tests miss.

Do not simplify, reformat, or restructure the code you leave behind. Deletion only.
