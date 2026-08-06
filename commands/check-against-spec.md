---
description: 拿实现对规格双向逐条核对（规格→代码、代码→规格），每条要 file:line 证据，只读不改。
argument-hint: <spec 路径或 URL>
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Check this implementation against the specification at $ARGUMENTS.

If no specification is given, STOP and ask for one. Do not infer the spec from the code, from the issue tracker, or from what the feature seems like it should do — a check against a spec you invented is worthless, and worse, it reads as authoritative.

Read the spec first, in full, and break it into individually checkable requirements. Number them. If the spec is ambiguous on a point, mark it ambiguous and check both readings rather than picking one silently.

Check in both directions. The second is the one people skip and it is where the surprises are:

**Spec → code.** For every numbered requirement:
- Status: implemented / partially implemented / not implemented / contradicted.
- Evidence: file:line. No evidence means not implemented. "The code seems to handle this" is not evidence — if you cannot point at the lines, say so.
- For partial: exactly which part is missing.
- For contradicted: what the code does instead, and quote both.

**Code → spec.** Behavior the implementation has that the spec never mentions:
- Undocumented endpoints, parameters, config options, side effects, error cases.
- Extra validation the spec does not require, or missing validation it does.
- For each: is this a deliberate extension, dead scaffolding, or something nobody knows is there? Check the git history when the answer is not obvious from the code.

Hard constraints:
- Do NOT change any code, tests, or the spec itself. Report only.
- Do not resolve a disagreement by deciding the spec is wrong. Report the mismatch and let me decide which side moves.
- Distinguish "cannot be determined by reading" from "not implemented". Say which checks would need running the system.

Report: a table of requirement number, status, evidence; then the unspecified-behavior list; then a summary count and the gaps that matter most, ordered by consequence rather than by spec order.
