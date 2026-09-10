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

## Browser integration and final boundary audit

- The visible interface and optional WebMCP tools run the same real worker and
  generated kernel. The native sample returned cost 20; staging a road at cost
  100 returned cost 21; abort restored cost 20. The host only submits source,
  parses emitted records and draws the emitted path.
- Moved convenience transaction-start behavior for road buttons into native
  `stage-road` / `stage-close` words, keeping transaction policy inside Thread.
- Browser-worker protocol tests use the actual production worker and Wasm, with
  only transport adapted to Node. They cover busy refusal, pause, step, image
  validation, and continuation across terminated/new worker lifetimes.
- One new worker test initially wrote without a required transaction and then
  expected stored data. Corrected the test fixture to begin and commit a native
  transaction; no production persistence defect was concealed by that correction.
- Capacity attacks filled all 256 dictionary entries, exhausted code and nested
  controls, filled the heap and sent oversized tokens. Rejected definitions stayed
  unpublished; previous words and allocation checkpoints survived.
- Self-audit found that reaching an output cap incremented the diagnostic counter
  before refusing the output instruction. Resuming would count that instruction
  twice. Corrected both generic backends, then verified drain/resume produces
  exactly three bytes and three instructions for a capped three-output program.
  The generic Wasm binary is now 744 bytes.

## Deliberately hostile final workloads

- After the 47-test milestone, added a 32-node graph with the full 128 directed
  roads and three oracle-checked cyclic routes. It passed in a 21.17-second test
  run (including compilation, insertion, integrity and all three route queries).
- A new store workload maps all 128 large keys (`i * 512`) to the same initial
  bucket. Its insert/commit/integrity sequence exhausted the 1e14-instruction
  per-command work limit after 16.07 seconds. This exposed a much less favorable
  workload than consecutive-key capacity testing. The machine paused; it did not
  produce a false success result.
- Tried a fully unrolled 16-bit binary division for every internal division.
  Arithmetic cases passed, but small-number work became more expensive: the
  literal full-kernel test exceeded its 10-billion-instruction limit, the raw
  kernel grew to 50,577,467 commands, and the collision workload still hit its
  budget. Rejected the universal replacement; this failed attempt is retained here.
- Chose an adaptive native `/mod`: at most eight direct subtractions, then guarded
  binary candidate subtraction for a large remaining quotient. Decimal formatting
  and internal small division retain their previous path. All scaling and
  arithmetic are generated Brainfuck, with no application/native host shortcut.
- Removed the store's separate second probe for insertion. `db-find` now remembers
  the first reusable slot while proving the key absent, including tombstones.
  The on-tape format remains version 2; this is an algorithm change, not a data
  migration. The regenerated kernel hash changes, so pre-release development
  images must use their original kernel as the image contract already requires.
- The adaptive division passed 119 operand pairs covering every bit width,
  overflow guards and randomized operands. The independent literal full-kernel
  reference also passed again (1,453,328,957 instructions for the square fixture).
- The combined collision workload still exceeds one default work budget. Kept
  that limit unchanged and made the stress test exercise actual continuation:
  save a deliberately budget-paused image, restore it, then finish in bounded
  chunks with progress checks. All 128 colliding records survived, along with
  deletion, update and reuse. Observed workload: 34.74 s, 429,824,504,751,225 BF
  instructions, six bounded execution calls before the final checks. This is an
  explicit worst-case limitation, not an assertion of fast worst-case lookup.
