# Build004 measured costs

Final source/image05, measured2026-09-17T21:29:34Z. AppleM5 MacBook Pro,10logical
CPUs,32GiB RAM, macOS arm64, Node22.22.0/Wasm; Python3.14.3 generates artifacts.
`tools/measure-synthesis.mjs` runs three sequential fresh native boots and three
fresh-image autonomous runs in one Node process. All other task-owned native tests,
replays and browser advancement were stopped (metrics-run-03-context.json). Other
OS/background activity was not globally controlled. Results are in metrics.json.

| Actual BF operation | Minimum ms | Median ms | Maximum ms |
| --- | ---: | ---: | ---: |
| Cold native platform compilation | 33649.78 | 33820.34 | 52826.69 |
| One live scheduler round | 826.62 | 844.14 | 853.20 |
| Complete native state output | 1116.94 | 1122.71 | 1136.16 |
| Stored source output | 87.35 | 87.98 | 88.74 |
| Whole heap/workspace context copy | 5.70 | 5.84 | 5.86 |
| Whole context clear | 13.74 | 13.80 | 13.97 |
| Native search initialization | 83.96 | 84.05 | 86.19 |
| Generated source construction | 847.67 | 853.43 | 855.09 |
| Candidate compilation | 3040.23 | 3055.73 | 3076.11 |
| Four real trial rounds | 4102.45 | 4117.67 | 4143.08 |
| Trial score | 158.58 | 159.70 | 160.77 |
| Rejection and reclamation | 23.76 | 23.92 | 24.19 |
| Publication call including live/trial work | 8618.51 | 8735.16 | 8776.35 |
| Opaque image export | 40.42 | 41.39 | 43.46 |
| Opaque image validation/import | 81.12 | 88.42 | 92.80 |

Every autonomous run actually accepted candidate5 at round25. Through round26,
raw autonomy-step execution totals128.67–129.16seconds (median129.12seconds),
excluding the separate renderer/state-output cost. Publication8.74seconds is the
whole call: live work, final trial work, scoring, source publication and cleanup.
It is not an isolated compiler or publication primitive timing. Component probes
use privileged raw Thread in disposable machines and are not acceptance evidence.
The first platform compilation52.83seconds includes a colder generic executor;
later native boots in the same process are33.65–33.82seconds. These are fresh guest
boots, not three independent OS processes. Artifact load was854.64ms once.

The BF tape occupies1,878,828bytes (939,414unsigned16-bit cells). Peak host RSS was
720,800KiB (703.91MiB), which includes the executor, programs, temporary images,
Node and allocator retention; it is not the tape size. Fixed resident capacities
are32,768code words and512dictionary entries. Actor/trial/version capacities and
limits are listed in README and docs/synthesis.md. Each measured input has explicit
limits of2e14BF instructions and3e10generic executor blocks.

## Observed browser experience

The final local zero-click image05 journey accepted at25, constructed at37 and
completed97. The observation of completion was834226ms after navigation, with
other regression and reproduction workloads running. This is an upper bound that
includes sampling delay and competing load, not a clean completion benchmark.
The first accepted-state observation was299988ms after navigation at round40.
A prior UI-control automation roundtrip during native work took373ms; this includes
browser automation overhead and is neither internal event latency nor a p95 claim.
Keyboard/focus, pause/resume, queued interference, source errors and scrolling were
also exercised in the real UI; see verification.md and design-qa.md.

Native scores17689→17699 and held-out17690→17698 measure useful work under the
stated logical horizon. They do not mean wall-clock acceleration. Build003's older
M5 first-round2.152s and presentation1.362s are historical observations of a different
profile. This run is not a controlled comparison and claims no measured speedup.
Visual interpolation remains separate from the native simulation rate.

Earlier metrics-before-final-guards.json and metrics-run-01/02.txt are retained
historical attempts, not substituted for these final samples. Literal-reference
instruction counts and test runtime are separate evidence, not visitor timings.
