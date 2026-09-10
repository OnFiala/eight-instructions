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
- Native paging preserved all 22 tests. The same sample/network/route workload
  fell from 41.12 s to 13.45 s; changing one committed road and rerouting took
  6.76 s. The altered route cost was 21, path 0 2 4 5 11. These are individual
  development observations, not a statistical benchmark or cross-host promise.
- Runtime code addresses now use page/offset pairs. Existing Thread source syntax
  and tested behavior survive; early kernel images intentionally have incompatible
  kernel hashes. No user images had been published at this stage.

## Storage, images and adversarial application tests

- Added native bulk fill and overlap-safe move operations. Transaction copying
  and graph initialization use these ordinary memory primitives. The sample run
  measured 8.58 s; changing and rerouting one road measured 2.18 s.
- Saved a real image to disk, then loaded it in a new Node process. It retained
  the network, generation and compiled program and reproduced the same route.
- A separately authored literal C interpreter executed the full generated kernel
  for a user-defined square function: 1,439,337,295 raw instructions. Its output
  matched the runtime. This reference performs no RLE or affine optimization.
- Application stress: 32-node / 31-edge maximum path and random networks passed
  against a Bellman-Ford oracle. One of nine storage/application tests failed:
  inserting 128 records reached the 1e14-instruction budget after 47.41 s.
- Replaced linear free-slot search with BF-native open addressing and tombstones.
  This is a real store-format revision (1 to 2), before public release. Added
  collision, deletion-chain and native format/index integrity checks. Previous
  development images retain their own old compiled library; loading a new
  incompatible library is rejected by its schema check.
- The current session's platform metadata reports gpt-6-astra and xhigh, matching
  the founding prompt. No other coding agent has participated.
- The revised full-capacity store test passed in 5.62 s, including capacity refusal,
  update, deletion and slot reuse. All 12 storage/application/reference tests in
  that run passed. Collision chains and schema corruption are explicitly covered.
- Self-audit found the Wasm interpreter's input-availability import was evaluated
  for every generic operation by an eager boolean expression. Changed it to a
  conditional import only at a comma instruction; differential checks still pass.
- Input validation now rejects malformed bytes without changing queued input;
  execution budgets are validated and counters stop before losing integer precision.
