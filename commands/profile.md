---
description: 实际运行并测量性能热点，报告负载/环境/方法与数据分布；测不了就明说，不靠读代码猜。
argument-hint: [workload | path]
disable-model-invocation: true
disallowed-tools: Edit Write NotebookEdit
---

Profile $ARGUMENTS and find where the time and memory actually go.

This command requires *measurement*. Do not analyze the code and present an opinion about what is slow — that is a guess, it is usually wrong, and formatted as a hotspot list it will send the next optimization pass at the wrong target. If you cannot actually run and measure this workload, say so plainly, explain what is blocking you, and stop. "I could not profile" is a useful answer. A fabricated profile is not.

Working order:
1. Establish the workload. What are you measuring, and does it resemble real usage? State the input size, data shape, iteration count, and whether this is a warm or cold path. If I have not given you a representative workload, ask for one before measuring.
2. Establish the environment. Build mode (this matters enormously — a debug build profiles nothing useful), runtime version, machine, and anything else that would change the numbers. Note explicitly where this differs from production.
3. Use the real tooling for this stack — the language's profiler, the runtime's, or the framework's. Say which one and how you invoked it.
4. Measure a baseline several times. Report the variance. A single run tells you nothing about whether a difference is real, and neither does a mean without a spread.

Report:
- Where the time goes: functions or call paths ranked by self time and by total time. Both — they answer different questions.
- Allocation and memory pressure, if the runtime exposes it, plus GC behavior where relevant.
- Any I/O, lock contention, or waiting that dominates. Time spent blocked is invisible to a CPU-only profile; say whether your method could see it.
- The distribution, not just the average: median and tail. A p99 problem is invisible in a mean.

Hard constraints:
- Read-only. Do not optimize anything, do not "quickly try" a change to see if it helps, do not modify code to add instrumentation without telling me and reverting it. Report only.
- Attach numbers to every claim. A hotspot with no measurement is not a hotspot.
- State what your method cannot see. Sampling profilers miss short calls; CPU profilers miss blocking; a single-process profile misses cross-service latency.

Finish with the ranked candidates for optimization, each with its measured share of total, and your honest read on whether the top item is worth optimizing at all — sometimes the answer is that the profile is flat and there is nothing to win.
