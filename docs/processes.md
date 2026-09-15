# Native processes — Build 003 implementation in progress

`programs/processes.thread` runs in Thread inside the real BF kernel. It owns
16 fixed256-word contexts in the persistent region. This boot profile does not
load `store.thread`, whose independent data-store profile owns that same region.
The host supplies input and executes BF; it does not select or resume a process.

Every ready process receives at most8 module-bytecode instructions per scheduler
round in ascending slot order. PC, current exact version,64data values,16return
frames and16private state words survive context switches. A no-yield loop remains
preemptible. Fixed-width arithmetic and bounded native helpers have finite work;
equal instruction quanta are not equal elapsed time. A sleeping process counts
down logical rounds. `wait` yields and blocks only when its FIFO is empty.

`self`, `state@`, `state!`, `send`, `recv`, `wait`, `sleep`, `yield`, `fail` and
`pending` are compiler-whitelisted only in the process profile. Arbitrary resident
words and raw memory/I/O are rejected. Private indices must be0..15. `send` takes
value/type/target lifetime handle and returns1committed,0full,2unavailable,3serial
exhausted. `recv` returns value/type/sender/true, or four zeroes for an empty FIFO.
Four messages per process are ordered FIFO; pause preserves the queue, a fault
refuses new sends, and explicit termination discards queued non-material messages.
Sender0 denotes an external input. A retry is a new send; application request
identity must deduplicate any non-idempotent business operation.

Creation pins its root immediately. The root retains its exact compiled dependency
graph. A suspended invocation keeps those versions. After a root returns with an
empty stack, the next invocation acquires the module's current version. Compilation
or rollback cannot replace an already suspended frame. Faults preserve the failing
continuation for inspection. Explicit repair of a faulted/paused process discards
that continuation while preserving its private state and queue. It is not a rollback
of prior user state writes. Termination releases the root and reclaims the context.

Handles never wrap: lifetime serial65535 exhausts creation. Reused physical slots
cannot be reached through old serials. The raw developer terminal and an owner-edited
tape remain privileged; image integrity is not an adversarial security boundary.

The module interface and private/message layout are structurally fixed. This does
not prove that a user's new program interprets their own private values correctly.
The first milestone evidence is in records/003/processes-milestone-tests.txt.
Industrial protocol, final timings, complete regression, visual and release gates
remain in progress. This document is not a Build003 release claim.
