# Build 003 decisions — Astra xHigh, sole author

## 2026-09-15 · Native process milestone, before implementation

Verified local/remote baseline: `a80087662a66e7d04c1fc77cbce87cf996d60e63`,
clean main, no open PR, no build-003 tag, single canonical worktree. Current host
MacBook-Pro, user/home ondrej /Users/ondrej. Implementation branch
`build-003-development`. Workspace-write sandbox; GitHub network needs the
authorized command route. Read access and repository ADMIN permission verified.
No other observed active task targets this project. This is a point-in-time check.

The first milestone extends the existing native module compiler/evaluator with
an explicitly checked process profile. The scheduler, context switching, mailbox
operations and reclamation are Thread programs executed by the actual BF kernel.
No host scheduler, interpreter or guest-state allocator is introduced.

Initial milestone limits: 16 process slots, 64 data words, 16 return frames,
16 private state words and four messages per process, eight bytecode instructions
per eligible process per round. These are design limits, not performance claims.
Slots occupy a fixed native region. A monotonically increasing, nonwrapping serial
identifies each lifetime. Reusing physical storage never reuses a lifetime handle.
The first fixture uses the existing four-module/six-version layout; final measured
city capacities may require a separate explicit native layout configuration.

A process retains its root version across suspension; that root's exact dependency
references retain called versions. Returning from a root with an empty stack is the
publication safe point: the following invocation acquires the current active version.
Faulted/suspended frames retain their old references until an explicit repair or
termination. Raw developer access remains privileged, outside process isolation.

The actor profile allows only checked arithmetic/control/calls, private indexed
state and bounded messaging/wait operations. It cannot call arbitrary resident
Thread words or access raw addresses. Lifecycle/module changes occur between
completed scheduler commands, never in the middle of an individual native update.
All mailbox operations have fixed bounded work. Arithmetic is 16-bit, hence bounded;
logical fairness does not imply equal wall-clock cost. Wall-clock costs must be
measured. New expensive city operations must be bounded or resumable too.

Mailbox order is FIFO. Sending is nonblocking: it either commits one whole message,
or returns a failure with no mutation when full/stale/unavailable. Waiting and
timeout/retry policies are explicit guest programs. A message is consumed exactly
once by a completed receive. Application request identity and material ownership
will be specified before introducing inventory-bearing messages. No inventory
conservation claim is made for this initial process-only milestone.

Build 002 remains the public release until all Build 003 gates pass. Its immutable
tag, artifacts and rollback deployment remain preserved. Self-review is performed
by the same Astra author, never labeled an independent audit.

## Industrial state and material protocol

The industrial boot selects8modules/16version arenas/512source bytes/256code words
before creating any module. It uses the existing native compiler, not a generated
second compiler. Default workspace behavior keeps its original capacities. The
kernel's generic reserved regions become512dictionary entries,24576resident code
words and20480workspace words; heap/store remain4096 each. Module storage occupies
17920words in the large layout. Reclamation remains fixed-capacity reuse, independent
of these boot reservations. Old images require the preserved old kernel.

The process profile owns the store region (16x256 words). Its private user-addressed
state remains16words; additional reserved context words hold native travel and
incremental-route continuations. It must not be loaded with the unrelated privileged
store library. A separate native industrial ledger in the remaining workspace owns
inventories, cargo, jobs, road reservations and construction. Process code can only
mutate that ledger through bounded, role-checked operations.

Initial material accounting target: finite raw stock; two raw units become one
panel. At all completed operations, raw inventory+cargo+production escrow plus twice
(panel inventory+cargo+construction consumption) equals initial supply. A transfer
debits one owner and credits another in one non-interleaved native operation. A raw
BF pause inside it preserves the exact unfinished continuation. No host reconstructs
or retries a partial transfer.

Bounded jobs have nonwrapping lifetime IDs and explicit stages: requested,
authorized/assigned, cargo in transit, delivered awaiting acknowledgement, free.
Actual FIFO messages carry these job IDs. Repeated or stale IDs cannot create a
second transfer. Full receiver mailboxes leave cargo on the van until delivery can
commit. Fault/pause leaves owned inventory, jobs and road progress intact. Removal
must refuse still-owned resources; an explicit repair can discard only the failed
program continuation, preserving the ledger.

Road routing and movement are native. Route selection progresses across bounded
phases (initialize, choose vertex, relax edges, reconstruct); each phase has fixed
node/edge bounds. Traversal captures duration, reserves a shared road capacity and
releases it only on arrival. Temporary signal waits and persistent road closures
are distinct. A changed rule or road cannot teleport a committed journey.

The central factory control will edit a named literal marker in the stored Thread
source inside BF. The compiler records its exact source offset and revision. The
control is available only when the current stored draft matches that compiled
source; a custom program without the marker remains editable and is never replaced
with a template. BF validates the range, patches source, compiles and publishes.
The host only sends the value and renders the native acknowledgement.
