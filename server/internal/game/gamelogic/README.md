# Game Logic

This module contains some operations that can be performed on game objects, with knowledge from global data registries (like recipes and equipment data).

## Base Updates

Updating base state is about rebalancing it each time something changes – either because of manual tweaking by player, or because an automatic "rebalance point" happens.

Manual changes include inventory transfers (both in and out), adding/removing/updating production orders, adding/removing equipment and so on.

Automatic updates happen on predictable rebalance points – when a production input runs out, or a production order has a time limit (and that limit is reached).

A time of last rebalance made for the base is stored in its `Updated` field. Inventory and production states are valid for that time, and are to be explicitly recalculated for any other time, if needed.

The main part of rebalancing the base state is rebalancing its production coefficients (and then calculating inventory change speeds). The process should converge if there are no cycles in production graph. Therefore, we should either limit the recipe graph to be acyclic, or forbid the production graph to contain cycles (which would look quite weird from UI perspective). The process may converge even with cycles in the graph, and can possibly be built in a way to circumvent the issues raised by the cycles – but that requires more brainpower than I'm ready to invest into production now.

Therefore, the algorithm of updating the base state to a specific time point `t` is the following:

1. calculate the point `tn` of the next automatic rebalancing point;
2. if `tn > t`, the state is considered up-to-date (to get exact inventory at `t`, the amounts need to be recalculated);
3. otherwise: calculate the inventory at `tn`;
4. turn off production orders that cannot be run further;
5. rebalance the production using simplex method;
6. set the `Updated` field to `tn`;
7. start over with step 1 again.

Production rebalance is a linear programming task, and therefore can be solved via simpex method. All the production items can be put into a giant matrix and be optimized from there, but it actually makes more sense to split it into multiple independent matricies, if possible. E.g. if production item #1 runs `a -> b`, and #2 runs `c -> d`, they will never interfere, and therefore can be optimized separately.
