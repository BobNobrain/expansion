import { type Component, createMemo, type JSX, Show } from 'solid-js';
import { BlockIcon, SkeletonText, type BlockIconSize } from '@/atoms';
import {
    type Icon,
    IconBarrel,
    IconCloud,
    IconCogs,
    IconConstruction,
    IconEquipment,
    IconFlask,
    IconIngot,
    IconLeaf,
    IconPackage,
    IconRocks,
    IconUnknown,
} from '@/icons';
import { commoditiesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import styles from './CommodityIcon.module.css';

export type CommodityIconProps = {
    commodity?: string;
    category?: string;
    badge?: JSX.Element;
    size?: BlockIconSize;
    checked?: boolean;
};

const iconsByCategory: Record<string, Icon> = {
    minerals: IconRocks,
    liquids: IconBarrel,
    gases: IconCloud,
    construction: IconConstruction,
    crops: IconLeaf,
    metals: IconIngot,
    machinery: IconEquipment,
    mechanicalParts: IconCogs,
    consumerGoods: IconPackage,
    chemicals: IconFlask,
};

const classesByCategory: Record<string, string | undefined> = {
    unknown: styles.catUnknown,
    minerals: styles.catMinerals,
    liquids: styles.catLiquids,
    gases: styles.catGases,
    construction: styles.catConstruction,
    crops: styles.catCrops,
    metals: styles.catMetals,
    machinery: styles.catMachinery,
    mechanicalParts: styles.catMechanicalParts,
    consumerGoods: styles.consumerGoods,
    chemicals: styles.chemicals,
};

export const CommodityIcon: Component<CommodityIconProps> = (props) => {
    const commodities = useAsset(commoditiesAsset, { lazy: true });

    const category = createMemo(() => {
        if (props.category) {
            return props.category;
        }

        if (!props.commodity) {
            return 'unknown';
        }

        const all = commodities();
        if (!all) {
            return 'unknown';
        }

        return all[props.commodity]?.category ?? 'unknown';
    });

    const icon = createMemo(() => {
        const cat = category();
        return iconsByCategory[cat] ?? IconUnknown;
    });

    return (
        <BlockIcon
            icon={icon()}
            badge={props.badge}
            size={props.size}
            checked={props.checked}
            class={classesByCategory[category()] ?? styles.catUnknown}
        />
    );
};

export type CommodityIconHeight = 'one-line' | 'two-line';
export type CommodityIconWithLabelProps = CommodityIconProps & {
    secondLine?: JSX.Element;
    secondLineAlignment?: 'left' | 'right';
    isLoading?: boolean;
};

export const CommodityIconWithLabel: Component<CommodityIconWithLabelProps> = (props) => {
    return (
        <div class={styles.labeled} classList={{ [styles.twoLines]: Boolean(props.secondLine) }}>
            <CommodityIcon {...props} />
            <Show when={props.secondLine} fallback={<div class={styles.label}>{props.commodity}</div>}>
                <div class={styles.labels}>
                    <div class={styles.label}>
                        <Show when={props.isLoading} fallback={props.commodity}>
                            <SkeletonText length={10} />
                        </Show>
                    </div>
                    <div
                        class={styles.secondLine}
                        classList={{
                            [styles.alignRight]: props.secondLineAlignment === 'right',
                        }}
                    >
                        {props.secondLine}
                    </div>
                </div>
            </Show>
        </div>
    );
};
