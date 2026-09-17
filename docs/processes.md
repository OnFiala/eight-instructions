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

## Process instruction reference

Stack notation lists the topmost item last. Ordinary arithmetic/control and
module calls retain the module-profile rules in `modules.md`.

| Word | Stack | Native effect |
| --- | --- | --- |
| `self` | `-- handle` | Current nonwrapping lifetime identity. |
| `state@` | `index -- value` | Read own private index0..15. |
| `state!` | `value index --` | Write own private index0..15. |
| `send` | `value type recipient -- result` | Bounded FIFO send; result codes above. |
| `recv` | `-- value type sender received` | Consume one message, or four zeroes. |
| `pending` | `-- count` | Own queued messages. |
| `wait` | `--` | End turn; wait if own queue is empty. |
| `sleep` | `rounds --` | End turn; sleep for logical rounds. |
| `yield` | `--` | End this execution turn. |
| `fail` | `code --` | Local fault; zero becomes error35. |

Industrial operations additionally check that the current process is attached to
an entity and has the required role. They cannot mutate arbitrary peer state.

| Word | Stack | Allowed role and effect |
| --- | --- | --- |
| `request` | `batch --` | Factory;1..6panel batch requests twice as many raw units. |
| `work` | `--` | Factory; advance bounded production and request output transport. |
| `accept` | `job sender --` | Actual recipient; acknowledge a delivered ledger job. |
| `authorize` | `job sender --` | Matching depot/factory; authorize one requested job. |
| `dispatch` | `--` | Depot/factory; assign eligible jobs to available vans. |
| `claim` | `job sender --` | Assigned van; accept its verified assignment. |
| `drive` | `tollWeight --` | Van;0..16weight, advance bounded route/travel work. |
| `service` | `--` | Van; perform checked pickup/unload or retry notification. |
| `build` | `--` | Station; consume one available panel toward its goal. |
| `signal` | `open --` | Signal;0/1availability of its assigned road pair. |
| `kind` | `-- role` | Own attached role1depot,2factory,3van,4station,5signal. |
| `stock` | `material -- quantity` | Own stock,1raw or2panels. |
| `priority` | `priority --` | Van;0..9priority for future free-road arbitration. |

`schema#` is a declaration and `batch#` a checked source marker, not host macros.
The editable starting examples are raw BF input in `programs/industry-boot.thread`.

## Build 004 shared scheduler and production composition

`offer` submits already available panels through the original job ledger. `make`
advances production at most once per native round. Both require a factory role.
The original `work` retains production-plus-offer behavior. These operations let
native synthesis compose a stock condition around production while continuing to
ship existing panels. Root-return counters and last-return rounds let the evaluator
reject candidates that never return or merely coast on preexisting cargo.

After each full actor round, `district-step` handles enabled material construction.
It is inert in old profiles. The autonomous supervisor runs one live round and at
most four trial rounds per call, through this same scheduler and instruction quantum.
