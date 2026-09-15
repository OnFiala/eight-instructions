# Build 003 journal

- 2026-09-15: Owner supplied and authorized the complete Build 003 implementation
  challenge. Sole Astra xHigh; no subagents, no human production code.
- Read project protocol, architecture, language, module/persistence/boundary
  contracts, prior verification and publication records. Loaded CORTEX brainfuck
  context and checked canonical repository/remote identity and concurrent tasks.
- Initial GitHub check failed at sandbox DNS; approved network execution succeeded
  without account or permission changes. Local branch and remote main match the
  released Build 002 hash. Created build-003-development; started all 76 baseline
  tests, with output retained in baseline-tests.txt. Result pending.
- Recorded native process ownership and first milestone invariants before code.
  Public site is unchanged; all Build 003 completion gates remain open.
- Initial seven process tests PASS, including three distinct communicating programs,
  infinite-loop preemption, private bounds faults, saved old-version continuation,
  full mailboxes, stale handles, all16slots and450 create/stop/reclaim cycles.
  The450-cycle test retained resident code/dictionary at9987/203 and ended with no
  live processes or versions after deletion. These timings ran with other tests;
  they are validation evidence, not isolated performance measurements.
- Baseline suite completed76/76 PASS in615791.263458ms. The command started before
  source edits; later implementation work ran concurrently. Final exact-artifact
  regression checks are still mandatory.
- Added configurable native workspace layout, selected only before first use:
  the original4/6/256/128 limits remain the default; the industrial profile selects
  8modules/16versions/512source/256code. No live layout change or reset is offered.
- First enlarged kernel draft (32K resident code,32K workspace) emitted102490842 BF
  commands and was refused by the existing100MB decompression limit before tests
  could start. Preserved failure in expanded-native-tests.txt. Reduced reserved
  capacity to24K resident code and20K workspace, sufficient for the17920-word large
  module layout plus2560words reserved. Kept the host decompression limit intact.
  Dictionary capacity becomes512; its capacity test still fills the complete
  declared region and verifies refusal/recovery. Workspace boundary tests likewise
  probe the actual declared upper bound while retaining old addressed checks.
- Revised kernel94105690commands/373964cells loaded within the unchanged100MB
  host limit. Expanded native retest passed13of14. The remaining nontermination
  regression reached the host's1e14 literal-work pause before the native1024-op
  refusal, due to the larger tape and pointer travel. That one test now supplies
  2e14 host fuel to observe the same native refusal; no guest limit was weakened.

## Industrial continuation and measured addressing repair

The first industrial prototype ran12native processes and preserved its material
ledger and unfinished image state (industry-initial-tests.txt). Cold boot and
round times were too slow for the intended interface. Added BF-owned page
translation caching, bounded native hot-register allocation and generic checked
waddr; preserved the existing host executor. Contexts moved to a separate workspace
region. The first boot exposed three remaining store accesses (!E3), now corrected
to workspace accesses. This failed attempt is retained in industry-paged-smoke.txt;
all3tests of industry-paged-retest.txt passed. Both generic address-cache tests
passed, including page eviction, invalid pointers, upper bounds and a fresh image.

One chosen visual target and three isolated image-tool building assets are recorded
in reference/,asset-prompts.json and assets.json. These are graphics, not native
computation or evidence of a completed interface. A long CLI workload now records
actual native orders, inventory, trips and construction progress. No release or
public deployment has occurred during this work.

## Process reclamation, long counters and first real interface

The paged-context rerun passed8/8 tests (processes-bounded-retest.txt), including
450create/stop cycles at fixed16-context capacity. The preceding single giant
command exhausted its host fuel allowance, not native capacity. Nine50-cycle
commands now preserve the same machine and allocator across the full test.

The600-round initial industry probe conserved all96 material units but installed
only12of16 station panels; it is not completion evidence. It reached8.2976e15
BF instructions, close to JavaScript integer precision. Generic JS/Wasm execution
now rotates exact per-run numeric counters into BigInt epochs. No guest memory,
PC or operation semantics change. Images retain optional decimal epochs; worker
fuel deltas use exact totals.16executor/image tests and the actual worker test
passed. Seeded counter-boundary tests do not claim physical execution of9e15steps.

An actual browser control changed the factory batch3to5, stored and compiled
insideBF, with active version7 shown beside the real source. Screenshot retained
as native-batch5-source.png. This is one interaction check, not full visual QA.
Additional industrial graphics are original image_gen assets with recorded hashes.
The local UI is still a development version.

A declared schema marker is now validated on publication. Twelve rejected schema
updates preserved the suspended process, queued message and live memory. Scheduler
slices are configurable1..32 by a checked native administrator word (default8,
industrial32). The native city now chooses a nearby free van with a bounded
Manhattan pickup heuristic; actual trips still use native weighted Dijkstra.
The eight-slice nearby-dispatch probe was deliberately stopped after early rounds
to measure32-slice behavior. No completion was claimed.

Native presentation now computes field bases once, preserving its output. A BF-built
outgoing-edge index replaces scans of unrelated roads during Dijkstra and path
following. One bounded route operation can choose and relax one vertex. This changes
logical route-planning latency; new comparisons must use the same revised kernel
and source in both branches. Old diagnostic probes remain separate.

An adversarial stack test initially used unsupported direct module recursion and
was refused by the compiler. The actual contract is an immutable dependency DAG;
the corrected runtime overflow test builds a chain of exact old/new A/B versions.
First two new tests passed; corrected stack test and final suite remain pending.

The corrected exact-version stack overflow test passed (process-stack-retest.txt).
The parser now skips length-framed source when recognizing kernel errors and
validates industrial record arities; all6parser tests passed. UI now exposes
unattached source modules, deletion, restart, shared-program scope and private
state. Failed new-module compilation asks BF to release its just-created unused
module, while retaining the form draft. These UI paths still need browser QA.

Concurrent diagnostic probes initially shared a development checkpoint pathname.
Their text logs remain distinct, but that shared image is not accepted as evidence
of any particular probe. New probes write unique per-run directories recorded in
their log header. The adjacency-only probe stopped at63rounds with3station panels
installed and material account96; the earlier32-slice probe continues separately.
No final benchmark is being inferred from concurrent development workloads.

Checkpoint before further generic BF-kernel performance work: industrial source,
assets and working UI are implemented, but the complete scenario, native adversarial
coverage, final performance, visual quality, boundary review and release remain
open. PublicBuild002 and both historical tags remain unchanged.

## Native performance iteration after checkpoint b16d6a0

Added a fast arithmetic path in the Thread process interpreter, avoiding checks of
all actor-only words for ordinary arithmetic. Added native pending-dispatch counts
and early exits in unique-handle lookups. Both are BF-owned; no host computation
was substituted. Updated frame arity to include pending source jobs.

The subsequent generic kernel revision emits one-hot Thread primitive dispatch
and bounded workspace output.19targeted tests passed (kernel-dispatch-tests.txt
andworkspace-output-tests.txt). The new artifact identity is in
kernel-native-dispatch-build.txt. Final measurements and industrial checks are
pending; the old long probes keep their original loaded kernel and source.

### Current-native completion and same-author review
The stock-aware source completed both stations at round183 with all96raw-equivalent units accounted for (`industry-stock-aware-probe.txt`). This concurrent development probe is functional evidence, not an isolated latency benchmark. The earlier native-dispatch-only probe was interrupted after203+rounds once this stronger current-source result was available; its partial log is retained. The two protocol/image tests and three workspace-output/cache tests passed.

Review then found a real pause/resume corner case: a mailbox waiter paused before a message arrived would resume into waiting despite nonempty mail. `process-resume` now makes that particular continuation ready; a regression exercises pause, enqueue, resume and actual consumption. SEND/RECEIVE now emit the actual executing version serial; external administrator sends use0. Sources changed while `regression-current-01.txt` was running, so it is an intermediate regression result, not the final release gate.

### Source panel and CLI diagnostic framing repair
The actual browser import restored round19, production escrow, source and controls; a double click published only version7 while object selection remained available. Follow-up review added revision-bound source caching. Its first implementation incorrectly treated the sole `VERSION-SOURCE` header number as a version serial; that number is source length. Browser verification caught a disabled editor. The fix binds cached source to the native WORKSPACE version/draft revision observed at the serialized input boundary and clears stale text while reading. The raw BF source-frame contract is unchanged. Diagnostic decoder fixtures now use its actual one-number version header.

The CLI previously mistook diagnostic-looking text inside raw source output for a real error. A streaming display-only decoder now skips opaque SOURCE/VERSION-SOURCE bodies even across output-budget chunks. Unit and actual fresh-CLI tests exercise source text containing `!E3`. Historical evidence-generation tools now refuse a different kernel identity before they can overwrite Build001/002 measurements or reproduction files.

### Passage arbitration and exact browser replay
Added native van passage priority0..9 and a bounded peer scan. A recent intent
expires after one logical round; a looping or paused high-priority program cannot
hold an unoccupied road through stale intent. All three priority tests passed.
The current raw platform source digest is e10c7d82a680129247929d9bd2f57dabf7bf5614e183e265c75531d698783e86.
The zero-round image was rebuilt from actual BF compilation, without kernel changes.

The browser accepted a custom factory program, retained its draft across object
selection, refused an overlong token while retaining the active version, and
rolled back explicitly. This first interaction capture predates the priority
boot-source change and is kept separately. A new current-image browser instance
then ran nine industrial rounds; its first11inputs/output pairs replayed exactly
in a fresh CLI BF instance (`browser-cli-parity.json`). No host simulation or
recorded event playback is used by the live application.

One earlier hidden-element capture was empty because innerText was used. It is
explicitly marked as a capture failure; subsequent raw evidence uses textContent.
The full candidate regression run includes the original76tests plus new process,
industrial, literal-reference, capacity and framing checks. Result still pending.
