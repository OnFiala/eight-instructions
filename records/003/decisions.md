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
