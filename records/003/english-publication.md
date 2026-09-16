# English-only public documentation correction

The owner requested that all GitHub content be in English. This documentation
change starts from main commit `9c5c5b5abaaf68ac5a0222989b4c34e4c71b49ba`, after the
completed Build 003 release. It is not a new runtime build or deployment.

## Scope and provenance

- Translate both original build challenges and the four technical/plain-language
  accounts for Builds 002 and 003. Rename the accounts from `*-cs.md` to `*-en.md`.
- Keep the historical briefs faithful, including their original request for Czech
  handoff texts. A translation note explicitly identifies the later English-only
  publication instruction as superseding that language requirement.
- Update README and release-record navigation to English descriptions. Pin Build
  002's implementation links to its original tag so historical measurements are
  not associated with Build 003 code.
- Require English public prose and explanatory attachments in `AGENTS.md`.
- Update the mutable GitHub release descriptions and explanatory attachments to
  the English files, pinning documentation links to this change's commit.

The six original documents remain in existing Git history and release-tag trees.
No historical commit or tag is rewritten. Build 003's original Czech attachments
were downloaded and verified byte-for-byte against the tagged documents before
replacement. The final evidence ZIP was inspected and contains English records,
not those Czech descriptions; it does not need replacement.

## Verification

A scan of tracked UTF-8 text found no remaining Czech prose. The remaining character
matches are the valid English loanword “café” in `design-qa.md` and this note. Tracked ZIP text and
the downloaded final-evidence ZIP were also scanned. Both challenges retain their
original section, bullet and numbered-requirement counts. All fenced code and
40/64-character source identities in the four accounts are unchanged. Inline
code literals are retained; the explanatory formula `time + toll × weight` is
translated from Czech, not executable source.

Local Markdown targets and historical source-link targets are checked, as is
whitespace with `git diff --check`. Only Markdown files change. The BF kernel,
Thread sources, host runtime, assets, tests, reproduction packages, deployment
receipts and public Site files remain byte-identical. The normal pull request
runs the repository's existing CI; its actual status is recorded by GitHub,
separately from these translation checks.

The release update replaces only the Czech explanatory attachments after the
English uploads have been verified. Other release assets and their digests stay
unchanged. Runtime rollback remains the existing Build 003 rollback procedure;
this documentation change can be reverted through a normal Git revert without
changing a released tag or the running city.

Translation and review are by the same Astra author. No independent review or
new runtime behavior is claimed. Nothing is posted to X.
