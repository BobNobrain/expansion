import { type Component, createMemo } from 'solid-js';
import type { Factory, FactoryEquipment } from '../../domain/Base';
import { IconUnknown } from '../../icons';
import { DataTable, type DataTableColumn } from '../DataTable';

export type FactoryEquipmentTableProps = {
    factory: Factory;
    onEquipmentClick: (eq: FactoryEquipment) => void;
    inset?: boolean;
};

export const FactoryEquipmentTable: Component<FactoryEquipmentTableProps> = (props) => {
    const rows = createMemo(() => props.factory.equipment);

    const columns = createMemo<DataTableColumn<FactoryEquipment>[]>(() => {
        return [
            {
                header: { text: 'Equipment', icon: IconUnknown },
                content: (row) => {
                    return row.equipmentId;
                },
            },
            {
                header: { text: 'Count' },
                content: (row) => row.count.toFixed(0),
                align: 'right',
                width: 64,
            },
            {
                header: { icon: IconUnknown },
                content: (row) => Object.values(row.production).length.toFixed(0),
                align: 'right',
                width: 64,
            },
        ];
    });

    return <DataTable columns={columns()} rows={rows()} inset={props.inset} onRowClick={props.onEquipmentClick} />;
};
