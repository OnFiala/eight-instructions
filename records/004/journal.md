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
