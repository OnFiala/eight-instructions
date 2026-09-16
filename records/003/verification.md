# Build003 verification map

Same Astra xHigh author performed implementation, tests and self-review. This is
not an independent audit. The release status lives in build.json and the final
deployment receipt; local evidence alone is not a public-release claim.

## Final native candidate

`verify-candidate-01.txt`:113/113PASS,0fail/skip,974272.576875ms. Kernel SHA-256
c6ee32e0f2f54738f1574b612dfe85c619d691285dc40af870f96d8e0e28558c;
platform source e10c7d82a680129247929d9bd2f57dabf7bf5614e183e265c75531d698783e86.
All76Build002regressions, including Build001coverage, are preserved. Later
presentation/metadata changes do not alter these native identities; exact-head
GitHub CI also runs the full suite.

| Requirement | Executed evidence |
| --- | --- |
| First native milestone before city integration | processes-milestone-tests.txt; journal.md chronology |
| Three distinct user programs, messages and continuation | tests/processes.test.mjs |
| Infinite loop preemption, bounded helper work | tests/processes.test.mjs, tests/process-adversarial.test.mjs; docs/processes.md bounded-work inventory |
| FIFO/full/unavailable recipient, pause/wake, stale handles | tests/processes.test.mjs, tests/process-adversarial.test.mjs |
| Private state and role isolation, local stack/ownership faults | tests/process-adversarial.test.mjs, tests/industry.test.mjs |
| Paused exact versions, queued mail, incompatible schema, rollback | tests/process-adversarial.test.mjs, tests/industry-capacity.test.mjs |
| Material transfer deduplication and explicit repair | tests/industry-protocol.test.mjs; browser-factory-fault/repaired.txt |
| Real road capacity and captured crossing under closure | tests/industry-capacity.test.mjs; road-closed.png |
| Custom priority and stale-loop intent | tests/industry-priority.test.mjs |
|450process create/work/send/receive/stop cycles in16slots | legacy-and-work-cycles-tests.txt; no live contexts/versions after module removal |
|467job lifetimes in16slots, exhausted serial and stale job | industrial-capacity-waiter-tests.txt |
| Failed module changes and arena reclamation | preserved tests/workspace*.test.mjs plus process/industrial tests |
| Whole-image continuation, production, transport, mailbox and old versions | tests/industry-protocol.test.mjs, tests/industry.test.mjs, tests/processes.test.mjs |
| Actual old Build001/002images and matching runtimes | tests/legacy*.test.mjs; incompatible new-kernel imports refused |
| Browser/CLI exact output | browser-cli-parity.json:11actual inputs, fresh current initial image |
| Reproduction ZIP in fresh directory | reproduction-current-fresh-cli.txt:both67input branches PASS |
| Native source/framing and malformed presentation | ui-framing-final-tests.txt, source-version-presentation-tests.txt |

The full-suite literal reference comparison includes native mailbox posting
139460206476BFcommands and one bounded resumed process turn909504001134commands.
Entire tape, pointer, raw instruction position, output and counters match. Other
literal module workloads are preserved, including287970502251commands for pure
module execution. These are representative workloads from BF-produced snapshots,
not a literal execution of the whole industrial simulation. General executor
randomized/differential coverage remains in the full suite. No test oracle is
imported by the live computation path.

## Actual interface evidence

Fresh current browser output and CLI parity are distinguished from earlier
pre-priority development logs. The latter remain useful failure/repair history,
but their source identities are not silently relabelled as final.

- Own loop source was repaired to update private state by7, then yielded while
  the city continued. See browser-loop-repair.txt.
- An unused module can be selected, read, edited, restarted and deleted through
  context controls. The original compile-only interactive-word mistake and its
  repair are retained in browser-source-only-*.txt.
- Actual export/import restored a new instance; a malformed image refused
  replacement and preserved round11. See browser-import-invalid-retained.txt.
- Keyboard selection, batch3→4publication and rollback were exercised at390×844
  with visible focus. See browser-keyboard-edit-rollback.txt and screenshots.
- Current round17export restored at17; reduced-motion step reached18. Direct
  canvas selection chose Eastfactory; MarketBridge closed/reopened through BF.
- Own Eastfactory source `schema# 1 77 fail` faulted at turn19. Other programs
  continued to round25. Rollback and Repair preserved its stock/escrow, then
  round26completed that same panel. See browser-factory-fault/repaired.txt.

The raw browser log is capped at180000characters and inspection at1200events.
Imports explicitly discard earlier event history. Exported machine state is not
presented as a reconstruction of missing history. Browser controls acknowledge
source changes only after BF responds. Camera/selection remain usable during work.

Full-city completion, final visual comparison, downloadable UI comparison and
public checks are recorded as their observations complete; none is implied by
this intermediate map. Accessibility coverage is bounded keyboard/focus/responsive/
reduced-motion verification, not a comprehensive WCAG certification.

## Remote failure retained

First PR3 CI35037577208(and push35037534426) refused stale derived history.json
after build.json's test count changed. It failed before running the tests.
Commit64d0b37regenerates history; no test or gate was removed. The journal also
records earlier native/visual failures, optimizations and repairs chronologically.
