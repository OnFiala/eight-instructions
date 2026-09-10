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

## First application-scale failure and redesign

- The first core/store/Dispatch compilation exhausted a one-billion executor-block
  work budget after 11.51 seconds. It had only reached 109 dictionary entries and
  856 code cells. The observed state was `budget`, not successful compilation.
- Diagnosis: linear dictionary lookup scanned every entry even for early matches;
  native comparisons and addressed access multiplied the cost of every token.
- Chose a BF-native 256-bucket chained dictionary. Runtime token hashing, lookup,
  publication and links stay entirely in generated Brainfuck. Built-in dictionary
  initializers are bootstrap constants. No host parser or application shortcut.
- After hashing, the whole 6,176-byte library/application input compiled to 118
  dictionary entries and 1,661 code cells in 2.99 seconds on the JS backend.
- A generic WebAssembly backend passed 150 differential programs plus streaming,
  bounds and nested-loop checks. The first full sample/network/route run completed
  in 41.12 seconds there, returning cost 20 and path 0 2 1 7 8 9 10 11. This
  was correct output, but not acceptable interactive performance.
- The next bottleneck was repeated linear access to code memory for each guest
  instruction. A six-lane paged tape primitive now passes page-boundary and
  breadcrumb-cleanliness tests. The next revision will use native page/offset
  program counters and branch operands; guest source syntax remains unchanged.
