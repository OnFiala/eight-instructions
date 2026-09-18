# Build 004 visual repair

Status: local corrective verification passed within the scope below; GitHub CI and public deployment pending.
Sole author and reviewer: Astra xHigh. No subagents or independent-review claim.
Starting commit: `8b0bb4e4cc9f40209ba994d79cabf2ff9d000993`.

## Reopened acceptance

On 2026-09-18 the owner rejected the published scene: buildings were misplaced,
streets appeared disconnected and vans barely moved. The previous broad visual
PASS is withdrawn in `design-qa.md`. The original release, tag and failed review
remain unchanged as historical evidence.

The actual public scene is captured in `screenshots/01-rejected-public-desktop.png`.
The approved Living Dispatch image remains the architectural direction; it does
not prescribe native buildings, roads, resources or a simulated outcome.

## Root causes and correction

- Every building used the same approximate bottom anchor, despite different
  transparent margins and ground contacts. The ground had also been flattened to
  0.43 while the artwork retained its own isometric angle. Measured three-corner
  registration now puts each building phase on the same service-node parcel.
  The ground uses 0.58, walls stay vertical, and the camera fits that geometry.
- Each street painted its curb after the previous street's asphalt. Intersections
  were cut by later curbs. Network-wide material passes now share native junctions;
  markings stop before the intersection. No graph connection is invented.
- A fixed 600 ms animation followed expensive BF operations. Position interpolated,
  but painter depth and facing jumped to the new native state. Display duration now
  follows measured operation time (350–12,000 ms); depth, lane and orientation use
  the same observed world point. Repeated observations preserve unfinished motion;
  a new observed leg finishes the preceding leg before a turn. No extrapolation,
  host route search or animation of native waiting is allowed.
- Ground paving was regenerated during every animation frame. It is cached until
  a camera or size change. Building/vehicle ordering remains dynamic.
- Building and vehicle labels now share collision spacing. Labels can move; their
  connectors remain attached to the observed entity location.

An intermediate registration distorted vertical walls. It was rejected and fixed
by preserving verticals and fitting the artwork's slight asymmetry as a rectangular
footprint. `02-registered-plots-diagnostic.png` shows the corrected registration.

## Verification evidence

- `focused-tests.tap`: seven new spatial/motion regressions and five existing parser
  tests pass. Coverage includes footprint clearance, vertical walls, junction
  endpoints, multi-second interpolation, retained arrival direction, turning
  without crossing a block, missing ticks/imports and same-round inspection, plus transient zero/small viewport dimensions.
- `artifact-verification.log`: deterministic kernel/executor/assets, all three
  archived builds, boundary audit and a fresh BF boot passed. The initial image
  remains `68b23214dfea7dbabc6551e23e40025bcc74f4b8224fc1ab816583d529cdd7e7`.
- `live-first-pass.json` and `live-second-pass.json`: two fresh local BF runs from
  the zero-round image reached round 97, with both construction goals complete.
  These are actual browser output, not the labelled diagnostic replay.
- `live-motion.mp4`: 32.808 seconds of actual local BF browser frames, using their
  CDP timestamps. It includes native waiting, an actual bridge crossing and the
  workshop becoming a factory. The captured surface is cropped by the browser;
  it is motion evidence, not full-viewport layout evidence. No interpolation of
  video frames, synthetic traffic, accelerated playback or soundtrack was added.
- A separate local diagnostic replays previously recorded native output, explicitly
  labelled as recorded. All 22 position changes in its adjacent observed pairs
  produce interpolation; gaps snap rather than inventing a missing route.
- `screenshots/09-live-mobile-valid.png`: actual completed BF world, CSS 390×844,
  density 2, full clip captured beyond the underlying browser surface. DOM width
  and scroll width were both 390. Camera, goal and controls remain separate.

Some browser captures during device-density changes were cropped, scaled or tiled.
Files 04–08 and 10–15 are rejected capture attempts, not acceptance evidence.
File 03 still shows round 62 (the slider initialized after an early keypress);
its filename is not proof of completion. These attempts remain visible.

## Boundaries and remaining work

The kernel, guest programs, executor, persistence, initial image, native topology,
reproduction bundle, all original artwork and Build 001/002/003 archives are
unchanged. Only rendering, its measured-duration input and verification/docs change.
Native BF waits can still last seconds; the renderer never disguises them as
continuous guest computation. Geometric checks and screenshots are finite evidence,
not a pixel-match or comprehensive accessibility guarantee.

Public correction is pending applicable CI, merge, exact Site publication and
post-publication verification. The existing `build-004` tag must not move.


A transient diagnostic viewport smaller than its overlays exposed a new negative
scale and an exception that left the cache context selected. This failure was
fixed with positive scale bounds, a zero-size resize guard and `finally`-protected
context restoration. It is covered by the seventh regression; the final source was reloaded and the 390×100 diagnostic viewport was restored to
1487×1058 without new console errors. Publication remains pending.


Final source browser evidence:

- `screenshots/17-final-completed-desktop-valid.png` is the final renderer at
  CSS/pixel 1487×1058, density 1, scroll top, after restoring the real round-97
  export into a new BF worker. The earlier full fresh runs establish native
  completion; this capture establishes final presentation, not a third fresh run.
- `final-browser-checks.json` records the final source commit, import, small-height
  resize recovery, actual bridge closure and native output. The new Riverside
  factory remained selectable through the inspector. Reopening uses the same
  native command path. Reduced-motion display was exercised without console errors;
  interpolation refusal is also covered by the focused regression.
- The previous device-density capture attempts are deliberately not accepted.
  A new tab, density 1 and an unclipped desktop capture produced the valid final
  evidence. Mobile used density 2 and a complete viewport clip. Different capture
  scopes must not be passed off as pixel-matching evidence.
