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
- A minimal structured generator is unavoidable bootstrap tooling for this first
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

The 723-byte WebAssembly executor is a generic acceleration backend for the same
operation stream as the JS executor. It is assembled from `runtime/executor.wat`
using pinned WABT. It neither compiles nor executes Thread directly. Literal
Brainfuck execution remains a differential reference. Node and the browser use
the same kernel, executor and machine-image format.
