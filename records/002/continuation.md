# Build 002 continuation

Active branch build-002; base/released Build0016d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0.
Sole gpt-6-astra/xhigh, NO subagents or second coding model. User authorizes full
implementation, relevant testing, GitHub push/standard merge and updating existing
public Site after verification. Do not stop at this milestone.

Native implementation and contracts: docs/modules.md, docs/architecture.md and
programs/workspace.thread,city-state.thread,city.thread,city-boot.thread. Generic
kernel additions only key,w@,w!;4096workspacewords; residentcode12288; raw BF52,564,890
commands, SHA0ebd529deaf21dd77bba0ddaef77693e27fd1fffbc9930c9ca31b0bbde400d98;
169164cells/338328bytes. Four named modules, six448-word arenas, eachsource256/code128;
active+one rollback root, exact compiled dependencies and pins, native collection.
Source modules are a pure typed Thread subset executed inside Thread inside BF.

Current UI in dist/index.html,style.css,site.mjs,presentation.mjs,city-scene.mjs.
Actual raw city-system boot; source edit/store/compile/rollback/create/delete;
run/pause/logicalstep, jobs/bridge, fullimages, decisioninspector, freshcomparison and
repro export. Graphicssprites purelydecorative. First real browser score15 and3pinsv1;
publishv2 keptpositions; steppingprogressobserved. UI serial-vs-arena and compile-after-
refused-source bugs fixed. MODULE output has activeSerial/rollbackSerial, not slots.
VEHICLE latest format: id,node,edgePlus1,progress,goal,delivered,pinSerial,decision,
score,pathLength,capturedDuration,decisionVersion,path... . Native lastdecisionserial
is evidence only, not a lifetime pin. Inspector retains input/road/cost frame perroute.

Latest native repairs: city-street checks room forbothroads beforemutation;
missing/uncompiled/wrongarity rule rejects beforecostevaluation; everyroadedit resets
cacheversion to preventstale cache acrossgenerationwrap.7adversarialtests passed before
lastdecisionserial addition. Re-run latest fullsuite.

Evidence: originalbaseline50; current fixed450suite11/11 passed451420ms workload
(concurrentdevelopment),9000cumulative codewords,40live,zeroafterdelete,6fixedarenas,
slots1/3/2,residentcp7078/dp162unchanged. LiteralC opaque continuationtest passed entire
tape/PC/output for374713154388 module-eval instructions270995ms and352585709028
refused-source compile instructions223132ms. Existing literalzero-tapekerneltest retained.
Boundednewnative reference skips literalbootstrap explicitly; no productionoracle.

Finallocal npmverify running session34849 ->records/002/final-local-tests.txt. Includes
alloriginalregressions+new450/nativeC; maytake~10minutes. Atlastpoll reachedtest49 without
failure. Native APIs should not be edited unless a realfailure appears. Renderingwork
continued afterinitialaudit phase, so refresh reviewedhashes after actualreview andrerun
narrowaudit/static checks; finalCIwill testexactcommittedsource.

Three sequential freshM5/32GiB/Node22.22measurements completed in metrics.json:
bootmedian7971.846ms; source111.031ms; compile603.805ms; cold3route step4444.390ms;
inflight32.853ms;arrival168.305ms;warmsingleroute1158.735ms;20reclaimcycles26601.707ms.
Artifactload364.276ms;hostpeakRSS316352KiB separatefromguest338328bytes. See fullmethod,
outputs/hashbinding. No nativeedits since measurement exceptnone (lastdecisionserial
was already included). Measurement was sequentialwithoutotherintentionaltest/browser
commands duringrun, existingbrowserpaused. No performanceguarantee.

Reproduction generictools/replay.mjs andbuild-reproduction.mjs; staticdownload
atdist/reproduction/build-002.json includes~451KBopaqueimage,artifacthashes,2branches,
common3logicalsteps,expectedrawoutputs. Initial CLIreplaypassed; bundle regenerated for
finalnativeoutput and needsreplay+actualbrowserbundle roundtrip onlatestsource.

Build001 preserved17runtime/source/assets verbatim plusHTML-only navigationrelocation
andhistoricalbanner underdist/build-001. tools/build-legacy.mjs checks immutableoriginal
commit; CIfetch-depth0required. Legacykernelsave/restore+Build002rejecttestpassed. Need
actuallegacybrowserdemoandlinknavigationcheck. NewbuildrecordcurrentlyPARTIAL,index
containsbothbuilds; historygenerated. README/docsupdated but finalPASS/links/descriptions
not yetsealed. Boundary124components, more bridgeassetswillneedclassification.

VisualQA: reference exactcopyrecords/002/reference/approved-living-dispatch.png SHA
93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847. Approved1487x1058.
Initialside-by-side+overlay in visuals/comparison-04.png,overlay-04.png show significant
remainingcitydensity/bridgequality gap. DO NOT declarevisualPASSyet. Rightpanel and
bottomstrip now matchpositionswell (panel197..864,strip894;ref200..857/891). Current
camera JUSTchanged afterscreenshot04: s=width/96,sy=.53s,originx.58width, spriteheight*.82;
canal26..34. Need freshscreenshotafterboot andfix cropping/roads/labelcollisions. Desktop
canvasextends50pxup; origincompensates. h1changed4.84vw/-.047em. Verify narrowerlayout,
keyboardfocus, reducedmotion; save rootdesign-qa.md oncepassed, notbefore.

CUA: selected Chrome(browser1), chromeTab id644390721 onlocalhost4178, viewport1487x1058.
In-app browser hadblurryDOMcapture andDPR2fourduplicatedtiles; evidence isfailedcapture,
notappframe. Its tab1 closed. Use Chrome forvalidshots. ScreenshotPNGviaChromeCDP works.
Persistent CUAvars:chrome,chromeTab,chromeCdp,fs(nodefs/promises); tab/browser/cdp referold
closediab. CUAfilewritesonlyartifactbytes allowed. Capture:chromeCdp.send('Page.captureScreenshot',
{format:'png',captureBeyondViewport:false}),writeBuffer(data,'base64'); nooutsideUItools.
ReadCUAdocsagainaftercompaction via cua.rewriteDocumentation(). Filechooserflow docsread;
startwaitForEventbeforeclickthenchooser.setFiles absolute. Download APIreturns opaque
object; needinspectactualsavedfilename/path, notinventAPI. BrowserPlaywrightevaluate
read-onlyDOM. Test actual UI newcustommodule/error/export/import/compare. No sourceeval
hiddenclientmutation; WebMCPtools existonlyifbrowsermodelContextsupported.

Loopbackpreviewserver running session38738 port4178, explicitlyauthorizedplatform
escalationaccepted. Source/cwdMacBook-Pro/Users/ondrej/BRAINFUCK. NoMacMinimutations.

Graphics: sixdistrictsprites+threevans dist/assets/city withprovenance. vanfrontleft
usespresentationmirrorfront-right; rejectedblackglowassetnotused. Two new ornamental
bridgegraphic calls RUNNING functions cell94; waitafterexec yielded (imagegenneedsminutes).
Names harbor-bridge,north-bridge, exactreference supplied. These areappearanceonly; no
roads/network/vehicles/state. Oncompletioninspect,copyverbatim,addhash/origins; composite
magenta thenrenderalignedwith actualnativebridgeedges. Noothermodelcoding. Canrefine
bridgeplacementinrenderer, route/stateoverlaymuststayreadableandtrue.

Stillrequired: fullbrowserworkflow andparityrepro freshCLI; finalvisualcomparisoniterating
untilnosignificantdifferences; narrower/keyboard/reducedmotiontests; completeadversarial
BF/hostselfreview; finalcanonicaldocs+buildrecord+twosavedCzechdescriptions(technicalwith
realBFsnippet/codeevidence,andhumanexperiment)+unpublishedEnglishXdraft/reply; publiclink
toverifiedreprobundle; finalretest/auditandappropriatecommits; GitHubprotectedmergeCI/tag
build-002 ifabsent; updateEXISTINGSiteprojectappgprj_6aa2da2a6c9081919e4eace763a4f4a0
usingcurrentsites-hostingskill/toolworkflow, rollbackoldv1, anonymouspublicrealflow/assets
hashverificationandreceipt. NoGitHubpush, tagorSitepublishyet. ExistingpublicBuild001
remainsuntouched. FinalPASSonlyifallrequiredscopecomplete. CurrentCORTEXnoterecorded
16:30UTCidempotencybrainfuck-build002-ui-literal-20260913. Memoryregistryused232–308,
finalcitationifusingthatcontext. NoCORTEXruntimechanges.
