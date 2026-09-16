# Rollback prepared before Build003 publication

Build002 remains the public deployment while Build003 is being verified. The
existing Sites project is `appgprj_6aa2da2a6c9081919e4eace763a4f4a0`; its audience
was freshly read as public and the current user as owner. No audience change is
needed or authorized by this rollback procedure.

The saved verified Build002 version is
`appgprj_6aa2da2a6c9081919e4eace763a4f4a0~appgver_969a8c73c39c8191beedce0b6caf1680`,
version4, source `62bc1831ffbc6226b01cc958f5660e4a0863eb72`. Its retained archive
hash is `sha256:48187e330f93af632a99e43eb47c4a686e8dc3159f00cdcdd0cf2c8b32f4abf4`.
The existing deployment is `appgdep_6aa713dae71c81918cfd329105d6c2d8`.
These values were checked through the current Sites version listing and agree
with the preserved Build002 final deployment receipt.

If a Build003 public check fails materially, deploy that same saved Build002
version through the supported Sites deployment tool, then inspect completion and
check anonymous access and kernel identity. Do not create a replacement Site,
change access controls or force-push repository history. A rollback restores the
web assets; it cannot migrate a visitor's Build003 machine image into Build002.
Keep exported images and reopen them with their matching build.

GitHub Build002 remains at tag `build-002`, commit
`a80087662a66e7d04c1fc77cbce87cf996d60e63`. Its implementation, metadata closure,
normal merge and separately mirrored Site source identities are distinguished in
the original release's `final-deployment.json`; do not equate their different SHAs.

No rollback deployment has been needed or attempted during this Build003 check.
