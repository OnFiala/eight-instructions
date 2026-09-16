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
