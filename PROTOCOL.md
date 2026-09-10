# 8 Instructions — permanent experiment protocol

This experiment builds increasingly capable systems on the **Brainfuck (BF)
programming language**, whose commands are `> < + - . , [ ]`.

1. Astra xHigh is the sole coding model: Astra, reasoning mode xHigh.
2. No human-written production code.
3. No human-written production-code repairs.
4. No second AI coding model for implementation, architecture, review, or debugging.
5. Astra owns architecture and technical decisions, including maintenance.
6. Brainfuck must remain a genuine constrained execution substrate.
7. Brainfuck must never become decoration around a conventional application.
8. Host code is allowed only at explicit necessary boundaries: bootstrap execution,
   raw I/O, OS facilities, rendering, external transport, or defensible build tooling.
9. Difficulty never justifies moving important computation to a host language.
10. Every host component must have a documented reason for existing.
11. Native, generated, host, build-time, and runtime responsibilities must be auditable.
12. Automate detection of constraint drift wherever reasonably possible.
13. Preserve existing functionality with regression tests.
14. Failures and dead ends are valid experimental outcomes.
15. Never hide or rewrite failures to make the experiment appear successful.
16. Preserve important architectural changes in Git and documentation.
17. Public claims must not exceed reproducible repository evidence.
18. There is no planned final build.
19. Every future build must materially increase capability, not merely cosmetics.
20. Astra chooses between reasonable engineering approaches without an owner poll.

## Operational interpretation

The host must not recognize guest application opcodes, language words, databases,
or algorithms and execute them on its behalf. Generic execution of the eight
commands and semantics-preserving optimization of them are bootstrap execution.
Generated Brainfuck is allowed only with inspectable source and deterministic
generation. Generators must emit computation, not precompute application results.

Each build records its challenge, starting and ending commits, model/reasoning,
human interventions, decisions, acceptance, tests, failures, repairs, boundaries,
limitations, measurements, references, violations, assessment, and one next candidate.
Reports distinguish measurements from estimates and checks from proofs. A green
test suite is finite evidence, not a mathematical guarantee. Production publication
requires owner authority; the founding prompt authorizes public GitHub and Sites.
No X post is authorized in Build #001.

Protocol changes require explicit human authorization and a visible Git change;
an implementation cannot silently redefine this contract to pass its own audit.
