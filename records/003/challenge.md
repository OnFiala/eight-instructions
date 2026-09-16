# 8 Instructions — Build 003: A city made of programs

> English translation of the original owner brief. The original wording remains in
> the `build-003` tag and Git history. The owner's later English-only publication
> instruction supersedes the historical request below for Czech handoff texts;
> it does not change the original implementation requirements or permissions.

Continue the project as sole author Astra in xHigh mode. This brief authorizes autonomous delivery of Build 003, from design, implementation and verification through release on the existing GitHub repository and public website. Make routine technical and visual decisions yourself. I want a complete, usable result with minimal human intervention.

## 1. Project, starting state and protocol

- Canonical project: `/Users/ondrej/BRAINFUCK`.
- GitHub: https://github.com/OnFiala/eight-instructions
- Existing public website: https://eight-instructions.andrewxix.chatgpt.site
- Initial information: completed Build 002, tag `build-002`, commit `a80087662a66e7d04c1fc77cbce87cf996d60e63`. Verify actual state before starting; this information does not replace inspection.
- Final Build 002 record: https://github.com/OnFiala/eight-instructions/releases/download/build-002/final-deployment.json
- Previous Build 001: tag `build-001`, commit `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`. Preserve its history and artifacts.

Before changes, verify the host, working directory, branch/HEAD, dirty/ahead/behind state, permissions and relevant concurrent work. Read `AGENTS.md`, `PROTOCOL.md`, architecture, language/modules, persistence, boundary manifest, tests and Build 002 records. Load CORTEX context for `brainfuck`; record significant decisions, errors and the outcome there. Use currently available tools and documented APIs.

Only Astra xHigh may perform architecture, coding, repairs, tests and self-review. No subagents or second coding model. The human supplies the challenge and preferences, not production code or repairs. An image tool may create graphical assets; record its use and output provenance. Label self-review as the same author's work.

## 2. Main goal: a substantial increase in BF capabilities

The Brainfuck (BF) programming language and its eight instructions `> < + - . , [ ]` remain the project's center.

Build 001 introduced an environment for running programs, storing data and calculating routes. Build 002 added named sources inside BF, compilation of Thread's module profile, safe versions, rollback and arena reclamation. Build 003 should add separate stateful programs that communicate, take turns executing and continue when one fails.

Create a small process system inside the existing BF machine. Each process has its own state, work in progress and bounded message queue. Depots, factories, vehicles and selected traffic controllers must be actual programs in this system. Users can change their source, add a compatible participant, stop or break one, and restore the entire world from a snapshot.

This is logical concurrency managed by a scheduler inside one BF machine, not a requirement for parallel CPU threads. Do not present the result as a full operating system or self-hosting. Measure the benefit through new BF capabilities, not BF file length, language percentages or artificial CPU load.

## 3. Mandatory BF / host boundary

The following must happen inside BF:

- Source storage, tokenization, compilation and execution of Thread programs.
- Process scheduling, continuation storage, waiting, waking and logical timers.
- Sending and receiving messages, queues, their capacities, identities and ordering.
- State ownership and access checking, memory management, and reclamation of processes, messages, data and versions.
- Module and binding semantics, safe publication, compatibility, rollback and the treatment of calls in progress.
- All city rules: stock, production, orders, cargo, construction, roads, passage reservations, routes, movement, delivery and failure responses.
- Authoritative input validation and deciding whether a user action is allowed.

Prefer Thread executed by the actual BF kernel for new application and system logic. Necessary generic kernel changes may use the existing auditable generator. It must emit computation, not precompute solutions to inputs.

The host may construct the kernel and assets, execute BF generically with equivalent semantics, provide raw I/O, OS operations, opaque snapshots, interface and rendering. It may pause the entire BF executor for UI responsiveness; it must not select the next guest process, deliver application messages according to their meaning or compute city state. No host-side Thread interpreter, process scheduler, message broker, guest-object allocator, route solver or simulation.

The renderer may turn BF presentation output into an image and interpolate between actually observed positions. It must not invent future routes, production, stock, completed construction or deliveries. The live application must not substitute test oracles or a precomputed scenario for computation. Do not add a model API or LLM decision-making to run the city.

Justify each new or changed host component and dependency in the boundary manifest. BF's difficulty and slowness do not justify crossing this boundary.

## 4. Native processes, messages and memory

Define state ownership, invariants and failure behavior before implementation. Choose the specific architecture autonomously, but meet these requirements:

1. A process has its own instruction position, stacks or equivalent continuation, state, references to versions in use and waiting state. It must be possible to pause and resume it mid-work.
2. The scheduler has deterministic ordering and bounded execution turns. A process in an infinite loop without voluntary yield must not stop other eligible processes. Expensive operations within a turn must have bounded cost or be resumable. A counter before an unbounded operation does not satisfy this requirement.
3. Message queues are bounded. Document ordering, full queues, waiting, unavailable recipients, terminated processes, timeouts and repeated requests. Capacities are not unlimited promises.
4. The process profile cannot overwrite another process's state, the scheduler or module manager. BF performs the checks. Keep the privileged general Thread terminal clearly separate; do not claim protection against an owner directly editing their own tape.
5. Contexts, state and messages are allocated and reclaimed inside BF. After slot reuse, an old handle must not identify a new unrelated object. Capacity exhaustion has consistent diagnostics and recovery.
6. A process fault is local and visible. Other independent work continues. A documented native protocol determines dependent processes' responses; do not rely on invented automatic recovery by the host.
7. Cargo and message transfers must not duplicate or lose material after retries, faults or program replacement. Define an accounting invariant for resources, production, transport and consumption. Provide consistent boundaries for changes in progress.
8. Program replacement respects suspended frames, live references and nonempty queues. Old frames retain the correct version. New work uses the new version at a defined safe point. Define state and message compatibility; reject incompatible changes unless a native migration has been verified. Preserve return to the previous usable version.

Do not handle every update by restarting a process and losing state or resetting the whole machine. Memory must actually be reused at fixed capacity.

## 5. A living industrial district

Create a coherent production and delivery chain: warehouse or depot → factory → product transport → construction site for a new station or another clearly recognizable building. Use a small number of material types and understandable recipes. The goal is a working world of communicating programs, not an expansive economic game.

The visitor's main task is to deliver material and complete construction. Messages between programs actually trigger orders, transport, production and receipt. Stock changes, vehicles carry specific cargo, production requires inputs, and construction grows according to fulfilled native conditions.

Add real bounded capacity for road passage or a loading point so visible queues can form and different priorities have consequences. BF computes them. Complete continuous traffic physics is not required. Journeys in progress and material must not disappear when a program changes or a road closes.

A starting point for measurement is 12–20 processes including 4–6 vehicles. This is neither measured capacity nor a commitment to a particular count. Determine and document final scope from measurements. Retain several genuinely different cooperating programs and a visibly active scene; do not reduce the result to a fixed event table.

## 6. Controls must be direct, discoverable and part of the city

“More native” means natural interaction directly through city objects, with immediately understandable options. Users should not have to guess commands, find a hidden terminal or read documentation first. These controls must still provide actual inputs to the BF system.

- On load, show the main task and a clear action to start. Buildings, vehicles and relevant roads are directly selectable, with a clear selected state. Provide keyboard and text paths to the same objects.
- Selecting a factory shows what it makes, its stock, what it is waiting for and what can be changed. Selecting a vehicle shows cargo, destination, current work and reason for waiting. Selecting a road shows openness, capacity and allowed interventions.
- The contextual panel offers several concrete controls appropriate to the object, such as production batch size, reorder threshold, job priority or vehicle-assignment rule. Do not require knowledge of raw module identifiers, memory addresses or event codes.
- Each control clearly states what changes and when it takes effect. For example: “The next order will request 6 units” or “New departures will prioritize station construction.” If the consequence has not been computed, the UI must not present it as an actual result.
- Distinguish world-data changes from program changes. Closing a bridge changes data. Changing a decision rule must actually modify, store and compile a program. At least one central convenient control must demonstrably modify actual program source, not secretly switch between two prepared host-side branches.
- When a control changes a program, authoritative source editing, validation, storage and compilation must happen inside BF. The host may transmit the entered value and render the response. It must not parse Thread and replace the native compiler or rule manager.
- Displayed current values, semantically valid ranges and action availability must match native state. General UI format checking is a convenience; BF independently validates input. A universal form generator is unnecessary; choose the smallest auditable solution.
- Actual Thread source is available at the selected object, behind at most one clear disclosure. Allow switching from convenient parameters to a full editor and writing a custom compatible program. Parameter controls must not overwrite custom source with a template. If a few controls cannot faithfully represent it, the UI must acknowledge this and retain the editor.
- Visibly separate the local draft, source stored in BF and active compiled version. After page reload or import, the panel must not claim source different from the machine's. Switching objects must not silently lose an unsaved draft.
- Use one clear action to confirm a change and provide a way back. Explain errors beside the input in ordinary English; preserve the previous usable program and world.
- Controls should respond immediately. Native computation need not finish that quickly: show waiting, preserve camera control and request order. Do not imply that a change is active before BF confirms it, compile expensively on every keystroke or allow accidental double submission of the same action.

The main scenario must be completable without the terminal or prior knowledge of Thread. Advanced users must have access to actual source, messages and data. Do not substitute an LLM chat for these controls.

## 7. Visual quality and truthfulness

Preserve and develop the approved Living Dispatch visual language: a dominant isometric city, dark background, light building materials, lime accents, water, waterfronts, bridges, greenery, light and clear typography. The city must not give way to generic tabular administration.

Open the actual Build 002 interface and its visual evidence. The original approved reference is `records/002/reference/approved-living-dispatch.png`, 1487 × 1058 px, SHA-256 `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`. Build 003 must carry forward that aesthetic quality; content and layout should adapt to the industrial district and direct controls.

Choose one concrete Build 003 composition yourself and record it as the working visual target. You may use one design or graphical assets, but do not send routine direction decisions back to the human or create three replacement generic applications. A static image under buttons does not meet the brief.

The city must clearly show:

- what cargo a vehicle carries and where it picked it up or delivered it;
- stock decreasing and increasing, bounded capacity and production state;
- vehicle queues and specific reasons for waiting;
- individual construction phases according to actual BF state;
- a closed road, broken or suspended program, and its repair;
- the selected object, rule being edited and effect of an accepted change.

Every state need not add another floating label. Use quality models or layered assets, cargo, material piles, lights, appropriate animations and accurate contextual captions. Machine activity may be animated for presentation, but quantities produced and work completion come only from BF. Optional communication visualization must derive from actual send/receive events, not decorative lines.

Roads, directions, openness, positions and queues match native data. Do not present vehicles showing through buildings as a finished physics solution; choose readable occlusion or a clear presentation mode. No emoji buildings, placeholders or temporary boxes as final assets.

Regularly compare actual screenshots with the visual target at 1487 × 1058 and use overlays when needed. Verify the main scenario, object selection, rule change, queue, fault, repair and completed construction. Check narrow-layout usability, keyboard, focus and reduced motion. Do not claim pixel matching or accessibility without corresponding checks. A significant visual or interaction deficiency means PARTIAL.

## 8. Main experiment and evidence

A visitor starts the actual BF machine and requests construction. They see programs cooperating, material and construction progress. Selecting an object reveals what can be changed; they make a custom program change and see its effect on subsequent native decisions.

Add a reproducible comparison of two rules from the same initial snapshot, with identical roads, external orders and logical steps. Closing a road or shutting down a factory is a separate experiment with a changed input. Do not prescribe results before measuring or mistake different rule scores for wall-clock speedups.

Separately demonstrate a process in an infinite loop, other eligible processes continuing, and stopping or repairing it. Independent progress must actually result from the BF scheduler. Repair must not lose cargo or silently reset the entire world.

For a specific decision, let users expand its input, process, version, messages and actual BF output. Ordinary users receive a short explanation; interested users receive exact data. Do not attach events from another process, version or previous instance to the current result. If a snapshot lacks historical records, label them unavailable.

Prepare a downloadable reproduction package: kernel and source identities, compatible initial snapshot, inputs, expected native output and instructions for a fresh CLI instance. Verify actual use of the package. Distinguish replayed records from new computation.

## 9. Persistence and compatibility

Export/import preserves sources, versions, process contexts, suspended frames, private state, message queues, logical timers, stock, reservations, cargo and journeys or production in progress. Verify import in a fresh instance. An invalid import must not destroy the original usable world.

For Build 001 and 002 snapshots, choose an explicitly tested migration or retain the matching old kernel with clear rejection of incompatible imports. Do not promise compatibility merely because file extensions match. History-retention and rollback policies must be bounded and compatible with reclamation.

## 10. Required verification and measurements

- Preserve all 76 Build 002 regression tests, including original Build 001 tests. Justify contract changes; do not delete coverage merely to make tests pass.
- Verify at least three genuinely different programs using the generic native process/message interface. A new user participant, source and unprepared input sequence must work without kernel regeneration.
- Verify scheduling with an infinite loop, waiting, waking, a full queue, stack overflow, terminated recipient, invalid and stale handles, and exhaustion of every bounded resource.
- Verify process-profile isolation and bounded execution turns, including expensive operations. Separate logical fairness from actual wall-clock responsiveness.
- Test faults and program replacement around receiving, sending and stock changes. Demonstrate no material duplication, loss or negative quantities, and defined behavior for repeated requests.
- Verify valid, invalid and incompatible replacement with suspended calls and nonempty queues, live references, state preservation, rollback and subsequent memory reclamation.
- Run hundreds of creation, work, termination and reclamation cycles at fixed capacity, beyond the original monotonic-allocation limit. Document actual live and reused resources, including repeated failures without leaks.
- Compare deterministic output and state in fresh browser/CLI instances. Compare bounded representative workloads with a literal BF interpreter and preserve differential checks of generic optimizations. Oracles are not part of the production computation path.
- Perform actual export/import during communication, execution, production and transport. Check restored source in the editor and all contextual controls.
- Verify the entire visitor journey through direct controls: object → understanding available changes → custom change → acceptance or error → visible consequence → return. Make the same journey possible by keyboard. Test double-clicks, switching objects during work and long native computations.
- Measure startup, scheduler steps, messages, routes, production, program changes, export/import and reclamation cycles. State hardware, configuration, methodology and fixed capacities. Report BF tape and host-process memory separately. Do not promise unmeasured speed or simulation frame rate.
- Perform adversarial BF/host boundary self-review and screenshot/functional verification of the final interface. Label results as final evidence from the same author, not an independent audit.

The first implementation milestone must prove scheduling, messages, continuations, resource reclamation and one loop not stopping other processes inside BF. Extend the visual world only on that foundation. A beautiful host-side simulation cannot replace failure to meet this condition.

## 11. History, documentation and release

Maintain `records/003/` according to project conventions: challenge, model/reasoning, starting and ending commits, decisions, journal, boundaries, tests, measurements, visual and interaction evidence, asset provenance, human interventions, protocol violations, limitations and final assessment.

Preserve the real sequence of reasonable commits, including significant failures and repairs. Update README, architecture, language, processes/messages, modules, persistence, boundary manifest and reproduction procedure. Keep historical builds and their claims clearly distinct from the current build.

After verification, push changes to the existing repository, pass applicable CI, complete necessary merges through the normal protected path and create tag `build-003` if it does not exist. Do not overwrite an existing tag, bypass branch protection, force-push or create a development branch with the release tag's name. Distinguish implementation commit, any metadata-only closure, merge/tag and deployed artifact.

Update the existing public website through the existing host's supported workflow. Do not create a replacement Site or new backend. Before deployment, verify local functionality, interactions and visuals, and prepare rollback to verified Build 002. Preserve Build 001/002 history and their matching runnable artifacts.

After deployment, verify anonymous access, actual BF execution, a custom program change through contextual UI, an error path, other processes continuing and export/import. Compare public kernel, runtime and relevant assets against released source; identify hosting HTML transformations separately. Save a deployment receipt. Publish-tool success alone is insufficient.

Write public content in English. Explain the Brainfuck (BF) programming language and its eight instructions, Thread, the new process capability and host boundaries. No invented firsts, unlimited capacities, claims of BF drawing graphics, AI controlling every van or unverified resilience claims.

## 12. Autonomy and permissions

For this brief I authorize implementation in the existing project, necessary local tests and a temporary preview server, normal project dependencies, graphical asset creation, commits/pushes, standard merges in the existing GitHub repository and updating the existing public website after successful verification. Do not request further general approval for these assigned steps.

This does not authorize posting on X, purchases or subscriptions, new public services, account or permission changes, weakened security, force-pushes, destructive history rewriting or changes to the Mac mini/CORTEX runtime. Use CORTEX through its existing memory tools. Do not add a backend as a side project.

Respect actual permissions and mandatory platform interactions. If specific authentication or access is missing, complete independent work and request the single precisely named intervention needed, with its reason. Do not bypass a block using another account or substitute deployment. Do not make the human design architecture or manually repair code.

Persist through iterations and preserve progress for continuation. Do not claim completion after interruption or exhaustion of a limit. If reporting PARTIAL or a block, identify the exact missing part and leave a safe, usable state.

## 13. Final deliverables

Provide PASS / PARTIAL / NO-GO with unperformed checks and actual limits, plus links to the public website, GitHub, Build 003 tag/commit, CI, reproduction package, screenshots, a short main-scenario demonstration, release record and rollback.

Save the following in `records/003/`:

A. A precise Czech technical description: changes from Build 002; files and algorithms executed inside BF; host exceptions; scheduling, messages, isolation, memory, versions, continuations, recovery, persistence; the path from controls to source and image; measurements and their environment; verification and limits; source and deployment identities. Support every substantial claim with code, a test or a measurement. Include an actual BF excerpt with exact provenance and a correct explanation.

B. A short, human Czech explanation: what I can now do, what was harder than in the previous version and what actually happens inside. Walk me through one concrete visual experiment with a measured result, without requiring knowledge of processes or compilers.

C. A short English personal X draft and a separate BF/host explanation. Natural tone, no advertising superlatives or claims beyond the result. Prepare only; post nothing on X.

Build 003 is complete only when the actual BF system of cooperating programs works, a person immediately understands what and how they can change, the city truthfully and impressively displays results, and the verified release matches both GitHub and the existing public website.

Begin implementation according to this brief.
