# 8 Instructions — Build 002: A city you can reprogram

> English translation of the original owner brief. The original wording remains in
> the `build-002` tag and Git history. The owner's later English-only publication
> instruction supersedes the historical request below for Czech handoff texts;
> it does not change the original implementation requirements or permissions.

Continue the project as sole author Astra in xHigh mode. This brief authorizes autonomous delivery of Build 002, from implementation and verification through updating the existing public website and GitHub. I want minimal human intervention. Make routine technical and visual decisions yourself; finish the result and repair discovered problems.

## 1. Project identity and mandatory reference

- Canonical project: `/Users/ondrej/BRAINFUCK`.
- GitHub: https://github.com/OnFiala/eight-instructions
- Existing public website: https://eight-instructions.andrewxix.chatgpt.site
- Last verified Build 001 baseline: `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`, tag `build-001`. Treat this as initial information; verify actual state before starting.
- The selected and approved visual is EXCLUSIVELY the first concept, “A city you can reprogram” / Living Dispatch:
  `/Users/ondrej/Documents/Codex/2026-09-10/referenced-chatgpt-conversation-this-is-an/outputs/stage-2-concept-1.png`
- The original is 1487 × 1058 px; SHA-256: `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`.

Actually open and inspect the image. Save an exact copy in the project as the approved Build 002 visual reference. Do not confuse it with the second or third concept. The visual direction has already been selected; do not request another selection or generate three new alternatives. If the file is unavailable, request only this specific reference and continue independent BF-core work in the meantime.

Before changes, verify the host, working directory, branch/HEAD, dirty/ahead/behind state, permissions and relevant concurrent work. Read the project's `AGENTS.md`, `PROTOCOL.md`, architecture, host/BF boundaries, persistence and Build 001 records. Load CORTEX context for `brainfuck`; record significant decisions and the outcome there. Use current relevant documentation and available tools, not assumed APIs.

## 2. Central goal: Brainfuck

The BRAINFUCK programming language and its eight instructions `> < + - . , [ ]` are the center of this project. Build 002 must substantially increase the capabilities of the system running inside BF. A beautiful city should make those capabilities visible.

Build a small delivery city controlled by Thread programs. Users must store named source, edit it, compile it, safely replace modules and reclaim memory from safely removed versions directly inside the BF machine. The effects of changing a program must be visible in the city's behavior and reproducible.

Preserve the experiment's permanent protocol. You are the sole coding model and author of architecture, implementation, repairs and self-review: Astra xHigh, without subagents or a second coding model. The human supplies the challenge and visual reference, not production code or repairs. An image-generation tool may produce purely graphical assets; transparently record its use and asset provenance.

## 3. Non-negotiable BF / host boundary

The following must happen inside BF:

- Source storage and management, Thread tokenization and compilation.
- Module semantics, bindings, new-version publication, safe removal and memory reclamation.
- City, road, job and vehicle state; simulation rules, logical steps and delivery decisions.
- Selection and evaluation of routes, costs, tolls and user rules.
- Preservation of application data during code replacement and consistent behavior after a rejected change.

Prefer Thread executed by the actual BF kernel for significant new application logic. Necessary kernel changes may use the existing auditable generator; the generator must emit computation, never precompute the solution to a specific input.

Python, JS, Wasm or another host language may provide only justified boundaries: initial kernel and asset construction, generic execution of the eight BF instructions, raw I/O, OS operations, opaque snapshot storage, interface and rendering. The renderer may read BF presentation output and turn it into an image. It must not use Thread word names or application events to compute on the guest program's behalf.

JavaScript may interpolate movement between actual BF states. It must not invent the next route, task, collision, completed delivery or future simulation state. Decoration, camera, lights and building appearance are presentation; rendered road connections and openness must match guest data.

Do not put a substitute compiler, module-semantics manager, guest-object allocator, route solver, simulation or precomputed scenarios in the host. BF's difficulty or slowness does not justify crossing this boundary. Executor optimizations must be generic and semantically equivalent to BF.

Justify every new or changed host component in the boundary manifest: what it does, why it belongs outside BF and why it does not move core logic out. Check dependencies too. Do not defend purity through line ratios, BF file size or GitHub language percentages. Do not force a pointless rewrite of the working bootstrap; minimize new exceptions and maintenance.

## 4. Visual quality is a required part of the result

Treat reference 1 as a mandatory target, not loose inspiration. Preserve its composition, proportions, isometric view, scene richness, typographic hierarchy, dark background, light buildings, lime routes, water canal, bridges, vehicles, right-side module panel and bottom event/memory strip.

I want a beautiful, detailed and coherent small city. Take care with materials, light, shadows, greenery, waterfronts, vehicles, route readability and subtle transitions. Keep the city visually dominant and one main task clear. BF must be visible in the project identity and the path from program change to result.

Work in the existing project and respect its working runtime. Use a relevant workflow to turn the chosen image into an interface, without creating a substitute generic application. Choose 2D/2.5D/3D rendering and how to produce quality assets yourself; use the simplest solution that actually reaches the reference and preserves the BF boundary. Graphics libraries must not contain application simulation.

A static reference image used as a background with buttons on top does not satisfy the brief. The scene must faithfully display actual program state and respond to the user's own inputs. Do not present placeholders, random emoji buildings, temporary boxes or a generic dashboard as the finished result.

The image contains illustrative text and geometry. Preserve its aesthetics but correct factual inaccuracies: module source is Thread compiled inside BF; road directions, paths, counters and memory state must be real. Source must be available and editable. Replace illustrative “Example trace” and “Design concept” text with actual states only after implementation and verification.

Compare an implementation screenshot with the reference at a matching desktop viewport, ideally 1487 × 1058. Check composition, city size, perspective, panel proportions, light, assets, colors, typography and spacing side by side and in an overlay. Iterate on changes and screenshot verification until significant differences are removed. Also document controls in other states, a usable narrower layout, keyboard, focus and reduced motion. Do not claim pixel matching or accessibility without the corresponding checks. A significant remaining visual difference means PARTIAL, not complete.

## 5. Build 002 functionality

Design a coherent, measurable scope: approximately 12–24 nodes, several depots and destinations, and three vehicles. Set final capacities from measurements; keep resources clearly bounded and documented. Do not confuse visual smoothness with native simulation frequency.

Main scenario:

1. A visitor starts the actual machine and sees the city, delivery task and progress.
2. They open a named module, such as `delivery-rule.thread`, and edit a routing rule, such as preferring toll-free roads.
3. Source is stored inside BF and actually compiled from there. It is not merely text left in the editor or host storage with the same name.
4. A valid new version is published at a precisely defined safe point. The city, jobs and other application data remain intact. Document what happens to in-progress journeys, old calls and live references; do not arbitrarily move vehicles to new positions.
5. New decisions demonstrably use the new program. The user can create a custom variant, not merely switch between two prepared results.
6. Invalid, incomplete or oversized modules are rejected with readable diagnostics. The previous usable version remains intact, with no memory leak after a failed attempt.
7. Returning to the previous version and safely deleting an unnecessary module work. The available-old-version policy must be bounded, explained and compatible with reclamation.
8. The user can pause execution, take a logical step, export the whole workspace and continue in a fresh instance.

Keep inputs identical when demonstrating a code change: the toll bridge must stay open for both versions. Closing a road is a separate experiment that changes data. Demonstrate that case separately too.

Autonomously design allocation, bindings, compatibility, safe publication and rollback. Clearly define state ownership and invariants before implementation. Do not weaken the brief by resetting the entire machine on every change or simply increasing capacity.

## 6. Evidence must be visible and reproducible

For a specific decision, show the input, module version, actual BF output and visual consequence. An ordinary visitor must understand a short explanation; interested readers must be able to expand exact data.

Add a comparison of two versions from the same initial snapshot with the same input sequence. Compare identical logical steps. Label historical replay differently from fresh computation. Any algorithm-progress animation must derive from actually emitted events, not guessed decoration.

Provide a minimal downloadable reproduction package: kernel and module identities, a compatible initial snapshot, inputs, expected native output and CLI instructions. Verify its use in a fresh instance. Make rendered results traceable to the output of the BF artifact used.

Derive occupied/reused-memory visualization from actual native state. Report total host-process memory separately from the BF tape. A hash, green badge, attractive animation or increasing counter alone is not proof of BF-native computation.

## 7. Required verification

- Preserve Build 001 regression coverage and fix every regression caused by changes. Explicitly justify contract changes; do not delete tests merely to make them pass.
- Verify a newly written custom user module and unprepared inputs without regenerating the kernel.
- Verify valid and rejected replacement, live references, work in progress, rollback, insufficient memory, module deletion and repeated failures without leaks.
- Run hundreds of replacement/reclamation cycles at fixed capacity. The test must exceed the point where the original monotonic allocation would fail. Measure actual values.
- Verify deterministic simulation and repetition of the same experiment from a fresh machine.
- Verify relevant browser/CLI output parity; also compare bounded representative workloads with a literal reference BF interpreter. Preserve differential verification of generic executor optimizations. Test oracles must not enter the production computation path.
- Verify actual export/import round trips with sources, module versions, data and work in progress. Handle Build 001 image compatibility explicitly: a tested migration or the preserved old kernel with clear rejection of incompatible imports.
- Measure startup, compilation/replacement, logical steps, routing workload and repeated reclamation cycles. State hardware, configuration, limits and methodology. Do not promise unmeasured speed.
- Finish visual comparison of reference and actual interface, control of the complete scenario and an adversarial BF/host boundary review. Correctly label self-review as the same author's work, not an independent audit.

## 8. GitHub, history and documentation

Record all substantial changes in the existing repository. Preserve the real work sequence in reasonable commits, including significant failures, repairs and architectural decisions. Do not fabricate retrospective history or rewrite Build 001.

Maintain `records/002/` according to project conventions: challenge, model/reasoning, starting and ending commits, decisions, journal, host/BF boundary, tests, measurements, visual evidence, asset provenance, limitations, human interventions, protocol violations and final assessment.

Update canonical README, architecture, language/modules, persistence, boundary manifest, reproduction procedure and navigation between builds. After verification, publish corresponding changes on GitHub, pass applicable CI and close the build with identifiable tag `build-002` if it does not exist. Do not overwrite an existing tag. Complete required merges through the normal protected path; do not bypass branch rules.

Preserve Build 001 reproducibility and old artifacts. Distinguish the final implementation commit, any metadata-only closure, tag and specific deployed artifact.

## 9. Update the existing public website

Update the existing project and its current public address. Do not create a replacement website that disconnects project history. Use the existing hosting provider's currently supported workflow; preserve the link between GitHub source and deployed files.

The main experience and current build will be Build 002 based on the approved reference. Build 001 must remain discoverable as the first stage with its explanation and evidence. Update the hero, experiment description, demo, “How it works,” BF/host boundaries, verification, limitations, history and links. Remove outdated claims and numbers from current-build surfaces; clearly label retained historical data.

Write public content in clear, factual English. At the first substantial mention, explain “Brainfuck (BF) programming language” and its eight instructions. Explain Thread, the actual new capability of the second stage and host-language roles. BF should be the project's main story, with the city as its visible example. Do not call the bootstrap self-hosting or claim that BF draws 3D graphics itself.

Before publication, complete local functional and visual verification and prepare rollback to the previous verified version. After publication, verify anonymous public access, actual demo execution, a custom module change, an error path and export/import. Verify public kernel, runtime and relevant asset identities against released source; transparently distinguish hosting HTML transformations. Record a deployment receipt. Publish-tool success alone is not live-site verification.

## 10. Autonomy and permissions

I authorize implementation in this project, necessary local tests and a temporary preview server, graphical assets made with available tools, normal project dependencies, commits/pushes and necessary standard merges in the existing GitHub repository, plus updating the existing public website after successful verification. Do not stop for further general approval of steps already assigned.

This does not authorize posting on X, new purchases or subscriptions, new public services, account or permission changes, weakened security, force-pushes, destructive history rewriting or changes to the Mac mini/CORTEX runtime. Do not add a backend as a side project for this build.

Respect actual permissions and mandatory platform interactions. If authentication or specific permission is missing, complete independent work and request the single specific intervention needed, with a clear reason. Do not bypass a block through another account, deployment or unsafe procedure. Do not make me design the architecture, find ordinary bugs or manually repair code.

Persist through necessary iterations and preserve progress for continuation. Do not claim completion upon reaching a limit or on the basis of a mockup. If reporting PARTIAL or a block, identify the exact missing part and preserve a safe, usable state.

## 11. Final deliverables for me

At the end, provide links to the actual website, GitHub, Build 002 tag/commit, CI, reproduction package, reference-matching screenshots and release record. Clearly state PASS / PARTIAL / NO-GO, unperformed checks and remaining limits.

Also create two separate Czech descriptions and save them with Build 002:

**A. A fully precise technical description.** What Build 001 contained and what was actually added; which source files and algorithms run inside BF; complete justification of Python/JS/Wasm and other host components; BF dialect, memory, modules, references, safe points, reclamation, rollback, simulation and persistence; exact flow from source editing to image; measured results and their environment; verification and its limits; source and public-deployment identity. Support claims with traceable code, tests or measurements. Include a short actual BF excerpt from this build, its provenance and a correct explanation of its function. Do not present estimated numbers as measurements.

**B. A human explanation.** Explain clearly and engagingly what I can now do and why it is interesting even without knowing compilers or memory management. Walk me through one concrete experiment with actual results: what I change, what I see and what happened inside. Explain why it is still Brainfuck, what Thread does and what the other languages help provide. Use analogies only where they do not distort reality. The text must work as a basis for my own X post.

Also prepare a short English X draft in a natural personal tone and a short supplementary comment explaining the BF/host boundary. No marketing superlatives, invented firsts or capability claims beyond the completed build. Prepare both texts only; post nothing on X.

Build 002 is complete only when the actual BF core, safe program replacement and a beautiful, faithful interface work; reproduction and visual checks pass; GitHub and the existing public website match the result; and both final descriptions are accurate. Begin implementation according to this brief.
