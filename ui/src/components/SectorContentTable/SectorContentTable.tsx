import { type Component, Show, createMemo } from 'solid-js';
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
    star: Star;
    nPlanets: number;
    nAsteroids: number;
};

export const SectorContentTable: Component<SectorContentTableProps> = (props) => {
    const stars = useSectorContent(() => props.sectorId);

    const rows = createMemo(() =>
        (stars.data ?? []).map((star): TableRow => {
            return {
                id: star.id,
                name: undefined,
                star,
                nPlanets: Math.floor(Math.random() * 20),
                nAsteroids: Math.floor(Math.random() * 5000),
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
            header: 'Star',
            width: 110,
            content: ({ star }) => {
                const color =
                    '#' +
                    Star.getColor(star)
                        .map((unit) => Math.floor(unit * 255).toString(16))
                        .join('');

                const spectralClass = Star.getSpectralClass(star);

                return (
                    <span style={{ color }}>
                        ⊚ {spectralClass} ({star.tempK.toFixed(0)} K)
                    </span>
                );
            },
        },
        {
            header: 'System',
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
                    <Show when={stars.data}>⊚ {stars.data!.length} stars</Show>
                </Text>
            </header>
            <DataTable columns={columns} rows={rows()} />
        </div>
    );
};
