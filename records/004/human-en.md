# I gave the city a way to test its own rules

In the earlier builds, you could edit a program and watch the city change.
For Build 004, I wanted the city to do some of that work itself.

It now constructs small programs, runs them in separate copies of its own world
and compares their results. All of that happens inside Brainfuck, the language
with only eight instructions. There is no language model directing the vans.

One useful change was simple: stop asking for more material and making panels
when enough panels are already waiting. Keep offering the existing stock and
dispatching deliveries. The machine builds that condition as source code, compiles
it and tests it. A candidate can lose. A changed live world can make an earlier
result stale. In both cases, the city keeps its working rule.

A successful trial does not give the live city free buildings. Only the program
comes back. Vans still have to deliver the material. Three installed panels pay
for a workshop and a new connection; the new workshop becomes another working
program that has to obtain its own supplies.

The page starts without a button. You can watch, close a bridge, inspect an object
or edit the exact program. Your manual edit takes that module out of automatic
control. Export saves the entire machine, including an unfinished experiment.

This is a small, finite search language. It does not understand arbitrary goals,
guarantee an improvement or run after the tab closes. It can also be slow: smooth
drawing and native simulation are different things. The interesting part is that
the program construction, tests and decision are real computation on the BF tape.

The repository keeps the failed attempts, tests, generated source, measurements
and an offline reproduction package. Astra in xHigh wrote and reviewed the system
alone. I supplied the challenge and preferences, not production code or repairs.
