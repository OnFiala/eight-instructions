# Native processes — Build 003

`programs/processes.thread` runs in Thread inside the real BF kernel. It owns
16 fixed256-word contexts in workspace20480..24575, above the module arenas and
industrial ledger. Checked native `waddr` constructs workspace page addresses;
the kernel caches translations on its BF tape, never application values.
The host supplies input and executes BF; it does not select or resume a process.

Every ready process receives at most the configured1..32module-bytecode instructions
per scheduler round in ascending slot order. The generic default is8; the industrial
boot selects32 using the checked privileged `process-slice!` word. A root return,
wait, sleep, fault or explicit yield can end its turn sooner. Logical round65535
exhausts this bounded clock explicitly rather than wrapping. PC, current exact version,64data values,16return
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

`schema# N` at the start of a large-profile process source declares a positive
state/message schema number. First publication establishes it; incompatible later
publication is refused with39, retaining the prior active version. The industrial
attachment protocol accepts schema1. The module interface and private/message layout
are structurally fixed. This does
not prove that a user's new program interprets their own private values correctly.
The first milestone evidence is in records/003/processes-milestone-tests.txt.
Release status and final verification are reported separately in records/003/.
The industrial protocol is documented in industry.md.

## Waiting, failures and bounded work

A paused mailbox waiter retains its continuation and mail. A message received
during pause does not execute it; resuming a nonempty mailbox waiter makes it
ready. Paused timers retain their remaining logical rounds. `sleep` followed by
`pending`/`recv` supports a program-defined timeout; there is no implicit timeout
that cancels a message or transfers material. Messages contain values, type,
sender and unique message serial, not executable references. An old message does
not silently acquire a new meaning: compatible programs retain the declared schema.

All process instructions have bounded native work. Stack/context copies are
limited to64values/16frames, mailbox scans to4slots, identity/participant scans to16,
job dispatch to16jobs by16vans, route relaxation to at most48outgoing edges and path
reconstruction to16nodes. Reclamation scans a finite16arena dependency DAG. Native
16-bit arithmetic is itself bounded. These are structural limits, not a measured
real-time deadline. Slow native work may still take seconds, but no user loop
inside an actor can consume an unbounded number of actor instructions in one turn.

Individual errors preserve the failed context for inspection and do not stop
other ready processes. A successful send or completed state write before a fault
is not rolled back. Applications must use stable request identities and explicit
protocol stages for non-idempotent work, as the industrial ledger does.
