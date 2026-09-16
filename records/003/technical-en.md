# Build 003 — technical description

This records the actual implementation. Final hosted CI passed all 114 tests,
with no failures or skips. Local visual, interaction and public functional checks
are PASS within the scope of the cited evidence; the final release receipt binds
the exact closing identities. The same Astra xHigh authored the architecture,
code, tests, repairs and this self-review. This is not an independent audit. The
human supplied the challenge and did not add production code.

This is an English translation of the original Build 003 account. It describes
that release, not a subsequent implementation change.

## What changed

Build 001 built Thread, reusable functions, transactional data, route finding and
machine snapshots on top of Brainfuck's eight instructions. Build 002 added named
sources stored on the BF tape, a bounded module compiler, exact version bindings,
publication, one previous version for rollback and reusable arenas.

Build 003 adds a process profile: separate programs have their own continuation,
private data and mailbox. A BF scheduler takes deterministic turns running them.
The default city has 12 participants: two depots, two factories, four vans, two
stations and two bridge controllers. These are actual processes running several
different programs, not rows in a host-side scenario. The city converts two units
of raw material into one panel and transports panels to construction sites.

## What runs where

`artifacts/kernel.bf` is the actual BF program being executed. Python in
`kernel/build.py` and `tools/emitter.py` constructs its eight-instruction notation.
It emits algorithms; it does not receive user programs or compute a particular
city's result. This is not self-hosting.

The following sources are compiled and executed inside that BF program:

- `programs/workspace.thread`: source storage, module-profile tokenization,
  compilation, exact dependencies, schemas, publication, references and arena
  reclamation.
- `programs/process-state.thread`: contexts, identities, private state, messages,
  process creation, waiting, suspension, repair and termination.
- `programs/processes.thread`: module-instruction interpretation, continuation
  storage and the native scheduler with bounded execution turns.
- `programs/industry-state.thread`: stock, jobs, the graph, reservations and
  ownership.
- `programs/industry.thread`: ordering, cargo transfers, production, construction,
  van assignment, resumable Dijkstra and road-access priority.
- `programs/industry-view.thread`: actual presentation output and checked
  administrative requests. `industry-boot.thread` supplies raw initial data and
  editable programs; BF accepts and compiles all of them.

The process interpreter is therefore written in Thread, with the BF kernel
executing Thread itself. JavaScript does not interpret Thread. `dist/engine.mjs`
and `wasm-engine.mjs` execute BF generically; `runtime/executor.wat` accelerates
the same generic operation stream. Merged pointer movements and equivalent loop
optimizations do not recognize factories, module names or messages. Equivalence
is also checked against a literal reference interpreter.

JS also handles raw input/output, local editor drafts, object selection, files and
drawing. `industry-presentation.mjs` decodes native records;
`industry-scene.mjs` renders them. It may interpolate between two positions
already observed; it does not compute the next route or stock quantity. Trees,
lights and materials are decoration. Offset numbered vehicle markers are not
invented queue positions. Occlusion is schematic, not continuous traffic physics.
An image-generation tool created the graphical assets; `assets.json` records
their provenance. No model API controls the running city.

Host-side measurement, test and reproduction tools are not imported into the
production computation path. There is no host-side scheduler, broker, guest-object
allocator or route solver. `boundary.json` lists and justifies all exceptions;
`host-boundary-self-review.md` contains the same author's review. The only npm
dependency is the pinned WABT build tool, not a runtime simulation library.

## Dialect and fixed capacities

Cells are wrapping unsigned 16-bit values; input and output use bytes. Empty live
input pauses the machine; explicit EOF supplies zero. A dot outputs the low byte.
Moving outside the tape is an error. The eight instructions are unchanged;
portability to an 8-bit dialect is not promised.

The current kernel has 398704 cells, or 797408 bytes of BF tape. This is not total
host-process RAM. Capacities are 512 resident dictionary entries, 24576 resident
code words and 24576 workspace words; 16 process contexts of 256 words each;
64 stack values, 16 return frames and 16 private words per process. A mailbox holds
four messages. The expanded profile has eight modules and 16 arenas, each holding
at most 512 source bytes and 256 module-code words. The original smaller profile
remains for regression tests. Jobs have 16 reusable slots. The map has 16 nodes
and 46 initial directed roads, with a limit of 48.

Context slots, messages, jobs and arenas are actually reused. A new lifetime's
identity is not its slot address. Lifetime identities and logical time stop
allocating at 65535; they do not wrap into an old identity. Some diagnostic
16-bit counters may wrap. Generic host BF-instruction counts use exact BigInt
epochs and do not affect guest semantics. Resident general Thread definitions
remain monotonic: universal reclamation of an arbitrary heap is not claimed.

## Scheduling, protection and messages

Every round visits slots in the same order. A process receives at most 1–32 module
instructions; the generic default is 8 and the city uses 32. A root-function
return, yield, wait or fault may end the turn earlier. The PC, stacks, return
versions, waiting state and private data are preserved. An infinite loop without
yield therefore receives further bounded turns while other eligible processes
continue to receive theirs.

Helper-operation cost is bounded by capacities: at most 16 contexts, 16 jobs,
48 edges, 16 nodes or 16 versions. Dijkstra continues in phases. This does not
promise equal wall-clock time per turn or a real-time scheduler; logical fairness
is different from measured UI responsiveness.

The process compiler permits only a checked profile. `state@`/`state!` check the
process's own index, 0–15, inside BF; role operations verify ownership. A process
cannot access arbitrary tape addresses, the scheduler or the module manager.
The privileged Thread terminal is labeled separately. An owner who overwrites
their own tape deliberately bypasses this protection; a snapshot is not a security
sandbox against its owner.

The mailbox is FIFO. `send` returns 1 for acceptance, 0 for a full mailbox, 2 for
an unavailable recipient and 3 for exhausted identity space. `recv` removes one
message. Suspension preserves mail; `wait` waits only when the queue is empty.
Combining `sleep`, `pending` and `recv` allows a native program to implement a
timeout. Sending to a faulted or terminated recipient is rejected. A repeated
send is a new message, so the industrial protocol uses a stable job ID and phase
to deduplicate the actual transfer.

## Material, transport and failures

The invariant is: raw material in buildings and vehicles plus twice the panels
in buildings, vehicles, production escrow and completed construction equals 96.
`industry-account` independently sums that account inside BF. Cargo pickup and
delivery update both sides in one native operation; another process cannot enter
it. Pausing the generic BF executor inside that operation preserves the exact
unfinished instructions instead of restarting the transfer.

The dispatcher selects the nearest idle van using a bounded Manhattan-distance
heuristic. This is not globally optimal fleet scheduling. The route itself uses
Dijkstra with cost `time + toll × weight`, where weight is 0–16. A pair of opposite
road directions shares capacity for one vehicle. A van's program can set
`priority` from 0–9. A higher priority with a current entry request takes precedence
even over an earlier slot; an old request expires after a round. A stopped or
looping program therefore cannot hold an empty road through a stale request.
Priority does not evict a vehicle from a journey already in progress.

Closing a road prevents new departures. A vehicle already on a segment completes
its captured travel time and releases the reservation on arrival. A fault
preserves private state, cargo, the job, reservation and queue. Independent work
continues; dependent work may wait for repair. Continuation repair is explicit
and repeats notifications according to the native job phase without duplicating
material. Retiring a participant is rejected while it still owns something.

## Replacement, controls and persistence

The editor distinguishes three states: an unsaved local draft, source stored in
BF and the active compiled version. Apply sends raw bytes; BF stores the source
and compiles it. The factory's numeric control sends a value to `parameter!`.
BF checks the revision and unique `batch#` marker, changes that literal, stores
and compiles the source, then publishes the new version. The host neither parses
the text nor replaces the user's program with a template.

Publication occurs at an input boundary while process continuations are retained.
Suspended frames keep owning the old version; the next root invocation adopts
the new version. A route in progress holds its own pin. One rollback version and
live references retain old code; other arenas can be reclaimed. Invalid
compilation preserves the last active program, even when the stored draft remains
invalid. Rollback restores active code without rewinding the world. A different
declared `schema#` is rejected. A matching number does not prove that a custom
program treats its own data sensibly.

Export includes the tape, raw BF instruction position, input buffer and executor
state: sources, versions, processes, mail, timers, stock, reservations and work in
progress. Import is attempted in a new candidate machine; an invalid snapshot
does not destroy the original usable world. Event history is not fabricated from
a snapshot. Build 001/002 retain their matching old kernels; incompatible imports
into Build 003 are rejected.

## Concrete evidence

`process-literal-reference.txt` records a literal replay of BF send/wake behavior
and a one-instruction process turn from a natively produced snapshot. It compares
the entire tape, PC, pointer, output and instruction counts. This does not replace
literal execution of the entire city. `legacy-and-work-cycles-tests.txt` checks
450 lifecycles with messages and work using 16 slots.
`industrial-capacity-waiter-tests.txt` covers live cargo, replacement, rollback
and hundreds of job lifetimes. `industry-priority-tests.txt` checks arbitration,
expiry of a looping participant's request and invalid inputs. All original 76
regression tests are retained.

`browser-cli-parity.json` confirms an exact match between the first 11 actual
browser inputs/outputs and a fresh CLI instance of the current kernel. Separate
browser records capture custom source, an invalid version, rollback, an infinite
loop, repair and private state 7. These are bounded, reproducible checks by the
same author.

The comparison in `reproduction-results.json` runs 64 identical logical rounds
from the same snapshot with the same open roads. The only change is one factory's
batch size: Riverside uses 3 versus 5. The first variant has 7 deliveries,
14 completed production units and 3 installed panels; the second has 6 deliveries,
16 completed production units and no installed panels yet. Both preserve the
account of 96. These are state results for two rules, not measured wall-clock
speedups.

The complete candidate suite passed 113/113 tests without failures or skips in
974272.576875 ms (`verify-candidate-01.txt`). The attached ZIP was actually replayed
in a fresh CLI instance.

Measurements (`metrics.json`, `measurements.md`): Apple M5, 10 logical CPUs,
32 GiB RAM, macOS 26.6.2 (Darwin 25.6.0), Node 22.22.0. Three fresh BF bootstraps
ran in one host process. Medians: cold BF boot 34.663 s; first round 2.152 s;
standalone presentation output 1.362 s; source change/compilation 3.126 s;
message 27.65 ms; rollback 9.45 ms; export 20.67 ms; import 53.65 ms.
Twenty message-and-reclamation cycles took 11.431 s. Peak host-process RSS was
484.84 MiB; the BF tape separately occupies 797408 bytes. Routing and production
are measured as complete rounds containing other work, not isolated algorithm
calls. Visual smoothness is not presented as simulation speed. The public
functional version passed the checks in `public-verification.json`.

## Completed world and interface

The current default world completed both stations in CLI round 183. A separate
browser experiment with a custom fault, repair and van suspension completed the
second station in round 164; the observed round-173 snapshot was actually restored
in a fresh instance. This is not a speed comparison: the input sequences differ.
See `completion.md`.

A separate real queue behind a suspended van preserved the waiting vehicle's
3 panels. After resumption, the holder released the road in round 62 and the
waiting vehicle departed in round 63. The 1487 × 1058 screenshot was checked
beside the design and in an overlay. The actual graph layout differs; pixel
matching is not claimed. Keyboard, focus, 390 × 844 layout and reduced motion
were checked within the stated scope, not as full accessibility certification.

## Actual BF excerpt

`bf-excerpt.txt` contains the first 720 instructions of the native tokenizer in
the current artifact, at zero-based offsets 60912–61631.
`tools/extract-bf-excerpt.py` regenerates the kernel, checks complete byte equality
and stores provenance/hash in `bf-excerpt.json`. The excerpt clears token state,
prepares working cells and starts reading an input byte and checking for a
comment. It is neither a standalone runnable program nor a routing excerpt.

```brainfuck
>>>>>[-]>[-]>>>>>>>>>>>>>>>>>>>>[-]>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>[-]>[-]>[-]<<[-]+>>[-]+++++++++++++++++++++++++++++++++<<[<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[-]>[-][-]>[-]<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>+>+<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<]>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[-<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<+>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
```

## Identity and traceability

The final implementation commit is
`f9ca7e5cdb5e9f450aeeb2dbe38413a7716d735f`. Later record changes are tracked
separately; a commit alone is not proof of public deployment.

- BF kernel SHA-256:
  `c6ee32e0f2f54738f1574b612dfe85c619d691285dc40af870f96d8e0e28558c`.
- Native platform sources SHA-256:
  `e10c7d82a680129247929d9bd2f57dabf7bf5614e183e265c75531d698783e86`.
- Initial snapshot, zero scheduler rounds, SHA-256:
  `18b27dc6dca3e1ca1fa1904ce36ba5ec0383b1ec281312de6bc58716f42c4f04`.
- Reproduction ZIP SHA-256:
  `29ce759a2337a235611a3b2dc44afbb641345dc119d94f21b4d89be33a566a02`.

The initial snapshot was produced by actually compiling all sources inside BF
and accepting initial data. It contains no precomputed routes, completed
production or city solution. `initial-image.json` and the verification build
record its provenance.

`site-package-functional.json` binds public files to the implementation commit
and the hosting provider's separate Git history. `site-saved-functional.json` and
`deployment-functional.json` identify saved and actually deployed version 5.
`public-assets-functional.json` anonymously verified 145 files: 142 exact matches
and 3 HTML files with their original content preserved and only a hosting
protection script inserted. `public-verification.json` records a custom change,
rejection, loop, repair and fresh import; the publicly downloaded ZIP replayed
identically in two fresh CLI instances.

Both hosted CI runs, 35042602081 and 35042596203, passed 114 tests with no failures
or skips at commit `ebc956d6cad5c071592e8ce58ace2371435c0a1e`. This later commit
changes CI orchestration and evidence, not the kernel, application or renderer.
The normal merge of PR 3 is `ab8275256273ec4f009d01de9d88ccc67652026f`. The release
asset `final-deployment.json` binds the final metadata commit, tag and closing
site projection. These differ from the functional deployment and are not
presented as the same Git SHA. See `release.md`.
