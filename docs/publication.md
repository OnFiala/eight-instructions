# Publishing the public experiment

GitHub is the source of truth for the **Brainfuck (BF) programming language**
experiment. Sites hosts its interactive static assets. The public browser uses
the same compressed kernel, generic executor and raw native libraries as the CLI.

Run the browser locally with `npm run site`, then open `http://127.0.0.1:4178`.
No model API or runtime package installation is needed. Full `npm run verify`
requires the documented build/test dependencies.

## Exact source without an oversized history transfer

The first attempt to push the complete engineering repository to Sites returned
HTTP 413. Its compressed Git pack was about 446 KiB; the precise server-side size
policy was not established. The public GitHub push and clean clone succeeded.
Do not infer that the GitHub history was lost or replaced.

For Sites, stage a fresh projection of the **committed** public files:

```sh
node tools/stage-site.mjs .local/site-release-next
```

The script reads `dist/` and `.openai/hosting.json` directly from the current Git
commit, requires a fresh directory under `.local/`, and records the canonical
commit and SHA-256 for every file in `source-provenance.json`. It does not build,
rewrite or evaluate guest logic. The projection is a separate Git root for Sites
transport; the complete engineering history remains in the public repository.

Use the registered project ID in the copied hosting manifest. Commit and push
that exact projection, package its static output with the Sites hosting helper,
save that exact source/version and deploy it under the authorized audience. Keep
short-lived source credentials out of files, Git configuration and remote URLs.
Verify all public runtime assets against their canonical hashes after publication.

`records/001/publication.json` binds the implementation candidate, canonical
release-assets commit, transport-projection commit, saved Site version, deployment
and anonymous public checks. Its adjacent source-provenance record contains the
file-level mapping. The `build-001` tag identifies final repository closure.

## Platform behavior and rollback

The observed public response preserved 17 runtime/data/style files byte for byte.
The HTML contained the original source plus a Cloudflare challenge-platform script
insertion. That hosting security code is provider-controlled; it is not a guest
compiler, data store or route solver. Public HTML response hashes may consequently
vary. The receipt records both the delivered response hash and the source hash,
and distinguishes the inserted platform code from project-authored code.

Execution platforms remain host dependencies: Node/browser APIs, WebAssembly,
and Sites/Cloudflare hosting. There are zero external **runtime npm packages**;
this does not mean a browser or hosting platform contains no other code.

To roll back a future deployment, redeploy a previously verified saved Site
version and its matching source/asset identity. To reproduce this build locally,
check out `build-001`; older development kernels remain in Git. Machine images
must use their own matching kernel hash. Do not silently load an old image into
a changed kernel or rewrite public records to conceal a failed publication.
