# Publishing the public experiment

GitHub is the source of truth for the **Brainfuck (BF) programming language**
experiment. Sites hosts its interactive static assets. The public browser uses
the same compressed kernel, generic executor and raw native libraries as the CLI.

Run the browser locally with `npm run site`, then open `http://127.0.0.1:4178`.
No model API or runtime package installation is needed. Full `npm run verify`
requires the documented build/test dependencies.

## Exact source without an oversized history transfer

During Build 001, the first attempt to push the complete engineering repository to Sites returned
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

The Build 001 public response preserved 17 runtime/data/style files byte for byte.
The HTML contained the original source plus a Cloudflare challenge-platform script
insertion. That hosting security code is provider-controlled; it is not a guest
compiler, data store or route solver. Public HTML response hashes may consequently
vary. The receipt records both the delivered response hash and the source hash,
and distinguishes the inserted platform code from project-authored code.

Execution platforms remain host dependencies: Node/browser APIs, WebAssembly,
and Sites/Cloudflare hosting. There are zero external **runtime npm packages**;
this does not mean a browser or hosting platform contains no other code.

To roll back a future deployment, redeploy a previously verified saved Site
version and its matching source/asset identity. To reproduce the historical first build locally,
check out `build-001`; older development kernels remain in Git. Machine images
must use their own matching kernel hash. Do not silently load an old image into
a changed kernel or rewrite public records to conceal a failed publication.

## Build 002 release path

Keep the existing project and public origin. Before any update, retain the saved,
verified Build001 version identified by `records/001/publication.json`; redeploying
that version is the rollback, without changing access or Git history. Preserve its
source/runtime identity and explicit incompatibility with Build002 images.

The Build002 canonical implementation is reviewed through a normal GitHub pull
request and exact-head CI. The final implementation commit, any metadata-only
closure, the immutable `build-002` tag, the canonical deployed-files commit and the
Sites transport commit are recorded separately. A fresh transport projection must
extend the existing Sites transport Git history, never force-push over it.

After publication, compare anonymous HTTP responses for the kernel, generic
runtime, Thread sources, renderer and graphics with the committed files. Record
HTML-only provider insertions separately. Exercise fresh boot, a custom module,
refused source and actual export/import in the public browser. A successful deploy
response alone does not complete this gate. The publication receipt is appended
only after the result is observed; if live verification fails, repair or redeploy
the previous verified version before claiming success.

The Build 002 archive is produced from its exact committed projection using the
installed Sites `package-site.mjs` helper. On macOS use `COPYFILE_DISABLE=1` so
AppleDouble resource metadata does not enter the archive. Validate the 71 public
files against `source-provenance.json`, plus the normalized hosting manifest. The
uploaded gzip hash and provider-normalized tar hash are different identities;
record both. No general size-limit conclusion follows from the Build 001 413.

For anonymous artifact checks, the release used `curl -q` with no cookies or
authentication, `Accept-Encoding: identity`, and HTTPS-only redirects. The
`index.html` paths normally redirect to their canonical directory URLs. A Python
urllib client received 403; that failed client attempt is retained separately.
The successful public checks use the ordinary browser and curl clients without
any bypass token or access change.

The first Build 002 publication passed file identity but failed live decision
evidence after import. The saved Build 001 rollback was actually exercised; see
`records/002/rollback-after-evidence-defect.json`. Preserve that failure alongside
the later repair. A functional release receipt and a final metadata-deployment
receipt distinguish implementation, repository closure and public projection.

## Build003 release extension

Use the same Sites project and public origin. Build003 adds the industrial assets,
raw process sources, a BF-produced zero-round image, and preserved Build001/002
archives. Keep the verified saved Build002 version as the rollback described in
`records/003/rollback.md`. A fresh committed Site projection must extend the
existing transport history without force-push.

The local gate includes the original76regressions, native process/message and
industrial checks, bounded literal BF comparisons, fresh standalone replay,
actual contextual UI actions, image roundtrips and screenshot comparison. Public
verification additionally exercises an own source edit, native refusal, independent
continuation beside a loop and export/import, then compares anonymous kernel,
executor, native source and graphics bytes against the committed projection.

Record the implementation, metadata-only closure, normal merge/tag, Site transport
commit, saved version, deployment and anonymous evidence separately. A successful
publish call is not proof that the live city works. If live checks expose a material
failure, repair it or redeploy the existing verified Build002 saved version. No
new Site, audience change, backend or alternate account is part of this release.

## Build004 release extension

The native implementation identity is recorded separately from evidence-only
commits, the normal GitHub merge, absent-only immutable tag and Site transport
projection. Six CI suites cover every test file exactly once; the original114
regressions remain unchanged. Preserve the successful local evidence and all failed
attempts rather than replacing them with a synthetic single PASS transcript.

Before publication, retain the verified Build003 saved version from
`records/004/rollback.json`. Stage only committed public files, extend the existing
Sites Git history and deploy to the existing public audience. Verify anonymous
asset identities, a fresh autonomous run, disruption, error handling, independent
work and export/import, then actually replay the public reproduction download.
Build004 freezes the local acceptance record before exact-source CI. The final
post-publication receipt is an immutable GitHub release attachment, binding the
verified source, normal merge/tag, Site projection, archive and observed behavior.
This avoids changing a tested/deployed tree merely to insert its own future hash.
Local PASS has explicit local scope until the external receipt proves release PASS.
Retain failed attempts alongside success, and never replace a published tag.
