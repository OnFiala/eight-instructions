# Build 004 visual repair — acceptance reopened

Current status: **local corrective checks passed; CI and public correction pending**.

On 2026-09-18 the owner rejected the released visual result: misplaced buildings,
disconnected-looking streets and vans with inadequate movement. The earlier broad
visual PASS below is withdrawn. Static screenshots and native correctness did not
establish satisfactory spatial registration or continuous visual behaviour.

The correction and its separate evidence are recorded in
[`records/004/visual-repair/README.md`](records/004/visual-repair/README.md).

---

## Historical release review — rejected by the owner

### Original Build 004 visual and interaction review

Original author result: passed (superseded by owner rejection)

This is the sole Astra xHigh author's finite local review, not an independent
accessibility audit. GitHub CI and public deployment are separate release gates.

## Visual truth and comparison

Source: `records/004/reference/autonomous-living-dispatch.png`, 1487 × 1058 pixels.
It is an art-direction image with illustrative buildings and quantities, not a
runtime recording. The original approved Build 002 reference remains preserved.

Final desktop: `records/004/screenshots/completed-desktop-final.jpg`, 1487 × 1058
pixels and CSS viewport, density 1, scroll0. This is actual completed native round97,
exported from the zero-click journey and restored for final rendering verification.
The earlier accepted/live round53 is `screenshots/final-desktop-03.jpg`.
Paths in this paragraph and below are relative to `records/004/`.

Combined full-view evidence is `screenshots/comparison-side-by-side-02.jpg` and
`comparison-overlay-02.jpg`. Both contain the exact source and browser pixels,
placed at equal sizes in local diagnostic HTML; the overlay uses 50% opacity.
`comparison-header-detail.jpg` compares the exact unscaled header crops together.
`visual-comparison.json` records hashes, normalization and rejected capture attempts.
No generative tool assembled the evidence. Native state differs from the illustration;
this is a composition review, not a pixel-match claim.

Narrow: `screenshots/completed-mobile-top-final.png`, CSS390 ×844, physical780 ×1688,
density2. Tablet: `screenshots/tablet-final.jpg`, CSS/pixels820 ×1180, density1.
DOM measurements confirm no horizontal page overflow. Device-density failures and
tiled compositor captures are labelled invalid in the comparison receipt. They
are not acceptance screenshots. Overrides are temporary and removed after QA.

## Findings, repairs and repeated verification

| Finding | Repair and final evidence |
| --- | --- |
| P2: invalid import retained the city but hid its error inside the closed inspector. | A visible global error surface reports refusal; `browser-invalid-import-fixed.json` proves retained round87 and visible feedback. |
| P2: narrow inspector exceeded viewport height and hid final controls. | Explicit dynamic-viewport height and internal scrolling. `mobile-inspector-final.json` reports top12/bottom832 inside844px, scroll358.5 and final control bottom812.93; `mobile-inspector-final.png` shows it. |
| P2: mobile camera put northern buildings behind the goal panel. | Smaller projection with a lower origin; completed-mobile-top-final shows the native district between the goal and controls. Selected labels are raised to separate them from vans. |
| P2: nearby vans at different native positions had overlapping labels. | Bounded presentation-only callout spacing and connectors retain their observed positions. Completed-desktop-final and completed-mobile-top-final show both labels. |
| P2: completed-looking artwork represented an unpaid workshop. | Survey/frame assets now follow installed material; the first screenshots and final completed state show distinct phases. Asset provenance is in assets.json. |
| P2: desktop city extended below its stage. | Flatter projection and revised asset placement; the complete native district and controls fit the desktop capture. |
| P2: queued intervention remained pending after an exact BF resume. | Resume flushes it at the input boundary; image replacement cancels inputs for the old instance. browser-queue-resume-fixed.json verifies the actual road change after interruption. |
| P2: direct ZIP link produced no downloaded file in IAB. | Fetch unchanged bytes and use the existing Blob-download transport. reproduction-gui-download-03.json records the actual file and matching hash. |

Earlier captures and failed checks remain in the build record. The final combined
comparison was made after the camera, labels and interaction repairs. No actionable
P0/P1/P2 finding remains in the tested viewports and flows.

## Fidelity surfaces

Typography keeps bundled Inter, a strong white heading, subdued explanation and
monospaced evidence. The full-size header comparison shows intentional differences
in headline width and factual status content; there is no broken wrapping. Mobile
uses two headline lines. Source is a selectable, editable native textarea.

Layout keeps one goal, one optional bridge action and compact controls around the
city. Mobile uses40px primary controls and an optional scrollable inspector. Tablet
and desktop keep all native entities and controls available. The smaller real
world has fewer buildings and a narrower canal than the illustration; its density
is deliberately constrained by the real topology and paid construction.

Charcoal surroundings, warm architectural materials, canal blue, foliage and lime
follow the selected direction. Orange represents faults/closed passages. Raster
architecture has recorded provenance and actual transparent asset boundaries;
there is no city mockup behind controls. Camera icons and arrows remain consistent
with the earlier working interface. Native labels carry exact stock and cargo;
only adjacent observed states are interpolated. There is no fake thinking animation.

Public copy introduces Brainfuck by name and explains finite capacities, local
computation and unavailable old event history. Main status follows native records.

## Actual flow and state evidence

The untouched final-image journey accepted candidate5 at round25, built the factory
and road at37, retained its baseline after equal-score searches at73 and97, and
stopped at97 with both sites3/3 and9deliveries. `browser-final-zero-click-completed.json`
contains retained native decisions and no console errors. The observed completion
upper bound834226ms includes concurrent test/replay load; it is not a benchmark.

Actual UI checks covered loading, live/testing/accepted/rejected, a closed bridge,
manual invalid-source errors, finite completion, native pause/continuation, export,
new-worker import, draft retention across selection, manual publication/rollback,
explicit automatic opt-in, and a looping participant repaired to increment its
private state. Relevant browser-*.json receipts preserve the actual raw output.
The pending-round81 import also matches a fresh CLI byte for byte.

Keyboard Enter opens the inspector; Escape returns focus to Inspect and updates
aria-expanded. Native rounds66→69 and deliveries5→6 continued under reduced-motion
preference with no errors (`browser-reduced-motion.json`); scene interpolation is
disabled under that preference. The final inspector also passed internal scrolling.

## Remaining limits

This is not comprehensive screen-reader, color-contrast or browser/device
certification. Additional physical-device and text-zoom combinations are untested.
P3 polish could refine decorative waterfront density and long object-label layouts.
The evidence does not claim literal visual equivalence to the art-direction image.
