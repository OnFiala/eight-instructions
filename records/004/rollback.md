# Prepared rollback

Before publishing Build 004, the existing public Site was confirmed active, public
and owned by the selected account. Saved Sites version **6** has a successful
deployment and an archived payload. Exact opaque identifiers are in `rollback.json`.
That saved version is the rollback target; it is not a new Site or a changed audience.

Anonymous `curl -q` reads confirmed the public Build 003 kernel gzip, generic
executor, Wasm artifact and initial image match the immutable `build-003` tag
byte for byte. The root HTML contains Build 003 and differs from the source HTML
because hosting inserts provider content. See `rollback-public-build003.json`.
An earlier Python urllib request received HTTP 403; curl without configuration,
cookies, authorization or a bypass token succeeded. No access setting was changed.

If the Build 004 release needs rollback, deploy the saved version ID from
`rollback.json` through `sites_deploy_site_version` on that exact project. Verify
the returned deployment and repeat anonymous asset/browser checks. Reuse the
existing URL. This restores the old runtime; it does not migrate Build 004 local
images. Users can retain their exports and open the matching archived build.

GitHub rollback is a normal revert or follow-up fix, subject to ordinary checks.
Never move `build-003` or `build-004`, delete history, or force-push. Build 003 remains
directly runnable under `build-003/` in the new Site as well.

This document prepares the action. It does not claim a rollback deployment was
performed during Build 004 verification.
