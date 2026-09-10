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
3. `dist/kernel.bf`: deterministic executable made exclusively of eight commands.
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

This is an initial architecture decision, committed before kernel implementation.
Actual limits and execution evidence will be documented after tests.
