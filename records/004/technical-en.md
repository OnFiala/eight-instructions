# Build 004: programs that construct and test programs

Build 004 extends the existing Brainfuck (BF) machine with a bounded native
synthesizer. It generates Thread source, compiles that source, runs isolated copies
of the actual city, scores the results and can publish a useful rule automatically.
The live city also consumes real material to add a working factory and a road pair.
Release status and exact verification identities are in `build.json`.

## One concrete change

The original factory asks for material, advances work and dispatches deliveries.
The grammar can instead construct this body inside BF:

```text
2 stock 1 < if 1 request make then offer dispatch
```

That reads panel stock and puts material requests and production inside a new
condition. Offering existing stock and dispatching remain outside it. The receive
and acknowledgement prefix is preserved as a grammar production. This is a new
control structure, not a host-selected complete program or a changed coefficient.
The exact emitted module, input checkpoint, compiler version and trial output are
in the downloadable reproduction JSON. This example is not a universal best rule.

The language contains four action structures and four values: sixteen possible
programs. Their deterministic order is 5–16, then 1–4. A normal page search tries
one candidate over 32 logical rounds; the privileged interface permits 1–16
candidates and horizons of 1–64. At most four searches run automatically. There
is no external model call, random answer selection or cross-search deduplication.

## Four worlds on one tape

The generated BF kernel has four value contexts for its heap and workspace.
Context zero executes. Context one holds the checkpoint, two parks the current
live world during a trial, and three retains a suspended trial. The generic
`context-copy` and `context-zero` operations themselves execute as BF loops.

Every world owns complete copies of sources, compiled version arenas, reference
counts, process frames, mail, inventory, jobs, reservations and construction.
Resident compiler code is shared and immutable during evaluation. The supervisor's
separate common store contains its grammar, budgets, score and result ring.
Actor source cannot address that store or invoke the world-copy operations.

One native `autonomy-step` runs a complete live scheduler round, then at most four
trial rounds. Both use the same `process-step`, including the same production,
messaging, path search and construction code. An actor loop gets its normal bounded
quantum. There is no cheaper JavaScript trial city.

Baseline and candidate use the same checkpoint, exogenous inputs and horizon.
Positive scoring requires useful installed material, conservation, no process
fault and a returning candidate root. Scores reward installed panels and remaining
raw material and penalize unfinished jobs and cargo. The exact bounded arithmetic
is documented in `docs/synthesis.md` and implemented in `programs/synthesis.thread`.
Equal or worse scores keep the earlier baseline. These are logical scores, not
wall-clock speed claims.

## Publication has a second gate

After search, BF checkpoints the current live world again. Baseline and winner
receive an additional closure of directed road 0 at trial round 4 and reopening
at round 7, over a horizon no greater than 16. The winner must still make useful
progress and score at least as well as this fresh baseline.

Before publication BF checks all module versions, selected draft revision, road
epoch, unfinished goal and ownership. A stale result is rejected. A winner copies
only source into the live compiler. Its future buildings, stock and vehicle
positions never enter the live city. Existing calls retain their exact old version
until return; new invocations adopt the publication.

A protected observation period pins the prior version. A fault in any participant
sharing the changed module, or lack of useful progress within the observation
horizon, causes native rollback. Repair retains real material and mail. Manual
source edits take the module out of automatic ownership, and explicit opt-in is
required before later automatic changes may replace it.

## Expansion is paid for

The starting district has six actors, four modules and 48 raw units. Two raw units
become one panel. Delivered panels become installed construction material.
Three installed panels pay for foundation, workshop and a bidirectional connection.
At a scheduler safe point BF validates placement, topology, capacity, compatible
source and remaining demand, then creates a factory process and the actual roads.
The factory starts with zero stock and must obtain real raw material by delivery.

Conservation includes stock, cargo, production escrow and installed material.
Messages and jobs reference transfers; they are not extra inventory. Trials use
the same ledger. Refused construction keeps installed material and allocates no
partial actor or road. A finite completed district is allowed; it never silently
resets or becomes an endless recorded animation.

## What remains outside BF

Python emits the auditable kernel. A generic JS/WebAssembly executor implements
the eight commands. The browser carries raw input, stores opaque machine images,
keeps unsaved editor drafts and draws emitted state. Architectural assets, camera
placement and interpolation are presentation. The executor does not recognize
Thread words, city objects, goals or search candidates.

The dialect uses unsigned 16-bit wrapping cells and byte I/O. The current kernel
has 133,240,921 commands and 939,414 cells (1,878,828 tape bytes). Tape size differs
from host RSS and executor memory. The raw source exceeds GitHub's normal tracked
file limit; deterministic gzip, generator and layout are versioned, and the raw
eight-command artifact is losslessly materialized for verification.

`bf-excerpt.txt` contains 720 actual commands from `Kernel.token_read`, offsets
64905–65624 in the released artifact. The excerpt initializes tokenizer state and
begins reading input. It is a partial function, not a standalone synthesis program.
`bf-excerpt.json` records its exact hash and location. The Thread compiler and
synthesizer ultimately execute through this same BF substrate.

## Evidence and limits

The original 114 tests remain unchanged in the tree. New tests exercise contexts,
structural generation, stale results, withheld input, loops, forbidden capabilities,
rollback, ownership, construction and repeated reclamation. The 320-cycle search
stress test is distinct from older hundreds-of-publications allocator tests.
Browser export/import and fresh CLI comparisons verify actual output bytes.
Literal BF reference runs remain separate from generic optimized execution.

Tests and self-review come from the same sole Astra xHigh author. They are finite
evidence, not an independent audit or a proof of arbitrary-program correctness.
The grammar, search count, capacities and lifetime counters are bounded. Prior
evidence can fall out of bounded rings and is then unavailable. Images require the
matching kernel and provide integrity checks, not authentication. The administrator
terminal remains privileged. This is a programmable BF experiment, not a full
operating system, universal programmer or claim of inevitable self-improvement.
