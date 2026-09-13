# Inspecting the constraint

The **Brainfuck (BF) programming language** is the execution substrate, including
Thread compilation, data management and application algorithms. The bootstrap
kernel is generated; this is an explicit, substantial host build responsibility.

`boundary.json` inventories production, generated, presentation, build and test
components, with a reason for each host component. `node tools/audit.mjs` checks
new executable files and every file under the source/distribution directories,
missing components, reviewed production digests, runtime/build dependencies,
selected dynamic-execution patterns and production imports of test/tool code.
The Python bootstrap is checked for obvious guest-input/host-execution hooks.

These checks detect common accidental drift. They are **not a semantic proof**,
a general static analyzer, or protection against someone intentionally changing
both code and manifest. Changing a reviewed hash requires reading and judging the
new code against `PROTOCOL.md`; mechanically refreshing a hash is not a review.
The audit's own mutation tests establish that unclassified code, changed host
code, dynamic host execution and a ninth kernel instruction are refused.

Independent deterministic regeneration checks bind the Python specification to
the raw kernel and its compressed transport, the WAT source to the Wasm binary,
and the canonical Thread libraries to the public raw copies. The executors have
no guest opcode interface and no privileged native-language calls. Thread source
is provided only as comma-input bytes. The runtime does not import a test oracle.

Two complementary execution references are used:

- A literal JS path exercises small random programs against optimized execution.
- A separately authored C reference literally executes the **full raw kernel**,
  without run coalescing or affine-loop acceleration. Output, pointer, high-water
  and raw instruction counts are compared with the production backend.

This does not prove every possible program. Random graph/store tests instead
supply independent algorithmic oracles for real workloads on the real kernel.
The browser transport test imports the production worker; its only adapters are
file loading and message delivery, not guest computation. WebMCP registration
unit tests cover the tool contract, while separate actual browser calls prove the
same tools execute the real machine.

A future build should extend native capabilities and preserve these regressions.
An unavoidable new host effect requires an explicit reason and review; difficulty
implementing an algorithm is not a reason to add a host shortcut.

## Build 002 author self-review

The same Astra xHigh author performed implementation and adversarial self-review.
The C reference is an independently implemented interpreter, not an independent
human/model audit. Its new raw-continuation mode accepts only raw BF PC, pointer,
counters and tape cells. It executes every command literally and compares output,
all tape bytes and continuation. Bootstrap from the optimized machine is an explicit
precondition for those large bounded cases; the original zero-tape reference remains.

A separate test-only Bellman-Ford algorithm checks unprepared route inputs and a new
conditional module. No test oracle or stored expected output is imported by the
browser renderer, worker or CLI execution system. Reproduction JSON is download-only
evidence; the live scene always boots raw source and computes its states.

Particular review targets are source framing (including text resembling output
records), active serial versus reused arena identity, storage rejection before a
compile request, reference acquisition only on successful compilation, immutable
in-flight duration, explicit cache invalidation at generation wrap, and missing or
wrong-arity rules. The raw general Thread terminal can intentionally corrupt guest
memory; neither the module compiler nor image checksum claims adversarial isolation.

Generated image sprites contain buildings or vehicles, not roads or application
state. Renderer code was inspected for route solving, module-name special cases,
prediction of future positions, delivery decisions, hidden event replays and imports
of test tools. Road geometry is drawn only from native node/edge records. Decorative
quays, lights and materials do not introduce road connections.
