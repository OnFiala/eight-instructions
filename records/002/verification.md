# Build 002 verification ledger

This ledger separates native tests, actual browser actions, visual checks and publication. All implementation and self-review are by the same Astra xHigh author. It is not an independent audit.

| Evidence | Observed result | Scope / limit |
| --- | --- | --- |
| `final-local-tests.txt` | 74 tests pass, 0 fail/skip; 578980.073 ms | Full local required suite including the original 50 cases. Later changes are UI/artwork/docs and a semantics-preserving reference-C formatting repair; CI verifies the final head separately. |
| Same receipt, 450-cycle test | 9000 cumulative bytecode words, 40 live at end, 0 versions after delete; 6 fixed arenas, slots1/3/2 reused | Exceeds original8192-code/256-dictionary monotonic limits. Resident7078/162 and tape169164 stayed fixed. Stress elapsed457751.376ms; not isolated latency. |
| Workspace/adversarial tests | Source/capacity failures, repeated failures, dependencies, pins, live replacement, rollback, serial/pin exhaustion, missing rule and generation-wrap invalidation | Fixed finite cases; low-level general Thread remains trusted. |
| Literal native reference | 374713154388 evaluation and352585709028 rejected-compilation literal BF instructions; exact output, whole tape and continuation | Large cases begin from a stated raw checkpoint; the original zero-tape reference remains. Not a proof of arbitrary programs. |
| Browser custom source | 61-byte conditional module publishedv2 at step1; all three journeys kept progress0/2 and pinv1 | Actual Chrome UI; no kernel regeneration or host compiler. `browser-custom-publish.txt`. |
| Browser rejected edits | Incomplete source and257-byte source refused; v2 and live memory preserved | `browser-invalid.txt`, `browser-oversize.txt`; failed draft can remain stored, failed published candidate cannot. |
| Browser lifecycle | Rollback restoredv1; new `margin.thread` compiledv3 and deleted, releasing its arena | `browser-module-lifecycle.txt`. UI lifecycle supplements larger native tests. |
| Actual export/import | Chrome downloaded step2 image; new Codex-browser worker restored custom source, v2/v1 and three half-trips; step3 arrived8/4/1, step4 usedv2 | `browser-inflight.8i`, `browser-restored*.txt`, `browser-decision.txt`. Chrome automation file selection lacked extension permission; no permissions changed. |
| Corrupt import | Truncated JSON image rejected; step3 city retained and continued | Observed in Codex browser. Friendly error prefix added afterward; repeat with public candidate. |
| Browser image in new CLI | Sources/versions/pins and city restored; custom duration2/toll5 returned32 | `browser-image-cli.txt`. |
| Fresh browser comparison | Same three logical steps, paid bridge open both; first routes15/22 | `browser-reproduction.json` and byte-exact fresh CLI replay in `browser-reproduction-cli.txt`. |
| Comparison after import and closure | Baseline still produced15/22 with open bridge; current imported city stayed step4 with its bridge closed | `browser-comparison-after-import.txt`. Separate snapshot ownership verified in real UI. |
| Packaged reproduction | Both branches exact in a new CLI process | `reproduction-cli-final.txt`; expected outputs never drive the live renderer. |
| Keyboard and reduced motion | Skip link focused editor; Tab reached guide then Apply; Enter publishedv2. Reduced-motion media active, CSS transitions0s; actual steps2/3/4 retained native behavior | `browser-keyboard-reduced-motion.txt`; narrow focus screenshot. Not a full WCAG/screen-reader certification. |
| Build001 browser archive | Original sample booted; cost20/path0,2,1,7,8,9,10,11 | Original17 runtime/assets are verbatim. HTML navigation/CLI checkout explicitly historical; regeneration check enforces this. |

## Author boundary review

Reviewed the native/host data flow and production imports, not just file size or language proportions. Concrete findings repaired during this build include candidate reference acquisition, while/repeat stack joins, numeric token fallback for `0=`, old arena identity versus serial identity, compilation after refused source storage, immutable captured road duration, invalid rule argument leakage, generation-wrap cache invalidation, comparison baseline ownership and incomplete hard-paused replay transcripts. See journal.md and the associated tests.

The production executor sees only BF commands and bytes. Source interpretation, module allocation, version meaning, route costs and delivery decisions remain in native Thread. The renderer selects graphical appearances, projects emitted coordinates and interpolates only two observed states. Native roads alone establish connections. Tree/plaza decoration supplies no traversable edge, collision or route. Bridge art is aligned to an existing edge; it cannot open or create one. Inter/Phosphor are vendored graphics/font assets; image_gen is only an asset authoring tool. The only npm dependency is pinned build-time wabt. No production oracle, prerecorded expected city or alternate host simulation is imported.

The automatic manifest audit is a heuristic review gate, not a semantic proof. Reproducible generation and differential execution are separate evidence. Sources, artifacts, local behavior, CI and deployed public bytes require their own receipts.

## Remaining release gates

The final visual comparison, exact-head CI, standard merge/tag, deployment identity and post-deployment anonymous browser checks must be completed and linked in the release record before a final PASS. This ledger does not pre-authorize a result or substitute for those checks.
