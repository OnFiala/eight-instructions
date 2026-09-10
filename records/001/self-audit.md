# Build #001: adversarial self-audit

The substrate is the **Brainfuck (BF) programming language**. This review was
performed by the same Astra xHigh agent that authored the implementation, as the
experiment requires. It is not an independent review, formal verification or a
claim that a finite test suite finds every defect.

| Claim attacked | Attempt to disprove it / evidence | Assessment |
| --- | --- | --- |
| Important computation is native | Followed raw input through CLI/worker, generic comma instructions, native tokenizer/compiler and guest execution. New `gcd`/`cube` functions compile without regeneration. Store and Dijkstra are Thread source, interpreted by the BF kernel. | PASS within the documented 16-bit dialect. |
| Brainfuck is not decoration | Checked production imports and executor operation tables: no Thread opcode hook, database API, graph solver, app-specific native callback or oracle import. A separate literal C interpreter runs the full raw kernel and agrees on 1,453,328,957 instructions for its test program. | PASS; this is finite behavioral evidence, not equivalence for every input. |
| Host code is honestly scoped | Reviewed each production host component and froze digests in `boundary.json`. The Python kernel specification and assembler are substantial: about 40 KB of source at measurement. Rendering, image encoding, generic acceleration and file I/O remain outside. | PASS for scoped, explained boundaries. Absolute minimum host size is not proved; this system is not self-hosting. |
| The demonstration is non-trivial | Changed/removed roads, committed and aborted data, checked random 8/16/24-node networks against Bellman-Ford, and reconstructed the full 32-node path costing 31,000; also filled all 128 roads in a cyclic graph. The sample route changes from cost 20 to 21 with a different path. | PASS; dynamic mutable directed graph computation uses several real native subsystems. |
| Tests do not bypass the system | Core/compiler tests run the generated kernel. Store/graph tests restore a boot image produced by real native compilation. Browser-worker tests import the production worker with transport-only adapters. Test-only Map/Bellman-Ford algorithms supply expected results. | PASS. WebMCP contract unit tests use callbacks, clearly separate from actual browser execution evidence. |
| Persistence is real | Saved and loaded a full image across new processes/workers, including definitions and open transactions. Exported a browser machine with a new `gcd` word; a new CLI process evaluated `81 36 gcd .` to 9. Restarted browser machine, imported the same file and got 9 again. Corrupt/incompatible images are refused before replacement. | PASS for explicit snapshot durability. `tx-commit` alone is not a disk save, and no concurrent database durability is claimed. |
| Repository reproduces the result | Local `npm run verify` regenerated/checked kernel, compressed bytes, Wasm and raw source copies; all 50 tests passed. A clean public clone and Linux CI also passed all 50 cases and left tracked artifacts unchanged; exact evidence is in `verification.json`. | PASS across authoring, clean-clone and Linux runs. |
| Site claims match reality | Used real browser controls and both WebMCP tools; verified GCD, mutable routes, undo, image export/import and state reads. Invalid tool arguments fail before effects. The UI explicitly labels generated kernel, 16-bit cells, fixed capacities, host rendering and commit-versus-export. | PASS for locally tested behavior. Public deployment, 18 anonymous asset responses and the final browser/image round trip are verified in publication.json; the hosting HTML insertion is disclosed. |
| History reflects development | Git was initialized before implementation. Earlier commits contain the original compiler and real linear dictionary/code/storage strategies. Journal preserves budget exhaustion and measured slow runs before redesigns. No squash or fabricated retrospective stage commits. | PASS; sole-agent authorship is a disclosed provenance claim, not something Git signatures mathematically prove. |
| Foundation can support harder builds | Users define new words, compile control flow, own memory, use transactions, save continuations and inspect execution. Capacity failures preserve old definitions and allow recovery. | PASS as a bounded foundation. Fixed code/dictionary capacity and monotonic allocation are the strongest obstacles to continued growth. |

## Corrections found during the review

- Native road convenience words own transaction-start policy instead of the UI.
- Worker requests reject busy operations, malformed images and invalid tape ranges.
  Pause and image replacement are exercised across real worker lifetimes.
- UI state resets remove stale counters; native boot errors cannot silently appear
  as successful compilation; missing record data is visible as unavailable evidence.
- Output-limit recovery no longer double-counts the refused output instruction.
  Both generic backends match resumed output and final counters.
- Added attacks on dictionary, code, compiler-control and heap limits. No mutation
  escape or unpublished-word leak was found in those tests.
- Host audit tests deliberately inject an unclassified executable, changed host
  source, dynamic evaluation and a ninth kernel instruction; all are detected.

The remaining limits are explicit in the language, persistence and architecture
contracts. No protocol violation or human production-code intervention was
observed in this run. External review after publication remains welcome; it was
not secretly delegated to another model during this experiment.

Final stress extension: 119 division operand pairs passed, as did the full
128-road cyclic graph. All 128 deliberately colliding keys survived an image
checkpoint and six bounded execution calls. The 35–37-second collision workload
is disclosed as a limitation; a failed universal division rewrite is preserved
in the journal. No default work limit was silently raised to hide that result.
