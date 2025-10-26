import { type Component, createMemo, type JSX, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import {
    type Icon,
    IconBarrel,
    IconCloud,
    IconConstruction,
    IconIngot,
    IconLeaf,
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
};

const iconsByCategory: Record<string, Icon> = {
    minerals: IconRocks,
    liquids: IconBarrel,
    gases: IconCloud,
    construction: IconConstruction,
    crops: IconLeaf,
    metals: IconIngot,
};

const classesByCategory: Record<string, string | undefined> = {
    unknown: styles.catUnknown,
    minerals: styles.catMinerals,
    liquids: styles.catLiquids,
    gases: styles.catGases,
    construction: styles.catConstruction,
    crops: styles.catCrops,
    metals: styles.catMetals,
};

export const CommodityIcon: Component<CommodityIconProps> = (props) => {
    const commodities = useAsset(commoditiesAsset, { lazy: true });

    const category = createMemo(() => {
        if (props.category) {
            return props.category;
        }

        if (!props.commodity) {
            return undefined;
        }

        const all = commodities();
        if (!all) {
            return undefined;
        }

        return all[props.commodity]?.category;
    });

    const icon = createMemo(() => {
        const cat = category();
        if (!cat) {
            return IconUnknown;
        }

        return iconsByCategory[cat] ?? IconUnknown;
    });

    return (
        <div
            class={styles.icon}
            classList={{
                [classesByCategory[category() ?? 'unknown'] ?? styles.catUnknown]: true,
            }}
        >
            <Dynamic component={icon()} size={24} block />
            <Show when={props.badge}>
                <div class={styles.badge}>{props.badge}</div>
            </Show>
        </div>
    );
};

export const CommodityIconWithLabel: Component<CommodityIconProps> = (props) => {
    return (
        <div class={styles.labeled}>
            <CommodityIcon {...props} />
            <div class={styles.label}>{props.commodity}</div>
        </div>
    );
};
