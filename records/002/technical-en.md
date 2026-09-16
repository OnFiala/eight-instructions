# Build 002 — precise technical description

A single Astra instance (`gpt-6-astra`, `xhigh`) authored the architecture, implementation, tests, repairs and this self-review. The human supplied the challenge and first approved visual reference. I used no subagents or other coding model. The `image_gen` tool created graphical assets only; their provenance, accepted originals and rejected attempts are recorded in [asset-provenance.json](asset-provenance.json) and [journal.md](journal.md). This review is not an independent audit. [build.json](build.json) records release status and specific identities; local verification alone does not prove public deployment.

This is an English translation of the original Build 002 account. Measurements and implementation details describe that historical release. Source links below are pinned to `build-002`, rather than the newer implementation on the current branch.

## What existed before and what was added

Build 001 remains at the unchanged `build-001` tag, commit `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`. It provided a BF kernel with a general Thread compiler and executor, stacks, a dictionary, memory operations, transactional storage, weighted Dispatch routes and whole-machine snapshots. New definitions consumed additional resident code and dictionary space; it did not have this named workspace with version reclamation.

Build 002 adds a named-source manager, another compiler for a restricted module profile of Thread, its evaluator, exact version bindings, safe publication, rollback, pins and reclamation. **All of this is written in Thread and executed by the actual BF kernel.** The city's new application logic, including route finding and journey stepping, is also Thread. The visual city is a concrete use of these capabilities.

Canonical sources:

- [workspace.thread](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/workspace.thread): raw names and sources, lexer, compilation, stack-effect checking, module bytecode, evaluator, references and reclamation.
- [city-state.thread](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/city-state.thread): city variables and arrays. They are allocated before the workspace to reduce long BF pointer movements.
- [city.thread](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/city.thread): roads, jobs, Dijkstra, rule evaluation, cost caching, steps, arrivals, deliveries and presentation output.
- [city-boot.thread](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/city-boot.thread): actual input commands that establish the first module and city. The [manifest](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/city-system.json) specifies raw-file order, not host-side compilation.
- [core.thread](https://github.com/OnFiala/eight-instructions/blob/build-002/programs/core.thread): general Thread foundation words. Historical `store.thread` and `dispatch.thread` remain tested and can run through the original CLI profile; the city profile does not load them automatically.

## BF dialect and bootstrap

The [kernel.bf](https://github.com/OnFiala/eight-instructions/blob/build-002/artifacts/kernel.bf) artifact contains only the eight instructions `> < + - . , [ ]` and a final newline. Its SHA-256 is `0ebd529deaf21dd77bba0ddaef77693e27fd1fffbc9930c9ca31b0bbde400d98`. The fixed tape has 169164 cells of 16 bits, totaling 338328 bytes. Cell arithmetic wraps modulo 65536; the pointer must stay on the tape. Output is byte-oriented. Temporarily empty input pauses at the comma so later input resumes at exactly that point; explicit end-of-input has the EOF semantics defined in the [dialect](https://github.com/OnFiala/eight-instructions/blob/build-002/docs/architecture.md).

Python in [kernel/build.py](https://github.com/OnFiala/eight-instructions/blob/build-002/kernel/build.py) and [tools/emitter.py](https://github.com/OnFiala/eight-instructions/blob/build-002/tools/emitter.py) constructs the initial BF kernel. It emits instructions for general computation; it does not read user Thread files or calculate routes or answers. This is not self-hosting. The existing bootstrap was preserved. Only the generic primitives `key`, `w@` and `w!` were added: raw byte reading and access to bounded working memory. Module semantics were not moved into Python.

An actual short excerpt from this build is the first four characters of `kernel.bf`, at byte offsets 0–3:

```brainfuck
[-]+
```

`[-]` repeatedly subtracts until zero; `+` sets the cell to 1. At startup the pointer is at cell 0, named `running` in the kernel map. The excerpt initializes the main-loop flag. It is emitted by `b.set(self.running, 1)` in `Kernel.build`; it is neither a standalone compiler nor a route calculation. Its limited function is not presented as proof of the whole system.

## Capacities and ownership

General Thread's resident code has 12288 words instead of the original 8192. The new native platform required this change. Its dictionary remains limited to 256 entries; the heap and original store each have 4096 words. Resident general definitions still grow monotonically. **Increasing the resident region is not the module-reclamation mechanism.**

The module workspace has a fixed 4096 words. Four records of 320 words and six arenas of 448 words use 3968 words. A name is at most 23 ASCII bytes; each module has a draft of up to 256 bytes. Each version retains its own source of up to 256 bytes and at most 128 bytecode words. Metadata and bindings occupy the rest of the arena. Failed compilation does not add a resident definition.

A module contains one definition with a matching name. It supports literals, arithmetic, stack words, conditions, structured loops and calls to another module. [modules.md](https://github.com/OnFiala/eight-instructions/blob/build-002/docs/modules.md) gives the exact list and stack effects. This is an explicitly restricted pure profile, not complete general Thread. The compiler checks arity, branch and loop consistency, and final stack depth. The evaluator has 64 values, 16 frames and a shared budget of 1024 bytecode instructions per root call. Division errors or exhausted budgets return failure and zero results of the declared arity. Valid compilation does not guarantee termination for every input or a useful score.

## Versions, safe points, pins and rollback

The active version and one previous rollback version form roots. A compiled call captures the target module's exact current version, not its future contents. Successful compilation acquires the relevant references; a rejected candidate does not. New versions can reference only existing older versions, making dependencies an acyclic graph. Each root, explicit pin and dependent version adds a reference. A native iterative collector releases an unreferenced arena, then its dependencies.

Publication occurs within the single BF execution stream after full candidate validation, between completed native operations. It does not replace instructions beneath a concurrent running call. Old direct bindings and pins retain the old program. `module-rollback` swaps the active and previous roots without rewriting the city. `module-delete` rejects external live references; otherwise it removes roots and releases unused versions. Six occupied arenas can legitimately prevent further compilation.

Version serial identifiers are separate from reusable arena numbers. After serial number 65535, further publication is rejected; identity does not wrap into an old handle. Explicit pins are limited to 60000. Reclamation need not physically zero old bytes; state and lengths prevent their interpretation. Secure erasure of private source from the owner's tape is not promised.

## The city and work in progress

The city has 16 nodes, 46 initial directed roads with capacity for 48, and three vehicles with one destination each. Roads hold duration, toll and open/closed state. Dijkstra selects the lowest nonnegative score supplied by the natively evaluated rule; the city accepts road scores only from 1–1023. Evaluation uses pure single-entry memoization and a complete cost table inside BF, bound to the exact version and road generation. Every road change also explicitly invalidates the cache, so generation-counter wrap cannot resurrect an old table.

On a step, an idle vehicle chooses a route, pins the active version and departs with zero progress. Later logical steps increase progress. The current road's duration is captured at departure. Changes to the rule, destination, road openness or future road duration do not move the vehicle elsewhere. On arrival at the original endpoint it releases the pin; only its next departure uses the current rule. Closing a road blocks new planning, not completion of a segment already started. There is no collision or traffic model. Step and delivery counters are 16-bit, not unlimited time.

A reproduced comparison: the original `+` gives van 1 route `12 8 9 10 11 15`, score 15. Source `: delivery-rule.thread 8 * + ;` gives route `12 8 4 0 1 2 3 7 11 15`, score 22. The toll bridge stays open in both cases, and both fresh machines receive the same three logical steps. The score is not travel time: it includes program-weighted tolls. The [browser reproduction](browser-reproduction.json) and [fresh CLI replay](browser-reproduction-cli.txt) contain exact data.

A new user program entered during final browser verification was `dup 0= if drop 1 + else 7 * + then`, inside the `delivery-rule.thread` definition. For duration 2 and toll 5, a fresh CLI instance actually returned score 37. After restoring an in-progress snapshot and completing the original arrival, it planned from node 8 to 15 via the northern bridge with score 28, version 2. Evidence is in `browser-final-image-cli.txt` and `browser-final-restored-step4.txt`; the kernel was not regenerated for these inputs.

## Exact flow from editor to image

The editor only constructs raw input with an exact byte count. BF `source-write` stores the draft and acknowledges success. Only then does the UI send `module-compile`. The native lexer reads stored source, creates and validates a candidate, and publishes the version. The next native decision evaluates that version and emits `ROUTE`; a state request supplies a complete `CITY` frame. Filling a new cost table also emits `POLICY`, `COSTS` and `EDGE-COST`. A valid cache need not emit those older records again.

[site.mjs](https://github.com/OnFiala/eight-instructions/blob/build-002/dist/site.mjs) handles buttons, input framing, the raw log, separate snapshots and response transport. [presentation.mjs](https://github.com/OnFiala/eight-instructions/blob/build-002/dist/presentation.mjs) reads length-framed sources and numeric presentation records. [city-scene.mjs](https://github.com/OnFiala/eight-instructions/blob/build-002/dist/city-scene.mjs) projects emitted coordinates, actual roads, the last emitted route and positions. JavaScript interpolates only between two already observed positions; it does not compute the next segment, task, collision or delivery. Decorative buildings, greenery and stone bridges are graphics. BF does not draw a 3D image itself.

## Complete justification of host components

[boundary.json](https://github.com/OnFiala/eight-instructions/blob/build-002/boundary.json) inventories individual files and dependencies. The Python bootstrap and emitter construct the initial machine. JavaScript `engine.mjs`, `wasm-engine.mjs` and WAT/Wasm execute the eight instructions generically; optimizations merge runs and general loops without recognizing Thread words or city events. `wabt` 1.0.39 is the only npm dependency and is used only to build Wasm. Production has no external npm runtime packages.

`client.mjs`/`worker.mjs` provide the worker thread, raw input, execution budgets and resumption. `images.mjs`, the CLI and OS persistence store an opaque tape with pointer, PC, input queue and checksum. The UI, presentation parser, Canvas, CSS, Inter font and Phosphor icons provide display and controls; they do not compile programs or simulate the city. Original image assets are local, with their magenta backgrounds removed by presentation compositing. The C test interpreter, graph oracles, measurements, replay verifier, packaging and Sites transport are separate tools. No oracle or expected output is imported into the live computation path.

## Persistence, verification and evidence limits

A snapshot preserves all sources, bytecode, versions, references, data, work in progress and the general BF continuation. Normal city-UI import first checks the snapshot in a new worker. Only after obtaining a readable city frame and natively reading both active source and stored draft does it replace the original machine. The editor receives that actual draft. Corrupt or incompatible snapshots do not replace it. A snapshot paused inside an operation can be resumed through the generic CLI; the city UI requires a completed input boundary. An image checksum is not authentication against deliberate modification of one's own machine. The general Thread terminal can intentionally damage memory; it does not isolate untrusted users.

The new kernel explicitly rejects Build 001 images. The matching old kernel, runtime and sources are preserved under `dist/build-001/`; 17 files retain their original bytes. Historical HTML has only disclosed path and navigation changes. No migration is claimed. Export is not automatic cloud storage, and publishing a version does not by itself persist data outside the process.

The original complete local Build 002 suite passed 74/74 with no skipped tests in 578980.073 ms. All original 50 regression tests remained. A 450-cycle test compiled 9000 words in total, exceeding the original 8192-word and 256-entry limits while still using six arenas. It finished with 40 live words in two versions; deletion left no live version. In this isolated core + workspace test, resident code contained 7078 words and the dictionary 162 entries; neither grew during the cycles. This is not the size of the whole city application. The recorded stress run took 457751.376 ms and was not an isolated benchmark. See `final-local-tests.txt`.

Differential tests of the generic executors remain. The literal C BF interpreter additionally executed 374713154388 instructions for module evaluation and 352585709028 for rejected compilation. Output, the complete tape, PC, pointer, high-water mark and instruction count were compared. These large bounded cases start from a raw native checkpoint prepared by the optimized executor—an explicit condition of the evidence. The original reference from a zero tape remains. A test-only Bellman-Ford checks random and unprepared graphs outside production. A finite set of cases does not prove all programs.

Measurements in [metrics.json](metrics.json) used Apple M5, 10 logical CPUs, 32 GiB RAM, Darwin 25.6.0, Node 22.22.0, three sequential fresh BF starts in one process and the generic Wasm executor. Medians: boot 7884.983 ms; source storage 110.113 ms; compilation/publication 590.236 ms; first step with three routes 4395.036 ms; in-progress step 31.262 ms; arrival 162.805 ms; warm single-route calculation 1154.756 ms; 20 reclamation cycles 25081.395 ms. One-time artifact loading took 387.469 ms. Maximum host-process RSS was 312176 KiB, separate from the 338328-byte BF tape. The browser additionally schedules its worker and renders; these values do not promise browser latency or frame rate.

The current public artifact must be bound to the GitHub implementation commit, any metadata-only closure, tag and hosting receipt. Exact identities and live checks belong in the release record; neither successful local tests nor the publish tool alone replaces them. Visual screenshots and overlays are evaluated against the exact approved reference, not its hash. I do not claim pixel matching or full accessibility certification.

## Repair found during initial public verification

The first public candidate had correct native state, but after import its inspector attached an old version-1 cost table from the previous worker to a new version-2 route. That release failed verification, and the public Site was rolled back to verified Build 001. Both the [rollback receipt](rollback-after-evidence-defect.json) and [original incorrect inspector output](public-new-decision-output.txt) remain preserved. The defect affected evidence presentation, not BF computation, but still prevented build completion.

The `routeEvidence` repair reads emitted records in order and attaches only a complete table of the same version. Road changes invalidate it, and import starts without the previous worker's history. The host only associates records here; it computes no score. If a snapshot contains a native cache but not its historical events, the inspector marks the missing record. The cache, bytecode and state remain native. Two regression tests cover version, session, order, incomplete tables and invalidation after data changes.

Another new source was entered in the public browser: `dup 0= if drop 2 + else 9 * + then`. The actually downloaded [public-inflight.8i](public-inflight.8i) returned score 47 for duration 2 and toll 5 in a fresh CLI instance; see the [CLI receipt](public-image-cli.txt). Import restored step 2, three in-progress segments and versions 1/2. Step 3 finished the original segments at nodes 8/4/1; step 4 selected route `8 4 5 6 7 11 15`, score 34, using version 2. The repaired local inspector verified that result again without borrowing an unrelated table. After separately closing Harbor Bridge, the new native table contained all 46 version-2 rows, and the next route from node 4 had score 30; see the [evidence](local-repaired-fresh-cost-inspector.txt).

After the public-inspector repair, a new complete local verification passed 76/76 without failures or skips in 542348.846417 ms. [repair-full-local-tests.txt](repair-full-local-tests.txt) contains the whole run, including both new cases and repeated native regressions; this is not an isolated speed measurement.

## Verified release identity

The final implementation commit is `94bb507bd14a9e91d7aeb440ad3f0d90056d31bb`. The first normal Build 002 merge is `b830e8733ac0656f796abf6614ac9056694328b7`; subsequent PR #2 contains the repair and record closure. The publicly verified repair shipped as Site version 3, source projection `0ab3bc10a25da4cd0402284629e650955669dce3`, deployment `appgdep_6aa707b3fbc08191b6019ee11ffbeab0`. [publication.json](publication.json) records actual identities and links to all checks. Anonymous verification checked 71 files: 69 exact matches and two HTML files whose original source was preserved with a hosting security script inserted. The uploaded gzip archive hash differs from the host-normalized tar archive hash; both are recorded.

Metadata closes in a separate commit through a normal PR. The `build-002` tag and final [final-deployment.json](https://github.com/OnFiala/eight-instructions/releases/download/build-002/final-deployment.json) bind the actual final merge, its CI and the last public-file projection. This avoids the circular claim that a commit knows its own hash or future deployment in advance. Public behavior of the repair is evidenced separately from the final metadata deployment.

The final reproduction package actually downloaded from the repaired public site passed in a fresh CLI instance; see [public-v3-reproduction-cli.txt](public-v3-reproduction-cli.txt). The new workspace export is 451513 bytes and is byte-identical to the same earlier input sequence. After import the repaired inspector behaves correctly, and a corrupt import does not destroy the existing machine. Visual quality passed self-review against the reference; van layering deliberately favors readability of actual positions over physically correct occlusion. Safari, physical mobile devices, a complete screen-reader scenario and a full WCAG audit were not tested.
