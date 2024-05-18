# expansion

I hope that one day this will become a MMO game where you are able to explore the galaxy,
exploit its valualbe resources, sell them to other players to make profits,
and gradually bendthe galaxy to mankind needs.

## Development

To install all needed deps and make all generated files, run:

```bash
make setup
```

Run development server (in watch mode):

```bash
make dev-touch
# or
make dev-desktop
```

After this, go server will be restarted on every file change, and desktop/touch ui will be
rebuilt after every file change. Unfortunatelly, no hot reload for now.

## Temporary Notes

So it seems like `components` should not know about `world`, as `world` will change often and
very probably a lot. Therefore, we should leave some `world`-related stuff in `domain`
package. Considering interfaces for:

1. **Kind of?** Star systems, as their data should be able to be loaded separately. We will need that
   to implement horizontal scaling with workers/processors, that will process events from
   that one system, update its state, and store it in database.
2. **No** Stars – we will need to query galactic beacons for galaxy overview.
3. **No** Planets and other surfaces – they will never be shared between workers, and will
   also never be stored transparently in DB. All surfaces data will just be embedded in a
   binary blob with all other data representing system state (including fleets, structures, etc.).
4. **No** Galaxy layout and related stuff (sectors, coords, etc.). Same as with stars
   for galactic beacons.
5. **Yes** Name registry – it is a complicated and non-parallelable data collection,
   and we should treat it as any other like users collection, orgs collection, etc.
6. **Yes** Orgs. As any other global entity, an organization should be accessible to any
   worker in its latest state. This means we should sync its state across all workers
   via either DB, or some custom sync manager (which will probably never be reliable).

For a galaxy overview, as far as galaxy is static – we can just store a blob (or a few)
in the DB that all workers will retrieve at the start and use to have their own copy
of galactic overview. When new stars are introduced to the galaxy, we can just recalculate
the blob. This is not even needed to be done during server update downtime, as this is purely
cosmetic feature.

If a need ever arises to readjust galactic grid itself, it can be done the same way,
but this time it should be synced with all other updates we do to the map.

For star systems, we probably don't even need to store the data in any normalized form.
We'll probably be just fine with storing system ID and a giant blob of its data.
The only reason why we need it to be stored in DB is to query system data for a specified
set of ids, that current worker is responsible for.

### Precalculated blobs

- `galaxy/getOverview` (includes grid and beacons which are static)
  - maybe need to create several versions with different amount of beacons –
    or just manipulate it in runtime
- `galaxy/getSectorContent`
