# Build 002 — přesný technický popis

Autorem architektury, implementace, testů, oprav i této seberevize je jediná instance Astra (`gpt-6-astra`, `xhigh`). Člověk dodal zadání a první schválenou předlohu. Nepoužil jsem subagenty ani jiný coding model. Nástroj `image_gen` vytvořil pouze grafické assety; jejich původ, přijaté originály a odmítnuté pokusy jsou v [asset-provenance.json](asset-provenance.json) a [journal.md](journal.md). Tato kontrola není nezávislý audit. Stav vydání a konkrétní identity uvádí [build.json](build.json); lokální ověření samo o sobě neprokazuje veřejné nasazení.

## Co bylo předtím a co přibylo

Build 001 zůstává na nezměněném tagu `build-001`, commit `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`. Poskytl BF kernel s kompilátorem a vykonavatelem obecného Threadu, zásobníky, slovník, paměťové operace, transakční úložiště, vážené trasy Dispatch a snímky celého stroje. Nové definice tehdy spotřebovávaly další místo v rezidentním kódu a slovníku; nebyl zde tento pojmenovaný workspace s uvolňováním verzí.

Build 002 přidává správce pojmenovaných zdrojů, další kompilátor omezeného modulového profilu Threadu, jeho evaluator, přesné vazby na verze, bezpečné publikování, rollback, piny a reclaiming. **To vše je napsáno v Threadu a vykonáváno skutečným BF kernelem.** Nová aplikační logika města, včetně hledání tras a krokování jízd, je rovněž Thread. Grafické město je konkrétní použití těchto schopností.

Kanonické zdroje:

- [workspace.thread](../../programs/workspace.thread): syrové názvy a zdroje, lexer, kompilace, kontrola zásobníkových efektů, modulový bytecode, evaluator, reference a uvolnění.
- [city-state.thread](../../programs/city-state.thread): proměnné a pole města. Jsou alokované před workspace, aby se omezily dlouhé přesuny BF ukazatele.
- [city.thread](../../programs/city.thread): silnice, zakázky, Dijkstra, vyhodnocení pravidla, cache nákladů, kroky, příjezdy, doručení a prezentační výstup.
- [city-boot.thread](../../programs/city-boot.thread): skutečné vstupní příkazy pro založení prvního modulu a města. [Manifest](../../programs/city-system.json) určuje pořadí syrových souborů, nikoli jejich hostitelský překlad.
- [core.thread](../../programs/core.thread): obecná základní slova Threadu. Historické `store.thread` a `dispatch.thread` se dále ověřují a lze je spouštět původním CLI profilem; městský profil je automaticky nenačítá.

## BF dialekt a bootstrap

Artefakt [kernel.bf](../../artifacts/kernel.bf) obsahuje výhradně osm instrukcí `> < + - . , [ ]` a koncový newline. SHA-256 tohoto souboru je `0ebd529deaf21dd77bba0ddaef77693e27fd1fffbc9930c9ca31b0bbde400d98`. Pevná páska má 169 164 buněk po 16 bitech, tedy 338 328 bajtů. Aritmetika buněk přetéká modulo 65 536; ukazatel nesmí opustit pásku. Výstup je bajtový. Dočasně prázdný vstup se pozastaví na čárce, aby pozdější vstup pokračoval přesně tam; explicitní konec vstupu má definovanou EOF sémantiku v [dialektu](../../docs/architecture.md).

Python v [kernel/build.py](../../kernel/build.py) a [tools/emitter.py](../../tools/emitter.py) sestavuje počáteční BF kernel. Generuje instrukce pro obecné výpočty; nečte uživatelské Thread soubory a nepočítá trasy ani odpovědi. Nejde o self-hosting. Tento bootstrap byl zachován. Přibyly pouze obecné primitivy `key`, `w@`, `w!`: syrové čtení bajtu a přístup do omezené pracovní paměti. Správa významu modulů do Pythonu přenesena nebyla.

Skutečný krátký úryvek z tohoto buildu je první čtveřice znaků souboru `kernel.bf`, na bajtových offsetech 0–3:

```brainfuck
[-]+
```

`[-]` opakuje odečtení do nuly, `+` nastaví buňku na 1. Při startu ukazatel stojí na buňce 0, pojmenované `running` v mapě kernelu. Úryvek tedy inicializuje příznak hlavní smyčky. Je emitován voláním `b.set(self.running, 1)` v `Kernel.build`; nejde o samostatný kompilátor ani ukázku výpočtu trasy. Jeho omezenou funkci nezaměňuji za důkaz celého systému.

## Kapacity a vlastnictví

Rezidentní kód obecného Threadu má 12 288 slov místo původních 8 192. Tuto změnu si vyžádala nová nativní platforma. Její slovník zůstává omezen na 256 položek, heap a původní store mají každý 4 096 slov. Rezidentní obecné definice se nadále přidávají monotónně. **Zvětšení rezidentní oblasti není mechanismus reclaimingu modulů.**

Modulový workspace má pevně 4 096 slov. Čtyři záznamy po 320 slovech a šest arén po 448 slovech používají 3 968 slov. Název má nejvýše 23 ASCII bajtů; každý modul má draft do 256 bajtů. Každá verze uchovává vlastní zdroj do 256 bajtů a nejvýše 128 slov bytecodu. Zbytek arény tvoří metadata a vazby. Neúspěšný překlad nepřidává novou rezidentní definici.

Modul obsahuje jednu definici se shodným názvem. Podporuje literály, aritmetiku, zásobníková slova, podmínky, strukturované cykly a volání jiného modulu. Přesný seznam a stack efekty uvádí [modules.md](../../docs/modules.md). Jde o výslovně omezený čistý profil, nikoli o úplný obecný Thread. Kompilátor ověřuje aritu, soulad větví a smyček a výslednou hloubku zásobníku. Evaluator má 64 hodnot, 16 rámců a společný rozpočet 1 024 bytecode instrukcí na kořenové volání. Chyba dělení nebo vyčerpání rozpočtu vrací neúspěch a nulové výsledky deklarované arity. Platná kompilace neznamená záruku ukončení pro všechny vstupy ani užitečného skóre.

## Verze, safe point, piny a rollback

Aktivní verze a jedna předchozí rollback verze představují kořeny. Překládané volání zachytí přesnou aktuální verzi cílového modulu, nikoli jeho budoucí obsah. Úspěšná kompilace získá příslušné reference; odmítnutý kandidát je nezíská. Nové verze mohou odkazovat jen na existující starší verze, takže závislosti tvoří acyklický graf. Každý kořen, explicitní pin a závislá verze přidává referenci. Nativní iterativní collector uvolní arénu bez referencí a poté její závislosti.

Publikace nastává uvnitř jediného proudu BF vykonávání po úplném ověření kandidáta, mezi dokončenými nativními operacemi. Není to souběžná výměna instrukcí pod běžícím voláním. Staré přímé vazby a piny si ponechají starý program. `module-rollback` prohodí aktivní a předchozí kořen, bez přepisování města. `module-delete` odmítne externí živé reference; jinak kořeny odstraní a uvolní nevyužité verze. Šest obsazených arén může další kompilaci legitimně zablokovat.

Verze mají sériové identifikátory oddělené od opakovaně používaného čísla arény. Po sériovém čísle 65 535 se další publikace odmítne, identita nepřeteče na starý handle. Počet explicitních pinů je omezen na 60 000. Uvolnění nemusí fyzicky nulovat staré bajty; stav a délky zabraňují jejich interpretaci. Není slibováno bezpečné vymazání soukromého zdroje z vlastní pásky.

## Město a rozpracovaná práce

Město má 16 uzlů, 44 počátečních orientovaných silnic při kapacitě 48 a tři vozidla s jedním cílem na vozidlo. Silnice nesou dobu, mýto a otevřenost. Dijkstra vybírá nejmenší nezáporné skóre z nativně vyhodnoceného pravidla; město přijímá skóre silnice pouze 1–1 023. Vyhodnocení používá čistou jednoprvkovou memoizaci a celou tabulku nákladů v BF, s přesnou verzí a generací silnic. Každá změna silnic cache také explicitně zneplatní, takže přetečení generace neobnoví starou tabulku.

Stojící auto při kroku zvolí trasu, získá pin aktivní verze a vyjede s postupem nula. Další logické kroky zvětšují postup. Doba právě projeté silnice je zachycena při odjezdu. Změna pravidla, cíle, otevřenosti ani budoucí doby silnice auto nepřemístí. Při příjezdu na původní konec pin uvolní; teprve další odjezd používá aktuální pravidlo. Uzavření silnice blokuje nové plánování, nikoli dokončení již zahájeného segmentu. Není zde model kolizí ani provozu. Počítadla kroků a doručení jsou 16bitová, nikoli neomezený čas.

Konkrétní reprodukované srovnání: původní `+` dává vanu 1 cestu `12 8 9 10 11 15`, skóre 15. Zdroj `: delivery-rule.thread 8 * + ;` dává `12 8 4 0 1 2 3 7 11 15`, skóre 22. V obou případech je placený most otevřený a oba nové stroje dostaly stejné tři logické kroky. Skóre není čas jízdy: zahrnuje programově vážené mýto. [Reprodukce z prohlížeče](browser-reproduction.json) a [nový CLI replay](browser-reproduction-cli.txt) obsahují přesná data.

Nový ručně zadaný uživatelský program během ověření byl `dup 0= if drop 1 + else 6 * + then`, vložený do definice `delivery-rule.thread`. Pro dobu 2 a mýto 5 v nové CLI instanci skutečně vrátil skóre 32. Po obnovení rozpracovaného snímku a původním příjezdu plánoval z uzlu 8 do 15 cestu přes severní most se skóre 28, verzí 2. Doloženo v browser-image-cli.txt a browser-decision.txt; kernel se pro tyto vstupy neregeneroval.

## Přesný tok od editoru k obrazu

Editor pouze vytvoří raw vstup s přesným počtem bajtů. BF `source-write` uloží draft a oznámí úspěch. Až po tomto oznámení UI pošle `module-compile`. Nativní lexer přečte uložený zdroj, vytvoří a ověří kandidáta a publikuje verzi. Následující nativní rozhodnutí vyhodnotí tuto verzi a emituje `POLICY`, `COSTS`, `EDGE-COST`, `ROUTE` a úplný `CITY` stav.

[site.mjs](../../dist/site.mjs) zajišťuje tlačítka, vstupní rámce, raw log, oddělené snímky a přenos odpovědí. [presentation.mjs](../../dist/presentation.mjs) čte délkově rámované zdroje a číselné prezentační záznamy. [city-scene.mjs](../../dist/city-scene.mjs) promítá emitované souřadnice, skutečné silnice, poslední emitovanou cestu a polohy. JavaScript interpoluje pouze dvě již pozorované polohy; nevypočítává další úsek, úkol, kolizi ani doručení. Dekorativní budovy, zeleň a kamenné mosty jsou grafika. BF sám nekreslí 3D obraz.

## Úplné zdůvodnění host částí

[boundary.json](../../boundary.json) je soupis jednotlivých souborů a závislostí. Python bootstrap a emitter jsou sestavení počátečního stroje. JavaScript `engine.mjs`, `wasm-engine.mjs` a WAT/Wasm jsou obecný vykonavatel osmi instrukcí; optimalizace slučují běhy a obecné smyčky, nepoznávají Thread slova ani městské události. `wabt` 1.0.39 je jediná npm závislost, pouze při sestavení Wasm. Produkce nemá externí npm runtime balíčky.

`client.mjs`/`worker.mjs` zajišťují pracovní vlákno, syrový vstup, výkonové rozpočty a pokračování. `images.mjs`, CLI a OS persistence ukládají neprůhlednou pásku s ukazatelem, PC, frontou vstupu a kontrolním součtem. UI, parser prezentačního výstupu, Canvas, CSS, font Inter a ikony Phosphor poskytují zobrazení a ovládání; nedostávají kompetenci překladu nebo simulace. Původní obrazové assety jsou lokální a jejich magenta pozadí odstraňuje prezentační compositing. Testovací C interpreter, grafová orákula, měření, replay verifier, balení a Sites transport jsou oddělené nástroje. Žádné orákulum ani očekávaný výstup se neimportuje do živé výpočetní cesty.

## Persistence, ověření a meze důkazu

Snímek zachovává všechny zdroje, bytecode, verze, reference, data, rozpracovaný stav i obecné pokračování BF. Import běžného městského UI nejdříve ověří snímek v novém workeru a teprve po čitelném městském rámci nahradí původní stroj. Poškozený a nekompatibilní snímek jej nenahradí. Uvnitř operace pozastavený snímek lze dokončit obecným CLI; městské UI vyžaduje dokončenou vstupní hranici. Image checksum není autentizace proti úmyslnému přepsání vlastního stroje. Obecný Thread terminál umožňuje záměrně poškodit paměť; není izolací nedůvěryhodných uživatelů.

Build 001 image nový kernel výslovně odmítá. Starý kernel, runtime a zdroje jsou zachovány pod `dist/build-001/`; 17 souborů je bajtově původních. Historické HTML má pouze přiznané úpravy cest a navigace. Není deklarována migrace. Export není automatické cloudové uložení a samotné publikování verze nedělá data trvalými mimo proces.

Celá lokální sada prošla 74/74, bez přeskočených testů, v 528 213,834 ms. Původních 50 regresních testů zůstalo. Test 450 cyklů přeložil souhrnně 9 000 slov, překročil původních 8 192 slov i 256 položek, používal stále šest arén a skončil se 40 živými slovy ve dvou verzích; po odstranění nezůstala žádná živá verze. Rezidentní kód 7 078 slov a slovník 162 položek během cyklů nerostly. Tento poslední zátěžový běh trval 430 572,395 ms, nebyl izolovaným benchmarkem. Viz final-local-tests.txt.

Diferenciální testy obecných vykonavatelů zůstávají. Doslovný C BF interpreter navíc provedl 374 713 154 388 příkazů při evaluaci modulu a 352 585 709 028 při odmítnuté kompilaci; porovnány byly výstup, celá páska, PC, ukazatel, high-water a počítadlo instrukcí. Tyto velké omezené případy začínají z raw nativního checkpointu připraveného optimalizovaným vykonavatelem — to je výslovná podmínka důkazu. Původní reference z nulové pásky zůstává. Náhodné a nepřipravené grafy kontroluje testovací Bellman-Ford mimo produkci. Konečné množství případů není důkaz všech programů.

Měření v [metrics.json](metrics.json) použilo Apple M5, 10 logických CPU, 32 GiB RAM, Darwin 25.6.0, Node 22.22.0, tři sekvenční nové BF starty v jednom procesu a generic Wasm executor. Mediány: boot 7 971,846 ms; uložení zdroje 111,031 ms; překlad/publikace 603,805 ms; první krok se třemi trasami 4 444,390 ms; průběžný krok 32,853 ms; příjezd 168,305 ms; teplý výpočet jedné trasy 1 158,735 ms; 20 cyklů reclaimingu 26 601,707 ms. Jednorázové načtení artefaktů trvalo 364,276 ms. Maximum RSS host procesu bylo 316 352 KiB, odděleně od 338 328 bajtů BF pásky. Prohlížeč navíc plánuje worker a vykresluje; tyto hodnoty nejsou slibem jeho latence nebo snímkové frekvence.

Aktuální veřejný artefakt musí být svázán s GitHub implementačním commitem, případným metadata-only uzavřením, tagem a hostingovým receipt. Přesné identity a živé kontroly patří do záznamu vydání; úspěch lokálních testů ani samotný publish nástroj je nenahrazuje. Vizuální snímky a překrytí se hodnotí proti přesné schválené předloze, nikoli podle hashe obrázku. Neprohlašuji pixelovou shodu ani úplnou certifikaci přístupnosti.
