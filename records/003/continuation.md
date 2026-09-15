# Build 003 current work

Implementation in progress, NOT a release. Sole Astra xHigh; no delegates.
Read challenge.md, decisions.md and journal.md before continuation. Baseline/tag
a80087662a66e7d04c1fc77cbce87cf996d60e63, branch build-003-development.
First gate: native process scheduler, messages, continuation, resource reuse and
an infinite actor that cannot block other eligible actors. Visual/world expansion
must follow that gate. Preserve all 76 existing tests and the current public site.

Initial native milestone now passed7tests: no-yield preemption, three communicating
programs, old frames/images, private bounds fault, full mailbox, stale handles,
16process capacity,450create-stop cycles. Expanded layout13/14 first retest exposed
only the host fuel needed to observe the same1024-op refusal; focused2e14retest PASS.
Kernel now generic512dictionary/24576resident code/20480workspace words, no added
opcodes; raw94105690commands, hash9925a5a8cc36d1423efb7c942195085dd666f367f817caff21e80f9cd575e920.
Workspace default4/6/256/128, boot-only workspace-large selects8/16/512/256.
Native batch# marker/source parameter editing added; focused test output in
native-parameter-tests.txt. Source equality guard added after this focused run;
must verify again. Native process/workspace sources are packaged by package-assets.

Next: industrial ledger/material invariant and resumable road phases (design in
decisions.md), production chain and direct context UI, visual target/assets/QA,
all required tests/benchmarks/reference/reproduction/archive002, docs and normal
GitHub/Sites release. Nothing deployed or pushed. Branch only first doc commit so
far; implementation changes uncommitted. CORTEX milestone note01a0a6c3-03c6-7cba-99ee-80fdf2b519a4.
