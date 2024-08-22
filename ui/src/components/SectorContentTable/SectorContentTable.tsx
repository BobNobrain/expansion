import { type Component, Show, createMemo, For } from 'solid-js';
import { Star } from '../../domain/Star';
import { useSectorContent } from '../../store/galaxy';
import { Link } from '../Link/Link';
import { Text } from '../Text/Text';
import styles from './SectorContentTable.module.css';
import { DataTable, type DataTableColumn } from '../DataTable/DataTable';
import { IconPlanet } from '../../icons/planet';
import { IconStar } from '../../icons/star';

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

const StarTextLabel: Component<{ star: Star }> = (props) => {
    const color = createMemo(
        () =>
            '#' +
            Star.getColor(props.star)
                .map((unit) => Math.floor(unit * 255).toString(16))
                .join(''),
    );

    return (
        <span style={{ color: color() }}>
            <IconStar size={16} />
        </span>
    );
};

export const SectorContentTable: Component<SectorContentTableProps> = (props) => {
    const systems = useSectorContent(() => props.sectorId);

    const rows = createMemo(() => {
        const mapped = (systems.data?.systems ?? []).map((system): TableRow => {
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

    const columns: DataTableColumn<TableRow>[] = [
        {
            header: 'System',
            width: 100,
            content: ({ id, name }) => {
                return (
                    <>
                        <div>
                            <Text color={name ? 'default' : 'dim'}>{name || id}</Text>
                        </div>
                        <div>
                            <Link href={`/galaxy/${id}`}>{id}</Link>
                        </div>
                    </>
                );
            },
        },
        {
            header: 'Content',
            width: 110,
            content: ({ stars, nAsteroids, nPlanets, isExplored }) => {
                return (
                    <>
                        <div>
                            <For each={stars}>{(star) => <StarTextLabel star={star} />}</For>
                        </div>
                        <div>
                            <Show when={isExplored} fallback="Unknown">
                                {nPlanets} <IconPlanet size={12} /> / ~{(nAsteroids / 1000).toFixed(1)}K ◌
                            </Show>
                        </div>
                    </>
                );
            },
        },
        {
            header: 'Status',
            content: ({ isExplored }) => {
                if (isExplored) {
                    return <Text color="secondary">Uninhabited</Text>;
                }
                return <Text color="dim">Unexplored</Text>;
            },
        },
    ];

    return (
        <div>
            <header class={styles.header}>
                <Text size="h2" color="primary">
                    {props.sectorId}
                </Text>
                <Text color="dim">
                    <Show when={systems.data}>⊚ {systems.data!.total} systems</Show>
                </Text>
            </header>
            <DataTable columns={columns} rows={rows()} />
        </div>
    );
};
