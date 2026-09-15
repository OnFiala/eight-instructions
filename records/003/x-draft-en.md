# Personal draft — not posted

Brainfuck experiment continues. Version 3.

The city now has small programs talking to each other. Depots get orders, factories make panels, vans deliver them and stations slowly get built.

Click a factory, change its rule, apply. The source is saved and compiled inside BF while the city keeps its state. Even one program stuck in a loop doesn't stop the other ready programs.

Tried bigger batches. More panels produced, but less progress on the station after the same number of steps. So yeah, bigger is not always better :D

I'm still just giving the tasks. Astra writes the code, tests it and fixes the problems. BF runs what happens, JS makes it visible.

But yeah, I don't really know what's going on in there... :D

## Separate BF/host comment

Thread is a small readable language running inside the actual Brainfuck program. BF handles compilation, program turns, messages, stock and routes. Python builds the initial kernel. JS/Wasm runs the eight BF instructions; JS draws the city. No AI model is deciding where each van goes.

## Publication note

Unpublished draft. The batch statement refers to the recorded64-round comparison,
not a general claim that smaller batches win. Public-release/link claims may be
added only after the final Site and GitHub verification. No X action is authorized.
