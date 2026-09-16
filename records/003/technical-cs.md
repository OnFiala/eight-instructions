# Build003 — technický popis

Záznam skutečné implementace. Nativní regresní sada prošla113/113testy.
Lokální vizuální a interakční kontrola je dokončena. Stav vydání zůstává PARTIAL
do dokončení posledního CI a veřejné kontroly.
Autorem architektury, kódu, testů, oprav a tohoto self-review je stejná Astra xHigh.
Nejde o nezávislý audit. Člověk zadal výzvu, nepřidával produkční kód.

## Co přibylo

Build001 vytvořil nad osmi instrukcemi Brainfucku jazyk Thread, opakovaně použitelné
funkce, transakční data, hledání tras a snímek stroje. Build002 doplnil pojmenované
zdroje uložené na BF pásce, omezený modulový překladač, přesné vazby na verze,
publikování, jednu předchozí verzi pro rollback a opakovaně použitelné arény.

Build003 přidává procesní profil: samostatné programy mají vlastní pokračování,
soukromá data a schránku. BF plánovač je deterministicky střídá. Výchozí město má
12 účastníků: dvě depa, dvě továrny, čtyři dodávky, dvě stanice a dva řadiče mostů.
Jsou to skutečné procesy s několika různými programy, ne řádky hostitelského scénáře.
Město převádí dva kusy suroviny na jeden panel a dopravuje panely na stavbu.

## Co běží kde

`artifacts/kernel.bf` je skutečný vykonávaný BF program. Python v `kernel/build.py`
a `tools/emitter.py` sestavuje jeho osmipříkazový zápis. Emituje algoritmy, nedostává
uživatelské programy ani nevypočítává výsledek konkrétního města. To není self-hosting.

Uvnitř tohoto BF programu se překládají a vykonávají následující zdroje:

- `programs/workspace.thread`: zdroje, tokenizace modulového profilu, překlad,
  přesné závislosti, schémata, publikování, reference a uvolňování arén.
- `programs/process-state.thread`: kontexty, identity, soukromý stav, zprávy,
  vytvoření, čekání, pozastavení, oprava a ukončení procesu.
- `programs/processes.thread`: interpretace modulových instrukcí, ukládání
  pokračování a nativní plánovač s omezenou dávkou práce.
- `programs/industry-state.thread`: zásoby, zakázky, graf, rezervace a vlastnictví.
- `programs/industry.thread`: objednávání, předávání nákladu, výroba, stavba,
  přiřazení dodávek, pokračovatelná Dijkstra a priorita průjezdu.
- `programs/industry-view.thread`: skutečný prezentační výstup a kontrolované
  administrátorské požadavky. `industry-boot.thread` dodá raw počáteční data a
  editovatelné programy; všechny přijme a přeloží BF.

Procesní interpret je tedy napsaný v Threadu a jeho vlastní vykonávání zajišťuje BF
kernel. JavaScript Thread neinterpretuje. `dist/engine.mjs` a `wasm-engine.mjs`
obecně vykonávají BF; `runtime/executor.wat` zrychluje stejný obecný proud operací.
Slučování pohybů či ekvivalentní optimalizace smyček nerozpoznávají továrny, jména
modulů ani zprávy. Shoda se kontroluje i doslovným referenčním interpretem.

JS dále obsluhuje syrové vstupy/výstupy, lokální návrh v editoru, výběr objektu,
soubory a kreslení. `industry-presentation.mjs` dekóduje nativní záznamy;
`industry-scene.mjs` je vykreslí. Smí interpolovat dvě již pozorované polohy,
nepočítá další cestu ani zásobu. Stromy, světla a materiály jsou dekorace.
Odsazené číselné značky aut nejsou vymyšlené pozice fronty. Zákryt je schematický,
nikoli spojitá dopravní fyzika. Grafické assety vytvořil obrazový nástroj;
`assets.json` obsahuje jejich původ. Žádné modelové API neřídí běžící město.

Hostitelské nástroje pro měření, testy a reprodukci nejsou importované produkčním
výpočtem. Neexistuje hostitelský scheduler, broker, alokátor guest objektů ani
route solver. Úplný seznam výjimek a zdůvodnění je v `boundary.json`; rozbor
stejného autora v `host-boundary-self-review.md`. Jedinou npm závislostí je
připnutý build nástroj WABT, nikoli runtime knihovna pro simulaci.

## Dialekt a pevné kapacity

Buňky jsou unsigned 16bitové s přetékáním; vstup/výstup jsou bajtové. Prázdný živý
vstup stroj pozastaví, explicitní EOF dodá nulu. Tečka vypíše dolní bajt. Pohyb
mimo pásku je chyba. Osm instrukcí se nemění; není slibována přenositelnost na
8bitový dialekt.

Aktuální kernel má 398704 buněk, tedy 797408 bajtů BF pásky. To není celková RAM
host procesu. Kapacity: 512 residentních slovníkových položek, 24576 residentních
kódových slov, 24576 workspace slov; 16 procesních kontextů po 256 slovech,
64 hodnot na zásobníku, 16 návratových rámců a 16 soukromých slov na proces.
Schránka má čtyři zprávy. Rozšířený profil má osm modulů a 16 arén, každá nejvýše
512 bajtů zdroje a 256 modulových kódových slov. Původní menší profil zůstává pro
regrese. Zakázky mají 16 opakovaně použitelných slotů. Mapa má 16 uzlů a 46
počátečních orientovaných silnic, limit je 48.

Context sloty, zprávy, zakázky a arény se skutečně znovu využívají. Identifikátor
nového života není adresa slotu. Lifetime identity a logický čas se při dosažení
65535 odmítnou dále přidělovat; nezabalí se do staré identity. Některá diagnostická
16bitová počítadla se zabalit mohou. Obecné host počty BF instrukcí používají přesné
BigInt epochy; nemají vliv na guest význam. Residentní obecné Thread definice jsou
nadále monotónní: není tvrzeno univerzální reclaimování libovolného heapu.

## Plánování, ochrana a zprávy

Každé kolo prochází sloty ve stejném pořadí. Proces dostane nejvýše 1–32 modulových
instrukcí; generický výchozí limit je 8, město používá 32. Návrat z kořenové funkce,
yield, čekání nebo chyba mohou tah ukončit dřív. PC, zásobníky, návratové verze,
čekání a soukromá data se zachovají. Nekonečná smyčka bez yield proto dostává další
dávky, ale neblokuje tahy ostatních způsobilých procesů.

Cena pomocných operací je omezená kapacitami: nejvýše 16 kontextů, 16 zakázek,
48 hran, 16 uzlů nebo 16 verzí. Dijkstra pokračuje po fázích. Nejde o příslib
stejného času pro každý tah ani o real-time plánovač; logická spravedlnost není
měřená odezva UI.

Procesní překladač povoluje jen kontrolovaný profil. `state@`/`state!` kontrolují
vlastní index 0–15 uvnitř BF; role operace ověřují vlastníka. Proces nemůže použít
libovolnou adresu pásky, scheduler nebo správce modulů. Privilegovaný Thread
terminál je zvlášť označený. Vlastník, který si přepíše vlastní pásku, tuto ochranu
záměrně obchází; snímek není bezpečnostní sandbox proti svému vlastníkovi.

Schránka je FIFO. `send` vrací 1 pro přijetí, 0 pro plnou schránku, 2 pro
nedostupného příjemce a 3 pro vyčerpanou identitu. `recv` odebere jednu zprávu.
Pozastavení zachová poštu; `wait` čeká jen při prázdné frontě. Kombinace `sleep`,
`pending` a `recv` dovoluje nativní programový timeout. Odeslání do chybového či
ukončeného příjemce se odmítne. Opakovaný send je nová zpráva, proto průmyslový
protokol používá stabilní ID a fázi zakázky pro deduplikaci skutečného převodu.

## Materiál, doprava a selhání

Platí: suroviny v budovách a autech + dvojnásobek panelů v budovách, autech,
výrobním escrow a dokončené stavbě = 96. `industry-account` účet nezávisle sečte
uvnitř BF. Převzetí a odevzdání nákladu mění obě strany v jedné nativní operaci;
jiný proces do ní nevstoupí. Pozastavení obecného BF vykonavatele uvnitř této
operace uloží přesné rozpracované instrukce, nezačne přenos znovu.

Dispatcher vybírá nejbližší volnou dodávku pomocí omezené Manhattan heuristiky.
Není to globálně optimální plánování flotily. Samotná cesta používá Dijkstru nad
cenou `doba + mýto × váha`, váha je 0–16. Jedna dvojice opačných směrů silnice sdílí
kapacitu jednoho auta. Program dodávky může nastavit `priority` 0–9. Vyšší priorita
má při aktuálním úmyslu vjet přednost i před dřívějším slotem; starý úmysl po kole
vyprší. Zastavený nebo smyčkující program tak nedrží prázdnou silnici pouhým
zastaralým požadavkem. Už zahájenou jízdu priorita nevyhodí ze silnice.

Uzavření silnice brání novým odjezdům. Auto na segmentu dokončí zachycenou dobu a
uvolní rezervaci až při příjezdu. Chyba uchová soukromý stav, náklad, zakázku,
rezervaci a frontu. Nezávislá práce pokračuje, závislá může čekat na opravu.
Oprava pokračování je explicitní a opakuje oznámení podle nativní fáze zakázky;
neduplikuje materiál. Odstranění účastníka se odmítne, pokud něco stále vlastní.

## Výměna, ovládání a persistence

Editor má tři oddělené stavy: neuložený lokální návrh, zdroj uložený v BF a aktivní
přeloženou verzi. Tlačítko Apply pošle raw bajty; BF uloží zdroj a provede překlad.
Číselný ovladač továrny posílá hodnotu do `parameter!`. BF ověří revizi a jediný
marker `batch#`, upraví právě jeho literál, uloží, přeloží a zveřejní novou verzi.
Host text neparsuje ani nenahrazuje uživatelský program šablonou.

Publikace probíhá na vstupní hranici se zachovanými procesními pokračováními.
Pozastavené rámce dál vlastní starou verzi; další kořenové vyvolání přejde na novou.
Rozpracovaná cesta má vlastní pin. Jedna rollback verze a živé reference drží starý
kód; ostatní arény lze uvolnit. Neplatný překlad zachová poslední aktivní program,
i když uložený návrh zůstane chybný. Rollback obnoví aktivní kód, nevrací svět v čase.
Odlišné deklarované `schema#` se odmítne. Shodné číslo není důkazem, že vlastní
program zachází s vlastními daty smysluplně.

Export zahrnuje pásku, syrovou BF instrukční pozici, buffer vstupu a stav vykonavatele,
tedy zdroje, verze, procesy, poštu, časovače, zásoby, rezervace i rozpracovanou práci.
Import se zkouší v novém kandidátním stroji; vadný snímek nezničí původní použitelný
svět. Historie událostí není zpětně vymyšlena ze snímku. Build001/002 mají zachované
odpovídající staré kernely; nekompatibilní import do Build003 se odmítne.

## Dosavadní konkrétní důkazy

`process-literal-reference.txt` obsahuje doslovné opakování BF odeslání/probuzení a
jednoinstrukčního procesního tahu z nativně vzniklého snímku. Porovnává celý tape,
PC, pointer, výstup a počty instrukcí. Nenahrazuje doslovné provedení celého města.
`legacy-and-work-cycles-tests.txt` ověřuje 450 životních cyklů se zprávou a prací při
16 slotech. `industrial-capacity-waiter-tests.txt` zahrnuje živé cargo, výměnu,
rollback a stovky job lifetimes. `industry-priority-tests.txt` ověřuje arbitráž,
expiraci smyčkujícího účastníka a neplatné vstupy. Původních 76 regresí se zachovává.

`browser-cli-parity.json` potvrzuje přesnou shodu prvních 11 skutečných browser
vstupů a výstupů s novou CLI instancí aktuálního kernelu. Browser záznamy zvlášť
zachycují vlastní zdroj, chybnou verzi, rollback, nekonečnou smyčku, opravu a
soukromý stav 7. Jde o omezené reprodukovatelné kontroly stejného autora.

Srovnání v `reproduction-results.json` běží 64 stejných logických kol ze stejného
snímku a se stejnými otevřenými silnicemi. Jediná změna je batch jedné továrny (Riverside) 3 versus 5.
První varianta má 7 doručení, 14 výrobních dokončení a 3 osazené panely; druhá 6
doručení, 16 výrobních dokončení a zatím žádný osazený panel. Obě zachovávají účet 96.
Je to stavový výsledek dvou pravidel, nikoli naměřené časové zrychlení.

Celá kandidátní sada113/113prošla bez selhání či přeskočení za974272.576875ms
(`verify-candidate-01.txt`). Přiložený ZIP se skutečně přehrál v nové CLI instanci.

Měření (`metrics.json`, `measurements.md`): Apple M5,10logických CPU,32GiB RAM,
macOS26.6.2 (Darwin25.6.0),Node22.22.0. Tři nové BF bootstrappy v jednom host procesu. Medián
studeného BF bootu34.663s, prvního kola2.152s, samostatného prezentačního výstupu
1.362s, změny zdroje/překladu3.126s, zprávy27.65ms, rollbacku9.45ms.
Export20.67ms/import53.65ms. Dvacet cyklů se zprávou a uvolněním11.431s.
Špička RSS host procesu484.84MiB, BF páska zvlášť797408bajtů. Trasování a výroba
jsou měřeny jako celá kola s další prací, nikoli izolované volání algoritmu.
Nenárokuje se rychlost simulace podle plynulosti obrazu. Veřejné vydání zatím čeká.

## Dokončený svět a rozhraní

Aktuální výchozí svět dokončil obě stanice v CLI ve183.kole. Nezávislý browser
experiment s vlastní chybou, opravou a pozastavením dodávky dokončil druhou stanici
ve164.kole; pozorovaný snímek173se skutečně obnovil do nové instance. Nejde o
srovnání rychlosti: posloupnosti vstupů se liší. Viz completion.md.

Samostatná skutečná fronta při pozastavené dodávce zachovala3panely čekajícího
auta. Po obnovení držitel uvolnil silnici ve62.kole a čekající auto vyjelo v63.kole.
Snímek1487×1058byl zkontrolován vedle návrhu i v překrytí. Rozložení skutečného
grafu se liší; nejde o pixelovou shodu. Klávesnice, focus,390×844a reduced motion
byly ověřeny v uvedeném rozsahu, nikoli jako úplná certifikace přístupnosti.

## Skutečný BF úryvek

`bf-excerpt.txt` je prvních 720 příkazů nativního tokenizeru v aktuálním artefaktu,
na nulových offsetech 60912–61631. `tools/extract-bf-excerpt.py` znovu vygeneruje
kernel, ověří úplnou bytovou shodu a uloží původ/hash do `bf-excerpt.json`.
Úryvek nuluje stav tokenu, připraví pracovní buňky a začíná číst bajt vstupu a
kontrolovat komentář. Není to samostatný spustitelný program ani úryvek routingu.

```brainfuck
>>>>>[-]>[-]>>>>>>>>>>>>>>>>>>>>[-]>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>[-]>[-]>[-]<<[-]+>>[-]+++++++++++++++++++++++++++++++++<<[<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<,>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[-]>[-][-]>[-]<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<[->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>+>+<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<]>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>[-<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
<<<<<<<<<<<<<<<<<<<<<<<<<+>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
```

## Identita a dohledatelnost

Koncový implementační commit je
`f9ca7e5cdb5e9f450aeeb2dbe38413a7716d735f`. Pozdější změny záznamů se evidují
odděleně; samotný commit není důkaz veřejného nasazení.

- BF kernel SHA-256:
  `c6ee32e0f2f54738f1574b612dfe85c619d691285dc40af870f96d8e0e28558c`.
- Nativní zdroje platformy SHA-256:
  `e10c7d82a680129247929d9bd2f57dabf7bf5614e183e265c75531d698783e86`.
- Počáteční snímek, nula kol plánovače, SHA-256:
  `18b27dc6dca3e1ca1fa1904ce36ba5ec0383b1ec281312de6bc58716f42c4f04`.
- Reprodukční ZIP SHA-256:
  `29ce759a2337a235611a3b2dc44afbb641345dc119d94f21b4d89be33a566a02`.

Počáteční snímek vznikl skutečným překladem všech zdrojů v BF a přijetím počátečních
dat. Neobsahuje předpočítané trasy, dokončenou výrobu ani řešení města.
`initial-image.json` a kontrolní sestavení zachycují jeho původ.

`site-package-functional.json` váže veřejné soubory na implementační commit a
samostatnou Git historii transportu hostingu. `site-saved-functional.json` zachycuje
uložení balíčku; uložení samo není ověření veřejného běhu. Záznam veřejné kontroly
a konečný `final-deployment.json` připojí nasazenou verzi, anonymní porovnání souborů,
merge/tag a případné HTML vložené hostingem. Dokud tyto kontroly nejsou dokončené,
nelze z tohoto odstavce dovozovat úspěšné veřejné vydání.
