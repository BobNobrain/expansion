import type { Component } from 'solid-js';
import { InfoDisplay } from '@/atoms';
import { InventoryTable } from '@/components/Inventory';
import type { Inventory } from '@/domain/Inventory';

export const ProductionTotals: Component<{ actual?: Inventory; speeds: Inventory }> = (props) => {
    return (
        <InventoryTable
            inset
            entries={Object.entries(props.speeds).map(([cid, amt]) => {
                return {
                    commodity: cid,
                    speed: amt,
                };
            })}
            display="speeds"
        >
            <InfoDisplay title="Nothing to show">
                This factory produces and consumes nothing. Add some equipment and recipes for it to become useful.
            </InfoDisplay>
        </InventoryTable>
    );
};
