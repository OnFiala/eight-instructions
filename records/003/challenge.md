# 8 Instructions — Build 003: A city made of programs

Pokračuj v projektu jako jediný autor Astra v režimu xHigh. Toto zadání je pro autonomní realizaci Build 003 od návrhu přes implementaci a ověření po vydání na stávajícím GitHubu a veřejném webu. Běžná technická a vizuální rozhodnutí dělej sám. Chci dokončený, použitelný výsledek a minimum lidských zásahů.

## 1. Projekt, výchozí stav a protokol

- Kanonický projekt: `/Users/ondrej/BRAINFUCK`.
- GitHub: https://github.com/OnFiala/eight-instructions
- Stávající veřejný web: https://eight-instructions.andrewxix.chatgpt.site
- Výchozí informace: dokončený Build 002, tag `build-002`, commit `a80087662a66e7d04c1fc77cbce87cf996d60e63`. Před prací ověř skutečný stav; tuto informaci nepovažuj za náhradu kontroly.
- Finální záznam Build 002: https://github.com/OnFiala/eight-instructions/releases/download/build-002/final-deployment.json
- Předchozí Build 001: tag `build-001`, commit `6d7c6b0cb7fa73eda0504ef0d2cc10b1429c5dd0`. Jeho historii a artefakty zachovej.

Před změnami ověř hostitele, pracovní adresář, branch/HEAD, dirty/ahead/behind stav, oprávnění a relevantní souběžnou práci. Přečti `AGENTS.md`, `PROTOCOL.md`, architekturu, jazyk/moduly, persistence, manifest hranic, testy a záznamy Build 002. Načti CORTEX kontext pro `brainfuck`; významná rozhodnutí, chyby a výsledek tam zaznamenej. Používej aktuální dostupné nástroje a dokumentované API.

Architekturu, kód, opravy, testy a self-review provádí pouze Astra xHigh. Bez subagentů a druhého coding modelu. Člověk dodává výzvu a preference, nepíše ani neopravuje produkční kód. Obrazový nástroj smí tvořit grafické assety; jeho použití a původ výstupů zaznamenej. Self-review označ jako práci stejného autora.

## 2. Hlavní cíl: skutečný skok ve schopnostech BF

Centrem projektu zůstává Brainfuck (BF) programming language a jeho osm instrukcí `> < + - . , [ ]`.

Build 001 přinesl prostředí pro spouštění programů, data a výpočet tras. Build 002 přidal pojmenované zdroje uvnitř BF, překlad modulového profilu Threadu, bezpečné verze, rollback a uvolňování arén. Build 003 má přidat samostatné stavové programy, které spolu komunikují, střídají se ve vykonávání a pokračují i při chybě jednoho z nich.

Vytvoř uvnitř existujícího BF stroje malý systém procesů. Každý proces má vlastní stav, rozpracované vykonávání a omezenou frontu zpráv. Depa, továrny, vozidla a vybrané řadiče dopravy musí být konkrétními programy tohoto systému. Uživatel může jejich zdroj měnit, přidat kompatibilního účastníka, jednoho zastavit nebo rozbít a celý svět obnovit ze snímku.

Jde o logický souběh řízený plánovačem uvnitř jednoho BF stroje, nikoli o požadavek paralelních CPU vláken. Neprezentuj výsledek jako plný operační systém nebo self-hosting. Přínos měř novými schopnostmi BF, nikoli délkou BF souboru, procenty jazyků nebo umělým vytěžováním CPU.

## 3. Závazná hranice BF / host

Uvnitř BF musí probíhat:

- Uložení zdrojů, tokenizace, překlad a vykonávání Thread programů.
- Plánování procesů, ukládání jejich pokračování, čekání, probouzení a logické časovače.
- Odesílání a příjem zpráv, fronty, jejich kapacity, identity a pořadí.
- Vlastnictví a kontrola přístupu ke stavu, správa paměti a uvolňování procesů, zpráv, dat a verzí.
- Význam modulů a vazeb, bezpečné zveřejnění, kompatibilita, rollback a osud rozpracovaných volání.
- Veškerá pravidla města: zásoby, výroba, objednávky, náklad, stavba, silnice, rezervace průjezdu, trasy, pohyb, doručení a reakce na chyby.
- Autoritativní validace vstupů a určení, zda je daná uživatelská akce přípustná.

Novou aplikační a systémovou logiku preferuj v Threadu vykonávaném skutečným BF kernelem. Nutné generické změny kernelu mohou používat stávající auditovatelný generátor. Ten musí emitovat výpočet, nikoli předpočítávat řešení vstupů.

Host může zajišťovat sestavení kernelu a assetů, obecné významově ekvivalentní vykonávání BF, syrové I/O, OS operace, neprůhledné snímky, rozhraní a rendering. Smí pozastavit celý BF vykonavatel kvůli odezvě rozhraní; nesmí vybírat další guest proces, doručovat aplikační zprávy podle jejich významu nebo počítat stav města. Žádný hostitelský Thread interpreter, scheduler procesů, message broker, alokátor guest objektů, route solver ani simulace.

Renderer smí převádět BF prezentační výstup na obraz a interpolovat mezi skutečně pozorovanými polohami. Nesmí si domýšlet budoucí cestu, výrobu, zásobu, dokončenou stavbu nebo doručení. Živá aplikace nesmí používat testovací orákula ani předpočítaný scénář místo výpočtu. Pro běh města nepřidávej modelové API nebo LLM rozhodování.

Každou novou či změněnou host komponentu a závislost zdůvodni v manifestu hranic. Obtížnost a pomalost BF nejsou důvodem tuto hranici překročit.

## 4. Nativní procesy, zprávy a paměť

Před implementací stanov vlastnictví stavu, invariants a chování při selhání. Konkrétní architekturu zvol autonomně, ale splň následující:

1. Proces má vlastní instrukční pozici, zásobníky či ekvivalentní pokračování, stav, reference na používané verze a stav čekání. Musí jít pozastavit a obnovit uprostřed práce.
2. Plánovač má deterministické pořadí a omezené dávky vykonávání. Proces s nekonečnou smyčkou bez dobrovolného yield nesmí zastavit ostatní způsobilé procesy. Drahé operace zahrnuté do jedné dávky musí mít omezenou cenu nebo být pokračovatelné. Čítač před neomezenou operací tuto podmínku nesplňuje.
3. Fronty zpráv jsou omezené. Zdokumentuj pořadí, plnou frontu, čekání, nedostupného příjemce, ukončený proces, časový limit a opakovaný požadavek. Kapacity nejsou neomezené sliby.
4. Procesní profil nemůže přepsat stav jiného procesu, plánovače nebo správce modulů. Kontroly provádí BF. Privilegovaný obecný Thread terminál zůstává jasně oddělený; netvrď ochranu proti vlastníkovi, který přímo upravuje vlastní pásku.
5. Kontexty, stav a zprávy se alokují a uvolňují uvnitř BF. Po opětovném použití slotu nesmí starý handle označovat nový nesouvisející objekt. Vyčerpání kapacity má konzistentní diagnostiku a zotavení.
6. Chyba jednoho procesu je lokální a viditelná. Ostatní nezávislá práce pokračuje. Reakci závislých procesů určuje dokumentovaný nativní protokol; nesmí se spoléhat na vymyšlené automatické zotavení hostem.
7. Přenos nákladu a zpráv nesmí při opakování, chybě nebo výměně programu duplikovat či ztrácet materiál. Stanov účetní invariant pro zdroje, výrobu, přepravu a spotřebu. Zajisti konzistentní hranice rozpracovaných změn.
8. Výměna programu respektuje pozastavené rámce, živé reference a neprázdné fronty. Staré rámce si ponechají správnou verzi. Nová práce použije novou verzi v definovaném bezpečném bodě. Urči kompatibilitu stavu a zpráv; nekompatibilní změnu odmítni, pokud nemáš ověřenou nativní migraci. Zachovej návrat na předchozí použitelnou verzi.

Neřeš každý update restartem procesu se ztrátou stavu nebo resetem celého stroje. Paměť se musí skutečně znovu používat při pevné kapacitě.

## 5. Živá průmyslová čtvrť

Vytvoř soudržný výrobní a doručovací řetězec: sklad či depo → továrna → doprava výrobků → staveniště nové stanice nebo jiné jasně rozpoznatelné budovy. Použij malé množství druhů materiálu a srozumitelné recepty. Cílem je fungující svět komunikujících programů, nikoli rozsáhlá ekonomická hra.

Hlavní návštěvnický úkol je dodat materiál a dokončit stavbu. Zprávy mezi programy skutečně vyvolávají objednávky, přepravu, výrobu a převzetí. Zásoby se mění, vozidla vezou konkrétní náklad, výroba potřebuje vstupy a stavba roste podle splněných nativních podmínek.

Doplň omezenou, skutečnou kapacitu průjezdu nebo nakládacího místa, aby mohly vznikat viditelné fronty a rozdílné priority měly důsledek. Spočítá je BF. Úplná spojitá fyzika dopravy není požadavek. Rozpracované jízdy a materiál nezmizí při změně programu nebo uzavření silnice.

Orientační začátek pro měření je 12–20 procesů včetně 4–6 vozidel. Nejde o naměřenou kapacitu ani závazek konkrétního počtu. Finální rozsah stanov podle měření a dokumentuj. Zachovej několik skutečně odlišných spolupracujících programů a viditelně živou scénu; nezredukuj výsledek na jednu pevnou tabulku událostí.

## 6. Ovládání musí být přímé, objevitelné a součástí města

„Více native“ zde znamená přirozené ovládání přímo přes objekty města, s okamžitě čitelnými možnostmi. Uživatel nemá hádat příkazy, hledat skrytý terminál nebo nejdřív číst dokumentaci. Současně musí jít o skutečné vstupy BF systému.

- Po načtení je vidět hlavní úkol a jasná akce pro spuštění. Vybírat lze přímo budovy, vozidla a relevantní silnice; výběr má zřetelný stav. Existuje i klávesnicová a textová cesta ke stejným objektům.
- Výběr továrny ukáže, co vyrábí, jaké má zásoby, na co čeká a co lze změnit. Výběr vozidla ukáže náklad, cíl, aktuální práci a důvod čekání. Výběr silnice ukáže průjezdnost, kapacitu a povolené zásahy.
- Kontextový panel nabídne několik konkrétních ovládacích prvků podle objektu: například velikost výrobní dávky, práh doobjednání, prioritu zakázky nebo pravidlo přidělování vozidel. Nevyžaduj znalost syrových identifikátorů modulů, paměťových adres nebo kódů událostí.
- Každý prvek jasně řekne, co mění a kdy změna začne platit. Například „Příští objednávka požádá o 6 kusů“ nebo „Nové odjezdy dají přednost stavbě stanice“. Pokud důsledek ještě není vypočtený, nesmí jej UI vydávat za skutečný výsledek.
- Rozliš změnu dat světa od změny programu. Uzavření mostu je změna dat. Změna rozhodovacího pravidla musí skutečně změnit, uložit a přeložit program. Alespoň jeden ústřední pohodlný ovládací prvek musí prokazatelně měnit skutečný zdroj programu, ne jen skrytě přepínat dvě hotové hostitelské větve.
- Pokud ovládací prvek upravuje program, autoritativní úprava zdroje, její validace, uložení a překlad musí proběhnout uvnitř BF. Host smí přenášet zadanou hodnotu a vykreslit odpověď. Nesmí analyzovat Thread a nahrazovat nativní překladač či správce pravidel.
- Zobrazené aktuální hodnoty, významově platné rozsahy a dostupnost akcí musí odpovídat nativnímu stavu. Obecná kontrola formátu v UI je pohodlí; BF vstup nezávisle ověří. Není potřeba budovat univerzální generátor formulářů; zvol nejmenší auditovatelné řešení.
- Skutečný zdroj v Threadu je dostupný přímo u zvoleného objektu, nejvýše jedním zřetelným rozbalením. Umožni přepnout z pohodlných parametrů do plného editoru a napsat vlastní kompatibilní program. Parametry nesmějí přepsat vlastní zdroj zpět na šablonu. Pokud jej nelze věrně reprezentovat několika ovladači, UI to přizná a zachová editor.
- Viditelně odděl rozepsaný návrh, zdroj uložený v BF a aktivní přeloženou verzi. Po obnovení stránky či importu nesmí panel tvrdit jiný zdroj, než má stroj. Přepnutí mezi objekty neztratí neuložený návrh bez vysvětlení.
- Použij jednu jasnou akci k potvrzení změny a dostupný návrat. Chybu vysvětli přímo u vstupu běžnou angličtinou; dosavadní použitelný program a svět zůstanou zachované.
- Odezva ovládání má být okamžitá. Dokončení nativního výpočtu tak rychlé být nemusí: ukaž čekání, zachovej ovládání kamery a pořadí požadavků. Netvař se, že změna platí před potvrzením BF, nepublikuj drahý překlad při každém stisku klávesy a nedovol dvojí odeslání stejné akce omylem.

Hlavní scénář musí jít dokončit bez terminálu a bez předchozí znalosti Threadu. Pokročilý uživatel musí mít přístup ke skutečnému zdroji, zprávám a datům. Nepřidávej chat s LLM jako náhradu tohoto ovládání.

## 7. Vizuální kvalita a pravdivost

Zachovej a rozviň vizuální jazyk schváleného Living Dispatch: izometrické město jako dominantní plocha, tmavý podklad, světlé materiály budov, limetkové zvýraznění, voda, nábřeží, mosty, zeleň, světlo a přehledná typografie. Město nesmí ustoupit obecné tabulkové administraci.

Otevři skutečné rozhraní Build 002 a jeho vizuální důkazy. Původní schválená předloha je v `records/002/reference/approved-living-dispatch.png`, 1487 × 1058 px, SHA-256 `93acd21539f8a122bc4b66f8ce1f75048e2cf477ca14d068c00744a08c53e847`. Pro Build 003 je to závazná návaznost estetické kvality; obsah a rozložení se mají přizpůsobit nové průmyslové čtvrti a přímému ovládání.

Sám zvol jednu konkrétní kompozici Build 003 a zaznamenej ji jako pracovní vizuální cíl. Můžeš si pomoci jedním návrhem nebo grafickými assety, ale nevracej rozhodování o běžném směru člověku a nevytvářej tři náhradní generické aplikace. Statický obrázek pod tlačítky nesplňuje zadání.

V městě musí být srozumitelně vidět:

- jaký náklad vozidlo veze a kde jej převzalo či odevzdalo;
- ubývání a přibývání zásob, omezená kapacita a stav výroby;
- fronta vozidel a konkrétní důvod čekání;
- jednotlivé fáze rozestavěné budovy podle skutečného BF stavu;
- uzavřená cesta, porouchaný či pozastavený program a jeho oprava;
- zvolený objekt, upravované pravidlo a dopad přijaté změny.

Každý stav nemusí znamenat další plovoucí štítek. Použij kvalitní modely či vrstvené assety, náklad, materiálové hromady, světla, přiměřené animace a přesné kontextové popisky. Aktivita stroje může být prezentačně animovaná, ale počet vyrobených kusů a dokončení práce pochází jen z BF. Volitelná vizualizace komunikace musí vycházet ze skutečných událostí send/receive, nikoli dekorativních čar.

Silnice, směry, průjezdnost, pozice a fronty odpovídají nativním datům. Nevydávej prosvítání vozidel skrz budovy za hotové fyzikální řešení; zvol čitelné zakrývání či jasný prezentační režim. Žádné emoji budovy, placeholdery nebo provizorní krabice jako finální assety.

Průběžně porovnávej skutečné screenshoty s vizuálním cílem při 1487 × 1058 a podle potřeby v překrytí. Ověř hlavní scénář, výběr objektů, změnu pravidla, frontu, chybu, opravu a dokončenou stavbu. Zkontroluj použitelnost úzkého layoutu, klávesnici, focus a reduced motion. Netvrď pixelovou shodu ani přístupnost bez odpovídající kontroly. Významný vizuální nebo interakční nedostatek znamená PARTIAL.

## 8. Hlavní experiment a důkaz

Návštěvník spustí skutečný BF stroj a zadá výstavbu. Vidí spolupráci programů, materiál a postup stavby. Výběrem objektu zjistí, co může změnit, provede vlastní změnu programu a vidí její účinek na další nativní rozhodnutí.

Doplň reprodukovatelné srovnání dvou pravidel ze stejného počátečního snímku, při stejném stavu silnic, stejných vnějších objednávkách a stejných logických krocích. Uzavření silnice nebo vypnutí továrny je samostatný experiment se změnou vstupu. Nepředepisuj výsledek před měřením a nezaměňuj skóre různých pravidel za časové zrychlení.

Samostatně předveď proces s nekonečnou smyčkou, pokračování ostatních způsobilých procesů a jeho zastavení či opravu. Nezávislé pokračování musí být skutečným výsledkem BF plánovače. Při opravě nesmí zmizet náklad nebo se potichu obnovit celý svět.

U konkrétního rozhodnutí umožni rozbalit vstup, proces, verzi, zprávy a skutečný BF výstup. Běžný uživatel dostane krátké vysvětlení, zájemce přesná data. Nepřipojuj události jiného procesu, verze nebo předchozí instance k aktuálnímu výsledku. Pokud snímek neobsahuje historický záznam, označ jej jako nedostupný.

Připrav stažitelný reprodukční balíček: kernel a identity zdrojů, kompatibilní počáteční snímek, vstupy, očekávaný nativní výstup a návod pro novou CLI instanci. Ověř skutečné použití balíčku. Přehrávaný záznam musí být odlišený od nového výpočtu.

## 9. Persistence a kompatibilita

Export/import uchová zdroje, verze, kontexty procesů, pozastavené rámce, vlastní stav, fronty zpráv, logické časovače, zásoby, rezervace, náklad a rozpracované jízdy či výrobu. Import ověř v nové instanci. Neplatný import nesmí zničit původní použitelný svět.

Pro snímky Build 001 a 002 zvol explicitně testovanou migraci nebo zachovaný odpovídající starý kernel s jasným odmítnutím nekompatibilního importu. Neslibuj kompatibilitu pouhou shodou přípony souboru. Politika uchování historie a rollbacku musí být omezená a slučitelná s uvolňováním paměti.

## 10. Povinné ověření a měření

- Zachovej všech 76 regresních testů Build 002 včetně původních testů Build 001. Změnu kontraktu zdůvodni; nemaž pokrytí jen proto, aby testy prošly.
- Ověř alespoň tři skutečně odlišné programy používající obecné nativní rozhraní procesů a zpráv. Nový uživatelský účastník, zdroj a nepřipravená posloupnost vstupů musí fungovat bez regenerace kernelu.
- Ověř plánování při nekonečné smyčce, čekání, probuzení, plné frontě, přetečení zásobníku, ukončeném příjemci, neplatném a zastaralém handle a vyčerpání každého omezeného zdroje.
- Ověř izolaci procesního profilu a omezení každé výpočetní dávky, včetně drahých operací. Odděl logickou spravedlnost od skutečné časové odezvy.
- Testuj chyby a výměnu programu kolem příjmu, odeslání a změny zásob. Dolož, že nedochází k duplikaci, ztrátě nebo záporným stavům materiálu a že chování při opakování požadavku je definované.
- Ověř platnou, neplatnou a nekompatibilní výměnu při pozastavených voláních a neprázdných frontách, živé reference, zachování stavu, rollback a následné uvolnění paměti.
- Proveď stovky cyklů vytvoření, práce, ukončení a uvolnění při pevné kapacitě, přes mez původního monotónního přidávání. Dolož skutečné živé a opakovaně využité zdroje, včetně opakovaných selhání bez úniku.
- Porovnej deterministický výstup a stav v nové browser/CLI instanci. Omezené reprezentativní workloady porovnej s doslovným BF interpretem a zachovej diferenciální kontrolu obecných optimalizací. Orákula nejsou produkční výpočetní cestou.
- Proveď skutečný export/import uprostřed komunikace, vykonávání, výroby a dopravy. Zkontroluj obnovený zdroj v editoru a všechna kontextová ovládání.
- Ověř celou návštěvnickou cestu přes přímé ovládání: objekt → pochopení možností → vlastní změna → přijetí či chyba → viditelný důsledek → návrat. Totéž musí být dosažitelné klávesnicí. Testuj dvojí kliknutí, přepnutí objektu při práci a dlouhý nativní výpočet.
- Měř start, krok plánovače, zprávy, trasu, výrobu, změnu programu, export/import a cykly reclaimingu. Uveď hardware, konfiguraci, metodiku a pevné kapacity. BF pásku a paměť host procesu uváděj odděleně. Neslibuj nenaměřenou rychlost ani snímkovou frekvenci simulace.
- Proveď adversariální self-review BF/host hranice a screenshotové i funkční ověření výsledného rozhraní. Výsledky označ jako konečné důkazy stejného autora, nikoli nezávislý audit.

První implementační milník musí uvnitř BF prokázat plánovač, zprávy, pokračování, uvolnění prostředků a nezastavení ostatních procesů jednou smyčkou. Teprve na tomto základu rozšiřuj vizuální svět. Selhání této podmínky nelze nahradit hezkou hostitelskou simulací.

## 11. Historie, dokumentace a vydání

Veď `records/003/` podle konvencí projektu: zadání, model/reasoning, výchozí a koncový commit, rozhodnutí, journal, hranice, testy, měření, vizuální a interakční důkazy, původ assetů, lidské zásahy, porušení protokolu, limity a závěrečné hodnocení.

Zachovej skutečnou posloupnost přiměřených commitů včetně významných selhání a oprav. Aktualizuj README, architekturu, jazyk, procesy/zprávy, moduly, persistence, manifest hranic a reprodukční postup. Historické buildy a jejich tvrzení musí zůstat jasně odlišené od současného.

Po ověření pushni změny do stávajícího repozitáře, nech projít příslušné CI, dokonči potřebný merge běžnou chráněnou cestou a vytvoř tag `build-003`, pokud neexistuje. Existující tag nepřepisuj. Neobcházej ochranu větve, neprováděj force-push a nevytvářej vývojovou větev se stejným názvem jako release tag. Rozliš implementační commit, případné metadata-only uzavření, merge/tag a nasazený artefakt.

Aktualizuj stávající veřejný web podporovaným workflow existujícího hostingu. Nezakládej náhradní Site nebo nový backend. Před nasazením ověř lokální funkce, interakce a vizuál a připrav rollback na ověřený Build 002. Zachovej historii Build 001 a 002 i jejich spustitelné odpovídající artefakty.

Po nasazení ověř anonymní přístup, skutečný běh BF, vlastní změnu programu přes kontextové UI, chybovou cestu, pokračování ostatních procesů a export/import. Porovnej veřejný kernel, runtime a relevantní assety s vydaným zdrojem; hostingové transformace HTML označ zvlášť. Ulož deployment receipt. Úspěch publish nástroje sám o sobě nestačí.

Veřejný obsah piš anglicky. Vysvětli Brainfuck (BF) programming language a osm instrukcí, Thread, novou schopnost procesů a hostitelské hranice. Žádná smyšlená prvenství, neomezené kapacity, BF kreslící grafiku, AI řídící každou dodávku ani neověřené tvrzení o odolnosti.

## 12. Autonomie a oprávnění

Pro realizaci tohoto zadání autorizuji implementaci v existujícím projektu, potřebné lokální testy a dočasný preview server, běžné projektové závislosti, tvorbu grafických assetů, commity/push, standardní merge ve stávajícím GitHub repozitáři a aktualizaci dosavadního veřejného webu po úspěšném ověření. Nežádej další obecné schválení těchto již zadaných kroků.

To neautorizuje publikování na X, nákupy či předplatné, nové veřejné služby, změny účtů nebo oprávnění, oslabení bezpečnosti, force-push, destruktivní přepsání historie ani zásahy do Macu mini/CORTEX runtime. CORTEX používej přes jeho existující paměťové nástroje. Backend nepřidávej jako vedlejší projekt.

Respektuj skutečná oprávnění a povinné interakce platformy. Pokud chybí konkrétní autentizace či přístup, dokonči nezávislou práci a vyžádej jediný přesně pojmenovaný potřebný zásah s důvodem. Neobcházej blokaci jiným účtem nebo náhradním deploymentem. Člověka nenuť navrhovat architekturu ani ručně opravovat kód.

Pracuj vytrvale přes iterace a uchovávej průběžný stav pro pokračování. Při přerušení nebo vyčerpání limitu netvrď hotovo. Při PARTIAL nebo blokaci uveď přesnou chybějící část a ponech bezpečný použitelný stav.

## 13. Závěrečné výstupy

Dodej PASS / PARTIAL / NO-GO s neprovedenými kontrolami a skutečnými limity, plus odkazy na veřejný web, GitHub, Build 003 tag/commit, CI, reprodukční balíček, screenshoty, krátkou ukázku hlavního scénáře, záznam vydání a rollback.

Do `records/003/` ulož:

A. Přesný český technický popis: změny proti Build 002, soubory a algoritmy vykonávané uvnitř BF, hostitelské výjimky, plánování, zprávy, izolace, paměť, verze, pokračování, zotavení, persistence, cesta od ovládání ke zdroji a obrazu, měření a jejich prostředí, ověření a limity, identity zdroje a deploymentu. Každé podstatné tvrzení podlož kódem, testem nebo měřením. Přidej skutečný BF úryvek s přesným původem a správným vysvětlením.

B. Krátké a lidské české vysvětlení: co nyní mohu udělat, co bylo oproti minulé verzi těžší a co se uvnitř skutečně děje. Proveď mě jedním konkrétním vizuálním experimentem s naměřeným výsledkem, bez nutnosti znát procesy nebo kompilátory.

C. Krátký anglický návrh osobního příspěvku na X a odděleného BF/host vysvětlení. Přirozený tón, žádná reklamní superlativa a tvrzení nad rámec výsledku. Pouze připrav; nic na X neposílej.

Build 003 je dokončený teprve tehdy, když funguje skutečný BF systém spolupracujících programů, člověk ihned pozná, co a jak může změnit, město pravdivě a působivě zobrazuje výsledky a ověřené vydání odpovídá GitHubu i dosavadnímu veřejnému webu.

Začni realizací podle tohoto zadání.
