# Build 002 continuation

Active branch: `build-002`. Starting release: `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`.
Current native milestone commit: `b0b2e15` (2026-09-13). Earlier challenge commit: `e3a6bee`.

Read challenge, decisions and journal before continuing. Sole Astra xHigh; no subagents.
User has authorized complete implementation, checks, GitHub and existing Site update.

Implemented: generic kernel key/w@/w! plus4096-word paged workspace; resident code12288
words to fit native workspace/city. Native module compiler/evaluator/lifetime manager
in programs/workspace.thread; city algorithms in city.thread, state declarations in
city-state.thread, raw boot city-boot.thread and city-system.json. CLI --city and worker
boot {system:'city-system.json'} select raw sources. Default legacy system unchanged.
Read docs/modules.md for exact contracts. No host module compiler/simulation added.

Evidence: original baseline50/50; focused kernel/generic/literal27/27; native checkpoint8/8;
optimized workspace5/5 after fixing0= numeric-fast-path regression. Failed and successful
receipts preserved. Initial450-cycle reclaim test PASS:9000cumulative code words,40live,
slots1/2/3 reused within6; deletion0live; residentcp6713/dp162unchanged. It took18.9min
before lexer optimization, with other checks concurrent. Repeat on final source required.
CI timeout45min. Boundary inventory79 components at native milestone, heuristic PASS.

City:16nodes44directedroads(cap48),3cars. Initial module0 delivery-rule.thread source
`: delivery-rule.thread + ;` (26bytes). Proposed source `: delivery-rule.thread 8 * + ;`
is30bytes. Same initialimage firstvehicle12->15 defaultpaidbridge9->10 score15,
variantfreebridge1->2 score22, tollbridgeopenboth. Native adjacency lists and pure-input
cost cache. Car pins oldversion for current edge, duration captured atdeparture, release
onarrival. Native snapshots/images, source bytes and exactdependencies tested.
Exploratory timings M5/32GiB:boot9s,first3routetick~3.97s,movingtick28ms,arrivaltick153ms;
not final performance promises.

Six detailed generated architecture sprites are committed under dist/assets/city/*.png,
13.7MB total, magenta chroma matte. Do NOT use them with visible magenta. Render-time
chroma compositing is planned (pure presentation, originals unchanged). Origin/hashes in
asset-provenance.json. First rejected universityattempt had bakedcheckerboard, not used.
Four individual van-sprite imagegen calls are currently in functions exec cell41;
wait for it with functions.wait and preserve returned files. No subagents.

Pending: complete faithful rendered interface; vehicles/assets integration; sameviewport
side-by-side/overlay QA and otherstates/keyboard/reducedmotion; more adversarial native
tests (randomunpreparedinputs,deliveries,serial/pinlimits,busy,loops), fullreference
workload fornewmodule path (extend generic literalC to resume opaque rawstate ifneeded,
no guest shortcuts), fullregressions and final450repeat, finalisolatedmetrics, actual
browser/CLI parity and export/import, minimal replaybundle verifiedfreshprocess,
legacyBuild001 artifacts preservation and rejectiontest, fullboundaryselfaudit;
README/architecture/persistence/history/doc updates, Czech technical+human explanations,
unpublishedEnglishXdraft+comment; GitHub protectedstandardmerge/CI/tag; existing Site
update withrollback, exactassetchecks, anonymouslivebrowserverification andreceipt.

Exact selected image is in reference/. Current public Build001 remains unchanged.
No preview server or browser tab has yet been started in this Build002 turn.
No GitHub push or Sites publication for Build002 yet. No tagbuild002 yet.

Latest running/finished tool sessions: initialreclaim59573 finishedPASS;
optimizedworkspace52788 finishedPASS; CLIcity21271 output in
/private/tmp/eight-instructions-002-cli-city.txt and image.local/cli-city-checkpoint.8i
(poll/verify completion). Other test output sessions completed; receipts copied.

CORTEX brief read and milestone/450cycle notes recorded successfully. Decisionwrite
timeout was verified by search to have succeeded; do not duplicate. Current runtime
platformmetadata gpt-6-astra/xhigh verified atstart. No codingdelegation orothermodel.
Memory registry used lines232–308 forpriorprojectcontext; cite actualreadlines atfinal
if relying on memory. Mainuserprompt itself is the current authority.
