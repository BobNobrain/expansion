import { type Component, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon, IconConstruction, IconLeaf, IconRocks, IconUnknown } from '../../icons';
import { type CommodityCategory, getCommodityCategory } from '../../domain/Commodities';
import styles from './CommodityIcon.module.css';

export type CommodityIconProps = {
    resource: string;
};

const iconsByCategory: Record<CommodityCategory, Icon> = {
    resources: IconRocks,
    construction: IconConstruction,
    crops: IconLeaf,
    metals: IconUnknown,
};

export const CommodityIcon: Component<CommodityIconProps> = (props) => {
    const icon = createMemo(() => {
        const cat = getCommodityCategory(props.resource);
        if (!cat) {
            return IconUnknown;
        }

        return iconsByCategory[cat];
    });

    return (
        <div class={styles.icon}>
            <Dynamic component={icon()} size={24} block />
        </div>
    );
};

export const CommodityIconWithLabel: Component<CommodityIconProps> = (props) => {
    return (
        <div class={styles.labeled}>
            <CommodityIcon {...props} />
            <div class={styles.label}>{props.resource}</div>
        </div>
    );
};
