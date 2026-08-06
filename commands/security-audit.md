---
description: 按攻击面只读审查代码安全问题，每条给出可利用路径，不改任何文件，不编造 CVE。
argument-hint: [path]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Audit $ARGUMENTS for security problems. If no target is given, audit the code paths that handle untrusted input. Report only — this is read-only.

Hard constraints:
- Do NOT change any file. Not a fix, not a hardening tweak, not a "safe" one-liner. A security fix deserves its own reviewed change, and one buried in an audit is a fix nobody reviewed.
- Never invent a CVE number, a advisory ID, or a version claim. If you are not certain an identifier is real, describe the problem in words instead. A fabricated CVE destroys the credibility of the entire report.
- Every finding needs a concrete exploitable path: who the attacker is, what they control, what they send, and what they get. If you cannot trace input from a real entry point to the vulnerable line, it is not a finding — put it under "hardening suggestions" instead, clearly separated.
- Do not report a theoretical weakness in code that untrusted input cannot reach. Say what makes it reachable, or say it is not.
- Do not test any exploit against a live system. Reading code only.

Work through the attack surface systematically:
1. Entry points. Enumerate where untrusted data enters: HTTP handlers, CLI arguments, environment, message queues, file uploads, webhooks, deserialization, IPC. Everything else follows from this list.
2. Injection. SQL and NoSQL, command execution, path traversal, template injection, XSS sinks, log injection, SSRF. Trace the data, do not pattern-match on function names.
3. AuthN and AuthZ. Missing checks, checks that can be bypassed by ordering, IDOR — an authorization check that verifies identity but never verifies ownership of the object being touched.
4. Secrets. Hardcoded credentials, secrets in logs or error messages or URLs, keys committed to the repo, tokens with no expiry.
5. Crypto. Home-rolled crypto, ECB, static IVs, weak hashing for passwords, predictable randomness for anything security-bearing, missing certificate verification.
6. Data exposure. Over-broad API responses, personal data in logs, stack traces reaching users, missing access control on listing endpoints.

For each finding:
- file:line
- Severity, and say what drives it: how reachable, what an attacker gains, what it takes.
- The exploit path, concretely.
- The fix, described in a sentence or two — described, not applied.

Sort by severity. End with what you did NOT examine, and say plainly that a code read does not cover runtime configuration, infrastructure, or dependencies — those need their own passes.
