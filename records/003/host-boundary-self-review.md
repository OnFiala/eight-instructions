# Build003 boundary self-review — same Astra author

This is not an independent audit. It describes inspected responsibilities and
finite execution evidence. Release acceptance remains separate.

## Native computation

The Python generator consumes no Thread sources or workload inputs. Its revised
one-hot dispatch, workspace translation and code-page validity caches emit BF
operations that execute on tape. The validity cache stores only a full-page bounds
fact, never instructions or answers, and errors clear it before a code-frontier
rollback. Bounded `w.` validates its entire span before native decimal output.
The raw kernel, compressed artifact and map reproduce from this source.

The resident Thread module compiler still owns source bytes, tokenization,
whitelisting, stack effects, exact dependencies, schema checks and publication.
The process executor is itself Thread executed by that BF kernel. Process
instruction selection, continuations, state, mailboxes, sleep, identity and
reclamation have no host callbacks. Domain helpers have fixed context/job/graph
bounds. The native priority scan is limited to16peers; it reserves no capacity for
an absent process, excludes ineligible states, and expires stale intent.

Native ledger methods perform transfers under one non-interleaved operation.
Raw BF pause/import preserves its unfinished instructions rather than repeating
the operation. Job identity/stage checks handle repeated notifications. Fault
repair is explicit and does not delete stock or cargo. Equal schemas declare
compatibility; they do not prove a user's business intent.

## Host responsibilities inspected

- `engine.mjs`, `wasm-engine.mjs`, `runtime/executor.wat`: generic BF execution,
  including exact long-run instrumentation. No Thread opcodes or city events are
  dispatched by host code. A seeded epoch-boundary test is not an assertion that
  nine quadrillion instructions were physically run for that test.
- `worker.mjs`, `client.mjs`: transport and whole-machine budgets/pauses. Browser
  scheduling may pause the executor for responsiveness but chooses no guest task.
- `images.mjs`, CLI/file adapters: opaque tape/executor serialization, checksums,
  identity validation and atomic OS writes. Candidate import leaves the existing
  browser machine intact until compatibility and native presentation are checked.
- `runtime/diagnostics.mjs`: streaming display framing only. It skips opaque
  source bodies so diagnostic-looking source text cannot become a CLI failure.
- `industry-ui.mjs`: selection, local unsaved drafts, raw byte framing and native
  commands. The batch control sends a value to native `parameter!`; it does not
  parse/rewrite Thread. The source-only reader requests the active serial already
  emitted by BF and lets BF validate it. No host version publication or allocator.
- `industry-presentation.mjs`: complete-frame/length decoding and display labels.
  It never advances stock, messages, route, timing, travel or construction.
- `industry-scene.mjs` and reused `city-scene.mjs`: projection, graphics, native
  object hit targets, native roads/paths, and interpolation between observed
  positions. Trees, lamps, gardens and architectural materials are decorative.
  Offset van callouts are labels, not invented vehicle/queue positions. Bodies use
  schematic painter ordering; this is not continuous traffic physics.
- Image tooling creates appearance assets only; provenance is in `assets.json`.
  The initial-image builder invokes the real BF compiler and records round0,
  without routes/orders/production. A fresh cold boot checks exact image bytes.
- Reproduction, measurements, CLI/browser comparisons and literal C references
  are verification tools. Production imports none of them or their expected output.
  Archived old kernels/runtimes remain executable with their matching images.

No new production package, backend, model API, broker or route library was added.
WABT remains the pinned build-only dependency. The manifest's reviewed hashes are
change-detection gates, not proof of these semantic statements.

## Concrete review findings

The checks exposed and repaired a paused waiter with newly arrived mail, imprecise
long-running host counters, source text mistaken for diagnostics, source-cache
identity confusion, and a source-only UI request using compile-only control words
at the interactive prompt. Final review also found that the displayed raw log
was limited while its backing string still grew. Both are now capped at180000
characters; event history remains capped at1200records. This is presentation
retention, not guest-memory reclamation. Original failures and repairs are retained. The
source-only repair does not alter the native artifact or its state.

Remaining limitations include finite16-bit identities/logical time, fixed storage,
slow native turns, declared rather than inferred schema compatibility, and
privileged owner access outside the process profile. Final performance, whole-suite,
interaction, visual and deployment receipts must be assessed separately.

Final hosted114test and public functional verification passed; see ci-final-pr.json and public-verification.json. This remains a self-review by the same author. Final closure identities are in the release final-deployment.json.
