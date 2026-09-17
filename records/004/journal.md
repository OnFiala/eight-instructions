# Build 004 journal

## 2026-09-17 — preflight and first native design

Verified sole Astra xHigh execution identity, clean checkout, matching remote main,
absent release tag and no open PR. Read native contracts, memory and prior evidence.
Copied the exact English challenge before implementation. Opened actual public
Build 003 and inspected the approved Living Dispatch reference with matching hash.
Created `build-004-development`. Chose native full-context trials and a city-first
zero-click composition. No production code has passed the first native milestone.

Environment failures: ordinary shell GitHub DNS unavailable; approved network
read succeeded. Hardware sysctl refused by sandbox; hardware facts remain pending.

## Generic native context prototype

Added four interleaved value contexts to generic heap/workspace storage, with
`context-copy` emitted entirely as BF. Existing addressing still accesses context
zero; a streaming native copy preserves the source and all other contexts. The
controller store, resident code and interpreter continuation are deliberately
shared. No host trial orchestration was added.

Initial generator produced 117,958,601 BF commands and 890,258 tape cells. Fourteen
kernel regressions passed, but the CLI loader's 100,000,000-byte decompression cap
refused the larger artifact before workspace tests. Raised that generic bounded
ingress cap to 128 MiB, not an unbounded limit. Revalidation is pending. The first
context emitter assertion passed; the initial literal comparison accidentally
passed `optimize:false` to the machine instead of `compile`. Corrected before
recording literal evidence; the earlier run is not literal-reference proof.

## Native generation and first automatic acceptance

`context-tests-02.txt`: 5/5 targeted tests pass after explicit context clearing.
Current kernel: 122,619,353 commands, 890,262 cells, SHA-256
`9b72a82b39d7edb711911db516e272ef72ddcb14d91268766799bd28452ff21f`.
Measured host through Node: Apple M5, 10 logical CPUs, 34,359,738,368 bytes RAM.

`synthesis-tests-01.txt`: 2/2 prototype tests pass, including a real no-improvement
result retaining the baseline (equal score17661). The initial unguarded program
was identical to the baseline in that input. This is retained as failure-to-improve
evidence, not retrospectively relabeled as a successful search.

Code inspection found that guarding the original combined `work` could stop both
production and offering already available stock. Split native production and offer
into role-checked `make`/`offer`, preserving original `work` behavior. This permits
real action composition rather than suppressing required delivery work.

`synthesis-tests-02.txt`: 2/2 pass. Native ordinal5 is a new stock conditional
around request/production, with offer/dispatch outside it. Baseline/candidate start
from the same checkpoint and each run32logical rounds. Both install2panels. Baseline
raw2 versus candidate raw10; both conserve18raw-equivalent units. Scores17661 and
17669. BF automatically copies only the generated source and compiles/publishes it
in the live world at round16. No trial inventory is imported. Trials run at most
four rounds after each full live round. This is a narrow prototype acceptance,
not completion of the adversarial milestone or release.

Subsequent unverified edits add manual source ownership, protected observation and
a32-entry native result ring. They require new targeted tests. The initial boundary
audit properly refused the two unclassified raw-source distribution copies; those
must be inventoried before the next commit. No gate was removed.

## Fresh validation and stale-result case

The search now starts an additional native checkpoint at the current live state
and tests baseline/winner with a withheld road closure (trial rounds4..6) followed
by reopening. Both use the same16-round validation horizon. In test03 the candidate
passed validation17670versus17662, but the live two-panel goal had already completed
by publication round24. BF correctly rejected it as stale (decision3). The test's
expectation of publication was wrong after adding validation. The raw failing
assertion remains in synthesis-tests-03.txt; the accepted-case fixture now requests
three panels, leaving real work to improve. No stale-result guard was weakened.

Added native road/topology epochs and all-module version assumptions. A process
now records successful root returns and their logical round; candidate liveness
checks reject a nonreturning root even when preexisting cargo completes useful work.
The actual actor whitelist remains separate from privileged context/supervisor
operations. Further tests pending, including custom sources and bounded cleanup.

## Resident capacity repair

The growing trusted controller exceeded the former24,576-word resident code arena.
Test04 and adversarial01 correctly failed on native `!E5`; their later cascaded
top-level diagnostics are not successful boots. A dedicated probe records the code
frontier and dictionary usage in resident-capacity-failure.json. Increased only
the fixed resident code capacity to32,768words. Candidate version arenas remain16,
source512bytes, code256words, processes16and messages4perprocess. New kernel is
133,240,921BFcommands,939,414cells, SHA-256
`b5dd8d443fcabdb5aa8303e0c50bd9914ce778b45f1e7345784678931f442dd8`.
The bounded generic CLI decompression ceiling is now160MiB. No guest algorithm
moved into the host. Full regressions and the enlarged native prototype are pending.

The first literal context reference invocation refused the larger BF input at its
separate100MBsource-size guard, before executing the requested operations. Raised
only this test interpreter's source ingress bound to the same160MiB. Its literal
eight-command execution and instruction limit are unchanged. Receipt retained in
context-literal-reference-01.txt; retry pending.

`synthesis-tests-05.txt`:6/6native synthesis/adversarial tests pass on the32Kresident
kernel. Includes generated structural acceptance after fresh held-out validation,
manual ownership and stale road epoch, looping custom source with live production,
pending-search image parity, forbidden capability/schema/division rejection and
parked-live isolation under trial mail/data writes. Live publication at round24;
selected search score17669vs17661and validation17670vs17662. These are functional
scores on a small three-panel test district, not a performance improvement claim.

`native-regressions-01.txt`:17/17preserved process, process-adversarial and industry
tests plus new context tests pass. `context-literal-reference-02.txt`:1/1passes,
16,128,661,650literal commands for copying and16,116,753,679for clearing, with whole
tape/continuation/counter equality. `synthesis-goal-rollback-01.txt`:3/3passes,
including native goal choice and protected fault rollback preserving inventory.

The320-cycle stress attempt reached40reported cycles with reclaimed contexts and
fixed arenas before the author interrupted the owned test via its exec session.
It is incomplete, not320-cycle proof. Inspection identified unnecessarily high
linear store addresses for hot supervisor fields. The controller had been placed
at1024despite this profile not loading the Build001database. Relocated its hot
fields to0..126, allocator cursor127, grammar metadata128, terminal bytes160,
generated source512, retained winner1024and result ring1536..2559. This changes
only native Thread data layout; no operation moves to the host. Retest and a fresh
320-cycle run are required before claiming speed or long-run acceptance.

## Native integration and first browser surface

The lower common-store layout passed7/7 tests. Shared scheduler construction
passed2/2 (180actual live rounds): new factory7produced material and vehicles used
the newly material-built road. A completed trial branch did not import its future.
Capacity and placement refusals retained the live ledger. Three synthesis tests
passed again with the shared construction hook present.

The literal BF source exceeded GitHub's documented100MiB tracked-file limit.
No push was attempted with it. The current tree now tracks deterministic gzip,
layout and auditable generator; the raw source is ignored and losslessly
materialized for literal tests. Historical Git objects and tags remain untouched.
The boundary audit explicitly decompresses and checks the released eight commands.
Source: https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github

A new image-only composition target was generated from the approved Build002
reference, at records/004/reference/autonomous-living-dispatch.png. Generated by
the built-in image tool, not a screenshot or runtime asset. Existing architectural
assets remain the real renderer's components. No generated mockup enters runtime.
The first local1487x1058browser started without clicks, restored the boot-only
image and advanced to native experiment1. Visual QA and release remain pending.
Local preview required an approved sandbox escalation to bind127.0.0.1:4178.

## Browser persistence, stress completion and same-author repairs

The 320-cycle run completed with one passing stress test in 2,424.7 seconds.
It exercised fixed-capacity generation, compilation, rejection, context zeroing
and eight pending-search exports/restores. The earlier interrupted run remains
in the record. This is finite local evidence, not an unlimited lifetime claim.

The first untouched browser accepted native candidate 5 at live round 25 after
search and fresh validation. Its later live world built factory 7 and road 32 at
round 37; search 2 found no improvement at round 73 and retained the baseline.
These observations precede the final source freeze and are identified separately.

Same-author review extended protected observation to faulted peers sharing the
published module. A new assertion injects a peer fault while the selected factory
is healthy, verifies native rollback/repair, and verifies unchanged material.
Three synthesis tests passed after that repair.

An actual browser export at round 3 retained its pending search. A new browser
worker restored the downloaded image and advanced. Fresh CLI reproduced five
inputs from initial boot and three inputs after restoration byte for byte.
The file download event hook timed out although the real file existed in Downloads;
filesystem and subsequent real import provide delivery evidence. Invalid JSON
import retained the old round-4 world and closed bridge, but its error was hidden
inside the closed inspector. Moved error feedback to a visible live status surface.

Construction preflight now refuses odd directed-road counts and a pre-existing
connection in either direction. Adjacent directions share a native reservation
counter, so appending into an incomplete pair would otherwise attach unrelated
occupancy. Targeted tests preserve all installed material and allocate nothing on
refusal. Measurement attempt 01 was interrupted before completion to make these
repairs; its empty/incomplete output is not a timing result.

The object inspector now moves keyboard focus to its close control on opening and
returns it to Inspect on closing/Escape. Browser verification and final visual
comparison remain pending at this journal entry.

Three sequential measurements then completed with native acceptance at round 25
in every run. Their full receipt is `metrics-before-final-guards.json`; a later
review added an unsigned-score supply bound and corrected peer repair to use the
process handle even when that peer has no industry entity. The kernel is unchanged,
but these timing samples retain their original source identity and are not silently
relabeled as final-source measurements. Corresponding tests were added. A full
local suite is now running with all original 114 test definitions unchanged.

The narrow screenshot capture initially mixed emulator density and native browser
size. Two invalid captures are retained. A 780×1688 PNG from 390×844 CSS pixels at
scale 2 provides correct evidence. Inspector focus opening and Escape return passed;
its inherited intrinsic height exceeded the viewport, so dynamic viewport height
and internal scrolling were added. The mobile stage was shortened and targets
enlarged. Build 004 screenshots returned as JPEG by the ordinary screenshot API
were renamed to `.jpg` without changing their bytes.

## Compatibility regression and exact pending-continuation import

The first full retained regression run failed the unchanged diagnostic-stream CLI
test: the new initial profile had renamed module1 from factory-west.thread to
factory.thread. Restoring the canonical old name and byte-framed source lengths
fixed the contract; image05 was rebuilt and both diagnostic tests passed unchanged.
The reproduction loop uses the same compatible root name and now explicitly
requires MODULE-PUBLISHED before its rejection, excluding compile-refusal evidence.

The real browser round81 image, exported during a BF operation, resumed that exact
operation to round82 in a new worker. Search3, installed material, cargo and the
closed road survived. Its initial native frame and source output matched a new CLI
instance byte-for-byte (browser-cli-restored-paused81-parity.json). The old pending
host bridge click did not cross image installation. Earlier image04 receipts are
retained under their actual hashes rather than relabelled as finalimage05 evidence.

## Final local visitor and control evidence

Final image05 ran from round0 with zero visitor native inputs. BF accepted structural
candidate5 at25 (search17689→17699; withheld17690→17698), constructed factory7 and
roadpair32/33 at37, rejected equal-score searches at73 and97, and emitted completed
GOAL2. UI stopped at97 with both sites3/3 and9deliveries; no console errors. The
observed completion upper bound834226ms includes concurrent test/replay load, not
a quiescent benchmark. The exported completed image was restored for final QA.

Real UI checks verified draft switching, invalid compile retaining activev5, manual
v6 publication/rollback to5, explicit ownership opt-in, loop pause/source replacement/
continuation repair followed by private-state0→1, invalid import preservation with
visible feedback, and queued bridge change after exact BF resume. Reduced motion
allowed native rounds66→69 without interpolation or console errors.

Direct ZIP links in IAB produced no actual file. Fetching the same bytes into the
existing Blob download fixed delivery: GUI download matches finalZIPe3a4e577... .
The anonymously downloaded identical package replayed61success+13compiled-loop
inputs in new CLI instances. Its loop assertion requires actual MODULE-PUBLISHED,
so a compile refusal cannot masquerade as a looping rejection.

Final visual review found and fixed mobile camera overlap and nearby van callout
collisions. Labels moved only in presentation and retain connectors to observed
positions. Desktop1487×1058, tablet820×1180 and mobile390×844 were captured. Mobile
inspector top12/bottom832 and internal scrolling expose the final control at812.93.
Paired, overlay and unscaled header comparison all use exact source/browser pixels.
CDP tiled/underscaled captures remain labelled invalid. Rootdesign-qa now passes
local visual/interaction scope; this does not close CI or publication gates.

Artifactcheck02 reproduced finalimage05 but the concluding review gate caught a
concurrent mobile-rendering hash change. The reviewed renderer and subsequent
boundary-development09 pass337classified sources. Targeted UI parsers pass5/5.

## Local acceptance closure —2026-09-17T21:30Z

The complete local run ended129/130 with only the known original boot-name
compatibility failure. Restoring factory-west.thread produced final image05 and
the unchanged original test passed2/2. All114prior test files remain unchanged;
130unique tests are covered. Final UI parser checks5/5. Both local worlds stopped
at97 and all native replays/tests finished before three final sequential timing
samples. All three actually publish candidate5 at25; final metrics.json records
the quiescent task conditions and observed variation. Local acceptance is closed.

Final browser evidence shows acceptance25, paid expansion37, rejected equal-score
searches73/97 and finite completion97 with no visitor input. Advanced edits,
rollback/opt-in, loop repair, visible invalid import, queued bridge/resume, actual
export/import, keyboard/reduced motion and three viewports pass. Actual GUI ZIP
delivery matches final package and a freshly extracted CLI matches61+13outputs.
Temporary viewport/media overrides have been cleared. Fresh hosted CI, normal
merge and the existing public Site release still remain; no completion claim yet.

## Release evidence identity —2026-09-17T21:40Z

The immutable-tree artifact command now passes in full (artifacts-check-final.txt).
Corrected one wording error:114retained tests live in33unchanged test files, not
114files. Runtime sources and behavior are unchanged.

The committed build status describes local implementation acceptance explicitly.
Final external CI, merge/tag, Site projection/version/deployment, anonymous asset
and behavior evidence will be bound in the immutable final-deployment.json GitHub
release attachment after observation. This avoids self-referential commit hashes
or a second deployment solely to record the first deployment. No external PASS is
implied before those gates complete. The first CI runs were started on2c58127; a
final evidence wording commit supersedes that head and receives fresh CI. Cancelled
superseded checks are not counted as passed.
