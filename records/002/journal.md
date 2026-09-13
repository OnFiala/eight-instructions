# Build 002 development journal

## 2026-09-13 — Rebind and design

- Owner authorized implementation, local testing, graphical assets, GitHub commits/push/standard merges and updating the existing public Site after verification. No X publication, new service, account changes, Mini runtime changes or backend.
- Host `MacBook-Pro`, effective user/home `ondrej` / `/Users/ondrej`; canonical checkout `/Users/ondrej/BRAINFUCK`. Clean `main` at `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`; origin HEAD/main independently match. Build 002 tag absent; Build 001 annotated tag retained. No additional worktrees; related planning task idle. Created `build-002` branch.
- Current platform turn metadata reports `gpt-6-astra`, effort `xhigh`. No subagent or second coding model. Workspace-write sandbox with network escalation through platform review; not full access.
- Read project protocol, architecture, language, persistence, boundary audit and Build 001 evidence. Loaded CORTEX brainfuck brief, including selected concept and prior planning; planning was not mistaken for implementation.
- Opened the exact approved concept 1. Copied it byte-for-byte to `reference/approved-living-dispatch.png`; 1487 × 1058, SHA-256 `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`.
- Image-to-code workflow applies to faithful composition and screenshot comparison. Existing runtime is preserved; no starter or mock. Sole-author rule overrides skill suggestions to delegate asset work. User's explicit production and publication requirements override prototype-only defaults.
- Architectural choice: put the reclaiming workspace compiler and module execution semantics in Thread itself, running inside the existing BF kernel. Add only generic raw byte input and bounded workspace memory primitives to the kernel. This avoids a large second bootstrap implementation of module policy. The module language is an explicitly documented pure, typed subset of Thread; general legacy Thread remains available.

Status: implementation in progress. No Build 002 release or performance claim yet.

## Native workspace and city implementation

- Added only three generic kernel primitives: raw `key`, paged workspace `w@` and `w!`. The module compiler, typed module bytecode evaluator, named source records, exact version dependencies, roots, explicit pins and iterative reclamation are implemented in `programs/workspace.thread` and execute inside BF.
- Initial workspace suite: 5/5 passed. Two initially failing fixtures were corrected: `drop` is a valid 2-to-1 function, and an intended valid conditional had unequal branch stack depths. These were fixture errors, not a reason to weaken validation. Added genuine code-capacity exhaustion as a separate fixture. Compilation stops before publishing on every checked failure.
- During author review, corrected the typed `while/repeat` join to restore the exit stack depth, and bounded external pin counts so native 16-bit reference counters cannot wrap.
- Native resident workspace and city compiled to 9,793 platform code words in one development measurement, exceeding the old 8,192-word resident platform region. Set the new fixed platform region to 12,288; the original capacity regression now derives its exhaustion input from the configured code region. The reclaimable module pool remains six 128-word arenas. This platform-capacity change is not the module reclamation mechanism. Heap and dictionary limits remain unchanged.
- First city: 16 intersections, 44 directed edges, three vehicles, native jobs/ticks, Dijkstra and emitted source/version/cost/path decisions. First three-route tick plus full state report took 16,425 ms in an exploratory run. Native linked adjacency lists and a one-entry pure-input policy cache reduced the first tick to 6,246 ms. Allocating hot city state before the workspace compiler tables reduced it further to 3,967 ms; subsequent movement/arrival ticks were 28/153 ms. These are individual development observations, not final benchmarks, and the first measurement includes more output.
- Four initial city tests passed: identical-image/program comparison (paid bridge remains open; default score15 versus toll-averse score22), two swaps during a trip retaining old pins until arrival, exact image continuation, and a separate closure experiment. Author review then added immutable in-flight road duration so later duration edits cannot advance or delay an already committed segment; a new test covers it.
- Focused existing kernel, generic executor, Wasm differential, capacity and full literal C regressions: 27/27 passed after the kernel extension. Initial native workspace tests took140s; city tests70s. Full release checks remain pending.
- Added generic CLI/worker raw-source manifest selection. CLI `--city` loads native sources; it does not interpret their semantics. Legacy default source manifest remains available.
- CORTEX decision write initially timed out, but a subsequent canonical search confirmed it was stored. Recorded the native milestone once with an idempotency key.
- Started the fixed-capacity450-cycle stress test. Do not claim its result until its process completes.

## Graphical assets

- Used image_gen, explicitly permitted for purely graphical assets. Six distinct architectural district sprites follow approved concept1: university, market, depot, homes, warehouse and old town. No road network, route, vehicle state or interface is baked into these sprites.
- The first isolated university attempt requested transparency but produced RGB with a baked checkerboard. Rejected it. The six district assets use an explicit magenta matte for presentation-only chroma compositing in the renderer. Original PNGs are preserved unedited; hashes and origin are in asset-provenance.json.
- Native UI integration and reference-versus-screenshot QA remain pending. No Build002 public release has occurred.

## Reclamation evidence and compiler performance repair

- The first450-cycle replacement test completed successfully: 9000 cumulative compiled module words, only40 live module code words in two versions at the end, slots1/2/3 reused within fixed capacity6; deletion left zero live versions. Resident platform allocation stayed at6713 code words /162 dictionary entries and tape169164 cells. Elapsed workload1132941ms (18.9 minutes), with other local development checks occurring during the run. This is actual fixed-capacity evidence, not a final isolated speed benchmark.
- Optimized the native lexer/compiler: match length before comparing spelling, stop after an exact builtin match, and parse valid numeric tokens directly. Module names now start with a lowercase letter to reserve numeric spellings. A development compile of a20-word module took880–959ms in three observations.
- The first numeric fast path incorrectly rejected the supported `0=` word as a malformed number. The existing until/nontermination tests exposed it. Corrected it to fall through to exact primitive matching when numeric parsing fails; also strengthened the test to assert successful compilation before expecting runtime budget refusal. Preserve the failed test receipt in workspace-optimization-failure.txt. Reverification is running.
- Raised the CI time allowance from15 to45 minutes because the measured native450-cycle workload alone exceeded15 minutes before optimization. This changes orchestration time, not guest memory, execution semantics or per-run work limits.
- After the `0=` repair the complete workspace suite passed5/5 in71214ms. The native checkpoint suite (city5, raw memory/manifest2, worker1) passed8/8 in86798ms before that lexer-only optimization. All current changes remain a development milestone, not the final release gate.
- Fresh hardware identification for future measurements: Mac17,2 / Apple M5 /34359738368bytes physical RAM. Host query required the normal platform sandbox escalation; no host configuration changed.
