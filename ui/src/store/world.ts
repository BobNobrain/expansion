import { createStore } from 'solid-js/store';
import type { WorldPlanetData } from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';

const SCOPE_NAME = 'world';

enum WorldDBCommand {
    GetPlanet = 'getPlanet',
}

const [planets, updatePlanets] = createStore<Record<string, WorldPlanetData>>({});

type UsePlanetDataResult = {
    getData: () => WorldPlanetData;
};

export const usePlanetData = (id: string): UsePlanetDataResult => {
    if (!planets[id]) {
        void ws.sendCommand<WorldPlanetData>(SCOPE_NAME, WorldDBCommand.GetPlanet, {}).then((data) => {
            updatePlanets(id, data);
        });
    }

    return {
        getData: () => planets[id],
    };
};
