# 8 Instructions

How far can one coding agent build from the **Brainfuck (BF) programming language**?
Eight commands — `> < + - . , [ ]` — move a pointer, change memory, read/write a
byte and loop. Astra xHigh writes the architecture, code, tests, repairs and
self-review. The human supplies challenges and preferences, without writing or
repairing production code. No subagents or second coding model author this build.

**Build 003: A city made of programs.** A small industrial district runs on
communicating, resumable programs inside one actual BF machine. Select a factory,
change its program, and watch native orders, cargo and construction change.

**Development checkpoint:** the native chain and local regressions have evidence;
final visual/interaction verification, release and public deployment are still
in progress. The existing public site remains the verified Build002 until those
gates pass. This branch is not a claim of a completed Build003 release.

[Existing public site](https://eight-instructions.andrewxix.chatgpt.site) ·
[Build003 challenge](records/003/challenge.md) · [Journal](records/003/journal.md) ·
[Permanent protocol](PROTOCOL.md) · [Build002 release](https://github.com/OnFiala/eight-instructions/releases/tag/build-002)

## What changed

Build001 created Thread, a small stack language compiled and executed inside BF,
with reusable words, transactional data, routes and whole-machine snapshots.
Build002 added named source, a bounded module compiler, exact version bindings,
publication, rollback and reusable arenas. Its city made code changes visible.

Build003 adds **stateful processes**. Each has its own continuation, private
state and bounded mailbox. A deterministic BF scheduler gives eligible programs
bounded turns. One infinite user loop cannot prevent other eligible programs from
running. A failed program keeps its state for inspection and explicit repair.
This is logical concurrency in one BF machine, not a full operating system.

Twelve initial participants — two depots, two factories, two stations, four vans
and two bridge signals — cooperate through actual native messages. Two raw units
become a panel. Vans carry that material, and stations grow when panels arrive.
Road capacity, queues, route planning, inventory and construction all run in BF.
The exact accounting invariant keeps all96initial raw-equivalent units accounted
for across inventory, cargo, production escrow and installed panels.

The factory's convenient batch control changes one literal in **source stored in
BF**. BF performs the edit, compilation and publication. Custom source stays
editable; controls never replace it with a host template. Old suspended calls keep
their versions, and updates preserve the world. Closing a bridge is a separate
data experiment. The [process contract](docs/processes.md),
[module contract](docs/modules.md) and [industrial protocol](docs/industry.md)
describe the precise boundaries and failure behavior.

## Run the real machine

Checked-in artifacts need Node.js22+ without an API key or runtime npm packages:

```sh
git clone https://github.com/OnFiala/eight-instructions.git
cd eight-instructions
node tools/serve.mjs 4178
```

Open the loopback preview in a browser. Its initial opaque image was produced by
running the actual BF compiler on raw boot sources, at logical round0. No routes,
orders, production or completed deliveries were precomputed. A cold-compile action
also boots directly from source inside BF.

For CLI use:

```sh
node runtime/cli.mjs --load dist/initial-industry.8i --eval 'process-step industry-state' --save my-city.8i
node runtime/cli.mjs --load my-city.8i --eval 'process-step industry-account'
node runtime/cli.mjs --industry --fuel 5e14 --blocks 5e10
```

The final command compiles the complete native platform from raw source. At the
interactive prompt, `process-step` runs a logical scheduler round and
`industry-state` emits actual state. `5 1 parameter!` asks BF to edit and publish
the Riverside factory's batch literal. `1 module-rollback` restores its prior
active version. `/save my-city.8i` exports the entire machine.

A full custom module is sent as `length id source-write SOURCE`, where length is
its exact ASCII byte count, followed by `id module-compile`. The browser frames
those bytes and exposes the source directly at the selected object. The general
Thread terminal is explicitly privileged; it is not the isolated actor profile.

## BF and host

| BF owns | Host does, and why |
| --- | --- |
| Source, tokenization, compilation, module execution and versions | Python emits the initial generic eight-command kernel |
| Process scheduling, contexts, private state, messages and reclamation | Generic JS/Wasm executes BF, transports raw input/output and enforces whole-machine work budgets |
| Jobs, materials, production, construction, routing and reservations | Canvas draws emitted state using graphical assets and interpolates only between observed positions |
| The entire live workspace and continuation | Browser/OS facilities persist an opaque checksummed image |

The executable is [artifacts/kernel.bf](artifacts/kernel.bf). Native system and
application sources are [workspace.thread](programs/workspace.thread),
[process-state.thread](programs/process-state.thread),
[processes.thread](programs/processes.thread),
[industry-state.thread](programs/industry-state.thread),
[industry.thread](programs/industry.thread) and
[industry-view.thread](programs/industry-view.thread).
The [boot manifest](programs/industry-system.json) supplies raw Thread input.

There is no host Thread interpreter, guest scheduler, message broker, guest object
allocator, route solver or simulation. No model API decides what a van does.
BF does not draw graphics, and the bootstrap is not self-hosting. Responsibilities,
not source-size ratios, are the evidence. See [architecture](docs/architecture.md),
[the component manifest](boundary.json) and [asset provenance](records/003/assets.json).

## Fixed resources and honest limits

- Unsigned16-bit wrapping values;398704BF cells,797408tape bytes.
- Sixteen process contexts,64stack values,16frames and16private words each.
- Four messages per mailbox; full sends refuse without committing a message.
- Eight source modules, sixteen reusable version arenas;512source bytes and
  256bytecode words per arena. One rollback root per module, plus live references.
- Sixteen reusable job slots,16nodes and at most48directed roads.
- A configurable1..32instruction quantum; industrial boot uses32. Dijkstra phases
  and domain helpers have finite bounds. Equal quanta are not equal wall-clock time.
- Lifetime serials and the logical clock refuse65535exhaustion; diagnostic16-bit
  counters can wrap. Generic BF instruction totals use exact host instrumentation.
- Schema declarations are checked; they do not prove arbitrary program intent.
  Broken dependencies can remain waiting for repair. No automatic cargo loss or reset.
- Resident general Thread definitions remain monotonic. Reclamation covers the
  bounded native module/context/message/job storage, not an unrestricted heap.
- No continuous traffic physics, full operating system, backend or cloud storage.
- Explicit export makes work durable. Unsaved editor drafts are not in the BF image.
- Native work may take seconds. Smooth rendering is not native simulation frequency.

## Verification and history

The original76Build002 regressions remain. An intermediate current-kernel run
passed102tests, followed by seven additional/targeted capacity, version and pause
checks. These are development observations, not the final release count. Records
include actual native outputs, failed approaches, fixes and their exact scope.
Self-review is by the same author, not an independent audit.

Full artifact and test verification needs Node.js22+, Python3.14, a C compiler and
the pinned build-only WABT dependency:

```sh
npm ci --ignore-scripts
npm run verify
```

`npm run generate` emits the generic kernel/executor, copies raw native source,
rebuilds historical archives and obtains the initial image by actual BF execution.
The image check repeats cold compilation and compares exact bytes. Tests and
reproduction tools are not imported into live computation.

Build001 and002 remain at their original tags, and their matching browser kernels,
runtimes and assets are preserved under `dist/build-001/` and `dist/build-002/`.
Only HTML navigation is relocated and labeled historical. Their images require
those kernels; Build003 rejects incompatible identities and claims no untested
migration. The current default CLI/`--demo` and `--city` retain the historical
source profiles for regression, while original tags preserve exact old releases.

[Build001 records](records/001/) · [Build002 records](records/002/) ·
[Build003 records](records/003/) · [Persistence](docs/persistence.md) ·
[Publication workflow](docs/publication.md)

MIT licensed. Eight instructions → this → ???
