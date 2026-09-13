# Build 002 visual and interaction QA

Result: **passed** — a qualitative, same-author review of the selected Living Dispatch direction. This is not pixel equality, an independent design audit, or a WCAG certification.

## Source and capture

Only [the approved first concept](records/002/reference/approved-living-dispatch.png) was used. It is the exact1487×1058PNG with SHA-256 `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`. The final [desktop capture](records/002/visuals/desktop-initial.png) uses Chrome,1487×1058,DPR1,scrollY0,loaded local Inter, actual BF step1/v1 with three in-flight pins. It is a screenshot of the functioning interface, not the concept painted behind controls.

The reference and implementation were inspected together at the same scale, then in focused regions. These files contain both images in one raster, with labels above the image area:

- [Full comparison](records/002/visuals/reference-vs-implementation.png)
- [50% overlay](records/002/visuals/reference-overlay.png)
- [City, material and perspective detail](records/002/visuals/reference-city-detail.png)
- [Module-panel detail](records/002/visuals/reference-panel-detail.png)
- [Typography detail](records/002/visuals/reference-type-detail.png)

No pixel-difference percentage is presented as an aesthetic score. Pillow only assembled comparison evidence; it did not author or repair production artwork.

## Iterations and resolved findings

| Finding in earlier captures | Severity then | Final change / recheck |
| --- | --- | --- |
| Compound building sprites looked miniature; city was sparse and the camera too steep | P1 | Replaced repeated compounds with individual stone/café/flat-roof houses; enlarged landmark blocks and changed projection to a33° ground-axis slope. Captured and compared again. |
| Only two crossing roads left a material difference from the three-bridge reference | P1 | Added a real third free bridge in native Thread, including46-road tests, new measurements and regenerated replay. Art alone did not invent the connection. |
| Overlarge bridge art, bare fountain shapes and sparse foreground | P2 | Rescaled art to the middle70% of existing native edges; installed generated fountain assets, foreground old-town detail, peripheral planting and warm street lights. |
| Trees or labels covered vans; the mobile goal label clipped | P2 | Vehicles are a legibility overlay at their observed native positions; labels moved and the rightmost mobile label aligns inward. |
| Mobile controls were small and city left excessive vertical space | P2 |44×44px transport controls,360px city stage, stacked editor, visible keyboard focus. Recaptured390×844. |
| Import restored memory but left the editor showing the old draft | P1 interaction | Read candidate active source and stored draft from BF before accepting the image; actual browser restoration and byte-exact CLI replay pass. |

No unresolved P0/P1/P2 defect was identified in the tested final surfaces. Judgment is explicitly limited to the recorded viewport and flows below.

## Five visual surfaces

**Fonts.** Locally served Inter Variable preserves the heavy sentence-case headline and compact body hierarchy. Monospaced identity, source and evidence distinguish the language from the illustration. At1487px the headline is71.97px. The reference's exact unknown typeface was not claimed to be recovered.

**Layout and spacing.** The live city dominates the left1051px; the right panel starts atx1059,y197 and is404px wide. The bottom evidence strip begins aty894. The headline, right panel and trace align closely in the overlay. On narrow screens the scene remains first and the full editor follows it; no horizontal document overflow was observed at390px or900px.

**Colors and light.** Dark green-charcoal ground, pale stone, warm windows and lamp light, lime routes/actions, muted blue water and brass toll bridge follow the reference. Retained/free memory and closed roads have distinct presentation. Error and status copy supplement color.

**Images and scene.** The city has detailed building materials, trees, quays, three bridges, fountains and three native vans. It is a2.5D composition of raster art and projected geometry. Roads, directed marks, closures and last planned routes come from emitted guest data. The exact illustrative block map and building placement are adapted to the tested16-node graph; paths, labels and counters are deliberately factual. Repeated architectural types, orthogonal native street blocks and the silhouette differ from the artist's continuous illustration. They retain its composition and material direction; this review does not assert an identical city or pixel match.

**Copy.** Brainfuck (BF) programming language and all eight instructions appear at first meaningful mention. “Design concept”, “Example trace” and hidden-source claims have been replaced with an editable Thread program and observed native results. The UI explains that a moving van finishes its current road and that a later departure uses the active version. Recorded comparisons are labeled separately from new computation.

## Interaction and responsive evidence

[Mobile](records/002/visuals/mobile-initial.png), [tablet](records/002/visuals/tablet.png), [keyboard focus](records/002/visuals/mobile-focus.png), [refused source](records/002/visuals/desktop-refused.png), [closed bridge](records/002/visuals/desktop-closed-bridge.png), and [comparison result](records/002/visuals/comparison-result.png) supplement the initial desktop state. State receipts and exact native outputs are linked in [verification.md](records/002/verification.md).

Keyboard-only editing and Apply published a new61-byte rule with reduced motion enabled. Focus was visibly3px light blue; the skip link reaches the editor. Native stepping, custom publication, refusal, closure, rollback, module creation/deletion, comparison and workspace export/import were exercised. Canvas has a changing text alternative and an ordinary vehicle select; it is not the only access to state. Reduced motion disables transition animation and observed-position interpolation.

Physical mobile devices, Safari, screen-reader task completion,200% text zoom and a complete WCAG audit were not run. The mobile and tablet evidence is viewport emulation. Native operation latency is visible and may take seconds; the animation is not a claim of native simulation frequency.
