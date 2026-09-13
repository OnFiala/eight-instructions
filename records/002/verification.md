# Build 002 verification ledger

This ledger separates native tests, actual browser actions, visual checks and publication. All implementation and self-review are by the same Astra xHigh author. It is not an independent audit.

| Evidence | Observed result | Scope / limit |
| --- | --- | --- |
| `final-local-tests.txt` | 74 tests pass, 0 fail/skip; 578980.073 ms | Full local required suite including the original 50 cases. Later changes are UI/artwork/docs and a semantics-preserving reference-C formatting repair; CI verifies the final head separately. |
| Same receipt, 450-cycle test | 9000 cumulative bytecode words, 40 live at end, 0 versions after delete; 6 fixed arenas, slots1/3/2 reused | Exceeds original8192-code/256-dictionary monotonic limits. Core+workspace fixture resident7078/162 and tape169164 stayed fixed. Stress elapsed457751.376ms; not isolated latency. |
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

## Final46-road browser follow-up

`browser-final-custom.txt` and `browser-final-step2.txt` record a new61-byte conditional source with multiplier7, publishedv2 using keyboard alone at390px with reduced motion. All three v1 pins and in-flightpositions were retained. `browser-final-inflight.8i` is the actual Chrome download; `browser-final-image-cli.txt` reads46roads, both versions, full stored source and returns37 for duration2/toll5 in a new CLI process. This is a different custom rule from the earlier44-road multiplier6 experiment.

`browser-final-restored.txt` verifies the repaired importer: it installs the native stored draft into the editor as well as the active source. `browser-final-corrupt-import.txt` verifies malformedJSON refusal with the current source and step2 half-trips unchanged. The earlier attempt exposed the stale-editor defect, recorded and repaired in journal.md. `browser-final-invalid.txt` verifies incomplete source rejection whilev2 and live pins remain.

`browser-final-comparison.txt`, `browser-reproduction.json` and `browser-reproduction-cli.txt` are now the final46-road fresh15/22comparison: Harbor Bridge open both, same three logical steps, exact output bytes reproduced in a new CLI. Earlier44-road receipts are retained under `before-third-bridge-*` where replaced. Other earlier browser receipts explicitly remain development evidence.

## Author boundary review

Reviewed the native/host data flow and production imports, not just file size or language proportions. Concrete findings repaired during this build include candidate reference acquisition, while/repeat stack joins, numeric token fallback for `0=`, old arena identity versus serial identity, compilation after refused source storage, immutable captured road duration, invalid rule argument leakage, generation-wrap cache invalidation, comparison baseline ownership and incomplete hard-paused replay transcripts. See journal.md and the associated tests.

The production executor sees only BF commands and bytes. Source interpretation, module allocation, version meaning, route costs and delivery decisions remain in native Thread. The renderer selects graphical appearances, projects emitted coordinates and interpolates only two observed states. Native roads alone establish connections. Tree/plaza decoration supplies no traversable edge, collision or route. Bridge art is aligned to an existing edge; it cannot open or create one. Inter/Phosphor are vendored graphics/font assets; image_gen is only an asset authoring tool. The only npm dependency is pinned build-time wabt. No production oracle, prerecorded expected city or alternate host simulation is imported.

The automatic manifest audit is a heuristic review gate, not a semantic proof. Reproducible generation and differential execution are separate evidence. Sources, artifacts, local behavior, CI and deployed public bytes require their own receipts.

## Release gates and closure

The final local visual comparison and repaired public functional verification passed. The final repository closure still uses current-head CI and normal PR merge; the immutable tag and matching final metadata deployment are bound by the final-deployment.json release asset linked from publication.json. The first failed publication and exercised rollback remain in the record.

## Final local gate closure

The final qualitative visual review passed: see `../../design-qa.md` and its same-scale combined images, overlay and focused comparisons. This is the sole author's judgment, not an independent audit or pixel-equality claim. Fixed ornamental lights and perimeter planting are presentation-only.

The import candidate now reads its own active source and draft before replacing the current worker. `import-session-replay.json` replays five actual UI-transcript inputs from `browser-final-inflight.8i`; `import-session-replay-cli.txt` reports PASS with output SHA-256 `8a308daae1764080d7acc1cd35e842cc38f042c5095b9da7da3563388d0baf82`. This particular verification bundle was assembled from the observed DOM raw log because the in-app browser's download was not recovered; it is not claimed to be that downloaded file. The separate Chrome comparison download was recovered and replayed directly.

`final-ui-checks.txt` passes the seven relevant image/presentation/boundary tests after the import and final renderer edits. Linux CI on4f8cc07 passed both push and PR runs, including all74 tests; the first GCC-only failure and semantics-preserving formatting repair remain recorded. Final implementation head CI and public release checks are still separate gates.

## Repaired public release

`repair-full-local-tests.txt`: 76/76 required checks, zero failures/skips, 542348.846417 ms. Two added presentation tests prevent stale-session/version tables, incomplete tables and wrong ordering. Native kernel and guest code are unchanged from the fully tested base.

`publication.json` and `deployment-version-3.json` bind repair94bb507 to the existing public Site. `public-assets-version-3.json` verifies all71 public files anonymously, including69 exact files and two inspected HTML insertions. `public-v3-*` receipts show fresh boot, custom9/+2 source, activev2 with v1 pins, incomplete-source refusal, real export, new worker import and continued native arrivals. A damaged image was refused and the preserved city continued. `public-v3-repaired-inspector.txt` shows the actual score34 route with explicitly missing historical costs.

The actual new451513-byte `public-v3-inflight.8i` is byte-identical to the same prior native sequence, and a fresh CLI returns47 for duration2/toll5. `public-v3-reproduction.json` is a new actual Chrome download from two new public calculations; `public-v3-reproduction-cli.txt` passes exact output replay for scores15/22 with Harbor Bridge open in both. The new public viewport screenshot is1487x1058 at DPR2; the original reference comparison uses the local DPR1 initial-state screenshot. Screenshot acquisition failures are operator-tool evidence, not silently counted as successful screenshots.
