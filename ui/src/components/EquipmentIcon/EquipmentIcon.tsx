import { createMemo, type Component, type JSX } from 'solid-js';
import { BlockIcon, type BlockIconSize } from '@/atoms';
import { IconBarrel, IconCity, IconEquipment, IconFactory, IconLeaf, IconRocks, type Icon } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';

export type EquipmentIconProps = {
    equipmentId: string;
    size?: BlockIconSize;
    badge?: JSX.Element;
};

const iconsByBuilding: Record<string, Icon | undefined> = {
    facility: IconFactory,
    farmland: IconLeaf,
    mine: IconRocks,
    rig: IconBarrel,
    office: IconCity,
};

export const EquipmentIcon: Component<EquipmentIconProps> = (props) => {
    const equipment = useAsset(buildingsAsset);
    const icon = createMemo(() => {
        const assetData = equipment();
        if (!assetData) {
            return IconEquipment;
        }

        const eqData = assetData.equipment[props.equipmentId];
        if (!eqData) {
            return IconEquipment;
        }

        return iconsByBuilding[eqData.building] ?? IconEquipment;
    });

    return <BlockIcon icon={icon()} size={props.size} badge={props.badge} />;
};
