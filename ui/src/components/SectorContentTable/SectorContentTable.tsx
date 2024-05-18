import { type Component, Show, createMemo, For } from 'solid-js';
import { Star } from '../../domain/Star';
import { useSectorContent } from '../../store/galaxy';
import { Link } from '../Link/Link';
import { Text } from '../Text/Text';
import styles from './SectorContentTable.module.css';
import { DataTable, type DataTableColumn } from '../DataTable/DataTable';

export type SectorContentTableProps = {
    sectorId: string;
};

type TableRow = {
    id: string;
    name?: string;
    stars: Star[];
    nPlanets: number;
    nAsteroids: number;
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
        <div style={{ color: color() }}>
            ⊚ {Star.getSpectralClass(props.star)} ({props.star.tempK.toFixed(0)} K)
        </div>
    );
};

export const SectorContentTable: Component<SectorContentTableProps> = (props) => {
    const systems = useSectorContent(() => props.sectorId);

    const rows = createMemo(() =>
        (systems.data ?? []).map((system): TableRow => {
            return {
                id: system.id,
                name: undefined,
                stars: system.stars,
                nPlanets: system.nPlanets,
                nAsteroids: system.nAsteroids,
            };
        }),
    );

    const columns: DataTableColumn<TableRow>[] = [
        {
            header: 'ID',
            width: 65,
            content: ({ id }) => <Link href={`/system/${id}`}>{id}</Link>,
        },
        {
            header: 'Name',
            width: 100,
            content: ({ id, name }) => {
                if (name) {
                    return name;
                }
                return <Text color="dim">{id}</Text>;
            },
        },
        {
            header: 'Stars',
            width: 110,
            content: ({ stars }) => {
                return <For each={stars}>{(star) => <StarTextLabel star={star} />}</For>;
            },
        },
        {
            header: 'Bodies',
            content: ({ nAsteroids, nPlanets }) => {
                return `${nPlanets} ⊘ / ~${(nAsteroids / 1000).toFixed(1)}K ◌`;
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
                    <Show when={systems.data}>⊚ {systems.data!.length} systems</Show>
                </Text>
            </header>
            <DataTable columns={columns} rows={rows()} />
        </div>
    );
};
