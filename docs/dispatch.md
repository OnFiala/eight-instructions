# Dispatch: the first application

Dispatch is a route planner built on the **Brainfuck (BF) programming language**
environment. It uses the native compiler, reusable definitions, heap arrays,
transactional persistent records, integer arithmetic, loops and diagnostics.

```text
sample
network
0 11 route
tx-begin
100 1 7 road assert
0 11 route
tx-abort
0 11 route
```

The sample creates 12 nodes and 20 **directed** roads. The original route from
0 to 11 costs 20: `0 2 1 7 8 9 10 11`. Raising the price of road 1→7 to 100
changes the route to `0 2 4 5 11`, costing 21. Aborting restores the original
answer. These are actual outputs; the application also accepts other networks.

`road` takes `(cost from to -- success)`; `close-road` takes `(from to -- found)`.
Both require an open transaction. `route` takes `(from to --)` and prints `COST`
and `PATH`, or `UNREACHABLE`. `nodes` is a heap variable; valid network sizes are
1 through 32. Source equals destination produces cost zero and a one-node path.

The store key is `from*32+to`; its value is cost. Road costs must be 1–1000.
These bounds guarantee that a simple 31-edge path is at most 31,000 and cannot
wrap a 16-bit distance. The value 65535 is the unreachable sentinel.

On each route request, the guest builds an adjacency matrix from the current
store view, initializes distance/predecessor/visited arrays, performs Dijkstra's
algorithm, reconstructs the predecessor chain and prints the result. Ties use
the first lowest-index candidate encountered. The host may draw those emitted
roads and highlight that emitted path, but it does not calculate distances or
choose a route.

Tests use a separately written Bellman-Ford oracle, verify every returned edge
and path sum, exercise random 8/16/24-node networks and the full 32-node chain,
and test invalid costs, invalid nodes, unreachable destinations and transaction
rollback. They run the actual generated Brainfuck kernel, not a guest-language mock.

Limitations: at most 128 directed roads, no zero/negative weights, no parallel
edges, no concurrency, no geographical meaning and no claim to real-world traffic
routing. The point is multiple real subsystems cooperating inside the constraint.
