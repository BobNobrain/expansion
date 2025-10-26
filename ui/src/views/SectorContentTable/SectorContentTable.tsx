import { type Component, Show, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { DataTable, type DataTableColumn, Text } from '@/atoms';
import { CelestialBodyTitle } from '@/components/CelestialBodyTitle/CelestialBodyTitle';
import { type Star } from '@/domain/Star';
import { IconAsteroid, IconFlag, IconPeople, IconPlanet, IconSpaceStation, IconSystem } from '@/icons';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { formatScalar } from '@/lib/strings';
import { getExploreRoute } from '@/routes/explore';
import { dfSysOverviewsBySectorId } from '@/store/datafront';
import styles from './SectorContentTable.module.css';

export type SectorContentTableProps = {
    sectorId: string;
};

type TableRow = {
    id: string;
    name?: string;
    stars: Star[];
    nPlanets: number;
    nAsteroids: number;
    isExplored: boolean;
};

const COLUMNS: DataTableColumn<TableRow>[] = [
    {
        header: 'System',
        width: 120,
        content: ({ id, name }) => {
            return <CelestialBodyTitle id={id} name={name} icon={IconSystem} />;
        },
    },
    {
        header: { icon: IconPlanet },
        width: 64,
        align: 'right',
        content: ({ nPlanets, isExplored }) => {
            if (!isExplored) {
                return '??';
            }

            return formatScalar(nPlanets, { digits: 0, noShortenings: true });
            // return (
            //     <>
            //         <div>
            //             <For each={stars}>{(star) => <StarTextLabel star={star} />}</For>
            //         </div>
            //         <div>
            //             <Show when={isExplored} fallback="Unknown">
            //                 {nPlanets} <IconPlanet size={12} /> / ~{(nAsteroids / 1000).toFixed(1)}K ◌
            //             </Show>
            //         </div>
            //     </>
            // );
        },
    },
    {
        header: { icon: IconAsteroid },
        width: 64,
        align: 'right',
        content: ({ nAsteroids, isExplored }) => {
            if (!isExplored) {
                return '??';
            }

            return formatScalar(nAsteroids, { digits: 0 });
        },
    },
    {
        header: { icon: IconPeople },
        width: 64,
        align: 'right',
        content: ({ isExplored }) => {
            if (!isExplored) {
                return '--';
            }

            return formatScalar(0, { digits: 0 });
        },
    },
    {
        header: { icon: IconFlag },
        width: 64,
        align: 'right',
        content: ({ isExplored }) => {
            if (!isExplored) {
                return '--';
            }

            return formatScalar(0, { digits: 0 });
        },
    },
    {
        header: { icon: IconSpaceStation },
        width: 64,
        align: 'right',
        content: ({ isExplored }) => {
            if (!isExplored) {
                return '--';
            }

            return formatScalar(0, { digits: 0 });
        },
    },
];

// const StarTextLabel: Component<{ star: Star }> = (props) => {
//     const color = createMemo(
//         () =>
//             '#' +
//             Star.getColor(props.star)
//                 .map((unit) => Math.floor(unit * 255).toString(16))
//                 .join(''),
//     );

//     return (
//         <span style={{ color: color() }}>
//             <IconStar size={16} />
//         </span>
//     );
// };

export const SectorContentTable: Component<SectorContentTableProps> = (props) => {
    const systems = dfSysOverviewsBySectorId.use(() => ({
        sectorId: props.sectorId,
        limit: 200,
    }));

    const rows = createMemo(() => {
        const mapped = Object.values(systems.result()).map((system): TableRow => {
            return {
                id: system.id,
                name: undefined,
                stars: system.stars,
                nPlanets: system.nPlanets,
                nAsteroids: system.nAsteroids,
                isExplored: system.isExplored,
            };
        });
        mapped.sort((a, b) => a.id.localeCompare(b.id));
        return mapped;
    });

    const navigate = useNavigate();
    const onRowClick = (row: TableRow, ev: MouseEvent) => {
        emulateLinkClick(
            {
                href: getExploreRoute({ objectId: row.id }),
                navigate,
            },
            ev,
        );
    };

    return (
        <div>
            <header class={styles.header}>
                <Text size="h2" color="primary">
                    {props.sectorId}
                </Text>
                <Text color="dim">
                    <Show when={!systems.isLoading()}>
                        <IconSystem size={16} /> {rows().length} systems
                    </Show>
                </Text>
            </header>
            <DataTable columns={COLUMNS} rows={rows()} stickLeft onRowClick={onRowClick} />
        </div>
    );
};
