# External references and provenance

The architecture and implementation for the **Brainfuck (BF) programming language**
experiment were authored by Astra xHigh. No existing operating system, database,
VM or compiler challenge implementation was searched for or adapted.

References actually used:

- [Daniel B. Cristofani's language reference](https://www.brainfuck.org/brainfuck.html):
  the eight-command semantics, cell-width variation, byte I/O and EOF conventions.
  Incidental links to existing programs on that page were not followed or used.
- [Official ChatGPT Sites documentation](https://learn.chatgpt.com/docs/sites):
  public access, static hosting, saved versions and deployment identity.
- Installed official Sites building/hosting skill instructions and connector
  schemas: packaging and publication procedure, not guest architecture.
- [WABT](https://github.com/WebAssembly/wabt): pinned build-time assembler package
  `wabt@1.0.39`. It assembles this project's own generic executor WAT. The
  distributed executor does not include a guest application from WABT.
- Official GitHub API responses: authenticated repository ownership, repository
  creation and immutable pins for official `actions/checkout`, `setup-node` and
  `setup-python` actions. No source solution was retrieved through GitHub.

Runtime dependencies: browser/Node platform facilities and the included generic
WebAssembly executor. No external production npm package. WABT is the sole npm
development dependency (Apache-2.0); project-authored work is MIT licensed.
The test-only literal C reference is also project-authored, not copied.
