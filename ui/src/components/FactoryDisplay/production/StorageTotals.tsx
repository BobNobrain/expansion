import { createMemo, type Component } from 'solid-js';
import { DefinitionList, Text, type DefinitionListItem } from '@/atoms';
import { Inventory, type StorageSize } from '@/domain/Inventory';
import { commoditiesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { formatScalar } from '@/lib/strings';
import { Duration, renderConstantSpeed } from '@/lib/time';

type StorageInfo = {
    rate: StorageSize;
    capacity: StorageSize;
    timeToFill: Duration;
};

const DEFS: DefinitionListItem<StorageInfo>[] = [
    {
        title: 'Change rate',
        description: 'How fast inventory is accumulated',
        render: ({ rate }) => {
            return (
                <Text color="dim">
                    <Text color={rate.mass > 0 ? 'error' : 'default'}>
                        {renderConstantSpeed(rate.mass, Inventory.STANDARD_TIME_DELTA, { unit: 't' })}
                    </Text>{' '}
                    /{' '}
                    <Text color={rate.volume > 0 ? 'error' : 'default'}>
                        {renderConstantSpeed(rate.volume, Inventory.STANDARD_TIME_DELTA, { unit: 'm³' })}
                    </Text>
                </Text>
            );
        },
    },
    {
        title: 'Capacity',
        description: 'How much inventory the factory can store',
        render: ({ capacity }) => (
            <Text>
                {formatScalar(capacity.mass, { unit: 't', digits: 0 })} /{' '}
                {formatScalar(capacity.volume, { unit: 'm³', digits: 0 })}
            </Text>
        ),
    },
    {
        title: 'Overflows In',
        description: 'How fast the inventory will be filled, stopping the factory production',
        render: ({ timeToFill }) => Duration.toString(timeToFill),
    },
];

export const StorageTotals: Component<{ totals: Inventory; capacity: StorageSize }> = (props) => {
    const commodities = useAsset(commoditiesAsset);

    const value = createMemo((): StorageInfo => {
        const commoditiesData = commodities() ?? {};
        const rate = Inventory.measure(Inventory.from(props.totals), commoditiesData);
        const massFilledIn = props.capacity.mass / rate.mass;
        const volumeFilledIn = props.capacity.volume / rate.volume;

        const timeToFill = Math.min(
            massFilledIn > 0 ? massFilledIn : Infinity,
            volumeFilledIn > 0 ? volumeFilledIn : Infinity,
        );

        return {
            rate,
            capacity: props.capacity,
            timeToFill: Duration.mul(Inventory.STANDARD_TIME_DELTA, timeToFill),
        };
    });

    return <DefinitionList items={DEFS} value={value()} />;
};
