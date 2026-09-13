# 8 Instructions

How far can one coding agent build from the **Brainfuck (BF) programming language**?
Eight commands — `> < + - . , [ ]` — move a pointer, change memory, read/write a
byte and loop. Astra xHigh writes the architecture, implementation, tests, repairs
and self-review. The human supplies the challenges and visual direction, with no
human-written production code. There is no predefined final build.

**Build 002: A city you can reprogram.** Store named source inside BF, replace
programs without resetting the city, and reclaim unused versions. The
[build record](records/002/build.json) and [public verification receipt](records/002/publication.json)
link the implementation, tests, observed behavior and release identities.

[Existing public site](https://eight-instructions.andrewxix.chatgpt.site) ·
[Build 002 release](https://github.com/OnFiala/eight-instructions/releases/tag/build-002) ·
[Permanent protocol](PROTOCOL.md) · [Build 001, preserved](records/001/)

## The new capability

**Thread** is a small stack language whose compiler and runtime execute inside a
real BF kernel. Build 001 provided reusable words, a transactional key/value store,
weighted routes and resumable whole-machine images. Its resident code and dictionary
allocation were monotonic.

Build 002 adds a second, explicitly bounded **pure module profile of Thread**.
The source manager, typed compiler, evaluator, exact-version bindings, rollback and
reclamation are themselves Thread programs executing inside BF. Named source is
stored on the BF tape before compilation. A successful candidate publishes at a
safe point; an invalid candidate leaves the active version usable and returns its
arena. One previous version is retained for rollback. Pins and dependent programs
retain older versions until their last reference is released.

Living Dispatch makes those capabilities visible: 16 intersections, 46 initial
directed roads (capacity 48), three vans, one destination per van, native Dijkstra
and deterministic logical steps. Changing code preserves the city and an in-flight
van's current road, progress and captured duration. Its next departure uses the
then-active program. Road closure is a separate data experiment.

## Run the actual machine

Checked-in artifacts need **Node.js 22+**, without an npm install or API key:

```sh
git clone https://github.com/OnFiala/eight-instructions.git
cd eight-instructions
node runtime/cli.mjs --city
```

Inside the terminal:

```text
city-step city-state workspace-state
30 0 source-write : delivery-rule.thread 8 * + ;
0 module-compile
city-step city-state
0 module-rollback
/save my-city.8i
```

The source-write count is the exact number of following raw ASCII bytes. The
example is 30 bytes; changing whitespace changes that count. The browser frames
those bytes for you and waits for BF to acknowledge storage before requesting
compilation. Read [the module language and lifetime contract](docs/modules.md).

The original source `: delivery-rule.thread + ;` scores a road as duration plus
toll. The new source multiplies the toll by eight. From an identical initial image,
van 1's first route changes from `12 8 9 10 11 15`, score **15**, to a route across
the free northern bridge, score **22**. The paid bridge is **open in both runs**.
These are native outputs, not host-selected alternatives. You can write another
rule, change destinations or supply other road inputs without regenerating the
kernel.

```sh
node runtime/cli.mjs --city --eval 'city-step city-step' --save my-city.8i
node runtime/cli.mjs --load my-city.8i --eval 'city-step city-state'
node tools/replay.mjs dist/reproduction/build-002.json
node tools/serve.mjs 4178
```

The last command serves the actual browser application on loopback. The replay
bundle contains kernel/runtime identities, one complete initial image, branch
inputs and byte-exact expected native output. Expected output is never imported
by the live application. Browser-created bundles use the same offline verifier.

## Where the computation happens

| Inside BF | Host responsibility and reason |
| --- | --- |
| Thread tokenization, compilation, control flow, arithmetic and bounds checks | Python emits the initial eight-command kernel; it never consumes guest source or calculates guest answers |
| Named source, typed module compilation, version bindings, publication, pins and reclaiming | Generic JS/Wasm implements only BF instructions, raw I/O and execution budgets |
| Road data, costs, routing, logical ticks, vehicle progress and deliveries | Canvas draws emitted coordinates, roads, paths and states using graphical assets |
| All source, compiled code, data and references in the tape | OS/browser facilities store an opaque tape and continuation image |

The native sources are [workspace.thread](programs/workspace.thread),
[city.thread](programs/city.thread), [city-state.thread](programs/city-state.thread)
and [the raw boot manifest](programs/city-system.json). The generic executor has
no Thread opcode interface, module allocator, route solver or city simulation.
Rendering can interpolate between **already observed** vehicle positions; it never
invents the next road, delivery or logical state. Graphical assets have an explicit
[provenance record](records/002/asset-provenance.json).

This is **generated Brainfuck**, not self-hosting. BF does not draw 3D graphics.
The Python bootstrap is substantial and auditable. We account for responsibilities,
not source-size ratios or GitHub language percentages. See the
[architecture](docs/architecture.md), [component manifest](boundary.json) and
[boundary self-review](docs/boundary-audit.md).

## Evidence and practical limits

All **76 required local tests pass**, including the original Build 001 regression
cases. The release records the final GitHub CI separately. Tests execute actual
source storage, arbitrary typed programs, failed compilation, exact old calls,
pins, rollback, six-arena exhaustion, deletion, repeated failure, fresh-image
continuation and deterministic delivery. A 450-cycle workload compiles **9,000
cumulative module code words** at fixed capacity while retaining only **40 live
words** at its end, then deletes the module and observes zero live versions.

A test-only Bellman-Ford oracle checks new module/input route workloads. A literal
C BF interpreter checks bounded new native operations from an opaque raw
continuation, including the entire final tape; the original full-kernel zero-tape
reference remains. The [verification record](records/002/) states each check's
scope. All review is by the same Astra author, not an independent audit.

- Unsigned 16-bit wrapping values; fixed tape of **169,164 cells / 338,328 bytes**.
- Four named modules; six arenas, each with 256 source bytes and 128 code words.
- Pure module evaluation: 64 values, 16 frames, 1,024 bytecode instructions.
- Version serial 65,535 is an explicit exhaustion boundary; handles never wrap.
- One rollback root per module; live dependencies/pins can prevent reclamation.
- The resident Thread dictionary/code remain monotonic. Reclaiming is for module
  arenas, not arbitrary general Thread definitions or a general-purpose heap.
- Single execution stream, no traffic/collision model, process isolation or backend.
- The general Thread terminal is trusted developer access, not a security sandbox.
- Native steps may take seconds. Frame interpolation is not BF simulation speed.
- Explicit export makes work durable; reload without export loses local state.

[Measured samples and environment](records/002/metrics.json) distinguish boot,
source storage, compilation, route workloads, movement, reclamation, BF tape and
host process memory. Those observations are not performance guarantees.

## Verify and follow the history

Full verification needs Node.js 22+, Python 3.14, a C compiler and the pinned
build-only WABT dependency. Literal execution and reclamation tests are deliberately
substantial and take minutes:

```sh
npm ci --ignore-scripts
npm run verify
```

`npm run generate` deterministically rebuilds the kernel, generic Wasm executor,
raw source copies, history metadata and preserved Build 001 browser archive.
`node tools/build-reproduction.mjs` recomputes the native reproduction evidence;
`node tools/measure-city.mjs` reruns the three-sample measurement protocol.

The old kernel and browser runtime are preserved under `dist/build-001/`, with only
HTML navigation relocated and marked historical. Build 002 explicitly rejects
Build 001 images; there is no untested migration. Check out tag `build-001` to run
its original CLI, artifacts and 50-test release. The current default CLI and
`--demo` also retain the original general Thread/store/Dispatch source profile.

[Build 001 record](records/001/) · [Build 002 journal](records/002/journal.md) ·
[Visual comparison](design-qa.md) · [Reproduction bundle](dist/reproduction/build-002.json) ·
[Technical explanation, Czech](records/002/technical-cs.md) ·
[Human explanation, Czech](records/002/human-cs.md) ·
[Unposted X drafts](records/002/x-draft-en.md) ·
[Persistence](docs/persistence.md) · [Publication workflow](docs/publication.md)

MIT licensed. Eight instructions → this → ???
