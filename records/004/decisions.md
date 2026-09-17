# Build 004 decisions

## 1. Native world contexts, before implementation

Keep the existing city semantics, compiler and actor scheduler. Add a generic
BF-emitted memory-context copy operation for the heap and workspace. Context zero
is the execution window; three fixed shadow contexts hold a checkpoint, the live
world while a trial executes, and the suspended trial. Every context contains its
own complete module arenas, source drafts, reference counts, process continuations,
messages, industry ledger, roads and route pins. The resident dictionary/code is
immutable during a trial. Candidate compilation allocates only module arenas.

The generic kernel knows context numbers and memory spans, never cities, fitness,
source grammar or candidate meaning. No host-side image scheduler is introduced.
The trusted Thread supervisor uses the separate store region for its own state,
which candidate modules cannot address. Native code alone chooses when to copy,
evaluate, publish and reclaim contexts. Context copy has finite configured bounds;
performance must be measured before treating this design as accepted.

Each trial is identified by a nonwrapping native generation and checkpoint identity.
Actor handles are world-local; external identities include the world generation.
Cloning gives each world complete independent version ownership, avoiding shared
mutable reference counts. A trial's source may be copied to live draft storage and
compiled there only after evaluation and freshness checks. Never copy a trial's
inventory, jobs, positions or completed work into the live world.

Search and observation state must survive opaque whole-machine images. Interruption
inside a memory copy resumes that exact BF continuation. Invalid imports keep the
current instance. Old kernel identities retain their historical runnable builds.

## 2. Composition

Carry forward the approved Living Dispatch palette, light architecture, dark
surroundings, water, bridges, greenery and lime accents. Let the city dominate the
viewport. Place one native goal and one factual status above the scene; one optional
bridge intervention remains prominent. Object inspection and source editing use an
optional panel. Search evidence is a disclosure, not a required workflow. The
existing Build 003 screenshot was inspected alongside the approved reference.

These are implementation decisions, not verified completion claims. Acceptance,
construction, native isolation, performance and visual gates remain pending.
