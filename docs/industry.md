# Industrial programs — Build 003

This is a finite message-driven example inside the Brainfuck (BF) programming
language, not a host simulation. `industry-system.json` supplies raw Thread bytes
in order: core, workspace, process state, industrial state/operations, processes,
industrial presentation and boot input. `industry-boot.thread` is data and editable
program source consumed by BF, not a precomputed event sequence.

The initial world has 16 nodes, 46 directed roads, two depots, two factories,
two construction sites, four vans and two bridge signal programs. Each of these
12 participants is a native process. Their source modules are depot,
factory-west, factory-east, van, station and signal. The two factories deliberately
have separate editable source; vans share code but never private state or mail.

## Accounting and protocol

There are two material kinds: raw units and panels. Two raw units become one
panel, with one panel held in production escrow for three subsequent `work`
rounds. Starting stock is 48 raw units in each depot. Each station consumes eight
panels. Every authoritative state must satisfy:

```
raw in buildings + raw in vans
+ 2 * (panels in buildings + panels in vans + production escrow + installed panels)
= 96
```

No host event increments this account. Native `industry-account` independently
scans the live ledger. The test account is an assertion, never the production
source of inventory. Building storage is bounded; depots hold64units per kind,
other participants24. The UI's material piles group up to six units per visible
stack and cap decorative stacks at four; numeric inventory remains exact.

A factory asks its depot for raw material. The depot authorizes a job and assigns
an eligible idle van. The van claims that job, drives to the source, loads exactly
its quantity, drives to the recipient and unloads. Factories offer panels to their
station through the same protocol. A station consumes delivered panels and builds.
All these actions come from actual process words and native message queues.

There are sixteen reusable job slots. Stages are free, requested, authorized,
assigned, carried and delivered awaiting acknowledgement. Job IDs are unique
16-bit lifetime serials, never reused after wrap. A delivered job can be reclaimed
only by its actual recipient acknowledging the matching van/job. Duplicate
notifications do not repeat loading, unloading or acknowledgement. A repeated
external send is a new message; the stable job ID and stage supply deduplication.

Loading changes source inventory and cargo in one native operation. Unloading
first secures the recipient's message slot, then changes cargo, inventory and job
stage in the same operation. Guest processes cannot interleave within it. An
executor pause can occur inside its BF instructions; an image resumes those exact
instructions before any further command. It does not roll back a completed action.
A full/faulted recipient leaves the cargo on the van. There is no hidden timeout
that discards cargo, cancels ownership or manufactures replacement material.

A process fault keeps its private state, queue, stock, cargo, reservations and job
ownership. Other eligible processes continue. Dependencies may wait for the failed
participant; they are not promised to recover without a repair. Explicit
`industry-repair` discards the failed continuation, retains owned data, and
re-announces pending native jobs from their stages. `industry-retire` refuses
stock, cargo, escrow, reservations or any live referencing job. An idle process
can be retired and its context reused. The source module remains until explicitly
deleted without live references.

## Routing and capacity

The dispatcher scans at most16jobs and16vans. Among eligible idle vans it chooses
the smallest Manhattan distance to pickup, with ascending slot as the tie break.
That is a bounded assignment heuristic, not an optimal global fleet planner.

Actual trips use native Dijkstra over the emitted directed graph. The van's
program supplies a toll weight0..16 to `drive`; each edge cost is
`duration + toll * weight`. Duration1..30 and toll0..9 bound arithmetic on the
16-node graph. A BF-built outgoing-edge index contains only actual road IDs.
A route invocation performs a bounded phase: initialize16nodes, choose and relax
one vertex, reconstruct at most16nodes, or attempt one departure. It continues
in later process turns. It does not perform an unbounded search inside a quantum.

Every undirected road pair has capacity one shared by its two directions. A van
must reserve capacity before departure. Other vans wait at their actual nodes;
there is no invented queue geometry or continuous collision physics. Signals
can delay new entries to two bridges. A closed road refuses new departures, while
an in-flight van retains its segment, progress and captured duration and releases
its reservation on arrival. Stationary routes are invalidated by a road change.

The van word `priority` accepts 0..9. A higher-priority ready van with a recent
native drive intent for the same free road pair takes precedence over a lower
priority, even when its scheduler slot is later. Equal priorities retain turn
order. The arbitration scans at most sixteen contexts; it does not change the
scheduler's instruction budget. Paused, sleeping and faulted peers are excluded.
An intent older than the preceding logical round expires, so a program that
loops without calling `drive` cannot hold a free passage indefinitely. An actual
in-flight reservation is still owned until arrival or a state-preserving repair;
priority never ejects a vehicle. `TRAVEL` includes the lifetime handle of the
peer that caused the most recent priority yield. This is bounded priority
arbitration, not an assurance that lower priorities never wait.

A route pins its root program version. Suspended program frames and an in-flight
segment keep their appropriate versions. Publication does not move a van. At a
root return the next invocation adopts the active program; after finishing a
captured segment it recomputes a route if the root version changed. Old route pins
are then released. The old source may be collected when no root/frame/route needs
it; its historical serial alone does not keep it alive.

## Program and data controls

Selecting an object reads its source, active version, state and allowed controls
from BF. The main factory control sends a number to native `parameter!`. The BF
compiler recognizes a single `batch#` marker, checks the stored source revision,
changes only that literal, stores and compiles it, and publishes on success.
It does not replace custom code with a template. A custom source without an
editable marker stays available in the full editor.

`schema# 1` declares the state/message contract accepted by the industrial roles.
A different declared schema is rejected, not silently migrated. The actor profile
has checked private cells and role operations; it cannot access another process's
raw memory. Schema equality does not prove the business intent of arbitrary user
code. A permitted custom program can wait forever, waste its finite inventory or
retain jobs; the UI must show the consequence rather than invent a recovery.

Road opening is a separate data input. Publication and rollback change code.
Sources can have a stored invalid draft and a different usable active version;
the editor distinguishes both from its own unsaved draft.

## Output and bounded lifetime

`INDUSTRY`/`INDUSTRY-END` enclose a complete native state frame. `ENTITY`, `JOB`,
`TRAVEL`, `I-PATH`, `I-ROAD`, `PROCESS` and `PRIVATE` contain current state.
`I-ROUTE` includes the root version, endpoints, cost and actual path. `SEND`
contains message serial, sender, recipient, type, value and executing version
(serial0 for an external administrator send). `RECEIVE` contains message serial,
recipient and executing version. These records are data, never host callbacks.

The logical clock, process/job/message/version lifetime IDs refuse exhaustion
at65535. Diagnostic operation/allocation totals that are ordinary Thread values
wrap modulo65536; they are not lifetime identities. Long-running generic BF
instruction totals use exact host instrumentation, reported separately. Fixed
capacities and explicit exhaustion are part of the system, not a promise to run
forever. Native turns can take seconds; visual interpolation is not simulation
frequency.
