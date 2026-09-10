# Developing programs in Thread

Thread is an unsigned, Forth-inspired language whose tokenizer, compiler and
execution engine run in the **Brainfuck (BF) programming language**. It is not
an implementation of standard Forth. Source is whitespace-delimited and
case-sensitive; a backslash outside a string comments through the next newline.

```text
: gcd begin dup while swap over mod repeat drop ;
1071 462 gcd .
```

This compiles a reusable function in the live machine, then prints `21`.
`mod` comes from the core library, itself compiled in Brainfuck on boot.

## Values and stacks

Values are integers modulo 65,536. Literals accept `0` through `65535` and
negative spellings such as `-1` (the value 65535). Larger magnitudes are errors,
not silent literal truncation. Arithmetic wraps; comparisons are unsigned.
Conditions treat zero as false and every other value as true. Comparisons return
0 or 1. Division by zero is an error. There is no floating point or string type.

Stack notation `(a b -- c)` lists the top of the stack on the right.

| Words | Stack effect / behavior |
| --- | --- |
| `+ - *` | `(a b -- result)`; unsigned wrapping arithmetic |
| `/mod` | `(a b -- remainder quotient)` |
| `= < 0=` | equality, unsigned less-than, zero test |
| `dup drop swap over rot` | copy, remove, swap, copy second, rotate `(a b c -- b c a)` |
| `depth` | `(-- count)` before the count is pushed |
| `emit .` | `(value --)`; low-byte output / unsigned decimal followed by a space |
| `@ !` | `(address -- value)` / `(value address --)` in heap memory |
| `p@ p!` | the same operations in the separate persistent-store region |
| `here allot` | next heap address / reserve a count of heap words |
| `fill pfill` | `(value address count --)`; bounded heap/store fill |
| `move pmove` | `(source destination count --)`; overlap-safe heap/store copy |
| `assert` | `(condition --)`; abort current execution if zero |
| `words` | list dictionary names in publication order, including shadowed names |
| `trace` | `(enabled --)`; emit native execution traces |
| `bye` | stop this machine; a new or previously saved machine can still be opened |

The core library adds `cr space 1+ 1- nip 2drop 2dup > <= >= and or / mod min max +!`.
See the actual [source](../programs/core.thread).

## Definitions, state and control flow

```text
variable total
12 constant dozen
: add-dozen dozen total +! ;
add-dozen total @ .

: choose if 7 else 9 then ;
: countdown begin dup . 1- dup 0= until drop ;
: fact dup 2 < if drop 1 else dup 1- recurse * then ;
```

`variable name` allocates and zeroes one heap word and defines an address-returning
word. `value constant name` defines a literal-returning word. `here constant data
32 allot` reserves a named array. Heap allocation is monotonic in Build #001;
there is no general allocator or garbage collector.

`:` reads a name and starts compilation. `;` emits a return and publishes the
definition only after control-flow checks pass. An erroneous definition rolls
back code allocation and remains unpublished. Redefinitions add entries: future
lookups see the newest definition; existing compiled calls keep the old target.
`recurse` calls the definition currently being compiled. `exit` returns early.

Control words are compile-time words implemented by the Brainfuck kernel:

- `if ... [else ...] then` consumes a flag at execution time.
- `begin ... until` repeats until a consumed flag is nonzero.
- `begin condition while body repeat` checks the condition before each body.
- `begin ... again` repeats indefinitely until `exit`, an error, or a host work limit.

`while` must match an enclosing `begin`; `repeat` closes both. Control constructs
can nest. There is no host-side AST, parser, assembler or optimizer for Thread.

`." text including spaces"` prints a string immediately, or compiles literal
bytes and `emit` operations inside a definition. The space after `."` separates
the token from the string. Strings can span input chunks. NUL is EOF, not string
data. Raw input and output remain byte-oriented; ASCII is the documented source
convention.

## Development and diagnostics

```sh
node runtime/cli.mjs
node runtime/cli.mjs --run my-program.thread
node runtime/cli.mjs --bare --eval ': square dup * ; 7 square .'
node runtime/cli.mjs --demo --save machine.8i
node runtime/cli.mjs --load machine.8i --eval '0 11 route'
```

The CLI and browser send raw source bytes to the kernel. File reading and text
editing are host facilities; compilation is native. Use a named word to group
operations when an error should abort the rest of that operation. At top level,
the interpreter continues with the next token after an error. Errors clear the
data/return stacks and abort the active call; they do not roll back arbitrary heap
writes or automatically close a database transaction. `tx-abort` is explicit.

| Diagnostic | Meaning |
| --- | --- |
| `!E1` | unknown, oversized or malformed token / number |
| `!E2` | data or return stack underflow/overflow |
| `!E3` | heap/store address or allocation outside its region |
| `!E4` | division by zero |
| `!E5` | dictionary/code capacity exhausted |
| `!E6` | invalid definition or control-flow structure |
| `!E7` | invalid return or code address |
| `!E8` | failed native assertion |
| `!E9` | EOF inside a string |

`1 trace` emits `~ next-code-address opcode data-depth` before native operations;
`0 trace` disables it. The generic host debugger reports the raw Brainfuck source
offset, tape pointer/cell, instruction count and pause reason. A work limit pauses
execution at an executor block boundary; images preserve that continuation.
The map in `dist/kernel-map.json` exposes register and memory-region locations.

## Fixed limits in Build #001

- 256 dictionary entries, including built-ins, library definitions and variables.
- Names/tokens: at most 23 bytes. Long tokens are rejected, not truncated and run.
- 8,192 code words; address zero is the top-level return sentinel.
- 256 data values, 256 return frames, 64 compiler control entries.
- 4,096 heap words and 4,096 separate store words.
- 16-bit values, byte I/O, single execution stream, no process isolation.

These are measured/configured limits, not an unlimited operating system. The
boundaries are intended to be extended with visible migrations and regressions.
