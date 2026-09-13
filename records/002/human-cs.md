# Město, kterému můžete přepsat pravidla

V první etapě vznikl malý výpočetní svět v Brainfucku: mohl spouštět programy, uchovávat data, hledat cesty a uložit celý svůj stav do souboru. Druhá etapa přidává něco praktičtějšího. Program může mít vlastní uložený zdroj a několik živých verzí. Můžete ho změnit, aniž byste zahodili rozpracovanou práci, a paměť po nepotřebných verzích znovu použít.

Na webu je z toho malé doručovací město. Vidíte silnice, tři mosty přes kanál a tři dodávky. Jejich trasy a kroky počítá skutečný BF stroj. Obraz může mezi dvěma známými polohami plynule přecházet; nový krok ale někdy potřebuje několik sekund výpočtu.

Zkuste jeden přesně opakovatelný experiment. Původní pravidlo počítá cenu silnice jako dobu průjezdu plus mýto. První dodávce vyjde trasa z depa přes placený Harbor Bridge do Central Square, se skóre **15**. V editoru najdete tento zdroj:

```text
: delivery-rule.thread
  8 * +
;
```

Tato verze násobí mýto osmi. Klikněte na **Compute both versions** níže pod městem. Opravdu se spustí dva nové stroje ze stejného počátečního snímku a dostanou stejné tři logické kroky. Původní program vrátí cestu `12 → 8 → 9 → 10 → 11 → 15`, skóre 15. Upravený program vybere severní nezpoplatněný most: `12 → 8 → 4 → 0 → 1 → 2 → 3 → 7 → 11 → 15`, skóre **22**. Placený most je v obou případech stále otevřený. Změnili jsme program, nikoli podmínky. Skóre zahrnuje váhu mýta, není to počet sekund ani počet animačních snímků.

**Apply new module** pak přenese váš zdroj do právě běžícího města. Text se nejprve opravdu uloží v BF paměti a odtud přeloží. Auto uprostřed silnice se nikam nepřesune: dokončí svůj původní úsek. Až příště vyjíždí z křižovatky, použije aktuální program. Město, cíle a již provedená práce zůstanou zachované.

Nemusíte zůstat u připraveného násobku. Můžete změnit číslo nebo napsat podmínku. Při ověření vzniklo například pravidlo „na silnici bez mýta přičti k době dvojku, jinak počítej devítinásobek mýta“. Přeložilo se na místě, bez nového kernelu. Pro dobu 2 a mýto 5 vrátilo skóre 47. Po exportu rozjetého města a importu do nového stroje pak první dodávka ze svého skutečného místa vybrala cestu přes Market Bridge se skóre 34. To je jiný experiment než srovnání 15/22 ze společného začátku. Pokud uděláte chybu nebo se nevejdete do pevného prostoru, BF novou verzi odmítne a ponechá fungující program. **Undo change** vrací předchozí verzi. Staré verze, které ještě někdo používá, zůstávají v paměti; ostatní mohou uvolnit místo další změně. Spodní pás ukazuje skutečný stav šesti arén, nikoli dekorativní procento.

To není neomezené ukládání historie. Stroj drží jednu předchozí verzi pro návrat a další jen tehdy, pokud je stále potřebuje živý odkaz. Při stovkách výměn se skutečně opakovaně použila tatáž pevná paměť. V testu vzniklo souhrnně 9 000 slov nového kódu, ale na konci zůstalo živých jen 40; po odstranění modulu žádná verze. Čísla pocházejí z BF výstupu.

Proč je to pořád Brainfuck, když v editoru nevidíte dlouhé řady závorek? **Brainfuck (BF) je programovací jazyk s osmi instrukcemi `> < + - . , [ ]`.** Thread je srozumitelnější jazyk postavený uvnitř jeho stroje. BF umí číst jeho text, překládat ho a vykonávat. I nový správce zdrojů, modulů a města je program v Threadu, který nakonec provádí skutečný BF kernel.

Ostatní jazyky pomáhají na jasných hranicích. Python sestavil počáteční kernel. JavaScript a WebAssembly obecně vykonávají osm BF instrukcí; JavaScript také obsluhuje editor, soubory a kreslení. Budovy a vzhled vozidel jsou grafické assety vytvořené obrazovým nástrojem. Žádná tato část za BF nevybírá cestu ani nedoručuje zásilku. Netvrdím, že BF sám kreslí 3D grafiku nebo že se počáteční kernel sám napsal.

Když chcete vědět, odkud se konkrétní výsledek vzal, **Inspect this decision** ukáže vstupní silnice, použitou verzi a skutečný řádek výstupu BF. Náklady ukáže, pokud jejich záznam skutečně vznikl v dané relaci; po importu může starší historie chybět a inspektor to výslovně přizná. **Download reproduction bundle** stáhne počáteční snímek, vstupy a očekávané výstupy pro nové spuštění přes CLI. Export celého workspace zase uchová vaše zdroje, verze i auta uprostřed jízdy, aby šlo pokračovat v nové instanci. Samotný web práci nikam automaticky neukládá.

Zajímavá pro mě není jen obezlička, jak něco ukázat v neobvyklém jazyce. Je to zkouška, jestli z osmi instrukcí dokáže jediný coding agent postavit prostředí, kde lze programy opravdu měnit, bezpečně odmítat chyby a pokračovat s vlastními daty. Město dělá tyto následky viditelné. Zdroj, omezení, skutečné neúspěchy, opravy a měření zůstávají v otevřeném záznamu projektu.

*Podklad k příspěvku, nikoli publikovaný text. Identita konkrétního vydání a stav veřejného ověření jsou v záznamu Build 002. Autorská seberevize není nezávislý audit.*
