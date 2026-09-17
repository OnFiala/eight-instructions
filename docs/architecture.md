# Architecture: Thread on eight instructions

The **Brainfuck (BF) programming language** is the execution substrate. Thread is
the interactive language implemented inside it. No host-side Thread interpreter
or compiler exists.

## Chosen dialect

Unsigned 16-bit wrapping cells, initially zero; bounded tape; byte input/output;
input pauses when a live stream is empty and becomes zero at explicit EOF.
`.` emits the low byte. Brackets follow the usual Brainfuck semantics. Moving
outside the tape is an error. Sixteen bits are a deliberate dialect choice, not
an extra instruction: they permit useful addresses and integers without first
implementing multi-byte arithmetic. This is not a claim of 8-bit portability.

## Layers and responsibility

1. `tools/emitter.py`: a bootstrap assembler for structured Brainfuck generation.
   Python executes only to emit commands; it never receives guest user programs,
   workloads, or application data. Loops in the emitted kernel run in Brainfuck.
2. `kernel/build.py`: the auditable kernel source expressed in emitter operations.
   It emits tokenization, dictionary search, integer parsing, compilation, stacks,
   control-flow patching, dispatch, bounds checks, arithmetic, and diagnostics.
3. `artifacts/kernel.bf`: deterministic executable made exclusively of eight commands.
4. `dist/engine.mjs`: generic Brainfuck execution shared by Node and browser. It
   may coalesce pointer/arithmetic runs and optimize affine loops, never recognize
   Thread words, opcodes, application algorithms, or privileged host escapes.
5. `programs/*.thread`: libraries and applications supplied as raw input bytes.
   They are compiled and executed by the Brainfuck kernel, including persistence
   abstractions and application algorithms.
6. `runtime/cli.mjs`: raw file/terminal I/O and atomic machine-image persistence.
   Images contain generic interpreter state, not host-interpreted database objects.
7. `dist/*` presentation: browser editor, input/output controls, rendering and
   inspection. All results must originate in actual execution of `kernel.bf`.

## Decisions

- A Forth-inspired threaded language puts a compiler and reusable definitions
  inside the constraint early. It supports new programs without regenerating
  the kernel. It is named Thread; compatibility with standard Forth is not claimed.
- Separate bounded stacks, code, dictionary, heap, and persistent-store regions
  make ownership and bounds inspectable. Addressed access is itself Brainfuck.
- Structured generation is the chosen bootstrap approach for this first
  build. Its substantial size and maintenance responsibility remain host-side
  and are reported openly. Generation is not self-hosting.
- A generic runtime may accelerate language-independent Brainfuck operations.
  Differential execution against an unoptimized interpreter is required.
- MIT keeps reuse simple; no external architecture or challenge solution is copied.

The initial architecture was committed before implementation. Limits are specified
in the language guide; the build record contains execution evidence and revisions.

## Measured revisions during Build #001

The initial linear dictionary was replaced by a native 256-bucket chained hash
table after application compilation hit a work budget. Hashing, collision checks
and publication are Brainfuck operations. Redefinition publishes a new dictionary
entry; already-compiled calls retain their previous target.

Code uses 128 pages of 64 words. Program counters, calls and returns carry page
and offset components. Six tape lanes implement page travel, local travel, value,
cargo and separate return breadcrumbs. The executor knows none of this layout.
This reduced the observed first application run from 41.12 to 13.45 seconds.

The 744-byte WebAssembly executor is a generic acceleration backend for the same
operation stream as the JS executor. It is assembled from `runtime/executor.wat`
using pinned WABT. It neither compiles nor executes Thread directly. Literal
Brainfuck execution remains a differential reference. Node and the browser use
the same kernel, executor and machine-image format.

The final native arithmetic revision uses direct subtraction for small quotients
and guarded binary candidates for large `/mod` quotients. Internal decimal
formatting keeps its inexpensive small-digit path. A universal binary replacement
was rejected after it made small full-kernel literal workloads substantially more
expensive. The store now remembers a reusable slot during lookup, avoiding a
second insertion probe. Fully colliding 128-record workloads still require
multiple bounded runs; images can preserve progress between them.

## Build 002: native workspace and Living Dispatch

The chosen extension is a module compiler and pure evaluator **written in Thread**,
not a second host compiler. Its Thread definitions are compiled by the BF kernel;
when those definitions tokenize, type-check, allocate, link or execute a module,
all those operations execute as BF. It is an interpreter layered inside the native
Thread runtime, with an explicit smaller module language profile. General Thread
remains available and is not silently relabeled as a reclaimable module system.

Only three generic kernel primitives were added: raw byte `key`, bounded workspace
`w@` and `w!`. The 4,096-word workspace uses the same auditable paged tape technique.
Resident platform code capacity increased from8,192 to12,288 to hold the new native
compiler and city definitions. The six reclaimable module arenas have fixed capacity;
raising resident capacity is not the reclamation mechanism. The raw kernel identity
and tape size are in `dist/kernel-map.json`.

Ownership is explicit: `workspace.thread` owns four module records, source drafts,
six version arenas, exact dependencies, roots and pins. `city-state.thread` allocates
hot application arrays before workspace compiler tables. `city.thread` owns road
adjacency, costs, path reconstruction, vehicle progress and delivery events. Raw
`city-boot.thread` creates the initial named source and city data. See `modules.md`
for the exact safe point, effect, refusal and lifetime invariants.

A moving vehicle pins the program version selected at departure, and captures its
road duration. Code publication, road closure, duration edits and job changes cannot
teleport it or reinterpret its committed progress. Arrival releases that pin. A last
decision serial is retained as evidence, not as a reference that prevents collection.
Its source may later become unavailable under the bounded retention policy.

Positive scores (1..1,023) bound the 16-node shortest-path arithmetic. Native cost
caching is valid only for the exact active pure module version and current road data.
Every road mutation explicitly invalidates the cache, including generation wrap.
Missing, uncompiled or wrong-arity city rules block departures before evaluation;
existing travel can continue. The city has no collision or traffic model.

Presentation parses complete length-framed source/state output. `MODULE` identifies
active/rollback **serials**; `VERSION` separately identifies physical arenas. The
renderer never equates those identities. `city-scene.mjs` projects native coordinates,
directed roads and emitted paths, composites decorative image assets, and interpolates
between two observed positions. `site.mjs` frames raw input and waits for native
storage acknowledgement before requesting compilation. Comparison creates two generic
workers from the same opaque image; it does not calculate expected answers.

No graphics package or runtime npm dependency was added. Inter typography and Phosphor
icons are vendored assets under their licenses. The image generator created appearance
assets only. Every added host component is justified in `boundary.json`.

## Build 003: communicating native processes

The current development kernel reserves512dictionary entries,24576resident code
words and24576workspace words. The tape has398704unsigned16-bit cells. These
resident capacities accommodate the native platform; reusable process contexts,
job slots and module arenas are separately bounded and reclaimed at fixed size.
Historical Build001/002 layouts stay with their matching artifacts.

The process extension is Thread interpreted by the real BF kernel, using the
same native module compiler and version ownership. `process-state.thread` owns
creation, private contexts, FIFO messages, pause/repair and lifetime IDs.
`processes.thread` loads/saves continuations and runs deterministic instruction
quanta. The actor profile has a checked whitelist, not general heap/store access.
`industry-state.thread` owns the finite ledger and graph; `industry.thread`
implements checked role operations, transfers, resumed routing and reservations.
`industry-view.thread` emits native state and handles privileged UI requests.
See [processes](processes.md) and [industrial semantics](industry.md).

Three further generic kernel optimizations execute on the BF tape: a bounded
address-translation cache, one-hot primitive dispatch, and a small code-page
validity cache invalidated on errors/compilation rollback. `waddr` checks page and
offset; `w.` emits at most256validated workspace values. Neither is exposed as an
actor-profile word. Python emits these algorithms; it never precomputes source
compilation or city answers. The generic host executor remains ignorant of them.

`industry-ui.mjs` sends raw source or parameter/data inputs and waits for native
acknowledgement. `industry-presentation.mjs` decodes length-framed output.
`industry-scene.mjs` renders native coordinates, paths, stock, cargo and building
phases. Selecting a visual object maps only to its emitted identity. Decorative
architecture, material pixels, camera and numbered callouts have no state authority.
No new runtime package or application backend is introduced.

A checked-in opaque initial image speeds browser startup. Its builder runs the
actual BF compiler on raw boot input; it contains zero scheduler rounds, routes,
orders, deliveries or production. `--check` boots a fresh machine and verifies
its exact bytes and identities. Browser cold compilation remains available.

## Build 004: native autonomous work

The current composition adds `district.thread` and `synthesis.thread` to the same
native industrial profile. Four heap/workspace contexts support an immutable
checkpoint, parked live state and suspended trial, with context zero as the execution
window. The BF supervisor constructs and compiles source, interleaves real trial
rounds with live work, evaluates conservation and useful progress, validates a
selected candidate under an additional closure, and publishes source at a scheduler
boundary. See [synthesis](synthesis.md) and [construction/world ownership](worlds.md).

The browser automatically requests the next native `autonomy-step`; it does not
choose candidates, horizons, scores or winners. Presentation explicitly discards
trial compiler and city events from the live view. Source editing and opaque image
import/export remain optional. Historical Build003 has its own verbatim runtime in
`dist/build-003/`; its old interaction-led workflow is not the current entry point.
