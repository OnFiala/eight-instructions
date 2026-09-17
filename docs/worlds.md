# Bounded district construction and world ownership

Build 004 has one finite material project followed by a supplied station goal.
The initial district has six processes, four source modules, 48 raw units and
32 directed roads. The initial image is produced by the actual BF compiler at
round zero. It contains no deliveries, candidate results or completed buildings.

The trusted native `district-plan` receives a construction site, subsequent site,
supplying factory, endpoints and compatible factory module. It validates native
roles, node bounds, endpoints, minimum material requirement and module schema.
A plan is initial data, not a scheduled outcome. Construction and activation depend
on actual installed material and remaining downstream demand.

A station program receives delivered panels and executes `build`, consuming one
panel into installed material. The first panel establishes the foundation, the
second pays for the workshop, and the third pays for the transport connection.
The site remains an accountable installed-material object after activation.
When its full requirement is met, the shared scheduler's `district-step` checks
placement, free process capacity, nonwrapping lifetime/epoch counters, road capacity,
absence of an existing directed connection, compatible executable source and useful
remaining demand. It then allocates a real factory process, binds the compiled
module, adds a bidirectional road pair and connects both factories to the next site.
No other actor runs between these checks and effects. A refusal retains all stock
and installed material and emits a native reason. Activation happens at most once.

The new factory starts with zero stock. Its program must request real raw material
from the depot, receive it by a van, produce panels and submit actual delivery jobs.
The new road participates in the same BF outgoing-edge index, path search and
capacity reservations as every original road. An existing journey keeps its captured
segment. Adding a road does not teleport vehicles or recompute a route in JavaScript.

The exact conservation equation, in raw units, is:

```
initial supply = unconverted raw in buildings and cargo
               + 2 × (panels in buildings, cargo and production escrow
                      + installed panels)
```

There is no extraction or free supply in the released initial scenario. Jobs and
mail are references to quantities, not duplicate inventory. Two raw units enter
production escrow for one panel. Delivery moves ownership once; acknowledgement
reclaims the job without repeating the transfer. Foundation, workshop and road
material remain included in installed panels. Construction state lives in native
workspace 20048..20079 and is copied with every trial.

`district-step` runs inside the ordinary `process-step`. Live and trial worlds use
that same implementation, including real process creation and road extension.
No cheaper simulator exists. Each branch has its own material, construction phase,
process serials, modules, jobs, road index and reservations. A completed trial is
never a completed live project. Only accepted source is republished in the live
world. See [native synthesis](synthesis.md) for checkpoint and publication ownership.

Capacity is finite: one configured extension, sixteen process slots, sixteen nodes,
48 directed roads, sixteen jobs, four messages per process and sixteen compiled
version arenas. A finished or resource-blocked scenario is reported, never secretly
reset or replayed. General Thread administrator input can deliberately alter these
invariants; it is outside the candidate sandbox.
