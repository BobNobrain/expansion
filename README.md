# expansion

I hope that one day this will become a MMO game where you are able to explore the galaxy,
exploit its valualbe resources, sell them to other players to make profits,
and gradually bendthe galaxy to mankind needs.

## Development

Prerequisites:
- go 1.22.6
- node 20
- Docker
- make
- [sqlc](https://github.com/sqlc-dev/sqlc)

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

## Data Layers

### 1. DB Layer

This layer data models are described in `server/db/schema/*.sql`. Conversion to game level is performed by
`server/internal/db` package (with sqlc's aid to map SQL tables into golang structures), which is proxied with `*Repo*`
interfaces in `server/internal/components`.

### 2. Game Server Layer

This layer data models are described in `server/internal/game` package. They are used to perform all the game logic
upon them. Some low-level data manipulation logic is placed in said package, more complex actions are placed in
`server/internal/usecases`.

### 3. Datafront Layer

Data models of this layers are used to transfer data from server to client and are described in `server/pkg/api`.
They are all JSON-serializable, and are accessed by clients via the Datafront API (`server/internal/datafront`).

Golang -&gt; TypeScript conversion is made with `tygo`.

### 4. Game Client Layer

Data models of this layers are used on client to be presented with UI. They are constructed via client's Datafront
facing functions and are stored under `ui/src/domain`.

## Datafront API

Datafront API (`server/internal/datafront`, `server/internal/datafront/dfcore`) is designed to access game data from
the client and have it in always up-to-date state (via Datafront update events). This API presents all game data as a
set of tables with game entities and a few "singleton" game entities. Datafront tables can be queried either directly
by entity IDs, or via specially defined queries (e.g. we can query all worlds in `worlds` table by ID of a star system).
