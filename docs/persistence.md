# State, transactions and real persistence

The **Brainfuck (BF) programming language** kernel owns memory operations.
The Thread store library owns the data format, indexing, reads, updates,
deletions, transaction staging and integrity checks. The host owns only the OS
operation that saves or loads opaque machine state.

## The native data store

Build #001 provides 128 records with unsigned 16-bit keys and values. All key
values, including zero and 65535, are valid. Occupancy is separate from the value,
so zero is real data and a missing key is distinguishable.

```text
tx-begin
42 7 db-put assert
tx-commit
7 db-get . .
```

`db-get` returns `(value found)`; this prints `1 42`. A missing key returns `0 0`.
`db-put` returns success, refusing a new record at capacity. Updating an existing
key still works in a full table. `db-delete` returns whether a record existed.
Mutation requires a transaction. `db-list`, `db-count`, `db-sum`, `db-generation`
and `db-check` provide scans, aggregates, version inspection and integrity checks.
Sums and generation counters wrap at 65536 like other Thread arithmetic.

Format 2 uses open addressing, initial bucket `key mod 128`, linear probing and
tombstones. Lookups continue through a tombstone and stop at an empty slot or
after 128 probes. Insertion remembers the first reusable slot during lookup
while continuing to check for an existing key; it does not scan twice. There are
no infinite probe loops. Worst-case colliding keys
can still be slow enough to require several bounded runs. The hostile 128-key
collision test saves and restores a paused image and continues to completion; the
default per-run work limit is preserved. The index is neither cryptographic nor
denial-of-service safe.

| Persistent word range | Role |
| --- | --- |
| 0–383 | committed records, three words each: state, key, value |
| 384–767 | staged records |
| 768 | transaction-open flag |
| 769 | commit generation |
| 770 | store format version, currently 2 |
| 771 | magic value 21553 |
| 772–4095 | reserved for future guest use |

State is 0 empty, 1 live or 2 tombstone. `db-check` verifies the header, allowed
states and that each live key resolves to its own slot. `p!` remains a low-level
developer primitive and can corrupt the store; this is one trusted computing
environment, not a security boundary between programs.

## Transactions

`tx-begin` copies the committed bank to the staged bank in Brainfuck. Reads see
the staged bank while a transaction is open. `tx-abort` returns to the committed
view. `tx-commit` copies the staged bank into the committed bank and advances the
generation. Nested transactions are rejected. `db-clear` clears the staged view
and is therefore reversible until commit.

The machine is single-threaded. No guest operation observes a partially executed
commit: execution must finish before the interpreter accepts the next command.
A host pause can occur during copying; resuming an image resumes at that exact
place, including pending input. This is not multi-user transactional isolation,
a concurrent database or a write-ahead log.

## What is actually durable?

**`tx-commit` commits the guest view; saving a machine image makes it durable
outside the process.** Do both when persistence across a process/device restart
is required. The browser keeps nothing permanently until the user exports an
image file. There is no hidden server database, account, cloud sync or automatic
browser-local saving.

Images include the entire 16-bit tape, compiled definitions, stacks, heap, store,
generic instruction pointer, queued input, EOF state and execution counters.
They use explicit little-endian tape encoding, a versioned envelope, SHA-256
integrity and the exact kernel hash. Corruption and incompatible kernels are
rejected before replacing an active instance. Integrity is not authentication
against someone who intentionally edits and re-signs their own image.

The CLI writes a temporary file in the destination directory, syncs it, renames
it over the target and syncs the directory. The browser downloads the equivalent
portable image. Tests restore committed data, user-defined code and a pending
transaction in a fresh machine; CLI tests cross a real process boundary.

Development format 1 images were not released. They retain their own old compiled
library if loaded with a compatible kernel. Loading an incompatible newer store
library is rejected by its schema assertion; no automatic migration is claimed.
Future kernel/image migrations must preserve old artifacts and have explicit tests.

## Build 002 workspace and city images

The city profile loads `core`, `city-state`, `workspace`, `city` and `city-boot` raw
Thread sources. Its named drafts and version sources live inside the4,096-word native
workspace, alongside bytecode, exact dependency references and pins. City roads,
jobs, progress, captured in-flight duration and last-decision serial are native data.
Export/import preserves them through the same opaque machine-image format; no host
serializer reconstructs module or city objects.

Normal city controls export after a complete native operation. The advanced native
pause control can also export an exact unfinished continuation for the CLI. Import
first validates the image in a new worker and reads a complete city/workspace frame;
only then does it replace the visible worker. An invalid or non-city image leaves
the prior machine intact. The interface refuses a budget-paused image with a direct
instruction to use the CLI for its exact continuation. The generic CLI and worker
continue to support snapshots inside an unfinished BF operation.

A visual event transcript is separate from machine state. The image retains the
last native path, score and decision serial, but not the entire history of road
inputs or every old source version. A reproduction bundle retains an initial image,
raw input sequence and expected output for that history. Collected source is not
promised to remain available merely because its serial appears in an old decision.

Build002's kernel hash and tape layout differ from Build001. Import explicitly
refuses a Build001 image. The released Build001 kernel/runtime/raw source remain in
`dist/build-001/` and at immutable tag`build-001`, where those images remain usable.
No migration is claimed. `tools/build-legacy.mjs --check` verifies the archive; only
its HTML asset/navigation URLs and historical banner are deliberately relocated.

The two-version comparison always retains the original, freshly booted, open-bridge
image independently of imported city state. Session replay instead uses the last
imported image. A transcript interrupted by a hard native pause is not advertised
as a complete replay; export/import a completed workspace to begin a new transcript.
