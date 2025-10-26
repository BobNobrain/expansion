import { type Component } from 'solid-js';
import { useExploreRouteObjectId } from '@/routes/explore';
import { dfCitiesByWorldId } from '@/store/datafront';
import { PopulationOverview } from './PopulationOverview';
import { WorldCities } from './WorldCities';

export const WorldPopulation: Component = () => {
    const worldId = useExploreRouteObjectId('world');

    const worldCities = dfCitiesByWorldId.use(() => {
        const id = worldId();
        if (!id) {
            return null;
        }
        return { worldId: id };
    });

    return (
        <>
            <PopulationOverview cities={worldCities} />
            <WorldCities cities={worldCities} />
        </>
    );
};
