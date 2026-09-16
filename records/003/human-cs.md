# Co se změnilo — lidsky

Třetí verze z města udělala skupinu malých spolupracujících programů. Depo přijímá
objednávky, továrna vyrábí panely, dodávka veze konkrétní náklad a stanice z něj
roste. Každý má svůj stav a schránku. Všechny střídá plánovač běžící uvnitř BF.

Klikneš na továrnu a rovnou vidíš zásoby, její práci a velikost dávky, kterou můžeš
změnit. Po potvrzení BF upraví skutečný uložený program a přeloží novou verzi.
Pod jedním rozbalením je celý zdroj. Můžeš napsat i vlastní pravidlo; není to jen
přepínač dvou připravených animací.

Konkrétní ověřený experiment: stejný počáteční svět, otevřené mosty, stejných 64
logických kol. Změnila se jen dávka jedné továrny. S hodnotou 3 vzniklo v celém
městě 14 panelů a tři už byly osazené do stanice. S hodnotou 5 vzniklo 16 panelů,
ale do stanice zatím nebyl osazený žádný. Větší
výrobní dávka tedy v tomto konkrétním srovnání neznamenala rychlejší postup stavby.
Výsledky spočítaly dvě nové BF instance; balíček dovoluje výpočet zopakovat.

Těžší než samotné kreslení bylo udržet rozpracovaný svět pohromadě. Rozbitý program
nesmí ztratit náklad, změna kódu nesmí přesunout auto jinam a starý odkaz nesmí po
uvolnění paměti ukázat na cizí nový objekt. I nekonečná smyčka dostává jen svůj tah,
takže ostatní způsobilé programy mohou pokračovat. Závislá továrna ale klidně čeká,
dokud jejího rozbitého partnera neopravíš. Není to kouzelné automatické zotavení.

Pořád je to Brainfuck: skutečný BF program provádí překlad Threadu, plánování,
zprávy i pravidla města. Thread je čitelnější jazyk uvnitř tohoto stroje. Python
pomohl sestavit jeho počáteční kernel. JavaScript a WebAssembly vykonávají osm BF
instrukcí, obsluhují soubory a kreslí výsledek. BF sám grafiku nekreslí.

Tento text popisuje lokálně ověřené chování. Konečné vydání a veřejný web zatím
nejsou označené jako dokončený Build003; jejich stav určuje závěrečný záznam vydání.
