# Offline reproduction

Download `dist/reproduction/build-004.zip` from the page's **Reproduction package**
link and extract it into a new directory. Node.js 22 or later is required.
No npm installation, network connection, API key or backend is needed.

```sh
node tools/replay.mjs dist/reproduction/build-004.json
```

The verifier hashes the kernel and relevant runtime/source assets. It restores a
fresh opaque native machine for each run, submits every raw input and compares
every output byte against the recorded evidence. A mismatch fails the command.
The success branch includes native search, fresh validation, publication and
subsequent material-built construction. A separate looping candidate is rejected
while the original live work continues. Expected output is test evidence; the
production page never loads it or uses it to choose a result.

To inspect or continue the same round-zero machine interactively:

```sh
node runtime/cli.mjs --load dist/initial-industry.8i
```

To compile the resident system from the included raw Thread source:

```sh
node runtime/cli.mjs --autonomous --fuel 2e14 --blocks 3e10
```

These are finite work allowances for actual BF execution, not ordinary instruction
counts for a host application. Compilation and replay can take several minutes.
The JSON records generated source and results with their original checkpoint and
logical horizons. See `docs/synthesis.md` in the repository for field ownership,
candidate ordering and acceptance rules. Exact download/execution receipts and
public artifact identity are recorded alongside this document after verification.
