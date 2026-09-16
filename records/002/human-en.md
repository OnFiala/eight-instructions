# A city whose rules you can rewrite

The first stage built a small computing environment in Brainfuck: it could run programs, keep data, find routes and save its entire state to a file. The second stage adds something more practical. A program can have its own stored source and several live versions. You can change it without discarding unfinished work, and reuse memory from versions that are no longer needed.

On the website, this becomes a small delivery city. You see roads, three bridges across a canal and three vans. A real BF machine computes their routes and logical steps. The picture can move smoothly between two known positions, but a new logical step may need several seconds of computation.

Try one precisely repeatable experiment. The original rule scores a road as travel time plus toll. The first van takes a route from the depot across the paid Harbor Bridge to Central Square, with a score of **15**. The editor contains this source:

```text
: delivery-rule.thread
  8 * +
;
```

This version multiplies the toll by eight. Click **Compute both versions** below the city. Two new machines really start from the same initial snapshot and receive the same three logical steps. The original program returns `12 → 8 → 9 → 10 → 11 → 15`, score 15. The edited program chooses the northern toll-free bridge: `12 → 8 → 4 → 0 → 1 → 2 → 3 → 7 → 11 → 15`, score **22**. The paid bridge remains open in both cases. The program changed; the conditions did not. The score includes the toll weight; it is neither seconds nor animation frames.

**Apply new module** sends your source to the currently running city. The text is first actually stored in BF memory and then compiled from there. A van in the middle of a road stays on its current segment and finishes it. Its next departure from a junction uses the current program. The city, destinations and completed work are preserved.

You do not have to keep the prepared multiplier. Change the number or write a condition. One validation used a rule meaning "add two to the travel time on a toll-free road; otherwise multiply the toll by nine." It compiled in place without a new kernel. For travel time 2 and toll 5, it returned score 47. After exporting an active city and importing it into a new machine, the first van chose a route from its actual position across Market Bridge, score 34. This is a different experiment from the 15/22 comparison from a shared starting point. If your source is invalid or exceeds the fixed space, BF refuses the new version and retains the working program. **Undo change** restores the previous version. Old versions still in use remain in memory; the others can free space for another change. The bottom strip shows the actual six arenas, rather than a decorative percentage.

History retention is bounded. The machine keeps one previous version for rollback and additional versions only while live references still need them. Hundreds of replacements really reused the same fixed memory. The test compiled 9,000 code words in total, but only 40 remained live at the end; deleting the module left no version. These numbers come from BF output.

Why is this still Brainfuck when the editor does not show long strings of brackets? **Brainfuck (BF) is a programming language with eight instructions: `> < + - . , [ ]`.** Thread is a more readable language built inside its machine. BF reads, compiles and executes Thread source. The new source, module and city managers are also Thread programs ultimately executed by the actual BF kernel.

Other languages help at explicit boundaries. Python constructed the initial kernel. JavaScript and WebAssembly generically execute the eight BF instructions; JavaScript also handles the editor, files and drawing. Buildings and vehicle appearances are graphical assets created with an image tool. None of these host components chooses routes or completes deliveries on BF's behalf. This does not claim that BF draws 3D graphics or that the initial kernel wrote itself.

To see where a specific result came from, **Inspect this decision** shows the road input, the version used and the actual BF output line. It shows costs only when their record was actually emitted in that session; older history may be missing after import, and the inspector says so explicitly. **Download reproduction bundle** downloads the initial snapshot, inputs and expected outputs for a fresh CLI run. A whole-workspace export instead preserves your sources, versions and vans partway through their journeys so a new instance can continue. The website does not automatically save your work elsewhere.

The interesting part is more than finding a way to show something in an unusual language. It tests whether one coding agent can build an environment from eight instructions where programs can really be changed, errors safely refused and work continued with your own data. The city makes those consequences visible. Source, limits, actual failures, repairs and measurements remain in the project's open record.

*Material for a post, not a published post. The Build 002 record identifies the particular release and public verification status. The author's self-review is not an independent audit. This English translation describes Build 002; its matching source and artifacts remain at tag `build-002`.*
