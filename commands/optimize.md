---
description: 只优化 profile 指出的热点，每处改动都要有真实负载下的前后数字；没有 profile 直接拒绝执行。
argument-hint: [profile 数据 | path]
disable-model-invocation: true
---

Optimize the hotspots identified in $ARGUMENTS.

STOP CONDITION — check this first. If I have not given you profiling data, or you cannot find a recent profile in the repo, do NOT start. Say that you need a profile and stop. Do not read the code and guess where the time goes; that guess is wrong far more often than it is right, and optimizing the wrong place costs readability for nothing.

Hard constraints:
- Optimize only what the profile flags. Something that looks slow but does not appear in the profile is not a target, no matter how inefficient it looks.
- Behavior is frozen: same results, same error handling, same ordering. An optimization that changes an edge case is a bug.
- Every change needs a measured before and after, on a realistic workload, reported as numbers. A change you cannot measure is a change you cannot justify — revert it.
- Readability is a real cost. State it for each change: "this made the function harder to follow in exchange for X% on the measured workload." If the win is in the noise, or under roughly 5% on the real workload, revert it and say so. Do not accumulate small unmeasurable wins.
- No caching without stating the invalidation rule and what happens when it is wrong. No concurrency without stating what is now shared and how it is protected.
- Do not restructure the code while optimizing. If the hot path needs a different shape, stop and tell me — that is a refactor, and doing it here means the next refactor throws your work away.

Working order:
1. Restate the profile's top hotspots with their share of total time, and say which you will target and which you will not, with reasons.
2. Establish a repeatable benchmark and report the baseline number before changing anything.
3. One optimization per commit, each with its own before/after measurement in the commit message.
4. Re-run the full test suite after each change, and re-profile at the end to confirm the hotspot actually moved — and to show what the new bottleneck is.

Finish with a table: change, measured win, readability cost, keep or revert.
