# Build #001 development journal

Append observations as they happen. No deliberately broken commits are required.

## Foundation

- Created the exact requested root and initialized Git before implementation.
- Verified local host and effective user. Existing global Git identity was absent.
- GitHub authentication initially looked invalid inside the network sandbox;
  the authorized network call succeeded as OnFiala. This was an environment
  diagnostic, not a user intervention or repaired implementation defect.
- Chose MIT: short permissive terms make the experiment straightforward to inspect,
  run, modify, and reuse. No external code is being copied as its architecture.
- No other model or engineering agent is used.

## Kernel foundation

- Implemented the generic executor, a literal execution mode, structured emitter,
  addressed tape access, native tokenizer/compiler, typed control patching,
  separate stacks, bounded heap/store, arithmetic and diagnostics.
- Self-inspection caught a generator call confusing a runtime code-limit register
  with an integer constant. Corrected it before first kernel validation.
- Avoided spreading the generated source into a JavaScript character array: the
  roughly 10 MB initial artifact warranted direct string scanning instead.
- First complete kernel suite: 17 tests passed, including 100 deterministic
  optimizer comparisons within one test. No test failure in that first suite.
- Added native defining words and while/repeat so applications can own named
  state and write structured loops without a host compiler.
