# 8 Instructions — Build 002: A city you can reprogram

Pokračuj v projektu jako jediný autor Astra v režimu xHigh. Toto je zadání k autonomní realizaci Build 002 od implementace přes ověření až po aktualizaci stávajícího veřejného webu a GitHubu. Chci co nejmenší lidské zásahy. Běžná technická a vizuální rozhodnutí dělej sám; výsledek dokonči a oprav zjištěné problémy.

## 1. Identita projektu a závazná předloha

- Kanonický projekt: `/Users/ondrej/BRAINFUCK`.
- GitHub: https://github.com/OnFiala/eight-instructions
- Stávající veřejný web: https://eight-instructions.andrewxix.chatgpt.site
- Poslední ověřený základ Build 001: `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`, tag `build-001`. Ber to jako výchozí informaci, před prací ověř skutečný stav.
- Vybraný a schválený vizuál je VÝHRADNĚ první koncept „A city you can reprogram“ / Living Dispatch:
  `/Users/ondrej/Documents/Codex/2026-09-10/referenced-chatgpt-conversation-this-is-an/outputs/stage-2-concept-1.png`
- Originál má 1487 × 1058 px; SHA-256: `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`.

Obrázek skutečně otevři a prohlédni. Ulož jeho přesnou kopii do projektu jako schválenou vizuální referenci Build 002. Nezaměň ho za druhý nebo třetí koncept. Vizuální směr už byl vybrán; nevyžaduj nový výběr a negeneruj tři nové alternativy. Pokud soubor není dostupný, vyžádej pouze tuto konkrétní předlohu a mezitím pokračuj v nezávislé práci na BF jádru.

Před změnami ověř hostitele, pracovní adresář, branch/HEAD, dirty/ahead/behind stav, oprávnění a relevantní souběžnou práci. Přečti projektový `AGENTS.md`, `PROTOCOL.md`, architekturu, hranice host/BF, persistence a záznamy Build 001. Načti CORTEX kontext pro `brainfuck`; významná rozhodnutí a výsledek tam zaznamenej. Použij aktuální relevantní dokumentaci a dostupné nástroje, nikoli předpokládané API.

## 2. Ústřední cíl: Brainfuck

Centrem celého projektu je programovací jazyk BRAINFUCK a jeho osm instrukcí `> < + - . , [ ]`. Build 002 musí podstatně zvýšit schopnosti systému běžícího uvnitř BF. Krásné město má tyto schopnosti zviditelnit.

Vytvoř malé doručovací město řízené programy v Threadu. Uživatel má přímo uvnitř BF stroje ukládat pojmenovaný zdroj, upravovat jej, překládat, bezpečně nahrazovat moduly a získávat zpět paměť po bezpečně odstraněných verzích. Důsledky změny programu musí být vidět na chování města a musí jít reprodukovat.

Zachovej permanentní protokol experimentu. Jsi jediný coding model i autor architektury, implementace, oprav a self-review: Astra xHigh, bez subagentů a bez druhého coding modelu. Člověk dodává výzvu a vizuální předlohu, nepíše ani neopravuje produkční kód. Nástroj pro generování obrázků může vytvářet čistě grafické assety; jeho použití a původ assetů transparentně zaznamenej.

## 3. Nepřekročitelná hranice BF / host

Uvnitř BF musí probíhat:

- Uložení a správa zdrojů, tokenizace a překlad Threadu.
- Význam modulů, vazby mezi nimi, publikování nové verze, bezpečné odstranění a uvolnění paměti.
- Stav města, silnic, zakázek a vozidel; pravidla simulace, logické kroky a rozhodnutí o doručení.
- Výběr a vyhodnocení tras, nákladů, mýta a uživatelských pravidel.
- Zachování aplikačních dat při výměně kódu a konzistentní chování při odmítnuté změně.

Významnou novou aplikační logiku preferuj v Threadu vykonávaném skutečným BF kernelem. Nutné změny kernelu smí používat stávající auditovatelný generátor; generátor musí emitovat výpočet, nikdy předpočítávat řešení konkrétního vstupu.

Python, JS, Wasm nebo jiný hostitelský jazyk smí zajišťovat pouze odůvodněné hranice: sestavení počátečního kernelu a assetů, obecné vykonávání osmi BF instrukcí, raw I/O, OS operace, ukládání neprůhledných snímků, rozhraní a rendering. Renderer smí číst prezentační výstup BF a převádět jej na obraz. Nesmí podle názvů Thread slov nebo aplikačních událostí provádět výpočet za guest program.

JavaScript může interpolovat pohyb mezi skutečnými BF stavy. Nesmí si domýšlet další cestu, úkol, kolizi, dokončenou zásilku nebo budoucí simulační stav. Dekorace, kamera, světla a vzhled budov jsou prezentační; vykreslené propojení silnic a stav průjezdnosti musí souhlasit s guest daty.

Nevkládej do hostitele náhradní kompilátor, správce významu modulů, alokátor guest objektů, route solver, simulaci ani předpočítané scénáře. Obtížnost ani pomalost BF nejsou důvodem tuto hranici překročit. Optimalizace vykonavatele musí být obecná a významově ekvivalentní BF.

Každou novou nebo změněnou host komponentu zdůvodni v manifestu hranic: co dělá, proč patří mimo BF a proč nejde o odsun hlavní logiky. Zkontroluj i závislosti. Neobhajuj čistotu poměrem řádků, velikostí BF souboru nebo GitHub jazykovými procenty. Nevynucuj samoúčelný přepis funkčního bootstrapu; minimalizuj nové výjimky a údržbu.

## 4. Vizuální kvalita je povinná část výsledku

Předlohu č. 1 ber jako závazný cíl, nikoli volnou inspiraci. Zachovej její kompozici, proporce, izometrický pohled, bohatost scény, typografickou hierarchii, tmavý podklad, světlé budovy, limetkové trasy, vodní kanál, mosty, vozidla, pravý panel modulu a spodní pás událostí a paměti.

Chci nádherné, propracované a soudržné malé město. Dopřej péči materiálům, světlu, stínům, zeleni, nábřeží, vozidlům, čitelnosti tras i jemným přechodům. Zachovej vizuální dominanci města a přehlednost jednoho hlavního úkolu. BF musí být viditelný v identitě projektu a v cestě od změny programu k výsledku.

Pracuj ve stávajícím projektu a respektuj jeho funkční runtime. Použij relevantní workflow pro převod vybraného obrázku do rozhraní, ale nevytvářej náhradní generickou aplikaci. Výběr 2D/2.5D/3D renderingu a způsob výroby kvalitních assetů je na tobě; zvol nejjednodušší řešení, které skutečně dosáhne předlohy a zachová BF hranici. Grafické knihovny nesmějí obsahovat aplikační simulaci.

Jedna statická předloha použitá jako pozadí s tlačítky navrchu nesplňuje zadání. Scéna musí věrně zobrazovat skutečný stav programu a reagovat na vlastní vstupy uživatele. Nepoužívej placeholdery, náhodné emoji budovy, provizorní krabice ani obecný dashboard jako hotový výsledek.

Obrázek obsahuje ilustrativní texty a geometrii. Zachovej jeho estetiku, ale oprav věcné nepřesnosti: zdroj modulu je Thread, který se překládá uvnitř BF; směry silnic, cesty, čítače a stav paměti musí odpovídat realitě. Zdroj musí být dostupný a editovatelný. Ilustrativní „Example trace“ a „Design concept“ nahraď skutečnými stavy až po implementaci a ověření.

Porovnej screenshot implementace s předlohou při odpovídajícím desktop viewportu, ideálně 1487 × 1058. Zkontroluj vedle sebe i překrytím kompozici, velikost města, perspektivu, proporce panelů, světlo, assety, barvy, typografii a spacing. Opakuj úpravy a screenshotové ověření, dokud odstraníš významné rozdíly. Dolož také ovládání v dalších stavech a použitelný užší layout, klávesnici, focus a reduced motion. Neprohlašuj pixelovou shodu nebo přístupnost bez příslušného ověření. Významný zbývající vizuální rozdíl znamená PARTIAL, ne hotovo.

## 5. Funkční obsah Build 002

Navrhni soudržný a měřitelný rozsah: orientačně 12–24 uzlů, několik dep a cílů a tři vozidla. Konečné kapacity stanov podle měření; udrž jasně omezené a dokumentované zdroje. Plynulost obrazu nezaměňuj za frekvenci nativní simulace.

Hlavní scénář:

1. Návštěvník spustí skutečný stroj a uvidí město, zadání doručení a jeho průběh.
2. Otevře pojmenovaný modul, například `delivery-rule.thread`, a upraví pravidlo pro trasování, například preferenci silnic bez mýta.
3. Zdroj se uloží uvnitř BF a odtud se skutečně přeloží. Není to jen text ponechaný v editoru nebo hostitelské úložiště se stejným názvem.
4. Platná nová verze se zveřejní v přesně definovaném bezpečném bodě. Město, zakázky a ostatní aplikační data zůstanou zachována. Zdokumentuj osud rozpracovaných jízd, starých volání a živých odkazů; nepřesouvej auta svévolně na novou pozici.
5. Nová rozhodnutí prokazatelně používají nový program. Uživatel může vytvořit vlastní variantu, ne pouze přepínat dva připravené výsledky.
6. Chybný, neúplný nebo příliš velký modul se odmítne s čitelnou diagnostikou. Dosavadní použitelná verze zůstane zachována bez úniku paměti po neúspěšném pokusu.
7. Funguje návrat na předchozí verzi a bezpečné odstranění nepotřebného modulu. Politika dostupných starých verzí musí být omezená, vysvětlená a slučitelná s reclaimingem.
8. Uživatel může pozastavit běh, udělat logický krok, exportovat celý workspace a pokračovat v nové instanci.

Při demonstraci změny kódu drž stejné vstupy: zpoplatněný most musí zůstat otevřený u obou verzí. Uzavření silnice je jiný experiment se změnou dat. Odděleně ukaž, že funguje i tento případ.

Řešení alokace, vazeb, kompatibility, bezpečné publikace a rollbacku navrhni autonomně. Jasně stanov vlastnictví stavu a invariants před implementací. Neoslabuj zadání tím, že při každé změně resetuješ celý stroj nebo jen navyšuješ kapacitu.

## 6. Důkaz musí být viditelný a reprodukovatelný

U konkrétního rozhodnutí ukaž vstup, verzi modulu, skutečný BF výstup a jeho vizuální důsledek. Běžný návštěvník musí rozumět krátkému vysvětlení; zájemce musí mít možnost rozbalit přesná data.

Přidej srovnání dvou verzí ze stejného výchozího snímku a nad stejnou posloupností vstupů. Porovnávej stejné logické kroky. Záznam přehrávaný z minulosti označ odlišně od nového výpočtu. Případná animace průběhu algoritmu musí vycházet ze skutečně emitovaných událostí, nikoli z odhadované dekorace.

Umožni stáhnout minimální reprodukční balíček: identitu kernelu a modulů, kompatibilní počáteční snímek, vstupy, očekávaný nativní výstup a návod ke spuštění přes CLI. Ověř jeho použití v nové instanci. Zajisti dohledatelnost vykreslených výsledků až k výstupu použitého BF artefaktu.

Vizualizaci obsazené a znovu použité paměti odvozuj ze skutečného nativního stavu. Celkovou paměť host procesu reportuj odděleně od BF pásky. Hash, zelený štítek, hezká animace ani rostoucí čítač samy o sobě nejsou důkaz BF-native výpočtu.

## 7. Povinné ověření

- Zachovej původní regresní pokrytí Build 001 a oprav všechny regrese způsobené změnou. Změní-li se kontrakt, změnu explicitně zdůvodni; nemaž testy jen proto, aby byly zelené.
- Ověř vlastní nově napsaný uživatelský modul a nepřipravené vstupy bez regenerace kernelu.
- Ověř platnou a odmítnutou výměnu, živé odkazy, rozpracovanou práci, rollback, nedostatek paměti, odstranění modulu a opakovaná selhání bez úniku.
- Proveď stovky cyklů výměny/uvolnění při pevné kapacitě. Test musí překročit mez, na níž by původní monotónní přidávání selhalo. Měř skutečné hodnoty.
- Ověř deterministickou simulaci a opakování stejného experimentu z nového stroje.
- Ověř shodu relevantních výstupů prohlížeče a CLI; omezené reprezentativní workloady porovnej také s doslovným referenčním BF interpretem. Zachovej diferenciální ověření obecných optimalizací vykonavatele. Testovací orákula nesmějí být součástí produkční výpočetní cesty.
- Ověř skutečné export/import roundtripy se zdroji, verzemi modulů, daty a rozpracovaným stavem. Kompatibilitu Build 001 image řeš explicitně: testovaná migrace nebo zachovaný starý kernel a jasné odmítnutí nekompatibilního importu.
- Změř start, překlad/výměnu, logický krok, route workload a opakované reclaim cykly. Uveď hardware, konfiguraci, limity a metodiku. Neslibuj neměřenou rychlost.
- Dokonči vizuální kontrolu předloha versus skutečné rozhraní, ovládání celého scénáře a adversariální audit hranice BF/host. Self-review správně označ jako práci stejného autora, nikoli nezávislý audit.

## 8. GitHub, historie a dokumentace

Všechny podstatné změny zaznamenej v existujícím repozitáři. Zachovej skutečnou posloupnost práce v přiměřených commitech, včetně významných selhání, oprav a architektonických rozhodnutí. Nevytvářej zpětně falešnou historii a nepřepisuj Build 001.

Průběžně veď `records/002/` podle konvencí projektu: zadání, model/reasoning, výchozí a koncový commit, rozhodnutí, journal, hranice host/BF, testy, měření, vizuální důkazy, původ assetů, omezení, zásahy člověka, porušení protokolu a závěrečné hodnocení.

Aktualizuj kanonické README, architekturu, jazyk/moduly, persistence, manifest hranic, reprodukční postup a navigaci mezi buildy. Po ověření publikuj odpovídající změny na GitHub, nech projít příslušné CI a uzavři build identifikovatelným tagem `build-002`, pokud neexistuje. Existující tag nepřepisuj. Dokonči potřebné merge běžnou chráněnou cestou; neobcházej pravidla větve.

Uchovej reprodukovatelnost Build 001 a jeho staré artefakty. Rozliš koncový implementační commit, případné metadata-only uzavření, tag a konkrétní nasazený artefakt.

## 9. Aktualizace stávajícího veřejného webu

Aktualizuj stávající projekt a jeho dosavadní veřejnou adresu. Nezakládej náhradní web, který by odpojil historii projektu. Použij aktuální podporovaný workflow existujícího hostingu; zachovej vazbu mezi GitHub zdrojem a nasazenými soubory.

Hlavní zážitek a aktuální build bude Build 002 podle schválené předlohy. Build 001 zůstane dohledatelný jako první etapa se svým vysvětlením a důkazy. Aktualizuj hero, popis experimentu, demo, „How it works“, BF/host hranice, ověření, omezení, historii i odkazy. Odstraň zastaralá tvrzení a čísla z ploch popisujících aktuální build; historická data ponech jasně označená.

Veřejný obsah piš anglicky, srozumitelně a věcně. Při prvním významném výskytu vysvětli „Brainfuck (BF) programming language“ a osm instrukcí. Vysvětli Thread, skutečnou novinku druhé etapy a úlohu hostitelských jazyků. BF má být hlavní příběh projektu, město jeho viditelný příklad. Neoznačuj bootstrap jako self-hosting a netvrď, že BF sám kreslí 3D grafiku.

Před publikací dokonči lokální funkční a vizuální ověření a připrav rollback na předchozí ověřenou verzi. Po publikaci ověř anonymní veřejný přístup, skutečný běh dema, vlastní změnu modulu, chybovou cestu a export/import. Ověř identitu veřejného kernelu, runtime a relevantních assetů vůči vydanému zdroji; hostingové transformace HTML transparentně rozliš. Zaznamenej deployment receipt. Samotný úspěch publish nástroje není ověření živého webu.

## 10. Autonomie a oprávnění

Tímto autorizuji implementaci v tomto projektu, potřebné lokální testy a dočasný preview server, tvorbu grafických assetů dostupnými nástroji, běžné projektové závislosti, commity/push a potřebné standardní merge v existujícím GitHub repozitáři i aktualizaci stávajícího veřejného webu po úspěšném ověření. Nezastavuj kvůli dalšímu obecnému schválení už zadaných kroků.

Toto neautorizuje publikování na X, nové nákupy nebo předplatné, nové veřejné služby, změny účtů či oprávnění, oslabení bezpečnosti, force-push, destruktivní přepsání historie ani zásahy do Macu mini/CORTEX runtime. Backend pro tento build nepřidávej jako vedlejší projekt.

Respektuj skutečná oprávnění a povinné interakce platformy. Je-li nutná autentizace nebo chybí konkrétní oprávnění, dokonči vše nezávislé a požádej o jediný konkrétní potřebný zásah s jasným důvodem. Neobcházej blokaci jiným účtem, deploymentem nebo nebezpečným postupem. Mě nenuť navrhovat architekturu, hledat běžné chyby nebo ručně opravovat kód.

Pracuj vytrvale přes potřebné iterace a uchovávej průběžný stav pro pokračování. Neprohlašuj hotovo při dosažení limitu nebo na základě mockupu. Hlásíš-li PARTIAL či blokaci, uveď přesnou chybějící část a zachovej bezpečný použitelný stav.

## 11. Závěrečné výstupy pro mě

Na konci dodáš odkazy na skutečný web, GitHub, Build 002 tag/commit, CI, reprodukční balíček, screenshoty odpovídající předloze a záznam vydání. Jasně uveď PASS / PARTIAL / NO-GO, neprovedené kontroly a zbývající limity.

K tomu vytvoř dva samostatné české popisy a ulož je i k Build 002:

**A. Naprosto přesný technický popis.** Co bylo v Build 001 a co skutečně přibylo; které zdrojové soubory a algoritmy běží uvnitř BF; úplné zdůvodnění Python/JS/Wasm a dalších host částí; BF dialekt, paměť, moduly, odkazy, safe points, reclaiming, rollback, simulace a persistence; přesný tok od editace zdroje k obrazu; naměřené výsledky a jejich prostředí; ověření a jeho limity; identita zdroje a veřejného deploymentu. Tvrzení podepři dohledatelným kódem, testem nebo měřením. Přidej krátký skutečný BF úryvek z tohoto buildu, jeho původ a správné vysvětlení jeho funkce. Žádná odhadovaná čísla prezentovaná jako měření.

**B. Lidské vysvětlení.** Srozumitelně a poutavě vysvětli, co teď můžu dělat a proč je to zajímavé, i když neznám kompilátory ani správu paměti. Proveď mě jedním konkrétním experimentem se skutečnými výsledky: co změním, co uvidím a co se uvnitř stalo. Vysvětli, proč to pořád je Brainfuck, co dělá Thread a co pomáhají zajistit ostatní jazyky. Použij přirovnání pouze tam, kde nezkresluje skutečnost. Text musí být vhodný jako základ pro můj vlastní příspěvek na X.

Navíc připrav krátký anglický návrh příspěvku na X v přirozeném osobním tónu a krátký doplňující komentář vysvětlující BF/host hranici. Bez marketingových superlativů, smyšlených prvenství nebo tvrzení o schopnostech nad rámec dokončeného buildu. Oba texty pouze připrav, nic na X neposílej.

Build 002 je hotový teprve tehdy, když funguje skutečné BF jádro, bezpečná výměna programů i krásné věrné rozhraní, reprodukční a vizuální kontroly prošly, GitHub a stávající veřejný web odpovídají výsledku a oba závěrečné popisy jsou přesné. Začni realizací podle tohoto zadání.
