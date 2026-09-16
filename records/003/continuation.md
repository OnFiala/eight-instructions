# Build003 continuation — release verification pending

Canonical /Users/ondrej/BRAINFUCK; sole Astra xHigh, no subagents. Branch
build-003-development, pushed implementation f9ca7e5cdb5e9f450aeeb2dbe38413a7716d735f.
Draft PR3: https://github.com/OnFiala/eight-instructions/pull/3 . Main/tag002 remain
on a80087662a66e7d04c1fc77cbce87cf996d60e63. No Build003 tag or public deployment yet.

Current kernel c6ee32e0f2f54738f1574b612dfe85c619d691285dc40af870f96d8e0e28558c;
native source e10c7d82a680129247929d9bd2f57dabf7bf5614e183e265c75531d698783e86.
Round-zero image 18b27dc6dca3e1ca1fa1904ce36ba5ec0383b1ec281312de6bc58716f42c4f04.
No native changes after final113-test local suite. Final presentation adds one
meaningful regression: exact current CI runs114tests. PR run35039078395 and push35039074483hit the45-minute job timeout. Full logs show
78reported passes/0failures, incomplete. CI repair partitions every test exactly once
into three jobs with an all-success verify gate,90min job budgets and60min process
reference deadline. Native workloads/assertions remain unchanged. The next pushed
repair commit and its CI must pass before publication.

Local113/113full suite PASS,974272.576875ms; final UI/framing5/5PASS. Original76
regressions preserved. Literal whole-state comparisons cover limited native
mailbox/process/module work, not a complete industrial simulation.450process
lifetimes and467job lifetimes exceed fixed reusable capacity without a leak.

Actual current native CLI default world completes both stations round183. Actual
browser main scenario includes own factory failure/rollback/repair and van pause;
East completes142, West164, exported/restored completed world at173. Separate real
capacity experiment: paused Van04 blocks Van03 carrying3panels at60; resume leads
to arrival62 and waiting Van03 departure63, cargo retained. See completion.md.

Isolated metrics.json and measurements.md are complete. BF tape797408bytes;
host peakRSS484.84MiB separate. Median cold BF boot34.663s, first scheduler round
2.152s, native edit/compile/publish3.126s. No native frame-rate claim.

Offline ZIP both67-input comparisons PASS in a new CLI; actual browser comparison
batch3vs6/12rounds also replays exactly in a new CLI. Published64round reference
batch3vs5 has14vs16panels,7vs6deliveries,3vs0installed, account96both. No prescribed
winner or timing-speedup claim.

Final desktop1487x1058 and narrow390x844 checked, keyboard edit/rollback, reduced
motion, fault/repair, road queue, own source, import refusal and completion covered.
Final target side-by-side and overlay reviewed; see visual-checkpoint.json for
honest composition differences and bounded accessibility scope. Final screenshots
and walkthrough are evidence-only additions pending final record commit.

Existing Site rollback is prepared in rollback.md. Exact f9 source projection
.local/site-release-003-functional has Site Git HEAD
a83ca885d7edb2f40b84441f378d786ce4e86bf7 and packaged145publicfiles. It extends the
previous Site source history; no force push. Package receipt site-package-functional.json.
Site source has been fast-forward pushed; saved version5is appgprj_6aa2da2a6c9081919e4eace763a4f4a0~appgver_4ddfc34ee34c8191be7b637ef8d6e622.
It has NOT been deployed. Use existing native Sites tools, existing
project ID in .openai/hosting.json, package helper, then anonymous asset identity
script .local/verify-public.py and actual public browser own edit/refusal/loop/
export-import. Do not treat a successful publish call as public acceptance.

Remaining: exact-head CI, normal protected GitHub merge, existing Site update and
public verification, final metadata/receipt, tag003/release assets, CORTEX outcome.
Do not claim completion before these gates. Update this checkpoint at release.
