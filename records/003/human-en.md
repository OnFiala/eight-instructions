# What changed, in plain language

The third version turns the city into a group of small cooperating programs. A
depot receives orders, a factory makes panels, a van carries specific cargo, and
a station grows from it. Each has its own state and mailbox. A scheduler inside
BF takes turns running them.

Click a factory to see its stock, its current work and the batch size you can
change. After confirmation, BF edits the actual stored program and compiles a new
version. The complete source is one disclosure away. You can write your own rule;
this is more than a switch between two prepared animations.

One verified experiment used the same initial world, open bridges and 64 logical
rounds. Only one factory's batch size changed. With a value of 3, the city produced
14 panels and three had already been installed in a station. With a value of 5,
it produced 16 panels, but none had yet been installed. In this particular
comparison, a larger batch did not mean faster construction progress. Two fresh
BF instances computed the results; the package lets you repeat the calculation.

Keeping unfinished work intact was harder than drawing the city. A broken program
must not lose cargo, a code change must not move a van elsewhere, and an old handle
must not point to an unrelated new object after memory is reused. Even an infinite
loop receives only its bounded turn, allowing other eligible programs to continue.
A dependent factory may still wait until you repair its broken partner. Recovery
is not automatic magic.

It is still Brainfuck: an actual BF program compiles Thread, schedules programs,
passes messages and applies the city's rules. Thread is a more readable language
inside that machine. Python helped construct the initial kernel. JavaScript and
WebAssembly execute the eight BF instructions; JavaScript also handles files and
draws the result. BF does not draw the graphics itself.

Custom editing, rejected source, progress alongside a loop and export/import were
also exercised on the public site. The release record identifies the exact version
and the detailed evidence.
