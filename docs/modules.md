# A native source workspace (Build 002, in development)

The **Brainfuck (BF) programming language** executes the whole system. General
Thread is compiled by the existing BF kernel. `programs/workspace.thread` is a
Thread program that implements a second, deliberately smaller **module profile**:
it stores named source, tokenizes and compiles it, checks stack effects, executes
its bytecode, owns references and reclaims versions. This is an interpreter within
Thread within BF. Neither JavaScript nor Python compiles or evaluates these modules.

The profile makes user routing programs pure and bounded. General Thread remains
available in the developer terminal, including its unrestricted memory primitives.
This is a trusted programmable machine, not process isolation against someone
intentionally modifying the module manager with `w!`.

## Actual inputs and outputs

Start the city with `node runtime/cli.mjs --city --eval 'city-state'`. The native
boot sources create module0, `delivery-rule.thread`, with two arguments (duration,
toll) and one result (route score). The initial source is:

```text
: delivery-rule.thread + ;
```

The following raw Thread input stores a new30-byte source in BF, compiles from
that stored source and publishes it between complete calls:

```text
30 0 source-write : delivery-rule.thread 8 * + ;
0 module-compile
2 5 0 module-run . .
```

The last line returns status1 and result42. The host counts and transports input
bytes; source ownership and compilation occur after the bytes enter BF. A draft
may be invalid while its previously compiled active version stays usable.

| Operation | Native meaning |
| --- | --- |
| `inputs outputs length module-create NAME` | Allocate a module with a unique exact byte name; consume precisely length raw name bytes. Arity0..8. |
| `length id source-write SOURCE` | Consume precisely length raw ASCII bytes; atomically replace the draft after validation. |
| `id source-read` | Emit the stored draft with its exact length. |
| `id module-compile` | Compile a fresh candidate, publish on success, or release it on failure. |
| `arguments… id module-run` | Run the active version; return declared results and a success flag. |
| `id module-pin` | Acquire an explicit reference; return the immutable serial handle. |
| `arguments… handle version-run` | Run that exact still-live version. |
| `handle version-release` | Release one explicit pin; return success. Roots and dependencies cannot be released this way. |
| `handle version-source` | Emit that version's stored source. |
| `id module-rollback` | Swap active and previous roots. |
| `id module-delete` | Refuse external live references; otherwise drop roots and reclaim. |
| `workspace-state` | Emit module/version records, source/code lengths, roots, reference and pin counts. |

Whitespace after the calling word is the delimiter consumed by the base tokenizer.
The next byte begins the raw name/source. The length is bytes, not Unicode code
points. Raw source rejects NUL and non-ASCII input; capacity is256 bytes. The file
`programs/city-boot.thread` is a real example consumed by both browser and CLI.

## Language profile and compatibility

Source contains exactly one `: module-name … ;` definition with the same full
name as its module. Names start with a lowercase ASCII letter, reserving numeric
spellings for literals. Tokens are at most23 bytes. Decimal literals follow Thread's
16-bit unsigned/wrapping convention, including negative spellings. The compiler
supports `+ - * /mod = < dup drop swap over rot 0= > <= >= and or / mod min max`
and `if else then begin until while repeat`. Backslash comments end at newline.

Branch joins and loop backedges must agree on stack depth. Final depth must match
the declared output count. Structured controls are bounded to16 entries. Module
calls bind the exact active version of another module and apply its declared
arity. Self-reference, general heap/store access, raw I/O, defining words and
arbitrary general Thread calls are outside this profile and are rejected.

Evaluation uses64 values, up to16 return frames and a1024-bytecode-instruction
budget per root invocation, shared with nested calls. Division by zero, budget
exhaustion and invalid runtime effects return failure and zero-valued results.
No module write can reach the city. A valid program can still fail for particular
inputs; compilation is not a proof of totality or of useful routing scores.

## Ownership and reclamation

Four module records of320 words and six version arenas of448 words occupy3968
of the4096-word workspace region. Each module has one256-byte draft. Each version
has its own256-byte source and128-word bytecode capacity; the remaining words
hold metadata and a six-entry dependency bitmap. Capacity is fixed during use.

An active root, a single rollback root, each explicit pin and each dependent
version contribute references. Compiling a call acquires the dependency only
when compilation succeeds. Dependencies always point from a newer version to an
existing older version, so the graph is acyclic. An iterative native collector
releases unreferenced versions and their dependencies. Freed bytes need not be
zeroed: validated lengths and allocation state prevent them from being interpreted,
and every new allocation initializes its metadata. This is reclamation, not
secure erasure of an owner's tape.

A candidate must fit a free arena. Publication transfers the old active root to
rollback, drops the former rollback root and collects anything now unreferenced.
If all six arenas remain live, compilation refuses without changing those roots.
Old compiled references retain old behavior. Explicit handles use a monotonically
increasing16-bit serial; serial65535 is an exhaustion boundary, never an ABA wrap.
Pins are bounded to60000 per version, leaving room for roots and dependencies.

All execution is single-threaded. External source input is accepted only after a
complete call returns. The module manager additionally refuses lifecycle changes
while its evaluator is busy. A host pause during a call or compilation preserves
the exact continuation; it is not a safe point at which to enqueue another change.

## City contract

The city has16 nodes, capacity48 directed roads (44 initially), three vehicles and
one current destination per vehicle. Positive route scores are bounded to1..1023.
Duration/toll edits and road opening/closure are data inputs, separate from code
edits. The initial paid bridge stays open in both policy comparisons.

`city-step` first validates/caches edge scores natively, then advances the logical
tick. At a node, a vehicle chooses a route with native Dijkstra, pins the selected
rule version and enters the first edge at progress0. Later ticks advance one
progress unit. The committed edge and duration remain fixed even if code or road
data change. Arrival releases the pin; departure on another edge happens on a
later tick and selects the then-current active program. Delivery occurs only at
an emitted arrival at the current destination. A changed job never teleports a car.

Native cost caching is valid because modules are pure and bound to exact versions.
An entire cost table is committed only after all open edges evaluate successfully.
Within a table rebuild, identical consecutive `(duration,toll)` inputs reuse the
previous native evaluation. `POLICY` records identify actual evaluations;
`EDGE-COST` records identify the resulting table; `ROUTE` records include version,
input nodes, score and the exact path. A rejected score table blocks new departures
while already committed road travel can finish.

Snapshots contain all of this state, sources, versions and references. The kernel
hash differs from Build001, so its images are rejected explicitly by the new
runtime. Build001 remains reproducible at its original tag; preserving its public
browser assets is part of the pending release work. No automatic migration exists.

## Diagnostics

`WS-ERROR` codes:1 invalid module;2 capacity;3 name/token;4 source bytes/length;
5 incomplete or invalid structure;6 unknown/unsupported word;7 stack effect or
stack limit;8 control structure/limit;10 live-reference refusal;11 missing/stale
version;12 evaluation budget;13 zero divisor;14 busy evaluator;15 serial/pin limit.

Evidence currently lives in `tests/workspace.test.mjs`, `tests/reclaim.test.mjs`,
`tests/city.test.mjs` and `records/002/`. Release verification and final measurements
are still in progress. Do not interpret this development document as a release PASS.
