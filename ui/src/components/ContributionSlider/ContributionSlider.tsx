import { createMemo, Show, type Component } from 'solid-js';
import { HBar, HBarRow, HBarSlider, Text } from '@/atoms';
import { CommodityIconWithLabel } from '@/components/CommodityIcon';
import { Commodity } from '@/domain/Commodity';
import { commoditiesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import styles from './ContributionSlider.module.css';

export type ContributionSliderProps = {
    commodity: string;
    provided: number;
    available: number;
    total: number;

    value: number;
    onUpdate?: (value: number) => void;
};

// const HANDLE_SIZE_PX = 24;

export const ContributionSlider: Component<ContributionSliderProps> = (props) => {
    const commodities = useAsset(commoditiesAsset);
    const commodityData = createMemo(() => commodities()?.[props.commodity]);

    const providedText = createMemo(() => Commodity.stringifyAmount(commodityData(), props.provided));
    const totalText = createMemo(() => Commodity.stringifyAmount(commodityData(), props.total));
    const valueText = createMemo(() => Commodity.stringifyAmount(commodityData(), props.value));

    return (
        <div class={styles.wrapper}>
            <div class={styles.info}>
                <CommodityIconWithLabel commodity={props.commodity} />
                <div class={styles.numbers}>
                    <Text color="bright">{providedText()}</Text>{' '}
                    <Show when={props.value}>
                        <Text color="success">+{valueText()}</Text>
                    </Show>
                    {' / '}
                    <Text color="bright">{totalText()}</Text>
                </div>
            </div>
            <HBarRow>
                <Show when={props.provided > 0}>
                    <HBar
                        share={props.provided / props.total}
                        style="full"
                        color={props.provided === props.total ? 'success' : 'secondary'}
                    />
                </Show>
                <Show when={props.available > 0}>
                    <HBarSlider
                        share={props.available / props.total}
                        value={props.value}
                        onUpdate={props.onUpdate}
                        valueRange={{ from: 0, to: props.available }}
                        valueStep={commodityData()?.quantized ? 1 : undefined}
                        left={{ color: 'primary' }}
                    />
                </Show>
                <Show when={props.provided + props.available < props.total}>
                    <HBar
                        share={(props.total - props.provided - props.available) / props.total}
                        style="hollow"
                        color="error"
                        dark
                    />
                </Show>
            </HBarRow>
        </div>
    );
};
