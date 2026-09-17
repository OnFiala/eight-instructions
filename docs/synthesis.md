# Native synthesis and world contexts — Build 004

This describes the implemented native contract. Verification and release identities
are tracked separately in `records/004`; a contract is not evidence of deployment.

The same BF kernel executes the resident Thread compiler, actor module compiler,
city operations and trusted synthesis supervisor. There is no host-side candidate
interpreter, trial scheduler, fitness function or city surrogate.

## Memory ownership

The kernel reserves four value lanes per heap/workspace word. Lane context zero
is the ordinary execution window; contexts one through three are opaque shadows.
`source target context-copy` copies all 4,096 heap and 24,576 workspace values in
BF. `context context-zero` clears those values in BF. Arguments must be 0..3.
Both operations have fixed structural bounds and preserve the Thread data/return
stacks, resident code, kernel registers and common store. They are privileged
general Thread operations, absent from the actor compiler's whitelist.

The native supervisor assigns context 1 to an immutable search checkpoint, 2 to
the live world while a trial executes, and 3 to the suspended trial. Entire module
arenas and their reference counts are copied, so each branch independently owns
its drafts, immutable compiled versions, dependency references, process frames,
mailboxes, industry objects, stocks, cargo, reservations and route pins. Shared
resident code and the primitive spelling table are immutable during evaluation.

The common store at 0..2559 belongs to the trusted supervisor. Candidates cannot
read/write it, use raw addresses, alter goals/scores or copy/clear contexts. A world
identity is the search generation plus its context role. Actor lifetime serials
resolve only in that world's copied process table. Context destruction invalidates
all its branch identities. Live process serials retain their nonwrapping rule.

The complete tape, including shadow contexts, supervisor state, grammar, pending
source, budgets, results and exact BF continuation, is in an opaque machine image.
The generic host copies that image without reconstructing its objects. A paused
native context copy resumes in place. Older builds require their matching kernels.

## Candidate grammar

The current finite factory grammar constructs 16 programs: four action structures
times four thresholds, ordered 5..16, then 1..4. It copies the chosen module's actual
name and emits source bytes into native store before copying them into the normal
module draft and invoking the existing BF compiler. No completed solution menu or
host source compiler participates. The protocol receive/acknowledge prefix is a
reusable grammar production. The variable body composes stock reads, unsigned
comparison, conditions and role-checked actions:

```text
batch request make offer dispatch
2 stock threshold < if batch request make then offer dispatch
batch request 2 stock threshold < if make then offer dispatch
2 stock threshold < if batch request then make offer dispatch
```

For the unguarded structure, `batch` is 1..4. For guarded structures, the native
factory batch is retained and `threshold` is 1..4. The programs have distinct source
structures, not just coefficients. `make` advances production at most once per
logical round; `offer` submits already available panels through the same ledger.
The original `work` retains its production-plus-offer behavior. Separating these
operations lets a program bound production while still shipping existing stock.

The grammar is deliberately small and deterministic. There is no PRNG or claim of
optimality. Budget is 1..16 candidates; horizon is 1..64 logical rounds. Compiler
source/code, process, queue and version capacities remain those of the industrial
profile. Only candidates with observed useful construction, conserved material and
no process fault receive a positive score. The best strictly greater score wins;
ties retain the earlier tested program/baseline. An exhausted or unsuccessful
search retains the live program. Further validation cases and robust acceptance
are reported as finite evidence, not general correctness or optimality proofs.

After selection, a fresh checkpoint of the current live state is validated using
a held-out three-round closure/reopening of directed road 0. Baseline
and winner receive this same input sequence and the same horizon, at most16rounds.
The winner must still show useful target progress and must not score below that
validation baseline. A now-completed live goal or changed external input epoch
rejects publication even when the historical trials passed. Candidate roots must
return during the trial and within its last four rounds; a nonreturning loop cannot
claim improvement from cargo that was already in flight.

## Execution and publication

Each native `autonomy-step` first runs one complete bounded live scheduler round,
then at most four trial rounds. Baseline and candidates start from the same native
checkpoint and run identical logical horizons. A looping actor still receives only
its normal instruction quantum. Trials execute the same role operations and graph
semantics, including FIFO delivery, exact versions, reservations and production.

The objective rewards installed useful panels, retains a preference for unconsumed
raw material, and penalizes unfinished jobs and carried cargo. A candidate cannot
change success criteria or dispose of inventory through the available primitives.
Conservation is checked by scanning actual native stocks, escrow, cargo and installed
material. Fixed positive offsets keep the bounded unsigned score representable.
The implementation and raw receipts define the exact weights; those weights are
not a claim of general economic value or wall-clock acceleration.

For an eligible trial, `score = 16384 + targetInstalled × 512 + worldInstalled × 128
+ remainingRaw − pendingJobs × 4 − carriedUnits`. Ineligible trials score zero.
Search refuses worlds with initial supply at least 16,384 raw units, and scoring
refuses 32 or more installed panels or 16,384 or more remaining raw units. Within
the conserved envelope, the positive terms cannot exceed 52,607 and the penalties
cannot underflow the offset. These are native bounds for unsigned 16-bit scoring.

Before publication the supervisor checks every live module version, the selected
stored draft revision, native road/topology epoch, outstanding construction goal
and ownership flag.
It pins the previous code, copies only the winning source into live draft storage,
then compiles it through the live BF compiler at a scheduler safe point. No trial
stock, position, cargo, job or completed structure is imported. Existing calls keep
their exact versions until normal return. Trial contexts are explicitly zeroed.

External `source-write` and `parameter!` mark a module manually owned. Automatic
publication cannot overwrite it. `enabled module autonomy-module` explicitly opts
it in/out. Stored draft and active version remain separate after compilation fails.
The observation period pins prior code and rolls back on a fault in any live
process sharing the changed module, or on lack of useful
target progress through its horizon, preserving real inventory and mail. A manual
change terminates that observation without overwriting the owner's program.

## Evidence retention

Native output marks the current world before trial or live records. Generated
sources and trial results carry search generation, candidate ordinal and checkpoint
round. A 32-entry native result ring and the current winning source survive export.
The bounded ring may overwrite older evidence; absent historical source is unavailable,
not reconstructed from an ordinal or presented as an observed past state.

General Thread's administrator terminal remains privileged, as in older builds.
An owner deliberately changing controller storage or resident definitions is outside
the isolated candidate contract. Image hashes provide integrity, not authentication.

The default autonomous visitor run tests one newly generated candidate per search
with a32-round horizon and up to four searches. Administrator inputs may request
up to16candidates. The grammar itself emits distinct sources within one search;
there is no cross-search deduplication or guarantee that an active source will not
be tested again from a new state. A repeated or tied result retains the baseline.
