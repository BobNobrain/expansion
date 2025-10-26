import { createMemo, type Component } from 'solid-js';
import { CelestialBodyTitle } from '../../../components/CelestialBodyTitle/CelestialBodyTitle';
import { DataTable, DataTableCellLink, type DataTableColumn } from '../../../components/DataTable';
import { GameTimeLabel } from '../../../components/GameTimeLabel/GameTimeLabel';
import { PageHeader, PageHeaderIcon, PageHeaderTitle } from '../../../components/PageHeader';
import { ProgressBar } from '../../../components/ProgressBar/ProgressBar';
import { type BaseOverview } from '../../../domain/Base';
import { IconArea, IconCalendar, IconFactory, IconFlag, IconPeople, IconPlanet, IconStorage } from '../../../icons';
import { type SemanticColor } from '../../../lib/appearance';
import { useBasesPageContextBinding } from './binding';
import { getBasesRoute, TileBaseTab } from '../../../routes/bases';

const COLUMNS: DataTableColumn<BaseOverview>[] = [
    {
        header: { icon: IconPlanet, text: 'Location' },
        width: 150,
        content: (row) => {
            return (
                <DataTableCellLink href={getBasesRoute({ worldId: row.worldId, tileId: row.tileId })}>
                    <CelestialBodyTitle id={row.worldId} tileId={row.tileId} />
                </DataTableCellLink>
            );
        },
    },
    {
        header: { icon: IconFactory },
        width: 48,
        align: 'right',
        content: (row) => (
            <DataTableCellLink
                href={getBasesRoute({ worldId: row.worldId, tileId: row.tileId, tab: TileBaseTab.Production })}
            >
                {String(row.nEquipment)}
            </DataTableCellLink>
        ),
    },
    {
        header: { icon: IconArea },
        width: 48,
        align: 'right',
        content: (row) => <ProgressBar value={row.areaUsage} />,
    },
    {
        header: { icon: IconPeople },
        width: 48,
        align: 'right',
        content: (row) => {
            let color: SemanticColor = 'success';

            if (row.employment < 0.5) {
                color = 'error';
            } else if (row.employment < 0.85) {
                color = 'warn';
            }

            return (
                <DataTableCellLink
                    href={getBasesRoute({ worldId: row.worldId, tileId: row.tileId, tab: TileBaseTab.Overview })}
                >
                    <ProgressBar value={row.employment} color={color} />
                </DataTableCellLink>
            );
        },
    },
    {
        header: { icon: IconStorage },
        width: 48,
        align: 'right',
        content: (row) => {
            let color: SemanticColor = 'secondary';

            if (row.inventoryUsage >= 0.99) {
                color = 'error';
            } else if (row.inventoryUsage > 0.8) {
                color = 'warn';
            }

            return (
                <DataTableCellLink
                    href={getBasesRoute({ worldId: row.worldId, tileId: row.tileId, tab: TileBaseTab.Inventory })}
                >
                    <ProgressBar value={row.inventoryUsage} color={color} />
                </DataTableCellLink>
            );
        },
    },
    {
        header: { icon: IconCalendar },
        width: 120,
        align: 'right',
        content: (row) => <GameTimeLabel value={row.created} />,
    },
];

export const WorldBasesPage: Component = () => {
    useBasesPageContextBinding();

    const bases = createMemo<BaseOverview[]>(() => {
        return [
            {
                id: 1,
                worldId: 'TH-044c',
                tileId: '0da',
                created: new Date('2025-04-01T12:00:00Z'),
                nEquipment: 3,
                areaUsage: 0.35,
                employment: 1,
                inventoryUsage: 0.2,
            },
            {
                id: 2,
                worldId: 'TH-044c',
                tileId: '0df',
                created: new Date('2025-04-02T12:00:00Z'),
                nEquipment: 7,
                areaUsage: 0.91,
                employment: 1,
                inventoryUsage: 0.84,
            },
            {
                id: 3,
                worldId: 'TH-044d',
                tileId: '00e',
                created: new Date('2025-04-03T12:00:00Z'),
                nEquipment: 1,
                areaUsage: 0.07,
                employment: 0.2,
                inventoryUsage: 0.05,
            },
        ];
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Bases</PageHeaderTitle>
                <PageHeaderIcon icon={IconFlag} text="3" />
            </PageHeader>
            <DataTable columns={COLUMNS} rows={bases()} stickLeft>
                You have no bases yet.
            </DataTable>
        </>
    );
};
