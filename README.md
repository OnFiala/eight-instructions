# 8 Instructions

How far can one coding agent build from the **Brainfuck (BF) programming language**?
Eight commands — `> < + - . , [ ]` — move a pointer, change a cell, read or write a
byte, and loop. Astra xHigh authors the architecture, code, tests, repairs and
self-review. The human supplies challenges and preferences. No subagents or second
coding model author this build.

**Build 004: A city that improves itself.** Open the page and a real BF city starts
working. Inside the same machine, a bounded grammar constructs new Thread source,
the actual compiler compiles it, isolated worlds test it, and a native controller
decides whether to publish it. Live cargo and construction continue during trials.

**Development status:** native synthesis, isolation, automatic publication, rollback,
material-built expansion and the first zero-click browser run are verified locally.
The complete regression, visual and public release gates are still in progress.
The existing public URL remains on Build 003 until the verified deployment.

[Public site](https://eight-instructions.andrewxix.chatgpt.site/) ·
[Build 004 challenge](records/004/challenge.md) · [Journal](records/004/journal.md) ·
[Native synthesis](docs/synthesis.md) · [Worlds and construction](docs/worlds.md) ·
[Permanent protocol](PROTOCOL.md)

## What the city actually does

BF selects a useful unfinished goal from current native state. It constructs source
from a finite product grammar of reads, comparisons, conditions and actions. For
example, the actual generated factory body can change from unconditional production
to a stock guard while still offering already available panels:

```text
2 stock 1 < if 1 request make then offer dispatch
```

This is generated program structure, not a host-selected complete solution or an
external model response. The default scene tests one candidate per search; the
native interface supports up to sixteen. A deterministic grammar is finite and
cannot invent arbitrary programs. A result means “best tested under these conditions”,
not optimality, universal intelligence or inevitable improvement.

A baseline and candidate start from the same BF checkpoint and use the same city
semantics and logical horizon. Useful installed material, conservation, unfinished
jobs, cargo and native faults contribute to acceptance. An additional road closure
is withheld from search. A stale result is rejected; a protected observation can
restore the previous code. Publication brings back only source. Trial buildings,
vehicles, material and completed work never enter the live world.

The initial district owns 48 raw units. Two raw units become a panel. Actual vans
carry panels to a site; three installed panels pay for a foundation, workshop and
new road connection. BF then creates a working factory process with zero stock and
extends the real routing graph. That factory must order and receive real material.
The original installed material remains in the conservation ledger. The finite
scenario finishes or becomes blocked; it never secretly resets or loops a recording.

One optional bridge control changes validated world data. Object inspection reveals
actual inventory, mail, source and active versions. Manual edits opt a module out of
automatic control; returning it to autonomy is explicit. Pause, reset, source editing,
rollback, error repair and whole-machine export/import remain available.

## Run the real machine

Node.js 22+ is sufficient for the checked-in runtime. No API key, backend, runtime
npm dependency or external model call is needed.

```sh
git clone https://github.com/OnFiala/eight-instructions.git
cd eight-instructions
node tools/serve.mjs 4178
```

Open the loopback URL printed by the server. The page restores an opaque round-zero
image produced by the actual BF compiler, then computes fresh work automatically.
No routes, deliveries, candidate results or completed buildings are precomputed.
This browser tab does the work. Closing it stops execution; background tabs suspend
automatic advancement. Export explicitly preserves a resumable machine.

```sh
node runtime/cli.mjs --load dist/initial-industry.8i --eval 'autonomy-step industry-state' --save my-city.8i
node runtime/cli.mjs --load my-city.8i --eval 'autonomy-step synthesis-state industry-account'
node runtime/cli.mjs --autonomous --fuel 2e14 --blocks 3e10
```

The last command cold-compiles the native platform. At the prompt, `autonomy-step`
advances one live round and a bounded amount of native trial work. `industry-state`,
`synthesis-state` and `district-state` emit current native state. The administrator
can request `1 4 32 search-start` to test up to four candidates for factory slot 1
with a 32-round horizon, subject to native ownership and busy checks.

A custom source uses `length module-id source-write SOURCE`, with an exact ASCII
byte count, followed by `module-id module-compile`. The browser frames those bytes.
The general Thread terminal is privileged owner access, outside the candidate
sandbox. Old `--demo`, `--city` and `--industry` profiles remain available.

## BF and host

| BF owns | Host provides |
| --- | --- |
| Source, tokenization, compilation, grammar and exact versions | Auditable Python emission of the generic eight-command kernel |
| Goals, trials, scoring, publication, observation and rollback | Semantically equivalent generic JS/Wasm execution and raw I/O |
| Processes, mail, world contexts and resource reclamation | OS facilities and opaque checksummed machine images |
| Stock, production, jobs, cargo, construction, routes and reservations | Presentation of emitted state and interpolation between observed positions |

The canonical executable is [the compressed BF artifact](dist/kernel.bf.gz).
`node tools/materialize-kernel.mjs` recreates its hash-checked literal source at
`artifacts/kernel.bf`. That generated file exceeds GitHub's 100 MiB tracked-file
limit and is ignored; the deterministic generator, compressed artifact and layout
remain auditable. `python3 kernel/build.py --check` independently reproduces them.
Historical Git objects and tags are unchanged.

See [architecture](docs/architecture.md), [language](docs/language.md),
[modules](docs/modules.md), [processes](docs/processes.md),
[industrial operations](docs/industry.md), [persistence](docs/persistence.md) and
[the complete boundary inventory](boundary.json). Runtime code imports no test
oracle, host Thread interpreter, planner, synthesizer, candidate selector or city
simulator. The system is not self-hosting and BF does not draw its graphics.

## Fixed resources and evidence limits

- Unsigned 16-bit wrapping BF cells; 939,414 cells and 1,878,828 tape bytes.
- Four complete heap/workspace contexts; common trusted supervisor storage.
- Sixteen processes, 64 stack values, 16 call frames, 16 private words per process.
- Four messages per mailbox, eight modules, sixteen reusable version arenas.
- At most 512 source bytes and 256 actor bytecode words per arena.
- Sixteen jobs and nodes, 48 directed roads, one configured material extension.
- A 1–32 instruction actor quantum; the initial city uses 32. Bounded helpers and
  equal quanta do not imply equal wall-clock cost.
- Search: 1–16 candidates, 1–64 trial rounds, at most four trial rounds per live
  step. The visitor configuration uses one candidate and 32 rounds per search.
- Nonwrapping lifetime, generation and logical-clock limits. Resident general
  Thread definitions remain monotonic; actor and trial arenas are reusable.
- Schema equality is a declared contract, not proof of arbitrary program intent.
- A native 32-result ring and retained winner survive export. Browser source/event
  history is bounded and instance-local. Missing old evidence is unavailable.
- Manual editor drafts are separate UI state and are explicitly excluded from the
  machine image. Native execution speed is separate from display smoothness.

## Verification and history

The 114 Build 003 regression tests are preserved, including earlier builds. New
coverage exercises native synthesis, source structure, trial isolation, stale
results, loop/fault rejection, safe publication, shared-program rollback, real
construction, conservation, fixed-capacity reclamation and pending-trial images.
Development failures and repairs remain in [the Build 004 journal](records/004/journal.md).
Self-review is by the same author, never described as an independent audit.

Full verification uses Node.js 22+, Python 3.14, a C compiler and the pinned build-only
WABT dependency:

```sh
npm ci --ignore-scripts
npm run verify
```

`npm run generate` emits the generic kernel/executor, packages raw source, verifies
historical archives and obtains the initial image by actual BF execution. The
image check repeats cold compilation and compares exact bytes.

Builds [001](dist/build-001/), [002](dist/build-002/) and [003](dist/build-003/)
retain their matching kernels, runtimes, assets and immutable tags. Only relocated
HTML navigation differs, with explicit receipts. Old images need their matching
kernels; no untested migration is claimed.

[Build 001 records](records/001/) · [Build 002 records](records/002/) ·
[Build 003 records](records/003/) · [Build 004 records](records/004/) ·
[Publication workflow](docs/publication.md)

MIT licensed. Eight instructions → this → ???
