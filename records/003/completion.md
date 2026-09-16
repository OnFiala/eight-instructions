# Complete native construction — current candidate

`node tools/industry-probe.mjs 250 --initial-image` completed both stations at
logical round183from the released round-zero image. It used the actual BF
kernel c6ee32e0 and source e10c7d82, not a predicted event trace. Every round
checked the96raw-equivalent material account and refused any native fault.

Final native output:14cargo transfers,24panels produced,8installed in each
station;48raw units and8remaining panel/escrow equivalents plus16installed
panels account for all96units. Lifetime jobs16, reclaimed14at that observation.
Total executor instruction count2827660437093843includes the initial image's
prior BF work and diagnostic queries; it is not a speed metric. This run was
concurrent with browser verification, so its per-round wall times are diagnostics,
not the isolated measurements in metrics.json.

Full input/output and identity are retained in industry-final-completion.txt.
The CLI check does not substitute for completion through the visible browser UI;
that separate run includes an own faulty factory program, rollback/repair and
individual vehicle pause/resume.

## Independent visible browser completion

The actual browser main scenario completed East station at round142 and West at
round164. It included an own factory source fault77, rollback/explicit repair,
bridge closure/reopening, and Van01 paused from87to107. At exported observation173,
both stations had8installed panels,26production completions and15cargo transfers.
The material account remained96. `browser-complete.txt` retains the BUILD events;
`browser-complete-import-source.txt` confirms fresh-instance restoration and the
intentional difference between stored failing draft and active restored version.

## Actual capacity queue, separate input experiment

An actual round17browser image advanced through9ordinary CLI scheduler rounds to26.
The browser imported it and paused Van04 while it owned a road. By round60Van03
was waiting for road capacity with3panels. Resuming Van04 released that road on
arrival62; Van03 departed63with its same cargo. `browser-capacity-queue.txt` and
`browser-capacity-released.txt`, with screenshots, are observed BF output. No state,
position, route or queue fixture was injected. This changes external inputs and
is not the same experiment as the untouched183-round baseline.
